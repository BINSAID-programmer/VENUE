import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, dbDefault, auth } from './firebase';
import { adminAuditService } from './adminAuditService';
import {
  AnnouncementRecord,
  AnnouncementType,
  AnnouncementStatus,
  AnnouncementPriority,
  AnnouncementAudienceType,
  AnnouncementFilterOptions,
  UserTargetingContext,
  PaginatedAnnouncementsResponse,
} from '../types';

export interface AnnouncementFormData {
  title: string;
  content: string;
  summary?: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  priority?: AnnouncementPriority;

  // Stage 7B: Academic Audience Targeting
  audienceType?: AnnouncementAudienceType; // 'everyone' | 'targeted'
  targetUniversityId?: string;
  targetUniversityName?: string;
  targetAcademicUnitId?: string;
  targetAcademicUnitName?: string;
  targetDepartmentId?: string;
  targetDepartmentName?: string;
  targetProgrammeId?: string;
  targetProgrammeName?: string;
  targetYearOfStudy?: string;
  targetSemester?: string;
  expiresAt?: string | null;
}

export interface AnnouncementFormValidation {
  isValid: boolean;
  errors: {
    title?: string;
    content?: string;
    type?: string;
    status?: string;
    targeting?: string;
  };
}

export const ANNOUNCEMENT_TYPES: AnnouncementType[] = [
  'General',
  'Academic',
  'Important',
  'Event',
  'Maintenance',
];

export const ANNOUNCEMENT_STATUSES: AnnouncementStatus[] = [
  'Draft',
  'Published',
  'Archived',
];

