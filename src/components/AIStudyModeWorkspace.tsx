import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  XCircle,
  Loader2,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Layers,
  ListChecks,
  Compass,
  Clock,
  RefreshCw,
  CheckCircle2,
  Play,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AcademicMaterialRecord,
  AILearningDifficulty,
  AILearningSession,
  AIMessage,
  AIStudyLearningGoal,
  Course,
  StudentProfile,
} from '../types';
import { MathRenderer, MathBlock } from './MathRenderer';
import { AIChartViewer } from './AIChartViewer';
import {
  SafeRenderErrorBoundary,
  aiRenderTelemetry,
  filterValidCitations,
  isLegacyFormattingFalseError,
  recoverStructuredTextIfRawJson,
  sanitizeDiagramSvg,
} from '../utils/aiResponseRenderPipeline';
import {
  AIVoiceMicButton,
  AIVoiceStatusBanner,
  AIReadAloudControl,
} from './AIVoiceTutorControls';
import { aiVoiceTutorService, AIVoiceInputState } from '../services/aiVoiceTutorService';
import { aiTutorMaterialContextService } from '../services/aiTutorMaterialContextService';
import { aiTutorFoundationService } from '../services/aiTutorFoundationService';
import { analyticsTracker } from '../services/analyticsTrackerService';

interface AIStudyModeWorkspaceProps {
  courses: Course[];
  initialCourse?: Course | null;
  initialTopic?: string;
  initialDifficulty?: AILearningDifficulty;
  selectedCourseContext: string;
  onChangeCourseContext: (courseCode: string) => void;
  languagePreference: string;
  onChangeLanguagePreference: (lang: string) => void;
  profile?: StudentProfile;
  studentName?: string;
  userId: string;
  onOpenMaterialViewer?: (material: AcademicMaterialRecord, initialPage?: number) => void;
  onExitToChat: () => void;
}

const STUDY_LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto (Detect Language)' },
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
  { value: 'French', label: 'Français' },
  { value: 'Spanish', label: 'Español' },
  { value: 'Arabic', label: 'العربية' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Hindi', label: 'हिन्दी' },
  { value: 'Chinese', label: '中文' },
];

const DIFFICULTY_OPTIONS: Array<{
  id: AILearningDifficulty;
  label: string;
  subtitle: string;
}> = [
  {
    id: 'foundational',
    label: 'Beginner',
    subtitle: 'Intuition-first with accessible step-by-step explanations',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    subtitle: 'Standard university rigor with formal definitions & examples',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    subtitle: 'Full mathematical proofs, derivations & edge cases',
  },
];

const LEARNING_GOAL_OPTIONS: Array<{
  id: AIStudyLearningGoal;
  label: string;
  description: string;
}> = [
  {
    id: 'understand_concept',
    label: 'Understand the concept',
    description: 'Build clear intuition and formal conceptual mastery',
  },
  {
    id: 'prepare_exam',
    label: 'Prepare for an exam',
    description: 'Focus on high-yield formulas, derivations, and exam questions',
  },
  {
    id: 'learn_step_by_step',
    label: 'Learn step-by-step',
    description: 'Guided breakdown from first principles with checkpoints',
  },
  {
    id: 'review_quickly',
    label: 'Review quickly',
    description: 'Structured revision of core definitions and key formulas',
  },
];

const STUDY_QUICK_ACTIONS: Array<{
  id: string;
  label: string;
}> = [
  { id: 'explain_simpler', label: 'Explain simpler' },
  { id: 'give_example', label: 'Give me an example' },
  { id: 'show_formula', label: 'Show formula' },
  { id: 'ask_question', label: 'Ask me a question' },
  { id: 'test_understanding', label: 'Test my understanding' },
  { id: 'show_diagram', label: 'Show diagram' },
  { id: 'next_subtopic', label: 'Next subtopic' },
  { id: 'summarize_learned', label: 'Summarize what we learned' },
];

