import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { db, dbDefault, handleFirestoreError, OperationType, auth } from './firebase';
import {
  LecturerCourseAssignment,
  AssignCourseInput,
  CanonicalCourseRecord,
  ProgrammeCourseRecord,
  CourseRecord,
} from '../types';
import { adminCatalogueService } from './adminCatalogueService';
import { adminLecturersService } from './adminLecturersService';
import { adminAuditService } from './adminAuditService';

export interface CourseSearchOption {
  courseId: string;
  code: string;
  title: string;
  defaultCredits: number;
  universityId: string;
  academicUnitId?: string;
  academicUnitName?: string;
  departmentId?: string;
  departmentName?: string;
  programmeId?: string;
  programmeName?: string;
  yearOfStudy?: number;
  semester?: number;
  source?: string;
}

class LecturerCourseService {
  // In-memory cache for lecturer assignments: key is lecturerId
  private lecturerAssignmentsCache = new Map<string, LecturerCourseAssignment[]>();

  /**
   * Helper to write audit log entry
   */
  private async logAudit(
    action: string,
    assignmentId: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      const logId = `lca_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logRef = doc(db, 'catalogue_audit_logs', logId);
      await setDoc(logRef, {
        action,
        targetType: 'lecturer_course_assignment',
        targetId: assignmentId,
        adminUid: user?.uid || 'system',
        adminEmail: user?.email || 'admin@venue.ac.tz',
        details: details || {},
        timestamp: new Date().toISOString(),
      });

      const mappedAction =
        action === 'assign_lecturer_course'
          ? 'lecturer.course_assign'
          : action === 'remove_lecturer_course'
          ? 'lecturer.course_remove'
          : `lecturer.${action}`;

      const summary =
        action === 'assign_lecturer_course'
          ? `Assigned course ${details?.courseCode || ''} (${details?.courseTitle || ''}) to lecturer ${details?.lecturerId || assignmentId}`
          : action === 'remove_lecturer_course'
          ? `Removed course assignment ${assignmentId} from lecturer ${details?.lecturerId || ''}`
          : `Lecturer course assignment action ${action}`;

      await adminAuditService.recordAuditLog({
        action: mappedAction,
        entityType: 'lecturer_course',
        entityId: assignmentId,
        summary,
        metadata: details || {},
        source: 'client_service',
      });
    } catch {
      // Non-blocking audit failure
    }
  }

  /**
   * Fetch all course assignments for a specific lecturer
   */
  async getAssignmentsByLecturer(
    lecturerId: string,
    forceRefresh = false
  ): Promise<LecturerCourseAssignment[]> {
    if (!lecturerId) return [];

    if (!forceRefresh && this.lecturerAssignmentsCache.has(lecturerId)) {
      return this.lecturerAssignmentsCache.get(lecturerId) || [];
    }

    try {
      const q = query(
        collection(db, 'lecturer_courses'),
        where('lecturerId', '==', lecturerId)
      );

      let snap: any = null;
      try {
        snap = await getDocs(q);
      } catch {
        try {
          snap = await getDocs(
            query(collection(dbDefault, 'lecturer_courses'), where('lecturerId', '==', lecturerId))
          );
        } catch {
          snap = null;
        }
      }

      if (snap && !snap.empty) {
        const list = snap.docs.map((d: any) => ({
          id: d.id,
          ...d.data(),
        })) as LecturerCourseAssignment[];

        // Sort by Course Code, then Programme, then Year, then Semester
        list.sort((a, b) => {
          const codeCmp = (a.courseCode || '').localeCompare(b.courseCode || '');
          if (codeCmp !== 0) return codeCmp;
          return (a.yearOfStudy || 0) - (b.yearOfStudy || 0);
        });

        this.lecturerAssignmentsCache.set(lecturerId, list);
        return list;
      }

      this.lecturerAssignmentsCache.set(lecturerId, []);
      return [];
    } catch (err) {
      console.warn('LecturerCourseService: Error fetching lecturer assignments:', err);
      return [];
    }
  }

  /**
   * Fetch course assignments for an authenticated lecturer by Firebase UID
   */
  async getAssignmentsForLecturerUser(
    uid: string,
    forceRefresh = false
  ): Promise<LecturerCourseAssignment[]> {
    if (!uid) return [];

    try {
      // 1. First check if we can query by userId directly in lecturer_courses
      const userQ = query(
        collection(db, 'lecturer_courses'),
        where('userId', '==', uid)
      );
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const list = userSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as LecturerCourseAssignment[];
        list.sort((a, b) => (a.courseCode || '').localeCompare(b.courseCode || ''));
        return list;
      }

      // 2. Otherwise look up lecturer record by UID to get lecturerId
      const q = query(
        collection(db, 'lecturers'),
        where('userId', '==', uid),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const lecturerId = snap.docs[0].id;
        return this.getAssignmentsByLecturer(lecturerId, forceRefresh);
      }

      return [];
    } catch (err) {
      console.warn('LecturerCourseService: Error fetching user assignments:', err);
      return [];
    }
  }

  /**
   * Fetch all lecturers assigned to a specific course
   */
  async getAssignmentsByCourse(courseId: string): Promise<LecturerCourseAssignment[]> {
    if (!courseId) return [];

    try {
      const q = query(
        collection(db, 'lecturer_courses'),
        where('courseId', '==', courseId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as LecturerCourseAssignment[];
    } catch (err) {
      console.warn('LecturerCourseService: Error querying by courseId:', err);
      return [];
    }
  }

  /**
   * Assign an existing canonical course to a lecturer within a specified teaching context.
   * Requirement 7: Prevent duplicate assignments.
   */
  async assignCourseToLecturer(input: AssignCourseInput): Promise<LecturerCourseAssignment> {
    if (!input.lecturerId) throw new Error('Lecturer ID is required.');
    if (!input.courseId) throw new Error('Course selection is required.');
    if (!input.courseCode) throw new Error('Course code is required.');

    const cleanLecturerId = input.lecturerId.trim();
    const cleanCourseId = input.courseId.trim();
    const cleanCourseCode = input.courseCode.trim().toUpperCase();
    const cleanCourseTitle = input.courseTitle.trim();
    const progId = input.programmeId?.trim() || '';
    const yearOfStudy = input.yearOfStudy ? Number(input.yearOfStudy) : undefined;
    const semester = input.semester ? Number(input.semester) : undefined;

    // 1. Duplicate check (Requirement 7)
    // Check existing assignments for this lecturer
    const existingList = await this.getAssignmentsByLecturer(cleanLecturerId, true);
    const isDuplicate = existingList.some((existing) => {
      const sameCourse =
        existing.courseId === cleanCourseId ||
        existing.courseCode.toUpperCase() === cleanCourseCode;
      
      const sameProg = (existing.programmeId || '') === progId;
      const sameYear = (existing.yearOfStudy || 0) === (yearOfStudy || 0);
      const sameSem = (existing.semester || 0) === (semester || 0);

      return sameCourse && sameProg && sameYear && sameSem;
    });

    if (isDuplicate) {
      throw new Error('This course is already assigned to this lecturer for this teaching context.');
    }

    // 2. Fetch lecturer info to populate userId if not passed
    let userId = input.userId;
    if (!userId) {
      try {
        const lecSnap = await getDoc(doc(db, 'lecturers', cleanLecturerId));
        if (lecSnap.exists()) {
          const lecData = lecSnap.data();
          userId = lecData.userId || '';
        }
      } catch {
        // Non-blocking
      }
    }

    // 3. Build deterministic, clean document ID
    const safeProgPart = progId ? progId.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'gen';
    const safeYearPart = yearOfStudy ? `y${yearOfStudy}` : 'y0';
    const safeSemPart = semester ? `s${semester}` : 's0';
    const safeCoursePart = cleanCourseId.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const assignmentId = `lca_${cleanLecturerId}_${safeCoursePart}_${safeProgPart}_${safeYearPart}_${safeSemPart}`;

    const now = new Date().toISOString();
    const currentUser = auth.currentUser;

    const assignmentRecord: LecturerCourseAssignment = {
      id: assignmentId,
      lecturerId: cleanLecturerId,
      userId: userId || undefined,
      courseId: cleanCourseId,
      courseCode: cleanCourseCode,
      courseTitle: cleanCourseTitle,
      credits: Number(input.credits) || 12,
      universityId: input.universityId || 'udsm',
      academicUnitId: input.academicUnitId || undefined,
      academicUnitName: input.academicUnitName || undefined,
      departmentId: input.departmentId || undefined,
      departmentName: input.departmentName || undefined,
      programmeId: progId || undefined,
      programmeName: input.programmeName || undefined,
      yearOfStudy: yearOfStudy || undefined,
      semester: semester || undefined,
      status: 'active',
      assignedBy: currentUser
        ? {
            uid: currentUser.uid,
            email: currentUser.email || 'admin@venue.ac.tz',
          }
        : 'admin',
      createdAt: now,
      updatedAt: now,
    };

    // 4. Save to Firestore
    try {
      await setDoc(doc(db, 'lecturer_courses', assignmentId), assignmentRecord);
    } catch (err) {
      try {
        await setDoc(doc(dbDefault, 'lecturer_courses', assignmentId), assignmentRecord);
      } catch (fbErr) {
        handleFirestoreError(fbErr, OperationType.WRITE, `lecturer_courses/${assignmentId}`);
        throw fbErr;
      }
    }

    // 5. Update local cache
    const updatedList = [assignmentRecord, ...(this.lecturerAssignmentsCache.get(cleanLecturerId) || [])];
    this.lecturerAssignmentsCache.set(cleanLecturerId, updatedList);

    // 6. Log audit entry
    await this.logAudit('assign_lecturer_course', assignmentId, {
      lecturerId: cleanLecturerId,
      courseCode: cleanCourseCode,
      courseTitle: cleanCourseTitle,
      programmeId: progId,
      yearOfStudy,
      semester,
    });

    return assignmentRecord;
  }

  /**
   * Remove a lecturer-course assignment.
   * Requirement 8: Only removes the relationship; does NOT delete lecturer, course, programme, or materials.
   */
  async removeCourseAssignment(
    assignmentId: string,
    lecturerId: string
  ): Promise<void> {
    if (!assignmentId) throw new Error('Assignment ID is required for removal.');

    try {
      await deleteDoc(doc(db, 'lecturer_courses', assignmentId));
    } catch (err) {
      try {
        await deleteDoc(doc(dbDefault, 'lecturer_courses', assignmentId));
      } catch (fbErr) {
        handleFirestoreError(fbErr, OperationType.DELETE, `lecturer_courses/${assignmentId}`);
        throw fbErr;
      }
    }

    // Invalidate local cache
    if (lecturerId && this.lecturerAssignmentsCache.has(lecturerId)) {
      const current = this.lecturerAssignmentsCache.get(lecturerId) || [];
      this.lecturerAssignmentsCache.set(
        lecturerId,
        current.filter((a) => a.id !== assignmentId)
      );
    }

    // Log audit
    await this.logAudit('remove_lecturer_course', assignmentId, {
      lecturerId,
      assignmentId,
    });
  }

  /**
   * Search available canonical courses and programme offerings using the catalogue hierarchy.
   * Scoped to filters: academicUnitId, departmentId, programmeId, yearOfStudy, semester.
   * Debounced and limits results to prevent fetching entire database unnecessarily.
   */
  async searchCatalogueCourses(options: {
    searchTerm?: string;
    universityId?: string;
    academicUnitId?: string;
    departmentId?: string;
    programmeId?: string;
    yearOfStudy?: number;
    semester?: number;
    maxResults?: number;
  }): Promise<CourseSearchOption[]> {
    const term = (options.searchTerm || '').trim().toLowerCase();
    const maxResults = options.maxResults || 50;
    const resultsMap = new Map<string, CourseSearchOption>();

    try {
      // 1. If programmeId is specified, fetch courses placed in that programme
      if (options.programmeId && options.programmeId !== 'ALL') {
        const pcQuery = query(
          collection(db, 'programme_courses'),
          where('programmeId', '==', options.programmeId)
        );
        const pcSnap = await getDocs(pcQuery);
        pcSnap.docs.forEach((d) => {
          const data = d.data() as ProgrammeCourseRecord;
          // Apply year / semester filters if selected
          if (options.yearOfStudy && Number(data.yearOfStudy) !== Number(options.yearOfStudy)) {
            return;
          }
          if (options.semester && Number(data.semester) !== Number(options.semester)) {
            return;
          }
          // Apply search filter if entered
          if (term) {
            const matchesCode = (data.code || '').toLowerCase().includes(term);
            const matchesTitle = (data.title || '').toLowerCase().includes(term);
            if (!matchesCode && !matchesTitle) return;
          }

          const key = `${data.code.toUpperCase()}_${data.programmeId}_${data.yearOfStudy}_${data.semester}`;
          resultsMap.set(key, {
            courseId: data.courseId || data.code.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            code: data.code.toUpperCase(),
            title: data.title,
            defaultCredits: Number(data.credits) || 12,
            universityId: data.universityId || options.universityId || 'udsm',
            academicUnitId: data.academicUnitId || options.academicUnitId,
            departmentId: data.departmentId || options.departmentId,
            programmeId: data.programmeId,
            yearOfStudy: Number(data.yearOfStudy) || 1,
            semester: Number(data.semester) || 1,
            source: 'Programme Curriculum',
          });
        });

        // Also query catalogue_courses for this programme if empty
        if (resultsMap.size === 0) {
          const ccQuery = query(
            collection(db, 'catalogue_courses'),
            where('programmeId', '==', options.programmeId)
          );
          const ccSnap = await getDocs(ccQuery);
          ccSnap.docs.forEach((d) => {
            const data = d.data() as CourseRecord;
            if (options.yearOfStudy && Number(data.yearOfStudy) !== Number(options.yearOfStudy)) {
              return;
            }
            if (options.semester && Number(data.semester) !== Number(options.semester)) {
              return;
            }
            if (term) {
              const matchesCode = (data.code || '').toLowerCase().includes(term);
              const matchesTitle = (data.title || '').toLowerCase().includes(term);
              if (!matchesCode && !matchesTitle) return;
            }

            const key = `${data.code.toUpperCase()}_${data.programmeId}_${data.yearOfStudy}_${data.semester}`;
            resultsMap.set(key, {
              courseId: data.canonicalCourseId || data.id,
              code: data.code.toUpperCase(),
              title: data.title,
              defaultCredits: Number(data.credits) || 12,
              universityId: data.universityId || options.universityId || 'udsm',
              academicUnitId: data.academicUnitId || options.academicUnitId,
              departmentId: data.departmentId || options.departmentId,
              programmeId: data.programmeId,
              yearOfStudy: Number(data.yearOfStudy) || 1,
              semester: Number(data.semester) || 1,
              source: 'Catalogue Course Placement',
            });
          });
        }
      } else {
        // 2. General canonical course search or department-scoped search
        const canonicalList = await adminCatalogueService.searchCanonicalCourses(term || '', maxResults);
        canonicalList.forEach((c) => {
          // If departmentId filter is active, check match if present on course
          if (options.departmentId && options.departmentId !== 'ALL' && c.departmentId && c.departmentId !== options.departmentId) {
            // Note: Keep in mind cross-department courses are permitted, but filters narrow down display
            return;
          }

          resultsMap.set(c.code.toUpperCase(), {
            courseId: c.id,
            code: c.code.toUpperCase(),
            title: c.title,
            defaultCredits: c.defaultCredits || 12,
            universityId: c.universityId || options.universityId || 'udsm',
            academicUnitId: c.academicUnitId || options.academicUnitId,
            departmentId: c.departmentId || options.departmentId,
            source: 'Canonical Master Catalogue',
          });
        });
      }
    } catch (err) {
      console.warn('LecturerCourseService: Error searching catalogue courses:', err);
    }

    const results = Array.from(resultsMap.values());
    results.sort((a, b) => a.code.localeCompare(b.code));
    return results.slice(0, maxResults);
  }

  /**
   * Clear in-memory caches
   */
  clearCache(): void {
    this.lecturerAssignmentsCache.clear();
  }
}

export const lecturerCourseService = new LecturerCourseService();
