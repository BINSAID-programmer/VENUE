import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Loader2,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  MessageSquare,
  SlidersHorizontal,
  TrendingUp,
  Target,
  BarChart2,
  Eye,
} from 'lucide-react';
import {
  Course,
  StudentProfile,
  AcademicMaterialRecord,
  AIMaterialReference,
  AIAssessmentQuestion,
  AIAssessmentQuestionAttempt,
  AIAssessmentQuestionType,
  AIPracticeSessionData,
  AILearningSession,
  AILearningDifficulty,
} from '../types';
import { aiTutorFoundationService } from '../services/aiTutorFoundationService';
import { aiTutorMaterialContextService } from '../services/aiTutorMaterialContextService';
import { MathRenderer } from './MathRenderer';
import { AIChartViewer } from './AIChartViewer';
import {
  SafeRenderErrorBoundary,
  filterValidCitations,
  recoverStructuredTextIfRawJson,
  sanitizeDiagramSvg,
} from '../utils/aiResponseRenderPipeline';

interface AIPracticeModeWorkspaceProps {
  profile?: StudentProfile;
  courses: Course[];
  selectedCourseContext: string;
  onSelectCourseContext: (courseCode: string) => void;
  languagePreference: string;
  initialTopic?: string;
  initialDifficulty?: AILearningDifficulty;
  onOpenMaterialSource?: (material: AcademicMaterialRecord, pageNumber?: number) => void;
  onAskTutorInChat?: (prompt: string, courseCode?: string) => void;
  onLaunchStudyModeForTopic?: (courseCode: string, topic: string) => void;
}

const SESSION_LENGTH_OPTIONS = [5, 10, 15, 20];

const PRACTICE_DIFFICULTY_OPTIONS: {
  value: AILearningDifficulty;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    value: 'adaptive',
    label: 'Adaptive',
    badge: 'Recommended',
    description: 'Adjusts gradually based on your accuracy, speed, and hint usage',
  },
  {
    value: 'foundational',
    label: 'Beginner',
    badge: 'Foundational',
    description: 'Core definitions, basic concepts, and single-step formulas',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    badge: 'Standard',
    description: 'University tutorial-level application & multi-step calculations',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    badge: 'Exam-Level',
    description: 'Rigorous derivations, proofs, and multi-concept synthesis',
  },
];

const PRACTICE_QUESTION_TYPE_OPTIONS: {
  value: AIAssessmentQuestionType;
  label: string;
  description: string;
}[] = [
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    description: '4 distinct options (A, B, C, D) with immediate evaluation',
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    description: 'Evaluates conceptual meaning and key mathematical phrasings',
  },
  {
    value: 'numerical',
    label: 'Numerical',
    description: 'Supports equivalent fractions, decimals, and rounded values',
  },
  {
    value: 'mixed',
    label: 'Mixed',
    description: 'Rotates across Multiple Choice, Numerical, and Short Answer',
  },
];

const PRACTICE_LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto (Match Input / Course)' },
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
  { value: 'French', label: 'Français' },
  { value: 'Arabic', label: 'العربية' },
];

