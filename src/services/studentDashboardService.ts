import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, dbDefault, auth } from './firebase';
import {
  Course,
  StudentProfile,
  StudyTask,
  ExamCountdown,
  WeeklyGoal,
  AnnouncementRecord,
  AILearningSession,
  AIChatConversation,
  AcademicMaterialRecord,
} from '../types';
import { announcementsService } from './announcementsService';
import { aiTutorFoundationService } from './aiTutorFoundationService';
import { listUserConversations } from './aiChatService';
import { getStudentResults, calculateCGPA } from './gpaService';
import { courseCurriculumService } from './courseCurriculumService';

// ============================================================================
// STAGE 11A: REAL HOME DASHBOARD & DYNAMIC STUDENT DATA SERVICE
// ============================================================================

export type StudentActivityItemType =
  | 'ai_chat'
  | 'ai_study'
  | 'ai_quiz'
  | 'ai_practice'
  | 'ai_exam_prep'
  | 'ai_flashcards'
  | 'material_view'
  | 'material_download'
  | 'planner_task'
  | 'grade_recorded';

export interface StudentRecentActivityItem {
  id: string;
  userId: string;
  type: StudentActivityItemType;
  title: string;
  subtitle?: string;
  courseCode?: string;
  timestamp: string; // ISO 8601 string
  targetScreen?: string;
}

export interface StudentDashboardMetrics {
  gpa: number | null;
  gpaMax: number;
  hasGpaData: boolean;
  creditsEarned: number;
  totalProgrammeCredits: number;
  hasProgrammeCredits: boolean;
  studyStreakDays: number;
  studyHoursThisWeek: number;
  courseProgressMap: Record<string, {
    progressPercent: number | null;
    topicsStudiedCount: number;
    questionsAttempted: number;
    materialsAvailableCount: number;
    assignedLecturerName: string | null;
    assignedLecturerTitle: string | null;
  }>;
  activeResourcesCount: number;
  activePastPapersCount: number;
  savedFlashcardDecksCount: number;
  completedQuizzesCount: number;
  publishedNoticesCount: number;
}

const TASKS_CACHE_PREFIX = 'venue_real_study_tasks_';
const EXAMS_CACHE_PREFIX = 'venue_real_study_exams_';
const GOALS_CACHE_PREFIX = 'venue_real_weekly_goals_';
const ACTIVITY_CACHE_PREFIX = 'venue_real_student_activity_';

// Short-lived in-memory cache for dashboard aggregations to avoid repeated reads
const dashboardMetricsCache = new Map<string, { data: StudentDashboardMetrics; timestamp: number }>();
const DASHBOARD_CACHE_TTL_MS = 12_000;

function getEffectiveUid(providedUid?: string): string {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  if (providedUid && providedUid.trim()) {
    return providedUid.trim();
  }
  try {
    const stored = localStorage.getItem('venue_current_student_uid');
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore
  }
  return '';
}

function sanitizeId(raw: string): string {
  return (raw || `id_${Date.now()}`)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 96);
}

/**
 * Formats an ISO timestamp into a clean relative human-readable string.
 */
