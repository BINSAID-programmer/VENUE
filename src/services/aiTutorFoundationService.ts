import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  AcademicMaterialRecord,
  AIAssessmentQuestion,
  AIAssessmentQuestionAttempt,
  AIExplanationStyle,
  AILearningDifficulty,
  AILearningProgressRecord,
  AILearningSession,
  AILearningSessionStatus,
  AIMasteryLevel,
  AIMemoryConfidenceLevel,
  AIMemoryScopeLevel,
  AIMemorySignalSource,
  AIMaterialOperationRequest,
  AIMaterialOperationResult,
  AIMessage,
  AIMultimodalInputItem,
  AIMultimodalInputPayload,
  AIPersonalizationPreferences,
  AIPersonalizedTutorMemory,
  AIPreferredExplanationLevel,
  AIRelevantMemoryContextSummary,
  AIStudyLearningGoal,
  AIQuizSessionData,
  AIPracticeSessionData,
  AIExamPrepPlanData,
  AIFlashcardDeckData,
  AIFlashcardItem,
  AIFlashcardCardStyle,
  AITutorErrorCode,
  AITutorModeDefinition,
  AITutorModeId,
  AITutorNormalizedError,
  AIVoiceCapabilityStatus,
  Course,
  StudentProfile,
} from '../types';
import {
  aiTutorMaterialContextService,
  AIStudentAcademicContextPayload,
} from './aiTutorMaterialContextService';
import { getActiveUserId } from './aiChatService';

// ============================================================================
// 1. AI TUTOR MODE ARCHITECTURE & REGISTRY
// ============================================================================

export const AI_TUTOR_MODES_REGISTRY: Record<AITutorModeId, AITutorModeDefinition> = {
  CHAT: {
    id: 'CHAT',
    label: 'AI Tutor Chat',
    shortLabel: 'Chat',
    description:
      'Conversational academic explanations, step-by-step derivations, diagrams, and grounded course answers.',
    status: 'active',
    implemented: true,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: true,
    supportsSessionTracking: true,
  },
  STUDY: {
    id: 'STUDY',
    label: 'AI Study Mode',
    shortLabel: 'Study Mode',
    description: 'Guided topic-by-topic mastery sessions grounded in your course syllabus and notes.',
    status: 'active',
    implemented: true,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: true,
    supportsSessionTracking: true,
  },
  HOMEWORK: {
    id: 'HOMEWORK',
    label: 'Homework & Solution Mode',
    shortLabel: 'Homework',
    description: 'Upload a question and I\'ll help you understand and solve it step by step.',
    status: 'active',
    implemented: true,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: true,
    supportsSessionTracking: true,
  },
  QUIZ: {
    id: 'QUIZ',
    label: 'AI Quiz Generator',
    shortLabel: 'Quiz',
    description: 'Create a personalized quiz from your course or topic.',
    status: 'active',
    implemented: true,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: false,
    supportsSessionTracking: true,
  },
  PRACTICE: {
    id: 'PRACTICE',
    label: 'Practice Mode',
    shortLabel: 'Practice',
    description: 'Practice one question at a time and improve as you go.',
    status: 'active',
    implemented: true,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: false,
    supportsSessionTracking: true,
  },
  EXAM_PREP: {
    id: 'EXAM_PREP',
    label: 'Exam Preparation',
    shortLabel: 'Exam Prep',
    description:
      'Prepare smarter with a personalized revision plan, important topics, practice questions, and mock exams.',
    status: 'active',
    implemented: true,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: false,
    supportsSessionTracking: true,
  },
  SUMMARIZER: {
    id: 'SUMMARIZER',
    label: 'AI Material Summarizer',
    shortLabel: 'Summarize',
    description: 'Extract structured summaries, definitions, theorems, and formula sheets from notes.',
    status: 'planned',
    implemented: false,
    requiresCourseSelection: true,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: false,
    supportsSessionTracking: true,
  },
  FLASHCARDS: {
    id: 'FLASHCARDS',
    label: 'AI Flashcards',
    shortLabel: 'Flashcards',
    description: 'Turn your course materials into smart flashcards for quick revision.',
    status: 'active',
    implemented: true,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: false,
    supportsSessionTracking: true,
  },
  PERSONAL_TUTOR: {
    id: 'PERSONAL_TUTOR',
    label: 'Personalized Tutor',
    shortLabel: 'Personal Tutor',
    description: 'Adaptive explanations tailored to your mastery profile and preferred learning style.',
    status: 'planned',
    implemented: false,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: true,
    supportsSessionTracking: true,
  },
  VOICE: {
    id: 'VOICE',
    label: 'Voice Tutor',
    shortLabel: 'Voice',
    description: 'Spoken academic tutoring with speech-to-text and natural voice explanations.',
    status: 'planned',
    implemented: false,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: false,
    supportsSessionTracking: true,
  },
  MULTIMODAL_SOLVER: {
    id: 'MULTIMODAL_SOLVER',
    label: 'Multimodal Math & Science Solver',
    shortLabel: 'Solver',
    description: 'Analyze handwritten equations, statistical tables, graphs, and scientific diagrams.',
    status: 'planned',
    implemented: false,
    requiresCourseSelection: false,
    supportsMaterialsGrounding: true,
    supportsMultimodalInput: true,
    supportsSessionTracking: true,
  },
};

// ============================================================================
// 2. SHARED AI CONTEXT PAYLOAD (EXTENDING STAGE 10A/10B)
// ============================================================================

export interface AISharedModeContextPayload extends AIStudentAcademicContextPayload {
  mode: AITutorModeId;
  selectedTopic?: string;
  activeSessionId?: string;
  difficulty?: AILearningDifficulty;
  learningObjectives?: string[];
  personalizedSignals?: Array<{
    topic: string;
    masteryLevel: AIMasteryLevel;
    preferredExplanationStyle: AIExplanationStyle;
    commonMistakes: string[];
  }>;
}

// ============================================================================
// LOCAL CACHE KEYS & BOUNDED LIMITS
// ============================================================================

const SESSION_CACHE_PREFIX = 'venue_ai_sessions_';
const ACTIVE_STUDY_SESSION_PREFIX = 'venue_ai_active_study_session_';
const PROGRESS_CACHE_PREFIX = 'venue_ai_progress_';
const MEMORY_CACHE_PREFIX = 'venue_ai_memory_';
const PREFS_CACHE_PREFIX = 'venue_ai_personalization_prefs_';
const CURRENT_MEMORY_SCHEMA_VERSION = 2;

const MAX_TOPICS_PER_COURSE = 50;
const MAX_MISTAKES_PER_TOPIC = 8;
const MAX_STRENGTHS_WEAKNESSES = 8;
const MAX_PROMPT_CHARS_BUDGET = 12000;

// In-flight promise deduplication maps (Section 10 & 11: Cost & Performance Control)
const inFlightRequests = new Map<string, Promise<any>>();
const operationResultCache = new Map<string, { timestamp: number; result: any }>();
const OPERATION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Helper to sanitize text signals so no credentials, tokens, emails, or long raw transcripts
 * are ever stored in Personalized Tutor Memory or Learning Sessions.
 */
function sanitizeLearningSignal(text: string, maxLength = 140): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[redacted]')
    .replace(/\b(AIza[0-9A-Za-z\-_]{20,}|Bearer\s+[A-Za-z0-9\-._~+/]+=*)\b/g, '[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function toSafeSlug(input: string): string {
  return (input || 'general')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64) || 'general';
}

// ============================================================================
// MAIN FOUNDATION SERVICE
// ============================================================================

class AITutorFoundationService {
  // --------------------------------------------------------------------------
  // 1. Mode Architecture Helpers
  // --------------------------------------------------------------------------

  public getModeDefinition(modeId: AITutorModeId): AITutorModeDefinition {
    return AI_TUTOR_MODES_REGISTRY[modeId] || AI_TUTOR_MODES_REGISTRY.CHAT;
  }

  /**
   * Returns ONLY the modes that are currently implemented and active.
   * Ensures unfinished modes are never exposed as fake UI to students (Section 12).
   */
  public getImplementedModes(): AITutorModeDefinition[] {
    return Object.values(AI_TUTOR_MODES_REGISTRY).filter(
      (mode) => mode.implemented && mode.status === 'active'
    );
  }

  public isModeImplemented(modeId: AITutorModeId): boolean {
    const def = AI_TUTOR_MODES_REGISTRY[modeId];
    return Boolean(def && def.implemented && def.status === 'active');
  }

  // --------------------------------------------------------------------------
  // 2. Shared AI Context Builder (With Strict Course & Material Authorization)
  // --------------------------------------------------------------------------

  public async buildSharedModeContext(params: {
    mode: AITutorModeId;
    profile?: StudentProfile;
    courses: Course[];
    selectedCourseContext: string;
    initialCourse?: Course | null;
    userQuery: string;
    selectedTopic?: string;
    activeSessionId?: string;
    difficulty?: AILearningDifficulty;
    learningObjectives?: string[];
    includeTutorMemory?: boolean;
  }): Promise<AISharedModeContextPayload> {
    const baseContext = await aiTutorMaterialContextService.buildContextForQuery({
      profile: params.profile,
      courses: params.courses,
      selectedCourseContext: params.selectedCourseContext,
      initialCourse: params.initialCourse,
      userQuery: params.userQuery || params.selectedTopic || '',
    });

    let personalizedSignals: AISharedModeContextPayload['personalizedSignals'];

    if (
      params.includeTutorMemory &&
      baseContext.selectedCanonicalCourseId &&
      params.profile?.uid
    ) {
      const memories = await this.getTopicMemoriesForCourse(
        params.profile.uid,
        baseContext.selectedCanonicalCourseId,
        5
      );
      if (memories.length > 0) {
        personalizedSignals = memories.map((m) => ({
          topic: m.topic,
          masteryLevel: m.masteryLevel,
          preferredExplanationStyle: m.preferredExplanationStyle,
          commonMistakes: m.commonMistakes.slice(0, 4),
        }));
      }
    }

    return {
      ...baseContext,
      mode: params.mode,
      selectedTopic: params.selectedTopic
        ? sanitizeLearningSignal(params.selectedTopic, 120)
        : undefined,
      activeSessionId: params.activeSessionId,
      difficulty: params.difficulty,
      learningObjectives: params.learningObjectives
        ?.slice(0, 6)
        .map((obj) => sanitizeLearningSignal(obj, 140)),
      personalizedSignals,
    };
  }

  // --------------------------------------------------------------------------
  // 3. Shared AI Session Model (Firestore + Local Cache + Pagination)
  // --------------------------------------------------------------------------