export const validateAnnouncementForm = (
  data: Partial<AnnouncementFormData>
): AnnouncementFormValidation => {
  const errors: AnnouncementFormValidation['errors'] = {};

  const title = (data.title || '').trim();
  if (!title) {
    errors.title = 'Announcement title is required.';
  } else if (title.length < 3) {
    errors.title = 'Title must be at least 3 characters long.';
  } else if (title.length > 200) {
    errors.title = 'Title must not exceed 200 characters.';
  }

  const content = (data.content || '').trim();
  if (!content) {
    errors.content = 'Announcement content is required.';
  } else if (content.length < 5) {
    errors.content = 'Content must be at least 5 characters long.';
  }

  if (!data.type || !ANNOUNCEMENT_TYPES.includes(data.type)) {
    errors.type = 'Please select a valid announcement type.';
  }

  if (!data.status || !ANNOUNCEMENT_STATUSES.includes(data.status)) {
    errors.status = 'Please select a valid announcement status.';
  }

  // Targeted validation
  if (data.audienceType === 'targeted') {
    if (!data.targetUniversityId && !data.targetAcademicUnitId) {
      errors.targeting = 'Please select at least a University or Academic Unit for targeted audience.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Stage 7B: Determines if a published announcement matches a student or lecturer academic profile
 */
export function matchAnnouncementAudience(
  announcement: AnnouncementRecord,
  userContext?: UserTargetingContext
): boolean {
  const audienceType = announcement.audienceType || 'everyone';
  if (audienceType === 'everyone') {
    return true;
  }
  if (!userContext) {
    return false;
  }

  const role = userContext.role || 'student';

  // 1. University check
  if (announcement.targetUniversityId && announcement.targetUniversityId !== 'ALL') {
    const userUni = (userContext.universityId || '').toLowerCase().trim();
    const targetUni = announcement.targetUniversityId.toLowerCase().trim();
    if (userUni && !userUni.includes(targetUni) && !targetUni.includes(userUni)) {
      return false;
    }
  }

  // 2. Academic Unit check
  if (announcement.targetAcademicUnitId && announcement.targetAcademicUnitId !== 'ALL') {
    const userUnit = (userContext.academicUnitId || '').toLowerCase().trim();
    const targetUnit = announcement.targetAcademicUnitId.toLowerCase().trim();
    if (userUnit && !userUnit.includes(targetUnit) && !targetUnit.includes(userUnit)) {
      return false;
    }
  }

  // 3. Department check
  if (announcement.targetDepartmentId && announcement.targetDepartmentId !== 'ALL') {
    const userDept = (userContext.departmentId || '').toLowerCase().trim();
    const targetDept = announcement.targetDepartmentId.toLowerCase().trim();
    if (userDept && !userDept.includes(targetDept) && !targetDept.includes(userDept)) {
      return false;
    }
  }

  // If lecturer: university, academic unit, and department targeting apply
  if (role === 'lecturer') {
    return true;
  }

  // 4. Programme check (for students)
  if (announcement.targetProgrammeId && announcement.targetProgrammeId !== 'ALL') {
    const userProg = (userContext.programmeId || '').toLowerCase().trim();
    const targetProg = announcement.targetProgrammeId.toLowerCase().trim();
    if (userProg && !userProg.includes(targetProg) && !targetProg.includes(userProg)) {
      return false;
    }
  }

  // 5. Year of Study check (e.g. "Year 2", "2")
  if (announcement.targetYearOfStudy && announcement.targetYearOfStudy !== 'ALL') {
    const userYearDigits = (userContext.yearOfStudy || '').toString().toLowerCase().replace(/\D/g, '');
    const targetYearDigits = (announcement.targetYearOfStudy || '').toString().toLowerCase().replace(/\D/g, '');
    if (userYearDigits && targetYearDigits && userYearDigits !== targetYearDigits) {
      return false;
    }
  }

  // 6. Semester check (e.g. "Semester 1", "1")
  if (announcement.targetSemester && announcement.targetSemester !== 'ALL') {
    const userSemDigits = (userContext.semester || '').toString().toLowerCase().replace(/\D/g, '');
    const targetSemDigits = (announcement.targetSemester || '').toString().toLowerCase().replace(/\D/g, '');
    if (userSemDigits && targetSemDigits && userSemDigits !== targetSemDigits) {
      return false;
    }
  }

  return true;
}

class AnnouncementsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readCache: Map<string, Set<string>> = new Map();
  private CACHE_TTL_MS = 10000; // 10 seconds client cache

  private clearCache() {
    this.cache.clear();
  }

  /**
   * Fetch announcements for Admin with debounced search, status, type, and audience filtering & pagination
   */
  async getAdminAnnouncements(
    filters?: AnnouncementFilterOptions,
    page: number = 1,
    pageSize: number = 15
  ): Promise<PaginatedAnnouncementsResponse> {
    const cacheKey = `admin_${JSON.stringify({ filters, page, pageSize })}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    // 1. Try server endpoint first for durable storage and multi-criteria query
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.type && filters.type !== 'ALL') params.append('type', filters.type);
      if (filters?.audience && filters.audience !== 'ALL') params.append('audience', filters.audience);
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));

      const res = await fetch(`/api/admin/announcements?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.announcements)) {
          const result: PaginatedAnnouncementsResponse = {
            announcements: data.announcements,
            total: data.total,
            page: data.page,
            pageSize: data.pageSize,
            totalPages: data.totalPages,
            hasMore: data.hasMore,
          };
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } catch (err) {
      console.warn('AnnouncementsService: Server query note, falling back to Firestore direct:', err);
    }

    // 2. Direct Firestore fallback query
    try {
      const targetDb = db || dbDefault;
      const q = query(collection(targetDb, 'announcements'), orderBy('updatedAt', 'desc'), limit(100));

      const snap = await getDocs(q);
      let list: AnnouncementRecord[] = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));

      // In-memory filter on snapshot
      if (filters?.status && filters.status !== 'ALL') {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters?.type && filters.type !== 'ALL') {
        list = list.filter((a) => a.type === filters.type);
      }
      if (filters?.audience && filters.audience !== 'ALL') {
        list = list.filter((a) => (a.audienceType || 'everyone') === filters.audience);
      }
      if (filters?.search && filters.search.trim()) {
        const queryStr = filters.search.trim().toLowerCase();
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(queryStr) ||
            a.content.toLowerCase().includes(queryStr) ||
            (a.summary && a.summary.toLowerCase().includes(queryStr)) ||
            (a.targetProgrammeName && a.targetProgrammeName.toLowerCase().includes(queryStr)) ||
            (a.targetDepartmentName && a.targetDepartmentName.toLowerCase().includes(queryStr))
        );
      }

      const total = list.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginated = list.slice(startIndex, startIndex + pageSize);

      const result: PaginatedAnnouncementsResponse = {
        announcements: paginated,
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (fsErr) {
      console.error('Error fetching admin announcements from Firestore:', fsErr);
      return {
        announcements: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 1,
        hasMore: false,
      };
    }
  }

  /**
   * Fetch published announcements for students and lecturers feed with Stage 7B audience targeting
   */
  async getPublishedAnnouncements(
    limitCount: number = 30,
    type?: AnnouncementType | 'ALL',
    search?: string,
    userContext?: UserTargetingContext
  ): Promise<AnnouncementRecord[]> {
    const contextKey = userContext ? JSON.stringify(userContext) : 'generic';
    const cacheKey = `user_feed_${limitCount}_${type || 'ALL'}_${search || ''}_${contextKey}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    // 1. Try server endpoint first
    try {
      const params = new URLSearchParams();
      if (limitCount) params.append('limit', String(limitCount));
      if (type && type !== 'ALL') params.append('type', type);
      if (search && search.trim()) params.append('search', search.trim());
      if (userContext?.userId) params.append('userId', userContext.userId);
      if (userContext?.role) params.append('role', userContext.role);
      if (userContext?.universityId) params.append('universityId', userContext.universityId);
      if (userContext?.academicUnitId) params.append('academicUnitId', userContext.academicUnitId);
      if (userContext?.departmentId) params.append('departmentId', userContext.departmentId);
      if (userContext?.programmeId) params.append('programmeId', userContext.programmeId);
      if (userContext?.yearOfStudy) params.append('yearOfStudy', String(userContext.yearOfStudy));
      if (userContext?.semester) params.append('semester', String(userContext.semester));

      const res = await fetch(`/api/announcements?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.announcements)) {
          this.cache.set(cacheKey, { data: data.announcements, timestamp: Date.now() });
          return data.announcements;
        }
      }
    } catch (err) {
      console.warn('AnnouncementsService: Feed server note, falling back to Firestore:', err);
    }

    // 2. Direct Firestore fallback query (respecting security rule: status == 'Published')
    try {
      const targetDb = db || dbDefault;
      const q = query(
        collection(targetDb, 'announcements'),
        where('status', '==', 'Published'),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );

      const snap = await getDocs(q);
      let list: AnnouncementRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      // Filter by type
      if (type && type !== 'ALL') {
        list = list.filter((a) => a.type === type);
      }
      // Filter by search
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(s) ||
            a.content.toLowerCase().includes(s) ||
            (a.summary && a.summary.toLowerCase().includes(s))
        );
      }
      // Filter by Audience Targeting (Stage 7B)
      if (userContext) {
        list = list.filter((a) => matchAnnouncementAudience(a, userContext));
      }

      this.cache.set(cacheKey, { data: list, timestamp: Date.now() });
      return list;
    } catch (fsErr) {
      console.error('Error fetching published announcements from Firestore:', fsErr);
      return [];
    }
  }

  /**
   * Get single announcement by ID
   */
  async getAnnouncementById(id: string): Promise<AnnouncementRecord | null> {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.announcement) {
          return data.announcement;
        }
      }
    } catch {
      // ignore
    }

    try {
      const targetDb = db || dbDefault;
      const docRef = doc(targetDb, 'announcements', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as any) };
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Create an announcement (Stage 7A + 7B)
   */
  async createAnnouncement(data: AnnouncementFormData): Promise<AnnouncementRecord> {
    const validation = validateAnnouncementForm(data);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError || 'Validation failed');
    }

    const user = auth.currentUser;
    const adminUid = user?.uid || 'admin';
    const adminName = user?.displayName || user?.email || 'VENUE Administrator';

    // 1. Call server API
    let createdRecord: AnnouncementRecord | null = null;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: adminUid,
          createdByName: adminName,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.announcement) {
          createdRecord = resData.announcement;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }
    } catch (apiErr: any) {
      console.warn('AnnouncementsService create API note:', apiErr);
      if (apiErr.message && !apiErr.message.includes('fetch')) {
        throw apiErr;
      }
    }

    // 2. Also write to Firestore directly for dual-persistence and Firestore security compliance
    const now = new Date().toISOString();
    const id = createdRecord?.id || `ann_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cleanTitle = data.title.trim();
    const cleanContent = data.content.trim();
    const cleanSummary = data.summary?.trim() || cleanContent.slice(0, 160) + (cleanContent.length > 160 ? '...' : '');

    const recordToSave: AnnouncementRecord = createdRecord || {
      id,
      announcementId: id,
      title: cleanTitle,
      content: cleanContent,
      summary: cleanSummary,
      type: data.type,
      status: data.status,
      priority: data.priority || 'normal',
      audienceType: data.audienceType || 'everyone',
      targetUniversityId: data.targetUniversityId,
      targetUniversityName: data.targetUniversityName,
      targetAcademicUnitId: data.targetAcademicUnitId,
      targetAcademicUnitName: data.targetAcademicUnitName,
      targetDepartmentId: data.targetDepartmentId,
      targetDepartmentName: data.targetDepartmentName,
      targetProgrammeId: data.targetProgrammeId,
      targetProgrammeName: data.targetProgrammeName,
      targetYearOfStudy: data.targetYearOfStudy,
      targetSemester: data.targetSemester,
      expiresAt: data.expiresAt || null,
      createdBy: adminUid,
      createdByName: adminName,
      createdAt: now,
      updatedAt: now,
      updatedBy: adminUid,
      publishedAt: data.status === 'Published' ? now : null,
    };

    try {
      const targetDb = db || dbDefault;
      await setDoc(doc(targetDb, 'announcements', id), recordToSave);
    } catch (fsErr) {
      console.warn('AnnouncementsService: Firestore mirror write note:', fsErr);
    }

    // Stage 9A: Record centralized audit log
    try {
      await adminAuditService.recordAuditLog({
        action: data.status === 'Published' ? 'announcement.publish' : 'announcement.create',
        entityType: 'announcement',
        entityId: id,
        summary: `${data.status === 'Published' ? 'Published' : 'Created draft'} announcement: "${cleanTitle}"`,
        metadata: { title: cleanTitle, type: data.type, priority: data.priority || 'normal', audienceType: data.audienceType || 'everyone' },
        source: 'trusted_server',
      });
    } catch {
      // non-blocking
    }

    this.clearCache();
    return recordToSave;
  }

  /**
   * Edit an existing announcement (Stage 7A + 7B)
   */
  async updateAnnouncement(
    id: string,
    data: AnnouncementFormData
  ): Promise<AnnouncementRecord> {
    const validation = validateAnnouncementForm(data);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError || 'Validation failed');
    }

    const user = auth.currentUser;
    const adminUid = user?.uid || 'admin';
    const adminName = user?.displayName || user?.email || 'VENUE Administrator';

    let updatedRecord: AnnouncementRecord | null = null;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          updatedBy: adminUid,
          updatedByName: adminName,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.announcement) {
          updatedRecord = resData.announcement;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }
    } catch (apiErr: any) {
      console.warn('AnnouncementsService update API note:', apiErr);
      if (apiErr.message && !apiErr.message.includes('fetch')) {
        throw apiErr;
      }
    }

    // Mirror to Firestore
    try {
      const targetDb = db || dbDefault;
      const docRef = doc(targetDb, 'announcements', id);
      const now = new Date().toISOString();
      const updates: any = {
        title: data.title.trim(),
        content: data.content.trim(),
        summary: data.summary?.trim() || data.content.trim().slice(0, 160) + (data.content.trim().length > 160 ? '...' : ''),
        type: data.type,
        status: data.status,
        priority: data.priority || 'normal',
        audienceType: data.audienceType || 'everyone',
        targetUniversityId: data.targetUniversityId || null,
        targetUniversityName: data.targetUniversityName || null,
        targetAcademicUnitId: data.targetAcademicUnitId || null,
        targetAcademicUnitName: data.targetAcademicUnitName || null,
        targetDepartmentId: data.targetDepartmentId || null,
        targetDepartmentName: data.targetDepartmentName || null,
        targetProgrammeId: data.targetProgrammeId || null,
        targetProgrammeName: data.targetProgrammeName || null,
        targetYearOfStudy: data.targetYearOfStudy || null,
        targetSemester: data.targetSemester || null,
        expiresAt: data.expiresAt || null,
        updatedAt: now,
        updatedBy: adminUid,
      };
      if (data.status === 'Published' && updatedRecord?.publishedAt) {
        updates.publishedAt = updatedRecord.publishedAt;
      }
      await updateDoc(docRef, updates);
    } catch (fsErr) {
      console.warn('AnnouncementsService: Firestore mirror update note:', fsErr);
    }

    // Stage 9A: Record centralized audit log
    try {
      await adminAuditService.recordAuditLog({
        action: data.status === 'Published' ? 'announcement.publish' : 'announcement.update',
        entityType: 'announcement',
        entityId: id,
        summary: `Updated announcement: "${data.title.trim()}"`,
        metadata: { title: data.title.trim(), type: data.type, status: data.status },
        source: 'trusted_server',
      });
    } catch {
      // non-blocking
    }

    this.clearCache();
    if (updatedRecord) return updatedRecord;

    const fallbackRecord = await this.getAnnouncementById(id);
    if (!fallbackRecord) throw new Error('Announcement update failed to return record');
    return fallbackRecord;
  }

  /**
   * Archive an announcement
   */
  async archiveAnnouncement(id: string): Promise<AnnouncementRecord> {
    const user = auth.currentUser;
    const adminUid = user?.uid || 'admin';
    const adminName = user?.displayName || user?.email || 'VENUE Administrator';

    let updatedRecord: AnnouncementRecord | null = null;
    try {
      const res = await fetch(`/api/admin/announcements/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy: adminUid, updatedByName: adminName }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.announcement) {
          updatedRecord = resData.announcement;
        }
      }
    } catch (err) {
      console.warn('AnnouncementsService: Archive server note:', err);
    }

    try {
      const targetDb = db || dbDefault;
      await updateDoc(doc(targetDb, 'announcements', id), {
        status: 'Archived',
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid,
      });
    } catch (fsErr) {
      console.warn('AnnouncementsService: Firestore mirror archive note:', fsErr);
    }

    // Stage 9A: Record centralized audit log
    try {
      await adminAuditService.recordAuditLog({
        action: 'announcement.archive',
        entityType: 'announcement',
        entityId: id,
        summary: `Archived announcement: "${updatedRecord?.title || id}"`,
        metadata: { newStatus: 'Archived' },
        source: 'trusted_server',
      });
    } catch {
      // non-blocking
    }

    this.clearCache();
    if (updatedRecord) return updatedRecord;
    const rec = await this.getAnnouncementById(id);
    if (!rec) throw new Error('Failed to retrieve archived announcement');
    return rec;
  }

  /**
   * Safe delete a draft announcement
   */
  async deleteDraftAnnouncement(id: string): Promise<void> {
    const user = auth.currentUser;
    const adminUid = user?.uid || 'admin';
    const adminName = user?.displayName || user?.email || 'VENUE Administrator';

    const res = await fetch(
      `/api/admin/announcements/${id}?adminUid=${encodeURIComponent(adminUid)}&adminName=${encodeURIComponent(adminName)}`,
      {
        method: 'DELETE',
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete announcement');
    }

    try {
      const targetDb = db || dbDefault;
      await deleteDoc(doc(targetDb, 'announcements', id));
    } catch (fsErr) {
      console.warn('AnnouncementsService: Firestore delete note:', fsErr);
    }

    // Stage 9A: Record centralized audit log
    try {
      await adminAuditService.recordAuditLog({
        action: 'announcement.delete',
        entityType: 'announcement',
        entityId: id,
        summary: `Deleted draft announcement (${id})`,
        metadata: { deletedId: id },
        source: 'trusted_server',
      });
    } catch {
      // non-blocking
    }

    this.clearCache();
  }

  /**
   * Stage 7B: Scalable Read State Management
   * Fetches the set of announcement IDs marked as read by the user
   */
  async getUserReadIds(userId: string): Promise<Set<string>> {
    if (!userId) return new Set();

    const cached = this.readCache.get(userId);
    if (cached) return cached;

    const set = new Set<string>();

    // 1. Try server endpoint
    try {
      const res = await fetch(`/api/announcements/reads/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.readAnnouncementIds)) {
          data.readAnnouncementIds.forEach((id: string) => set.add(id));
        }
      }
    } catch (err) {
      console.warn('Note reading announcement reads from server:', err);
    }

    // 2. Also query Firestore for real-time reads
    try {
      const targetDb = db || dbDefault;
      const q = query(
        collection(targetDb, 'announcementReads'),
        where('userId', '==', userId),
        limit(200)
      );
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        const rec = d.data();
        if (rec.announcementId) set.add(rec.announcementId);
      });
    } catch {
      // silent fallback
    }

    this.readCache.set(userId, set);
    return set;
  }

  /**
   * Stage 7B: Scalable Read State Mark
   * Marks an announcement as read. Avoids repeated writes if already read.
   */
  async markAsRead(announcementId: string, userId: string): Promise<void> {
    if (!announcementId || !userId) return;

    let userReads = this.readCache.get(userId);
    if (!userReads) {
      userReads = new Set<string>();
      this.readCache.set(userId, userReads);
    }

    if (userReads.has(announcementId)) {
      // Already marked as read — strictly avoid duplicate Firestore/server writes
      return;
    }

    // Immediately cache in-memory for instant UI reactivity
    userReads.add(announcementId);

    // 1. Server write
    try {
      fetch('/api/announcements/reads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, announcementId }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    // 2. Firestore scalable document write: announcementReads/{userId}_{announcementId}
    try {
      const targetDb = db || dbDefault;
      const docId = `${userId}_${announcementId}`;
      await setDoc(doc(targetDb, 'announcementReads', docId), {
        id: docId,
        userId,
        announcementId,
        readAt: new Date().toISOString(),
      });
    } catch (fsErr) {
      console.warn('Note writing announcement read to Firestore:', fsErr);
    }
  }

  /**
   * Stage 7B: Mark multiple announcements as read (e.g. "Mark all as read" button)
   */
  async markAllAsRead(announcementIds: string[], userId: string): Promise<void> {
    if (!announcementIds.length || !userId) return;
    for (const annId of announcementIds) {
      await this.markAsRead(annId, userId);
    }
  }

  /**
   * Get announcement statistics for summary cards
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    targeted: number;
    everyone: number;
  }> {
    try {
      const res = await fetch('/api/admin/announcements/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          return data.stats;
        }
      }
    } catch {
      // ignore
    }

    // Fallback: fetch admin list and aggregate
    const adminData = await this.getAdminAnnouncements(undefined, 1, 100);
    const items = adminData.announcements;
    return {
      total: adminData.total,
      published: items.filter((a) => a.status === 'Published').length,
      draft: items.filter((a) => a.status === 'Draft').length,
      archived: items.filter((a) => a.status === 'Archived').length,
      targeted: items.filter((a) => a.audienceType === 'targeted').length,
      everyone: items.filter((a) => !a.audienceType || a.audienceType === 'everyone').length,
    };
  }
}

export const announcementsService = new AnnouncementsService();