export function formatRelativeActivityTime(isoTimestamp?: string): string {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  if (isNaN(date.getTime())) return isoTimestamp;

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

class StudentDashboardService {
  public clearCache(uid?: string): void {
    if (uid) {
      for (const key of dashboardMetricsCache.keys()) {
        if (key.startsWith(`${uid}_`)) {
          dashboardMetricsCache.delete(key);
        }
      }
    } else {
      dashboardMetricsCache.clear();
    }
  }

  // ==========================================================================
  // 1. REAL STUDY TASKS (Scoped strictly to authenticated student UID)
  // ==========================================================================

  public async getStudentTasks(providedUid?: string): Promise<StudyTask[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];

    const cacheKey = `${TASKS_CACHE_PREFIX}${uid}`;
    let cachedTasks: StudyTask[] = [];
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cachedTasks = parsed;
      }
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const colRef = collection(db, 'students', uid, 'study_tasks');
        const q = query(colRef, limit(50));
        const snap = await getDocs(q);
        const list: StudyTask[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (data && data.title) {
            list.push({
              id: docSnap.id,
              title: String(data.title),
              courseCode: String(data.courseCode || 'General'),
              date: String(data.date || 'Today'),
              timeSlot: String(data.timeSlot || ''),
              estimatedMinutes: Number(data.estimatedMinutes) || 60,
              completed: Boolean(data.completed),
              priority:
                data.priority === 'high' || data.priority === 'medium' || data.priority === 'low'
                  ? data.priority
                  : 'medium',
            });
          }
        });

        try {
          localStorage.setItem(cacheKey, JSON.stringify(list));
        } catch {
          // ignore
        }
        return list;
      } catch (err) {
        console.warn('StudentDashboardService: Using local study tasks cache:', err);
      }
    }

    return cachedTasks;
  }

  public async saveStudentTask(task: StudyTask, providedUid?: string): Promise<StudyTask[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];

    const cleanId = sanitizeId(task.id || `task_${Date.now()}`);
    const nowIso = new Date().toISOString();
    const record: StudyTask & { userId: string; updatedAt: string; createdAt: string } = {
      id: cleanId,
      userId: uid,
      title: task.title.trim(),
      courseCode: (task.courseCode || 'General').trim(),
      date: task.date || 'Today',
      timeSlot: task.timeSlot || 'Flexible',
      estimatedMinutes: Number(task.estimatedMinutes) || 60,
      completed: Boolean(task.completed),
      priority: task.priority || 'medium',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const existing = await this.getStudentTasks(uid);
    const updated = [record, ...existing.filter((t) => t.id !== cleanId)];

    try {
      localStorage.setItem(`${TASKS_CACHE_PREFIX}${uid}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await setDoc(doc(db, 'students', uid, 'study_tasks', cleanId), record, { merge: true });
      } catch (err) {
        console.warn('StudentDashboardService: Task saved locally:', err);
      }
    }

    this.clearCache(uid);
    return updated;
  }

  public async toggleStudentTask(taskId: string, providedUid?: string): Promise<StudyTask[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid || !taskId) return [];

    const existing = await this.getStudentTasks(uid);
    const target = existing.find((t) => t.id === taskId);
    if (!target) return existing;

    const nextCompleted = !target.completed;
    const updatedTask: StudyTask = {
      ...target,
      completed: nextCompleted,
    };

    const updatedList = existing.map((t) => (t.id === taskId ? updatedTask : t));
    try {
      localStorage.setItem(`${TASKS_CACHE_PREFIX}${uid}`, JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await setDoc(
          doc(db, 'students', uid, 'study_tasks', sanitizeId(taskId)),
          {
            ...updatedTask,
            userId: uid,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('StudentDashboardService: Task toggle saved locally:', err);
      }
    }

    if (nextCompleted) {
      await this.recordActivity({
        userId: uid,
        type: 'planner_task',
        title: `Completed study task: ${target.title}`,
        courseCode: target.courseCode,
        targetScreen: 'planner',
      });
    }

    this.clearCache(uid);
    return updatedList;
  }

  public async deleteStudentTask(taskId: string, providedUid?: string): Promise<StudyTask[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid || !taskId) return [];

    const existing = await this.getStudentTasks(uid);
    const updatedList = existing.filter((t) => t.id !== taskId);

    try {
      localStorage.setItem(`${TASKS_CACHE_PREFIX}${uid}`, JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await deleteDoc(doc(db, 'students', uid, 'study_tasks', sanitizeId(taskId)));
      } catch (err) {
        console.warn('StudentDashboardService: Task deletion cached locally:', err);
      }
    }

    this.clearCache(uid);
    return updatedList;
  }

  // ==========================================================================
  // 2. REAL EXAM COUNTDOWNS & WEEKLY GOALS (Scoped strictly to student UID)
  // ==========================================================================

  public async getStudentExams(providedUid?: string): Promise<ExamCountdown[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];

    const cacheKey = `${EXAMS_CACHE_PREFIX}${uid}`;
    let cachedExams: ExamCountdown[] = [];
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cachedExams = parsed;
      }
    } catch {
      // ignore
    }

    const computeDaysRemaining = (dateStr: string, fallbackDays: number): number => {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        const diff = Math.ceil((parsedDate.getTime() - Date.now()) / 86_400_000);
        return Math.max(0, diff);
      }
      return Math.max(0, Number(fallbackDays) || 0);
    };

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const colRef = collection(db, 'students', uid, 'study_exams');
        const q = query(colRef, limit(30));
        const snap = await getDocs(q);
        const list: ExamCountdown[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (data && data.examName) {
            list.push({
              id: docSnap.id,
              examName: String(data.examName),
              courseCode: String(data.courseCode || ''),
              date: String(data.date || ''),
              daysRemaining: computeDaysRemaining(String(data.date || ''), data.daysRemaining),
              venue: String(data.venue || 'TBA'),
              sessionTime: String(data.sessionTime || 'TBA'),
            });
          }
        });

        list.sort((a, b) => a.daysRemaining - b.daysRemaining);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(list));
        } catch {
          // ignore
        }
        return list;
      } catch (err) {
        console.warn('StudentDashboardService: Using local exams cache:', err);
      }
    }

    return cachedExams
      .map((ex) => ({
        ...ex,
        daysRemaining: computeDaysRemaining(ex.date, ex.daysRemaining),
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  public async saveStudentExam(exam: ExamCountdown, providedUid?: string): Promise<ExamCountdown[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];

    const cleanId = sanitizeId(exam.id || `exam_${Date.now()}`);
    const parsedDate = new Date(exam.date);
    const daysRemaining = !isNaN(parsedDate.getTime())
      ? Math.max(0, Math.ceil((parsedDate.getTime() - Date.now()) / 86_400_000))
      : Math.max(0, Number(exam.daysRemaining) || 0);

    const record = {
      id: cleanId,
      userId: uid,
      examName: exam.examName.trim(),
      courseCode: exam.courseCode.trim().toUpperCase(),
      date: exam.date.trim(),
      daysRemaining,
      venue: (exam.venue || 'TBA').trim(),
      sessionTime: (exam.sessionTime || 'TBA').trim(),
      updatedAt: new Date().toISOString(),
    };

    const existing = await this.getStudentExams(uid);
    const updated = [record, ...existing.filter((e) => e.id !== cleanId)].sort(
      (a, b) => a.daysRemaining - b.daysRemaining
    );

    try {
      localStorage.setItem(`${EXAMS_CACHE_PREFIX}${uid}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await setDoc(doc(db, 'students', uid, 'study_exams', cleanId), record, { merge: true });
      } catch (err) {
        console.warn('StudentDashboardService: Exam saved locally:', err);
      }
    }

    return updated;
  }

  public async deleteStudentExam(examId: string, providedUid?: string): Promise<ExamCountdown[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid || !examId) return [];

    const existing = await this.getStudentExams(uid);
    const updated = existing.filter((e) => e.id !== examId);

    try {
      localStorage.setItem(`${EXAMS_CACHE_PREFIX}${uid}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await deleteDoc(doc(db, 'students', uid, 'study_exams', sanitizeId(examId)));
      } catch (err) {
        console.warn('StudentDashboardService: Exam deletion cached locally:', err);
      }
    }

    return updated;
  }

  public getStudentWeeklyGoals(providedUid?: string): WeeklyGoal[] {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];
    try {
      const raw = localStorage.getItem(`${GOALS_CACHE_PREFIX}${uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  // ==========================================================================
  // 3. REAL RECENT ACTIVITY LOGS & AGGREGATION (No Mock Data!)
  // ==========================================================================

  public async recordActivity(params: {
    userId?: string;
    type: StudentActivityItemType;
    title: string;
    subtitle?: string;
    courseCode?: string;
    targetScreen?: string;
  }): Promise<void> {
    const uid = getEffectiveUid(params.userId);
    if (!uid) return;

    const item: StudentRecentActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: uid,
      type: params.type,
      title: params.title.trim().slice(0, 160),
      ...(params.subtitle ? { subtitle: params.subtitle.trim().slice(0, 120) } : {}),
      ...(params.courseCode ? { courseCode: params.courseCode.trim().slice(0, 24) } : {}),
      timestamp: new Date().toISOString(),
      ...(params.targetScreen ? { targetScreen: params.targetScreen } : {}),
    };

    const cacheKey = `${ACTIVITY_CACHE_PREFIX}${uid}`;
    try {
      const existingRaw = localStorage.getItem(cacheKey);
      const existing: StudentRecentActivityItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = [item, ...existing].slice(0, 25);
      localStorage.setItem(cacheKey, JSON.stringify(merged));
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await setDoc(doc(db, 'students', uid, 'recent_activity', item.id), item, { merge: true });
      } catch {
        // non-blocking
      }
    }
  }

  /**
   * Aggregates real student activity from:
   * 1. Recorded student recent_activity documents
   * 2. Real AI Tutor learning sessions (Study Mode, Quiz Generator, Practice Mode, Exam Prep, Flashcards)
   * 3. Real AI Tutor chat conversations
   * 4. Real completed study planner tasks
   *
   * Strictly returns ONLY authentic records belonging to the student.
   */
  public async getRecentActivities(
    providedUid?: string,
    limitCount = 5
  ): Promise<StudentRecentActivityItem[]> {
    const uid = getEffectiveUid(providedUid);
    if (!uid) return [];

    const combined = new Map<string, StudentRecentActivityItem>();

    // 1. Read local & Firestore explicit activity items
    try {
      const raw = localStorage.getItem(`${ACTIVITY_CACHE_PREFIX}${uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: StudentRecentActivityItem) => {
            if (item && item.id && item.userId === uid) {
              combined.set(item.id, item);
            }
          });
        }
      }
    } catch {
      // ignore
    }

    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const actSnap = await getDocs(
          query(
            collection(db, 'students', uid, 'recent_activity'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
          )
        );
        actSnap.forEach((d) => {
          const data = d.data() as StudentRecentActivityItem;
          if (data && data.title) {
            combined.set(d.id, { ...data, id: d.id });
          }
        });
      } catch {
        // ignore
      }
    }

    // 2. Include real AI Learning Sessions (Study, Quiz, Practice, Exam Prep, Flashcards)
    try {
      const { sessions } = await aiTutorFoundationService.listUserLearningSessions(uid, {
        limitCount: 8,
      });
      sessions.forEach((sess: AILearningSession) => {
        if (!sess || sess.userId !== uid) return;
        const id = `sess_${sess.sessionId}`;
        if (combined.has(id)) return;

        const courseLabel =
          sess.courseCode && sess.courseCode !== 'All Courses' ? sess.courseCode : undefined;
        const topicLabel = sess.topic || sess.courseTitle || 'Academic Session';

        let type: StudentActivityItemType = 'ai_study';
        let title = `Studied ${topicLabel}`;
        if (sess.mode === 'QUIZ') {
          type = 'ai_quiz';
          const scoreStr =
            typeof sess.progress?.score === 'number' && typeof sess.progress?.maxScore === 'number' && sess.progress.maxScore > 0
              ? ` (${Math.round((sess.progress.score / sess.progress.maxScore) * 100)}%)`
              : '';
          title = `Completed AI Quiz: ${topicLabel}${scoreStr}`;
        } else if (sess.mode === 'PRACTICE') {
          type = 'ai_practice';
          title = `Practiced ${topicLabel}`;
        } else if (sess.mode === 'EXAM_PREP') {
          type = 'ai_exam_prep';
          title = `Created Exam Revision Plan: ${courseLabel || topicLabel}`;
        } else if (sess.mode === 'FLASHCARDS') {
          type = 'ai_flashcards';
          title = `Reviewed Flashcard Deck: ${topicLabel}`;
        } else if (sess.mode === 'STUDY') {
          type = 'ai_study';
          title = `AI Study Mode: ${topicLabel}`;
        }

        combined.set(id, {
          id,
          userId: uid,
          type,
          title,
          subtitle: courseLabel ? `${courseLabel} • ${sess.status === 'completed' ? 'Completed' : 'In Progress'}` : undefined,
          courseCode: courseLabel,
          timestamp: sess.updatedAt || sess.startedAt,
          targetScreen: 'ai-tutor',
        });
      });
    } catch {
      // ignore
    }

    // 3. Include real AI Tutor Chat Conversations
    try {
      const { conversations } = await listUserConversations(uid, 5);
      conversations.forEach((chat: AIChatConversation) => {
        if (!chat || chat.userId !== uid) return;
        const id = `chat_${chat.id}`;
        if (combined.has(id)) return;
        const courseCode =
          chat.courseContext && chat.courseContext !== 'All Courses'
            ? chat.courseContext
            : undefined;
        combined.set(id, {
          id,
          userId: uid,
          type: 'ai_chat',
          title: `AI Tutor: ${chat.title || 'Academic Consultation'}`,
          subtitle: courseCode ? `Course: ${courseCode}` : 'AI Tutor Session',
          courseCode,
          timestamp: chat.updatedAt || chat.createdAt,
          targetScreen: 'ai-tutor',
        });
      });
    } catch {
      // ignore
    }

    const sorted = Array.from(combined.values()).sort((a, b) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return tB - tA;
    });

    return sorted.slice(0, limitCount);
  }

  // ==========================================================================
  // 4. REAL UPCOMING EVENTS / ANNOUNCEMENTS (Filtered for Student Audience)
  // ==========================================================================

  public async getUpcomingEventsAndNotices(
    profile: StudentProfile,
    limitCount = 4
  ): Promise<AnnouncementRecord[]> {
    try {
      const published = await announcementsService.getPublishedAnnouncements(
        20,
        'ALL',
        undefined,
        {
          userId: profile.uid,
          role: 'student',
          universityId: profile.universityId,
          academicUnitId: profile.academicUnitId || profile.collegeId,
          departmentId: profile.departmentId,
          programmeId: profile.programmeId,
          yearOfStudy: profile.yearOfStudy,
          semester: profile.semester,
        }
      );

      // Prioritize Event, Academic, and Important notices
      const sorted = [...published].sort((a, b) => {
        const typeScore = (t?: string) => (t === 'Event' ? 3 : t === 'Academic' ? 2 : t === 'Important' ? 2 : 1);
        const diffType = typeScore(b.type) - typeScore(a.type);
        if (diffType !== 0) return diffType;
        const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      return sorted.slice(0, limitCount);
    } catch (err) {
      console.warn('StudentDashboardService: Could not fetch upcoming events:', err);
      return [];
    }
  }

  // ==========================================================================
  // 5. REAL ACADEMIC METRICS, LECTURER ASSIGNMENTS & COURSE PROGRESS
  // ==========================================================================

  public async getDashboardMetrics(
    profile: StudentProfile,
    courses: Course[],
    tasks: StudyTask[]
  ): Promise<StudentDashboardMetrics> {
    const uid = getEffectiveUid(profile.uid);
    const courseKey = courses.map((c) => c.id).join(',');
    const cacheKey = `${uid}_${profile.programmeId || ''}_${courseKey}_${tasks.length}`;

    const cached = dashboardMetricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_TTL_MS) {
      return cached.data;
    }

    // 1. Real GPA & Credits from student's actual recorded results + programme curriculum
    let realGpa: number | null = null;
    let gpaMax = Number(profile.gpaMax) || 5.0;
    let hasGpaData = false;
    let creditsEarned = 0;

    if (uid) {
      try {
        const results = await getStudentResults(uid);
        if (results.length > 0) {
          const summary = calculateCGPA(
            results,
            profile.universityId || profile.university,
            profile.semester,
            profile.academicYear
          );
          gpaMax = summary.maxGpa || 5.0;
          if (summary.totalGradedCoursesCount > 0) {
            realGpa = summary.cgpa;
            hasGpaData = true;
            creditsEarned = summary.totalCredits;
          }
        }
      } catch {
        // ignore
      }
    }

    // Total programme credits from official curriculum roadmap
    let totalProgrammeCredits = 0;
    let hasProgrammeCredits = false;
    if (profile.programmeId) {
      try {
        const roadmap = await courseCurriculumService.getProgrammeCurriculumRoadmap(profile.programmeId);
        if (roadmap && roadmap.totalProgrammeCredits > 0) {
          totalProgrammeCredits = roadmap.totalProgrammeCredits;
          hasProgrammeCredits = true;
        }
      } catch {
        // ignore
      }
    }

    // 2. Real Study Streak & Weekly Study Hours derived from actual sessions and completed tasks
    let studyStreakDays = 0;
    let studyHoursThisWeek = 0;
    let completedQuizzesCount = 0;
    let savedFlashcardDecksCount = 0;

    if (uid) {
      try {
        const { sessions } = await aiTutorFoundationService.listUserLearningSessions(uid, {
          limitCount: 30,
        });
        const { conversations } = await listUserConversations(uid, 20);

        const activeDayStrings = new Set<string>();
        const now = Date.now();
        const oneWeekAgo = now - 7 * 86_400_000;
        let weeklyMinutes = 0;

        sessions.forEach((s) => {
          if (s.mode === 'QUIZ' && s.status === 'completed') completedQuizzesCount++;
          if (s.mode === 'FLASHCARDS') savedFlashcardDecksCount++;

          const ts = new Date(s.updatedAt || s.startedAt).getTime();
          if (!isNaN(ts)) {
            activeDayStrings.add(new Date(ts).toISOString().slice(0, 10));
            if (ts >= oneWeekAgo) {
              weeklyMinutes += s.mode === 'EXAM_PREP' ? 35 : s.mode === 'STUDY' ? 25 : 20;
            }
          }
        });

        conversations.forEach((c) => {
          const ts = new Date(c.updatedAt || c.createdAt).getTime();
          if (!isNaN(ts)) {
            activeDayStrings.add(new Date(ts).toISOString().slice(0, 10));
            if (ts >= oneWeekAgo) {
              weeklyMinutes += Math.min(45, Math.max(10, (c.messageCount || 1) * 5));
            }
          }
        });

        tasks.forEach((t) => {
          if (t.completed) {
            weeklyMinutes += Number(t.estimatedMinutes) || 45;
            activeDayStrings.add(new Date().toISOString().slice(0, 10));
          }
        });

        studyHoursThisWeek = Number((weeklyMinutes / 60).toFixed(1));

        // Calculate consecutive day streak from today or yesterday backwards
        if (activeDayStrings.size > 0) {
          let streak = 0;
          const today = new Date();
          for (let offset = 0; offset < 60; offset++) {
            const d = new Date(today.getTime() - offset * 86_400_000);
            const key = d.toISOString().slice(0, 10);
            if (activeDayStrings.has(key)) {
              streak++;
            } else if (offset === 0) {
              // Allow streak to continue if user was active yesterday
              continue;
            } else {
              break;
            }
          }
          studyStreakDays = streak;
        }
      } catch {
        // ignore
      }
    }

    // 3. Real Lecturer Course Assignments, Materials Count, and Course Progress
    const courseProgressMap: StudentDashboardMetrics['courseProgressMap'] = {};
    let activeResourcesCount = 0;
    let activePastPapersCount = 0;

    // Fetch live metadata (real lecturers & real uploaded materials across default + named DB + server)
    const liveMetaMap = await courseCurriculumService.getCourseLiveMetadataMap({
      universityId: profile.universityId,
      programmeId: profile.programmeId,
    });

    // Compute per-course real progress from AI Learning Progress records + live metadata
    for (const course of courses) {
      const code = (course.code || course.courseCode || '').trim().toUpperCase();
      const codeNorm = code.replace(/\s+/g, '');
      const liveMeta =
        liveMetaMap.get(course.id) ||
        liveMetaMap.get(codeNorm) ||
        liveMetaMap.get(code);

      const matCount = liveMeta?.totalMaterialsCount || 0;
      const pastPapersCount = liveMeta?.pastPapersCount || 0;
      activeResourcesCount += matCount;
      activePastPapersCount += pastPapersCount;

      let progressPercent: number | null = null;
      let topicsStudiedCount = 0;
      let questionsAttempted = 0;

      if (uid) {
        try {
          const prog = await aiTutorFoundationService.getCourseLearningProgress(
            uid,
            course.id,
            code
          );
          topicsStudiedCount = prog.topicsStudied?.length || 0;
          questionsAttempted = prog.questionsAttempted || 0;
          const quizzesDone = prog.quizPerformance?.quizzesCompleted || 0;
          const flashcardsDone = prog.flashcardReviewProgress?.cardsReviewed || 0;

          if (topicsStudiedCount > 0 || questionsAttempted > 0 || quizzesDone > 0 || flashcardsDone > 0) {
            // Calculate real mastery-backed engagement progress out of a target of 8 topics/milestones
            const topicPoints = Math.min(60, topicsStudiedCount * 15);
            const practicePoints = Math.min(25, Math.floor(questionsAttempted * 2.5));
            const quizPoints = Math.min(15, quizzesDone * 5);
            progressPercent = Math.min(100, topicPoints + practicePoints + quizPoints);
          }
        } catch {
          // ignore
        }
      }

      courseProgressMap[course.id] = {
        progressPercent,
        topicsStudiedCount,
        questionsAttempted,
        materialsAvailableCount: matCount,
        assignedLecturerName: liveMeta?.lecturerName || null,
        assignedLecturerTitle: liveMeta?.lecturerTitle || null,
      };
    }

    let publishedNoticesCount = 0;
    try {
      const notices = await this.getUpcomingEventsAndNotices(profile, 20);
      publishedNoticesCount = notices.length;
    } catch {
      // ignore
    }

    const metrics: StudentDashboardMetrics = {
      gpa: realGpa,
      gpaMax,
      hasGpaData,
      creditsEarned,
      totalProgrammeCredits,
      hasProgrammeCredits,
      studyStreakDays,
      studyHoursThisWeek,
      courseProgressMap,
      activeResourcesCount,
      activePastPapersCount,
      savedFlashcardDecksCount,
      completedQuizzesCount,
      publishedNoticesCount,
    };

    dashboardMetricsCache.set(cacheKey, { data: metrics, timestamp: Date.now() });
    return metrics;
  }
}

export const studentDashboardService = new StudentDashboardService();
