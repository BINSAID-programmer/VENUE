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
import { db, dbDefault, handleFirestoreError, OperationType, auth } from './firebase';
import { adminAuditService } from './adminAuditService';
import {
  LecturerRecord,
  LecturerStatus,
  LecturerVerificationStatus,
} from '../types';

export interface LecturerFilterOptions {
  search?: string;
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  status?: LecturerStatus | 'ALL';
  verificationStatus?: LecturerVerificationStatus | 'ALL';
}

export interface CreateLecturerInput {
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  staffId?: string;
  title?: string;
  position?: string;
  status: LecturerStatus;
  verificationStatus: LecturerVerificationStatus;
  universityId: string;
  academicUnitId: string;
  departmentId: string;
  universityName?: string;
  academicUnitName?: string;
  departmentName?: string;
}

export const LECTURER_TITLES = [
  'Prof.',
  'Assoc. Prof.',
  'Dr.',
  'Mr.',
  'Ms.',
  'Mrs.',
] as const;

export const LECTURER_POSITIONS = [
  'Professor',
  'Associate Professor',
  'Senior Lecturer',
  'Lecturer',
  'Assistant Lecturer',
  'Tutorial Assistant',
  'Head of Department',
  'Visiting Lecturer',
] as const;

class AdminLecturersService {
  /**
   * Helper to write audit log entry
   */
  private async logAudit(
    action: string,
    lecturerId: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      const logId = `lec_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logRef = doc(db, 'catalogue_audit_logs', logId);
      await setDoc(logRef, {
        action,
        targetType: 'lecturer',
        targetId: lecturerId,
        adminUid: user?.uid || 'system',
        adminEmail: user?.email || 'admin@venue.ac.tz',
        details: details || {},
        timestamp: new Date().toISOString(),
      });

      // Stage 9A: Centralized Audit Logging
      const actionMap: Record<string, string> = {
        create_lecturer: 'lecturer.create',
        update_lecturer: 'lecturer.update',
        delete_lecturer: 'lecturer.delete',
        toggle_status: 'lecturer.status_change',
        assign_course: 'lecturer.course_assign',
        remove_course: 'lecturer.course_remove',
      };
      const mappedAction = actionMap[action] || `lecturer.${action}`;

      await adminAuditService.recordAuditLog({
        action: mappedAction,
        entityType: action.includes('course') ? 'lecturer_course' : 'lecturer',
        entityId: lecturerId,
        summary: `Faculty action ${action.replace(/_/g, ' ')} for lecturer ${lecturerId}`,
        metadata: details || {},
        source: 'client_service',
      });
    } catch {
      // Non-blocking audit failure
    }
  }

  /**
   * Fetch lecturers with optional filtering
   */
  async getLecturers(
    filters?: LecturerFilterOptions,
    pageSize: number = 100
  ): Promise<LecturerRecord[]> {
    try {
      let q = query(collection(db, 'lecturers'), orderBy('createdAt', 'desc'), limit(pageSize));

      let snap: any;
      try {
        snap = await getDocs(q);
      } catch {
        // Fallback without orderBy or in dbDefault
        try {
          snap = await getDocs(query(collection(dbDefault, 'lecturers'), limit(pageSize)));
        } catch {
          snap = await getDocs(query(collection(db, 'lecturers'), limit(pageSize)));
        }
      }

      if (snap.empty) {
        return [];
      }

      let list = snap.docs.map((d: any) => ({
        id: d.id,
        ...(d.data() as any),
      })) as LecturerRecord[];

      // In-memory multi-attribute filtering (guarantees consistency and fast responsiveness)
      if (filters) {
        const { search, universityId, academicUnitId, departmentId, status, verificationStatus } =
          filters;

        if (universityId && universityId !== 'ALL') {
          list = list.filter((l) => l.universityId === universityId);
        }

        if (academicUnitId && academicUnitId !== 'ALL') {
          list = list.filter((l) => l.academicUnitId === academicUnitId);
        }

        if (departmentId && departmentId !== 'ALL') {
          list = list.filter((l) => l.departmentId === departmentId);
        }

        if (status && status !== 'ALL') {
          list = list.filter((l) => l.status === status);
        }

        if (verificationStatus && verificationStatus !== 'ALL') {
          list = list.filter((l) => l.verificationStatus === verificationStatus);
        }

        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          list = list.filter(
            (l) =>
              l.fullName?.toLowerCase().includes(s) ||
              l.email?.toLowerCase().includes(s) ||
              l.staffId?.toLowerCase().includes(s) ||
              l.phone?.toLowerCase().includes(s) ||
              l.title?.toLowerCase().includes(s) ||
              l.position?.toLowerCase().includes(s) ||
              l.departmentName?.toLowerCase().includes(s) ||
              l.academicUnitName?.toLowerCase().includes(s)
          );
        }
      }

      return list;
    } catch (error) {
      console.warn('AdminLecturersService: Error loading lecturers:', error);
      return [];
    }
  }

  /**
   * Fetch single lecturer record
   */
  async getLecturer(lecturerId: string): Promise<LecturerRecord | null> {
    try {
      const snap = await getDoc(doc(db, 'lecturers', lecturerId));
      if (!snap.exists()) {
        const fallbackSnap = await getDoc(doc(dbDefault, 'lecturers', lecturerId));
        if (!fallbackSnap.exists()) return null;
        return { id: fallbackSnap.id, ...(fallbackSnap.data() as any) } as LecturerRecord;
      }
      return { id: snap.id, ...(snap.data() as any) } as LecturerRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `lecturers/${lecturerId}`);
      return null;
    }
  }

  /**
   * Create new Lecturer record
   */
  async createLecturer(input: CreateLecturerInput): Promise<LecturerRecord> {
    if (!input.fullName?.trim()) {
      throw new Error('Lecturer full name is required.');
    }
    if (!input.email?.trim()) {
      throw new Error('Lecturer email is required.');
    }
    if (!input.universityId) {
      throw new Error('University selection is required.');
    }
    if (!input.academicUnitId) {
      throw new Error('Academic unit selection is required.');
    }
    if (!input.departmentId) {
      throw new Error('Department selection is required.');
    }

    const lecturerId = `lec_${input.universityId.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const currentUser = auth.currentUser;

    const record: LecturerRecord = {
      id: lecturerId,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || '',
      photoURL: input.photoURL?.trim() || '',
      staffId: input.staffId?.trim() || '',
      title: input.title?.trim() || '',
      position: input.position?.trim() || '',
      status: input.status || 'active',
      verificationStatus: input.verificationStatus || 'verified',
      universityId: input.universityId,
      academicUnitId: input.academicUnitId,
      departmentId: input.departmentId,
      universityName: input.universityName,
      academicUnitName: input.academicUnitName,
      departmentName: input.departmentName,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser
        ? {
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || 'Administrator',
          }
        : 'admin',
    };

    try {
      await setDoc(doc(db, 'lecturers', lecturerId), record);
      await this.logAudit('create_lecturer', lecturerId, {
        fullName: record.fullName,
        email: record.email,
        departmentId: record.departmentId,
      });
      return record;
    } catch (error) {
      try {
        await setDoc(doc(dbDefault, 'lecturers', lecturerId), record);
        return record;
      } catch (fbError) {
        handleFirestoreError(fbError, OperationType.WRITE, `lecturers/${lecturerId}`);
        throw fbError;
      }
    }
  }

  /**
   * Update existing Lecturer record
   */
  async updateLecturer(
    lecturerId: string,
    updates: Partial<LecturerRecord>
  ): Promise<LecturerRecord> {
    const existing = await this.getLecturer(lecturerId);
    if (!existing) {
      throw new Error(`Lecturer with ID ${lecturerId} not found.`);
    }

    const payload: Partial<LecturerRecord> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Prevent ID overwrite
    delete payload.id;
    delete payload.createdAt;

    try {
      await updateDoc(doc(db, 'lecturers', lecturerId), payload);
      await this.logAudit('update_lecturer', lecturerId, { updates });
      return { ...existing, ...payload };
    } catch (error) {
      try {
        await updateDoc(doc(dbDefault, 'lecturers', lecturerId), payload);
        return { ...existing, ...payload };
      } catch (fbError) {
        handleFirestoreError(fbError, OperationType.UPDATE, `lecturers/${lecturerId}`);
        throw fbError;
      }
    }
  }

  /**
   * Toggle status between active and inactive
   */
  async toggleLecturerStatus(
    lecturerId: string,
    currentStatus: LecturerStatus
  ): Promise<LecturerStatus> {
    const newStatus: LecturerStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await this.updateLecturer(lecturerId, { status: newStatus });
    await this.logAudit('toggle_lecturer_status', lecturerId, {
      from: currentStatus,
      to: newStatus,
    });
    return newStatus;
  }

  /**
   * Update verification status (pending, verified, rejected)
   */
  async updateVerificationStatus(
    lecturerId: string,
    newStatus: LecturerVerificationStatus
  ): Promise<void> {
    await this.updateLecturer(lecturerId, { verificationStatus: newStatus });
    await this.logAudit('update_lecturer_verification', lecturerId, { newStatus });
  }

  /**
   * Generates a unique invitation code for safe account linking
   */
  async generateInvitationCode(lecturerId: string): Promise<string> {
    const code = `LEC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await this.updateLecturer(lecturerId, { invitationCode: code });
    await this.logAudit('generate_lecturer_invite', lecturerId, { code });
    return code;
  }

  /**
   * Links a lecturer document to a verified Firebase UID
   */
  async linkAccountToUid(lecturerId: string, uid: string): Promise<LecturerRecord> {
    const cleanUid = uid.trim();
    if (!cleanUid) throw new Error('Firebase UID is required for linking.');

    const updated = await this.updateLecturer(lecturerId, {
      userId: cleanUid,
      accountLinked: true,
      linkedAt: new Date().toISOString(),
      role: 'lecturer',
    });
    await this.logAudit('admin_link_lecturer_account', lecturerId, { uid: cleanUid });
    return updated;
  }

  /**
   * Unlinks a Firebase UID from a lecturer document
   */
  async unlinkAccount(lecturerId: string): Promise<LecturerRecord> {
    const updated = await this.updateLecturer(lecturerId, {
      userId: '',
      accountLinked: false,
      linkedAt: '',
    });
    await this.logAudit('admin_unlink_lecturer_account', lecturerId);
    return updated;
  }

  /**
   * Delete lecturer document (administrative action)
   */
  async deleteLecturer(lecturerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'lecturers', lecturerId));
      await this.logAudit('delete_lecturer', lecturerId);
    } catch (error) {
      try {
        await deleteDoc(doc(dbDefault, 'lecturers', lecturerId));
      } catch (fbError) {
        handleFirestoreError(fbError, OperationType.DELETE, `lecturers/${lecturerId}`);
        throw fbError;
      }
    }
  }
}

export const adminLecturersService = new AdminLecturersService();
