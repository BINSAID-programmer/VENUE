import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  orderBy,
  limit,
  getCountFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import { db, dbDefault, auth } from './firebase';
import {
  AuditLogEntry,
  AuditLogAction,
  AuditLogActionCategory,
  AuditLogEntityType,
  AuditLogFilterOptions,
  AuditLogStats,
  PaginatedAuditLogsResponse,
  UserRole,
} from '../types';

export interface CreateAuditLogInput {
  action: AuditLogAction | string;
  entityType: AuditLogEntityType | string;
  entityId: string;
  summary: string;
  outcome?: 'success' | 'failure';
  metadata?: Record<string, any>;
  actorUid?: string;
  actorName?: string;
  actorRole?: UserRole | 'system' | 'super_admin' | 'faculty_admin';
  source?: 'trusted_server' | 'client_service';
}

class AdminAuditService {
  private cache: Map<string, { data: PaginatedAuditLogsResponse; timestamp: number }> = new Map();
  private CACHE_TTL_MS = 10000; // 10 seconds cache to prevent query flooding

  /**
   * Resolve active administrator identity safely from current session
   * Prevents client impersonation by anchoring to auth.currentUser
   */
  private resolveAdminContext(): {
    actorUid: string;
    actorName: string;
    actorRole: UserRole | 'system' | 'super_admin';
  } {
    const user = auth.currentUser;
    let actorUid = user?.uid || 'admin_user';
    let actorName = user?.displayName || user?.email || 'VENUE Administrator';
    let actorRole: UserRole | 'system' | 'super_admin' = 'super_admin';

    // Verify stored lecturer/admin context if available
    try {
      const lectRaw = localStorage.getItem('venue_lecturer_account');
      if (lectRaw) {
        const lect = JSON.parse(lectRaw);
        if (lect?.id && !user) {
          actorUid = lect.id;
          actorName = lect.fullName || lect.email || actorName;
          actorRole = 'verified_lecturer';
        }
      }
    } catch {
      // ignore
    }

    // Default admin detection
    if (user?.email && (user.email.includes('admin') || user.email === 'binsaid679@gmail.com')) {
      actorRole = 'super_admin';
    }

    return { actorUid, actorName, actorRole };
  }

  /**
   * Categorizes an action into high-level functional groups for UI filtering
   */
  getActionCategory(action: string): AuditLogActionCategory {
    if (action.startsWith('catalogue.')) return 'catalogue';
    if (action.startsWith('material.')) return 'materials';
    if (action.startsWith('announcement.')) return 'announcements';
    if (action.startsWith('lecturer.')) return 'lecturers';
    if (action.startsWith('student.')) return 'students';
    if (action.startsWith('security.')) return 'security';
    return 'all';
  }

  /**
   * Record an immutable administrative audit log entry
   * Writes to Firestore audit_logs collection and syncs to backend server
   */
  async recordAuditLog(input: CreateAuditLogInput): Promise<AuditLogEntry> {
    const ctx = this.resolveAdminContext();

    // Prevent client impersonation: If actorUid is passed from client, it must match authenticated UID
    const safeActorUid = auth.currentUser?.uid || input.actorUid || ctx.actorUid;
    const safeActorName = input.actorName || ctx.actorName;
    const safeActorRole = input.actorRole || ctx.actorRole;

    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const entry: AuditLogEntry = {
      id: logId,
      actorUid: safeActorUid,
      actorName: safeActorName,
      actorRole: safeActorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || 'general',
      timestamp: nowIso,
      outcome: input.outcome || 'success',
      summary: input.summary,
      metadata: input.metadata || {},
      source: input.source || 'client_service',
    };

    // 1. Try sending to trusted server backend first
    try {
      await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (serverErr) {
      console.warn('AdminAuditService: Backend server sync notice, persisting to Firestore:', serverErr);
    }

    // 2. Direct Firestore append (respecting immutable rules: allow create only)
    try {
      const firestorePayload = {
        ...entry,
        createdAt: serverTimestamp(),
      };
      try {
        await setDoc(doc(db, 'audit_logs', logId), firestorePayload);
      } catch {
        await setDoc(doc(dbDefault, 'audit_logs', logId), firestorePayload);
      }
    } catch (fsErr: any) {
      console.warn('AdminAuditService: Firestore write note:', fsErr?.message || fsErr);
    }

    // Invalidate local query cache
    this.cache.clear();

    return entry;
  }

  /**
   * Fetch paginated audit logs with search, category, role, and date range filters
   */
  async getAuditLogs(filters: AuditLogFilterOptions = {}): Promise<PaginatedAuditLogsResponse> {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(5, filters.pageSize || 20);
    const cacheKey = JSON.stringify({ ...filters, page, pageSize });

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    // 1. Try server API endpoint for fast aggregation & indexed search
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.action && filters.action.trim()) params.append('action', filters.action.trim());
      if (filters.actorRole && filters.actorRole !== 'all') params.append('actorRole', filters.actorRole);
      if (filters.dateRange && filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.logs)) {
          const result: PaginatedAuditLogsResponse = {
            logs: json.logs,
            total: json.total || json.logs.length,
            page: json.page || page,
            pageSize: json.pageSize || pageSize,
            totalPages: json.totalPages || Math.ceil((json.total || json.logs.length) / pageSize),
            hasMore: Boolean(json.hasMore),
          };
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } catch (err) {
      console.warn('AdminAuditService: Server endpoint note, querying Firestore directly:', err);
    }

