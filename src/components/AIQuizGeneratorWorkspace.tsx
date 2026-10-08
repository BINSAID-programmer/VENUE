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
  ChevronLeft,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Play,
  ListChecks,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  MessageSquare,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Course,
  StudentProfile,
  AcademicMaterialRecord,
  AIMaterialReference,
  AIAssessmentQuestion,
  AIAssessmentQuestionAttempt,
  AIAssessmentQuestionType,
  AIQuizSessionData,
  AILearningSession,
  AITutorDifficultyLevel,
} from '../types';
import { aiTutorFoundationService } from '../services/aiTutorFoundationService';
import { aiTutorMaterialContextService } from '../services/aiTutorMaterialContextService';
import { MathRenderer, MathBlock } from './MathRenderer';
import {
  SafeRenderErrorBoundary,
  filterValidCitations,
  recoverStructuredTextIfRawJson,
} from '../utils/aiResponseRenderPipeline';

interface AIQuizGeneratorWorkspaceProps {
  profile?: StudentProfile;
  courses: Course[];
  selectedCourseContext: string;
  onSelectCourseContext: (courseCode: string) => void;
  languagePreference: string;
  initialTopic?: string;
  initialDifficulty?: AITutorDifficultyLevel;
  onOpenMaterialSource?: (material: AcademicMaterialRecord, pageNumber?: number) => void;
  onAskTutorInChat?: (prompt: string, courseCode?: string) => void;
  onLaunchStudyModeForTopic?: (courseCode: string, topic: string) => void;
}

const QUESTION_COUNT_OPTIONS = [3, 5, 10, 15, 20];

const DIFFICULTY_OPTIONS: {
  value: AITutorDifficultyLevel;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    value: 'foundational',
    label: 'Beginner',
    badge: 'Foundational',
    description: 'Core definitions, basic concepts, and direct formulas',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    badge: 'Standard',
    description: 'University tutorial-level application & interpretation',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    badge: 'Exam-Level',
    description: 'Multi-step derivations, proofs, and analytical synthesis',
  },
  {
    value: 'adaptive',
    label: 'Mixed',
    badge: 'Balanced Mix',
    description: 'Graduated blend of foundational, standard, and exam questions',
  },
];

const QUESTION_TYPE_OPTIONS: {
  value: AIAssessmentQuestionType;
  label: string;
  description: string;
}[] = [
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    description: '4 distinct options (A, B, C, D) with instant selection',
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    description: 'Concise conceptual or analytical written response',
  },
  {
    value: 'numerical',
    label: 'Numerical',
    description: 'Quantitative calculation, probability, or formula evaluation',
  },
  {
    value: 'mixed',
    label: 'Mixed',
    description: 'Balanced combination of Multiple Choice, Numerical, and Short Answer',
  },
];

const QUIZ_LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto (Match Input / Course)' },
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
  { value: 'French', label: 'Français' },
  { value: 'Arabic', label: 'العربية' },
];

