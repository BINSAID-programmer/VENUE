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
  limit,
} from 'firebase/firestore';
import { db, dbDefault, storage, handleFirestoreError, OperationType, auth } from './firebase';
import {
  AcademicMaterialRecord,
  AcademicMaterialType,
  LecturerRecord,
  LecturerCourseAssignment,
} from '../types';
import {
  adminMaterialsService,
  UploadProgressCallback,
} from './adminMaterialsService';
import { lecturerCourseService } from './lecturerCourseService';
import { lecturerAuthService } from './lecturerAuthService';

export interface UploadLecturerMaterialInput {
  lecturer: LecturerRecord;
  assignment: LecturerCourseAssignment;
  title: string;
  description?: string;
  materialType: AcademicMaterialType;
  file: File;
  onProgress?: UploadProgressCallback;
}

export interface UpdateLecturerMaterialInput {
  materialId: string;
  title?: string;
  description?: string;
  materialType?: AcademicMaterialType;
  lecturerUid: string;
}

class LecturerMaterialsService {
  /**
   * Helper to write audit log entry
   */
  private async logAudit(
    action: string,
    materialId: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      const logId = `lec_mat_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logRef = doc(db, 'lecturer_audit_logs', logId);
      await setDoc(logRef, {
        action,
        targetType: 'lecturer_academic_material',
        targetId: materialId,
        lecturerUid: user?.uid || 'unknown',
        lecturerEmail: user?.email || '',
        details: details || {},
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Non-blocking audit failure
    }
  }

  /**
   * Verifies that the lecturer is legitimately assigned to teach the course.
   * Requirement 4: Reject the operation if lecturer is not assigned to that course.
   */
  async validateLecturerCourseAssignment(
    lecturerId: string,
    courseId: string,
    courseCode?: string
  ): Promise<boolean> {
    if (!lecturerId || !courseId) return false;

    const assignments = await lecturerCourseService.getAssignmentsByLecturer(lecturerId, true);
    const cleanCourseId = courseId.trim().toLowerCase();
    const cleanCode = (courseCode || '').trim().toUpperCase();

    return assignments.some((a) => {
      const matchId = (a.courseId || '').toLowerCase() === cleanCourseId;
      const matchCode = cleanCode ? (a.courseCode || '').toUpperCase() === cleanCode : false;
      return (matchId || matchCode) && a.status === 'active';
    });
  }

  /**
   * Fetches materials uploaded by this lecturer
   * Requirement 8: Shows materials uploaded by the authenticated lecturer
   */
  async getLecturerMaterials(
    lecturerUid: string,
    lecturerId?: string
  ): Promise<AcademicMaterialRecord[]> {
    if (!lecturerUid) return [];

    try {
      const mergedById = new Map<string, AcademicMaterialRecord>();

      // 1. Fetch from persistent server metadata repository
      try {
        const res = await fetch('/api/materials/metadata', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const payload = await res.json();
          if (Array.isArray(payload?.materials)) {
            for (const item of payload.materials) {
              if (item && item.id) {
                mergedById.set(item.id, item as AcademicMaterialRecord);
              }
            }
          }
        }
      } catch {
        // Non-fatal fallback
      }

      // 2. Fetch all materials from Firestore materials collection (using limit to prevent massive queries)
      const q = query(collection(db, 'materials'), limit(250));
      let snap: any;
      try {
        snap = await getDocs(q);
      } catch {
        try {
          snap = await getDocs(query(collection(dbDefault, 'materials'), limit(250)));
        } catch {
          snap = null;
        }
      }

      if (snap && !snap.empty) {
        for (const d of snap.docs) {
          mergedById.set(d.id, {
            id: d.id,
            ...d.data(),
          } as AcademicMaterialRecord);
        }
      }

      const allMaterials = Array.from(mergedById.values());

      // Filter by lecturer ownership: uploadedBy.uid == lecturerUid OR uploadedBy == lecturerUid OR lecturerId == lecturerId
      const lecturerMaterials = allMaterials.filter((m) => {
        const uploaderUid =
          typeof m.uploadedBy === 'object' && m.uploadedBy !== null
            ? m.uploadedBy.uid
            : typeof m.uploadedBy === 'string'
            ? m.uploadedBy
            : (m as any).uploadedByUid || '';

        const matchesUid = uploaderUid === lecturerUid;
        const matchesLecturerId = lecturerId && m.lecturerId === lecturerId;

        return matchesUid || matchesLecturerId;
      });

      // Sort by creation date descending
      lecturerMaterials.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      return lecturerMaterials;
    } catch (err) {
      console.warn('LecturerMaterialsService: Error fetching lecturer materials:', err);
      return [];
    }
  }

  /**
   * Uploads material for an assigned course.
   * Enforces course assignment verification, file validation, Cloud Storage persistence,
   * and Firestore metadata persistence.
   */
  async uploadMaterial(input: UploadLecturerMaterialInput): Promise<AcademicMaterialRecord> {
    const { lecturer, assignment, title, description, materialType, file, onProgress } = input;

    const user = auth.currentUser;
    if (!user) {
      const err = new Error('Authentication required: Please sign in with your lecturer account to upload course materials.');
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'AUTH_CHECK', error: err.message });
      throw err;
    }

    if (lecturer.status !== 'active') {
      const err = new Error('Account inactive: Inactive lecturer accounts cannot upload course materials. Please contact the administrator.');
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'ACCOUNT_STATUS', error: err.message });
      throw err;
    }

    if (lecturer.verificationStatus && lecturer.verificationStatus !== 'verified') {
      const err = new Error(`Verification required: Your faculty verification status is "${lecturer.verificationStatus}". Only verified lecturers can upload course materials.`);
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'VERIFICATION_STATUS', error: err.message });
      throw err;
    }

    // Re-verify fresh lecturer record from Firestore to prevent client-side state tampering (Stage 9B)
    const freshLecturer = await lecturerAuthService.getLecturerByUid(user.uid, true);
    if (!freshLecturer || freshLecturer.id !== lecturer.id || freshLecturer.status !== 'active' || (freshLecturer.verificationStatus && freshLecturer.verificationStatus !== 'verified')) {
      const err = new Error('Unauthorized: Could not verify active and verified faculty status in registry.');
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'SERVER_ROLE_VERIFICATION', error: err.message });
      throw err;
    }

    if (!title.trim()) {
      const err = new Error('Missing required information: Material title is required.');
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'METADATA_VALIDATION', error: err.message });
      throw err;
    }

    if (!materialType) {
      const err = new Error('Missing required information: Please select a valid material type.');
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'METADATA_VALIDATION', error: err.message });
      throw err;
    }

    // 1. Strict Course Assignment Validation (Requirement 4)
    const isAssigned = await this.validateLecturerCourseAssignment(
      lecturer.id,
      assignment.courseId,
      assignment.courseCode
    );

    if (!isAssigned) {
      const err = new Error(
        `Course Access Denied: You are not officially assigned to teach "${assignment.courseCode}". Material upload rejected.`
      );
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'COURSE_ASSIGNMENT_CHECK', error: err.message });
      throw err;
    }

    // 2. Validate File (Requirement 16)
    const validation = adminMaterialsService.validateMaterialFile(file);
    if (!validation.valid) {
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'FILE_VALIDATION', error: validation.error });
      throw new Error(validation.error || 'Invalid file selected.');
    }

    const materialId = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.replace(
      /[^a-zA-Z0-9_-]/g,
      '_'
    );

    console.log('[MATERIALS_UPLOAD] START_UPLOAD', {
      materialId,
      title: title.trim(),
      courseId: assignment.courseId,
      courseCode: assignment.courseCode,
      courseTitle: assignment.courseTitle,
      lecturerId: lecturer.id,
      uploaderUid: user.uid,
      uploaderRole: 'lecturer',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    // 3. Upload File to Firebase Cloud Storage (Requirement 5)
    onProgress?.(5, 'preparing');
    let uploadResult: {
      fileUrl: string;
      storagePath: string;
      fileName: string;
      fileSize: string;
      mimeType: string;
    };

    try {
      uploadResult = await adminMaterialsService.uploadFileToStorage(
        file,
        assignment.universityId || lecturer.universityId || 'udsm',
        assignment.courseId,
        materialId,
        onProgress
      );
    } catch (uploadErr: any) {
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', {
        stage: 'STORAGE_UPLOAD',
        materialId,
        error: uploadErr?.message || uploadErr,
      });
      onProgress?.(0, 'failed');
      throw uploadErr;
    }

    onProgress?.(95, 'saving');

    // 4. Construct Academic Material Metadata (Requirements 6 & 7)
    const now = new Date().toISOString();
    const canonicalCourseId = (assignment.courseCode || assignment.courseId || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');

    const materialRecord: AcademicMaterialRecord = {
      id: materialId,
      materialId,
      title: title.trim(),
      description: description ? description.trim() : '',
      materialType,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl,
      storagePath: uploadResult.storagePath,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,

      // Creator & Ownership identification (Requirement 7)
      uploadedBy: {
        uid: user.uid,
        email: user.email || lecturer.email,
        name: lecturer.fullName,
        role: 'lecturer',
      },
      uploadedByUid: user.uid,
      uploaderRole: 'lecturer',
      lecturerId: lecturer.id,

      // Course & Teaching context placement (Requirement 6)
      universityId: assignment.universityId || lecturer.universityId || 'udsm',
      academicUnitId: assignment.academicUnitId || lecturer.academicUnitId || '',
      departmentId: assignment.departmentId || lecturer.departmentId || '',
      programmeId: assignment.programmeId || '',
      yearId: assignment.yearOfStudy || 1,
      semesterId: assignment.semester || 1,
      courseId: assignment.courseId,
      canonicalCourseId: canonicalCourseId || assignment.courseId,
      courseCode: assignment.courseCode,
      courseTitle: assignment.courseTitle,
      programmeName: assignment.programmeName || undefined,
      departmentName: assignment.departmentName || lecturer.departmentName || undefined,
      academicUnitName: assignment.academicUnitName || lecturer.academicUnitName || undefined,
      universityName: lecturer.universityName || undefined,

      status: 'active', // Standard active status (Requirement 13)
      createdAt: now,
      updatedAt: now,
    };
    (materialRecord as any).filePath = uploadResult.storagePath;
    (materialRecord as any).downloadURL = (uploadResult as any).downloadURL || uploadResult.fileUrl;
    (materialRecord as any).contentType = uploadResult.mimeType;

    // 5. Save metadata to Firestore AND persistent server metadata repository
    console.log('[MATERIALS_UPLOAD] FIRESTORE_SAVE_STARTED', {
      materialId,
      collection: 'materials',
      title: materialRecord.title,
      courseCode: materialRecord.courseCode,
      storagePath: materialRecord.storagePath,
    });

    let firestoreSaved = false;
    let serverSaved = false;
    let saveErrorMsg = '';

    const fsWriteResults = await Promise.allSettled([
      setDoc(doc(db, 'materials', materialId), materialRecord),
      setDoc(doc(db, 'learning_materials', materialId), materialRecord),
      setDoc(doc(dbDefault, 'materials', materialId), materialRecord),
      setDoc(doc(dbDefault, 'learning_materials', materialId), materialRecord),
    ]);
    if (fsWriteResults.some((r) => r.status === 'fulfilled')) {
      firestoreSaved = true;
    } else {
      const firstErr = fsWriteResults.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      saveErrorMsg = firstErr?.reason?.message || 'Firestore write failed';
      console.warn('[MATERIALS_UPLOAD] Direct Firestore write warning (using server repository):', saveErrorMsg);
    }

    try {
      const serverRes = await fetch('/api/materials/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialRecord),
      });
      if (serverRes.ok) {
        serverSaved = true;
      } else {
        const errPayload = await serverRes.json().catch(() => null);
        saveErrorMsg = saveErrorMsg || errPayload?.error || `Server save failed (${serverRes.status})`;
      }
    } catch (srvErr: any) {
      saveErrorMsg = saveErrorMsg || srvErr?.message || 'Server metadata repository unreachable';
    }

    if (!firestoreSaved && !serverSaved) {
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', {
        stage: 'FIRESTORE_SAVE',
        materialId,
        error: saveErrorMsg,
      });
      // Clean up storage file if metadata write fails
      await adminMaterialsService.deleteFileFromStorage(uploadResult.storagePath);
      onProgress?.(0, 'failed');
      throw new Error(`Firestore permission denied or database write failed: ${saveErrorMsg || 'Firestore error'}`);
    }

    // Verify readback before reporting completion
    const verifiedRecord = await adminMaterialsService.getMaterial(materialId);
    if (!verifiedRecord) {
      await adminMaterialsService.deleteFileFromStorage(uploadResult.storagePath);
      onProgress?.(0, 'failed');
      throw new Error('Material persistence verification failed: Saved record could not be retrieved.');
    }

    console.log('[MATERIALS_UPLOAD] FIRESTORE_SAVE_COMPLETED', {
      materialId,
      courseCode: materialRecord.courseCode,
      storagePath: materialRecord.storagePath,
      firestoreSaved,
      serverSaved,
    });

    // 6. Log audit entry
    await this.logAudit('lecturer_upload_material', materialId, {
      lecturerId: lecturer.id,
      courseCode: assignment.courseCode,
      courseTitle: assignment.courseTitle,
      materialType,
      fileName: uploadResult.fileName,
    });

    console.log('[MATERIALS_UPLOAD] UPLOAD_SUCCESS', {
      materialId,
      title: materialRecord.title,
      courseCode: materialRecord.courseCode,
      fileUrl: materialRecord.fileUrl,
    });

    onProgress?.(100, 'completed');
    return verifiedRecord;
  }

  /**
   * Updates permitted metadata for a lecturer's own material.
   * Requirement 9: Allows editing title, description, materialType.
   * Forbids changing Course, uploader, ownership, University, or Department.
   */
  async updateMaterialMetadata(input: UpdateLecturerMaterialInput): Promise<AcademicMaterialRecord> {
    const { materialId, title, description, materialType, lecturerUid } = input;

    if (!materialId) throw new Error('Material ID is required for update.');
    if (!lecturerUid) throw new Error('Authentication required.');

    const existing = await adminMaterialsService.getMaterial(materialId);
    if (!existing) {
      throw new Error('Material record not found in catalogue repository.');
    }

    // Ownership check (Requirement 9)
    const uploaderUid =
      typeof existing.uploadedBy === 'object' && existing.uploadedBy !== null
        ? existing.uploadedBy.uid
        : typeof existing.uploadedBy === 'string'
        ? existing.uploadedBy
        : (existing as any).uploadedByUid || '';

    if (uploaderUid !== lecturerUid) {
      throw new Error('Access Denied: You can only edit materials that you have personally uploaded.');
    }

    // Stage 9B: Verify lecturer account is active and verified
    const freshLecturer = await lecturerAuthService.getLecturerByUid(lecturerUid, true);
    if (!freshLecturer || freshLecturer.status !== 'active' || (freshLecturer.verificationStatus && freshLecturer.verificationStatus !== 'verified')) {
      throw new Error('Access Denied: Only active and verified lecturers can modify material metadata.');
    }

    // Sanitize permitted updates ONLY (Requirement 9)
    const updates: Partial<AcademicMaterialRecord> = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined && title.trim()) {
      updates.title = title.trim();
    }
    if (description !== undefined) {
      updates.description = description.trim();
    }
    if (materialType !== undefined) {
      updates.materialType = materialType;
    }

    let updatedFirestore = false;
    let updatedServer = false;

    try {
      try {
        await updateDoc(doc(db, 'materials', materialId), updates);
        updatedFirestore = true;
      } catch {
        await updateDoc(doc(dbDefault, 'materials', materialId), updates);
        updatedFirestore = true;
      }
    } catch {
      // Fallback to server metadata repository
    }

    try {
      const srvRes = await fetch(`/api/materials/metadata/${encodeURIComponent(materialId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (srvRes.ok) {
        updatedServer = true;
      }
    } catch {
      // Non-fatal if Firestore succeeded
    }

    if (!updatedFirestore && !updatedServer) {
      throw new Error('Failed to update material metadata in repository.');
    }

    await this.logAudit('lecturer_update_material', materialId, {
      updatedFields: Object.keys(updates),
    });

    return {
      ...existing,
      ...updates,
    } as AcademicMaterialRecord;
  }

  /**
   * Deletes a lecturer's own material safely from Firestore and Firebase Storage.
   * Requirement 10: Delete safely without deleting courses or catalogue records.
   */
  async deleteMaterial(materialId: string, lecturerUid: string): Promise<void> {
    if (!materialId) throw new Error('Material ID is required for deletion.');
    if (!lecturerUid) throw new Error('Authentication required.');

    const existing = await adminMaterialsService.getMaterial(materialId);
    if (!existing) return;

    // Ownership check (Requirement 10)
    const uploaderUid =
      typeof existing.uploadedBy === 'object' && existing.uploadedBy !== null
        ? existing.uploadedBy.uid
        : typeof existing.uploadedBy === 'string'
        ? existing.uploadedBy
        : (existing as any).uploadedByUid || '';

    if (uploaderUid !== lecturerUid) {
      throw new Error('Access Denied: You can only delete materials that you have personally uploaded.');
    }

    // Stage 9B: Verify lecturer account is active and verified
    const freshLecturer = await lecturerAuthService.getLecturerByUid(lecturerUid, true);
    if (!freshLecturer || freshLecturer.status !== 'active' || (freshLecturer.verificationStatus && freshLecturer.verificationStatus !== 'verified')) {
      throw new Error('Access Denied: Only active and verified lecturers can delete materials.');
    }

    // 1. Delete from Firestore & Server metadata repository
    let deletedFirestore = false;
    let deletedServer = false;

    try {
      try {
        await deleteDoc(doc(db, 'materials', materialId));
        deletedFirestore = true;
      } catch {
        await deleteDoc(doc(dbDefault, 'materials', materialId));
        deletedFirestore = true;
      }
    } catch {
      // Fallback to server deletion
    }

    try {
      const srvRes = await fetch(`/api/materials/metadata/${encodeURIComponent(materialId)}`, {
        method: 'DELETE',
      });
      if (srvRes.ok) {
        deletedServer = true;
      }
    } catch {
      // Ignore if Firestore succeeded
    }

    if (!deletedFirestore && !deletedServer) {
      throw new Error('Failed to delete material document from repository.');
    }

    // 2. Delete file from Storage
    if (existing.storagePath) {
      await adminMaterialsService.deleteFileFromStorage(existing.storagePath);
    }

    await this.logAudit('lecturer_delete_material', materialId, {
      title: existing.title,
      courseCode: existing.courseCode,
      storagePath: existing.storagePath,
    });
  }
}

export const lecturerMaterialsService = new LecturerMaterialsService();