  private getCachedSessions(userId: string): AILearningSession[] {
    try {
      const raw = localStorage.getItem(`${SESSION_CACHE_PREFIX}${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return [];
  }

  private setCachedSessions(userId: string, sessions: AILearningSession[]): void {
    try {
      localStorage.setItem(
        `${SESSION_CACHE_PREFIX}${userId}`,
        JSON.stringify(sessions.slice(0, 40))
      );
    } catch {
      // Ignore storage error
    }
  }

  public async createLearningSession(params: {
    userId?: string;
    mode: AITutorModeId;
    courseId: string;
    courseCode?: string;
    courseTitle?: string;
    topicId?: string;
    topic?: string;
    learningGoal?: AIStudyLearningGoal;
    currentSectionTitle?: string;
    materialIds?: string[];
    difficulty?: AILearningDifficulty;
    language?: string;
    learningObjectives?: string[];
    totalSteps?: number;
    messages?: AIMessage[];
    metadata?: Record<string, string | number | boolean>;
  }): Promise<AILearningSession> {
    const userId = params.userId || getActiveUserId();
    const now = new Date().toISOString();
    const sessionId = `aisess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const session: AILearningSession = {
      sessionId,
      userId,
      mode: params.mode,
      courseId: toSafeSlug(params.courseId || 'all_courses'),
      courseCode: (params.courseCode || params.courseId || 'All Courses').trim().slice(0, 32),
      ...(params.courseTitle ? { courseTitle: params.courseTitle.trim().slice(0, 140) } : {}),
      ...(params.topicId ? { topicId: toSafeSlug(params.topicId) } : {}),
      ...(params.topic ? { topic: sanitizeLearningSignal(params.topic, 120) } : {}),
      ...(params.learningGoal ? { learningGoal: params.learningGoal } : {}),
      ...(params.currentSectionTitle
        ? { currentSectionTitle: sanitizeLearningSignal(params.currentSectionTitle, 120) }
        : {}),
      ...(Array.isArray(params.materialIds) && params.materialIds.length > 0
        ? { materialIds: params.materialIds.slice(0, 10) }
        : {}),
      startedAt: now,
      updatedAt: now,
      status: 'active',
      difficulty: params.difficulty || 'intermediate',
      language: params.language || 'auto',
      learningObjectives: (params.learningObjectives || [])
        .slice(0, 8)
        .map((o) => sanitizeLearningSignal(o, 140))
        .filter(Boolean),
      progress: {
        currentStep: 1,
        totalSteps: Math.max(1, params.totalSteps || 5),
        completedItems: 0,
        percentComplete: 0,
      },
      ...(Array.isArray(params.messages) ? { messages: params.messages } : {}),
      ...(params.metadata ? { metadata: params.metadata } : {}),
    };

    const existing = this.getCachedSessions(userId);
    this.setCachedSessions(userId, [session, ...existing.filter((s) => s.sessionId !== sessionId)]);

    if (params.mode === 'STUDY') {
      this.setActiveStudySessionId(userId, sessionId);
    }

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', sessionId);
        await setDoc(ref, this.sanitizeSessionForFirestore(session), { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Session cached locally:', err);
      }
    }

    return session;
  }

  public getActiveStudySessionId(userId: string = getActiveUserId()): string | null {
    try {
      return localStorage.getItem(`${ACTIVE_STUDY_SESSION_PREFIX}${userId}`);
    } catch {
      return null;
    }
  }

  public setActiveStudySessionId(
    userId: string = getActiveUserId(),
    sessionId: string | null
  ): void {
    try {
      if (sessionId) {
        localStorage.setItem(`${ACTIVE_STUDY_SESSION_PREFIX}${userId}`, sessionId);
      } else {
        localStorage.removeItem(`${ACTIVE_STUDY_SESSION_PREFIX}${userId}`);
      }
    } catch {
      // Ignore storage error
    }
  }

  private sanitizeSessionForFirestore(session: AILearningSession): Record<string, any> {
    const clean: Record<string, any> = {
      sessionId: session.sessionId,
      userId: session.userId,
      mode: session.mode,
      courseId: session.courseId,
      courseCode: session.courseCode || 'All Courses',
      startedAt: session.startedAt,
      updatedAt: session.updatedAt,
      status: session.status,
      difficulty: session.difficulty,
      language: session.language,
      learningObjectives: Array.isArray(session.learningObjectives)
        ? session.learningObjectives.slice(0, 8)
        : [],
      progress: {
        currentStep: Number(session.progress?.currentStep) || 1,
        totalSteps: Number(session.progress?.totalSteps) || 5,
        completedItems: Number(session.progress?.completedItems) || 0,
        percentComplete: Number(session.progress?.percentComplete) || 0,
      },
    };
    if (session.courseTitle) clean.courseTitle = session.courseTitle;
    if (session.topicId) clean.topicId = session.topicId;
    if (session.topic) clean.topic = session.topic;
    if (session.learningGoal) clean.learningGoal = session.learningGoal;
    if (session.currentSectionTitle) clean.currentSectionTitle = session.currentSectionTitle;
    if (Array.isArray(session.materialIds) && session.materialIds.length > 0) {
      clean.materialIds = session.materialIds.slice(0, 10);
    }
    if (session.metadata) clean.metadata = session.metadata;
    if (Array.isArray(session.messages) && session.messages.length > 0) {
      clean.messages = session.messages.slice(-40).map((m) => {
        const msgClean: Record<string, any> = {
          id: m.id,
          sender: m.sender,
          role: m.role || m.sender,
          text: m.text || '',
          content: m.content || m.text || '',
          timestamp: m.timestamp || 'Just now',
        };
        if (m.courseContext) msgClean.courseContext = m.courseContext;
        if (m.formula) msgClean.formula = m.formula;
        if (Array.isArray(m.steps) && m.steps.length > 0) msgClean.steps = m.steps;
        if (Array.isArray(m.suggestions) && m.suggestions.length > 0) {
          msgClean.suggestions = m.suggestions;
        }
        if (m.detectedLanguage) msgClean.detectedLanguage = m.detectedLanguage;
        if (m.chart) msgClean.chart = m.chart;
        if (m.diagramSvg) msgClean.diagramSvg = m.diagramSvg;
        if (m.originalQuery) msgClean.originalQuery = m.originalQuery;
        if (m.isError) msgClean.isError = true;
        if (typeof m.groundedInMaterials === 'boolean') {
          msgClean.groundedInMaterials = m.groundedInMaterials;
        }
        if (Array.isArray(m.referencedMaterials) && m.referencedMaterials.length > 0) {
          msgClean.referencedMaterials = m.referencedMaterials.slice(0, 6);
        }
        if (m.studyMetadata) {
          const sm: Record<string, any> = {};
          if (m.studyMetadata.lessonSection) sm.lessonSection = m.studyMetadata.lessonSection;
          if (typeof m.studyMetadata.sectionIndex === 'number') {
            sm.sectionIndex = m.studyMetadata.sectionIndex;
          }
          if (typeof m.studyMetadata.totalSections === 'number') {
            sm.totalSections = m.studyMetadata.totalSections;
          }
          if (m.studyMetadata.learningObjective) {
            sm.learningObjective = m.studyMetadata.learningObjective;
          }
          if (m.studyMetadata.checkpointQuestion) {
            sm.checkpointQuestion = m.studyMetadata.checkpointQuestion;
          }
          if (m.studyMetadata.adaptiveAdjustment) {
            sm.adaptiveAdjustment = m.studyMetadata.adaptiveAdjustment;
          }
          msgClean.studyMetadata = sm;
        }
        return msgClean;
      });
    }
    return clean;
  }

  public async getLearningSessionById(
    sessionId: string,
    userId: string = getActiveUserId()
  ): Promise<AILearningSession | null> {
    if (!sessionId) return null;
    const cached = this.getCachedSessions(userId);
    const localMatch = cached.find((s) => s.sessionId === sessionId);

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', sessionId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const remote = snap.data() as AILearningSession;
          const merged = [remote, ...cached.filter((s) => s.sessionId !== sessionId)];
          this.setCachedSessions(userId, merged);
          return remote;
        }
      } catch (err) {
        console.warn('AITutorFoundationService: Returning cached session:', err);
      }
    }

