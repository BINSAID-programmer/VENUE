import {
  collection,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { db, dbDefault } from './firebase';
import { authenticatedFetch } from './apiClient';
import {
  AdminAdvancedAnalytics,
  AnalyticsDateRange,
  AnalyticsRoleFilter,
  AnalyticsFeatureType,
  UserGrowthDataPoint,
} from '../types';

interface CacheEntry {
  data: AdminAdvancedAnalytics;
  timestamp: number;
}

class AdminAnalyticsService {
  private cache: Map<string, CacheEntry> = new Map();
  private CACHE_TTL_MS = 30000; // 30 seconds caching to avoid hammering database

  /**
   * Helper to safely get collection count from Firestore
   */
  private async getFirestoreCount(collectionName: string, fallbackCount: number = 0): Promise<number> {
    try {
      const snap = await getCountFromServer(collection(db, collectionName));
      const count = snap.data().count;
      return count > 0 ? count : fallbackCount;
    } catch {
      try {
        const snapDef = await getCountFromServer(collection(dbDefault, collectionName));
        const count = snapDef.data().count;
        return count > 0 ? count : fallbackCount;
      } catch {
        return fallbackCount;
      }
    }
  }

  /**
   * Live document count: the larger of the main and legacy (default) databases,
   * or null when neither can be read. Never returns invented numbers.
   */
  private async liveCount(collectionName: string): Promise<number | null> {
    const results = await Promise.all(
      [db, dbDefault].map(async (database) => {
        try {
          return (await getCountFromServer(collection(database, collectionName))).data().count;
        } catch {
          return null;
        }
      })
    );
    const ok = results.filter((n): n is number => typeof n === 'number');
    return ok.length ? Math.max(...ok) : null;
  }

  /**
   * Helper to fetch published announcements count
   */
  private async getPublishedAnnouncementsCount(): Promise<number> {
    try {
      const q = query(collection(db, 'announcements'), where('status', '==', 'Published'));
      const snap = await getCountFromServer(q);
      return snap.data().count;
    } catch {
      try {
        const snap = await getCountFromServer(collection(db, 'announcements'));
        return snap.data().count;
      } catch {
        return 0;
      }
    }
  }

  /**
   * Fetch complete Admin Advanced Analytics Overview with filters
   */
  async getAnalyticsOverview(
    range: AnalyticsDateRange = '30d',
    role: AnalyticsRoleFilter = 'all',
    feature: AnalyticsFeatureType = 'all',
    forceRefresh: boolean = false
  ): Promise<AdminAdvancedAnalytics> {
    const cacheKey = `${range}_${role}_${feature}`;
    const cached = this.cache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // 1. Try server endpoint first for optimized backend aggregation
      const params = new URLSearchParams({
        range,
        role,
        feature,
      });
      if (forceRefresh) params.append('refresh', 'true');

      const res = await authenticatedFetch(`/api/admin/analytics/overview?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.overview) {
          const overview = json.overview as AdminAdvancedAnalytics;

          // Firestore is the source of truth: the server's own store can be stale or reset.
          try {
            const [students, lecturers, admins, units, depts, progs, courses, materials, unis, anns] =
              await Promise.all([
                this.liveCount('students'),
                this.liveCount('lecturers'),
                this.liveCount('admin_users'),
                this.liveCount('academic_units'),
                this.liveCount('departments'),
                this.liveCount('programmes'),
                this.liveCount('canonical_courses'),
                this.liveCount('materials'),
                this.liveCount('universities'),
                this.getPublishedAnnouncementsCount(),
              ]);
            const at = overview.allTime;
            if (students !== null) at.totalStudents = Math.max(students, 0);
            if (lecturers !== null) at.totalLecturers = lecturers;
            if (admins !== null) at.totalAdministrators = admins;
            if (units !== null) at.totalAcademicUnits = units;
            if (depts !== null) at.totalDepartments = depts;
            if (progs !== null) at.totalProgrammes = progs;
            if (courses !== null) at.totalCourses = courses;
            if (materials !== null) {
              at.totalMaterials = materials;
              overview.materials.totalMaterials = materials;
            }
            if (anns > 0) at.totalPublishedAnnouncements = Math.max(anns, 0);
            at.totalUsers = at.totalStudents + at.totalLecturers + at.totalAdministrators;
            if (unis !== null && overview.catalogue) overview.catalogue.universities = unis;
            if (overview.catalogue) {
              overview.catalogue.academicUnits = at.totalAcademicUnits;
              overview.catalogue.departments = at.totalDepartments;
              overview.catalogue.programmes = at.totalProgrammes;
              overview.catalogue.canonicalCourses = at.totalCourses;
            }
          } catch {
            // Keep server-calculated counts
          }

          this.cache.set(cacheKey, { data: overview, timestamp: Date.now() });
          return overview;
        }
      }
    } catch (err) {
      console.warn('AdminAnalyticsService: Server endpoint note, computing Firestore direct fallback:', err);
    }

    // 2. Direct Firestore fallback aggregation
    const fallbackOverview = await this.buildFirestoreFallback(range);
    this.cache.set(cacheKey, { data: fallbackOverview, timestamp: Date.now() });
    return fallbackOverview;
  }

  /**
   * Fallback aggregation directly from Firestore collections and authoritative data
   */
  private async buildFirestoreFallback(range: AnalyticsDateRange): Promise<AdminAdvancedAnalytics> {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const sinceDate = new Date(now.getTime() - days * 86400000);

    const [
      uniCount,
      unitCount,
      deptCount,
      progCount,
      canonCount,
      matCount,
      studCount,
      lectCount,
      adminCount,
      pubAnnCount,
    ] = await Promise.all([
      this.liveCount('universities'),
      this.liveCount('academic_units'),
      this.liveCount('departments'),
      this.liveCount('programmes'),
      this.liveCount('canonical_courses'),
      this.liveCount('materials'),
      this.liveCount('students'),
      this.liveCount('lecturers'),
      this.liveCount('admin_users'),
      this.getPublishedAnnouncementsCount(),
    ]).then((arr) => arr.map((n) => n ?? 0) as number[]) as number[];

    const totalAdmins = adminCount;
    const totalUsers = studCount + lectCount + totalAdmins;

    // Build day-by-day points for user growth
    const points: UserGrowthDataPoint[] = [];
    const numPoints = Math.min(days, 14);
    const stepDays = Math.max(1, Math.floor(days / numPoints));

    const runningUsers = totalUsers;
    for (let i = numPoints; i >= 0; i--) {
      const d = new Date(now.getTime() - i * stepDays * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      points.push({
        date: dateStr,
        label,
        newUsers: 0,
        cumulativeUsers: runningUsers,
      });
    }

    // Active-user figures need event tracking from the server; never invent them.
    const dau = 0;
    const wau = 0;
    const mau = 0;

    return {
      allTime: {
        totalUsers,
        totalStudents: studCount,
        totalLecturers: lectCount,
        totalAdministrators: totalAdmins,
        totalAcademicUnits: unitCount,
        totalDepartments: deptCount,
        totalProgrammes: progCount,
        totalCourses: canonCount,
        totalMaterials: matCount,
        totalPublishedAnnouncements: pubAnnCount,
      },
      period: {
        range,
        startDate: sinceDate.toISOString(),
        endDate: now.toISOString(),
        newUsers: 0,
        newStudents: 0,
        newLecturers: 0,
        newMaterials: 0,
        newAnnouncements: 0,
        aiRequests: 0,
      },
      engagement: {
        dau,
        wau,
        mau,
        stickinessRatio: 0,
        newRegistrationsInPeriod: 0,
        returningUsersInPeriod: 0,
        activeUsersTrend: points.map((p) => ({
          date: p.date,
          label: p.label,
          activeUsers: 0,
          eventsCount: 0,
        })),
        activityDefinition:
          'An active user is defined as any verified student, faculty lecturer, or administrator who initiated at least one meaningful interaction (such as an AI Tutor query, academic material open/download, quiz attempt, study planner task, or announcement read) within the specified timeframe.',
      },
      featureUsage: {
        totalFeatureInteractions: 0,
        features: [
          { feature: 'ai_tutor', displayName: 'AI Tutor', totalEvents: 0, periodEvents: 0, uniqueUsers: 0, percentageOfTotal: 0, primaryActionName: 'Requests' },
          { feature: 'materials', displayName: 'Academic Materials', totalEvents: 0, periodEvents: 0, uniqueUsers: 0, percentageOfTotal: 0, primaryActionName: 'Opens & Downloads' },
          { feature: 'study_planner', displayName: 'Study Planner', totalEvents: 0, periodEvents: 0, uniqueUsers: 0, percentageOfTotal: 0, primaryActionName: 'Tasks Logged' },
          { feature: 'quizzes', displayName: 'Quizzes & Practice', totalEvents: 0, periodEvents: 0, uniqueUsers: 0, percentageOfTotal: 0, primaryActionName: 'Quiz Attempts' },
          { feature: 'courses', displayName: 'Course Curricula', totalEvents: 0, periodEvents: 0, uniqueUsers: 0, percentageOfTotal: 0, primaryActionName: 'Syllabus Views' },
          { feature: 'announcements', displayName: 'Announcements', totalEvents: 0, periodEvents: 0, uniqueUsers: 0, percentageOfTotal: 0, primaryActionName: 'Notices Read' },
        ],
      },
      materialEngagement: {
        totalViews: 0,
        totalDownloads: 0,
        mostViewed: [],
        mostDownloaded: [],
        byCourse: [],
        byType: {},
      },
      retention: {
        overallDay1: null,
        overallDay7: null,
        overallDay30: null,
        cohorts: [],
        hasSufficientHistoricalData: false,
        explanationNote:
          'Cohort retention measures the percentage of newly registered users who return to VENUE on Day 1, Day 7, and Day 30. Historical cohort tracking populates automatically as accounts mature across consecutive 30-day windows.',
      },
      userGrowth: {
        range,
        totalUsers,
        periodNewUsers: 0,
        timestampCoverageCount: 0,
        timestampCoveragePercent: 0,
        points,
        hasTimestampLimitation: true,
      },
      materials: {
        totalMaterials: matCount,
        byType: {},
        byUploaderRole: { admin: 0, lecturer: 0, other: 0 },
        periodUploadedCount: 0,
      },
      catalogue: {
        universities: uniCount,
        academicUnits: unitCount,
        departments: deptCount,
        programmes: progCount,
        canonicalCourses: canonCount,
        totalCurriculumOfferings: 0,
      },
      aiTutor: {
        totalRequests: 0,
        periodRequests: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 100,
        approxTotalCostUsd: 0,
        modelDistribution: {},
        recentLogs: [],
      },
      extendedAiTutor: {
        totalRequests: 0,
        periodRequests: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 100,
        approxTotalCostUsd: 0,
        modelDistribution: {},
        recentLogs: [],
        dailyTrends: [],
        averageTokensPerRequest: 0,
        averagePromptTokens: 0,
        averageCompletionTokens: 0,
      },
      lastAggregatedAt: now.toISOString(),
    };
  }

  /**
   * Clear in-memory cache to force a fresh read
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
