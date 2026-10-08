import { auth } from './firebase';
import { AnalyticsEventType, AnalyticsFeatureType } from '../types';
import { studentDashboardService } from './studentDashboardService';

interface TrackEventPayload {
  eventType: AnalyticsEventType;
  feature: AnalyticsFeatureType;
  metadata?: Record<string, any>;
  userId?: string;
  userRole?: 'student' | 'lecturer' | 'admin';
}

class AnalyticsTrackerService {
  private queue: Array<TrackEventPayload & { id: string; timestamp: string }> = [];
  private flushTimeout: any = null;
  private FLUSH_INTERVAL_MS = 1500; // Batch and flush every 1.5 seconds

  /**
   * Resolve active user identity and role safely
   */
  private getUserContext(): { userId: string; userRole: 'student' | 'lecturer' | 'admin' } {
    const user = auth.currentUser;
    let userId = user?.uid || 'guest_user';
    let userRole: 'student' | 'lecturer' | 'admin' = 'student';

    // Check stored lecturer session
    try {
      const lectRaw = localStorage.getItem('venue_lecturer_account');
      if (lectRaw) {
        const lect = JSON.parse(lectRaw);
        if (lect?.id || lect?.email) {
          userId = lect.id || userId;
          userRole = 'lecturer';
          return { userId, userRole };
        }
      }
    } catch {
      // ignore
    }

    // Check stored student profile
    try {
      const stuRaw = localStorage.getItem('venue_student_profile');
      if (stuRaw) {
        const stu = JSON.parse(stuRaw);
        if (stu?.uid) {
          userId = stu.uid;
        }
      }
    } catch {
      // ignore
    }

    // Check admin
    if (user?.email && (user.email.includes('admin') || user.email === 'binsaid679@gmail.com')) {
      userRole = 'admin';
    }

    return { userId, userRole };
  }

  /**
   * Enqueue an analytics event (non-blocking, batched)
   */
  track(payload: TrackEventPayload): void {
    try {
      const ctx = this.getUserContext();
      const event = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventType: payload.eventType,
        feature: payload.feature,
        userId: payload.userId || ctx.userId,
        userRole: payload.userRole || ctx.userRole,
        metadata: payload.metadata || {},
        timestamp: new Date().toISOString(),
      };

      this.queue.push(event);

      if (!this.flushTimeout) {
        this.flushTimeout = setTimeout(() => this.flush(), this.FLUSH_INTERVAL_MS);
      }
    } catch (err) {
      // Analytics must never break the main app experience
      console.warn('Analytics track error:', err);
    }
  }

  /**
   * Flush queued events to backend
   */
  private async flush(): Promise<void> {
    this.flushTimeout = null;
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      // Silently fail on network disruption; no infinite retries
    }
  }

  // Convenient typed helpers
  trackMaterialView(materialId: string, title?: string, courseCode?: string, materialType?: string): void {
    this.track({
      eventType: 'material_view',
      feature: 'materials',
      metadata: { materialId, title, courseCode, materialType },
    });
    if (title) {
      studentDashboardService
        .recordActivity({
          type: 'material_view',
          title: `Opened ${title}`,
          subtitle: materialType ? `${materialType}${courseCode ? ` • ${courseCode}` : ''}` : courseCode,
          courseCode,
          targetScreen: 'resources',
        })
        .catch(() => {});
    }
  }

  trackMaterialDownload(materialId: string, title?: string, courseCode?: string, materialType?: string): void {
    this.track({
      eventType: 'material_download',
      feature: 'materials',
      metadata: { materialId, title, courseCode, materialType },
    });
    if (title) {
      studentDashboardService
        .recordActivity({
          type: 'material_download',
          title: `Downloaded ${title}`,
          subtitle: materialType ? `${materialType}${courseCode ? ` • ${courseCode}` : ''}` : courseCode,
          courseCode,
          targetScreen: 'resources',
        })
        .catch(() => {});
    }
  }

  trackQuizAttempt(quizId: string, courseCode: string, score?: number, totalQuestions?: number): void {
    this.track({
      eventType: 'quiz_attempt',
      feature: 'quizzes',
      metadata: { quizId, courseCode, score, totalQuestions },
    });
  }

  trackPlannerTask(action: 'create' | 'complete' | 'edit', taskId: string, courseCode?: string): void {
    this.track({
      eventType: 'planner_task',
      feature: 'study_planner',
      metadata: { action, taskId, courseCode },
    });
  }

  trackCourseView(courseCode: string, courseTitle?: string): void {
    this.track({
      eventType: 'course_view',
      feature: 'courses',
      metadata: { courseCode, courseTitle },
    });
  }

  trackAnnouncementRead(announcementId: string, title?: string): void {
    this.track({
      eventType: 'announcement_read',
      feature: 'announcements',
      metadata: { announcementId, title },
    });
  }

  trackAITutorQuery(courseContext?: string, queryLength?: number): void {
    this.track({
      eventType: 'ai_tutor_query',
      feature: 'ai_tutor',
      metadata: { courseContext, queryLength },
    });
  }
}

export const analyticsTracker = new AnalyticsTrackerService();
