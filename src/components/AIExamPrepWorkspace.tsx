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
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  MessageSquare,
  SlidersHorizontal,
  Calendar,
  Clock,
  Target,
  ListChecks,
  Compass,
  Play,
  BarChart2,
  Eye,
  TrendingUp,
} from 'lucide-react';
import {
  Course,
  StudentProfile,
  AcademicMaterialRecord,
  AIMaterialReference,
  AIAssessmentQuestion,
  AIAssessmentQuestionAttempt,
  AIAssessmentQuestionType,
  AIExamPrepPlanData,
  AIExamType,
  AIExamConfidenceLevel,
  AIExamPriorityTopic,
  AIMockExamRecord,
  AILearningDifficulty,
  AILearningSession,
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

interface AIExamPrepWorkspaceProps {
  profile?: StudentProfile;
  courses: Course[];
  selectedCourseContext: string;
  onSelectCourseContext: (courseCode: string) => void;
  languagePreference: string;
  onOpenMaterialSource?: (material: AcademicMaterialRecord, pageNumber?: number) => void;
  onLaunchStudyModeForTopic?: (
    courseCode: string,
    topic: string,
    difficulty?: AILearningDifficulty
  ) => void;
  onLaunchPracticeModeForTopic?: (
    courseCode: string,
    topic: string,
    difficulty?: AILearningDifficulty
  ) => void;
  onLaunchQuizGeneratorForTopic?: (
    courseCode: string,
    topic: string,
    difficulty?: AILearningDifficulty
  ) => void;
  onAskTutorInChat?: (prompt: string, courseCode?: string) => void;
}

const EXAM_TYPE_OPTIONS: AIExamType[] = ['Final Exam', 'Midterm', 'Test', 'Custom'];

const CONFIDENCE_OPTIONS: Array<{
  value: AIExamConfidenceLevel;
  label: string;
  description: string;
}> = [
  {
    value: 'low',
    label: 'Low',
    description: 'Start from core definitions, prerequisites, and step-by-step foundations',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balance conceptual review, key derivations, and standard tutorial practice',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Focus on challenging problem sets, synthesis, and timed mock exam readiness',
  },
];

const DAILY_STUDY_TIME_OPTIONS = [
  { minutes: 30, label: '30 mins / day' },
  { minutes: 60, label: '1 hour / day' },
  { minutes: 90, label: '1.5 hours / day' },
  { minutes: 120, label: '2 hours / day' },
  { minutes: 180, label: '3 hours / day' },
];

const PREP_GOAL_SUGGESTIONS = [
  'Master key concepts, formulas, and problem-solving methods before the exam',
  'Build confidence on weak topics and practice exam-style numerical problems',
  'Focused high-yield revision of lecture notes and past paper concepts',
  'Comprehensive step-by-step preparation from fundamentals to advanced questions',
];

const EXAM_PREP_LANGUAGES = [
  { value: 'auto', label: 'Auto (Match Input / Course)' },
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
  { value: 'French', label: 'Français' },
  { value: 'Arabic', label: 'العربية' },
];

const MOCK_QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];
const MOCK_DURATION_OPTIONS = [
  { minutes: 15, label: '15 mins' },
  { minutes: 30, label: '30 mins' },
  { minutes: 45, label: '45 mins' },
  { minutes: 60, label: '60 mins' },
  { minutes: 90, label: '90 mins' },
  { minutes: 0, label: 'Untimed' },
];