export const AIQuizGeneratorWorkspace: React.FC<AIQuizGeneratorWorkspaceProps> = ({
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
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<AITutorDifficultyLevel>(
    initialDifficulty || 'intermediate'
  );
  const [questionType, setQuestionType] = useState<AIAssessmentQuestionType>('multiple_choice');
  const [quizLanguage, setQuizLanguage] = useState<string>(languagePreference || 'auto');
  const [customInstruction, setCustomInstruction] = useState<string>('');

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
      setCustomTopicInput(initialTopic);
      setViewStage('setup');
    }
    if (initialDifficulty) {
      setDifficulty(initialDifficulty);
    }
  }, [initialTopic, initialDifficulty]);

  // Authorized Course Materials & Recent Saved Quizzes
  const [courseMaterials, setCourseMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [savedQuizSessions, setSavedQuizSessions] = useState<AILearningSession[]>([]);

  // Active Quiz Session State
  const [activeQuiz, setActiveQuiz] = useState<AIQuizSessionData | null>(null);
  const [viewStage, setViewStage] = useState<'setup' | 'taking' | 'results'>('setup');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Interactive Question Answering State
  const [draftAnswer, setDraftAnswer] = useState<string>('');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});
  const [inlineExplanationByQuestionId, setInlineExplanationByQuestionId] = useState<
    Record<string, { loading: boolean; content?: string; error?: string }>
  >({});

  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep course synced when parent selector changes in setup screen
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

  // Keep language synced when parent language changes in setup screen
  useEffect(() => {
    if (languagePreference && viewStage === 'setup') {
      setQuizLanguage(languagePreference);
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

  // Load recent saved Quiz sessions
  useEffect(() => {
    aiTutorFoundationService
      .listLearningSessions(profile?.uid, 'QUIZ')
      .then((sessions) => {
        setSavedQuizSessions(sessions.slice(0, 6));
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
        topicsSet.add('Probability Rules & Conditional Probability');
        topicsSet.add('Random Variables & Probability Distributions');
        topicsSet.add('Expectation, Variance & Moment Generating Functions');
        topicsSet.add('Sampling Distributions & Hypothesis Testing');
      } else if (codeUpper.startsWith('MT')) {
        topicsSet.add('Limits, Continuity & Differentiation');
        topicsSet.add('Integration Techniques & Definite Integrals');
        topicsSet.add('Matrices, Determinants & Linear Systems');
        topicsSet.add('Differential Equations & Series');
      } else if (codeUpper.startsWith('CS') || codeUpper.startsWith('IS')) {
        topicsSet.add('Data Structures & Algorithmic Complexity');
        topicsSet.add('Relational Database Design & SQL Normalization');
        topicsSet.add('Operating Systems & Concurrency');
      } else if (activeCourseObj.title) {
        topicsSet.add(`Core Principles of ${activeCourseObj.title}`);
        topicsSet.add(`Problem Solving in ${activeCourseObj.code}`);
      }
    } else {
      topicsSet.add('Probability & Bayes Theorem');
      topicsSet.add('Calculus: Derivatives & Integrals');
      topicsSet.add('Linear Algebra & Matrix Operations');
    }

    return Array.from(topicsSet).slice(0, 8);
  }, [courseMaterials, activeCourseObj]);

  const effectiveTopic = useMemo(() => {
    if (customTopicInput.trim()) return customTopicInput.trim();
    if (selectedTopic.trim()) return selectedTopic.trim();
    if (selectedMaterialId) {
      const mat = courseMaterials.find((m) => m.id === selectedMaterialId);
      if (mat) return mat.title;
    }
    if (activeCourseObj) return `${activeCourseObj.code}: ${activeCourseObj.title}`;
    return '';
  }, [customTopicInput, selectedTopic, selectedMaterialId, courseMaterials, activeCourseObj]);

  // Reset draft answer whenever current question changes
  const currentQuestion: AIAssessmentQuestion | undefined = useMemo(() => {
    if (!activeQuiz) return undefined;
    return activeQuiz.questions[activeQuiz.currentQuestionIndex];
  }, [activeQuiz]);

  const currentAttempt: AIAssessmentQuestionAttempt | undefined = useMemo(() => {
    if (!activeQuiz || !currentQuestion) return undefined;
    return activeQuiz.attempts[currentQuestion.questionId];
  }, [activeQuiz, currentQuestion]);

  useEffect(() => {
    if (currentQuestion) {
      const existingAttempt = activeQuiz?.attempts[currentQuestion.questionId];
      setDraftAnswer(existingAttempt ? existingAttempt.userAnswer : '');
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion?.questionId, activeQuiz?.quizId]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Generate a new Quiz via /api/tutor/quiz
  const handleGenerateQuiz = async (overrideParams?: {
    topic?: string;
    difficulty?: AITutorDifficultyLevel;
    questionCount?: number;
    questionType?: AIAssessmentQuestionType;
    customInstruction?: string;
  }) => {
    const topicToUse = (overrideParams?.topic ?? effectiveTopic).trim();
    if (!topicToUse || isGenerating) return;

    const difficultyToUse = overrideParams?.difficulty ?? difficulty;
    const countToUse = overrideParams?.questionCount ?? questionCount;
    const typeToUse = overrideParams?.questionType ?? questionType;
    const instructionToUse = overrideParams?.customInstruction ?? customInstruction;

    setErrorBanner(null);
    setIsGenerating(true);

    if (selectedCourseCode && selectedCourseCode !== selectedCourseContext) {
      onSelectCourseContext(selectedCourseCode);
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Retrieve relevant authorized course material snippets (capped to 4 materials to avoid token bloat)
      const targetMaterials = selectedMaterialId
        ? courseMaterials.filter((m) => m.id === selectedMaterialId)
        : courseMaterials;

      const groundingPayload = aiTutorMaterialContextService.selectRelevantMaterials(
        `${topicToUse} ${instructionToUse || ''}`.trim(),
        targetMaterials,
        selectedCourseCode,
        4
      );

      const personalizedMemoryContext = await aiTutorFoundationService.getRelevantPersonalizedMemoryContext({
        userId: profile?.uid,
        courseCode: selectedCourseCode,
        courseId: activeCourseObj?.id || selectedCourseCode,
        topic: topicToUse,
        userMessage: instructionToUse || '',
        mode: 'QUIZ',
        authorizedCourseCodes: courses.map((c) => c.code),
      });

      const response = await fetch('/api/tutor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          courseCode: selectedCourseCode,
          courseContext: selectedCourseCode,
          courseTitle: activeCourseObj?.title || '',
          topic: topicToUse,
          difficulty: difficultyToUse,
          questionCount: countToUse,
          questionType: typeToUse,
          languagePreference: quizLanguage,
          customInstruction: instructionToUse,
          optionalInstruction: instructionToUse,
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
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate quiz questions.');
      }

      const rawQuestions: Partial<AIAssessmentQuestion>[] = Array.isArray(result.data.questions)
        ? result.data.questions
        : [];

      // Validate every question on client-side as well (Stage 10H Section 14)
      const validatedQuestions: AIAssessmentQuestion[] = [];
      for (const rq of rawQuestions) {
        const check = aiTutorFoundationService.validateAssessmentQuestion({
          ...rq,
          courseId: activeCourseObj?.id || selectedCourseCode || 'general',
          courseCode: selectedCourseCode,
        });
        if (check.valid && check.normalized) {
          validatedQuestions.push(check.normalized);
        }
      }

      if (validatedQuestions.length === 0) {
        throw new Error(
          'Could not validate the generated quiz questions. Please try again or adjust your topic.'
        );
      }

      const now = new Date().toISOString();
      const newQuiz: AIQuizSessionData = {
        quizId: `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: profile?.uid || 'guest',
        courseId: activeCourseObj?.id || selectedCourseCode || 'general',
        courseCode: selectedCourseCode || 'All Courses',
        courseTitle: activeCourseObj?.title,
        topic: topicToUse,
        quizTitle:
          result.data.quizTitle || `${selectedCourseCode !== 'All Courses' ? `${selectedCourseCode}: ` : ''}${topicToUse}`,
        difficulty: difficultyToUse,
        questionType: typeToUse,
        language: quizLanguage,
        questionCount: validatedQuestions.length,
        customInstruction: instructionToUse || undefined,
        questions: validatedQuestions,
        attempts: {},
        currentQuestionIndex: 0,
        status: 'in_progress',
        groundedInMaterials: Boolean(result.data.groundedInMaterials),
        referencedMaterials: Array.isArray(result.data.referencedMaterials)
          ? result.data.referencedMaterials
          : [],
        createdAt: now,
      };

      setActiveQuiz(newQuiz);
      setExpandedExplanationIds({});
      setInlineExplanationByQuestionId({});
      setViewStage('taking');

      // Persist initial quiz session locally & in session list
      await aiTutorFoundationService.saveQuizSessionRecord(newQuiz, profile?.uid);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      const normalized = aiTutorFoundationService.normalizeError(err, 'QUIZ');
      setErrorBanner(normalized.userMessage);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsGenerating(false);
    }
  };

  // Submit answer for the current question
  const handleCheckAnswer = (answerOverride?: string) => {
    if (!activeQuiz || !currentQuestion) return;
    const answerToEvaluate = (answerOverride ?? draftAnswer).trim();
    if (!answerToEvaluate) return;

    const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const attempt = aiTutorFoundationService.evaluateQuestionAttempt(
      currentQuestion,
      answerToEvaluate,
      elapsedSec
    );

    const updatedAttempts = {
      ...activeQuiz.attempts,
      [currentQuestion.questionId]: attempt,
    };

    const updatedQuiz: AIQuizSessionData = {
      ...activeQuiz,
      attempts: updatedAttempts,
    };

    setActiveQuiz(updatedQuiz);
    // Automatically expand the explanation once the student submits their answer
    setExpandedExplanationIds((prev) => ({
      ...prev,
      [currentQuestion.questionId]: true,
    }));

    // Cache locally without spamming Firestore on every question click
    aiTutorFoundationService.saveQuizSessionRecord(updatedQuiz, profile?.uid).catch(() => {});
  };

  // Complete the Quiz & Calculate Final Score Summary
  const handleFinishQuiz = async () => {
    if (!activeQuiz) return;

    const total = activeQuiz.questions.length;
    const attemptsList = Object.values(activeQuiz.attempts);
    const correctCount = attemptsList.filter((a) => a.isCorrect).length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    let performanceSummary = '';
    if (percentage >= 85) {
      performanceSummary = 'Excellent mastery! You demonstrated strong command of the concepts and formulas.';
    } else if (percentage >= 70) {
      performanceSummary = 'Good performance! Review the missed questions below to solidify your exam readiness.';
    } else if (percentage >= 50) {
      performanceSummary = 'Fair effort. Focus on the step-by-step explanations for the questions you missed.';
    } else {
      performanceSummary = 'Needs more practice. We recommend reviewing the core topic in Study Mode and retrying an easier quiz.';
    }

    const completedQuiz: AIQuizSessionData = {
      ...activeQuiz,
      status: 'completed',
      score: correctCount,
      percentage,
      performanceSummary,
      completedAt: new Date().toISOString(),
    };

    setActiveQuiz(completedQuiz);
    setViewStage('results');

    // Save completed quiz summary to Firestore & update compact tutor memory signal
    await aiTutorFoundationService.saveQuizSessionRecord(completedQuiz, profile?.uid);

    const missedTopics = completedQuiz.questions
      .filter((q) => !completedQuiz.attempts[q.questionId]?.isCorrect)
      .map((q) => q.learningObjective || q.topic)
      .filter(Boolean);
    const masteredTopics = completedQuiz.questions
      .filter((q) => completedQuiz.attempts[q.questionId]?.isCorrect)
      .map((q) => q.learningObjective || q.topic)
      .filter(Boolean);

    if (profile?.uid) {
      aiTutorFoundationService
        .upsertTutorMemorySignal({
          userId: profile.uid,
          courseId: completedQuiz.courseId,
          courseCode: completedQuiz.courseCode,
          weakTopics: missedTopics.slice(0, 3),
          strengths: masteredTopics.slice(0, 3),
          difficultyLevel: completedQuiz.difficulty,
        })
        .catch(() => {});
    }
  };

  // Retry the exact same quiz questions from scratch
  const handleRetrySameQuiz = () => {
    if (!activeQuiz) return;
    const resetQuiz: AIQuizSessionData = {
      ...activeQuiz,
      attempts: {},
      currentQuestionIndex: 0,
      status: 'in_progress',
      score: undefined,
      percentage: undefined,
      performanceSummary: undefined,
      completedAt: undefined,
    };
    setActiveQuiz(resetQuiz);
    setDraftAnswer('');
    setExpandedExplanationIds({});
    setViewStage('taking');
  };

  // Resume or review a saved quiz from history
  const handleOpenSavedQuiz = (session: AILearningSession) => {
    const detail = aiTutorFoundationService.getSavedQuizDetail(session.sessionId);
    if (detail && Array.isArray(detail.questions) && detail.questions.length > 0) {
      setActiveQuiz(detail);
      setViewStage(detail.status === 'completed' ? 'results' : 'taking');
      setErrorBanner(null);
    } else {
      // Pre-fill setup with the saved session's parameters so student can regenerate immediately
      if (session.courseCode) setSelectedCourseCode(session.courseCode);
      setCustomTopicInput(session.topic || '');
      if (session.difficulty) setDifficulty(session.difficulty);
    }
  };

  // Request deeper step-by-step explanation for a specific question using /api/tutor/chat
  const handleRequestDeepExplanation = async (q: AIAssessmentQuestion) => {
    const qId = q.questionId;
    if (inlineExplanationByQuestionId[qId]?.loading) return;

    setInlineExplanationByQuestionId((prev) => ({
      ...prev,
      [qId]: { loading: true },
    }));

    try {
      const studentAttempt = activeQuiz?.attempts[qId]?.userAnswer;
      const prompt = `Please explain this quiz question step-by-step so I can understand the underlying concept thoroughly:\n\nQuestion: ${q.questionText}\n${
        q.options && q.options.length > 0
          ? `Options:\n${q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}\n`
          : ''
      }${studentAttempt ? `My Answer: ${studentAttempt}\n` : ''}Correct Answer: ${q.correctAnswer}\n\nExplain clearly why the correct answer is right${
        studentAttempt && studentAttempt !== q.correctAnswer
          ? ' and why my answer was incorrect'
          : ''
      }.`;

      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          courseContext: activeQuiz?.courseCode || selectedCourseCode,
          languagePreference: activeQuiz?.language || quizLanguage,
          mode: 'QUIZ',
          conversationHistory: [],
          availableCourseMaterials: [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Could not load detailed explanation.');
      }

      const d = data.data;
      const parts = [
        d.directAnswer,
        Array.isArray(d.stepByStepDerivation) && d.stepByStepDerivation.length > 0
          ? d.stepByStepDerivation.map((s: string, i: number) => `**Step ${i + 1}:** ${s}`).join('\n\n')
          : '',
        d.realWorldAnalogy ? `**Key Intuition:** ${d.realWorldAnalogy}` : '',
      ].filter(Boolean);

      setInlineExplanationByQuestionId((prev) => ({
        ...prev,
        [qId]: { loading: false, content: parts.join('\n\n') },
      }));
    } catch (err: any) {
      setInlineExplanationByQuestionId((prev) => ({
        ...prev,
        [qId]: {
          loading: false,
          error: 'Could not load extra explanation right now. Please try again.',
        },
      }));
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

  const answeredCount = activeQuiz ? Object.keys(activeQuiz.attempts).length : 0;
  const totalQuestions = activeQuiz ? activeQuiz.questions.length : 0;
  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // ============================================================================
  // VIEW 1: QUIZ SETUP SCREEN
  // ============================================================================
  if (viewStage === 'setup' || !activeQuiz) {
    return (
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    AI Quiz Generator
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Interactive Assessment
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Create a personalized quiz from your course or topic.
                </p>
              </div>
            </div>
          </div>

          {errorBanner && (
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Quiz Generation Issue</p>
                  <p className="text-red-700 mt-0.5">{errorBanner}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGenerateQuiz()}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Setup Form Grid */}
          <div className="space-y-5">
            {/* Step 1: Course & Optional Material Grounding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quiz-course-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  1. Authorized Course
                </label>
                <select
                  id="quiz-course-select"
                  value={selectedCourseCode}
                  onChange={(e) => {
                    setSelectedCourseCode(e.target.value);
                    setSelectedMaterialId('');
                    setSelectedTopic('');
                  }}
                  disabled={isGenerating}
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
                <label
                  htmlFor="quiz-material-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Course Material Scope (Optional)
                </label>
                <select
                  id="quiz-material-select"
                  value={selectedMaterialId}
                  onChange={(e) => {
                    const matId = e.target.value;
                    setSelectedMaterialId(matId);
                    const found = courseMaterials.find((m) => m.id === matId);
                    if (found && !customTopicInput.trim()) {
                      setSelectedTopic(found.title);
                    }
                  }}
                  disabled={isGenerating || isLoadingMaterials || courseMaterials.length === 0}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 disabled:opacity-60 cursor-pointer"
                >
                  <option value="">
                    {isLoadingMaterials
                      ? 'Checking authorized materials...'
                      : courseMaterials.length > 0
                      ? `All relevant course materials (${courseMaterials.length} available)`
                      : 'Standard academic curriculum (No uploaded files)'}
                  </option>
                  {courseMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.materialType.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Topic Selection or Custom Topic */}
            <div>
              <label
                htmlFor="quiz-topic-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                2. Topic or Concept to Test
              </label>
              <input
                id="quiz-topic-input"
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                disabled={isGenerating}
                placeholder={
                  selectedTopic
                    ? `Selected: ${selectedTopic} (or type a custom topic...)`
                    : 'e.g., Probability & Conditional Independence, Integration by Parts, SQL Normalization...'
                }
                className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 bg-white! text-slate-900! border border-slate-200 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
              />

              {/* Suggested Topics Chips */}
              {suggestedTopics.length > 0 && (
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                    Suggested course topics:
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
                          disabled={isGenerating}
                          onClick={() => {
                            setSelectedTopic(topic);
                            setCustomTopicInput(topic);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
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

            {/* Step 3: Number of Questions & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  3. Number of Questions
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {QUESTION_COUNT_OPTIONS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        questionCount === cnt
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="quiz-language-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Quiz Language
                </label>
                <select
                  id="quiz-language-select"
                  value={quizLanguage}
                  onChange={(e) => setQuizLanguage(e.target.value)}
                  disabled={isGenerating}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {QUIZ_LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 4: Difficulty Selection */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                4. Difficulty Level
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isSelected = difficulty === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setDifficulty(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-blue-100 text-blue-800'
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

            {/* Step 5: Question Type Selection */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                5. Question Format
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {QUESTION_TYPE_OPTIONS.map((opt) => {
                  const isSelected = questionType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setQuestionType(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Optional Custom Instruction */}
            <div>
              <label
                htmlFor="quiz-custom-instruction"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Optional Focus or Instruction
              </label>
              <input
                id="quiz-custom-instruction"
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                disabled={isGenerating}
                placeholder='e.g., "Focus on Bayes theorem word problems" or "Include university exam-style calculations"'
                className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2 bg-white! text-slate-900! border border-slate-200 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {courseMaterials.length > 0
                    ? `${courseMaterials.length} authorized course material(s) ready for grounding`
                    : 'Uses verified university academic syllabus'}
                </span>
              </div>

              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Generating {questionCount}-question quiz...</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  id="btn-generate-ai-quiz"
                  type="button"
                  disabled={!effectiveTopic.trim()}
                  onClick={() => handleGenerateQuiz()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Generate {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Recent Saved Quizzes Section */}
          {savedQuizSessions.length > 0 && (
            <div className="pt-5 border-t border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Recent Quizzes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedQuizSessions.map((sess) => {
                  const pct =
                    typeof sess.metadata?.percentage === 'number'
                      ? sess.metadata.percentage
                      : sess.progress?.percentComplete || 0;
                  return (
                    <button
                      key={sess.sessionId}
                      type="button"
                      onClick={() => handleOpenSavedQuiz(sess)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/70 text-left transition-all cursor-pointer"
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
                          {sess.progress?.totalSteps || sess.metadata?.questionCount || 5} questions
                          {' · '}
                          {sess.status === 'completed' ? `Score: ${pct}%` : 'In Progress'}
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
  // VIEW 2: INTERACTIVE QUIZ TAKING WORKSPACE
  // ============================================================================
  if (viewStage === 'taking' && activeQuiz && currentQuestion) {
    const qIndex = activeQuiz.currentQuestionIndex;
    const isAnswered = Boolean(currentAttempt);
    const isCorrect = Boolean(currentAttempt?.isCorrect);
    const isExplanationExpanded = Boolean(expandedExplanationIds[currentQuestion.questionId]);
    const extraExp = inlineExplanationByQuestionId[currentQuestion.questionId];

    // Honest Source Display Rule: only show sources if groundedInMaterials is true AND referencedMaterials is non-empty
    const rawQuestionSources =
      currentQuestion.groundedInMaterials &&
      Array.isArray(currentQuestion.referencedMaterials) &&
      currentQuestion.referencedMaterials.length > 0
        ? currentQuestion.referencedMaterials
        : activeQuiz.groundedInMaterials &&
          Array.isArray(activeQuiz.referencedMaterials) &&
          activeQuiz.referencedMaterials.length > 0
        ? activeQuiz.referencedMaterials
        : [];
    const questionSources = filterValidCitations(rawQuestionSources);

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Quiz Progress Sub-Header */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                {activeQuiz.courseCode}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {activeQuiz.quizTitle || activeQuiz.topic}
              </h3>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
              <span>
                Question <strong className="text-slate-800">{qIndex + 1}</strong> of{' '}
                <strong className="text-slate-800">{totalQuestions}</strong>
              </span>
              <span>·</span>
              <span>
                Answered: <strong className="text-slate-800">{answeredCount}</strong>/{totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleFinishQuiz}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Finish & Score ({answeredCount}/{totalQuestions})
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewStage('setup')}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              New Quiz Setup
            </button>
          </div>
        </div>

        {/* Question Number Pills Bar */}
        <div className="px-4 sm:px-6 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto bg-white">
          {activeQuiz.questions.map((q, idx) => {
            const att = activeQuiz.attempts[q.questionId];
            const isCurrent = idx === qIndex;
            let pillStyle = 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200';
            if (att) {
              pillStyle = att.isCorrect
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                : 'bg-red-50 text-red-700 border-red-300 font-bold';
            }
            if (isCurrent) {
              pillStyle += ' ring-2 ring-blue-600 ring-offset-1';
            }
            return (
              <button
                key={q.questionId}
                type="button"
                onClick={() =>
                  setActiveQuiz((prev) =>
                    prev ? { ...prev, currentQuestionIndex: idx } : prev
                  )
                }
                className={`w-7 h-7 rounded-lg text-xs font-semibold border flex items-center justify-center shrink-0 transition-all cursor-pointer ${pillStyle}`}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Main Question Card Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Question Metadata Badges */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {currentQuestion.questionType === 'multiple_choice'
                    ? 'Multiple Choice'
                    : currentQuestion.questionType === 'numerical'
                    ? 'Numerical Calculation'
                    : 'Short Answer'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 capitalize">
                  {currentQuestion.difficulty === 'foundational'
                    ? 'Beginner'
                    : currentQuestion.difficulty}
                </span>
                {currentQuestion.learningObjective && (
                  <span className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                    {currentQuestion.learningObjective}
                  </span>
                )}
              </div>
            </div>

            {/* Question Prompt with KaTeX / MathRenderer */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 text-slate-900 text-sm sm:text-base leading-relaxed">
              <SafeRenderErrorBoundary
                mode="QUIZ"
                messageId={currentQuestion.questionId}
                rawText={currentQuestion.questionText}
              >
                <MathRenderer content={currentQuestion.questionText} />
              </SafeRenderErrorBoundary>
            </div>

            {/* Answer Input Area */}
            {currentQuestion.questionType === 'multiple_choice' &&
            Array.isArray(currentQuestion.options) ? (
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx);
                  const isSelected =
                    (isAnswered ? currentAttempt?.userAnswer : draftAnswer) === opt;
                  const isCorrectOption = opt === currentQuestion.correctAnswer;

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
                      key={`${currentQuestion.questionId}_opt_${idx}`}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => {
                        setDraftAnswer(opt);
                      }}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isAnswered ? 'cursor-default' : 'cursor-pointer'
                      } ${cardClasses}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${badgeClasses}`}
                      >
                        {optionLetter}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm leading-relaxed min-w-0">
                        <MathRenderer content={opt} />
                      </div>
                      {isAnswered && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {isAnswered && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Numerical or Short Answer Input */
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {currentQuestion.questionType === 'numerical'
                    ? 'Your Numerical or Formula Answer:'
                    : 'Your Short Answer:'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={isAnswered ? currentAttempt?.userAnswer || '' : draftAnswer}
                    disabled={isAnswered}
                    onChange={(e) => setDraftAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isAnswered && draftAnswer.trim()) {
                        e.preventDefault();
                        handleCheckAnswer();
                      }
                    }}
                    placeholder={
                      currentQuestion.questionType === 'numerical'
                        ? 'Enter value or fraction (e.g., 0.25, 3/8, 42.5)...'
                        : 'Type your concise answer here...'
                    }
                    className="flex-1 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 bg-white! text-slate-900! border border-slate-300 focus:outline-none focus:border-blue-600 disabled:bg-slate-50!"
                  />
                </div>
              </div>
            )}

            {/* Submit Answer Button (when not yet answered) */}
            {!isAnswered && (
              <div className="flex items-center justify-end pt-1">
                <button
                  id="btn-quiz-check-answer"
                  type="button"
                  disabled={!draftAnswer.trim()}
                  onClick={() => handleCheckAnswer()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Check Answer</span>
                </button>
              </div>
            )}

            {/* Instant Feedback & Explanation Card (once answered) */}
            {isAnswered && currentAttempt && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                  isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isCorrect ? 'text-emerald-900' : 'text-red-900'
                        }`}
                      >
                        {isCorrect ? 'Correct!' : 'Not quite right'}
                      </h4>
                      {!isCorrect && (
                        <div className="text-xs text-slate-800 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-600">Correct Answer:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                            <MathRenderer content={currentQuestion.correctAnswer} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedExplanationIds((prev) => ({
                        ...prev,
                        [currentQuestion.questionId]: !isExplanationExpanded,
                      }))
                    }
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer shrink-0"
                  >
                    {isExplanationExpanded ? 'Hide Explanation' : 'Show Explanation'}
                  </button>
                </div>

                {isExplanationExpanded && (
                  <div className="pt-2 border-t border-slate-200/70 space-y-3 text-xs sm:text-sm text-slate-800">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Explanation
                      </span>
                      <SafeRenderErrorBoundary
                        mode="QUIZ"
                        messageId={`${currentQuestion.questionId}-exp`}
                        rawText={currentQuestion.explanation}
                        steps={currentQuestion.solutionSteps}
                      >
                        <MathRenderer content={currentQuestion.explanation} />
                      </SafeRenderErrorBoundary>
                    </div>

                    {Array.isArray(currentQuestion.solutionSteps) &&
                      currentQuestion.solutionSteps.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Step-by-Step Working
                          </span>
                          <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                            {currentQuestion.solutionSteps.map((step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed">
                                <MathRenderer content={step} />
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                    {/* Honest Course Material Sources ( ONLY when groundedInMaterials is true ) */}
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
                              <span className="truncate max-w-[220px]">
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

                    {/* Follow-up Tutor Help on this Question */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRequestDeepExplanation(currentQuestion)}
                        disabled={extraExp?.loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {extraExp?.loading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>Explain this question in detail</span>
                      </button>

                      {onAskTutorInChat && (
                        <button
                          type="button"
                          onClick={() =>
                            onAskTutorInChat(
                              `Can you help me understand this quiz question from ${activeQuiz.courseCode} (${activeQuiz.topic})?\n\nQuestion: "${currentQuestion.questionText}"\nCorrect Answer: ${currentQuestion.correctAnswer}`,
                              activeQuiz.courseCode
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>Discuss in AI Chat</span>
                        </button>
                      )}
                    </div>

                    {extraExp?.content && (
                      <div className="mt-2 p-3.5 rounded-xl bg-white border border-blue-200/80 text-slate-800 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>AI Tutor Deep-Dive Explanation</span>
                        </div>
                        <SafeRenderErrorBoundary
                          mode="QUIZ"
                          messageId={`${currentQuestion.questionId}-deep-exp`}
                          rawText={recoverStructuredTextIfRawJson(extraExp.content).text}
                        >
                          <MathRenderer
                            content={recoverStructuredTextIfRawJson(extraExp.content).text}
                          />
                        </SafeRenderErrorBoundary>
                      </div>
                    )}
                    {extraExp?.error && (
                      <p className="text-xs text-red-600">{extraExp.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Question Navigation Footer */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={qIndex === 0}
            onClick={() =>
              setActiveQuiz((prev) =>
                prev
                  ? { ...prev, currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1) }
                  : prev
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-500 font-medium">
            {progressPercentage}% completed
          </div>

          {qIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() =>
                setActiveQuiz((prev) =>
                  prev
                    ? {
                        ...prev,
                        currentQuestionIndex: Math.min(
                          totalQuestions - 1,
                          prev.currentQuestionIndex + 1
                        ),
                      }
                    : prev
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-finish-quiz-results"
              type="button"
              onClick={handleFinishQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Award className="w-4 h-4" />
              <span>View Quiz Results</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: QUIZ RESULTS, SCORE SUMMARY & FOLLOW-UP LEARNING ACTIONS
  // ============================================================================
  const correctTotal = Object.values(activeQuiz.attempts).filter((a) => a.isCorrect).length;
  const incorrectTotal = totalQuestions - correctTotal;
  const finalPct =
    typeof activeQuiz.percentage === 'number'
      ? activeQuiz.percentage
      : totalQuestions > 0
      ? Math.round((correctTotal / totalQuestions) * 100)
      : 0;

  const missedQuestions = activeQuiz.questions.filter(
    (q) => !activeQuiz.attempts[q.questionId]?.isCorrect
  );

  // Honest Source Display Rule for the overall quiz
  const quizSources = activeQuiz.groundedInMaterials
    ? filterValidCitations(activeQuiz.referencedMaterials)
    : [];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score Summary Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {activeQuiz.courseCode}
              </span>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                {activeQuiz.difficulty === 'foundational' ? 'Beginner' : activeQuiz.difficulty}{' '}
                Difficulty
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {activeQuiz.quizTitle || activeQuiz.topic}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeQuiz.performanceSummary}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white p-4 rounded-xl border border-slate-200/80">
            <div className="text-center">
              <div
                className={`text-2xl sm:text-3xl font-extrabold ${
                  finalPct >= 75
                    ? 'text-emerald-600'
                    : finalPct >= 50
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {finalPct}%
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Overall Score</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{correctTotal} Correct</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                <span>{incorrectTotal} Incorrect</span>
              </div>
            </div>
          </div>
        </div>

        {/* Honest Course Material Sources (ONLY if groundedInMaterials is true) */}
        {quizSources.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Grounded in Authorized VENUE Course Materials
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quizSources.map((src, idx) => (
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

        {/* Section 9: Follow-Up Learning Actions */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Next Learning Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRetrySameQuiz}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Retry Quiz</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() =>
                handleGenerateQuiz({
                  topic: activeQuiz.topic,
                  difficulty: 'foundational',
                  questionCount: activeQuiz.questionCount,
                  questionType: activeQuiz.questionType,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Generate Easier Quiz</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() =>
                handleGenerateQuiz({
                  topic: activeQuiz.topic,
                  difficulty: 'advanced',
                  questionCount: activeQuiz.questionCount,
                  questionType: activeQuiz.questionType,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Generate Harder Quiz</span>
            </button>

            {onLaunchStudyModeForTopic && (
              <button
                type="button"
                onClick={() =>
                  onLaunchStudyModeForTopic(
                    activeQuiz.courseCode,
                    missedQuestions[0]?.topic || activeQuiz.topic
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                <span>Study Weak Topic in AI Study Mode</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewStage('setup')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configure New Quiz</span>
            </button>
          </div>
        </div>

        {/* Question-by-Question Review List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Question-by-Question Review ({totalQuestions})
          </h4>

          <div className="space-y-3">
            {activeQuiz.questions.map((q, idx) => {
              const att = activeQuiz.attempts[q.questionId];
              const qCorrect = Boolean(att?.isCorrect);
              const extraExp = inlineExplanationByQuestionId[q.questionId];

              return (
                <div
                  key={q.questionId}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    qCorrect
                      ? 'bg-white border-slate-200'
                      : 'bg-red-50/20 border-red-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                          qCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {q.topic || activeQuiz.topic}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        qCorrect
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {qCorrect ? (
                        <>
                          <Check className="w-3 h-3" /> Correct
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" /> Missed
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-900 leading-relaxed">
                    <MathRenderer content={q.questionText} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        qCorrect
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-red-50/60 border-red-200 text-red-900'
                      }`}
                    >
                      <span className="font-semibold block text-[11px] opacity-75">
                        Your Answer:
                      </span>
                      <div className="font-bold mt-0.5">
                        {att?.userAnswer ? (
                          <MathRenderer content={att.userAnswer} />
                        ) : (
                          <span className="italic text-slate-400">Not answered</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                      <span className="font-semibold block text-[11px] opacity-75">
                        Correct Answer:
                      </span>
                      <div className="font-bold mt-0.5">
                        <MathRenderer content={q.correctAnswer} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 space-y-2">
                    <div>
                      <span className="font-bold text-slate-600 block mb-0.5">
                        Explanation:
                      </span>
                      <MathRenderer content={q.explanation} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRequestDeepExplanation(q)}
                        disabled={extraExp?.loading}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        {extraExp?.loading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        ) : (
                          <HelpCircle className="w-3 h-3 text-blue-600" />
                        )}
                        <span>Explain Missed Concept Step-by-Step</span>
                      </button>
                    </div>

                    {extraExp?.content && (
                      <div className="mt-2 p-3 rounded-xl bg-blue-50/40 border border-blue-200 text-slate-800 space-y-1.5">
                        <MathRenderer content={extraExp.content} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