export const AIPracticeModeWorkspace: React.FC<AIPracticeModeWorkspaceProps> = ({
  profile,
  courses,
  selectedCourseContext,
  onSelectCourseContext,
  languagePreference,
  initialTopic,
  initialDifficulty,
  onOpenMaterialSource,
  onAskTutorInChat,
  onLaunchStudyModeForTopic,
}) => {
  // 1. Setup State
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(() => {
    if (selectedCourseContext && selectedCourseContext !== 'All Courses') {
      return selectedCourseContext;
    }
    return courses[0]?.code || 'All Courses';
  });
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || '');
  const [customTopicInput, setCustomTopicInput] = useState<string>(initialTopic || '');
  const [difficultyMode, setDifficultyMode] = useState<AILearningDifficulty>(
    initialDifficulty || 'adaptive'
  );
  const [questionType, setQuestionType] = useState<AIAssessmentQuestionType>('multiple_choice');
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(10);
  const [practiceLanguage, setPracticeLanguage] = useState<string>(languagePreference || 'auto');
  const [useCourseMaterials, setUseCourseMaterials] = useState<boolean>(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
      setCustomTopicInput(initialTopic);
      setViewStage('setup');
    }
    if (initialDifficulty) {
      setDifficultyMode(initialDifficulty);
    }
  }, [initialTopic, initialDifficulty]);

  // Authorized Course Materials & Saved Practice Sessions
  const [courseMaterials, setCourseMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [savedPracticeSessions, setSavedPracticeSessions] = useState<AILearningSession[]>([]);

  // Active Practice Session State (Section 11)
  const [activeSession, setActiveSession] = useState<AIPracticeSessionData | null>(null);
  const [viewStage, setViewStage] = useState<'setup' | 'practicing' | 'summary'>('setup');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [adaptationNotice, setAdaptationNotice] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Per-Question Interaction State
  const [draftAnswer, setDraftAnswer] = useState<string>('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);

  // Follow-up Explanation Depth & Visual Request State (Sections 9 & 16)
  const [followupLoadingAction, setFollowupLoadingAction] = useState<string | null>(null);
  const [followupPanels, setFollowupPanels] = useState<
    Array<{
      id: string;
      title: string;
      explanationMarkdown: string;
      structuredSolution?: {
        given?: string;
        formula?: string;
        substitution?: string;
        calculation?: string;
        answer?: string;
      };
      diagramSvg?: string;
      chartData?: any;
    }>
  >([]);
  const [customVisualOrFollowupInput, setCustomVisualOrFollowupInput] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSubmissionRef = useRef<number>(0);

  // Sync course context when in setup screen
  useEffect(() => {
    if (
      selectedCourseContext &&
      selectedCourseContext !== 'All Courses' &&
      selectedCourseContext !== selectedCourseCode &&
      viewStage === 'setup'
    ) {
      setSelectedCourseCode(selectedCourseContext);
    }
  }, [selectedCourseContext, viewStage]);

  // Sync language when in setup screen
  useEffect(() => {
    if (languagePreference && viewStage === 'setup') {
      setPracticeLanguage(languagePreference);
    }
  }, [languagePreference, viewStage]);

  // Load authorized materials for the selected course
  useEffect(() => {
    let cancelled = false;
    setIsLoadingMaterials(true);
    aiTutorMaterialContextService
      .fetchAuthorizedMaterials(profile, courses, selectedCourseCode)
      .then((list) => {
        if (!cancelled) {
          setCourseMaterials(list);
          setIsLoadingMaterials(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourseMaterials([]);
          setIsLoadingMaterials(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, courses, selectedCourseCode]);

  // Load recent saved Practice sessions
  useEffect(() => {
    aiTutorFoundationService
      .listLearningSessions(profile?.uid, 'PRACTICE')
      .then((sessions) => {
        setSavedPracticeSessions(sessions.slice(0, 6));
      })
      .catch(() => {});
  }, [profile?.uid, viewStage]);

  const activeCourseObj = useMemo(
    () => courses.find((c) => c.code === selectedCourseCode),
    [courses, selectedCourseCode]
  );

  // Suggested topics derived from authorized materials + course metadata
  const suggestedTopics = useMemo(() => {
    const topicsSet = new Set<string>();

    for (const mat of courseMaterials) {
      if (mat.title && mat.title.trim().length > 2) {
        topicsSet.add(mat.title.trim());
      }
    }

    if (activeCourseObj) {
      const codeUpper = activeCourseObj.code.toUpperCase();
      if (codeUpper.startsWith('ST')) {
        topicsSet.add('Basic Probability & Counting Principles');
        topicsSet.add('Conditional Probability & Bayes Theorem');
        topicsSet.add('Random Variables & Probability Distributions');
        topicsSet.add('Expectation, Variance & Sampling Distributions');
      } else if (codeUpper.startsWith('MT')) {
        topicsSet.add('Limits, Continuity & Differentiation');
        topicsSet.add('Integration Techniques & Definite Integrals');
        topicsSet.add('Matrices, Determinants & Linear Systems');
        topicsSet.add('Differential Equations & Power Series');
      } else if (codeUpper.startsWith('CS') || codeUpper.startsWith('IS')) {
        topicsSet.add('Data Structures & Algorithmic Complexity');
        topicsSet.add('Relational Database Design & SQL Queries');
        topicsSet.add('Operating Systems & Concurrency Control');
      } else if (activeCourseObj.title) {
        topicsSet.add(`Core Principles of ${activeCourseObj.title}`);
        topicsSet.add(`Quantitative Problem Solving in ${activeCourseObj.code}`);
      }
    } else {
      topicsSet.add('Conditional Probability & Independence');
      topicsSet.add('Calculus: Derivatives & Integrals');
      topicsSet.add('Linear Algebra & Matrix Operations');
    }

    return Array.from(topicsSet).slice(0, 8);
  }, [courseMaterials, activeCourseObj]);

  const effectiveTopic = useMemo(() => {
    if (customTopicInput.trim()) return customTopicInput.trim();
    if (selectedTopic.trim()) return selectedTopic.trim();
    if (useCourseMaterials && selectedMaterialId) {
      const mat = courseMaterials.find((m) => m.id === selectedMaterialId);
      if (mat) return mat.title;
    }
    if (activeCourseObj) return `${activeCourseObj.code}: ${activeCourseObj.title}`;
    return '';
  }, [
    customTopicInput,
    selectedTopic,
    useCourseMaterials,
    selectedMaterialId,
    courseMaterials,
    activeCourseObj,
  ]);

  // Fetch a single adaptive practice question from /api/tutor/practice
  const fetchNextPracticeQuestion = async (
    sessionState: AIPracticeSessionData,
    overrideSignals?: {
      reinforceSameConcept?: boolean;
      lastConcept?: string;
      lastWasCorrect?: boolean;
      customPromptNote?: string;
    }
  ) => {
    if (isLoadingQuestion) return;
    setErrorBanner(null);
    setIsLoadingQuestion(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Retrieve relevant authorized course material excerpts ONLY when useCourseMaterials is enabled
      let groundingPayload: any[] = [];
      if (sessionState.useCourseMaterials && courseMaterials.length > 0) {
        const targetMaterials = sessionState.selectedMaterialId
          ? courseMaterials.filter((m) => m.id === sessionState.selectedMaterialId)
          : courseMaterials;

        groundingPayload = aiTutorMaterialContextService.selectRelevantMaterials(
          `${sessionState.topic} ${overrideSignals?.lastConcept || ''}`.trim(),
          targetMaterials,
          sessionState.courseCode,
          4
        );
      }

      const excludeList = sessionState.history
        .map((h) => h.question.questionText)
        .filter(Boolean)
        .slice(-12);
      if (sessionState.currentQuestion?.questionText) {
        excludeList.push(sessionState.currentQuestion.questionText);
      }

      const personalizedMemoryContext = await aiTutorFoundationService.getRelevantPersonalizedMemoryContext({
        userId: profile?.uid,
        courseCode: sessionState.courseCode,
        courseId: sessionState.courseId,
        topic: sessionState.topic,
        userMessage: overrideSignals?.customPromptNote || '',
        mode: 'PRACTICE',
        authorizedCourseCodes: courses.map((c) => c.code),
      });

      const response = await fetch('/api/tutor/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          action: 'generate_question',
          courseCode: sessionState.courseCode,
          courseContext: sessionState.courseCode,
          courseTitle: sessionState.courseTitle || '',
          topic: overrideSignals?.customPromptNote
            ? `${sessionState.topic} (${overrideSignals.customPromptNote})`
            : sessionState.topic,
          difficultyMode: sessionState.difficultyMode,
          currentDifficulty: sessionState.currentDifficulty,
          questionType: sessionState.questionType,
          languagePreference: sessionState.language,
          useCourseMaterials: sessionState.useCourseMaterials,
          selectedMaterialId: sessionState.selectedMaterialId || '',
          personalizedMemoryContext,
          studentContext: profile
            ? {
                programme: profile.programmeName || profile.programmeId,
                yearOfStudy: profile.yearOfStudy,
                semester: profile.semester,
                department: profile.departmentName,
              }
            : null,
          availableCourseMaterials: groundingPayload,
          sessionSignals: {
            questionsAttempted: sessionState.questionsAttempted,
            correctCount: sessionState.correctCount,
            incorrectCount: sessionState.incorrectCount,
            conceptsPracticed: sessionState.conceptsPracticed,
            conceptsNeedingReview: sessionState.conceptsNeedingReview,
            reinforceSameConcept: Boolean(overrideSignals?.reinforceSameConcept),
            lastConcept: overrideSignals?.lastConcept || '',
            lastWasCorrect: overrideSignals?.lastWasCorrect,
          },
          excludeQuestions: excludeList,
          callerUid: profile?.uid || 'student_user',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.data?.question) {
        throw new Error(result.error || 'Could not generate practice question.');
      }

      const qCheck = aiTutorFoundationService.validateAssessmentQuestion({
        ...result.data.question,
        courseId: sessionState.courseId,
        courseCode: sessionState.courseCode,
      });

      const nextQ: AIAssessmentQuestion = qCheck.normalized || {
        ...result.data.question,
        questionId: `prac_q_${Date.now()}`,
        courseId: sessionState.courseId,
        courseCode: sessionState.courseCode,
      };

      const updatedSession: AIPracticeSessionData = {
        ...sessionState,
        currentQuestion: nextQ,
        currentAttempt: null,
        updatedAt: new Date().toISOString(),
        groundedInMaterials:
          sessionState.groundedInMaterials || Boolean(result.data.groundedInMaterials),
        referencedMaterials:
          Array.isArray(result.data.referencedMaterials) &&
          result.data.referencedMaterials.length > 0
            ? result.data.referencedMaterials
            : sessionState.referencedMaterials,
      };

      setActiveSession(updatedSession);
      setDraftAnswer('');
      setRevealedHintsCount(0);
      setFollowupPanels([]);
      setCustomVisualOrFollowupInput('');
      setQuestionStartTime(Date.now());
      setViewStage('practicing');

      aiTutorFoundationService
        .savePracticeSessionRecord(updatedSession, profile?.uid)
        .catch(() => {});
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      const normalized = aiTutorFoundationService.normalizeError(err, 'PRACTICE');
      setErrorBanner(normalized.userMessage);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsLoadingQuestion(false);
    }
  };

  // Start a fresh Practice Session
  const handleStartPracticeSession = async () => {
    const topicToUse = effectiveTopic.trim();
    if (!topicToUse || isLoadingQuestion) return;

    if (selectedCourseCode && selectedCourseCode !== selectedCourseContext) {
      onSelectCourseContext(selectedCourseCode);
    }

    const initialDifficulty: 'foundational' | 'intermediate' | 'advanced' =
      difficultyMode === 'foundational' ||
      difficultyMode === 'intermediate' ||
      difficultyMode === 'advanced'
        ? difficultyMode
        : 'intermediate';

    const now = new Date().toISOString();
    const newSession: AIPracticeSessionData = {
      practiceSessionId: `prac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: profile?.uid || 'guest',
      courseId: activeCourseObj?.id || selectedCourseCode || 'general',
      courseCode: selectedCourseCode || 'All Courses',
      courseTitle: activeCourseObj?.title,
      topic: topicToUse,
      difficultyMode,
      currentDifficulty: initialDifficulty,
      questionType,
      targetQuestionCount,
      language: practiceLanguage,
      useCourseMaterials: Boolean(useCourseMaterials && courseMaterials.length > 0),
      selectedMaterialId: useCourseMaterials ? selectedMaterialId : undefined,
      questionsAttempted: 0,
      correctCount: 0,
      incorrectCount: 0,
      recentPerformance: [],
      conceptsPracticed: [],
      conceptsNeedingReview: [],
      conceptsAnsweredCorrectly: [],
      hintsUsed: 0,
      currentQuestion: null,
      currentAttempt: null,
      history: [],
      sessionStatus: 'active',
      startedAt: now,
      updatedAt: now,
      groundedInMaterials: false,
      referencedMaterials: [],
    };

    setAdaptationNotice(null);
    setActiveSession(newSession);
    await fetchNextPracticeQuestion(newSession);
  };

  // Request a progressive hint without revealing the final answer (Section 8)
  const handleRequestHint = () => {
    if (!activeSession || !activeSession.currentQuestion || activeSession.currentAttempt) return;
    const hints = activeSession.currentQuestion.hints || [];
    const maxHints = Math.max(1, hints.length);
    if (revealedHintsCount >= maxHints) return;

    const nextHintCount = revealedHintsCount + 1;
    setRevealedHintsCount(nextHintCount);

    const updatedSession: AIPracticeSessionData = {
      ...activeSession,
      hintsUsed: activeSession.hintsUsed + 1,
      updatedAt: new Date().toISOString(),
    };
    setActiveSession(updatedSession);
  };

  // Submit Answer for Evaluation (Sections 5, 6, 7 & 17 Debounce/Cost Control)
  const handleSubmitAnswer = async () => {
    if (!activeSession || !activeSession.currentQuestion || activeSession.currentAttempt) return;
    const cleanAns = draftAnswer.trim();
    if (!cleanAns || isEvaluating) return;

    // Prevent rapid double-click duplicate submissions (Section 17)
    const nowMs = Date.now();
    if (nowMs - lastSubmissionRef.current < 600) return;
    lastSubmissionRef.current = nowMs;

    setIsEvaluating(true);
    setErrorBanner(null);

    const currentQ = activeSession.currentQuestion;
    const elapsedSec = Math.max(1, Math.round((nowMs - questionStartTime) / 1000));

    try {
      // Fast deterministic evaluation first (handles MCQ and standard numeric/fraction/short-answer matches)
      const localEval = aiTutorFoundationService.evaluateQuestionAttempt(
        currentQ,
        cleanAns,
        elapsedSec
      );

      let isCorrect = localEval.isCorrect;
      let feedbackTitle = isCorrect ? 'Correct ✓' : 'Not quite.';
      let feedbackExplanation = currentQ.explanation;
      let whatWentWrong: string | undefined;
      let correctApproach: string | undefined;

      // If short_answer or symbolic math wasn't matched deterministically, or if MCQ/Numerical was wrong and needs tailored diagnostic feedback:
      // For non-MCQ questions where localEval is false, or when we want rich diagnostic feedback for an incorrect answer:
      if (!isCorrect && currentQ.questionType !== 'multiple_choice') {
        try {
          const resp = await fetch('/api/tutor/practice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'evaluate_answer',
              courseCode: activeSession.courseCode,
              topic: activeSession.topic,
              languagePreference: activeSession.language,
              currentQuestion: currentQ,
              userAnswer: cleanAns,
              callerUid: profile?.uid || 'student_user',
            }),
          });
          const evalJson = await resp.json();
          if (resp.ok && evalJson.success && evalJson.data) {
            isCorrect = Boolean(evalJson.data.isCorrect);
            feedbackTitle =
              evalJson.data.feedbackTitle || (isCorrect ? 'Correct ✓' : 'Not quite.');
            feedbackExplanation =
              evalJson.data.feedbackExplanation || currentQ.explanation;
            whatWentWrong = evalJson.data.whatWentWrong;
            correctApproach = evalJson.data.correctApproach;
          }
        } catch {
          // Graceful fallback to local evaluation + question explanation
        }
      } else if (!isCorrect && currentQ.questionType === 'multiple_choice') {
        whatWentWrong = `You selected "${cleanAns}", which does not satisfy the condition for ${
          currentQ.topic || activeSession.topic
        }.`;
        correctApproach =
          currentQ.structuredSolution?.formula ||
          currentQ.learningObjective ||
          'Review the step-by-step explanation below to see how the correct option is derived.';
      }

      const attemptRecord: AIAssessmentQuestionAttempt = {
        questionId: currentQ.questionId,
        userAnswer: cleanAns,
        isCorrect,
        hintsUsedCount: revealedHintsCount,
        timeSpentSeconds: elapsedSec,
        attemptedAt: new Date().toISOString(),
        feedbackTitle,
        feedbackExplanation,
        whatWentWrong,
        correctApproach,
      };

      const conceptTag = (currentQ.topic || activeSession.topic).trim();
      const updatedRecent = [
        ...activeSession.recentPerformance,
        {
          questionId: currentQ.questionId,
          topic: conceptTag,
          difficulty: currentQ.difficulty as 'foundational' | 'intermediate' | 'advanced',
          isCorrect,
          hintsUsed: revealedHintsCount,
          timeSpentSeconds: elapsedSec,
        },
      ].slice(-15);

      const adaptiveResult = aiTutorFoundationService.computeNextAdaptiveDifficulty({
        difficultyMode: activeSession.difficultyMode,
        currentDifficulty: activeSession.currentDifficulty,
        recentPerformance: updatedRecent,
      });

      setAdaptationNotice(adaptiveResult.adaptationReason || null);

      const practicedSet = new Set([...activeSession.conceptsPracticed, conceptTag]);
      const reviewSet = new Set(activeSession.conceptsNeedingReview);
      const correctSet = new Set(activeSession.conceptsAnsweredCorrectly);

      if (isCorrect && revealedHintsCount <= 1) {
        correctSet.add(conceptTag);
        // If they previously struggled on this concept and just got it right cleanly, keep it in practiced
      } else if (!isCorrect) {
        reviewSet.add(conceptTag);
      }

      const updatedSession: AIPracticeSessionData = {
        ...activeSession,
        questionsAttempted: activeSession.questionsAttempted + 1,
        correctCount: activeSession.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: activeSession.incorrectCount + (isCorrect ? 0 : 1),
        currentDifficulty: adaptiveResult.nextDifficulty,
        recentPerformance: updatedRecent,
        conceptsPracticed: Array.from(practicedSet),
        conceptsNeedingReview: Array.from(reviewSet),
        conceptsAnsweredCorrectly: Array.from(correctSet),
        currentAttempt: attemptRecord,
        history: [
          ...activeSession.history,
          {
            question: currentQ,
            attempt: attemptRecord,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      setActiveSession(updatedSession);
      aiTutorFoundationService
        .savePracticeSessionRecord(updatedSession, profile?.uid)
        .catch(() => {});
    } finally {
      setIsEvaluating(false);
    }
  };

  // Proceed to the Next Question or Complete Target Session
  const handleNextQuestion = async (similarQuestionOnly = false) => {
    if (!activeSession || isLoadingQuestion) return;

    const lastQ = activeSession.currentQuestion;
    const lastAtt = activeSession.currentAttempt;

    // If user reached targetQuestionCount and didn't explicitly ask for a similar question, show Session Summary
    if (
      !similarQuestionOnly &&
      activeSession.questionsAttempted >= activeSession.targetQuestionCount &&
      activeSession.sessionStatus === 'active'
    ) {
      await handleEndSession();
      return;
    }

    await fetchNextPracticeQuestion(activeSession, {
      reinforceSameConcept: similarQuestionOnly || Boolean(lastAtt && !lastAtt.isCorrect),
      lastConcept: lastQ?.topic || activeSession.topic,
      lastWasCorrect: Boolean(lastAtt?.isCorrect),
      customPromptNote: similarQuestionOnly
        ? `Generate a similar question on "${lastQ?.topic || activeSession.topic}" with different numbers`
        : undefined,
    });
  };

  // End Practice Session & Show Summary (Sections 12 & 13)
  const handleEndSession = async () => {
    if (!activeSession) return;
    const now = new Date().toISOString();
    const completedSession: AIPracticeSessionData = {
      ...activeSession,
      sessionStatus: 'completed',
      updatedAt: now,
      completedAt: now,
    };
    setActiveSession(completedSession);
    setViewStage('summary');
    await aiTutorFoundationService.savePracticeSessionRecord(completedSession, profile?.uid);
  };

  // Continue Practicing from Session Summary (Section 13)
  const handleContinuePractice = async () => {
    if (!activeSession) return;
    const extendedSession: AIPracticeSessionData = {
      ...activeSession,
      targetQuestionCount: activeSession.questionsAttempted + 5,
      sessionStatus: 'active',
      updatedAt: new Date().toISOString(),
    };
    setActiveSession(extendedSession);
    setViewStage('practicing');

    const lastEntry = extendedSession.history[extendedSession.history.length - 1];
    await fetchNextPracticeQuestion(extendedSession, {
      reinforceSameConcept: Boolean(lastEntry && !lastEntry.attempt.isCorrect),
      lastConcept: lastEntry?.question.topic || extendedSession.topic,
      lastWasCorrect: Boolean(lastEntry?.attempt.isCorrect),
    });
  };

  // Follow-up Explanation Depth & Visual Requests (Sections 9 & 16)
  const handleRequestFollowup = async (
    actionKey: 'explain' | 'simpler' | 'steps' | 'another_method' | 'diagram' | 'graph' | 'custom',
    customText?: string
  ) => {
    if (!activeSession?.currentQuestion || followupLoadingAction) return;

    const textToUse = (customText ?? customVisualOrFollowupInput).trim();
    let effectiveAction = actionKey;
    if (actionKey === 'custom' && textToUse) {
      const lower = textToUse.toLowerCase();
      if (/\b(graph|plot|curve|distribution)\b/.test(lower)) {
        effectiveAction = 'graph';
      } else if (/\b(diagram|tree|venn|sketch|visual|draw)\b/.test(lower)) {
        effectiveAction = 'diagram';
      }
    }

    setFollowupLoadingAction(actionKey);
    try {
      const res = await fetch('/api/tutor/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_followup',
          courseCode: activeSession.courseCode,
          topic: activeSession.topic,
          languagePreference: activeSession.language,
          currentQuestion: activeSession.currentQuestion,
          userAnswer: activeSession.currentAttempt?.userAnswer || draftAnswer,
          followupAction: effectiveAction,
          customFollowupPrompt: textToUse || undefined,
          callerUid: profile?.uid || 'student_user',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Could not load follow-up explanation.');
      }

      setFollowupPanels((prev) => [
        ...prev,
        {
          id: `fup_${Date.now()}`,
          title: data.data.title || 'Detailed Explanation',
          explanationMarkdown: data.data.explanationMarkdown || '',
          structuredSolution: data.data.structuredSolution,
          diagramSvg: data.data.diagramSvg,
          chartData: data.data.chartData,
        },
      ]);
      if (actionKey === 'custom') {
        setCustomVisualOrFollowupInput('');
      }
    } catch (err: any) {
      const normalized = aiTutorFoundationService.normalizeError(err, 'PRACTICE');
      setErrorBanner(normalized.userMessage);
    } finally {
      setFollowupLoadingAction(null);
    }
  };

  // Resume or review a saved practice session
  const handleOpenSavedPractice = (session: AILearningSession) => {
    const detail = aiTutorFoundationService.getSavedPracticeDetail(session.sessionId);
    if (detail) {
      setActiveSession(detail);
      setViewStage(detail.sessionStatus === 'completed' ? 'summary' : 'practicing');
      setErrorBanner(null);
    } else {
      if (session.courseCode) setSelectedCourseCode(session.courseCode);
      setCustomTopicInput(session.topic || '');
      if (session.difficulty) setDifficultyMode(session.difficulty);
    }
  };

  // Resolve and open a referenced VENUE material source
  const handleClickSource = (ref: AIMaterialReference) => {
    if (!onOpenMaterialSource) return;
    const found = courseMaterials.find(
      (m) =>
        m.id === ref.materialId ||
        m.title.toLowerCase() === ref.title.toLowerCase()
    );
    if (found) {
      onOpenMaterialSource(found, ref.pageReferences?.[0]);
    }
  };

  const formatDifficultyBadge = (diff: string) => {
    if (diff === 'foundational') return 'Beginner';
    if (diff === 'advanced') return 'Advanced';
    if (diff === 'adaptive') return 'Adaptive';
    return 'Intermediate';
  };

  // ============================================================================
  // VIEW 1: PRACTICE MODE SETUP SCREEN (Section 1)
  // ============================================================================
  if (viewStage === 'setup' || !activeSession) {
    return (
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Practice Mode
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Adaptive One-at-a-Time
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Practice one question at a time and improve as you go.
                </p>
              </div>
            </div>
          </div>

          {errorBanner && (
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Practice Session Issue</p>
                  <p className="text-red-700 mt-0.5">{errorBanner}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartPracticeSession}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Setup Form */}
          <div className="space-y-5">
            {/* Step 1: Course & Optional Course Material Grounding Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="practice-course-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  1. Authorized Course
                </label>
                <select
                  id="practice-course-select"
                  value={selectedCourseCode}
                  onChange={(e) => {
                    setSelectedCourseCode(e.target.value);
                    setSelectedMaterialId('');
                    setSelectedTopic('');
                  }}
                  disabled={isLoadingQuestion}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="All Courses">All Authorized Courses / General</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Course Material Grounding (Optional)
                </span>
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={useCourseMaterials}
                    disabled={isLoadingQuestion || courseMaterials.length === 0}
                    onChange={(e) => setUseCourseMaterials(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-800 block">
                      Practice from my course materials
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {isLoadingMaterials
                        ? 'Checking authorized materials...'
                        : courseMaterials.length > 0
                        ? `${courseMaterials.length} authorized material(s) available`
                        : 'No uploaded materials for this course'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {useCourseMaterials && courseMaterials.length > 0 && (
              <div>
                <label
                  htmlFor="practice-material-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Select Specific Course Material (Optional)
                </label>
                <select
                  id="practice-material-select"
                  value={selectedMaterialId}
                  onChange={(e) => {
                    const matId = e.target.value;
                    setSelectedMaterialId(matId);
                    const found = courseMaterials.find((m) => m.id === matId);
                    if (found && !customTopicInput.trim()) {
                      setSelectedTopic(found.title);
                    }
                  }}
                  disabled={isLoadingQuestion}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="">
                    All relevant course materials ({courseMaterials.length})
                  </option>
                  {courseMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.materialType.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 2: Topic Selection */}
            <div>
              <label
                htmlFor="practice-topic-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                2. Topic to Practice
              </label>
              <input
                id="practice-topic-input"
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                disabled={isLoadingQuestion}
                placeholder={
                  selectedTopic
                    ? `Selected: ${selectedTopic} (or type a custom topic...)`
                    : 'e.g., Conditional Probability, Integration by Parts, Matrix Inversion...'
                }
                className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 bg-white! text-slate-900! border border-slate-200 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
              />

              {suggestedTopics.length > 0 && (
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                    Suggested topics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTopics.map((topic) => {
                      const isActive =
                        (!customTopicInput.trim() && selectedTopic === topic) ||
                        customTopicInput.trim() === topic;
                      return (
                        <button
                          key={topic}
                          type="button"
                          disabled={isLoadingQuestion}
                          onClick={() => {
                            setSelectedTopic(topic);
                            setCustomTopicInput(topic);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Difficulty Selection */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                3. Difficulty Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {PRACTICE_DIFFICULTY_OPTIONS.map((opt) => {
                  const isSelected = difficultyMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isLoadingQuestion}
                      onClick={() => setDifficultyMode(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Question Type Selection */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                4. Question Type
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {PRACTICE_QUESTION_TYPE_OPTIONS.map((opt) => {
                  const isSelected = questionType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isLoadingQuestion}
                      onClick={() => setQuestionType(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Session Length & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  5. Questions per Session (You can stop or continue anytime)
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {SESSION_LENGTH_OPTIONS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      disabled={isLoadingQuestion}
                      onClick={() => setTargetQuestionCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetQuestionCount === cnt
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="practice-language-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Language
                </label>
                <select
                  id="practice-language-select"
                  value={practiceLanguage}
                  onChange={(e) => setPracticeLanguage(e.target.value)}
                  disabled={isLoadingQuestion}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {PRACTICE_LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Adapts gradually after each question with progressive hints & step-by-step solutions
                </span>
              </div>

              {isLoadingQuestion ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Preparing Question 1...</span>
                  </div>
                </div>
              ) : (
                <button
                  id="btn-start-practice-session"
                  type="button"
                  disabled={!effectiveTopic.trim()}
                  onClick={handleStartPracticeSession}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Practice Session</span>
                </button>
              )}
            </div>
          </div>

          {/* Recent Practice Sessions */}
          {savedPracticeSessions.length > 0 && (
            <div className="pt-5 border-t border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Recent Practice Sessions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedPracticeSessions.map((sess) => {
                  const acc =
                    typeof sess.metadata?.accuracyPercent === 'number'
                      ? sess.metadata.accuracyPercent
                      : 0;
                  const attempted =
                    typeof sess.metadata?.questionsAttempted === 'number'
                      ? sess.metadata.questionsAttempted
                      : sess.progress?.completedItems || 0;
                  return (
                    <button
                      key={sess.sessionId}
                      type="button"
                      onClick={() => handleOpenSavedPractice(sess)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-slate-50/70 text-left transition-all cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {sess.courseCode || 'General'}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {sess.topic}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {attempted} practiced · Accuracy: {acc}% ·{' '}
                          {sess.status === 'completed' ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: ONE-QUESTION-AT-A-TIME PRACTICE WORKSPACE (Sections 2–10)
  // ============================================================================
  if (viewStage === 'practicing' && activeSession) {
    const currentQ = activeSession.currentQuestion;
    const currentAtt = activeSession.currentAttempt;
    const isAnswered = Boolean(currentAtt);
    const isCorrect = Boolean(currentAtt?.isCorrect);
    const questionNumber =
      activeSession.questionsAttempted + (isAnswered ? 0 : 1);
    const accuracySoFar =
      activeSession.questionsAttempted > 0
        ? Math.round((activeSession.correctCount / activeSession.questionsAttempted) * 100)
        : null;

    const availableHints = currentQ?.hints || [];
    const visibleHints = availableHints.slice(0, revealedHintsCount);

    // Honest Source Display Rule (Section 14)
    const questionSources = currentQ?.groundedInMaterials
      ? filterValidCitations(currentQ.referencedMaterials)
      : [];

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Session Progress Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {activeSession.courseCode}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {activeSession.topic}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700">
                Level: {formatDifficultyBadge(activeSession.currentDifficulty)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
              <span>
                Question <strong className="text-slate-800">{questionNumber}</strong> of{' '}
                <strong className="text-slate-800">{activeSession.targetQuestionCount}</strong>
              </span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold">
                ✓ {activeSession.correctCount} Correct
              </span>
              <span className="text-red-600 font-semibold">
                ✗ {activeSession.incorrectCount} Incorrect
              </span>
              {accuracySoFar !== null && (
                <>
                  <span>·</span>
                  <span>
                    Accuracy: <strong className="text-slate-800">{accuracySoFar}%</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-end-practice-session"
              type="button"
              onClick={handleEndSession}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Adaptive Difficulty Banner when difficulty stepped up or down */}
        {adaptationNotice && (
          <div className="px-4 sm:px-6 py-2 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between gap-2 text-xs text-blue-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{adaptationNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAdaptationNotice(null)}
              className="text-blue-600 hover:text-blue-800 p-0.5 cursor-pointer"
              aria-label="Dismiss adaptation notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Question Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="max-w-3xl mx-auto space-y-5">
            {errorBanner && (
              <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchNextPracticeQuestion(activeSession)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {isLoadingQuestion || !currentQ ? (
              <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Generating Question {questionNumber}...
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tailoring difficulty ({formatDifficultyBadge(activeSession.currentDifficulty)}) to your current session progress
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Question Header Badges & Hint Trigger */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                      Question {questionNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {currentQ.questionType === 'multiple_choice'
                        ? 'Multiple Choice'
                        : currentQ.questionType === 'numerical'
                        ? 'Numerical'
                        : 'Short Answer'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                      {currentQ.topic || activeSession.topic}
                    </span>
                  </div>

                  {/* Hint Button (Section 8) */}
                  {!isAnswered && availableHints.length > 0 && (
                    <button
                      id="btn-practice-hint"
                      type="button"
                      disabled={revealedHintsCount >= availableHints.length}
                      onClick={handleRequestHint}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {revealedHintsCount === 0
                          ? 'Hint'
                          : revealedHintsCount < availableHints.length
                          ? `Another Hint (${revealedHintsCount}/${availableHints.length})`
                          : 'All Hints Shown'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Question Prompt Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 text-slate-900 text-sm sm:text-base leading-relaxed">
                  <SafeRenderErrorBoundary
                    mode="PRACTICE"
                    messageId={currentQ.questionId}
                    rawText={currentQ.questionText}
                  >
                    <MathRenderer content={currentQ.questionText} />
                  </SafeRenderErrorBoundary>
                </div>

                {/* Progressive Hints Display (Section 8) */}
                {visibleHints.length > 0 && (
                  <div className="space-y-2">
                    {visibleHints.map((hintText, hIdx) => (
                      <div
                        key={hIdx}
                        className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-amber-900 block mb-0.5">
                            Hint {hIdx + 1}:
                          </span>
                          <MathRenderer content={hintText} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Controls: Multiple Choice vs Numerical / Short Answer */}
                {currentQ.questionType === 'multiple_choice' &&
                Array.isArray(currentQ.options) ? (
                  <div className="space-y-2.5" role="radiogroup" aria-label="Answer Options">
                    {currentQ.options.map((opt, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      const isSelected =
                        (isAnswered ? currentAtt?.userAnswer : draftAnswer) === opt;
                      const isCorrectOption = opt === currentQ.correctAnswer;

                      let cardClasses =
                        'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
                      let badgeClasses = 'bg-slate-100 text-slate-700 border-slate-200';

                      if (!isAnswered && isSelected) {
                        cardClasses =
                          'bg-blue-50/70 border-blue-600 text-slate-900 ring-1 ring-blue-600/20';
                        badgeClasses = 'bg-blue-600 text-white border-blue-600';
                      } else if (isAnswered) {
                        if (isCorrectOption) {
                          cardClasses =
                            'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/20';
                          badgeClasses = 'bg-emerald-600 text-white border-emerald-600';
                        } else if (isSelected && !isCorrectOption) {
                          cardClasses =
                            'bg-red-50/80 border-red-400 text-red-950 ring-1 ring-red-400/20';
                          badgeClasses = 'bg-red-600 text-white border-red-600';
                        } else {
                          cardClasses = 'bg-white border-slate-200 text-slate-500 opacity-75';
                        }
                      }

                      return (
                        <button
                          key={`${currentQ.questionId}_opt_${idx}`}
                          type="button"
                          disabled={isAnswered || isEvaluating}
                          onClick={() => setDraftAnswer(opt)}
                          className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                            isAnswered ? 'cursor-default' : 'cursor-pointer'
                          } ${cardClasses}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${badgeClasses}`}
                          >
                            {optionLetter}
                          </span>
                          <div className="flex-1 text-xs sm:text-sm leading-relaxed min-w-0">
                            <MathRenderer content={opt} />
                          </div>
                          {isAnswered && isCorrectOption && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="sr-only sm:not-sr-only">Correct</span>
                            </span>
                          )}
                          {isAnswered && isSelected && !isCorrectOption && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 shrink-0">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="sr-only sm:not-sr-only">Your choice</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label
                      htmlFor="practice-answer-input"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      {currentQ.questionType === 'numerical'
                        ? 'Your Numerical or Mathematical Answer (e.g., 0.5, 1/2, 6.283):'
                        : 'Your Answer:'}
                    </label>
                    <input
                      id="practice-answer-input"
                      type="text"
                      inputMode={currentQ.questionType === 'numerical' ? 'text' : 'text'}
                      value={isAnswered ? currentAtt?.userAnswer || '' : draftAnswer}
                      disabled={isAnswered || isEvaluating}
                      onChange={(e) => setDraftAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isAnswered && draftAnswer.trim()) {
                          e.preventDefault();
                          handleSubmitAnswer();
                        }
                      }}
                      placeholder={
                        currentQ.questionType === 'numerical'
                          ? 'Type number, fraction (e.g. 1/2), or decimal...'
                          : 'Type your concise answer...'
                      }
                      className="w-full text-sm rounded-xl px-4 py-3 bg-white! text-slate-900! border border-slate-300 focus:outline-none focus:border-blue-600 disabled:bg-slate-50!"
                    />
                  </div>
                )}

                {/* Submit Answer Action (before submission) */}
                {!isAnswered && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      id="btn-practice-submit-answer"
                      type="button"
                      disabled={!draftAnswer.trim() || isEvaluating}
                      onClick={handleSubmitAnswer}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Evaluating Answer...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Immediate Evaluation & Explanation Card (after submission - Sections 7, 9, 10) */}
                {isAnswered && currentAtt && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                      isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    {/* Feedback Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <h4
                            className={`text-sm sm:text-base font-bold ${
                              isCorrect ? 'text-emerald-900' : 'text-red-900'
                            }`}
                          >
                            {isCorrect ? 'Correct ✓' : 'Not quite.'}
                          </h4>
                          {!isCorrect && (
                            <div className="text-xs sm:text-sm text-slate-800 flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-600">
                                Correct Answer:
                              </span>
                              <span className="font-bold text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded">
                                <MathRenderer content={currentQ.correctAnswer} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic Breakdown when Incorrect (Section 7) */}
                    {!isCorrect && (currentAtt.whatWentWrong || currentAtt.correctApproach) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {currentAtt.whatWentWrong && (
                          <div className="p-3 rounded-xl bg-white/90 border border-amber-200/80 text-xs text-slate-800">
                            <span className="font-bold text-amber-900 block mb-1">
                              What to Watch Out For:
                            </span>
                            <MathRenderer content={currentAtt.whatWentWrong} />
                          </div>
                        )}
                        {currentAtt.correctApproach && (
                          <div className="p-3 rounded-xl bg-white/90 border border-emerald-200/80 text-xs text-slate-800">
                            <span className="font-bold text-emerald-900 block mb-1">
                              Correct Approach:
                            </span>
                            <MathRenderer content={currentAtt.correctApproach} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Concise Explanation */}
                    <div className="pt-2 border-t border-slate-200/70 text-xs sm:text-sm text-slate-800 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Explanation
                      </span>
                      <SafeRenderErrorBoundary
                        mode="PRACTICE"
                        messageId={`${currentQ.questionId}-exp`}
                        rawText={currentAtt.feedbackExplanation || currentQ.explanation}
                      >
                        <MathRenderer
                          content={currentAtt.feedbackExplanation || currentQ.explanation}
                        />
                      </SafeRenderErrorBoundary>
                    </div>

                    {/* Structured Quantitative Solution (Given / Formula / Substitution / Calculation / Answer - Section 9) */}
                    {currentQ.structuredSolution &&
                      (currentQ.structuredSolution.given ||
                        currentQ.structuredSolution.formula ||
                        currentQ.structuredSolution.calculation) && (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-2 text-xs sm:text-sm">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Structured Worked Solution
                          </span>
                          {currentQ.structuredSolution.given && (
                            <div>
                              <span className="font-bold text-slate-700">Given: </span>
                              <MathRenderer content={currentQ.structuredSolution.given} />
                            </div>
                          )}
                          {currentQ.structuredSolution.formula && (
                            <div>
                              <span className="font-bold text-slate-700">Formula: </span>
                              <MathRenderer content={currentQ.structuredSolution.formula} />
                            </div>
                          )}
                          {currentQ.structuredSolution.substitution && (
                            <div>
                              <span className="font-bold text-slate-700">Substitution: </span>
                              <MathRenderer content={currentQ.structuredSolution.substitution} />
                            </div>
                          )}
                          {currentQ.structuredSolution.calculation && (
                            <div>
                              <span className="font-bold text-slate-700">Calculation: </span>
                              <MathRenderer content={currentQ.structuredSolution.calculation} />
                            </div>
                          )}
                          {currentQ.structuredSolution.answer && (
                            <div className="pt-1 border-t border-slate-100">
                              <span className="font-bold text-emerald-800">Answer: </span>
                              <MathRenderer content={currentQ.structuredSolution.answer} />
                            </div>
                          )}
                        </div>
                      )}

                    {/* Honest Course Material Sources (ONLY when genuinely used - Section 14) */}
                    {questionSources.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                          Sources (VENUE Course Materials):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {questionSources.map((src, sIdx) => (
                            <button
                              key={`${src.materialId}_${sIdx}`}
                              type="button"
                              onClick={() => handleClickSource(src)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[240px]">
                                {src.courseCode ? `${src.courseCode} — ` : ''}
                                {src.title}
                                {src.pageReferences && src.pageReferences.length > 0
                                  ? ` (p. ${src.pageReferences.join(', ')})`
                                  : ''}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Depth & Visual Actions (Sections 9 & 16) */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Need deeper understanding on this question?
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={Boolean(followupLoadingAction)}
                          onClick={() => handleRequestFollowup('explain')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {followupLoadingAction === 'explain' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>Explain</span>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(followupLoadingAction)}
                          onClick={() => handleRequestFollowup('simpler')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {followupLoadingAction === 'simpler' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                          ) : (
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span>Explain more simply</span>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(followupLoadingAction)}
                          onClick={() => handleRequestFollowup('steps')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {followupLoadingAction === 'steps' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>Show all steps</span>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(followupLoadingAction)}
                          onClick={() => handleRequestFollowup('another_method')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {followupLoadingAction === 'another_method' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          )}
                          <span>Show another method</span>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(followupLoadingAction) || isLoadingQuestion}
                          onClick={() => handleNextQuestion(true)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Give me a similar question</span>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(followupLoadingAction)}
                          onClick={() => handleRequestFollowup('diagram')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {followupLoadingAction === 'diagram' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span>Show by diagram</span>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(followupLoadingAction)}
                          onClick={() => handleRequestFollowup('graph')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {followupLoadingAction === 'graph' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <BarChart2 className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span>Plot graph</span>
                        </button>
                      </div>

                      {/* Optional custom question/visual request input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (customVisualOrFollowupInput.trim()) {
                            handleRequestFollowup('custom', customVisualOrFollowupInput);
                          }
                        }}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={customVisualOrFollowupInput}
                          onChange={(e) => setCustomVisualOrFollowupInput(e.target.value)}
                          placeholder='Ask a follow-up (e.g., "Why did we divide by 6?" or "Draw a graph")...'
                          className="flex-1 text-xs rounded-lg px-3 py-1.5 bg-white! text-slate-900! border border-slate-200 focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="submit"
                          disabled={
                            !customVisualOrFollowupInput.trim() || Boolean(followupLoadingAction)
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold cursor-pointer"
                        >
                          Ask
                        </button>
                      </form>
                    </div>

                    {/* Rendered Follow-Up Panels & Visuals */}
                    {followupPanels.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {followupPanels.map((panel) => {
                          const recoveredPanel = recoverStructuredTextIfRawJson(
                            panel.explanationMarkdown || ''
                          );
                          const panelText =
                            recoveredPanel.text || panel.explanationMarkdown || '';
                          const safePanelSvg = sanitizeDiagramSvg(
                            panel.diagramSvg || recoveredPanel.diagramSvg
                          );
                          return (
                            <div
                              key={panel.id}
                              className="p-4 rounded-xl bg-white border border-blue-200/80 text-slate-800 space-y-3"
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>{panel.title}</span>
                              </div>
                              <SafeRenderErrorBoundary
                                mode="PRACTICE"
                                messageId={panel.id}
                                rawText={panelText}
                              >
                                <div className="text-xs sm:text-sm leading-relaxed">
                                  <MathRenderer content={panelText} />
                                </div>
                              </SafeRenderErrorBoundary>
                              {panel.structuredSolution &&
                                (panel.structuredSolution.given ||
                                  panel.structuredSolution.formula ||
                                  panel.structuredSolution.calculation) && (
                                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                                    {panel.structuredSolution.given && (
                                      <div>
                                        <strong>Given: </strong>
                                        <MathRenderer content={panel.structuredSolution.given} />
                                      </div>
                                    )}
                                    {panel.structuredSolution.formula && (
                                      <div>
                                        <strong>Formula: </strong>
                                        <MathRenderer content={panel.structuredSolution.formula} />
                                      </div>
                                    )}
                                    {panel.structuredSolution.substitution && (
                                      <div>
                                        <strong>Substitution: </strong>
                                        <MathRenderer
                                          content={panel.structuredSolution.substitution}
                                        />
                                      </div>
                                    )}
                                    {panel.structuredSolution.calculation && (
                                      <div>
                                        <strong>Calculation: </strong>
                                        <MathRenderer
                                          content={panel.structuredSolution.calculation}
                                        />
                                      </div>
                                    )}
                                    {panel.structuredSolution.answer && (
                                      <div>
                                        <strong>Answer: </strong>
                                        <MathRenderer content={panel.structuredSolution.answer} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              {panel.chartData && (
                                <SafeRenderErrorBoundary
                                  mode="PRACTICE"
                                  messageId={`${panel.id}-chart`}
                                  rawText=""
                                >
                                  <AIChartViewer chartData={panel.chartData} />
                                </SafeRenderErrorBoundary>
                              )}
                              {safePanelSvg && (
                                <div
                                  className="venue-svg-diagram-card my-2 p-3 rounded-xl bg-white border border-slate-200 overflow-x-auto flex justify-center"
                                  dangerouslySetInnerHTML={{ __html: safePanelSvg }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Prominent Next Question Button (Section 10 & 19) */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <span className="text-xs text-slate-600">
                        {activeSession.questionsAttempted >= activeSession.targetQuestionCount
                          ? 'Session target reached! View your summary or keep practicing.'
                          : `Ready for Question ${activeSession.questionsAttempted + 1}?`}
                      </span>
                      <button
                        id="btn-practice-next-question"
                        type="button"
                        disabled={isLoadingQuestion}
                        onClick={() => handleNextQuestion(false)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                      >
                        {activeSession.questionsAttempted >=
                        activeSession.targetQuestionCount ? (
                          <>
                            <Award className="w-4 h-4" />
                            <span>Complete Session & View Summary</span>
                          </>
                        ) : (
                          <>
                            <span>Next Question</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: PRACTICE SESSION SUMMARY & CONTINUE PRACTICING (Sections 12 & 13)
  // ============================================================================
  const attempted = activeSession.questionsAttempted;
  const correct = activeSession.correctCount;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  const strongAreas =
    activeSession.conceptsAnsweredCorrectly.length > 0
      ? activeSession.conceptsAnsweredCorrectly
      : correct > 0
      ? [activeSession.topic]
      : [];

  const needsPracticeAreas = activeSession.conceptsNeedingReview;

  const recommendedNextStep =
    needsPracticeAreas.length > 0
      ? `Practice "${needsPracticeAreas[0]}" at ${formatDifficultyBadge(
          activeSession.currentDifficulty
        ).toLowerCase()} level to build confidence.`
      : accuracy >= 80
      ? `Great session performance on "${activeSession.topic}"! Consider practicing at ${
          activeSession.currentDifficulty === 'foundational'
            ? 'intermediate'
            : 'advanced'
        } level next.`
      : `Continue practicing "${activeSession.topic}" at ${formatDifficultyBadge(
          activeSession.currentDifficulty
        ).toLowerCase()} level.`;

  const sessionSources =
    activeSession.groundedInMaterials &&
    Array.isArray(activeSession.referencedMaterials) &&
    activeSession.referencedMaterials.length > 0
      ? activeSession.referencedMaterials
      : [];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Practice Complete Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Practice Complete
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeSession.courseCode}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {activeSession.topic}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {recommendedNextStep}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white p-4 rounded-xl border border-slate-200/80">
            <div className="text-center">
              <div
                className={`text-2xl sm:text-3xl font-extrabold ${
                  accuracy >= 75
                    ? 'text-emerald-600'
                    : accuracy >= 50
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {accuracy}%
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Accuracy</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="space-y-1 text-xs">
              <div className="text-slate-700 font-semibold">
                Questions: <strong>{attempted}</strong>
              </div>
              <div className="text-emerald-700 font-semibold">
                Correct: <strong>{correct}</strong>
              </div>
              <div className="text-slate-500">
                Hints Used: <strong>{activeSession.hintsUsed}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Strong Areas & Needs More Practice Breakdown (Section 12) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strong Areas This Session</span>
            </div>
            {strongAreas.length > 0 ? (
              <ul className="space-y-1 text-xs sm:text-sm text-slate-800 list-disc list-inside">
                {strongAreas.map((area, idx) => (
                  <li key={idx} className="font-medium">
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                Complete more questions to identify strong subtopics.
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Needs More Practice</span>
            </div>
            {needsPracticeAreas.length > 0 ? (
              <ul className="space-y-1 text-xs sm:text-sm text-slate-800 list-disc list-inside">
                {needsPracticeAreas.map((area, idx) => (
                  <li key={idx} className="font-medium">
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600">
                No major weak areas detected in this session.
              </p>
            )}
          </div>
        </div>

        {/* Recommended Next Step Card */}
        <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Recommended Next Step
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
              {recommendedNextStep}
            </p>
          </div>
        </div>

        {/* Honest Course Material Sources (ONLY if genuinely used) */}
        {sessionSources.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Sources Used in This Practice Session
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sessionSources.map((src, idx) => (
                <button
                  key={`${src.materialId}_${idx}`}
                  type="button"
                  onClick={() => handleClickSource(src)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {src.courseCode ? `${src.courseCode} — ` : ''}
                    {src.title}
                    {src.pageReferences && src.pageReferences.length > 0
                      ? ` (p. ${src.pageReferences.join(', ')})`
                      : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 13: Continue Practice or Start New Session */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-continue-practice"
            type="button"
            disabled={isLoadingQuestion}
            onClick={handleContinuePractice}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            {isLoadingQuestion ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Continue Practice</span>
          </button>

          {onLaunchStudyModeForTopic && (
            <button
              type="button"
              onClick={() =>
                onLaunchStudyModeForTopic(
                  activeSession.courseCode,
                  needsPracticeAreas[0] || activeSession.topic
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Study Topic in AI Study Mode</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewStage('setup')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>New Practice Setup</span>
          </button>
        </div>

        {/* Practiced Questions Log */}
        {activeSession.history.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Practiced Questions ({activeSession.history.length})
            </h4>
            <div className="space-y-3">
              {activeSession.history.map((item, idx) => (
                <div
                  key={`${item.question.questionId}_${idx}`}
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    item.attempt.isCorrect
                      ? 'bg-white border-slate-200'
                      : 'bg-red-50/20 border-red-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                          item.attempt.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {item.question.topic}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {formatDifficultyBadge(item.question.difficulty)}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        item.attempt.isCorrect ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {item.attempt.isCorrect ? 'Correct ✓' : 'Needs Review'}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-900">
                    <MathRenderer content={item.question.questionText} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Your Answer:</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        <MathRenderer content={item.attempt.userAnswer} />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="text-emerald-800 block text-[11px]">Correct Answer:</span>
                      <div className="font-bold text-emerald-950 mt-0.5">
                        <MathRenderer content={item.question.correctAnswer} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