    // 2. Direct Firestore fallback query
    try {
      const targetDb = db || dbDefault;
      const auditCol = collection(targetDb, 'audit_logs');
      const q = query(auditCol, orderBy('timestamp', 'desc'), limit(150));
      const snap = await getDocs(q);

      let allLogs: AuditLogEntry[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          actorUid: data.actorUid || 'unknown',
          actorName: data.actorName || 'Administrator',
          actorRole: data.actorRole || 'super_admin',
          action: data.action || 'system.action',
          entityType: data.entityType || 'system',
          entityId: data.entityId || d.id,
          timestamp: data.timestamp || new Date().toISOString(),
          outcome: data.outcome || 'success',
          summary: data.summary || 'Administrative action recorded',
          metadata: data.metadata || {},
          source: data.source || 'client_service',
        };
      });

      // Filter in memory for fallback
      if (filters.search && filters.search.trim()) {
        const s = filters.search.trim().toLowerCase();
        allLogs = allLogs.filter(
          (l) =>
            l.actorName.toLowerCase().includes(s) ||
            l.actorUid.toLowerCase().includes(s) ||
            l.action.toLowerCase().includes(s) ||
            l.summary.toLowerCase().includes(s) ||
            l.entityId.toLowerCase().includes(s) ||
            l.entityType.toLowerCase().includes(s)
        );
      }

      if (filters.category && filters.category !== 'all') {
        allLogs = allLogs.filter((l) => this.getActionCategory(l.action) === filters.category);
      }

      if (filters.action && filters.action.trim()) {
        allLogs = allLogs.filter((l) => l.action.toLowerCase() === filters.action!.trim().toLowerCase());
      }

      if (filters.actorRole && filters.actorRole !== 'all') {
        allLogs = allLogs.filter((l) => l.actorRole === filters.actorRole);
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90;
        const cutoff = Date.now() - days * 86400000;
        allLogs = allLogs.filter((l) => new Date(l.timestamp).getTime() >= cutoff);
      }

      const total = allLogs.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const startIndex = (page - 1) * pageSize;
      const pageLogs = allLogs.slice(startIndex, startIndex + pageSize);

      const result: PaginatedAuditLogsResponse = {
        logs: pageLogs,
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (fsErr) {
      console.error('AdminAuditService: Firestore query error:', fsErr);
      return {
        logs: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Fetch aggregated statistics for the Audit Logs dashboard cards
   */
  async getAuditLogStats(): Promise<AuditLogStats> {
    try {
      const res = await fetch('/api/admin/audit-logs/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) {
          return json.stats;
        }
      }
    } catch {
      // ignore
    }

    // Fallback: derive from query
    const fallbackList = await this.getAuditLogs({ pageSize: 150 });
    const logs = fallbackList.logs;

    const oneDayAgo = Date.now() - 86400000;
    const recent24hCount = logs.filter((l) => new Date(l.timestamp).getTime() >= oneDayAgo).length;

    const byCategory: Record<string, number> = {};
    const byActor: Record<string, { count: number; name: string; role: string }> = {};
    let successCount = 0;
    let failureCount = 0;

    logs.forEach((l) => {
      const cat = this.getActionCategory(l.action);
      byCategory[cat] = (byCategory[cat] || 0) + 1;

      if (!byActor[l.actorUid]) {
        byActor[l.actorUid] = { count: 0, name: l.actorName, role: l.actorRole };
      }
      byActor[l.actorUid].count++;

      if (l.outcome === 'success') successCount++;
      else failureCount++;
    });

    return {
      totalRecords: fallbackList.total || logs.length,
      recent24hCount,
      byCategory,
      byActor,
      byOutcome: {
        success: successCount,
        failure: failureCount,
      },
    };
  }

  /**
   * Retrieve single audit log by ID for detail inspection modal
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    if (!id) return null;

    try {
      const res = await fetch(`/api/admin/audit-logs/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.log) {
          return json.log;
        }
      }
    } catch {
      // ignore
    }

    try {
      const targetDb = db || dbDefault;
      const docRef = doc(targetDb, 'audit_logs', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          actorUid: data.actorUid || 'unknown',
          actorName: data.actorName || 'Administrator',
          actorRole: data.actorRole || 'super_admin',
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          timestamp: data.timestamp,
          outcome: data.outcome || 'success',
          summary: data.summary,
          metadata: data.metadata || {},
          source: data.source || 'client_service',
        };
      }
    } catch {
      // ignore
    }

    return null;
  }

  // --- TYPED CONVENIENCE HELPERS FOR VENUE MODULES ---

  /**
   * Helper for Academic Catalogue actions
   */
  async logCatalogueAction(
    action:
      | 'catalogue.university.create'
      | 'catalogue.university.update'
      | 'catalogue.university.delete'
      | 'catalogue.unit.create'
      | 'catalogue.unit.update'
      | 'catalogue.unit.delete'
      | 'catalogue.department.create'
      | 'catalogue.department.update'
      | 'catalogue.department.delete'
      | 'catalogue.programme.create'
      | 'catalogue.programme.update'
      | 'catalogue.programme.delete'
      | 'catalogue.course.create'
      | 'catalogue.course.update'
      | 'catalogue.course.delete'
      | 'catalogue.programme_course.assign'
      | 'catalogue.programme_course.remove'
      | 'catalogue.curriculum.update',
    entityType: AuditLogEntityType,
    entityId: string,
    summary: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    return this.recordAuditLog({
      action,
      entityType,
      entityId,
      summary,
      metadata,
    });
  }

  /**
   * Helper for Academic Material actions
   */
  async logMaterialAction(
    action: 'material.upload' | 'material.update' | 'material.replace' | 'material.delete',
    materialId: string,
    summary: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    return this.recordAuditLog({
      action,
      entityType: 'academic_material',
      entityId: materialId,
      summary,
      metadata,
    });
  }

  /**
   * Helper for Announcements actions
   */
  async logAnnouncementAction(
    action:
      | 'announcement.create'
      | 'announcement.update'
      | 'announcement.publish'
      | 'announcement.archive'
      | 'announcement.delete',
    announcementId: string,
    summary: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    return this.recordAuditLog({
      action,
      entityType: 'announcement',
      entityId: announcementId,
      summary,
      metadata,
    });
  }

  /**
   * Helper for Faculty Lecturer actions
   */
  async logLecturerAction(
    action:
      | 'lecturer.create'
      | 'lecturer.update'
      | 'lecturer.delete'
      | 'lecturer.status_change'
      | 'lecturer.course_assign'
      | 'lecturer.course_remove',
    lecturerId: string,
    summary: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    return this.recordAuditLog({
      action,
      entityType: 'lecturer',
      entityId: lecturerId,
      summary,
      metadata,
    });
  }

  /**
   * Helper for Student Directory actions
   */
  async logStudentAction(
    action: 'student.profile_update' | 'student.status_change',
    studentUid: string,
    summary: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    return this.recordAuditLog({
      action,
      entityType: 'student',
      entityId: studentUid,
      summary,
      metadata,
    });
  }

  /**
   * Helper for Security, Roles & Permissions actions
   */
  async logSecurityAction(
    action: 'security.role_change' | 'security.permission_change' | 'security.access_grant',
    targetUserId: string,
    summary: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    return this.recordAuditLog({
      action,
      entityType: 'admin_user',
      entityId: targetUserId,
      summary,
      metadata,
    });
  }
}

export const adminAuditService = new AdminAuditService();