export const AIStudyModeWorkspace: React.FC<AIStudyModeWorkspaceProps> = ({
  courses,
  initialCourse,
  initialTopic,
  initialDifficulty,
  selectedCourseContext,
  onChangeCourseContext,
  languagePreference,
  onChangeLanguagePreference,
  profile,
  studentName,
  userId,
  onOpenMaterialViewer,
  onExitToChat,
}) => {
  // Setup vs Active Lesson view
  const [viewStage, setViewStage] = useState<'setup' | 'lesson'>('setup');

  // Setup configuration state
  const [studyCourseCode, setStudyCourseCode] = useState<string>(() => {
    if (selectedCourseContext && selectedCourseContext !== 'All Courses') {
      return selectedCourseContext;
    }
    if (initialCourse?.code) return initialCourse.code;
    return courses[0]?.code || 'All Courses';
  });
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || '');
  const [customTopicInput, setCustomTopicInput] = useState<string>(initialTopic || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<AILearningDifficulty>(
    initialDifficulty || 'intermediate'
  );
  const [learningGoal, setLearningGoal] = useState<AIStudyLearningGoal>('understand_concept');

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

  // Authorized materials for the selected course
  const [courseMaterials, setCourseMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);

  // Saved / Resumable Study Sessions
  const [savedStudySessions, setSavedStudySessions] = useState<AILearningSession[]>([]);
  const [activeSession, setActiveSession] = useState<AILearningSession | null>(null);

  // Active lesson conversation & progress
  const [lessonMessages, setLessonMessages] = useState<AIMessage[]>([]);
  const [streamingMsg, setStreamingMsg] = useState<AIMessage | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [studentInput, setStudentInput] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const [voiceInputStatus, setVoiceInputStatus] = useState<{
    state: AIVoiceInputState;
    interimText: string;
    notice: string | null;
    isError: boolean;
  }>({
    state: 'ready',
    interimText: '',
    notice: null,
    isError: false,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const streamingMsgRef = useRef<AIMessage | null>(null);
  const activeMessagesRef = useRef<AIMessage[]>(lessonMessages);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    activeMessagesRef.current = lessonMessages;
  }, [lessonMessages]);

  // Keep parent course context aligned when changed in Study Mode
  const handleCourseSelect = (code: string) => {
    setStudyCourseCode(code);
    onChangeCourseContext(code);
    setSelectedTopic('');
    setSelectedMaterialId('');
  };

  // Current selected course object
  const activeCourseObj = useMemo(() => {
    return courses.find(
      (c) => c.code.trim().toUpperCase() === studyCourseCode.trim().toUpperCase()
    );
  }, [courses, studyCourseCode]);

  // Load authorized materials for the chosen course
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMaterials(true);
    aiTutorMaterialContextService
      .fetchAuthorizedMaterials(profile, courses, studyCourseCode, activeCourseObj || initialCourse)
      .then((mats) => {
        if (!isMounted) return;
        setCourseMaterials(mats);
      })
      .catch(() => {
        if (isMounted) setCourseMaterials([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMaterials(false);
      });
    return () => {
      isMounted = false;
    };
  }, [studyCourseCode, profile?.uid, profile?.programmeId, courses.length]);

  // Load recent Study Mode sessions & auto-detect resumable session
  useEffect(() => {
    let isMounted = true;
    aiTutorFoundationService
      .listUserLearningSessions(userId, { mode: 'STUDY', limitCount: 10 })
      .then(({ sessions }) => {
        if (!isMounted) return;
        setSavedStudySessions(sessions);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [userId, viewStage]);

  // Extract structured topic suggestions from syllabus + authorized materials
  const suggestedTopics = useMemo(() => {
    const topics: Array<{
      id: string;
      title: string;
      sourceLabel: string;
      materialId?: string;
    }> = [];

    if (activeCourseObj && Array.isArray(activeCourseObj.syllabus)) {
      for (const s of activeCourseObj.syllabus) {
        if (s?.title) {
          topics.push({
            id: `syl_${s.week}_${s.title}`,
            title: s.title,
            sourceLabel: `Week ${s.week} Syllabus`,
          });
        }
      }
    }

    for (const mat of courseMaterials) {
      if (mat?.title) {
        topics.push({
          id: `mat_${mat.id}`,
          title: mat.title,
          sourceLabel: `${mat.materialType || 'Course Material'}`,
          materialId: mat.id,
        });
      }
    }

    return topics.slice(0, 12);
  }, [activeCourseObj, courseMaterials]);

  const clearRevealTimer = () => {
    if (revealTimerRef.current !== null) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRevealTimer();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distance < 140;
    setShowScrollToBottom(distance > 180);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth', force = false) => {
    if (!force && !isNearBottomRef.current) return;
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
      if (force) {
        isNearBottomRef.current = true;
        setShowScrollToBottom(false);
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (viewStage === 'lesson') {
      scrollToBottom('smooth', false);
    }
  }, [lessonMessages.length, isGenerating, Boolean(streamingMsg?.text), viewStage]);

  const buildCleanCopyText = (msg: AIMessage): string => {
    const parts: string[] = [];
    if (msg.studyMetadata?.lessonSection) {
      parts.push(msg.studyMetadata.lessonSection);
    }
    const mainText = (msg.text || '').trim();
    if (mainText) parts.push(mainText);
    if (msg.formula && !mainText.includes(msg.formula.trim())) {
      parts.push(`$$${msg.formula.trim()}$$`);
    }
    if (Array.isArray(msg.steps) && msg.steps.length > 0) {
      const formattedSteps = msg.steps
        .map((step, idx) => {
          const clean = step
            .replace(/^\s*(?:\*\*?)?Step\s+\d+\s*[:.)\-]?(?:\*\*?)?\s*/i, '')
            .trim();
          return `Step ${idx + 1}: ${clean || step}`;
        })
        .join('\n');
      parts.push(formattedSteps);
    }
    if (msg.studyMetadata?.checkpointQuestion) {
      parts.push(`Check Your Understanding: ${msg.studyMetadata.checkpointQuestion}`);
    }
    return parts.join('\n\n').trim();
  };

  const handleCopy = (id: string, msg: AIMessage) => {
    navigator.clipboard.writeText(buildCleanCopyText(msg));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearRevealTimer();

    const currentPartial = streamingMsgRef.current;
    const currentMsgs = activeMessagesRef.current;

    if (currentPartial && currentPartial.text.trim().length > 0 && activeSession) {
      const updated = [...currentMsgs, currentPartial];
      setLessonMessages(updated);
      aiTutorFoundationService.saveStudySessionState({
        session: activeSession,
        messages: updated,
        userId,
      });
    }

    streamingMsgRef.current = null;
    setStreamingMsg(null);
    setIsGenerating(false);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const handleOpenCitedSource = (materialId: string, pageNumber?: number) => {
    if (!onOpenMaterialViewer || !materialId) return;
    const found = courseMaterials.find((m) => m.id === materialId);
    if (found) {
      onOpenMaterialViewer(found, pageNumber);
    } else {
      onOpenMaterialViewer(
        {
          id: materialId,
          title: 'Course Material',
          materialType: 'Lecture Notes',
          fileName: 'document.pdf',
          fileUrl: '',
          fileSize: '',
          mimeType: 'application/pdf',
          uploadedBy: 'University Repository',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          universityId: profile?.universityId || 'udsm',
          academicUnitId: profile?.academicUnitId || '',
          departmentId: profile?.departmentId || '',
          programmeId: profile?.programmeId || '',
          yearId: profile?.yearOfStudy || 1,
          semesterId: profile?.semester || 1,
          courseId: studyCourseCode,
        },
        pageNumber
      );
    }
  };

  // Core function to execute a Study Mode turn ('start' | 'student_reply' | 'quick_action')
  const executeStudyTurn = async (params: {
    session: AILearningSession;
    action: 'start' | 'student_reply' | 'quick_action';
    quickActionType?: string;
    userDisplayMessage?: string;
    existingMessages: AIMessage[];
    replaceMessageId?: string;
  }) => {
    const {
      session,
      action,
      quickActionType,
      userDisplayMessage,
      existingMessages,
      replaceMessageId,
    } = params;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearRevealTimer();
    streamingMsgRef.current = null;
    setStreamingMsg(null);

    let updatedMessages = [...existingMessages];

    if (replaceMessageId) {
      const idx = updatedMessages.findIndex((m) => m.id === replaceMessageId);
      if (idx !== -1) {
        updatedMessages = updatedMessages.slice(0, idx);
      }
    } else if (userDisplayMessage && userDisplayMessage.trim()) {
      const userMsg: AIMessage = {
        id: `study-user-${Date.now()}`,
        sender: 'user',
        role: 'user',
        text: userDisplayMessage.trim(),
        content: userDisplayMessage.trim(),
        timestamp: 'Just now',
        courseContext: session.courseCode || studyCourseCode,
      };
      updatedMessages = [...updatedMessages, userMsg];
    }

    setLessonMessages(updatedMessages);
    activeMessagesRef.current = updatedMessages;
    setIsGenerating(true);
    isNearBottomRef.current = true;
    setShowScrollToBottom(false);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // STAGE 10P: Track whether the AI response was already generated so post-response
    // persistence or formatting errors never discard the completed lesson step.
    let generatedAiMsg: AIMessage | null = null;

    try {
      const historyPayload = updatedMessages
        .filter((m) => !m.isError)
        .slice(-14)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.studyMetadata?.checkpointQuestion
            ? `${m.text}\n\nCheckpoint Question: ${m.studyMetadata.checkpointQuestion}`
            : m.text,
        }));

      const academicContext = await aiTutorFoundationService.buildSharedModeContext({
        mode: 'STUDY',
        profile,
        courses,
        selectedCourseContext: session.courseCode || studyCourseCode,
        initialCourse: activeCourseObj || initialCourse,
        userQuery: `${session.topic || ''} ${userDisplayMessage || ''}`.trim(),
        selectedTopic: session.topic,
        activeSessionId: session.sessionId,
        difficulty: session.difficulty,
        learningObjectives: session.learningObjectives,
        includeTutorMemory: true,
      });

      const personalizedMemoryContext = await aiTutorFoundationService.getRelevantPersonalizedMemoryContext({
        userId,
        courseCode: session.courseCode || studyCourseCode,
        courseId: session.courseId || studyCourseCode,
        topic: session.topic,
        userMessage: userDisplayMessage || quickActionType || '',
        mode: 'STUDY',
        authorizedCourseCodes: courses.map((c) => c.code),
      });

      if (quickActionType === 'explain_simpler' || /\b(simpler|simple|rahisi|don'?t understand)\b/i.test(userDisplayMessage || '')) {
        aiTutorFoundationService
          .upsertTopicMasteryMemory({
            userId,
            courseId: session.courseId || studyCourseCode,
            courseCode: session.courseCode || studyCourseCode,
            topic: session.topic || studyCourseCode,
            requestedSimplerExplanation: true,
            preferredStyle: 'visual_intuitive',
            sourceMode: 'STUDY',
          })
          .catch(() => {});
      }

      const response = await fetch('/api/tutor/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          quickActionType,
          topic: session.topic,
          difficulty: session.difficulty,
          learningGoal: session.learningGoal || learningGoal,
          languagePreference: session.language || languagePreference,
          courseContext: session.courseCode || studyCourseCode,
          currentSectionIndex: session.progress?.currentStep || 1,
          totalSections: session.progress?.totalSteps || 5,
          message: userDisplayMessage || '',
          history: historyPayload,
          studentName,
          userId,
          academicContext,
          selectedMaterialId: session.materialIds?.[0] || selectedMaterialId || undefined,
          personalizedMemoryContext,
        }),
        signal: controller.signal,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Failed to generate Study Mode lesson step.');
      }

      const aiData = result.data || {};
      const recovered = recoverStructuredTextIfRawJson(
        (aiData.text || 'Let us continue with this step.').trim()
      );
      const fullText = (recovered.text || 'Let us continue with this step.').trim();
      const validCitations = aiData.groundedInMaterials
        ? filterValidCitations(aiData.referencedMaterials)
        : [];
      const sanitizedSvg = sanitizeDiagramSvg(aiData.diagramSvg || recovered.diagramSvg);
      const secIdx = Math.max(
        1,
        Math.min(
          aiData.totalSections || 5,
          Number(aiData.sectionIndex) || session.progress?.currentStep || 1
        )
      );
      const totSecs = Math.max(3, Number(aiData.totalSections) || session.progress?.totalSteps || 5);

      const aiMsgId = `study-ai-${Date.now()}`;
      const baseAiMsg: AIMessage = {
        id: aiMsgId,
        sender: 'assistant',
        role: 'assistant',
        text: '',
        content: fullText,
        timestamp: 'Just now',
        courseContext: session.courseCode || studyCourseCode,
        originalQuery: userDisplayMessage || `Study: ${session.topic}`,
        referencedMaterials: validCitations.length > 0 ? validCitations : undefined,
        groundedInMaterials: validCitations.length > 0,
        studyMetadata: {
          lessonSection: aiData.lessonSection || `Section ${secIdx}: ${session.topic}`,
          sectionIndex: secIdx,
          totalSections: totSecs,
          learningObjective: aiData.learningObjective || undefined,
          checkpointQuestion: aiData.checkpointQuestion || undefined,
          adaptiveAdjustment: aiData.adaptiveAdjustment || undefined,
        },
      };

      const completedAiMsg: AIMessage = {
        ...baseAiMsg,
        text: fullText,
        formula: aiData.formula || recovered.formula || undefined,
        steps:
          Array.isArray(aiData.steps) && aiData.steps.length > 0
            ? aiData.steps
            : recovered.steps || undefined,
        suggestions:
          Array.isArray(aiData.suggestions) && aiData.suggestions.length > 0
            ? aiData.suggestions
            : recovered.suggestions || undefined,
        chart: aiData.chart || recovered.chart || undefined,
        diagramSvg: sanitizedSvg || undefined,
      };
      generatedAiMsg = completedAiMsg;
      aiRenderTelemetry.recordSuccess('STUDY', aiMsgId);

      // Smooth progressive reveal
      await new Promise<void>((resolve) => {
        let charIdx = 0;
        const stepSize = Math.max(18, Math.ceil(fullText.length / 26));
        const initialPartial = { ...baseAiMsg, text: fullText.slice(0, stepSize) };
        streamingMsgRef.current = initialPartial;
        setStreamingMsg(initialPartial);

        revealTimerRef.current = window.setInterval(() => {
          if (controller.signal.aborted) {
            clearRevealTimer();
            resolve();
            return;
          }
          charIdx += stepSize;
          if (charIdx >= fullText.length) {
            clearRevealTimer();
            streamingMsgRef.current = null;
            setStreamingMsg(null);
            resolve();
          } else {
            const nextPartial = { ...baseAiMsg, text: fullText.slice(0, charIdx) };
            streamingMsgRef.current = nextPartial;
            setStreamingMsg(nextPartial);
          }
        }, 18);
      });

      if (controller.signal.aborted) return;

      const finalMessages = [...updatedMessages, completedAiMsg];
      setLessonMessages(finalMessages);
      activeMessagesRef.current = finalMessages;

      const isCompleted = secIdx >= totSecs && quickActionType === 'summarize_learned';
      try {
        const savedSession = await aiTutorFoundationService.saveStudySessionState({
          session,
          messages: finalMessages,
          currentSectionTitle: completedAiMsg.studyMetadata?.lessonSection,
          sectionIndex: secIdx,
          totalSections: totSecs,
          learningObjective: completedAiMsg.studyMetadata?.learningObjective,
          status: isCompleted ? 'completed' : 'active',
          userId,
        });

        setActiveSession(savedSession);

        // Update course learning progress & personalized tutor memory signal
        await aiTutorFoundationService.recordLearningProgressUpdate({
          userId,
          courseId: session.courseId,
          courseCode: session.courseCode || studyCourseCode,
          topicStudied: session.topic,
          difficultyLevel: session.difficulty,
        });
      } catch (persistErr) {
        console.warn('[Stage 10P] Study session persistence warning (response preserved):', persistErr);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted) return;

      // STAGE 10P: If the AI response was already generated, keep it rather than showing an error card
      if (generatedAiMsg) {
        const preservedMessages = [...updatedMessages, generatedAiMsg];
        setLessonMessages(preservedMessages);
        activeMessagesRef.current = preservedMessages;
        return;
      }

      const normalized = aiTutorFoundationService.normalizeError(err, 'STUDY');
      const errMsg: AIMessage = {
        id: `study-err-${Date.now()}`,
        sender: 'assistant',
        role: 'assistant',
        text: normalized.userMessage,
        content: normalized.userMessage,
        timestamp: 'Just now',
        courseContext: session.courseCode || studyCourseCode,
        isError: true,
        originalQuery: userDisplayMessage || '',
      };

      const finalMessages = [...updatedMessages, errMsg];
      setLessonMessages(finalMessages);
      activeMessagesRef.current = finalMessages;
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    }
  };

  // Start a brand-new Study Mode session
  const handleStartStudySession = async () => {
    const resolvedTopic = (customTopicInput.trim() || selectedTopic.trim()).slice(0, 140);
    if (!resolvedTopic) return;

    analyticsTracker.trackEvent('ai_tutor_query', 'ai_tutor', {
      mode: 'STUDY',
      courseContext: studyCourseCode,
      topic: resolvedTopic,
      difficulty,
      learningGoal,
    });

    const newSession = await aiTutorFoundationService.createLearningSession({
      userId,
      mode: 'STUDY',
      courseId: activeCourseObj?.canonicalCourseId || activeCourseObj?.id || studyCourseCode,
      courseCode: studyCourseCode,
      courseTitle: activeCourseObj?.title,
      topic: resolvedTopic,
      learningGoal,
      materialIds: selectedMaterialId ? [selectedMaterialId] : undefined,
      difficulty,
      language: languagePreference,
      totalSteps: 5,
    });

    setActiveSession(newSession);
    setLessonMessages([]);
    setViewStage('lesson');

    await executeStudyTurn({
      session: newSession,
      action: 'start',
      existingMessages: [],
    });
  };

  // Resume an existing Study Mode session
  const handleResumeSession = (session: AILearningSession) => {
    setActiveSession(session);
    if (session.courseCode) {
      setStudyCourseCode(session.courseCode);
      onChangeCourseContext(session.courseCode);
    }
    if (session.difficulty) setDifficulty(session.difficulty);
    if (session.learningGoal) setLearningGoal(session.learningGoal);
    const msgs = Array.isArray(session.messages) ? session.messages : [];
    setLessonMessages(msgs);
    activeMessagesRef.current = msgs;
    setViewStage('lesson');

    if (msgs.length === 0) {
      executeStudyTurn({
        session,
        action: 'start',
        existingMessages: [],
      });
    }
  };

  // Handle student free-text reply or answer to checkpoint question
  const handleSendStudentReply = async (explicitText?: string, replaceMessageId?: string) => {
    if (!activeSession || isGenerating) return;
    const text = (explicitText !== undefined ? explicitText : studentInput).trim();
    if (!text) return;

    if (explicitText === undefined) {
      setStudentInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }

    await executeStudyTurn({
      session: activeSession,
      action: 'student_reply',
      userDisplayMessage: text,
      existingMessages: lessonMessages,
      replaceMessageId,
    });
  };

  // Handle interactive Study Mode quick actions
  const handleQuickAction = async (actionId: string, label: string) => {
    if (!activeSession || isGenerating) return;
    await executeStudyTurn({
      session: activeSession,
      action: 'quick_action',
      quickActionType: actionId,
      userDisplayMessage: label,
      existingMessages: lessonMessages,
    });
  };

  const renderedMessages = streamingMsg ? [...lessonMessages, streamingMsg] : lessonMessages;
  const effectiveTopicToStart = (customTopicInput.trim() || selectedTopic.trim()).length > 0;

  // ==========================================================================
  // VIEW 1: CLEAN STUDY MODE SETUP SCREEN
  // ==========================================================================
  if (viewStage === 'setup') {
    return (
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 bg-white text-slate-900">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  AI Study Mode
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Interactive step-by-step academic tutoring with guided explanations, worked examples, and understanding checks.
              </p>
            </div>
            <button
              type="button"
              onClick={onExitToChat}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Switch to Standard Chat
            </button>
          </div>

          {/* Resume Active / Recent Study Sessions */}
          {savedStudySessions.filter((s) => Array.isArray(s.messages) && s.messages.length > 0)
            .length > 0 && (
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Continue Previous Study Session</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {savedStudySessions.length} saved
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedStudySessions
                  .filter((s) => Array.isArray(s.messages) && s.messages.length > 0)
                  .slice(0, 2)
                  .map((sess) => (
                    <button
                      key={sess.sessionId}
                      type="button"
                      onClick={() => handleResumeSession(sess)}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-left transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                          <span>{sess.courseCode || 'Course'}</span>
                          <span>·</span>
                          <span>
                            Section {sess.progress?.currentStep || 1} of{' '}
                            {sess.progress?.totalSteps || 5}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                          {sess.topic || 'Study Session'}
                        </p>
                        {sess.currentSectionTitle && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {sess.currentSectionTitle}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center transition-colors">
                        <Play className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Step 1: Course & Language Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="study-mode-course-select"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
              >
                1. Authorized Course
              </label>
              <select
                id="study-mode-course-select"
                value={studyCourseCode}
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
                <option value="All Courses">General / Cross-Course Topic</option>
              </select>
              {courseMaterials.length > 0 ? (
                <p className="mt-1.5 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>
                    {courseMaterials.length} authorized VENUE{' '}
                    {courseMaterials.length === 1 ? 'material' : 'materials'} available for grounding
                  </span>
                </p>
              ) : (
                !isLoadingMaterials && (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Lessons will use syllabus structure and verified academic knowledge.
                  </p>
                )
              )}
            </div>

            <div>
              <label
                htmlFor="study-mode-language-select"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
              >
                Lesson Language
              </label>
              <select
                id="study-mode-language-select"
                value={languagePreference}
                onChange={(e) => onChangeLanguagePreference(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                {STUDY_LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Supports English, Kiswahili, or automatic language matching.
              </p>
            </div>
          </div>

          {/* Step 2: Topic Selection (From Syllabus / Materials OR Custom Topic) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="study-mode-custom-topic-input"
                className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
              >
                2. Select or Enter Topic to Study
              </label>
              {selectedMaterialId && (
                <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Linked to selected course material
                </span>
              )}
            </div>

            {/* Custom topic input */}
            <input
              id="study-mode-custom-topic-input"
              type="text"
              value={customTopicInput}
              onChange={(e) => {
                setCustomTopicInput(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedTopic('');
                }
              }}
              placeholder={
                studyCourseCode && studyCourseCode !== 'All Courses'
                  ? `Enter any topic in ${studyCourseCode} (e.g., Probability Distributions, Matrix Inversion, Hypothesis Testing)...`
                  : 'Enter any academic topic, theorem, or concept you want to master...'
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />

            {/* Available Topics from Course Syllabus & Authorized Materials */}
            {suggestedTopics.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-slate-500">
                  Or choose directly from {studyCourseCode} syllabus & authorized materials:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {suggestedTopics.map((item) => {
                    const isSelected =
                      !customTopicInput.trim() && selectedTopic === item.title;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedTopic(item.title);
                          setCustomTopicInput('');
                          setSelectedMaterialId(item.materialId || '');
                        }}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.sourceLabel}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Difficulty Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Difficulty Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DIFFICULTY_OPTIONS.map((opt) => {
                const active = difficulty === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDifficulty(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 leading-snug ${
                        active ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Learning Goal Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Learning Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEARNING_GOAL_OPTIONS.map((goal) => {
                const active = learningGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setLearningGoal(goal.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-blue-600 bg-blue-50/60 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{goal.label}</span>
                      {active && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{goal.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Interactive Lesson CTA */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="btn-start-study-mode-session"
              type="button"
              disabled={!effectiveTopicToStart}
              onClick={handleStartStudySession}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                effectiveTopicToStart
                  ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Start Interactive Study Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: ACTIVE INTERACTIVE STUDY LESSON WORKSPACE
  // ==========================================================================
  const currentStep = activeSession?.progress?.currentStep || 1;
  const totalSteps = activeSession?.progress?.totalSteps || 5;
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white text-slate-900">
      {/* Study Session Progress & Topic Header Bar */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
            {currentStep}/{totalSteps}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className="text-blue-700 font-bold">
                {activeSession?.courseCode || studyCourseCode}
              </span>
              <span>·</span>
              <span className="capitalize">
                {activeSession?.difficulty === 'foundational'
                  ? 'Beginner'
                  : activeSession?.difficulty || difficulty}
              </span>
              {activeSession?.currentSectionTitle && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline truncate text-slate-600">
                    {activeSession.currentSectionTitle}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {activeSession?.topic || 'Study Session'}
            </h3>
          </div>
        </div>

        {/* Progress Bar & Change Topic Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden md:flex items-center gap-2 w-28">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-600">{progressPercent}%</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isGenerating) handleStopGeneration();
              setViewStage('setup');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Change Study Topic or Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Change Topic</span>
          </button>
        </div>
      </div>

      {/* Interactive Lesson Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-3 sm:px-6 py-5 space-y-6"
      >
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {renderedMessages.map((msg) => {
            const isStreamingThis = Boolean(streamingMsg && msg.id === streamingMsg.id);
            const isUser = msg.sender === 'user';

            if (isUser) {
              return (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="max-w-[88%] sm:max-w-[78%] rounded-2xl bg-slate-100/90 text-slate-900 px-4 py-2.5 text-[14px] sm:text-[15px] leading-relaxed">
                    <div className="whitespace-pre-wrap break-words">
                      <MathRenderer content={msg.text} variant="light" />
                    </div>
                  </div>
                </div>
              );
            }

            const studyMeta = msg.studyMetadata;
            const recoveredMsg = recoverStructuredTextIfRawJson(msg.text || msg.content || '');
            const displayMsgText = recoveredMsg.text || msg.text || '';
            const displayFormula = msg.formula || recoveredMsg.formula;
            const displaySteps =
              msg.steps && msg.steps.length > 0 ? msg.steps : recoveredMsg.steps;
            const displayChart = msg.chart || recoveredMsg.chart;
            const safeSvg = sanitizeDiagramSvg(msg.diagramSvg || recoveredMsg.diagramSvg);
            const validMsgCitations = msg.groundedInMaterials
              ? filterValidCitations(msg.referencedMaterials)
              : [];
            const isActualError = Boolean(msg.isError && !isLegacyFormattingFalseError(msg));

            return (
              <article
                key={msg.id}
                className="w-full pb-6 border-b border-slate-100 last:border-b-0 space-y-4"
              >
                {/* Lesson Section & Learning Objective Header */}
                {studyMeta?.lessonSection && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-3.5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        {studyMeta.lessonSection}
                      </span>
                      {studyMeta.sectionIndex && studyMeta.totalSections && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          Step {studyMeta.sectionIndex} of {studyMeta.totalSections}
                        </span>
                      )}
                    </div>
                    {studyMeta.learningObjective && (
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">Objective:</span>{' '}
                        {studyMeta.learningObjective}
                      </p>
                    )}
                    {studyMeta.adaptiveAdjustment && (
                      <p className="text-[11px] text-emerald-700 font-medium pt-0.5">
                        Adapted: {studyMeta.adaptiveAdjustment}
                      </p>
                    )}
                  </div>
                )}

                {isActualError ? (
                  <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 text-slate-800 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {displayMsgText}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        executeStudyTurn({
                          session: activeSession!,
                          action: lessonMessages.length <= 1 ? 'start' : 'student_reply',
                          userDisplayMessage: msg.originalQuery || '',
                          existingMessages: lessonMessages,
                          replaceMessageId: msg.id,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Lesson Step</span>
                    </button>
                  </div>
                ) : (
                  <SafeRenderErrorBoundary
                    mode="STUDY"
                    messageId={msg.id}
                    rawText={displayMsgText}
                    formula={displayFormula}
                    steps={displaySteps}
                  >
                    <div className="space-y-4">
                      {/* Core Pedagogical Explanation */}
                      <div className="text-slate-800 text-[15px] sm:text-[16px] leading-[1.75]">
                        <MathRenderer content={displayMsgText} variant="light" />
                      </div>

                      {/* Key Formula Block */}
                      {displayFormula && !displayMsgText.includes(displayFormula.trim()) && (
                        <div className="my-3 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200/90 overflow-x-auto">
                          <MathBlock formula={displayFormula} variant="light" />
                        </div>
                      )}

                      {/* Worked Example / Step-by-Step Breakdown */}
                      {displaySteps && displaySteps.length > 0 && (
                        <div className="my-3 space-y-2.5 border-l-2 border-slate-200 pl-4 py-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Guided Step-by-Step Breakdown
                          </p>
                          {displaySteps.map((step, sIdx) => {
                            const cleanedStep = step
                              .replace(/^\s*(?:\*\*?)?Step\s+\d+\s*[:.)\-]?(?:\*\*?)?\s*/i, '')
                              .trim();
                            return (
                              <div
                                key={sIdx}
                                className="text-slate-800 text-[14px] sm:text-[15px] leading-relaxed"
                              >
                                <span className="font-semibold text-slate-900 mr-1.5">
                                  Step {sIdx + 1}:
                                </span>
                                <MathRenderer
                                  content={cleanedStep || step}
                                  variant="light"
                                  className="inline"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Interactive Chart / Graph */}
                      {displayChart && (
                        <SafeRenderErrorBoundary
                          mode="STUDY"
                          messageId={`${msg.id}-chart`}
                          rawText=""
                        >
                          <AIChartViewer chart={displayChart} variant="light" />
                        </SafeRenderErrorBoundary>
                      )}

                      {/* SVG Conceptual Diagram */}
                      {safeSvg && (
                        <div className="my-4 p-4 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center overflow-x-auto">
                          <div
                            className="w-full max-w-lg flex items-center justify-center [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-72"
                            dangerouslySetInnerHTML={{ __html: safeSvg }}
                          />
                        </div>
                      )}

                      {/* Interactive Checkpoint Question Box */}
                      {!isStreamingThis && studyMeta?.checkpointQuestion && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 sm:p-4 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Check Your Understanding</span>
                          </div>
                          <div className="text-slate-900 text-xs sm:text-sm font-medium leading-relaxed">
                            <MathRenderer content={studyMeta.checkpointQuestion} variant="light" />
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Type your answer below, or use the study controls if you want a simpler explanation or an example first.
                          </p>
                        </div>
                      )}

                      {/* Honest Course Material Sources (ONLY when genuinely grounded) */}
                      {validMsgCitations.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>Sources</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {validMsgCitations.map((refMat) => {
                              const validPages = Array.isArray(refMat.pageReferences)
                                ? refMat.pageReferences.filter((p) => Number.isFinite(p) && p > 0)
                                : [];
                              return (
                                <div
                                  key={refMat.materialId}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-50 text-slate-700 border border-slate-200/90"
                                >
                                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenCitedSource(refMat.materialId, validPages[0])
                                    }
                                    className="font-medium truncate max-w-[200px] sm:max-w-[260px] hover:text-blue-600 hover:underline cursor-pointer text-left"
                                  >
                                    {refMat.courseCode ? `${refMat.courseCode} — ` : ''}
                                    {refMat.title}
                                  </button>
                                  {validPages.length > 0 && (
                                    <span className="text-slate-500 font-normal flex items-center gap-1">
                                      <span>·</span>
                                      {validPages.slice(0, 3).map((pageNum, pIdx) => (
                                        <button
                                          key={pageNum}
                                          type="button"
                                          onClick={() =>
                                            handleOpenCitedSource(refMat.materialId, pageNum)
                                          }
                                          className="hover:text-blue-600 hover:underline cursor-pointer"
                                        >
                                          p. {pageNum}
                                          {pIdx < Math.min(validPages.length, 3) - 1 ? ',' : ''}
                                        </button>
                                      ))}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Message Actions */}
                      {!isStreamingThis && (
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <AIReadAloudControl
                            messageId={msg.id}
                            text={
                              studyMeta?.checkpointQuestion
                                ? `${displayMsgText}. Check your understanding: ${studyMeta.checkpointQuestion}`
                                : displayMsgText
                            }
                            formula={displayFormula}
                            steps={displaySteps}
                            languagePreference={activeSession?.language || languagePreference}
                          />
                        </div>
                      )}
                    </div>
                  </SafeRenderErrorBoundary>
                )}
              </article>
            );
          })}

          {/* Generating Indicator */}
          {isGenerating && !streamingMsg && (
            <div className="py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-slate-600 text-xs sm:text-sm">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Preparing next study step...</span>
              </div>
              <button
                type="button"
                onClick={handleStopGeneration}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showScrollToBottom && (
          <div className="sticky bottom-3 flex justify-center pointer-events-none z-10">
            <button
              type="button"
              onClick={() => scrollToBottom('smooth', true)}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-md hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Latest step</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Study Controls & Answer Composer */}
      <div className="bg-white border-t border-slate-200/80 px-3 sm:px-6 py-2.5 space-y-2">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {/* Study Mode Pedagogical Action Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {STUDY_QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.id}
                type="button"
                disabled={isGenerating}
                onClick={() => handleQuickAction(qa.id, qa.label)}
                className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Voice Input Status Banner (Stage 10N) */}
          <AIVoiceStatusBanner
            state={voiceInputStatus.state}
            notice={voiceInputStatus.notice}
            isError={voiceInputStatus.isError}
            onStopListening={() => {
              aiVoiceTutorService.stopListening();
              setVoiceInputStatus({
                state: 'ready',
                interimText: '',
                notice: null,
                isError: false,
              });
            }}
            onDismiss={() =>
              setVoiceInputStatus({
                state: 'ready',
                interimText: '',
                notice: null,
                isError: false,
              })
            }
          />

          {/* Student Reply / Checkpoint Answer Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              aiVoiceTutorService.stopListening();
              setVoiceInputStatus({
                state: 'ready',
                interimText: '',
                notice: null,
                isError: false,
              });
              handleSendStudentReply();
            }}
            className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-400 px-3 py-2 transition-colors"
          >
            <AIVoiceMicButton
              languagePreference={activeSession?.language || languagePreference}
              disabled={isGenerating}
              currentText={studentInput}
              onUpdateText={(text) => {
                setStudentInput(text);
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.style.height = 'auto';
                    inputRef.current.style.height = `${Math.min(
                      inputRef.current.scrollHeight,
                      120
                    )}px`;
                  }
                }, 10);
              }}
              onFocusInput={() => inputRef.current?.focus()}
              onVoiceStatusUpdate={(st) => setVoiceInputStatus(st)}
            />

            <textarea
              ref={inputRef}
              rows={1}
              value={studentInput}
              onChange={(e) => {
                setStudentInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendStudentReply();
                }
              }}
              disabled={isGenerating}
              placeholder="Answer the checkpoint question, ask a follow-up, or request clarification..."
              className="flex-1 py-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm leading-relaxed focus:outline-none resize-none max-h-32 min-w-0"
            />

            {isGenerating ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px]"
                title="Stop generating"
              >
                <XCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!studentInput.trim()}
                className={`p-2 rounded-xl transition-all shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px] ${
                  studentInput.trim()
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Submit response"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