export const AIExamPrepWorkspace: React.FC<AIExamPrepWorkspaceProps> = ({
  profile,
  courses,
  selectedCourseContext,
  onSelectCourseContext,
  languagePreference,
  onOpenMaterialSource,
  onLaunchStudyModeForTopic,
  onLaunchPracticeModeForTopic,
  onLaunchQuizGeneratorForTopic,
  onAskTutorInChat,
}) => {
  // 1. Setup State
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(() => {
    if (selectedCourseContext && selectedCourseContext !== 'All Courses') {
      return selectedCourseContext;
    }
    return courses[0]?.code || 'All Courses';
  });
  const [examType, setExamType] = useState<AIExamType>('Final Exam');
  const [customExamName, setCustomExamName] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<AIExamConfidenceLevel>('medium');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState<number>(60);
  const [preparationGoal, setPreparationGoal] = useState<string>(PREP_GOAL_SUGGESTIONS[0]);
  const [prepLanguage, setPrepLanguage] = useState<string>(languagePreference || 'auto');

  // Authorized Course Materials & Saved Plans
  const [courseMaterials, setCourseMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [savedExamPrepSessions, setSavedExamPrepSessions] = useState<AILearningSession[]>([]);

  // Workspace View State
  const [viewStage, setViewStage] = useState<
    'setup' | 'dashboard' | 'mock_config' | 'mock_taking' | 'mock_results'
  >('setup');
  const [activePlan, setActivePlan] = useState<AIExamPrepPlanData | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Mock Exam Configuration & Active Exam State (Sections 10–15)
  const [mockSelectedTopics, setMockSelectedTopics] = useState<string[]>([]);
  const [mockQuestionCount, setMockQuestionCount] = useState<number>(10);
  const [mockDurationMinutes, setMockDurationMinutes] = useState<number>(30);
  const [mockDifficulty, setMockDifficulty] = useState<AILearningDifficulty>('adaptive');
  const [mockQuestionType, setMockQuestionType] = useState<AIAssessmentQuestionType>('mixed');
  const [isGeneratingMock, setIsGeneratingMock] = useState<boolean>(false);

  const [activeMockExam, setActiveMockExam] = useState<AIMockExamRecord | null>(null);
  const [mockCurrentIndex, setMockCurrentIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);
  const [showUnansweredOnlyFilter, setShowUnansweredOnlyFilter] = useState<boolean>(false);

  // Post-Mock Question Review Deep-Dive / Visual State (Sections 15 & 23)
  const [reviewFollowupByQuestionId, setReviewFollowupByQuestionId] = useState<
    Record<
      string,
      {
        loading: boolean;
        title?: string;
        explanationMarkdown?: string;
        structuredSolution?: any;
        diagramSvg?: string;
        chartData?: any;
        error?: string;
      }
    >
  >({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const autoSubmittedRef = useRef<boolean>(false);

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
      setPrepLanguage(languagePreference);
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

  // Load recent saved Exam Prep plans
  useEffect(() => {
    aiTutorFoundationService
      .listLearningSessions(profile?.uid, 'EXAM_PREP')
      .then((sessions) => {
        setSavedExamPrepSessions(sessions.slice(0, 6));
      })
      .catch(() => {});
  }, [profile?.uid, viewStage]);

  const activeCourseObj = useMemo(
    () => courses.find((c) => c.code === selectedCourseCode),
    [courses, selectedCourseCode]
  );

  // Current course performance signals from Practice Mode, Quiz Generator, Study Mode (Section 20)
  const performanceSignals = useMemo(
    () =>
      aiTutorFoundationService.getCoursePerformanceSignals(
        activePlan?.courseCode || selectedCourseCode,
        profile?.uid
      ),
    [activePlan?.courseCode, selectedCourseCode, profile?.uid, viewStage]
  );

  // Compute days remaining if examDate is provided (Section 5 & 6)
  const calculateDaysRemaining = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    const target = new Date(`${dateStr}T23:59:59`);
    if (Number.isNaN(target.getTime())) return null;
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Mock Exam Countdown Timer & Automatic Submission at Zero (Sections 12 & 13)
  useEffect(() => {
    if (
      viewStage !== 'mock_taking' ||
      !activeMockExam ||
      activeMockExam.status !== 'in_progress' ||
      remainingSeconds === null
    ) {
      return;
    }

    if (remainingSeconds <= 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleFinalizeMockExamSubmission();
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [viewStage, activeMockExam?.mockExamId, activeMockExam?.status, remainingSeconds]);

  const formatTimerMMSS = (totalSec: number): string => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Generate Personalized Exam Preparation Plan via /api/tutor/exam-prep
  const handleGenerateExamPrepPlan = async () => {
    if (isGeneratingPlan) return;
    setErrorBanner(null);
    setIsGeneratingPlan(true);

    if (selectedCourseCode && selectedCourseCode !== selectedCourseContext) {
      onSelectCourseContext(selectedCourseCode);
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const daysRem = calculateDaysRemaining(examDate);

      // Retrieve relevant authorized materials (notes, slides, past papers, tutorials - capped at 6)
      const groundingPayload = aiTutorMaterialContextService.selectRelevantMaterials(
        `${selectedCourseCode} ${activeCourseObj?.title || ''} ${preparationGoal} exam past paper syllabus`,
        courseMaterials,
        selectedCourseCode,
        6
      );

      const personalizedMemoryContext = await aiTutorFoundationService.getRelevantPersonalizedMemoryContext({
        userId: profile?.uid,
        courseCode: selectedCourseCode,
        courseId: activeCourseObj?.id || selectedCourseCode,
        topic: preparationGoal || selectedCourseCode,
        userMessage: preparationGoal,
        mode: 'EXAM_PREP',
        authorizedCourseCodes: courses.map((c) => c.code),
      });

      const response = await fetch('/api/tutor/exam-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          courseCode: selectedCourseCode,
          courseTitle: activeCourseObj?.title || '',
          examType,
          customExamName: examType === 'Custom' ? customExamName : '',
          examDate: examDate || '',
          daysRemaining: daysRem,
          confidenceLevel,
          dailyStudyMinutes,
          preparationGoal,
          languagePreference: prepLanguage,
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
          performanceSignals,
          callerUid: profile?.uid || 'student_user',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Could not generate exam preparation plan.');
      }

      const now = new Date().toISOString();
      const priorityTopics: AIExamPriorityTopic[] = Array.isArray(result.data.priorityTopics)
        ? result.data.priorityTopics
        : [];

      const newPlan: AIExamPrepPlanData = {
        examPrepId: `examprep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: profile?.uid || 'guest',
        courseId: activeCourseObj?.id || selectedCourseCode || 'general',
        courseCode: selectedCourseCode || 'All Courses',
        courseTitle: activeCourseObj?.title,
        examType,
        customExamName: examType === 'Custom' ? customExamName.trim() : undefined,
        examDate: examDate || undefined,
        confidenceLevel,
        dailyStudyMinutes,
        preparationGoal,
        language: prepLanguage,
        overviewSummary: result.data.overviewSummary || '',
        pastPaperInsights: result.data.pastPaperInsights,
        adaptiveRecommendationNote:
          result.data.adaptiveRecommendationNote || performanceSignals.recommendationSummary,
        priorityTopics,
        revisionPlan: Array.isArray(result.data.revisionPlan) ? result.data.revisionPlan : [],
        mockExams: [],
        topicsReviewed: performanceSignals.topicsStudied || [],
        topicsPracticed: performanceSignals.strongTopics || [],
        quizzesCompletedCount: performanceSignals.quizzesCompleted || 0,
        groundedInMaterials: Boolean(result.data.groundedInMaterials),
        referencedMaterials: Array.isArray(result.data.referencedMaterials)
          ? result.data.referencedMaterials
          : [],
        createdAt: now,
        updatedAt: now,
      };

      setActivePlan(newPlan);
      setMockSelectedTopics(priorityTopics.map((t) => t.topic));
      setViewStage('dashboard');

      // Persist plan checkpoint
      await aiTutorFoundationService.saveExamPrepPlanRecord(newPlan, true, profile?.uid);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      const normalized = aiTutorFoundationService.normalizeError(err, 'EXAM_PREP');
      setErrorBanner(normalized.userMessage);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsGeneratingPlan(false);
    }
  };

  // Toggle priority topic completion status (local storage update to avoid excessive Firestore writes - Section 19)
  const handleTogglePriorityTopicStatus = (topicId: string) => {
    if (!activePlan) return;
    const updatedTopics = activePlan.priorityTopics.map((t) => {
      if (t.id !== topicId) return t;
      const nextStatus: 'to_review' | 'in_progress' | 'completed' =
        t.status === 'completed' ? 'to_review' : 'completed';
      return { ...t, status: nextStatus };
    });

    const completedNames = updatedTopics
      .filter((t) => t.status === 'completed')
      .map((t) => t.topic);

    const updatedPlan: AIExamPrepPlanData = {
      ...activePlan,
      priorityTopics: updatedTopics,
      topicsReviewed: Array.from(new Set([...activePlan.topicsReviewed, ...completedNames])),
      updatedAt: new Date().toISOString(),
    };
    setActivePlan(updatedPlan);
    aiTutorFoundationService.saveExamPrepPlanRecord(updatedPlan, false, profile?.uid).catch(() => {});
  };

  // Toggle revision plan day/session completion
  const handleToggleRevisionDayCompleted = (dayIndex: number) => {
    if (!activePlan) return;
    const updatedDays = activePlan.revisionPlan.map((d) =>
      d.dayIndex === dayIndex ? { ...d, completed: !d.completed } : d
    );
    const updatedPlan: AIExamPrepPlanData = {
      ...activePlan,
      revisionPlan: updatedDays,
      updatedAt: new Date().toISOString(),
    };
    setActivePlan(updatedPlan);
    aiTutorFoundationService.saveExamPrepPlanRecord(updatedPlan, false, profile?.uid).catch(() => {});
  };

  // Launch Mock Exam Configuration Screen (Section 10 & 11)
  const handleOpenMockExamConfig = () => {
    if (!activePlan) return;
    if (mockSelectedTopics.length === 0 && activePlan.priorityTopics.length > 0) {
      setMockSelectedTopics(activePlan.priorityTopics.map((t) => t.topic));
    }
    setErrorBanner(null);
    setViewStage('mock_config');
  };

  // Start Mock Exam by reusing the existing /api/tutor/quiz question-generation infrastructure (Section 10)
  const handleStartMockExam = async () => {
    if (!activePlan || isGeneratingMock) return;
    setErrorBanner(null);
    setIsGeneratingMock(true);

    const topicsToTest =
      mockSelectedTopics.length > 0
        ? mockSelectedTopics
        : activePlan.priorityTopics.map((t) => t.topic);
    const combinedTopicsLabel =
      topicsToTest.length > 0
        ? topicsToTest.join(', ')
        : `${activePlan.courseCode} Comprehensive Exam`;

    try {
      const groundingPayload = aiTutorMaterialContextService.selectRelevantMaterials(
        `${activePlan.courseCode} ${combinedTopicsLabel} exam questions`,
        courseMaterials,
        activePlan.courseCode,
        4
      );

      // Reuse /api/tutor/quiz infrastructure so we do NOT create a duplicate question-generation engine
      const response = await fetch('/api/tutor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: activePlan.courseCode,
          courseTitle: activePlan.courseTitle || '',
          topic: combinedTopicsLabel,
          difficulty: mockDifficulty,
          questionCount: mockQuestionCount,
          questionType: mockQuestionType,
          languagePreference: activePlan.language,
          customInstruction: `Realistic university ${activePlan.examType} mock examination covering: ${combinedTopicsLabel}. Distribute questions across these topics.`,
          availableCourseMaterials: groundingPayload,
          callerUid: profile?.uid || 'student_user',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.data?.questions) {
        throw new Error(result.error || 'Failed to generate mock exam questions.');
      }

      const validatedQuestions: AIAssessmentQuestion[] = [];
      for (const rq of result.data.questions) {
        const check = aiTutorFoundationService.validateAssessmentQuestion({
          ...rq,
          courseId: activePlan.courseId,
          courseCode: activePlan.courseCode,
        });
        if (check.valid && check.normalized) {
          validatedQuestions.push(check.normalized);
        }
      }

      if (validatedQuestions.length === 0) {
        throw new Error('Could not validate generated mock exam questions. Please try again.');
      }

      const newMock: AIMockExamRecord = {
        mockExamId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
        durationMinutes: mockDurationMinutes,
        questionCount: validatedQuestions.length,
        difficulty: mockDifficulty,
        questionType: mockQuestionType,
        topics: topicsToTest,
        questions: validatedQuestions,
        answers: {},
        status: 'in_progress',
        groundedInMaterials: Boolean(result.data.groundedInMaterials),
        referencedMaterials: Array.isArray(result.data.referencedMaterials)
          ? result.data.referencedMaterials
          : [],
      };

      autoSubmittedRef.current = false;
      setActiveMockExam(newMock);
      setMockCurrentIndex(0);
      setShowUnansweredOnlyFilter(false);
      setShowSubmitConfirmModal(false);
      setReviewFollowupByQuestionId({});
      setRemainingSeconds(mockDurationMinutes > 0 ? mockDurationMinutes * 60 : null);
      setViewStage('mock_taking');
    } catch (err: any) {
      const normalized = aiTutorFoundationService.normalizeError(err, 'EXAM_PREP');
      setErrorBanner(normalized.userMessage);
    } finally {
      setIsGeneratingMock(false);
    }
  };

  // Update answer during Mock Exam (no correctness feedback shown during exam - Section 12)
  const handleSelectMockAnswer = (questionId: string, value: string) => {
    if (!activeMockExam || activeMockExam.status !== 'in_progress') return;
    const updatedMock: AIMockExamRecord = {
      ...activeMockExam,
      answers: {
        ...activeMockExam.answers,
        [questionId]: value,
      },
    };
    setActiveMockExam(updatedMock);
  };

  // Trigger Mock Exam Submission with Unanswered Questions Safety Check (Section 13)
  const handleRequestSubmitMockExam = () => {
    if (!activeMockExam) return;
    const unansweredCount = activeMockExam.questions.filter(
      (q) => !(activeMockExam.answers[q.questionId] || '').trim()
    ).length;

    if (unansweredCount > 0) {
      setShowSubmitConfirmModal(true);
      return;
    }
    handleFinalizeMockExamSubmission();
  };

  // Finalize Mock Exam Submission, Calculate Score & Strong/Weak Areas (Section 14)
  const handleFinalizeMockExamSubmission = async () => {
    if (!activeMockExam || !activePlan) return;
    setShowSubmitConfirmModal(false);
    setRemainingSeconds(null);

    const attemptsMap: Record<string, AIAssessmentQuestionAttempt> = {};
    let correctCount = 0;
    const strongTopicMap = new Map<string, { correct: number; total: number }>();

    for (const q of activeMockExam.questions) {
      const rawAns = (activeMockExam.answers[q.questionId] || '').trim();
      const attempt = aiTutorFoundationService.evaluateQuestionAttempt(q, rawAns);
      attemptsMap[q.questionId] = attempt;
      if (attempt.isCorrect) {
        correctCount++;
      }

      const topicKey = (q.topic || activePlan.courseCode).trim();
      const prev = strongTopicMap.get(topicKey) || { correct: 0, total: 0 };
      strongTopicMap.set(topicKey, {
        correct: prev.correct + (attempt.isCorrect ? 1 : 0),
        total: prev.total + 1,
      });
    }

    const total = Math.max(1, activeMockExam.questions.length);
    const percentage = Math.round((correctCount / total) * 100);

    const strongAreas: string[] = [];
    const needsReviewAreas: string[] = [];

    strongTopicMap.forEach((stats, topicName) => {
      if (stats.correct / stats.total >= 0.7) {
        strongAreas.push(topicName);
      } else {
        needsReviewAreas.push(topicName);
      }
    });

    const recommendedNextStep =
      needsReviewAreas.length > 0
        ? `Review ${needsReviewAreas.slice(0, 2).join(' and ')}, then practice 5 intermediate questions.`
        : percentage >= 80
        ? `Strong performance (${percentage}%)! Review any subtle steps below and practice advanced exam questions.`
        : `Review the missed questions below in Study Mode, then practice targeted questions on those topics.`;

    const completedMock: AIMockExamRecord = {
      ...activeMockExam,
      completedAt: new Date().toISOString(),
      attempts: attemptsMap,
      status: 'completed',
      score: correctCount,
      percentage,
      strongAreas,
      needsReviewAreas,
      recommendedNextStep,
    };

    const updatedPlan: AIExamPrepPlanData = {
      ...activePlan,
      mockExams: [
        ...activePlan.mockExams.filter((m) => m.mockExamId !== completedMock.mockExamId),
        completedMock,
      ],
      updatedAt: new Date().toISOString(),
    };

    setActiveMockExam(completedMock);
    setActivePlan(updatedPlan);
    setViewStage('mock_results');

    // Persist checkpoint to Firestore (Section 19)
    await aiTutorFoundationService.saveExamPrepPlanRecord(updatedPlan, true, profile?.uid);
  };

  // Explain individual Mock Exam Question or generate Visual Diagram/Graph (Sections 15 & 23)
  const handleExplainMockQuestion = async (
    q: AIAssessmentQuestion,
    qNumber: number,
    followupAction: 'explain' | 'steps' | 'diagram' | 'graph' = 'explain'
  ) => {
    const qId = q.questionId;
    if (reviewFollowupByQuestionId[qId]?.loading) return;

    setReviewFollowupByQuestionId((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], loading: true, error: undefined },
    }));

    try {
      const studentAns = activeMockExam?.answers[qId] || '';
      const res = await fetch('/api/tutor/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_followup',
          courseCode: activePlan?.courseCode || selectedCourseCode,
          topic: q.topic || activePlan?.courseCode,
          languagePreference: activePlan?.language || prepLanguage,
          currentQuestion: q,
          userAnswer: studentAns,
          followupAction,
          customFollowupPrompt:
            followupAction === 'explain'
              ? `Explain Question ${qNumber} step-by-step consistent with the question and correct answer (${q.correctAnswer}).`
              : undefined,
          callerUid: profile?.uid || 'student_user',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Could not load explanation.');
      }

      setReviewFollowupByQuestionId((prev) => ({
        ...prev,
        [qId]: {
          loading: false,
          title: data.data.title || `Question ${qNumber} Explanation`,
          explanationMarkdown: data.data.explanationMarkdown,
          structuredSolution: data.data.structuredSolution,
          diagramSvg: data.data.diagramSvg,
          chartData: data.data.chartData,
        },
      }));
    } catch {
      setReviewFollowupByQuestionId((prev) => ({
        ...prev,
        [qId]: {
          loading: false,
          error: 'Could not load extra explanation right now. Please try again.',
        },
      }));
    }
  };

  // Open a saved Exam Prep plan
  const handleOpenSavedExamPrep = (session: AILearningSession) => {
    const detail = aiTutorFoundationService.getSavedExamPrepDetail(session.sessionId);
    if (detail) {
      setActivePlan(detail);
      setMockSelectedTopics(detail.priorityTopics.map((t) => t.topic));
      setViewStage('dashboard');
      setErrorBanner(null);
    } else if (session.courseCode) {
      setSelectedCourseCode(session.courseCode);
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

  // ============================================================================
  // VIEW 1: EXAM PREPARATION SETUP SCREEN (Section 1)
  // ============================================================================
  if (viewStage === 'setup' || !activePlan) {
    const existingCoursePlan = aiTutorFoundationService.getSavedExamPrepForCourse(
      selectedCourseCode,
      profile?.uid
    );

    return (
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Exam Preparation
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Revision Plan & Mock Exams
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Prepare smarter with a personalized revision plan, important topics, practice questions, and mock exams.
                </p>
              </div>
            </div>

            {existingCoursePlan && (
              <button
                type="button"
                onClick={() => {
                  setActivePlan(existingCoursePlan);
                  setMockSelectedTopics(existingCoursePlan.priorityTopics.map((t) => t.topic));
                  setViewStage('dashboard');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <span>Resume {existingCoursePlan.courseCode} Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {errorBanner && (
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Exam Preparation Setup Issue</p>
                  <p className="text-red-700 mt-0.5">{errorBanner}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateExamPrepPlan}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Setup Form */}
          <div className="space-y-5">
            {/* Step 1: Course & Exam Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="examprep-course-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  1. Authorized Course
                </label>
                <select
                  id="examprep-course-select"
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  disabled={isGeneratingPlan}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {courses.length === 0 && (
                    <option value="All Courses">All Authorized Courses</option>
                  )}
                  {courses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2. Exam Type
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {EXAM_TYPE_OPTIONS.map((typeOpt) => (
                    <button
                      key={typeOpt}
                      type="button"
                      disabled={isGeneratingPlan}
                      onClick={() => setExamType(typeOpt)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate ${
                        examType === typeOpt
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {typeOpt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {examType === 'Custom' && (
              <div>
                <label
                  htmlFor="examprep-custom-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Custom Assessment Name
                </label>
                <input
                  id="examprep-custom-name"
                  type="text"
                  value={customExamName}
                  onChange={(e) => setCustomExamName(e.target.value)}
                  placeholder="e.g., Quiz 2, Supplementary Exam, Practical Assessment..."
                  className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2 bg-white! text-slate-900! border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>
            )}

            {/* Step 3: Exam Date (Optional) & Daily Study Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="examprep-date-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  3. Exam Date (Optional — leave blank for flexible sessions)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="examprep-date-input"
                    type="date"
                    value={examDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setExamDate(e.target.value)}
                    disabled={isGeneratingPlan}
                    className="flex-1 text-xs sm:text-sm rounded-xl px-3 py-2 bg-white! text-slate-900! border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                  {examDate && (
                    <button
                      type="button"
                      onClick={() => setExamDate('')}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="examprep-study-time"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  4. Available Study Time per Day
                </label>
                <select
                  id="examprep-study-time"
                  value={dailyStudyMinutes}
                  onChange={(e) => setDailyStudyMinutes(Number(e.target.value))}
                  disabled={isGeneratingPlan}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {DAILY_STUDY_TIME_OPTIONS.map((opt) => (
                    <option key={opt.minutes} value={opt.minutes}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 5: Current Confidence Level */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                5. Current Confidence Level
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CONFIDENCE_OPTIONS.map((opt) => {
                  const isSelected = confidenceLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isGeneratingPlan}
                      onClick={() => setConfidenceLevel(opt.value)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Preparation Goal & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="examprep-goal-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  6. Preparation Goal
                </label>
                <input
                  id="examprep-goal-input"
                  type="text"
                  value={preparationGoal}
                  onChange={(e) => setPreparationGoal(e.target.value)}
                  disabled={isGeneratingPlan}
                  placeholder="Describe your main preparation goal..."
                  className="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 bg-white! text-slate-900! border border-slate-200 focus:outline-none focus:border-blue-600"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PREP_GOAL_SUGGESTIONS.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreparationGoal(g)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        preparationGoal === g
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-semibold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                      }`}
                    >
                      {g.slice(0, 48)}...
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="examprep-language-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Language
                </label>
                <select
                  id="examprep-language-select"
                  value={prepLanguage}
                  onChange={(e) => setPrepLanguage(e.target.value)}
                  disabled={isGeneratingPlan}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {EXAM_PREP_LANGUAGES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {isLoadingMaterials
                    ? 'Checking authorized VENUE course materials...'
                    : courseMaterials.length > 0
                    ? `Analyzes ${courseMaterials.length} authorized course material(s) & past papers`
                    : 'Uses verified university syllabus structure'}
                </span>
              </div>

              {isGeneratingPlan ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Analyzing course & building revision plan...</span>
                </div>
              ) : (
                <button
                  id="btn-create-exam-prep-plan"
                  type="button"
                  onClick={handleGenerateExamPrepPlan}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build Exam Preparation Plan</span>
                </button>
              )}
            </div>
          </div>

          {/* Saved Exam Preparation Plans */}
          {savedExamPrepSessions.length > 0 && (
            <div className="pt-5 border-t border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Saved Exam Preparation Plans
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedExamPrepSessions.map((sess) => (
                  <button
                    key={sess.sessionId}
                    type="button"
                    onClick={() => handleOpenSavedExamPrep(sess)}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50/70 text-left transition-all cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {sess.courseCode || 'Course'}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {sess.topic}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Progress: {sess.progress?.percentComplete || 0}%
                        {sess.metadata?.examDate ? ` · Exam: ${sess.metadata.examDate}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: MOCK EXAM CONFIGURATION SCREEN (Section 10 & 11)
  // ============================================================================
  if (viewStage === 'mock_config') {
    const allTopicNames = activePlan.priorityTopics.map((t) => t.topic);

    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                  {activePlan.courseCode}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Configure Mock Exam
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Simulate exam conditions with hidden answers until submission and automatic scoring.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewStage('dashboard')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>

          {errorBanner && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between">
              <span>{errorBanner}</span>
              <button
                type="button"
                onClick={handleStartMockExam}
                className="px-2.5 py-1 rounded-lg bg-white text-red-700 border border-red-200 font-semibold text-xs cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div className="space-y-5">
            {/* Topics Multi-select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  1. Topics Included ({mockSelectedTopics.length} selected)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMockSelectedTopics(
                      mockSelectedTopics.length === allTopicNames.length ? [] : allTopicNames
                    )
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {mockSelectedTopics.length === allTopicNames.length
                    ? 'Clear Selection'
                    : 'Select All Topics'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTopicNames.map((tName) => {
                  const isChecked = mockSelectedTopics.includes(tName);
                  return (
                    <button
                      key={tName}
                      type="button"
                      onClick={() =>
                        setMockSelectedTopics((prev) =>
                          prev.includes(tName)
                            ? prev.filter((item) => item !== tName)
                            : [...prev, tName]
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-400'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      <span>{tName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of Questions & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2. Number of Questions
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {MOCK_QUESTION_COUNT_OPTIONS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setMockQuestionCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        mockQuestionCount === cnt
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  3. Exam Duration
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {MOCK_DURATION_OPTIONS.map((dOpt) => (
                    <button
                      key={dOpt.minutes}
                      type="button"
                      onClick={() => setMockDurationMinutes(dOpt.minutes)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        mockDurationMinutes === dOpt.minutes
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {dOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty & Question Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  4. Difficulty
                </label>
                <select
                  value={mockDifficulty}
                  onChange={(e) => setMockDifficulty(e.target.value as AILearningDifficulty)}
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200"
                >
                  <option value="adaptive">Mixed (Exam Realistic)</option>
                  <option value="foundational">Beginner / Foundational</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  5. Question Types
                </label>
                <select
                  value={mockQuestionType}
                  onChange={(e) =>
                    setMockQuestionType(e.target.value as AIAssessmentQuestionType)
                  }
                  className="venue-tutor-select w-full text-xs sm:text-sm rounded-xl px-3 py-2.5 font-medium text-slate-800 border border-slate-200"
                >
                  <option value="mixed">Mixed (Multiple Choice, Numerical, Short Answer)</option>
                  <option value="multiple_choice">Multiple Choice Only</option>
                  <option value="numerical">Numerical Calculations Only</option>
                  <option value="short_answer">Short Answer Only</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              {isGeneratingMock ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Generating {mockQuestionCount}-question Mock Exam...</span>
                </div>
              ) : (
                <button
                  id="btn-start-mock-exam"
                  type="button"
                  onClick={handleStartMockExam}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Mock Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: ACTIVE MOCK EXAM EXPERIENCE (Sections 12 & 13)
  // ============================================================================
  if (viewStage === 'mock_taking' && activeMockExam) {
    const totalQuestions = activeMockExam.questions.length;
    const currentQ = activeMockExam.questions[mockCurrentIndex] || activeMockExam.questions[0];
    const currentAnswer = activeMockExam.answers[currentQ.questionId] || '';
    const answeredCount = activeMockExam.questions.filter((q) =>
      Boolean((activeMockExam.answers[q.questionId] || '').trim())
    ).length;
    const unansweredCount = totalQuestions - answeredCount;

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
        {/* Top Exam Header with Visible Timer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                Mock Exam · {activePlan.courseCode}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Question {mockCurrentIndex + 1} of {totalQuestions}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Answered: <strong className="text-slate-800">{answeredCount}</strong>/{totalQuestions}
              {unansweredCount > 0 && (
                <span className="ml-2 text-amber-700 font-medium">
                  ({unansweredCount} unanswered)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {remainingSeconds !== null && (
              <div
                aria-label="Exam Timer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold border ${
                  remainingSeconds <= 180
                    ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                    : 'bg-white text-slate-900 border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Timer: {formatTimerMMSS(remainingSeconds)}</span>
              </div>
            )}

            <button
              id="btn-submit-mock-exam"
              type="button"
              onClick={handleRequestSubmitMockExam}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Question Navigation Bar & Unanswered Filter */}
        <div className="px-4 sm:px-6 py-2 border-b border-slate-100 flex items-center justify-between gap-2 bg-white overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {activeMockExam.questions.map((q, idx) => {
              const hasAns = Boolean((activeMockExam.answers[q.questionId] || '').trim());
              if (showUnansweredOnlyFilter && hasAns && idx !== mockCurrentIndex) {
                return null;
              }
              const isCurrent = idx === mockCurrentIndex;
              return (
                <button
                  key={q.questionId}
                  type="button"
                  onClick={() => setMockCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    hasAns
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  } ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {unansweredCount > 0 && (
            <button
              type="button"
              onClick={() => setShowUnansweredOnlyFilter((prev) => !prev)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 cursor-pointer ${
                showUnansweredOnlyFilter
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {showUnansweredOnlyFilter
                ? 'Show All Questions'
                : `Review Unanswered (${unansweredCount})`}
            </button>
          )}
        </div>

        {/* Question Body (Answers Hidden Until Submission) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                {currentQ.questionType === 'multiple_choice'
                  ? 'Multiple Choice'
                  : currentQ.questionType === 'numerical'
                  ? 'Numerical'
                  : 'Short Answer'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                {currentQ.topic}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 text-slate-900 text-sm sm:text-base leading-relaxed">
              <MathRenderer content={currentQ.questionText} />
            </div>

            {currentQ.questionType === 'multiple_choice' &&
            Array.isArray(currentQ.options) ? (
              <div className="space-y-2.5" role="radiogroup" aria-label="Mock Exam Options">
                {currentQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={`${currentQ.questionId}_mockopt_${idx}`}
                      type="button"
                      onClick={() => handleSelectMockAnswer(currentQ.questionId, opt)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 text-slate-900 ring-1 ring-indigo-600/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {letter}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm leading-relaxed min-w-0">
                        <MathRenderer content={opt} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {currentQ.questionType === 'numerical'
                    ? 'Your Numerical or Mathematical Answer:'
                    : 'Your Written Answer:'}
                </label>
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleSelectMockAnswer(currentQ.questionId, e.target.value)}
                  placeholder={
                    currentQ.questionType === 'numerical'
                      ? 'Enter value or fraction (e.g., 0.5, 3/8)...'
                      : 'Type your concise answer...'
                  }
                  className="w-full text-sm rounded-xl px-4 py-3 bg-white! text-slate-900! border border-slate-300 focus:outline-none focus:border-indigo-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Exam Navigation */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={mockCurrentIndex === 0}
            onClick={() => setMockCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {mockCurrentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() =>
                setMockCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestSubmitMockExam}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Submit Exam</span>
            </button>
          )}
        </div>

        {/* Submission Safety Confirmation Modal (Section 13) */}
        {showSubmitConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Unanswered Questions Remaining
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    You have <strong>{unansweredCount}</strong> unanswered{' '}
                    {unansweredCount === 1 ? 'question' : 'questions'}. Submit anyway?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Return to exam
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeMockExamSubmission}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Submit anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // VIEW 4: MOCK EXAM RESULTS & QUESTION REVIEW (Sections 14 & 15)
  // ============================================================================
  if (viewStage === 'mock_results' && activeMockExam) {
    const score = activeMockExam.score ?? 0;
    const total = activeMockExam.questions.length;
    const pct = activeMockExam.percentage ?? 0;
    const strongAreas = activeMockExam.strongAreas || [];
    const needsReview = activeMockExam.needsReviewAreas || [];

    const mockSources =
      activeMockExam.groundedInMaterials &&
      Array.isArray(activeMockExam.referencedMaterials) &&
      activeMockExam.referencedMaterials.length > 0
        ? activeMockExam.referencedMaterials
        : [];

    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Mock Exam Complete Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  Mock Exam Complete
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {activePlan.courseCode}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Score: {score}/{total} ({pct}%)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {activeMockExam.recommendedNextStep}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white p-4 rounded-xl border border-slate-200/80">
              <div className="text-center">
                <div
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    pct >= 75
                      ? 'text-emerald-600'
                      : pct >= 50
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {pct}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Percentage</div>
              </div>
            </div>
          </div>

          {/* Strong Areas & Needs Review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strong Areas</span>
              </div>
              {strongAreas.length > 0 ? (
                <ul className="space-y-1 text-xs sm:text-sm text-slate-800 list-disc list-inside">
                  {strongAreas.map((t, i) => (
                    <li key={i} className="font-medium">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  Review the explanations below and retry a targeted practice set.
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Target className="w-4 h-4 text-amber-600" />
                <span>Needs Review</span>
              </div>
              {needsReview.length > 0 ? (
                <ul className="space-y-1 text-xs sm:text-sm text-slate-800 list-disc list-inside">
                  {needsReview.map((t, i) => (
                    <li key={i} className="font-medium">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600">
                  Strong accuracy across all tested topics in this mock exam.
                </p>
              )}
            </div>
          </div>

          {/* Recommended Next Steps Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setViewStage('dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <span>Return to Exam Prep Dashboard</span>
            </button>

            {needsReview.length > 0 && onLaunchStudyModeForTopic && (
              <button
                type="button"
                onClick={() =>
                  onLaunchStudyModeForTopic(
                    activePlan.courseCode,
                    needsReview[0],
                    'intermediate'
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Review &ldquo;{needsReview[0]}&rdquo; in Study Mode</span>
              </button>
            )}

            {needsReview.length > 0 && onLaunchPracticeModeForTopic && (
              <button
                type="button"
                onClick={() =>
                  onLaunchPracticeModeForTopic(
                    activePlan.courseCode,
                    needsReview[0],
                    'intermediate'
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Practice &ldquo;{needsReview[0]}&rdquo;</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenMockExamConfig}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Mock Exam</span>
            </button>
          </div>

          {/* Honest Sources Display */}
          {mockSources.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Sources Used in This Mock Exam
              </span>
              <div className="flex flex-wrap gap-1.5">
                {mockSources.map((src, idx) => (
                  <button
                    key={`${src.materialId}_${idx}`}
                    type="button"
                    onClick={() => handleClickSource(src)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium cursor-pointer"
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

          {/* Individual Question Review (Section 15) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Individual Question Review ({total})
            </h4>

            <div className="space-y-3">
              {activeMockExam.questions.map((q, idx) => {
                const att = activeMockExam.attempts?.[q.questionId];
                const isCorrect = Boolean(att?.isCorrect);
                const fup = reviewFollowupByQuestionId[q.questionId];

                return (
                  <div
                    key={q.questionId}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isCorrect
                        ? 'bg-white border-slate-200'
                        : 'bg-red-50/20 border-red-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {q.topic}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                          {q.difficulty === 'foundational' ? 'Beginner' : q.difficulty}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <Check className="w-3 h-3" /> Correct
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Incorrect
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
                          isCorrect
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
                            <span className="italic text-slate-400">Unanswered</span>
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
                          disabled={fup?.loading}
                          onClick={() => handleExplainMockQuestion(q, idx + 1, 'explain')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                        >
                          {fup?.loading ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          ) : (
                            <HelpCircle className="w-3 h-3 text-blue-600" />
                          )}
                          <span>Explain Question {idx + 1}</span>
                        </button>

                        <button
                          type="button"
                          disabled={fup?.loading}
                          onClick={() => handleExplainMockQuestion(q, idx + 1, 'diagram')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>Show by diagram</span>
                        </button>

                        <button
                          type="button"
                          disabled={fup?.loading}
                          onClick={() => handleExplainMockQuestion(q, idx + 1, 'graph')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                        >
                          <BarChart2 className="w-3 h-3 text-slate-600" />
                          <span>Draw the graph</span>
                        </button>
                      </div>

                      {fup?.explanationMarkdown && (
                        <div className="mt-2 p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 text-slate-800 space-y-2">
                          <div className="font-bold text-blue-900">{fup.title}</div>
                          <SafeRenderErrorBoundary
                            mode="EXAM_PREP"
                            messageId={`${q.questionId}-fup`}
                            rawText={recoverStructuredTextIfRawJson(fup.explanationMarkdown).text}
                          >
                            <MathRenderer
                              content={recoverStructuredTextIfRawJson(fup.explanationMarkdown).text}
                            />
                          </SafeRenderErrorBoundary>
                          {fup.chartData && (
                            <SafeRenderErrorBoundary
                              mode="EXAM_PREP"
                              messageId={`${q.questionId}-fup-chart`}
                              rawText=""
                            >
                              <AIChartViewer chartData={fup.chartData} />
                            </SafeRenderErrorBoundary>
                          )}
                          {sanitizeDiagramSvg(fup.diagramSvg) && (
                            <div
                              className="venue-svg-diagram-card my-2 p-3 rounded-xl bg-white border border-slate-200 overflow-x-auto flex justify-center"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeDiagramSvg(fup.diagramSvg)!,
                              }}
                            />
                          )}
                        </div>
                      )}
                      {fup?.error && <p className="text-xs text-red-600">{fup.error}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 5: EXAM PREPARATION DASHBOARD (Sections 4, 5, 6, 7, 8, 9, 16–20)
  // ============================================================================
  const daysRemaining = calculateDaysRemaining(activePlan.examDate);
  const totalPriority = Math.max(1, activePlan.priorityTopics.length);
  const completedPriorityCount = activePlan.priorityTopics.filter(
    (t) => t.status === 'completed'
  ).length;
  const totalPlanDays = Math.max(1, activePlan.revisionPlan.length);
  const completedPlanDaysCount = activePlan.revisionPlan.filter((d) => d.completed).length;
  const completedMocks = activePlan.mockExams.filter((m) => m.status === 'completed');

  const overallPrepProgress = Math.min(
    100,
    Math.round(
      ((completedPriorityCount / totalPriority) * 0.5 +
        (completedPlanDaysCount / totalPlanDays) * 0.3 +
        (completedMocks.length > 0 ? 0.2 : 0)) *
        100
    )
  );

  // Combine weak areas from Mock Exams + recent course Practice/Quizzes
  const latestMock = completedMocks[completedMocks.length - 1];
  const combinedWeakAreas = Array.from(
    new Set([
      ...(latestMock?.needsReviewAreas || []),
      ...(performanceSignals.weakTopics || []),
    ])
  );
  const combinedCompletedAreas = Array.from(
    new Set([
      ...activePlan.priorityTopics
        .filter((t) => t.status === 'completed')
        .map((t) => t.topic),
      ...(latestMock?.strongAreas || []),
      ...(performanceSignals.strongTopics || []),
    ])
  );

  const planSources = activePlan.groundedInMaterials
    ? filterValidCitations(activePlan.referencedMaterials)
    : [];

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Section 5: Clean Exam Preparation Dashboard Header */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  Course: {activePlan.courseCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700">
                  Exam:{' '}
                  {activePlan.examType === 'Custom' && activePlan.customExamName
                    ? activePlan.customExamName
                    : activePlan.examType}
                </span>
                {activePlan.examDate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <Calendar className="w-3 h-3" />
                    <span>Exam Date: {activePlan.examDate}</span>
                    {daysRemaining !== null && (
                      <strong className="ml-1">
                        ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining)
                      </strong>
                    )}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                {activePlan.courseTitle
                  ? `${activePlan.courseCode} — ${activePlan.courseTitle}`
                  : `${activePlan.courseCode} Exam Preparation`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {activePlan.overviewSummary}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewStage('setup')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Adjust Setup</span>
              </button>
            </div>
          </div>

          {/* Preparation Progress Bar & Quick Launch Bar */}
          <div className="pt-2 border-t border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Preparation Progress: <strong>{overallPrepProgress}%</strong>
              </span>
              <span className="text-slate-500">
                {completedPriorityCount}/{activePlan.priorityTopics.length} Topics Reviewed ·{' '}
                {completedMocks.length} Mock {completedMocks.length === 1 ? 'Exam' : 'Exams'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${overallPrepProgress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                id="btn-launch-mock-exam"
                type="button"
                onClick={handleOpenMockExamConfig}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Start Mock Exam</span>
              </button>

              {onLaunchPracticeModeForTopic && (
                <button
                  type="button"
                  onClick={() =>
                    onLaunchPracticeModeForTopic(
                      activePlan.courseCode,
                      combinedWeakAreas[0] ||
                        activePlan.priorityTopics[0]?.topic ||
                        activePlan.courseCode,
                      'adaptive'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Practice Questions</span>
                </button>
              )}

              {onLaunchQuizGeneratorForTopic && (
                <button
                  type="button"
                  onClick={() =>
                    onLaunchQuizGeneratorForTopic(
                      activePlan.courseCode,
                      activePlan.priorityTopics[0]?.topic || activePlan.courseCode,
                      'intermediate'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Generate Topic Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 20 & 17: Adaptive Recommendations & Past Paper / Material Insights */}
        {(activePlan.adaptiveRecommendationNote ||
          performanceSignals.recommendationSummary ||
          activePlan.pastPaperInsights) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(activePlan.adaptiveRecommendationNote ||
              performanceSignals.recommendationSummary) && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80 text-xs text-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Adaptive Study Recommendation</span>
                </div>
                <p className="leading-relaxed">
                  {activePlan.adaptiveRecommendationNote ||
                    performanceSignals.recommendationSummary}
                </p>
              </div>
            )}

            {activePlan.pastPaperInsights && (
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs text-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Course Material & Past Paper Patterns</span>
                </div>
                <p className="leading-relaxed">{activePlan.pastPaperInsights}</p>
              </div>
            )}
          </div>
        )}

        {/* Section 5: Weak Areas & Completed Areas Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Weak Areas / Topics Needing Review
            </span>
            {combinedWeakAreas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {combinedWeakAreas.map((w, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Complete a practice set or mock exam to detect weak areas.
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
              Completed / Strong Areas
            </span>
            {combinedCompletedAreas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {combinedCompletedAreas.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium"
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Mark topics as reviewed below or complete a revision session.
              </p>
            )}
          </div>
        </div>

        {/* Section 4, 7, 8, 9: Topics to Prioritize (with Study, Practice, Quiz integrations) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              Topics to Prioritize ({activePlan.priorityTopics.length})
            </h4>
            <span className="text-[11px] text-slate-500">
              Evidence-based priority from course structure & materials
            </span>
          </div>

          <div className="space-y-3">
            {activePlan.priorityTopics.map((item) => {
              const isDone = item.status === 'completed';
              const priorityBadge =
                item.priority === 'high'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : item.priority === 'medium'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              const prepLevelLabel =
                item.recommendedPreparationLevel === 'foundational'
                  ? 'Beginner'
                  : item.recommendedPreparationLevel === 'advanced'
                  ? 'Advanced'
                  : 'Intermediate';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isDone
                      ? 'bg-emerald-50/20 border-emerald-200'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-slate-900">{item.topic}</h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${priorityBadge}`}
                        >
                          {item.priority} Priority
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          Recommended: {prepLevelLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.whyItMatters}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePriorityTopicStatus(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border shrink-0 cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isDone ? '✓ Reviewed' : 'Mark Reviewed'}
                    </button>
                  </div>

                  {item.subtopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.subtopics.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.keyDefinitionsAndFormulas &&
                    item.keyDefinitionsAndFormulas.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 text-xs text-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Key Concepts & Formulas
                        </span>
                        {item.keyDefinitionsAndFormulas.map((formulaStr, fIdx) => (
                          <div key={fIdx}>
                            <MathRenderer content={formulaStr} />
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Honest Topic Source Citations (ONLY if genuinely used - Section 4 & 16) */}
                  {activePlan.groundedInMaterials &&
                    item.sourceReferences &&
                    item.sourceReferences.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Source:
                        </span>
                        {item.sourceReferences.map((src, sIdx) => (
                          <button
                            key={`${src.materialId}_${sIdx}`}
                            type="button"
                            onClick={() => handleClickSource(src)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-medium cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>
                              {src.title}
                              {src.pageReferences && src.pageReferences.length > 0
                                ? ` (p. ${src.pageReferences.join(', ')})`
                                : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Sections 7, 8, 9: Connect directly to AI Study Mode, Practice Mode, and Quiz Generator */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {onLaunchStudyModeForTopic && (
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchStudyModeForTopic(
                            activePlan.courseCode,
                            item.topic,
                            item.recommendedPreparationLevel
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                        <span>Study Topic</span>
                      </button>
                    )}

                    {onLaunchPracticeModeForTopic && (
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchPracticeModeForTopic(
                            activePlan.courseCode,
                            item.topic,
                            item.recommendedPreparationLevel
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Target className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Practice This Topic</span>
                      </button>
                    )}

                    {onLaunchQuizGeneratorForTopic && (
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchQuizGeneratorForTopic(
                            activePlan.courseCode,
                            item.topic,
                            item.recommendedPreparationLevel
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <ListChecks className="w-3.5 h-3.5 text-slate-600" />
                        <span>Generate Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6: Personalized Revision Plan */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              Recommended Study Plan ({activePlan.dailyStudyMinutes} mins/day)
            </h4>
            <span className="text-[11px] text-slate-500">
              {completedPlanDaysCount} of {activePlan.revisionPlan.length} completed
            </span>
          </div>

          <div className="space-y-2.5">
            {activePlan.revisionPlan.map((day) => (
              <div
                key={day.dayIndex}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  day.completed
                    ? 'bg-emerald-50/20 border-emerald-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-900 text-white">
                      {day.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {day.focusTopic}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {day.estimatedMinutes} mins
                    </span>
                  </div>

                  {day.subtopics.length > 0 && (
                    <div className="text-xs text-slate-600">
                      <strong>Focus:</strong> {day.subtopics.join(' · ')}
                    </div>
                  )}

                  {day.activities.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {day.activities.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onLaunchStudyModeForTopic && (
                    <button
                      type="button"
                      onClick={() =>
                        onLaunchStudyModeForTopic(
                          activePlan.courseCode,
                          day.focusTopic,
                          'intermediate'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold cursor-pointer"
                    >
                      Start Revision
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleRevisionDayCompleted(day.dayIndex)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      day.completed
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {day.completed ? '✓ Done' : 'Mark Done'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Mock Exams History */}
        {completedMocks.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              Completed Mock Exams ({completedMocks.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {completedMocks.map((m, idx) => (
                <button
                  key={m.mockExamId}
                  type="button"
                  onClick={() => {
                    setActiveMockExam(m);
                    setViewStage('mock_results');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white flex items-center justify-between text-left cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Mock Exam #{idx + 1} · Score: {m.score}/{m.questionCount} ({m.percentage}%)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {m.durationMinutes > 0 ? `${m.durationMinutes} mins` : 'Untimed'} · Click to review questions
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 16: Honest Exam Preparation Sources */}
        {planSources.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Sources Used for This Exam Preparation Plan
            </span>
            <div className="flex flex-wrap gap-1.5">
              {planSources.map((src, idx) => (
                <button
                  key={`${src.materialId}_${idx}`}
                  type="button"
                  onClick={() => handleClickSource(src)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium cursor-pointer"
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
      </div>
    </div>
  );
};