    return localMatch || null;
  }

  public async saveStudySessionState(params: {
    session: AILearningSession;
    messages: AIMessage[];
    currentSectionTitle?: string;
    sectionIndex?: number;
    totalSections?: number;
    learningObjective?: string;
    status?: AILearningSessionStatus;
    userId?: string;
  }): Promise<AILearningSession> {
    const userId = params.userId || params.session.userId || getActiveUserId();
    const totalSteps = Math.max(
      1,
      params.totalSections || params.session.progress?.totalSteps || 5
    );
    const currentStep = Math.max(
      1,
      Math.min(totalSteps, params.sectionIndex || params.session.progress?.currentStep || 1)
    );
    const completedItems = Math.max(
      params.session.progress?.completedItems || 0,
      currentStep - 1
    );
    const percentComplete = Math.min(100, Math.round((completedItems / totalSteps) * 100));

    const objectives = [...(params.session.learningObjectives || [])];
    if (
      params.learningObjective &&
      !objectives.includes(params.learningObjective)
    ) {
      objectives.push(sanitizeLearningSignal(params.learningObjective, 140));
    }

    const updated: AILearningSession = {
      ...params.session,
      userId,
      updatedAt: new Date().toISOString(),
      status: params.status || params.session.status || 'active',
      currentSectionTitle:
        params.currentSectionTitle || params.session.currentSectionTitle,
      learningObjectives: objectives.slice(0, 8),
      progress: {
        currentStep,
        totalSteps,
        completedItems,
        percentComplete,
      },
      messages: params.messages,
    };

    const cached = this.getCachedSessions(userId);
    const merged = [
      updated,
      ...cached.filter((s) => s.sessionId !== updated.sessionId),
    ];
    this.setCachedSessions(userId, merged);
    this.setActiveStudySessionId(userId, updated.sessionId);

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', updated.sessionId);
        await setDoc(ref, this.sanitizeSessionForFirestore(updated), { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Study session saved locally:', err);
      }
    }

    return updated;
  }

  public async updateLearningSessionProgress(
    sessionId: string,
    updates: {
      status?: AILearningSessionStatus;
      currentStep?: number;
      totalSteps?: number;
      completedItems?: number;
      score?: number;
      maxScore?: number;
      metadata?: Record<string, string | number | boolean>;
    },
    userId: string = getActiveUserId()
  ): Promise<AILearningSession | null> {
    const cached = this.getCachedSessions(userId);
    const idx = cached.findIndex((s) => s.sessionId === sessionId);
    if (idx === -1) return null;

    const current = cached[idx];
    const totalSteps = Math.max(1, updates.totalSteps ?? current.progress.totalSteps);
    const completedItems = Math.max(0, updates.completedItems ?? current.progress.completedItems);
    const currentStep = Math.max(0, updates.currentStep ?? current.progress.currentStep);
    const percentComplete = Math.min(100, Math.round((completedItems / totalSteps) * 100));

    const updated: AILearningSession = {
      ...current,
      status: updates.status || current.status,
      updatedAt: new Date().toISOString(),
      progress: {
        currentStep,
        totalSteps,
        completedItems,
        percentComplete,
        ...(typeof updates.score === 'number' ? { score: updates.score } : {}),
        ...(typeof updates.maxScore === 'number' ? { maxScore: updates.maxScore } : {}),
      },
      ...(updates.metadata
        ? { metadata: { ...(current.metadata || {}), ...updates.metadata } }
        : {}),
    };

    cached[idx] = updated;
    this.setCachedSessions(userId, cached);

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', sessionId);
        await setDoc(ref, updated, { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Session update cached locally:', err);
      }
    }

    return updated;
  }

  public async listUserLearningSessions(
    userId: string = getActiveUserId(),
    options?: {
      mode?: AITutorModeId;
      courseId?: string;
      limitCount?: number;
      lastUpdatedAt?: string;
    }
  ): Promise<{ sessions: AILearningSession[]; hasMore: boolean }> {
    const limitCount = Math.min(30, Math.max(1, options?.limitCount || 15));
    const dedupeKey = `sessions_${userId}_${options?.mode || 'ALL'}_${options?.courseId || 'ALL'}_${limitCount}_${options?.lastUpdatedAt || ''}`;

    return this.executeDeduplicatedRequest(dedupeKey, async () => {
      if (auth.currentUser && auth.currentUser.uid === userId) {
        try {
          const sessionsRef = collection(db, 'students', userId, 'ai_learning_sessions');
          const constraints: any[] = [orderBy('updatedAt', 'desc')];
          if (options?.lastUpdatedAt) {
            constraints.push(startAfter(options.lastUpdatedAt));
          }
          constraints.push(limit(limitCount + 1));

          const q = query(sessionsRef, ...constraints);
          const snap = await getDocs(q);
          const items: AILearningSession[] = [];
          snap.forEach((d) => {
            const data = d.data() as AILearningSession;
            if (options?.mode && data.mode !== options.mode) return;
            if (options?.courseId && data.courseId !== toSafeSlug(options.courseId)) return;
            items.push(data);
          });

          const hasMore = items.length > limitCount;
          const sliced = items.slice(0, limitCount);
          if (!options?.lastUpdatedAt && sliced.length > 0) {
            this.setCachedSessions(userId, sliced);
          }
          return { sessions: sliced, hasMore };
        } catch (err) {
          console.warn('AITutorFoundationService: Using cached sessions:', err);
        }
      }

      let cached = this.getCachedSessions(userId);
      if (options?.mode) cached = cached.filter((s) => s.mode === options.mode);
      if (options?.courseId) {
        const slug = toSafeSlug(options.courseId);
        cached = cached.filter((s) => s.courseId === slug);
      }
      return {
        sessions: cached.slice(0, limitCount),
        hasMore: cached.length > limitCount,
      };
    });
  }

  // --------------------------------------------------------------------------
  // 4. Learning Progress Model Service
  // --------------------------------------------------------------------------

  private createDefaultCourseProgress(
    userId: string,
    courseId: string,
    courseCode: string
  ): AILearningProgressRecord {
    const safeCourseId = toSafeSlug(courseId || courseCode);
    return {
      id: safeCourseId,
      userId,
      courseId: safeCourseId,
      courseCode: (courseCode || courseId).trim().toUpperCase(),
      topicsStudied: [],
      questionsAttempted: 0,
      questionsCorrect: 0,
      questionsIncorrect: 0,
      weakTopics: [],
      strongTopics: [],
      difficultyLevel: 'intermediate',
      practiceProgress: {
        sessionsCompleted: 0,
        totalQuestionsSolved: 0,
        accuracyPercent: 0,
      },
      quizPerformance: {
        quizzesCompleted: 0,
        averageScorePercent: 0,
        bestScorePercent: 0,
      },
      examPreparationProgress: {
        mockExamsCompleted: 0,
        readinessScorePercent: 0,
        targetTopicsCovered: 0,
      },
      flashcardReviewProgress: {
        cardsReviewed: 0,
        cardsMastered: 0,
        cardsDueForReview: 0,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  public async getCourseLearningProgress(
    userId: string,
    courseId: string,
    courseCode?: string
  ): Promise<AILearningProgressRecord> {
    const safeCourseId = toSafeSlug(courseId || courseCode || 'general');
    const cacheKey = `${PROGRESS_CACHE_PREFIX}${userId}_${safeCourseId}`;

    return this.executeDeduplicatedRequest(`progress_${userId}_${safeCourseId}`, async () => {
      if (auth.currentUser && auth.currentUser.uid === userId) {
        try {
          const ref = doc(db, 'students', userId, 'ai_learning_progress', safeCourseId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const record = snap.data() as AILearningProgressRecord;
            try {
              localStorage.setItem(cacheKey, JSON.stringify(record));
            } catch {}
            return record;
          }
        } catch (err) {
          console.warn('AITutorFoundationService: Reading progress from local cache:', err);
        }
      }

      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          return JSON.parse(raw) as AILearningProgressRecord;
        }
      } catch {}

      return this.createDefaultCourseProgress(
        userId,
        safeCourseId,
        courseCode || courseId || 'GENERAL'
      );
    });
  }

  public async recordLearningProgressUpdate(params: {
    userId?: string;
    courseId: string;
    courseCode: string;
    topicStudied?: string;
    questionsAttemptedDelta?: number;
    questionsCorrectDelta?: number;
    weakTopic?: string;
    strongTopic?: string;
    difficultyLevel?: AILearningDifficulty;
    quizScorePercent?: number;
  }): Promise<AILearningProgressRecord> {
    const userId = params.userId || getActiveUserId();
    const safeCourseId = toSafeSlug(params.courseId || params.courseCode);
    const cacheKey = `${PROGRESS_CACHE_PREFIX}${userId}_${safeCourseId}`;

    const current = await this.getCourseLearningProgress(
      userId,
      safeCourseId,
      params.courseCode
    );

    const topicsStudied = new Set(current.topicsStudied);
    if (params.topicStudied) {
      topicsStudied.add(sanitizeLearningSignal(params.topicStudied, 100));
    }

    const weakTopics = new Set(current.weakTopics);
    const strongTopics = new Set(current.strongTopics);
    if (params.weakTopic) {
      const cleanWeak = sanitizeLearningSignal(params.weakTopic, 100);
      weakTopics.add(cleanWeak);
      strongTopics.delete(cleanWeak);
    }
    if (params.strongTopic) {
      const cleanStrong = sanitizeLearningSignal(params.strongTopic, 100);
      strongTopics.add(cleanStrong);
      weakTopics.delete(cleanStrong);
    }

    const attemptedDelta = Math.max(0, params.questionsAttemptedDelta || 0);
    const correctDelta = Math.max(0, Math.min(attemptedDelta, params.questionsCorrectDelta || 0));
    const incorrectDelta = Math.max(0, attemptedDelta - correctDelta);

    const newAttempted = current.questionsAttempted + attemptedDelta;
    const newCorrect = current.questionsCorrect + correctDelta;
    const newIncorrect = current.questionsIncorrect + incorrectDelta;
    const accuracyPercent =
      newAttempted > 0 ? Math.round((newCorrect / newAttempted) * 100) : 0;

    let updatedQuizPerf = current.quizPerformance;
    if (typeof params.quizScorePercent === 'number' && Number.isFinite(params.quizScorePercent)) {
      const prevQuizzes = current.quizPerformance?.quizzesCompleted || 0;
      const prevAvg = current.quizPerformance?.averageScorePercent || 0;
      const prevBest = current.quizPerformance?.bestScorePercent || 0;
      const nextQuizzes = prevQuizzes + 1;
      const nextAvg = Math.round((prevAvg * prevQuizzes + params.quizScorePercent) / nextQuizzes);
      const nextBest = Math.max(prevBest, Math.round(params.quizScorePercent));
      updatedQuizPerf = {
        quizzesCompleted: nextQuizzes,
        averageScorePercent: nextAvg,
        bestScorePercent: nextBest,
        lastQuizAt: new Date().toISOString(),
      };
    }

    const updated: AILearningProgressRecord = {
      ...current,
      topicsStudied: Array.from(topicsStudied).slice(-MAX_TOPICS_PER_COURSE),
      questionsAttempted: newAttempted,
      questionsCorrect: newCorrect,
      questionsIncorrect: newIncorrect,
      weakTopics: Array.from(weakTopics).slice(-MAX_TOPICS_PER_COURSE),
      strongTopics: Array.from(strongTopics).slice(-MAX_TOPICS_PER_COURSE),
      difficultyLevel: params.difficultyLevel || current.difficultyLevel,
      practiceProgress: {
        ...current.practiceProgress,
        totalQuestionsSolved: newCorrect,
        accuracyPercent,
        lastPracticedAt: new Date().toISOString(),
      },
      quizPerformance: updatedQuizPerf,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch {}

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_progress', safeCourseId);
        await setDoc(ref, updated, { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Progress cached locally:', err);
      }
    }

    return updated;
  }

  // --------------------------------------------------------------------------
  // 5. Personalized Tutor Memory Foundation & Stage 10M Adaptive Engine
  // --------------------------------------------------------------------------

  public getPersonalizationPreferences(
    userId: string = getActiveUserId()
  ): AIPersonalizationPreferences {
    const key = `${PREFS_CACHE_PREFIX}${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as AIPersonalizationPreferences;
        return {
          userId,
          personalizationEnabled:
            typeof parsed.personalizationEnabled === 'boolean'
              ? parsed.personalizationEnabled
              : true,
          preferredExplanationLevel: parsed.preferredExplanationLevel || 'intermediate',
          preferredExplanationStyle: parsed.preferredExplanationStyle || 'step_by_step',
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    } catch {}

    return {
      userId,
      personalizationEnabled: true,
      preferredExplanationLevel: 'intermediate',
      preferredExplanationStyle: 'step_by_step',
      updatedAt: new Date().toISOString(),
    };
  }

  public savePersonalizationPreferences(
    updates: Partial<Omit<AIPersonalizationPreferences, 'userId' | 'updatedAt'>>,
    userId: string = getActiveUserId()
  ): AIPersonalizationPreferences {
    const current = this.getPersonalizationPreferences(userId);
    const next: AIPersonalizationPreferences = {
      ...current,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`${PREFS_CACHE_PREFIX}${userId}`, JSON.stringify(next));
    } catch {}
    return next;
  }

  /**
   * Section 8 & 26: Detects whether the student's current prompt explicitly overrides
   * explanation difficulty or style so explicit requests always take priority over stored memory.
   */
  public detectExplicitUserOverride(queryText: string): {
    hasExplicitLevelOverride: boolean;
    overrideExplanationLevel?: AIPreferredExplanationLevel;
    hasExplicitStyleOverride: boolean;
    overrideExplanationStyle?: AIExplanationStyle;
  } {
    const q = (queryText || '').toLowerCase();

    let overrideExplanationLevel: AIPreferredExplanationLevel | undefined;
    if (
      /\b(explain\s+(this\s+|it\s+)?(very\s+)?simpl[ey]|like\s+i\s*am\s+a\s+beginner|in\s+simple\s+terms|for\s+a\s+complete\s+beginner|kwa\s+lugha\s+rahisi\s+sana)\b/i.test(
        q
      )
    ) {
      overrideExplanationLevel = 'very_simple';
    } else if (
      /\b(at\s+(a\s+)?beginner\s+level|foundational\s+level|basic\s+explanation)\b/i.test(q)
    ) {
      overrideExplanationLevel = 'beginner';
    } else if (
      /\b(at\s+(an?\s+)?(university\s+)?advanced\s+level|rigorous\s+proof|advanced\s+derivation|graduate\s+level|deep\s+mathematical\s+rigor)\b/i.test(
        q
      )
    ) {
      overrideExplanationLevel = 'advanced';
    } else if (/\b(at\s+(an?\s+)?intermediate\s+level|standard\s+lecture\s+level)\b/i.test(q)) {
      overrideExplanationLevel = 'intermediate';
    }

    let overrideExplanationStyle: AIExplanationStyle | undefined;
    if (/\b(step\s*by\s*step|hatua\s+kwa\s+hatua|all\s+steps)\b/i.test(q)) {
      overrideExplanationStyle = 'step_by_step';
    } else if (/\b(prove|rigorous\s+proof|formal\s+derivation)\b/i.test(q)) {
      overrideExplanationStyle = 'rigorous_proof';
    } else if (/\b(visual|diagram|graph|intuitive)\b/i.test(q)) {
      overrideExplanationStyle = 'visual_intuitive';
    } else if (/\b(just\s+the\s+formula|concise\s+formula|summary\s+formula)\b/i.test(q)) {
      overrideExplanationStyle = 'concise_formula';
    } else if (/\b(worked\s+example|give\s+me\s+an?\s+example)\b/i.test(q)) {
      overrideExplanationStyle = 'worked_examples';
    }

    return {
      hasExplicitLevelOverride: Boolean(overrideExplanationLevel),
      overrideExplanationLevel,
      hasExplicitStyleOverride: Boolean(overrideExplanationStyle),
      overrideExplanationStyle,
    };
  }

  /**
   * Section 5, 6 & 20: Computes explainable, confidence-weighted mastery & temporal decay
   * so a single wrong answer never creates an extreme conclusion and stale signals decay naturally.
   */
  public evaluateMasteryClassification(params: {
    masteryScore: number;
    attempts: number;
    correctCount: number;
    incorrectCount: number;
    lastPracticedAt?: string;
  }): {
    masteryLevel: AIMasteryLevel;
    confidence: number;
    confidenceLevel: AIMemoryConfidenceLevel;
    decayedScore: number;
  } {
    const attempts = Math.max(0, params.attempts || 0);
    const rawScore = Math.max(0, Math.min(100, Number(params.masteryScore ?? 50)));

    // Temporal decay towards neutral 50 if older than 21 days (Section 20: Memory Retention)
    let ageDays = 0;
    if (params.lastPracticedAt) {
      const ts = new Date(params.lastPracticedAt).getTime();
      if (!isNaN(ts)) {
        ageDays = Math.max(0, (Date.now() - ts) / 86400000);
      }
    }
    const recencyFactor =
      ageDays <= 14 ? 1.0 : ageDays <= 45 ? 0.85 : ageDays <= 90 ? 0.65 : 0.45;
    const decayedScore = Math.round(50 + (rawScore - 50) * recencyFactor);

    // Confidence grows with attempts and decays with age (0.0 to 1.0)
    const sampleConfidence = Math.min(1, attempts / 6);
    const confidence = Number((sampleConfidence * recencyFactor).toFixed(2));
    const confidenceLevel: AIMemoryConfidenceLevel =
      confidence >= 0.65 ? 'high' : confidence >= 0.3 ? 'moderate' : 'low';

    if (attempts === 0) {
      return {
        masteryLevel: 'not_assessed',
        confidence: 0,
        confidenceLevel: 'low',
        decayedScore: 50,
      };
    }

    // Section 5: One wrong answer (attempts === 1, incorrectCount === 1) must NOT classify as 'needs_review' immediately;
    // keep it in 'developing' with low confidence unless repeated evidence exists.
    if (attempts === 1 && params.incorrectCount === 1) {
      return {
        masteryLevel: 'developing',
        confidence,
        confidenceLevel: 'low',
        decayedScore,
      };
    }

    let masteryLevel: AIMasteryLevel = 'developing';
    if (decayedScore >= 82 && attempts >= 2) {
      masteryLevel = 'strong';
    } else if (decayedScore >= 66) {
      masteryLevel = 'proficient';
    } else if (decayedScore >= 44) {
      masteryLevel = 'developing';
    } else {
      masteryLevel = 'needs_review';
    }

    return {
      masteryLevel,
      confidence,
      confidenceLevel,
      decayedScore,
    };
  }

  public formatMasteryLevelLabel(level?: AIMasteryLevel): string {
    switch (level) {
      case 'strong':
      case 'mastered':
        return 'Strong';
      case 'proficient':
        return 'Proficient';
      case 'developing':
        return 'Developing';
      case 'needs_review':
      case 'novice':
        return 'Needs review';
      case 'not_assessed':
      default:
        return 'Not assessed';
    }
  }

  public formatExplanationLevelLabel(level?: AIPreferredExplanationLevel): string {
    switch (level) {
      case 'very_simple':
        return 'Very Simple';
      case 'beginner':
        return 'Beginner';
      case 'advanced':
        return 'Advanced';
      case 'intermediate':
      default:
        return 'Intermediate (Step-by-step)';
    }
  }

  public async getTopicMemoriesForCourse(
    userId: string,
    courseId: string,
    maxItems = 15
  ): Promise<AIPersonalizedTutorMemory[]> {
    const safeCourseId = toSafeSlug(courseId || 'general');
    const cacheKey = `${MEMORY_CACHE_PREFIX}${userId}_${safeCourseId}`;

    return this.executeDeduplicatedRequest(`memory_${userId}_${safeCourseId}`, async () => {
      // Check local cache first for fast, zero-read repeated access within session
      let cachedList: AIPersonalizedTutorMemory[] = [];
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            cachedList = parsed;
          }
        }
      } catch {}

      if (auth.currentUser && auth.currentUser.uid === userId) {
        try {
          const memRef = collection(db, 'students', userId, 'ai_tutor_memory');
          const q = query(
            memRef,
            where('courseId', '==', safeCourseId),
            limit(Math.min(25, maxItems))
          );
          const snap = await getDocs(q);
          const list: AIPersonalizedTutorMemory[] = [];
          snap.forEach((d) => list.push(d.data() as AIPersonalizedTutorMemory));
          if (list.length > 0) {
            // Merge with any newer local records
            const mergedMap = new Map<string, AIPersonalizedTutorMemory>();
            for (const item of cachedList) mergedMap.set(item.id, item);
            for (const item of list) {
              const existingLocal = mergedMap.get(item.id);
              if (
                !existingLocal ||
                new Date(item.updatedAt).getTime() >= new Date(existingLocal.updatedAt).getTime()
              ) {
                mergedMap.set(item.id, item);
              }
            }
            const merged = Array.from(mergedMap.values()).sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            try {
              localStorage.setItem(cacheKey, JSON.stringify(merged));
            } catch {}
            return merged.slice(0, maxItems);
          }
        } catch (err) {
          console.warn('AITutorFoundationService: Using cached tutor memory signals:', err);
        }
      }

      return cachedList.slice(0, maxItems);
    });
  }

  /**
   * Lists all cached topic memories across courses for the student's Learning Preferences & Progress summary
   * without triggering N+1 Firestore queries.
   */
  public getAllCachedTopicMemories(
    userId: string = getActiveUserId(),
    courseCodeFilter?: string
  ): AIPersonalizedTutorMemory[] {
    const results: AIPersonalizedTutorMemory[] = [];
    const seenIds = new Set<string>();
    const prefix = `${MEMORY_CACHE_PREFIX}${userId}_`;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            for (const item of list as AIPersonalizedTutorMemory[]) {
              if (!item || !item.id || seenIds.has(item.id)) continue;
              if (
                courseCodeFilter &&
                courseCodeFilter !== 'All Courses' &&
                (item.courseCode || '').toLowerCase() !== courseCodeFilter.toLowerCase() &&
                item.courseId !== toSafeSlug(courseCodeFilter)
              ) {
                continue;
              }
              seenIds.add(item.id);
              results.push(item);
            }
          }
        }
      }
    } catch {}

    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Records structured, non-sensitive learning signals from meaningful academic interactions
   * (Practice, Quiz, Mock Exam, Study Mode checkpoints, Homework, Flashcards).
   * Never stores raw conversation transcripts or sensitive personal data.
   */
  public async upsertTopicMemorySignal(params: {
    userId?: string;
    courseId: string;
    courseCode?: string;
    topic: string;
    concept?: string;
    scope?: AIMemoryScopeLevel;
    signalSource?: AIMemorySignalSource;
    masteryScoreDelta?: number;
    attemptsDelta?: number;
    correctDelta?: number;
    incorrectDelta?: number;
    hintsUsedDelta?: number;
    simplerRequestDelta?: number;
    mistakeObserved?: string;
    preferredExplanationStyle?: AIExplanationStyle;
    preferredExplanationLevel?: AIPreferredExplanationLevel;
    difficultyLevel?: AILearningDifficulty;
    strengthObserved?: string;
    weaknessObserved?: string;
  }): Promise<AIPersonalizedTutorMemory> {
    const userId = params.userId || getActiveUserId();
    const prefs = this.getPersonalizationPreferences(userId);
    const safeCourseId = toSafeSlug(params.courseId || params.courseCode || 'general');
    const topicClean = sanitizeLearningSignal(params.topic, 100) || 'Core Concepts';
    const conceptClean = params.concept ? sanitizeLearningSignal(params.concept, 100) : undefined;

    // Section 3: Only create concept-level memory when explicitly provided with sufficient evidence;
    // otherwise deduplicate at the course + topic level.
    const memoryId =
      params.scope === 'concept' && conceptClean
        ? `${safeCourseId}_${toSafeSlug(topicClean)}_${toSafeSlug(conceptClean)}`
        : `${safeCourseId}_${toSafeSlug(topicClean)}`;
    const now = new Date().toISOString();

    const existingList = await this.getTopicMemoriesForCourse(userId, safeCourseId, 25);
    const existing = existingList.find((m) => m.id === memoryId);

    // If personalization is turned off by the student, return existing or neutral without writing
    if (!prefs.personalizationEnabled) {
      if (existing) return existing;
      return {
        id: memoryId,
        memoryId,
        schemaVersion: CURRENT_MEMORY_SCHEMA_VERSION,
        userId,
        scope: params.scope || 'topic',
        courseId: safeCourseId,
        courseCode: (params.courseCode || params.courseId).trim().toUpperCase(),
        topicId: toSafeSlug(topicClean),
        topic: topicClean,
        masteryLevel: 'not_assessed',
        masteryScore: 50,
        confidence: 0,
        confidenceLevel: 'low',
        attempts: 0,
        correctCount: 0,
        incorrectCount: 0,
        hintUsage: 0,
        commonMistakes: [],
        preferredExplanationStyle: prefs.preferredExplanationStyle,
        preferredExplanationLevel: prefs.preferredExplanationLevel,
        difficultyLevel: 'intermediate',
        lastPracticedAt: now,
        strengths: [],
        weaknesses: [],
        updatedAt: now,
      };
    }

    const prevAttempts = existing?.attempts || 0;
    const prevCorrect = existing?.correctCount || 0;
    const prevIncorrect = existing?.incorrectCount || 0;
    const prevHints = existing?.hintUsage || 0;
    const prevSimplerReqs = existing?.simplerExplanationRequests || 0;

    // Infer attempt deltas if caller only passed masteryScoreDelta
    const inferredAttempt =
      typeof params.attemptsDelta === 'number'
        ? params.attemptsDelta
        : typeof params.masteryScoreDelta === 'number' && params.masteryScoreDelta !== 0
        ? 1
        : 0;
    const inferredCorrect =
      typeof params.correctDelta === 'number'
        ? params.correctDelta
        : (params.masteryScoreDelta || 0) > 0
        ? 1
        : 0;
    const inferredIncorrect =
      typeof params.incorrectDelta === 'number'
        ? params.incorrectDelta
        : (params.masteryScoreDelta || 0) < 0
        ? 1
        : 0;

    const attempts = prevAttempts + Math.max(0, inferredAttempt);
    const correctCount = prevCorrect + Math.max(0, inferredCorrect);
    const incorrectCount = prevIncorrect + Math.max(0, inferredIncorrect);
    const hintUsage = prevHints + Math.max(0, params.hintsUsedDelta || 0);
    const simplerExplanationRequests =
      prevSimplerReqs + Math.max(0, params.simplerRequestDelta || 0);

    // Dampen single-event swings when sample size is very small (Section 5: Memory Confidence)
    const rawDelta = params.masteryScoreDelta ?? 0;
    const dampedDelta =
      attempts <= 1 && rawDelta < 0
        ? Math.max(-7, rawDelta) // One wrong answer is a weak signal (never drops below 43 from 50)
        : rawDelta;

    const prevScore = existing ? existing.masteryScore : 50;
    const nextScore = Math.max(0, Math.min(100, Math.round(prevScore + dampedDelta)));

    const classification = this.evaluateMasteryClassification({
      masteryScore: nextScore,
      attempts: Math.max(1, attempts),
      correctCount,
      incorrectCount,
      lastPracticedAt: now,
    });

    const mistakes = new Set(existing?.commonMistakes || []);
    if (params.mistakeObserved) {
      const cleanMistake = sanitizeLearningSignal(params.mistakeObserved, 120);
      if (cleanMistake) mistakes.add(cleanMistake);
    }

    const strengths = new Set(existing?.strengths || []);
    const weaknesses = new Set(existing?.weaknesses || []);

    if (params.strengthObserved) {
      const sClean = sanitizeLearningSignal(params.strengthObserved, 100);
      if (sClean) {
        strengths.add(sClean);
        // If repeated correct answers show improvement, remove from weaknesses
        if (classification.masteryLevel === 'proficient' || classification.masteryLevel === 'strong') {
          weaknesses.delete(sClean);
        }
      }
    }

    if (params.weaknessObserved) {
      const wClean = sanitizeLearningSignal(params.weaknessObserved, 100);
      // Only add to persistent weaknesses if there is sufficient evidence or repeated mistakes (attempts >= 2 or rawDelta <= -8)
      if (wClean && (incorrectCount >= 2 || attempts >= 2 || rawDelta <= -8)) {
        weaknesses.add(wClean);
        strengths.delete(wClean);
      }
    }

    // Infer preferred explanation level from repeated simpler requests if not explicitly set
    let preferredExplanationLevel: AIPreferredExplanationLevel =
      params.preferredExplanationLevel ||
      existing?.preferredExplanationLevel ||
      prefs.preferredExplanationLevel ||
      'intermediate';

    if (!params.preferredExplanationLevel && simplerExplanationRequests >= 2) {
      preferredExplanationLevel =
        preferredExplanationLevel === 'advanced' ? 'intermediate' : 'beginner';
    }

    const record: AIPersonalizedTutorMemory = {
      id: memoryId,
      memoryId,
      schemaVersion: CURRENT_MEMORY_SCHEMA_VERSION,
      userId,
      scope: params.scope || (conceptClean ? 'concept' : 'topic'),
      courseId: safeCourseId,
      courseCode: (params.courseCode || params.courseId).trim().toUpperCase(),
      topicId: toSafeSlug(topicClean),
      topic: topicClean,
      ...(conceptClean ? { concept: conceptClean } : {}),
      masteryLevel: classification.masteryLevel,
      masteryScore: classification.decayedScore,
      confidence: classification.confidence,
      confidenceLevel: classification.confidenceLevel,
      attempts,
      correctCount,
      incorrectCount,
      hintUsage,
      simplerExplanationRequests,
      commonMistakes: Array.from(mistakes).filter(Boolean).slice(-MAX_MISTAKES_PER_TOPIC),
      preferredExplanationStyle:
        params.preferredExplanationStyle ||
        existing?.preferredExplanationStyle ||
        prefs.preferredExplanationStyle ||
        'step_by_step',
      preferredExplanationLevel,
      difficultyLevel: params.difficultyLevel || existing?.difficultyLevel || 'intermediate',
      ...(params.signalSource ? { lastSignalSource: params.signalSource } : {}),
      lastPracticedAt: now,
      strengths: Array.from(strengths).filter(Boolean).slice(-MAX_STRENGTHS_WEAKNESSES),
      weaknesses: Array.from(weaknesses).filter(Boolean).slice(-MAX_STRENGTHS_WEAKNESSES),
      updatedAt: now,
    };

    const cacheKey = `${MEMORY_CACHE_PREFIX}${userId}_${safeCourseId}`;
    const updatedList = [record, ...existingList.filter((m) => m.id !== memoryId)].slice(0, 25);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(updatedList));
    } catch {}

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const ref = doc(db, 'students', userId, 'ai_tutor_memory', memoryId);
        await setDoc(ref, record, { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Tutor memory signal cached locally:', err);
      }
    }

    return record;
  }

  /**
   * Section 10, 22, 25, 26: Retrieves ONLY relevant learning memory for the active course & query/topic,
   * respects explicit student overrides, and formats a compact, natural prompt guidance string
   * (avoiding loading irrelevant history or sending raw records to Gemini).
   */
  public async buildRelevantPersonalizedMemoryContext(params: {
    userId?: string;
    courseCode: string;
    topicOrQuery?: string;
    mode?: AITutorModeId;
  }): Promise<AIRelevantMemoryContextSummary> {
    const userId = params.userId || getActiveUserId();
    const prefs = this.getPersonalizationPreferences(userId);
    const courseCode = params.courseCode || 'All Courses';
    const queryText = (params.topicOrQuery || '').trim();

    const overrideCheck = this.detectExplicitUserOverride(queryText);
    const effectiveExplanationLevel: AIPreferredExplanationLevel =
      overrideCheck.overrideExplanationLevel || prefs.preferredExplanationLevel || 'intermediate';
    const effectiveExplanationStyle: AIExplanationStyle =
      overrideCheck.overrideExplanationStyle || prefs.preferredExplanationStyle || 'step_by_step';

    if (!prefs.personalizationEnabled) {
      return {
        personalizationEnabled: false,
        explicitOverrideDetected:
          overrideCheck.hasExplicitLevelOverride || overrideCheck.hasExplicitStyleOverride,
        effectiveExplanationLevel,
        effectiveExplanationStyle,
        courseCode,
        strongAreas: [],
        needsReviewAreas: [],
        developingAreas: [],
        recurringMistakes: [],
        relevantTopicMemories: [],
        compactPromptGuidance: '',
        humanReadableSummary: {
          strongAreas: [],
          needsPractice: [],
          preferredExplanationLabel: this.formatExplanationLevelLabel(effectiveExplanationLevel),
          totalTopicsTracked: 0,
        },
      };
    }

    // Retrieve course memories (from cache or single course-scoped query)
    let memories: AIPersonalizedTutorMemory[] = [];
    if (courseCode && courseCode !== 'All Courses') {
      memories = await this.getTopicMemoriesForCourse(userId, courseCode, 20);
    } else {
      memories = this.getAllCachedTopicMemories(userId).slice(0, 20);
    }

    // Re-evaluate temporal decay on retrieved records
    const evaluatedMemories = memories.map((m) => {
      const ev = this.evaluateMasteryClassification({
        masteryScore: m.masteryScore,
        attempts: m.attempts ?? 1,
        correctCount: m.correctCount ?? 0,
        incorrectCount: m.incorrectCount ?? 0,
        lastPracticedAt: m.lastPracticedAt || m.updatedAt,
      });
      return {
        ...m,
        masteryLevel: ev.masteryLevel,
        masteryScore: ev.decayedScore,
        confidence: ev.confidence,
        confidenceLevel: ev.confidenceLevel,
      };
    });

    // Also incorporate session-based signals for immediate consistency
    const sessionSignals = this.getCoursePerformanceSignals(courseCode, userId);

    const strongSet = new Set<string>(sessionSignals.strongTopics);
    const needsReviewSet = new Set<string>(sessionSignals.weakTopics);
    const developingSet = new Set<string>();
    const mistakesSet = new Set<string>();

    for (const m of evaluatedMemories) {
      if (m.masteryLevel === 'strong' || m.masteryLevel === 'proficient' || m.masteryLevel === 'mastered') {
        strongSet.add(m.topic);
        needsReviewSet.delete(m.topic);
      } else if (
        (m.masteryLevel === 'needs_review' || m.masteryLevel === 'novice') &&
        (m.confidence ?? 0.3) >= 0.25
      ) {
        needsReviewSet.add(m.topic);
      } else if (m.masteryLevel === 'developing') {
        developingSet.add(m.topic);
      }
      for (const err of m.commonMistakes || []) {
        if (err) mistakesSet.add(err);
      }
    }

    // Filter to ONLY topic-relevant memories when a specific query/topic is provided (Section 10 & 26)
    const queryWords = queryText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !['explain', 'teach', 'solve', 'what', 'how', 'show', 'give', 'the', 'and', 'for', 'with'].includes(w));

    let relevantTopicMemories = evaluatedMemories;
    if (queryWords.length > 0) {
      const matched = evaluatedMemories.filter((m) => {
        const hay = `${m.topic} ${m.concept || ''} ${(m.weaknesses || []).join(' ')} ${(m.strengths || []).join(' ')}`.toLowerCase();
        return queryWords.some((w) => hay.includes(w));
      });
      // Section 26: If student asks about a specific topic (e.g. "Teach me differentiation"),
      // do NOT inject unrelated topic weaknesses (e.g. Probability) into the prompt.
      relevantTopicMemories = matched;
    } else {
      relevantTopicMemories = evaluatedMemories.slice(0, 5);
    }

    const relevantMistakes: string[] = [];
    for (const rm of relevantTopicMemories) {
      for (const cm of rm.commonMistakes || []) {
        if (cm && !relevantMistakes.includes(cm)) {
          relevantMistakes.push(cm);
        }
      }
    }

    // Build compact, natural prompt guidance (< 450 chars) for Gemini (Section 22, 25, 28)
    const guidanceParts: string[] = [];
    if (overrideCheck.hasExplicitLevelOverride) {
      guidanceParts.push(
        `Student explicitly requested ${this.formatExplanationLevelLabel(
          effectiveExplanationLevel
        )} explanation level—prioritize this level.`
      );
    } else {
      guidanceParts.push(
        `Preferred explanation style: ${effectiveExplanationStyle.replace(/_/g, ' ')} (${this.formatExplanationLevelLabel(
          effectiveExplanationLevel
        )} level).`
      );
    }

    if (relevantTopicMemories.length > 0) {
      const topMem = relevantTopicMemories.slice(0, 3);
      for (const tm of topMem) {
        if (tm.masteryLevel === 'needs_review' || (tm.incorrectCount || 0) >= 2) {
          guidanceParts.push(
            `Recent activity on "${tm.topic}" (${tm.attempts || 2} attempts, ${
              tm.incorrectCount || 1
            } needing review) suggests reinforcing prerequisites and using a clear step-by-step example.`
          );
        } else if (tm.masteryLevel === 'strong' || tm.masteryLevel === 'proficient') {
          guidanceParts.push(
            `Student has demonstrated solid understanding of "${tm.topic}" (${tm.correctCount || 2}/${
              tm.attempts || 2
            } correct)—avoid unnecessary basic repetition.`
          );
        }
      }
    } else if (queryWords.length === 0 && needsReviewSet.size > 0) {
      guidanceParts.push(
        `Topics that may benefit from extra review in ${courseCode}: ${Array.from(needsReviewSet)
          .slice(0, 3)
          .join(', ')}.`
      );
    }

    if (relevantMistakes.length > 0) {
      guidanceParts.push(
        `Recurring pattern to clarify naturally (without saying "according to your memory"): ${relevantMistakes
          .slice(0, 2)
          .join('; ')}.`
      );
    }

    const strongAreas = Array.from(strongSet).slice(0, 6);
    const needsReviewAreas = Array.from(needsReviewSet).slice(0, 6);
    const developingAreas = Array.from(developingSet).slice(0, 6);

    let recentObservationNote: string | undefined;
    if (needsReviewAreas.length > 0) {
      recentObservationNote = `Your recent practice suggests that ${needsReviewAreas
        .slice(0, 2)
        .join(' and ')} may benefit from extra review.`;
    } else if (strongAreas.length > 0) {
      recentObservationNote = `You are showing consistent progress in ${strongAreas
        .slice(0, 2)
        .join(' and ')}.`;
    }

    return {
      personalizationEnabled: true,
      explicitOverrideDetected:
        overrideCheck.hasExplicitLevelOverride || overrideCheck.hasExplicitStyleOverride,
      effectiveExplanationLevel,
      effectiveExplanationStyle,
      courseCode,
      strongAreas,
      needsReviewAreas,
      developingAreas,
      recurringMistakes: Array.from(mistakesSet).slice(0, 5),
      relevantTopicMemories: relevantTopicMemories.slice(0, 5),
      compactPromptGuidance: guidanceParts.join(' ').slice(0, 650),
      humanReadableSummary: {
        strongAreas,
        needsPractice: needsReviewAreas,
        preferredExplanationLabel: `${this.formatExplanationLevelLabel(
          effectiveExplanationLevel
        )} · ${effectiveExplanationStyle.replace(/_/g, '-')}`,
        totalTopicsTracked: evaluatedMemories.length,
        recentObservationNote,
      },
    };
  }

  /**
   * Section 17 & 30: Resets or clears Personalized Tutor Memory and learning progress signals
   * WITHOUT deleting the student's account, course enrollment, materials, chat history, or academic records.
   */
  public async resetStudentLearningMemory(params?: {
    userId?: string;
    courseCode?: string;
  }): Promise<void> {
    const userId = params?.userId || getActiveUserId();
    const targetCourseSlug =
      params?.courseCode && params.courseCode !== 'All Courses'
        ? toSafeSlug(params.courseCode)
        : null;

    // 1. Clear localStorage tutor memory & progress caches (preserving chat history, profile, courses, etc.)
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (targetCourseSlug) {
          if (
            k === `${MEMORY_CACHE_PREFIX}${userId}_${targetCourseSlug}` ||
            k === `${PROGRESS_CACHE_PREFIX}${userId}_${targetCourseSlug}`
          ) {
            keysToRemove.push(k);
          }
        } else if (
          k.startsWith(`${MEMORY_CACHE_PREFIX}${userId}_`) ||
          k.startsWith(`${PROGRESS_CACHE_PREFIX}${userId}_`)
        ) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k);
      }
    } catch {}

    // 2. Delete Firestore ai_tutor_memory and ai_learning_progress documents for the student
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const memRef = collection(db, 'students', userId, 'ai_tutor_memory');
        const memQuery = targetCourseSlug
          ? query(memRef, where('courseId', '==', targetCourseSlug), limit(50))
          : query(memRef, limit(50));
        const memSnap = await getDocs(memQuery);
        const deletions: Promise<void>[] = [];
        memSnap.forEach((d) => {
          deletions.push(deleteDoc(d.ref));
        });

        const progRef = collection(db, 'students', userId, 'ai_learning_progress');
        const progQuery = targetCourseSlug
          ? query(progRef, where('courseId', '==', targetCourseSlug), limit(25))
          : query(progRef, limit(25));
        const progSnap = await getDocs(progQuery);
        progSnap.forEach((d) => {
          deletions.push(deleteDoc(d.ref));
        });

        if (deletions.length > 0) {
          await Promise.allSettled(deletions);
        }
      } catch (err) {
        console.warn('AITutorFoundationService: Cleared local memory cache:', err);
      }
    }
  }

  public async deleteSingleTopicMemory(
    userId: string = getActiveUserId(),
    memoryId: string
  ): Promise<void> {
    if (!memoryId) return;
    try {
      const prefix = `${MEMORY_CACHE_PREFIX}${userId}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const filtered = list.filter((m: any) => m && m.id !== memoryId && m.memoryId !== memoryId);
            localStorage.setItem(k, JSON.stringify(filtered));
          }
        }
      }
    } catch {}

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const ref = doc(db, 'students', userId, 'ai_tutor_memory', memoryId);
        await deleteDoc(ref);
      } catch (err) {
        console.warn('AITutorFoundationService: Deleted single topic memory from local cache:', err);
      }
    }
  }

  public async getRelevantPersonalizedMemoryContext(params: {
    userId?: string;
    courseCode?: string;
    courseId?: string;
    topic?: string;
    userMessage?: string;
    mode?: AITutorModeId;
    authorizedCourseCodes?: string[];
  }): Promise<string> {
    const summary = await this.buildRelevantPersonalizedMemoryContext({
      userId: params.userId,
      courseCode: params.courseCode || params.courseId || 'All Courses',
      topicOrQuery: `${params.topic || ''} ${params.userMessage || ''}`.trim(),
      mode: params.mode,
    });
    return summary.compactPromptGuidance || '';
  }

  public async upsertTopicMasteryMemory(params: {
    userId?: string;
    courseId: string;
    courseCode?: string;
    topic: string;
    usedHints?: boolean;
    requestedSimplerExplanation?: boolean;
    preferredStyle?: AIExplanationStyle;
    sourceMode?: AITutorModeId;
  }): Promise<AIPersonalizedTutorMemory> {
    return this.upsertTopicMemorySignal({
      userId: params.userId,
      courseId: params.courseId,
      courseCode: params.courseCode,
      topic: params.topic,
      hintsUsedDelta: params.usedHints ? 1 : 0,
      simplerRequestDelta: params.requestedSimplerExplanation ? 1 : 0,
      preferredExplanationStyle: params.preferredStyle,
      signalSource:
        params.sourceMode === 'STUDY'
          ? 'study_mode'
          : params.sourceMode === 'HOMEWORK'
          ? 'homework'
          : params.sourceMode === 'PRACTICE'
          ? 'practice'
          : params.sourceMode === 'QUIZ'
          ? 'quiz'
          : params.sourceMode === 'FLASHCARDS'
          ? 'flashcards'
          : 'chat',
    });
  }

  public getRecommendedNextActionsFromMemory(
    memories: AIPersonalizedTutorMemory[],
    courseCodeFilter?: string
  ): Array<{
    id: string;
    actionType: 'practice' | 'study_mode' | 'quiz' | 'flashcards' | 'exam_prep';
    courseCode: string;
    topic: string;
    label: string;
    reason: string;
  }> {
    const actions: Array<{
      id: string;
      actionType: 'practice' | 'study_mode' | 'quiz' | 'flashcards' | 'exam_prep';
      courseCode: string;
      topic: string;
      label: string;
      reason: string;
    }> = [];

    const filtered = memories.filter((m) => {
      if (!courseCodeFilter || courseCodeFilter === 'All Courses' || courseCodeFilter === 'ALL') {
        return true;
      }
      return (m.courseCode || m.courseId || '').toUpperCase() === courseCodeFilter.toUpperCase();
    });

    for (const m of filtered) {
      const courseCode = m.courseCode || m.courseId || 'General';
      if (m.masteryLevel === 'needs_review' || m.masteryLevel === 'novice') {
        actions.push({
          id: `rec_prac_${m.id}`,
          actionType: 'practice',
          courseCode,
          topic: m.topic,
          label: `Practice ${m.topic}`,
          reason: `Recent signals (${m.masteryScore}% mastery) suggest extra practice will reinforce this topic.`,
        });
        actions.push({
          id: `rec_study_${m.id}`,
          actionType: 'study_mode',
          courseCode,
          topic: m.topic,
          label: `Study ${m.topic} Step-by-Step`,
          reason: `Review core concepts and worked examples in Study Mode.`,
        });
      } else if (m.masteryLevel === 'developing') {
        actions.push({
          id: `rec_fc_${m.id}`,
          actionType: 'flashcards',
          courseCode,
          topic: m.topic,
          label: `Review ${m.topic} Flashcards`,
          reason: `Build active recall on key formulas and definitions (${m.masteryScore}% mastery).`,
        });
      }
      if (actions.length >= 4) break;
    }

    return actions.slice(0, 4);
  }

  // --------------------------------------------------------------------------
  // 6. Question / Assessment Validation & Evaluation Helpers (Stage 10H)
  // --------------------------------------------------------------------------

  private parseMathNumericExpression(val: string): number {
    let clean = (val || '')
      .replace(/^\$+|\$+$/g, '')
      .replace(/\\left|\\right/g, '')
      .replace(/\\frac\{([+-]?\d+(?:\.\d+)?)\}\{([+-]?\d+(?:\.\d+)?)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([+-]?\d+(?:\.\d+)?)\}/g, 'sqrt($1)')
      .replace(/\\pi\b/gi, String(Math.PI))
      .replace(/\bpi\b/gi, String(Math.PI))
      .replace(/,/g, '')
      .trim();

    if (!clean) return NaN;

    // Handle percentage suffix e.g. "50%" -> 0.5 only if not compared directly
    const isPercent = clean.endsWith('%');
    if (isPercent) {
      clean = clean.slice(0, -1).trim();
    }

    // Handle mixed fraction e.g. "1 1/2"
    const mixedMatch = clean.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixedMatch) {
      const whole = Number(mixedMatch[1]);
      const num = Number(mixedMatch[2]);
      const den = Number(mixedMatch[3]);
      if (Number.isFinite(whole) && Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
        const sign = whole < 0 ? -1 : 1;
        const result = whole + sign * (num / den);
        return isPercent ? result / 100 : result;
      }
    }

    // Handle simple fraction e.g. "(1)/(2)" or "1/2"
    const fracMatch = clean.match(/^\(?([+-]?\d+(?:\.\d+)?)\)?\s*\/\s*\(?([+-]?\d+(?:\.\d+)?)\)?$/);
    if (fracMatch) {
      const num = Number(fracMatch[1]);
      const den = Number(fracMatch[2]);
      if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
        const result = num / den;
        return isPercent ? result / 100 : result;
      }
    }

    // Handle k*pi orsqrt(n) simple expressions
    const sqrtMatch = clean.match(/^([+-]?\d*(?:\.\d+)?)\s*\*?\s*sqrt\(([+-]?\d+(?:\.\d+)?)\)$/i);
    if (sqrtMatch) {
      const coeff = sqrtMatch[1] === '' || sqrtMatch[1] === '+' ? 1 : sqrtMatch[1] === '-' ? -1 : Number(sqrtMatch[1]);
      const rad = Number(sqrtMatch[2]);
      if (Number.isFinite(coeff) && Number.isFinite(rad) && rad >= 0) {
        const result = coeff * Math.sqrt(rad);
        return isPercent ? result / 100 : result;
      }
    }

    // Strip trailing units after a number (e.g., "12.5 m/s", "45 degrees")
    const leadingNumberMatch = clean.match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?:\s*[a-zA-Z°%/^0-9\s-]+)?$/i);
    if (leadingNumberMatch && !clean.includes('/')) {
      const parsedLead = Number(leadingNumberMatch[1]);
      if (Number.isFinite(parsedLead)) {
        return isPercent ? parsedLead / 100 : parsedLead;
      }
    }

    const parsed = Number(clean);
    if (Number.isFinite(parsed)) {
      return isPercent ? parsed / 100 : parsed;
    }
    return NaN;
  }

  private normalizeMathAnswerString(val: string): string {
    return (val || '')
      .toLowerCase()
      .replace(/^\$+|\$+$/g, '')
      .replace(/\\left|\\right/g, '')
      .replace(/\\dfrac|\\tfrac/g, '\\frac')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\cdot|\\times/g, '*')
      .replace(/\s+/g, ' ')
      .replace(/^[a-d][).:\-]\s*/i, '')
      .trim();
  }

  /**
   * Validates a generated question (Stage 10H Section 14) to ensure:
   * - non-empty prompt, correctAnswer, and explanation
   * - for MCQ: 4 distinct options and a valid correctAnswer matching one of the options
   * - for numerical: valid numerical or mathematical correctAnswer
   */
  public validateAssessmentQuestion(q: Partial<AIAssessmentQuestion>): {
    valid: boolean;
    normalized?: AIAssessmentQuestion;
    reason?: string;
  } {
    if (!q || typeof q.questionText !== 'string' || q.questionText.trim().length < 8) {
      return { valid: false, reason: 'Question text is missing or too short.' };
    }
    if (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) {
      return { valid: false, reason: 'Correct answer is missing.' };
    }
    if (typeof q.explanation !== 'string' || q.explanation.trim().length < 8) {
      return { valid: false, reason: 'Explanation is missing or too brief.' };
    }

    const qType =
      q.questionType === 'multiple_choice' ||
      q.questionType === 'short_answer' ||
      q.questionType === 'numerical'
        ? q.questionType
        : Array.isArray(q.options) && q.options.length >= 2
        ? 'multiple_choice'
        : 'short_answer';

    let cleanOptions: string[] | undefined;
    let resolvedCorrectAnswer = q.correctAnswer.trim();

    if (qType === 'multiple_choice') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return { valid: false, reason: 'Multiple choice question lacks options.' };
      }
      // Strip leading A. / B. / C. / D. prefixes so the UI can render clean badges consistently
      cleanOptions = q.options
        .map((opt) =>
          String(opt || '')
            .replace(/^\s*(?:\([A-Da-d]\)|[A-Da-d][).:\-])\s*/, '')
            .trim()
        )
        .filter(Boolean);

      if (cleanOptions.length < 2) {
        return { valid: false, reason: 'Insufficient non-empty MCQ options.' };
      }

      // Check for duplicate options
      const uniqueNorm = new Set(cleanOptions.map((o) => this.normalizeMathAnswerString(o)));
      if (uniqueNorm.size < cleanOptions.length) {
        return { valid: false, reason: 'Duplicate MCQ options detected.' };
      }

      // Resolve correctAnswer if the model returned "A", "B", "Option C", etc., or match exact option
      const strippedAns = resolvedCorrectAnswer
        .replace(/^\s*(?:Option\s+)?(?:\([A-Da-d]\)|[A-Da-d][).:\-])\s*/i, '')
        .trim();
      const letterOnlyMatch = resolvedCorrectAnswer.match(/^\s*(?:Option\s+)?([A-Da-d])\s*$/i);

      if (letterOnlyMatch) {
        const letterIdx = letterOnlyMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (letterIdx >= 0 && letterIdx < cleanOptions.length) {
          resolvedCorrectAnswer = cleanOptions[letterIdx];
        } else {
          return { valid: false, reason: 'MCQ letter index out of range.' };
        }
      } else {
        const directIdx = cleanOptions.findIndex(
          (opt) =>
            opt === resolvedCorrectAnswer ||
            opt === strippedAns ||
            this.normalizeMathAnswerString(opt) === this.normalizeMathAnswerString(strippedAns)
        );
        if (directIdx !== -1) {
          resolvedCorrectAnswer = cleanOptions[directIdx];
        } else {
          // Check if leading letter in original answer maps to a valid option
          const prefixLetter = resolvedCorrectAnswer.match(/^\s*([A-Da-d])[).:\-]/);
          if (prefixLetter) {
            const lIdx = prefixLetter[1].toUpperCase().charCodeAt(0) - 65;
            if (lIdx >= 0 && lIdx < cleanOptions.length) {
              resolvedCorrectAnswer = cleanOptions[lIdx];
            } else {
              return { valid: false, reason: 'MCQ correct answer does not match any option.' };
            }
          } else {
            return { valid: false, reason: 'MCQ correct answer does not match any option.' };
          }
        }
      }
    }

    const normalized: AIAssessmentQuestion = {
      questionId: q.questionId || `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      courseId: q.courseId || 'general',
      courseCode: q.courseCode,
      topic: (q.topic || 'Core Concept').trim(),
      learningObjective: q.learningObjective?.trim(),
      difficulty:
        q.difficulty === 'foundational' ||
        q.difficulty === 'intermediate' ||
        q.difficulty === 'advanced'
          ? q.difficulty
          : 'intermediate',
      questionType: qType,
      questionText: q.questionText.trim(),
      ...(cleanOptions ? { options: cleanOptions } : {}),
      correctAnswer: resolvedCorrectAnswer,
      ...(Array.isArray(q.acceptableAnswers)
        ? { acceptableAnswers: q.acceptableAnswers.map((a) => String(a).trim()).filter(Boolean) }
        : {}),
      ...(typeof q.numericalTolerance === 'number'
        ? { numericalTolerance: q.numericalTolerance }
        : {}),
      ...(Array.isArray(q.solutionSteps) ? { solutionSteps: q.solutionSteps } : {}),
      ...(Array.isArray(q.hints)
        ? { hints: q.hints.map((h) => String(h).trim()).filter(Boolean) }
        : {}),
      ...(q.structuredSolution && typeof q.structuredSolution === 'object'
        ? { structuredSolution: q.structuredSolution }
        : {}),
      explanation: q.explanation.trim(),
      ...(Array.isArray(q.referencedMaterials)
        ? { referencedMaterials: q.referencedMaterials }
        : {}),
      groundedInMaterials: Boolean(q.groundedInMaterials),
    };

    return { valid: true, normalized };
  }

  public evaluateQuestionAttempt(
    question: AIAssessmentQuestion,
    userAnswerRaw: string,
    timeSpentSeconds?: number
  ): AIAssessmentQuestionAttempt {
    const userClean = (userAnswerRaw || '').trim();
    const expectedClean = (question.correctAnswer || '').trim();
    let isCorrect = false;

    const candidates = [
      expectedClean,
      ...(Array.isArray(question.acceptableAnswers) ? question.acceptableAnswers : []),
    ].filter(Boolean);

    if (question.questionType === 'multiple_choice') {
      const userNorm = this.normalizeMathAnswerString(userClean);
      isCorrect = candidates.some((c) => this.normalizeMathAnswerString(c) === userNorm);
    } else if (question.questionType === 'numerical') {
      const userNum = this.parseMathNumericExpression(userClean);
      const tolerance = question.numericalTolerance ?? 0.02;

      for (const cand of candidates) {
        const expNum = this.parseMathNumericExpression(cand);
        if (Number.isFinite(userNum) && Number.isFinite(expNum)) {
          if (Math.abs(userNum - expNum) <= Math.max(tolerance, Math.abs(expNum) * 0.015)) {
            isCorrect = true;
            break;
          }
        }
        if (this.normalizeMathAnswerString(userClean) === this.normalizeMathAnswerString(cand)) {
          isCorrect = true;
          break;
        }
      }
    } else {
      // Short answer: compare normalized text, acceptable answers, or key conceptual phrase match
      const userNorm = this.normalizeMathAnswerString(userClean);
      for (const cand of candidates) {
        const candNorm = this.normalizeMathAnswerString(cand);
        if (!candNorm) continue;
        if (userNorm === candNorm) {
          isCorrect = true;
          break;
        }
        // Also check numeric equivalence if the short answer is a number/formula
        const uNum = this.parseMathNumericExpression(userClean);
        const cNum = this.parseMathNumericExpression(cand);
        if (Number.isFinite(uNum) && Number.isFinite(cNum) && Math.abs(uNum - cNum) <= 0.02) {
          isCorrect = true;
          break;
        }
        // Check if user answer contains the core expected keywords (for 2+ word definitions)
        // Or if expected answer contains the user's core technical term (e.g., "mean" vs "arithmetic mean")
        const stopWords = new Set(['that', 'this', 'with', 'from', 'when', 'where', 'the', 'and', 'for', 'are']);
        const candWords = candNorm
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 3 && !stopWords.has(w));
        const userWords = userNorm
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 3 && !stopWords.has(w));

        if (candWords.length >= 2 && userWords.length >= 1) {
          const matchedInUser = candWords.filter((w) => userWords.includes(w));
          if (matchedInUser.length / candWords.length >= 0.65) {
            isCorrect = true;
            break;
          }
          // Single-term core noun match (e.g. student writes "mean" for "arithmetic mean" or "variance" for "sample variance")
          if (
            userWords.length === 1 &&
            userWords[0].length >= 4 &&
            candWords[candWords.length - 1] === userWords[0]
          ) {
            isCorrect = true;
            break;
          }
        }
      }
    }

    return {
      questionId: question.questionId,
      userAnswer: userClean,
      isCorrect,
      timeSpentSeconds,
      attemptedAt: new Date().toISOString(),
    };
  }

  /**
   * Stage 10I Section 3: Gradual Adaptive Difficulty Engine
   * Never jumps directly from foundational -> advanced or advanced -> foundational.
   */
  public computeNextAdaptiveDifficulty(params: {
    difficultyMode: AILearningDifficulty;
    currentDifficulty: 'foundational' | 'intermediate' | 'advanced';
    recentPerformance: Array<{
      isCorrect: boolean;
      hintsUsed: number;
    }>;
  }): {
    nextDifficulty: 'foundational' | 'intermediate' | 'advanced';
    adaptationReason?: string;
    reinforceSameConcept: boolean;
  } {
    const { difficultyMode, currentDifficulty, recentPerformance } = params;
    const lastAttempt = recentPerformance[recentPerformance.length - 1];
    const reinforceSameConcept = Boolean(lastAttempt && !lastAttempt.isCorrect);

    // Even when student selected a fixed difficulty, if they miss 2 in a row we step down 1 level to help them build confidence
    const lastTwo = recentPerformance.slice(-2);
    const twoMistakesInARow =
      lastTwo.length === 2 && lastTwo.every((item) => !item.isCorrect);
    const twoCleanWinsInARow =
      lastTwo.length === 2 &&
      lastTwo.every((item) => item.isCorrect && (item.hintsUsed || 0) === 0);

    if (difficultyMode !== 'adaptive') {
      if (twoMistakesInARow) {
        if (currentDifficulty === 'advanced') {
          return {
            nextDifficulty: 'intermediate',
            adaptationReason: 'Stepping to Intermediate to reinforce the core method before returning to Advanced.',
            reinforceSameConcept: true,
          };
        }
        if (currentDifficulty === 'intermediate') {
          return {
            nextDifficulty: 'foundational',
            adaptationReason: 'Stepping to Beginner to solidify the foundational concept.',
            reinforceSameConcept: true,
          };
        }
      }
      // Return to target fixed difficulty after a correct answer
      const targetFixed: 'foundational' | 'intermediate' | 'advanced' =
        difficultyMode === 'foundational' ||
        difficultyMode === 'intermediate' ||
        difficultyMode === 'advanced'
          ? difficultyMode
          : 'intermediate';
      if (lastAttempt?.isCorrect && currentDifficulty !== targetFixed) {
        return {
          nextDifficulty: targetFixed,
          adaptationReason: `Returning to your selected ${
            targetFixed === 'foundational' ? 'Beginner' : targetFixed
          } level.`,
          reinforceSameConcept: false,
        };
      }
      return {
        nextDifficulty: currentDifficulty,
        reinforceSameConcept,
      };
    }

    // Adaptive Mode: step gradually (Foundational <-> Intermediate <-> Advanced)
    if (twoCleanWinsInARow) {
      if (currentDifficulty === 'foundational') {
        return {
          nextDifficulty: 'intermediate',
          adaptationReason: 'Strong accuracy! Stepping up gradually from Beginner to Intermediate.',
          reinforceSameConcept: false,
        };
      }
      if (currentDifficulty === 'intermediate') {
        return {
          nextDifficulty: 'advanced',
          adaptationReason: 'Consistent mastery! Stepping up gradually from Intermediate to Advanced.',
          reinforceSameConcept: false,
        };
      }
    }

    if (twoMistakesInARow || (lastAttempt && !lastAttempt.isCorrect && (lastAttempt.hintsUsed || 0) >= 2)) {
      if (currentDifficulty === 'advanced') {
        return {
          nextDifficulty: 'intermediate',
          adaptationReason: 'Adjusting to Intermediate so we can practice this concept step-by-step.',
          reinforceSameConcept: true,
        };
      }
      if (currentDifficulty === 'intermediate') {
        return {
          nextDifficulty: 'foundational',
          adaptationReason: 'Adjusting to Beginner to review the prerequisite foundation clearly.',
          reinforceSameConcept: true,
        };
      }
    }

    return {
      nextDifficulty: currentDifficulty,
      reinforceSameConcept,
    };
  }

  public async savePracticeSessionRecord(
    practice: AIPracticeSessionData,
    userId: string = getActiveUserId()
  ): Promise<AILearningSession> {
    const attempted = Math.max(0, practice.questionsAttempted);
    const target = Math.max(1, practice.targetQuestionCount || 10);
    const accuracy = attempted > 0 ? Math.round((practice.correctCount / attempted) * 100) : 0;
    const percentComplete =
      practice.sessionStatus === 'completed'
        ? 100
        : Math.min(99, Math.round((attempted / target) * 100));

    const session: AILearningSession = {
      sessionId: practice.practiceSessionId,
      userId,
      mode: 'PRACTICE',
      courseId: toSafeSlug(practice.courseId || practice.courseCode || 'general'),
      courseCode: practice.courseCode || 'All Courses',
      ...(practice.courseTitle ? { courseTitle: practice.courseTitle } : {}),
      topic: sanitizeLearningSignal(practice.topic, 120),
      startedAt: practice.startedAt,
      updatedAt: practice.updatedAt || new Date().toISOString(),
      status: practice.sessionStatus === 'completed' ? 'completed' : 'active',
      difficulty: practice.difficultyMode,
      language: practice.language || 'auto',
      learningObjectives: practice.conceptsPracticed
        .slice(0, 6)
        .map((c) => sanitizeLearningSignal(c, 120)),
      progress: {
        currentStep: attempted + (practice.sessionStatus === 'active' ? 1 : 0),
        totalSteps: Math.max(target, attempted),
        completedItems: attempted,
        percentComplete,
        score: practice.correctCount,
        maxScore: attempted,
      },
      metadata: {
        questionType: practice.questionType,
        questionsAttempted: attempted,
        correctCount: practice.correctCount,
        incorrectCount: practice.incorrectCount,
        accuracyPercent: accuracy,
        currentDifficulty: practice.currentDifficulty,
        hintsUsed: practice.hintsUsed,
        groundedInMaterials: Boolean(practice.groundedInMaterials),
      },
    };

    try {
      localStorage.setItem(
        `venue_ai_practice_detail_${practice.practiceSessionId}`,
        JSON.stringify(practice)
      );
    } catch {}

    const cached = this.getCachedSessions(userId);
    this.setCachedSessions(userId, [
      session,
      ...cached.filter((s) => s.sessionId !== session.sessionId),
    ]);

    // Section 11 & 17: Avoid unnecessary Firestore writes during active question clicks; persist only completed session summary
    if (
      auth.currentUser &&
      auth.currentUser.uid === userId &&
      practice.sessionStatus === 'completed' &&
      attempted > 0
    ) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', session.sessionId);
        await setDoc(ref, this.sanitizeSessionForFirestore(session), { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Practice session cached locally:', err);
      }
    }

    return session;
  }

  public getSavedPracticeDetail(practiceSessionId: string): AIPracticeSessionData | null {
    if (!practiceSessionId) return null;
    try {
      const raw = localStorage.getItem(`venue_ai_practice_detail_${practiceSessionId}`);
      if (raw) {
        return JSON.parse(raw) as AIPracticeSessionData;
      }
    } catch {}
    return null;
  }

  // --------------------------------------------------------------------------
  // 6B. Quiz Session Persistence Helpers (Reusing AILearningSession)
  // --------------------------------------------------------------------------

  public async saveQuizSessionRecord(
    quiz: AIQuizSessionData,
    userId: string = getActiveUserId()
  ): Promise<AILearningSession> {
    const answeredCount = Object.keys(quiz.attempts || {}).length;
    const totalCount = Math.max(1, quiz.questions.length);
    const correctCount = Object.values(quiz.attempts || {}).filter((a) => a.isCorrect).length;
    const percentComplete =
      quiz.status === 'completed'
        ? 100
        : Math.min(99, Math.round((answeredCount / totalCount) * 100));

    const session: AILearningSession = {
      sessionId: quiz.quizId,
      userId,
      mode: 'QUIZ',
      courseId: toSafeSlug(quiz.courseId || quiz.courseCode || 'general'),
      courseCode: quiz.courseCode || 'All Courses',
      ...(quiz.courseTitle ? { courseTitle: quiz.courseTitle } : {}),
      topic: sanitizeLearningSignal(quiz.topic, 120),
      startedAt: quiz.createdAt,
      updatedAt: quiz.completedAt || new Date().toISOString(),
      status: quiz.status === 'completed' ? 'completed' : 'active',
      difficulty: quiz.difficulty,
      language: quiz.language || 'auto',
      learningObjectives: quiz.questions
        .map((q) => q.learningObjective || q.topic)
        .filter(Boolean)
        .slice(0, 6)
        .map((o) => sanitizeLearningSignal(o, 120)),
      progress: {
        currentStep: Math.min(totalCount, (quiz.currentQuestionIndex || 0) + 1),
        totalSteps: totalCount,
        completedItems: answeredCount,
        percentComplete,
        score: typeof quiz.score === 'number' ? quiz.score : correctCount,
        maxScore: totalCount,
      },
      metadata: {
        questionType: quiz.questionType,
        questionCount: totalCount,
        score: typeof quiz.score === 'number' ? quiz.score : correctCount,
        percentage:
          typeof quiz.percentage === 'number'
            ? quiz.percentage
            : Math.round((correctCount / totalCount) * 100),
        performanceSummary: (quiz.performanceSummary || '').slice(0, 260),
        groundedInMaterials: Boolean(quiz.groundedInMaterials),
      },
    };

    // Store full quiz payload in localStorage for instant resume/review without bloating Firestore
    try {
      localStorage.setItem(`venue_ai_quiz_detail_${quiz.quizId}`, JSON.stringify(quiz));
    } catch {}

    const cached = this.getCachedSessions(userId);
    this.setCachedSessions(userId, [
      session,
      ...cached.filter((s) => s.sessionId !== session.sessionId),
    ]);

    // Only write to Firestore when quiz is created or completed (Section 16: Avoid unnecessary Firestore writes on every temporary click)
    if (auth.currentUser && auth.currentUser.uid === userId && quiz.status === 'completed') {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', session.sessionId);
        await setDoc(ref, this.sanitizeSessionForFirestore(session), { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Quiz session cached locally:', err);
      }
    }

    return session;
  }

  public getSavedQuizDetail(quizId: string): AIQuizSessionData | null {
    if (!quizId) return null;
    try {
      const raw = localStorage.getItem(`venue_ai_quiz_detail_${quizId}`);
      if (raw) {
        return JSON.parse(raw) as AIQuizSessionData;
      }
    } catch {}
    return null;
  }

  // --------------------------------------------------------------------------
  // 6C. Exam Preparation Plan & Mock Exam Persistence + Adaptive Signal Aggregation (Stage 10J)
  // --------------------------------------------------------------------------

  public async saveExamPrepPlanRecord(
    plan: AIExamPrepPlanData,
    persistToFirestoreCheckpoint = false,
    userId: string = getActiveUserId()
  ): Promise<AILearningSession> {
    const totalPriorityTopics = Math.max(1, plan.priorityTopics.length);
    const completedPriorityTopics = plan.priorityTopics.filter(
      (t) => t.status === 'completed'
    ).length;
    const totalDays = Math.max(1, plan.revisionPlan.length);
    const completedDays = plan.revisionPlan.filter((d) => d.completed).length;

    const percentComplete = Math.min(
      100,
      Math.round(
        ((completedPriorityTopics / totalPriorityTopics) * 0.5 +
          (completedDays / totalDays) * 0.3 +
          (plan.mockExams.filter((m) => m.status === 'completed').length > 0 ? 0.2 : 0)) *
          100
      )
    );

    const latestMock = plan.mockExams
      .filter((m) => m.status === 'completed')
      .slice(-1)[0];

    const session: AILearningSession = {
      sessionId: plan.examPrepId,
      userId,
      mode: 'EXAM_PREP',
      courseId: toSafeSlug(plan.courseId || plan.courseCode || 'general'),
      courseCode: plan.courseCode || 'All Courses',
      ...(plan.courseTitle ? { courseTitle: plan.courseTitle } : {}),
      topic: sanitizeLearningSignal(
        `${plan.examType === 'Custom' && plan.customExamName ? plan.customExamName : plan.examType} Preparation`,
        120
      ),
      startedAt: plan.createdAt,
      updatedAt: plan.updatedAt || new Date().toISOString(),
      status: percentComplete >= 100 ? 'completed' : 'active',
      difficulty:
        plan.confidenceLevel === 'low'
          ? 'foundational'
          : plan.confidenceLevel === 'high'
          ? 'advanced'
          : 'intermediate',
      language: plan.language || 'auto',
      learningObjectives: plan.priorityTopics
        .slice(0, 6)
        .map((t) => sanitizeLearningSignal(t.topic, 120)),
      progress: {
        currentStep: completedPriorityTopics + completedDays,
        totalSteps: totalPriorityTopics + totalDays,
        completedItems: completedPriorityTopics,
        percentComplete,
        ...(typeof latestMock?.percentage === 'number'
          ? { score: latestMock.percentage, maxScore: 100 }
          : {}),
      },
      metadata: {
        examType: plan.examType,
        ...(plan.examDate ? { examDate: plan.examDate } : {}),
        dailyStudyMinutes: plan.dailyStudyMinutes,
        mockExamsCompleted: plan.mockExams.filter((m) => m.status === 'completed').length,
        latestMockScorePercent:
          typeof latestMock?.percentage === 'number' ? latestMock.percentage : -1,
        groundedInMaterials: Boolean(plan.groundedInMaterials),
      },
    };

    try {
      localStorage.setItem(
        `venue_ai_examprep_detail_${plan.examPrepId}`,
        JSON.stringify(plan)
      );
      localStorage.setItem(
        `venue_ai_examprep_course_${userId}_${toSafeSlug(plan.courseCode)}`,
        plan.examPrepId
      );
    } catch {}

    const cached = this.getCachedSessions(userId);
    this.setCachedSessions(userId, [
      session,
      ...cached.filter((s) => s.sessionId !== session.sessionId),
    ]);

    // Section 19 & 24: Persist to Firestore only at meaningful checkpoints (plan creation or mock exam completion)
    if (
      persistToFirestoreCheckpoint &&
      auth.currentUser &&
      auth.currentUser.uid === userId
    ) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', session.sessionId);
        await setDoc(ref, this.sanitizeSessionForFirestore(session), { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Exam prep session cached locally:', err);
      }
    }

    return session;
  }

  public getSavedExamPrepDetail(examPrepId: string): AIExamPrepPlanData | null {
    if (!examPrepId) return null;
    try {
      const raw = localStorage.getItem(`venue_ai_examprep_detail_${examPrepId}`);
      if (raw) {
        return JSON.parse(raw) as AIExamPrepPlanData;
      }
    } catch {}
    return null;
  }

  public getSavedExamPrepForCourse(
    courseCode: string,
    userId: string = getActiveUserId()
  ): AIExamPrepPlanData | null {
    if (!courseCode) return null;
    try {
      const id = localStorage.getItem(
        `venue_ai_examprep_course_${userId}_${toSafeSlug(courseCode)}`
      );
      if (id) {
        return this.getSavedExamPrepDetail(id);
      }
    } catch {}
    return null;
  }

  /**
   * Stage 10J Section 20: Aggregates currently available authorized session signals from
   * Practice Mode, Quiz Generator, Study Mode, and Mock Exams for the given course.
   */
  public getCoursePerformanceSignals(
    courseCode: string,
    userId: string = getActiveUserId()
  ): {
    weakTopics: string[];
    strongTopics: string[];
    topicsStudied: string[];
    quizzesCompleted: number;
    practiceSessionsCompleted: number;
    recentAccuracyPercent: number | null;
    recommendationSummary: string;
  } {
    const sessions = this.getCachedSessions(userId).filter(
      (s) =>
        !courseCode ||
        courseCode === 'All Courses' ||
        (s.courseCode || '').toLowerCase() === courseCode.toLowerCase()
    );

    const weakSet = new Set<string>();
    const strongSet = new Set<string>();
    const studiedSet = new Set<string>();
    let quizzesCompleted = 0;
    let practiceSessionsCompleted = 0;
    const accuracies: number[] = [];

    for (const s of sessions) {
      if (s.topic) studiedSet.add(s.topic);
      if (s.mode === 'QUIZ') {
        if (s.status === 'completed') quizzesCompleted++;
        const pct = Number(s.metadata?.percentage);
        if (Number.isFinite(pct) && pct >= 0) {
          accuracies.push(pct);
          if (pct < 65 && s.topic) weakSet.add(s.topic);
          if (pct >= 80 && s.topic) strongSet.add(s.topic);
        }
        const qDetail = this.getSavedQuizDetail(s.sessionId);
        if (qDetail) {
          for (const q of qDetail.questions) {
            const att = qDetail.attempts?.[q.questionId];
            if (att) {
              if (!att.isCorrect && q.topic) weakSet.add(q.topic);
              if (att.isCorrect && q.topic) strongSet.add(q.topic);
            }
          }
        }
      } else if (s.mode === 'PRACTICE') {
        if (s.status === 'completed') practiceSessionsCompleted++;
        const pct = Number(s.metadata?.accuracyPercent);
        if (Number.isFinite(pct) && pct >= 0) {
          accuracies.push(pct);
        }
        const pDetail = this.getSavedPracticeDetail(s.sessionId);
        if (pDetail) {
          for (const w of pDetail.conceptsNeedingReview || []) {
            if (w) weakSet.add(w);
          }
          for (const st of pDetail.conceptsAnsweredCorrectly || []) {
            if (st) strongSet.add(st);
          }
        }
      } else if (s.mode === 'STUDY' && s.topic) {
        studiedSet.add(s.topic);
      }
    }

    // Also merge any persisted Personalized Tutor Memory records for this course
    const courseMemories = this.getAllCachedTopicMemories(userId, courseCode);
    for (const mem of courseMemories) {
      if (mem.topic) studiedSet.add(mem.topic);
      if (
        (mem.masteryLevel === 'needs_review' || mem.masteryLevel === 'novice') &&
        (mem.confidence ?? 0.3) >= 0.25
      ) {
        weakSet.add(mem.topic);
      } else if (
        mem.masteryLevel === 'strong' ||
        mem.masteryLevel === 'proficient' ||
        mem.masteryLevel === 'mastered'
      ) {
        strongSet.add(mem.topic);
      }
    }

    const weakTopics = Array.from(weakSet).slice(0, 6);
    const strongTopics = Array.from(strongSet)
      .filter((t) => !weakSet.has(t))
      .slice(0, 6);
    const topicsStudied = Array.from(studiedSet).slice(0, 10);
    const recentAccuracyPercent =
      accuracies.length > 0
        ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
        : null;

    let recommendationSummary = '';
    if (weakTopics.length > 0) {
      recommendationSummary = `Your recent practice and quiz activity suggests that ${weakTopics
        .slice(0, 2)
        .join(' and ')} need more review. Consider revisiting these topics in Study Mode and practicing targeted questions.`;
    } else if (recentAccuracyPercent !== null && recentAccuracyPercent >= 80) {
      recommendationSummary = `Your recent session accuracy is strong (${recentAccuracyPercent}%). Focus on timed Mock Exams and advanced multi-topic questions to test exam readiness.`;
    } else if (topicsStudied.length > 0) {
      recommendationSummary = `You have started reviewing ${topicsStudied
        .slice(0, 2)
        .join(', ')}. Complete a topic quiz or practice session to identify areas needing reinforcement.`;
    }

    return {
      weakTopics,
      strongTopics,
      topicsStudied,
      quizzesCompleted,
      practiceSessionsCompleted,
      recentAccuracyPercent,
      recommendationSummary,
    };
  }

  // --------------------------------------------------------------------------
  // 6E. Stage 10L: AI Flashcards Persistence & Review Tracking
  // --------------------------------------------------------------------------

  /**
   * Saves or updates an AI Flashcards deck and syncs its compact learning session summary.
   * Avoids excessive Firestore writes during rapid card flipping; persists to Firestore only
   * at meaningful checkpoints (deck creation, deck edit, or review completion).
   */
  public async saveFlashcardDeckSession(
    deck: AIFlashcardDeckData,
    userId: string = getActiveUserId(),
    persistToFirestoreCheckpoint = false
  ): Promise<AILearningSession> {
    const totalCards = Math.max(1, deck.cards.length);
    const knownCount = deck.cards.filter((c) => c.status === 'known').length;
    const reviewAgainCount = deck.cards.filter((c) => c.status === 'review_again').length;
    const unreviewedCount = Math.max(0, deck.cards.length - knownCount - reviewAgainCount);
    const reviewedCards = knownCount + reviewAgainCount;
    const percentComplete = Math.min(100, Math.round((knownCount / totalCards) * 100));

    const updatedDeck: AIFlashcardDeckData = {
      ...deck,
      knownCount,
      reviewAgainCount,
      unreviewedCount,
      updatedAt: new Date().toISOString(),
    };

    const session: AILearningSession = {
      sessionId: updatedDeck.deckId,
      userId,
      mode: 'FLASHCARDS',
      courseId: toSafeSlug(updatedDeck.courseId || updatedDeck.courseCode || 'general'),
      courseCode: updatedDeck.courseCode || 'All Courses',
      ...(updatedDeck.courseTitle ? { courseTitle: updatedDeck.courseTitle } : {}),
      topic: sanitizeLearningSignal(updatedDeck.topic || updatedDeck.deckTitle || 'Flashcards', 120),
      startedAt: updatedDeck.createdAt,
      updatedAt: updatedDeck.updatedAt,
      status: knownCount === deck.cards.length && deck.cards.length > 0 ? 'completed' : 'active',
      difficulty: updatedDeck.difficulty || 'intermediate',
      language: updatedDeck.language || 'auto',
      learningObjectives: Array.from(
        new Set(updatedDeck.cards.map((c) => sanitizeLearningSignal(c.topic, 80)).filter(Boolean))
      ).slice(0, 6),
      progress: {
        currentStep: reviewedCards,
        totalSteps: totalCards,
        completedItems: knownCount,
        percentComplete,
        score: knownCount,
        maxScore: totalCards,
      },
      metadata: {
        deckTitle: sanitizeLearningSignal(updatedDeck.deckTitle, 120),
        cardStyle: updatedDeck.cardStyle,
        sourceType: updatedDeck.sourceType,
        totalCards: deck.cards.length,
        knownCount,
        reviewAgainCount,
        unreviewedCount,
        groundedInMaterials: Boolean(updatedDeck.groundedInMaterials),
      },
    };

    try {
      localStorage.setItem(
        `venue_ai_flashcard_deck_${updatedDeck.deckId}`,
        JSON.stringify(updatedDeck)
      );
      const indexKey = `venue_ai_flashcard_decks_index_${userId}`;
      const existingIds: string[] = JSON.parse(localStorage.getItem(indexKey) || '[]');
      const nextIds = [
        updatedDeck.deckId,
        ...existingIds.filter((id) => id !== updatedDeck.deckId),
      ].slice(0, 40);
      localStorage.setItem(indexKey, JSON.stringify(nextIds));
    } catch {}

    const cached = this.getCachedSessions(userId);
    this.setCachedSessions(userId, [
      session,
      ...cached.filter((s) => s.sessionId !== session.sessionId),
    ]);

    if (
      persistToFirestoreCheckpoint &&
      auth.currentUser &&
      auth.currentUser.uid === userId
    ) {
      try {
        const ref = doc(db, 'students', userId, 'ai_learning_sessions', session.sessionId);
        await setDoc(ref, this.sanitizeSessionForFirestore(session), { merge: true });
      } catch (err) {
        console.warn('AITutorFoundationService: Flashcard deck session cached locally:', err);
      }
    }

    // Stage 10M: When flashcard review reaches a checkpoint, update topic memory signal
    if (persistToFirestoreCheckpoint && reviewedCards >= 3) {
      const masteryDelta =
        knownCount > reviewAgainCount
          ? Math.min(12, Math.round(((knownCount - reviewAgainCount) / totalCards) * 15))
          : reviewAgainCount > knownCount
          ? -Math.min(10, Math.round(((reviewAgainCount - knownCount) / totalCards) * 12))
          : 2;

      const missedTopics = Array.from(
        new Set(
          updatedDeck.cards
            .filter((c) => c.status === 'review_again' && c.topic)
            .map((c) => c.topic)
        )
      );

      void this.upsertTopicMemorySignal({
        userId,
        courseId: updatedDeck.courseId || updatedDeck.courseCode,
        courseCode: updatedDeck.courseCode,
        topic: updatedDeck.topic || updatedDeck.deckTitle,
        signalSource: 'flashcards',
        masteryScoreDelta: masteryDelta,
        attemptsDelta: 1,
        correctDelta: knownCount >= reviewAgainCount ? 1 : 0,
        incorrectDelta: reviewAgainCount > knownCount ? 1 : 0,
        ...(missedTopics.length > 0
          ? { weaknessObserved: missedTopics[0] }
          : { strengthObserved: updatedDeck.topic }),
      });
    }

    return session;
  }

  public getSavedFlashcardDeck(deckId: string): AIFlashcardDeckData | null {
    if (!deckId) return null;
    try {
      const raw = localStorage.getItem(`venue_ai_flashcard_deck_${deckId}`);
      if (raw) {
        return JSON.parse(raw) as AIFlashcardDeckData;
      }
    } catch {}
    return null;
  }

  public listSavedFlashcardDecks(
    userId: string = getActiveUserId(),
    courseCode?: string
  ): AIFlashcardDeckData[] {
    try {
      const indexKey = `venue_ai_flashcard_decks_index_${userId}`;
      const ids: string[] = JSON.parse(localStorage.getItem(indexKey) || '[]');
      const decks: AIFlashcardDeckData[] = [];
      for (const id of ids) {
        const d = this.getSavedFlashcardDeck(id);
        if (d) {
          if (
            !courseCode ||
            courseCode === 'All Courses' ||
            (d.courseCode || '').toLowerCase() === courseCode.toLowerCase()
          ) {
            decks.push(d);
          }
        }
      }
      return decks.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch {
      return [];
    }
  }

  public deleteSavedFlashcardDeck(
    deckId: string,
    userId: string = getActiveUserId()
  ): void {
    if (!deckId) return;
    try {
      localStorage.removeItem(`venue_ai_flashcard_deck_${deckId}`);
      const indexKey = `venue_ai_flashcard_decks_index_${userId}`;
      const existingIds: string[] = JSON.parse(localStorage.getItem(indexKey) || '[]');
      localStorage.setItem(
        indexKey,
        JSON.stringify(existingIds.filter((id) => id !== deckId))
      );
      const cached = this.getCachedSessions(userId);
      this.setCachedSessions(
        userId,
        cached.filter((s) => s.sessionId !== deckId)
      );
    } catch {}
  }

  // --------------------------------------------------------------------------
  // 7. Material-Based AI Operations Foundation (Strict Authorization & Grounding)
  // --------------------------------------------------------------------------

  /**
   * Verifies that all requested materialIds belong to the student's authorized course materials
   * before any material-based operation (summarize, extract formulas, quiz generation, etc.) can execute.
   */
  public async verifyAuthorizedMaterialsForOperation(params: {
    profile?: StudentProfile;
    courses: Course[];
    courseCode: string;
    requestedMaterialIds: string[];
  }): Promise<{
    authorizedMaterials: AcademicMaterialRecord[];
    hasAuthorizedContent: boolean;
    insufficientMaterialNotice?: string;
  }> {
    const allAuthorized = await aiTutorMaterialContextService.fetchAuthorizedMaterials(
      params.profile,
      params.courses,
      params.courseCode
    );

    const requestedSet = new Set(params.requestedMaterialIds || []);
    const filtered =
      requestedSet.size > 0
        ? allAuthorized.filter((m) => requestedSet.has(m.id))
        : allAuthorized;

    if (filtered.length === 0) {
      return {
        authorizedMaterials: [],
        hasAuthorizedContent: false,
        insufficientMaterialNotice:
          'No authorized VENUE course materials were found for the selected course or material selection. The AI Tutor cannot attribute content to lecturer notes when no authorized material is available.',
      };
    }

    return {
      authorizedMaterials: filtered.slice(0, 6),
      hasAuthorizedContent: true,
    };
  }

  public createHonestMaterialOperationResult<T>(params: {
    request: AIMaterialOperationRequest;
    authorizedMaterials: AcademicMaterialRecord[];
    groundedInMaterials: boolean;
    data: T;
    pageReferencesByMaterialId?: Record<string, number[]>;
    insufficientMaterialNotice?: string;
  }): AIMaterialOperationResult<T> {
    const isTrulyGrounded =
      Boolean(params.groundedInMaterials) && params.authorizedMaterials.length > 0;

    return {
      operation: params.request.operation,
      courseId: params.request.courseId,
      courseCode: params.request.courseCode,
      groundedInMaterials: isTrulyGrounded,
      ...(params.insufficientMaterialNotice
        ? { insufficientMaterialNotice: params.insufficientMaterialNotice }
        : {}),
      referencedMaterials: isTrulyGrounded
        ? params.authorizedMaterials.map((m) => ({
            materialId: m.id,
            title: m.title,
            materialType: m.materialType,
            courseCode: m.courseCode || params.request.courseCode,
            pageReferences: params.pageReferencesByMaterialId?.[m.id],
          }))
        : [],
      data: params.data,
      generatedAt: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // 8. Multimodal Input Foundation
  // --------------------------------------------------------------------------

  public buildMultimodalPayload(params: {
    mode: AITutorModeId;
    courseCode: string;
    language: string;
    text?: string;
    imageAttachment?: {
      dataUrl: string;
      mimeType: string;
      name?: string;
    } | null;
    materialReference?: {
      materialId: string;
      pageNumber?: number;
      caption?: string;
    } | null;
    additionalItems?: AIMultimodalInputItem[];
  }): AIMultimodalInputPayload {
    const items: AIMultimodalInputItem[] = [];

    if (params.text && params.text.trim()) {
      items.push({
        id: `mm_text_${Date.now()}`,
        type: 'text',
        text: params.text.trim().slice(0, MAX_PROMPT_CHARS_BUDGET),
      });
    }

    if (params.imageAttachment?.dataUrl) {
      items.push({
        id: `mm_img_${Date.now()}`,
        type: 'image',
        dataUrl: params.imageAttachment.dataUrl,
        mimeType: params.imageAttachment.mimeType || 'image/jpeg',
        caption: params.imageAttachment.name,
      });
    }

    if (params.materialReference?.materialId) {
      items.push({
        id: `mm_doc_${Date.now()}`,
        type: 'document_reference',
        materialId: params.materialReference.materialId,
        pageNumber: params.materialReference.pageNumber,
        caption: params.materialReference.caption,
      });
    }

    if (Array.isArray(params.additionalItems)) {
      items.push(...params.additionalItems.slice(0, 4));
    }

    return {
      mode: params.mode,
      courseCode: params.courseCode || 'All Courses',
      language: params.language || 'auto',
      items,
    };
  }

  // --------------------------------------------------------------------------
  // 9. Voice Interaction Foundation (Honest Capability Reporting)
  // --------------------------------------------------------------------------

  public getVoiceCapabilityStatus(): AIVoiceCapabilityStatus {
    // Section 9: Do NOT add fake voice controls or claim voice is available until implemented
    return {
      speechToTextSupported: false,
      textToSpeechSupported: false,
      isImplemented: false,
      providerName: 'unconfigured',
      unavailabilityReason:
        'Voice Tutor speech-to-text and text-to-speech are part of a future stage and are not yet enabled.',
    };
  }

  // --------------------------------------------------------------------------
  // 10 & 14. AI Cost Control, Request Deduplication & Error Normalization
  // --------------------------------------------------------------------------

  public async executeDeduplicatedRequest<T>(
    requestKey: string,
    executor: () => Promise<T>
  ): Promise<T> {
    if (inFlightRequests.has(requestKey)) {
      return inFlightRequests.get(requestKey)! as Promise<T>;
    }

    const promise = executor();
    inFlightRequests.set(requestKey, promise);
    try {
      return await promise;
    } finally {
      inFlightRequests.delete(requestKey);
    }
  }

  public getCachedOperationResult<T>(cacheKey: string): T | null {
    const entry = operationResultCache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > OPERATION_CACHE_TTL_MS) {
      operationResultCache.delete(cacheKey);
      return null;
    }
    return entry.result as T;
  }

  public setCachedOperationResult<T>(cacheKey: string, result: T): void {
    operationResultCache.set(cacheKey, {
      timestamp: Date.now(),
      result,
    });
  }

  /**
   * Maps raw network, API, or validation errors into clean, user-friendly messages
   * without exposing internal stack traces, secrets, or provider internals (Section 14).
   */
  public normalizeError(err: unknown, mode: AITutorModeId = 'CHAT'): AITutorNormalizedError {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        code: 'ABORTED',
        userMessage: 'Generation stopped.',
        retryable: true,
        mode,
      };
    }

    const raw = String((err as any)?.message || err || '').toLowerCase();

    if (raw.includes('timeout') || raw.includes('timed out') || raw.includes('deadline')) {
      return {
        code: 'AI_TIMEOUT',
        userMessage:
          'The request took too long to complete. Please try again or ask a more focused question.',
        retryable: true,
        mode,
      };
    }

    if (raw.includes('quota') || raw.includes('rate') || raw.includes('exhausted') || raw.includes('429')) {
      return {
        code: 'RATE_LIMITED',
        userMessage:
          'The AI Tutor is momentarily busy handling requests. Please wait a few seconds and tap Retry.',
        retryable: true,
        mode,
      };
    }

    if (raw.includes('unauthorized') || raw.includes('permission') || raw.includes('403')) {
      return {
        code: 'UNAUTHORIZED_COURSE_ACCESS',
        userMessage:
          'You do not have access to the requested course or material context.',
        retryable: false,
        mode,
      };
    }

    if (raw.includes('material') && (raw.includes('missing') || raw.includes('not found'))) {
      return {
        code: 'UNAVAILABLE_MATERIAL',
        userMessage:
          'The selected course material is currently unavailable for analysis.',
        retryable: false,
        mode,
      };
    }

    if (raw.includes('unsupported file') || raw.includes('mime')) {
      return {
        code: 'UNSUPPORTED_FILE',
        userMessage:
          'This file format is not supported for direct AI extraction. Supported formats include PDF, images, and plain text.',
        retryable: false,
        mode,
      };
    }

    if (raw.includes('voice')) {
      return {
        code: 'UNSUPPORTED_VOICE_CAPABILITY',
        userMessage: 'Voice interaction is not yet enabled on this device.',
        retryable: false,
        mode,
      };
    }

    if (raw.includes('empty') || raw.includes('no response')) {
      return {
        code: 'MALFORMED_AI_RESPONSE',
        userMessage:
          'We received an empty response from the AI Tutor. Please tap Retry to regenerate.',
        retryable: true,
        mode,
      };
    }

    return {
      code: 'API_FAILURE',
      userMessage:
        'We could not complete your answer right now. Please check your connection and try again.',
      retryable: true,
      mode,
    };
  }
}

export const aiTutorFoundationService = new AITutorFoundationService();
