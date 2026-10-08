import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  orderBy,
  limit,
  getCountFromServer,
} from 'firebase/firestore';
import { db, dbDefault, handleFirestoreError, OperationType, auth } from './firebase';
import { adminAuditService } from './adminAuditService';
import { StudentProfile } from '../types';

export interface AcademicPlacementPayload {
  university: string;
  universityName?: string;
  universityShort?: string;
  universityId: string;
  college: string;
  academicUnitName?: string;
  academicUnitId: string;
  academicUnitType?: string;
  department: string;
  departmentName?: string;
  departmentId: string;
  programme: string;
  programmeName?: string;
  programmeShort?: string;
  programmeId: string;
  programmeCode?: string;
  degreeLevel?: string;
  programmeDurationYears?: number;
  academicYear: string;
  yearOfStudy: string;
  semester: string;
  registrationNumber?: string;
}

export interface StudentFilterOptions {
  search?: string;
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  programmeId?: string;
  yearOfStudy?: string;
  status?: 'active' | 'inactive' | 'ALL';
}

export interface PaginatedStudentsResponse {
  students: StudentProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class AdminStudentsService {
  private cache: Map<string, { data: PaginatedStudentsResponse; timestamp: number }> = new Map();
  private CACHE_TTL_MS = 15000; // 15 seconds client cache to prevent hammering Firestore on rapid tab toggles

  /**
   * Helper to write audit log entry for admin actions
   */
  private async logAudit(
    action: string,
    studentUid: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      const logId = `stu_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logRef = doc(db, 'catalogue_audit_logs', logId);
      await setDoc(logRef, {
        action,
        targetType: 'student',
        targetId: studentUid,
        adminUid: user?.uid || 'system',
        adminEmail: user?.email || 'admin@venue.ac.tz',
        details: details || {},
        timestamp: new Date().toISOString(),
      });

      const mappedAction =
        action === 'UPDATE_STUDENT_STATUS'
          ? 'student.status_change'
          : action === 'UPDATE_STUDENT_ACADEMIC_PLACEMENT'
          ? 'student.profile_update'
          : `student.${action.toLowerCase()}`;

      const summary =
        action === 'UPDATE_STUDENT_STATUS'
          ? `${details?.newStatus === 'active' ? 'Activated' : 'Deactivated'} student account (${studentUid})`
          : action === 'UPDATE_STUDENT_ACADEMIC_PLACEMENT'
          ? `Updated academic placement for student (${studentUid}) in ${details?.programme || 'curriculum'}`
          : `Student administrative action ${action}`;

      await adminAuditService.recordAuditLog({
        action: mappedAction,
        entityType: 'student',
        entityId: studentUid,
        summary,
        metadata: details || {},
        source: 'trusted_server',
      });
    } catch {
      // Non-blocking audit failure
    }
  }

  /**
   * Fetch paginated student records with search and filtering
   */
  async getStudents(
    filters?: StudentFilterOptions,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedStudentsResponse> {
    const cacheKey = JSON.stringify({ filters, page, pageSize });
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // 1. Try server endpoint first for durable indexed multi-attribute query
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.universityId && filters.universityId !== 'ALL') params.append('universityId', filters.universityId);
      if (filters?.academicUnitId && filters.academicUnitId !== 'ALL') params.append('academicUnitId', filters.academicUnitId);
      if (filters?.departmentId && filters.departmentId !== 'ALL') params.append('departmentId', filters.departmentId);
      if (filters?.programmeId && filters.programmeId !== 'ALL') params.append('programmeId', filters.programmeId);
      if (filters?.yearOfStudy && filters.yearOfStudy !== 'ALL') params.append('yearOfStudy', filters.yearOfStudy);
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          const result: PaginatedStudentsResponse = {
            students: data.students,
            total: data.total || data.students.length,
            page: data.page || page,
            pageSize: data.pageSize || pageSize,
            totalPages: data.totalPages || Math.ceil((data.total || data.students.length) / pageSize) || 1,
          };
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } catch (err) {
      console.warn('AdminStudentsService: Server endpoint note, falling back to direct Firestore:', err);
    }

    // 2. Direct Firestore fallback query
    try {
      let qSnap: any;
      try {
        const q = query(collection(db, 'students'), limit(pageSize * page));
        qSnap = await getDocs(q);
      } catch (fsErr) {
        try {
          const qDef = query(collection(dbDefault, 'students'), limit(pageSize * page));
          qSnap = await getDocs(qDef);
        } catch {
          handleFirestoreError(fsErr, OperationType.LIST, 'students');
        }
      }

      if (!qSnap || qSnap.empty) {
        return {
          students: [],
          total: 0,
          page,
          pageSize,
          totalPages: 1,
        };
      }

      let list = qSnap.docs.map((d: any) => ({
        uid: d.id,
        ...(d.data() as any),
        status: d.data().status || d.data().accountStatus || 'active',
      })) as StudentProfile[];

      // In-memory filters
      if (filters) {
        const { search, status, universityId, academicUnitId, departmentId, programmeId, yearOfStudy } = filters;
        if (status && status !== 'ALL') {
          list = list.filter((s) => (s.status || 'active') === status);
        }
        if (universityId && universityId !== 'ALL') {
          list = list.filter((s) => s.universityId === universityId || s.universityShort === universityId || s.university === universityId);
        }
        if (academicUnitId && academicUnitId !== 'ALL') {
          list = list.filter((s) => s.academicUnitId === academicUnitId || s.collegeId === academicUnitId || s.college === academicUnitId);
        }
        if (departmentId && departmentId !== 'ALL') {
          list = list.filter((s) => s.departmentId === departmentId || s.department === departmentId);
        }
        if (programmeId && programmeId !== 'ALL') {
          list = list.filter((s) => s.programmeId === programmeId || s.programme === programmeId);
        }
        if (yearOfStudy && yearOfStudy !== 'ALL') {
          list = list.filter((s) => {
            const raw = (s.yearOfStudy || '').toString().toLowerCase();
            return raw.includes(yearOfStudy.toLowerCase());
          });
        }
        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          list = list.filter(
            (u) =>
              (u.name || u.fullName || '').toLowerCase().includes(s) ||
              (u.email || '').toLowerCase().includes(s) ||
              (u.registrationNumber || '').toLowerCase().includes(s) ||
              (u.university || '').toLowerCase().includes(s) ||
              (u.programme || '').toLowerCase().includes(s)
          );
        }
      }

      const total = list.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedList = list.slice(startIndex, startIndex + pageSize);

      const result: PaginatedStudentsResponse = {
        students: paginatedList,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.warn('AdminStudentsService: Failed to fetch students from Firestore:', error);
      return {
        students: [],
        total: 0,
        page,
        pageSize,
        totalPages: 1,
      };
    }
  }

  /**
   * Fetch single student profile by UID
   */
  async getStudentById(uid: string): Promise<StudentProfile | null> {
    if (!uid) return null;

    try {
      // Direct Firestore fetch
      const docSnap = await getDoc(doc(db, 'students', uid));
      if (docSnap.exists()) {
        const d = docSnap.data() as StudentProfile;
        return {
          ...d,
          uid,
          status: d.status || d.accountStatus || 'active',
        };
      }
    } catch {
      // Continue to fallback
    }

    try {
      const res = await fetch(`/api/student/profile/${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          return {
            ...data.profile,
            uid,
            status: data.profile.status || data.profile.accountStatus || 'active',
          };
        }
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Update student operational status ('active' | 'inactive')
   * Safe toggling: does not delete accounts or modify academic records.
   */
  async updateStudentStatus(
    uid: string,
    status: 'active' | 'inactive'
  ): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
    if (!uid) {
      return { success: false, error: 'Student UID is required' };
    }

    if (status !== 'active' && uid === 'Faz9X1kqMZWkujTMKYaRfvM4jvw1') {
      return {
        success: false,
        error: 'The verified Platform Owner / Super Admin account cannot be restricted or deactivated.',
      };
    }

    try {
      const now = new Date().toISOString();
      const currentUser = auth.currentUser;
      const updatedBy = currentUser?.email || currentUser?.uid || 'admin';

      const statusPayload = {
        status,
        accountStatus: status,
        updatedAt: now,
        updatedBy,
      };

      // 1. Update Firestore students and users documents if online
      try {
        await updateDoc(doc(db, 'students', uid), statusPayload);
      } catch (e1) {
        // Fallback setDoc with merge
        try {
          await setDoc(doc(db, 'students', uid), statusPayload, { merge: true });
        } catch (e2) {
          console.warn('Firestore student doc update note:', e2);
        }
      }

      try {
        await setDoc(doc(db, 'users', uid), statusPayload, { merge: true });
      } catch {
        // non-blocking
      }

      // 2. Sync to server-side durable storage
      let updatedProfile: StudentProfile | undefined;
      try {
        const res = await fetch(`/api/admin/students/${encodeURIComponent(uid)}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, updatedBy }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            updatedProfile = data.profile;
          }
        }
      } catch (err) {
        console.warn('Server status endpoint note:', err);
      }

      // Invalidate cache
      this.cache.clear();

      // 3. Log admin audit action
      await this.logAudit('UPDATE_STUDENT_STATUS', uid, {
        newStatus: status,
        updatedAt: now,
        updatedBy,
      });

      return {
        success: true,
        profile: updatedProfile,
      };
    } catch (err: any) {
      console.error('Error updating student status:', err);
      return {
        success: false,
        error: err?.message || 'Failed to update student account status',
      };
    }
  }

  /**
   * Check if a registration number is unique across all students
   */
  async checkRegistrationNumber(
    registrationNumber: string,
    currentUid?: string
  ): Promise<{ isUnique: boolean; conflictingStudentName?: string }> {
    const cleanReg = (registrationNumber || '').trim();
    if (!cleanReg) {
      return { isUnique: true };
    }

    // 1. Check server-side endpoint first
    try {
      const params = new URLSearchParams();
      params.append('regNumber', cleanReg);
      if (currentUid) params.append('currentUid', currentUid);

      const res = await fetch(`/api/admin/students/check-reg-number?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.isUnique === false) {
          return {
            isUnique: false,
            conflictingStudentName: data.conflictingStudentName,
          };
        }
      }
    } catch (err) {
      console.warn('Server registration number check fallback note:', err);
    }

    // 2. Direct Firestore check
    try {
      const q = query(
        collection(db, 'students'),
        where('registrationNumber', '==', cleanReg),
        limit(5)
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        if (!currentUid || d.id !== currentUid) {
          const s = d.data() as StudentProfile;
          return {
            isUnique: false,
            conflictingStudentName: s.name || s.fullName || s.email || 'Existing student',
          };
        }
      }
    } catch {
      // Non-blocking firestore check
    }

    return { isUnique: true };
  }

  /**
   * Update student academic placement/enrollment record (Stage 6C)
   * Only authorized Admins can update a student's academic information.
   */
  async updateAcademicPlacement(
    uid: string,
    placement: AcademicPlacementPayload
  ): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
    if (!uid) {
      return { success: false, error: 'Student UID is required.' };
    }

    // Validate required fields
    if (!placement.university || !placement.universityId) {
      return { success: false, error: 'University selection is required.' };
    }
    if (!placement.college && !placement.academicUnitName) {
      return { success: false, error: 'Academic Unit selection is required.' };
    }
    if (!placement.department && !placement.departmentName) {
      return { success: false, error: 'Department selection is required.' };
    }
    if (!placement.programme && !placement.programmeName) {
      return { success: false, error: 'Programme selection is required.' };
    }
    if (!placement.academicYear) {
      return { success: false, error: 'Academic Year is required.' };
    }
    if (!placement.yearOfStudy) {
      return { success: false, error: 'Year of Study is required.' };
    }
    if (!placement.semester) {
      return { success: false, error: 'Semester is required.' };
    }

    // Check duplicate registration number if provided
    if (placement.registrationNumber && placement.registrationNumber.trim()) {
      const uniqueness = await this.checkRegistrationNumber(placement.registrationNumber.trim(), uid);
      if (!uniqueness.isUnique) {
        return {
          success: false,
          error: `Registration number "${placement.registrationNumber.trim()}" is already assigned to student ${uniqueness.conflictingStudentName || 'another student'}. Overwriting is not permitted.`,
        };
      }
    }

    try {
      const now = new Date().toISOString();
      const resolvedAcademicUnit = placement.college || placement.academicUnitName || '';
      const resolvedDepartment = placement.department || placement.departmentName || '';
      const resolvedProgramme = placement.programme || placement.programmeName || '';

      const updateData: Partial<StudentProfile> = {
        university: placement.university,
        universityName: placement.universityName || placement.university,
        universityShort: placement.universityShort || (placement.university.includes('Dar es Salaam') ? 'UDSM' : 'UNI'),
        universityId: placement.universityId,
        college: resolvedAcademicUnit,
        academicUnitName: resolvedAcademicUnit,
        academicUnitId: placement.academicUnitId,
        academicUnitType: placement.academicUnitType,
        department: resolvedDepartment,
        departmentName: resolvedDepartment,
        departmentId: placement.departmentId,
        programme: resolvedProgramme,
        programmeName: resolvedProgramme,
        programmeShort: placement.programmeShort || resolvedProgramme,
        programmeId: placement.programmeId,
        programmeCode: placement.programmeCode,
        degreeLevel: placement.degreeLevel,
        programmeDurationYears: placement.programmeDurationYears,
        academicYear: placement.academicYear,
        yearOfStudy: placement.yearOfStudy,
        semester: placement.semester,
        registrationNumber: (placement.registrationNumber || '').trim(),
        isProfileComplete: true,
        updatedAt: now,
      };

      // 1. Direct Firestore write to students collection
      try {
        await updateDoc(doc(db, 'students', uid), updateData);
      } catch {
        try {
          await setDoc(doc(db, 'students', uid), updateData, { merge: true });
        } catch (e2) {
          console.warn('Firestore student doc placement write note:', e2);
        }
      }

      // Also mirror to users collection for authenticated profile synchronization
      try {
        await setDoc(doc(db, 'users', uid), updateData, { merge: true });
      } catch {
        // Non-blocking mirror
      }

      // 2. Synchronize with server-side durable storage endpoint
      let updatedProfile: StudentProfile | undefined;
      try {
        const res = await fetch(`/api/admin/students/${encodeURIComponent(uid)}/academic-placement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(placement),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            updatedProfile = data.profile;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData.error) {
            return { success: false, error: errData.error };
          }
        }
      } catch (serverErr) {
        console.warn('Server academic placement endpoint note:', serverErr);
      }

      // Invalidate query cache
      this.cache.clear();

      // 3. Log audit event
      await this.logAudit('UPDATE_STUDENT_ACADEMIC_PLACEMENT', uid, {
        university: placement.university,
        programme: resolvedProgramme,
        academicYear: placement.academicYear,
        yearOfStudy: placement.yearOfStudy,
        semester: placement.semester,
        registrationNumber: placement.registrationNumber,
        updatedAt: now,
      });

      return {
        success: true,
        profile: updatedProfile || ({ uid, ...updateData } as StudentProfile),
      };
    } catch (err: any) {
      console.error('Error updating student academic placement:', err);
      return {
        success: false,
        error: err?.message || 'Failed to update student academic placement record.',
      };
    }
  }

  /**
   * Clears internal query cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export const adminStudentsService = new AdminStudentsService();
