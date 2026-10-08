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
  startAfter,
  getCountFromServer,
  DocumentSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, dbDefault, storage, handleFirestoreError, OperationType, auth } from './firebase';
import { adminAuditService } from './adminAuditService';
import {
  AcademicMaterialRecord,
  AcademicMaterialType,
  MaterialStatus,
} from '../types';

export interface MaterialFilterOptions {
  search?: string;
  materialType?: AcademicMaterialType | 'ALL';
  status?: MaterialStatus | 'ALL';
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  programmeId?: string;
  yearId?: number | string;
  semesterId?: number | string;
  courseId?: string;
}

export const MATERIAL_TYPES: AcademicMaterialType[] = [
  'Lecture Notes',
  'Handouts',
  'Slides',
  'Past Papers',
  'Assignments',
  'Solutions',
  'Tutorials',
  'Reference Materials',
  'Other',
];

export const MATERIAL_STATUSES: MaterialStatus[] = ['active', 'draft', 'archived'];

// Configurable maximum file size: 50MB (handles academic PDFs, slides, assignments)
export const MAX_MATERIAL_FILE_SIZE_MB = 50;
export const MAX_MATERIAL_FILE_SIZE_BYTES = MAX_MATERIAL_FILE_SIZE_MB * 1024 * 1024;

// Supported academic file extensions and mime types
export const SUPPORTED_ACADEMIC_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.jpg',
  '.jpeg',
  '.png',
] as const;

export type SupportedExtension = typeof SUPPORTED_ACADEMIC_EXTENSIONS[number];

export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  extension: string;
  mimeType: string;
  formattedSize: string;
  safeFileName: string;
}

export interface UploadProgressCallback {
  (percentage: number, state: 'preparing' | 'uploading' | 'saving' | 'completed' | 'failed'): void;
}

export interface PaginatedMaterialsResult {
  materials: AcademicMaterialRecord[];
  hasMore: boolean;
  totalCount: number;
}

/**
 * Maps raw storage, firestore, network, and validation errors into user-friendly messages
 */
export function formatMaterialUploadError(error: any): string {
  if (!error) return 'An unknown error occurred during material upload.';

  const code: string = error?.code || '';
  const message: string = error?.message || (typeof error === 'string' ? error : '');
  const lowerMsg = message.toLowerCase();

  // 1. Invalid file
  if (
    lowerMsg.includes('invalid file') ||
    lowerMsg.includes('extension') ||
    lowerMsg.includes('recognizable extension') ||
    lowerMsg.includes('not supported')
  ) {
    return `Invalid file: ${message || 'Please select a supported academic document (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG).'}`;
  }

  // 2. File too large
  if (
    (code === 'storage/retry-limit-exceeded' && lowerMsg.includes('size')) ||
    lowerMsg.includes('exceeds') ||
    lowerMsg.includes('too large') ||
    lowerMsg.includes('50mb') ||
    lowerMsg.includes('file size')
  ) {
    return `File too large: ${message || `The file exceeds the ${MAX_MATERIAL_FILE_SIZE_MB}MB limit.`}`;
  }

  // 3. Storage permission denied
  if (
    code === 'storage/unauthorized' ||
    (lowerMsg.includes('storage') && lowerMsg.includes('permission')) ||
    lowerMsg.includes('unauthorized to upload')
  ) {
    return 'Storage permission denied: Your account lacks permission to upload files to this storage location. (storage/unauthorized)';
  }

  // 4. Firestore permission denied
  if (
    code === 'permission-denied' ||
    lowerMsg.includes('missing or insufficient permissions') ||
    lowerMsg.includes('firestore permission denied') ||
    lowerMsg.includes('operationtype')
  ) {
    return 'Firestore permission denied: Your account lacks database permissions to record academic materials in Firestore. (permission-denied)';
  }

  // 5. Network failure
  if (
    code === 'auth/network-request-failed' ||
    lowerMsg.includes('network') ||
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('client is offline') ||
    lowerMsg.includes('connection failed')
  ) {
    return 'Network failure: Unable to establish connection to the storage server. Please verify your internet connection.';
  }

  // 6. Upload timeout / failure
  if (
    code === 'storage/canceled' ||
    lowerMsg.includes('timeout') ||
    lowerMsg.includes('timed out') ||
    lowerMsg.includes('took too long')
  ) {
    return 'Upload timeout: The file upload took too long and timed out. Please try again with a faster network connection.';
  }

  // 7. Missing required course / material information
  if (
    lowerMsg.includes('missing required') ||
    lowerMsg.includes('course is required') ||
    lowerMsg.includes('title is required') ||
    lowerMsg.includes('target course') ||
    lowerMsg.includes('please select an assigned')
  ) {
    return `Missing required information: ${message || 'Please specify course placement and material title.'}`;
  }

  // 8. Authentication required
  if (lowerMsg.includes('authentication required') || lowerMsg.includes('sign in')) {
    return 'Authentication required: You must be signed in with an authorized account to upload materials.';
  }

  return message || 'An unexpected error occurred while uploading academic material.';
}

class AdminMaterialsService {
  /**
   * Helper to write audit log entry
   */
  private async logAudit(
    action: string,
    materialId: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      // Stage 9A/9C: Centralized Immutable Audit Logging
      const actionMap: Record<string, string> = {
        create_material: 'material.upload',
        update_material: details?.replacedFile ? 'material.replace' : 'material.update',
        delete_material: 'material.delete',
      };
      const mappedAction = actionMap[action] || `material.${action}`;

      await adminAuditService.recordAuditLog({
        action: mappedAction,
        entityType: 'academic_material',
        entityId: materialId,
        summary: `Material action ${action.replace(/_/g, ' ')} for material ${materialId}`,
        metadata: details || {},
        source: 'client_service',
      });
    } catch {
      // Non-blocking audit failure
    }
  }

  /**
   * Formats raw bytes to human-readable size string
   */
  formatFileSize(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Validates an academic file before uploading
   */
  validateMaterialFile(file: File | null): FileValidationResult {
    if (!file) {
      return {
        valid: false,
        error: 'Please select a file to upload.',
        extension: '',
        mimeType: '',
        formattedSize: '0 B',
        safeFileName: '',
      };
    }

    // Size validation
    if (file.size > MAX_MATERIAL_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size exceeds the ${MAX_MATERIAL_FILE_SIZE_MB}MB limit. (Selected file is ${this.formatFileSize(file.size)})`,
        extension: '',
        mimeType: file.type || '',
        formattedSize: this.formatFileSize(file.size),
        safeFileName: file.name,
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: 'Selected file is empty (0 bytes).',
        extension: '',
        mimeType: file.type || '',
        formattedSize: '0 B',
        safeFileName: file.name,
      };
    }

    // Extension validation
    const lastDot = file.name.lastIndexOf('.');
    if (lastDot === -1) {
      return {
        valid: false,
        error: 'File does not have a recognizable extension.',
        extension: '',
        mimeType: file.type || '',
        formattedSize: this.formatFileSize(file.size),
        safeFileName: file.name,
      };
    }

    const rawExt = file.name.substring(lastDot).toLowerCase();
    const isSupported = SUPPORTED_ACADEMIC_EXTENSIONS.includes(rawExt as any);

    if (!isSupported) {
      return {
        valid: false,
        error: `File extension "${rawExt}" is not supported. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG.`,
        extension: rawExt,
        mimeType: file.type || '',
        formattedSize: this.formatFileSize(file.size),
        safeFileName: file.name,
      };
    }

    const extWithoutDot = rawExt.substring(1);
    const mimeType = file.type || SUPPORTED_MIME_TYPES[extWithoutDot] || 'application/octet-stream';
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    return {
      valid: true,
      extension: rawExt,
      mimeType,
      formattedSize: this.formatFileSize(file.size),
      safeFileName,
    };
  }

  /**
   * Generates standard Firebase Storage path:
   * materials/{universityId}/{courseId}/{materialId}/{safeFileName}
   */
  generateStoragePath(
    universityId: string,
    courseId: string,
    materialId: string,
    safeFileName: string
  ): string {
    const safeUni = (universityId || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const safeCourse = (courseId || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const cleanMatId = materialId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanFile = safeFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `materials/${safeUni}/${safeCourse}/${cleanMatId}/${cleanFile}`;
  }

  /**
   * Helper to convert File to Base64 string for resilient backup upload
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Persists material binary chunks to Firebase Firestore (dbDefault & db)
   * so any container instance (ais-dev / ais-pre) or client viewer can retrieve the exact file binary
   * even when Firebase Cloud Storage bucket is unprovisioned or local disk resets.
   */
  private async persistMaterialBinaryInFirestore(params: {
    materialId: string;
    storagePath: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    base64Data: string;
  }): Promise<void> {
    try {
      const cleanBase64 = params.base64Data.replace(/^data:[^;]+;base64,/, '');
      if (!cleanBase64 || params.fileSizeBytes > 15 * 1024 * 1024) {
        return;
      }
      const CHUNK_SIZE = 500000;
      const totalChunks = Math.ceil(cleanBase64.length / CHUNK_SIZE);
      const now = new Date().toISOString();

      const writeToDatabase = async (database: any) => {
        for (let i = 0; i < totalChunks; i++) {
          const chunkStr = cleanBase64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          await setDoc(doc(database, 'material_file_chunks', `${params.materialId}_chunk_${i}`), {
            materialId: params.materialId,
            storagePath: params.storagePath,
            chunkIndex: i,
            totalChunks,
            data: chunkStr,
            updatedAt: now,
          });
        }
        await setDoc(doc(database, 'material_file_manifests', params.materialId), {
          materialId: params.materialId,
          storagePath: params.storagePath,
          fileName: params.fileName,
          mimeType: params.mimeType,
          contentType: params.mimeType,
          fileSize: params.fileSizeBytes,
          totalChunks,
          updatedAt: now,
        });
      };

      await Promise.allSettled([writeToDatabase(dbDefault), writeToDatabase(db)]);
    } catch (err) {
      console.warn('[MATERIALS_UPLOAD] Cloud chunk backup notice:', err);
    }
  }

  /**
   * Resilient server storage fallback with real XHR progress tracking
   */
  private async uploadToServerStorage(
    file: File,
    storagePath: string,
    materialId: string,
    validation: FileValidationResult,
    onProgress?: UploadProgressCallback
  ): Promise<{ fileUrl: string; downloadURL?: string; storagePath: string; fileName: string; fileSize: string; mimeType: string }> {
    const base64Data = await this.fileToBase64(file);

    // Also persist binary chunks to Firebase Firestore in parallel so cross-instance viewers always have the file
    const firestoreChunkPromise = this.persistMaterialBinaryInFirestore({
      materialId,
      storagePath,
      fileName: validation.safeFileName,
      mimeType: validation.mimeType,
      fileSizeBytes: file.size,
      base64Data,
    });

    const serverResult = await new Promise<{
      fileUrl: string;
      downloadURL?: string;
      storagePath: string;
      fileName: string;
      fileSize: string;
      mimeType: string;
    }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/materials/storage/upload');
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && evt.total > 0) {
          const pct = Math.min(95, Math.max(10, Math.round((evt.loaded / evt.total) * 95)));
          console.log('[MATERIALS_UPLOAD] STORAGE_UPLOAD_PROGRESS', { percentage: pct, stage: 'uploading' });
          onProgress?.(pct, 'uploading');
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('[MATERIALS_UPLOAD] STORAGE_UPLOAD_COMPLETED', { storagePath: data.storagePath || storagePath });
            console.log('[MATERIALS_UPLOAD] DOWNLOAD_URL_RECEIVED', { fileUrl: data.fileUrl });
            resolve({
              fileUrl: data.fileUrl,
              downloadURL: data.downloadURL || data.fileUrl,
              storagePath: data.storagePath || storagePath,
              fileName: validation.safeFileName,
              fileSize: validation.formattedSize,
              mimeType: validation.mimeType,
            });
          } catch (jsonErr) {
            reject(new Error('Invalid server response format during storage upload'));
          }
        } else {
          let errMsg = `Upload failed with status ${xhr.status}`;
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData?.error) errMsg = errData.error;
          } catch {}
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network failure: Unable to establish connection to the storage server.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timeout: The file upload took too long and timed out.'));
      };

      xhr.timeout = 60000;
      xhr.send(
        JSON.stringify({
          storagePath,
          materialId,
          base64Data,
          mimeType: validation.mimeType,
          fileName: validation.safeFileName,
        })
      );
    });

    await firestoreChunkPromise;
    return serverResult;
  }

  /**
   * Uploads file to Firebase Cloud Storage with real progress tracking.
   * If Cloud Storage bucket is not enabled or throws unknown error, uses server fallback + Firestore binary chunks.
   */
  async uploadFileToStorage(
    file: File,
    universityId: string,
    courseId: string,
    materialId: string,
    onProgress?: UploadProgressCallback
  ): Promise<{ fileUrl: string; downloadURL?: string; storagePath: string; fileName: string; fileSize: string; mimeType: string }> {
    const validation = this.validateMaterialFile(file);
    if (!validation.valid) {
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', { stage: 'VALIDATION', error: validation.error });
      throw new Error(validation.error || 'Invalid file');
    }

    const storagePath = this.generateStoragePath(universityId, courseId, materialId, validation.safeFileName);

    console.log('[MATERIALS_UPLOAD] STORAGE_UPLOAD_STARTED', {
      storagePath,
      fileName: validation.safeFileName,
      fileSize: validation.formattedSize,
      mimeType: validation.mimeType,
    });

    onProgress?.(5, 'preparing');

    // 1. Attempt upload to Firebase Cloud Storage first with fast failover timeout
    let uploadTask: any = null;
    let timeoutId: any = null;

    try {
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: validation.mimeType,
        customMetadata: {
          originalName: file.name,
          universityId,
          courseId,
          materialId,
          uploadedAt: new Date().toISOString(),
        },
      };

      uploadTask = uploadBytesResumable(storageRef, file, metadata);

      await new Promise<void>((resolve, reject) => {
        // 5-second fast failover timer if initial connection stalls (0 bytes transferred)
        // and 20-second overall cap so upload never stays in a prolonged loading state
        let hasProgressed = false;
        const stallTimeoutId = setTimeout(() => {
          if (!hasProgressed) {
            try {
              uploadTask.cancel();
            } catch {}
            reject(new Error('Firebase Cloud Storage initial handshake timed out.'));
          }
        }, 4500);

        timeoutId = setTimeout(() => {
          clearTimeout(stallTimeoutId);
          try {
            uploadTask.cancel();
          } catch {}
          reject(new Error('Firebase Cloud Storage connection timed out.'));
        }, 20000);

        uploadTask.on(
          'state_changed',
          (snapshot: any) => {
            if (snapshot.bytesTransferred > 0) {
              hasProgressed = true;
              clearTimeout(stallTimeoutId);
            }
            if (snapshot.totalBytes > 0) {
              const progress = Math.min(95, Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
              console.log('[MATERIALS_UPLOAD] STORAGE_UPLOAD_PROGRESS', { percentage: progress, stage: 'uploading' });
              onProgress?.(progress, 'uploading');
            }
          },
          (error: any) => {
            clearTimeout(stallTimeoutId);
            if (timeoutId) clearTimeout(timeoutId);
            reject(error);
          },
          () => {
            clearTimeout(stallTimeoutId);
            if (timeoutId) clearTimeout(timeoutId);
            resolve();
          }
        );
      });

      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('[MATERIALS_UPLOAD] STORAGE_UPLOAD_COMPLETED', { storagePath });
      console.log('[MATERIALS_UPLOAD] DOWNLOAD_URL_RECEIVED', { fileUrl: downloadUrl });

      // Mirror to server storage and Firestore chunks in background so AI Tutor indexing & local reader always have the file
      this.uploadToServerStorage(file, storagePath, materialId, validation).catch(() => {});

      return {
        fileUrl: downloadUrl,
        downloadURL: downloadUrl,
        storagePath,
        fileName: validation.safeFileName,
        fileSize: validation.formattedSize,
        mimeType: validation.mimeType,
      };
    } catch (firebaseStorageError: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn(
        '[MATERIALS_UPLOAD] Firebase Cloud Storage direct attempt failed, utilizing durable server + Firestore storage fallback:',
        firebaseStorageError?.message || firebaseStorageError
      );

      // 2. Seamless resilient fallback via server storage endpoint + Firestore binary chunks with real progress
      try {
        const fallbackResult = await this.uploadToServerStorage(
          file,
          storagePath,
          materialId,
          validation,
          onProgress
        );
        return fallbackResult;
      } catch (fallbackError: any) {
        onProgress?.(0, 'failed');
        console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', {
          stage: 'STORAGE_UPLOAD',
          storagePath,
          error: fallbackError?.message || fallbackError,
        });
        throw fallbackError;
      }
    }
  }

  /**
   * Safely deletes file from Cloud Storage and server storage
   */
  async deleteFileFromStorage(storagePath?: string): Promise<void> {
    if (!storagePath) return;

    // 1. Try Firebase Cloud Storage delete
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch {
      // Cloud storage delete may fail if stored via fallback
    }

    // 2. Try server storage cleanup
    try {
      await fetch('/api/materials/file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: storagePath }),
      });
    } catch {
      // Non-blocking cleanup
    }
  }

  /**
   * Fetch materials with optional filtering and pagination
   */
  async getMaterials(filters?: MaterialFilterOptions, pageSize: number = 100): Promise<AcademicMaterialRecord[]> {
    try {
      const mergedById = new Map<string, AcademicMaterialRecord>();

      // 1. Read from persistent server metadata repository first
      try {
        const res = await fetch('/api/materials/metadata');
        if (res.ok) {
          const payload = await res.json();
          if (Array.isArray(payload?.materials)) {
            for (const m of payload.materials) {
              const id = String(m.id || m.materialId || '').trim();
              if (id) {
                mergedById.set(id, { ...m, id } as AcademicMaterialRecord);
              }
            }
          }
        }
      } catch (srvErr) {
        console.warn('AdminMaterialsService: Server metadata fetch notice:', srvErr);
      }

      // 2. Read from Firestore ('materials' and 'learning_materials') across db and dbDefault
      const fetchCol = async (database: any, colName: string) => {
        try {
          const snap = await getDocs(query(collection(database, colName), limit(pageSize)));
          for (const d of snap.docs) {
            const raw = { id: d.id, ...(d.data() as any) } as AcademicMaterialRecord;
            mergedById.set(d.id, raw);
          }
        } catch {
          // ignore individual collection read failure
        }
      };

      await Promise.all([
        fetchCol(db, 'materials'),
        fetchCol(dbDefault, 'materials'),
        fetchCol(db, 'learning_materials'),
      ]);

      let list = Array.from(mergedById.values());

      // Normalize helper for catalogue references
      const normRef = (val?: string) =>
        String(val || '')
          .trim()
          .toLowerCase()
          .replace(/^udsm[_-]/, '');

      // In-memory multi-attribute filtering
      if (filters) {
        const {
          search,
          materialType,
          status,
          universityId,
          academicUnitId,
          departmentId,
          programmeId,
          yearId,
          semesterId,
          courseId,
        } = filters;

        if (materialType && materialType !== 'ALL') {
          list = list.filter((m) => m.materialType === materialType);
        }

        if (status && status !== 'ALL') {
          list = list.filter((m) => (m.status || 'active') === status);
        }

        if (universityId && universityId !== 'ALL') {
          const target = universityId.toLowerCase().trim();
          list = list.filter((m) => !m.universityId || m.universityId.toLowerCase().trim() === target);
        }

        if (academicUnitId && academicUnitId !== 'ALL') {
          const target = normRef(academicUnitId);
          list = list.filter((m) => normRef(m.academicUnitId) === target);
        }

        if (departmentId && departmentId !== 'ALL') {
          const target = normRef(departmentId);
          list = list.filter((m) => normRef(m.departmentId) === target);
        }

        if (programmeId && programmeId !== 'ALL') {
          const target = normRef(programmeId);
          list = list.filter((m) => normRef(m.programmeId) === target);
        }

        if (yearId !== undefined && yearId !== null && yearId !== '' && yearId !== ('ALL' as any)) {
          list = list.filter((m) => String(m.yearId) === String(yearId));
        }

        if (semesterId !== undefined && semesterId !== null && semesterId !== '' && semesterId !== ('ALL' as any)) {
          list = list.filter((m) => String(m.semesterId) === String(semesterId));
        }

        if (courseId && courseId !== 'ALL') {
          const cId = courseId.toLowerCase().trim();
          const cCanon = cId.replace(/[^a-z0-9]+/g, '_');
          list = list.filter((m) => {
            const mCourseId = (m.courseId || '').toLowerCase().trim();
            const mCourseCode = (m.courseCode || '').toLowerCase().trim();
            const mCodeCanon = mCourseCode.replace(/[^a-z0-9]+/g, '_');
            const mIdCanon = mCourseId.replace(/[^a-z0-9]+/g, '_');
            return (
              mCourseId === cId ||
              mCourseCode === cId ||
              mCodeCanon === cCanon ||
              mIdCanon === cCanon ||
              (mCodeCanon && cCanon.endsWith(`_${mCodeCanon}`)) ||
              (cCanon && mIdCanon.endsWith(`_${cCanon}`))
            );
          });
        }

        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          list = list.filter(
            (m) =>
              m.title?.toLowerCase().includes(s) ||
              m.description?.toLowerCase().includes(s) ||
              m.fileName?.toLowerCase().includes(s) ||
              m.courseCode?.toLowerCase().includes(s) ||
              m.courseTitle?.toLowerCase().includes(s) ||
              m.programmeName?.toLowerCase().includes(s) ||
              m.departmentName?.toLowerCase().includes(s) ||
              m.materialType?.toLowerCase().includes(s)
          );
        }
      }

      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return list.slice(0, pageSize);
    } catch (error: any) {
      console.warn('AdminMaterialsService.getMaterials error:', error);
      return [];
    }
  }

  /**
   * Fetch single material by ID
   */
  async getMaterial(id: string): Promise<AcademicMaterialRecord | null> {
    if (!id) return null;

    // 1. Check persistent server metadata repository first
    try {
      const res = await fetch(`/api/materials/metadata/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.material) {
          return { ...data.material, id: data.material.id || id } as AcademicMaterialRecord;
        }
      }
    } catch {
      // fall through to Firestore
    }

    // 2. Check Firestore
    try {
      let snap = await getDoc(doc(db, 'materials', id));
      if (!snap.exists()) {
        snap = await getDoc(doc(dbDefault, 'materials', id));
      }
      if (!snap.exists()) {
        snap = await getDoc(doc(db, 'learning_materials', id));
      }
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as any) } as AcademicMaterialRecord;
    } catch {
      return null;
    }
  }

  /**
   * Creates a new material with full workflow:
   * 1. Validates metadata & placement
   * 2. Uploads file to Cloud Storage / durable server storage (with progress)
   * 3. Saves metadata to Firestore AND persistent server repository
   * 4. Verifies saved document can be retrieved before returning success
   * 5. Cleans up file if metadata write fails
   */
  async createMaterialWithFile(
    data: Omit<AcademicMaterialRecord, 'id' | 'createdAt' | 'updatedAt' | 'fileUrl' | 'storagePath' | 'fileName' | 'fileSize' | 'mimeType'>,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<AcademicMaterialRecord> {
    const user = auth.currentUser;
    const materialId = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    console.log('[MATERIALS_UPLOAD] START_UPLOAD', {
      materialId,
      title: data.title,
      courseId: data.courseId,
      courseCode: data.courseCode,
      universityId: data.universityId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploaderUid: user?.uid || (typeof data.uploadedBy === 'object' ? data.uploadedBy?.uid : data.uploadedBy),
    });

    // 1. Upload File to Storage
    let uploadResult: { fileUrl: string; storagePath: string; fileName: string; fileSize: string; mimeType: string };
    try {
      uploadResult = await this.uploadFileToStorage(
        file,
        data.universityId,
        data.courseId,
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

    if (!uploadResult?.fileUrl || !uploadResult?.storagePath) {
      onProgress?.(0, 'failed');
      throw new Error('Storage upload did not return a valid file URL or storage path.');
    }

    onProgress?.(95, 'saving');

    // 2. Prepare metadata record
    const now = new Date().toISOString();
    const uploaderInfo =
      typeof data.uploadedBy === 'object' && data.uploadedBy !== null
        ? data.uploadedBy
        : {
            uid: user?.uid || 'admin_user',
            email: user?.email || 'admin@venue.ac.tz',
            name: user?.displayName || 'Administrator',
            role: 'super_admin',
          };

    const canonicalCourseId = (data.courseCode || data.courseId || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');

    const newRecord: AcademicMaterialRecord = {
      ...data,
      id: materialId,
      materialId,
      canonicalCourseId: canonicalCourseId || data.courseId,
      fileUrl: uploadResult.fileUrl,
      storagePath: uploadResult.storagePath,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      uploadedBy: uploaderInfo,
      uploadedByUid: uploaderInfo.uid || user?.uid || 'admin_user',
      uploaderRole: data.uploaderRole || uploaderInfo.role || 'super_admin',
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    } as AcademicMaterialRecord;
    (newRecord as any).filePath = uploadResult.storagePath;
    (newRecord as any).downloadURL = uploadResult.downloadURL || uploadResult.fileUrl;
    (newRecord as any).contentType = uploadResult.mimeType;

    // 3. Save to Firestore AND persistent server metadata repository
    console.log('[MATERIALS_UPLOAD] FIRESTORE_SAVE_STARTED', {
      materialId,
      collection: 'materials',
      title: newRecord.title,
      courseId: newRecord.courseId,
      storagePath: newRecord.storagePath,
    });

    let savedInFirestore = false;
    let savedInServerStore = false;
    let lastSaveError: any = null;

    // 3A. Save to persistent server metadata repository (verifies file exists on disk if local storagePath)
    try {
      const srvRes = await fetch('/api/materials/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      const srvJson = await srvRes.json().catch(() => ({}));
      if (srvRes.ok && srvJson?.success) {
        savedInServerStore = true;
      } else {
        lastSaveError = new Error(srvJson?.error || 'Server metadata persistence failed');
      }
    } catch (srvErr) {
      lastSaveError = srvErr;
    }

    // 3B. Save to Firestore across both db and dbDefault (materials & learning_materials)
    const fsResults = await Promise.allSettled([
      setDoc(doc(db, 'materials', materialId), newRecord),
      setDoc(doc(db, 'learning_materials', materialId), newRecord),
      setDoc(doc(dbDefault, 'materials', materialId), newRecord),
      setDoc(doc(dbDefault, 'learning_materials', materialId), newRecord),
    ]);
    if (fsResults.some((r) => r.status === 'fulfilled')) {
      savedInFirestore = true;
    } else {
      const firstRejected = fsResults.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      if (firstRejected?.reason) {
        lastSaveError = firstRejected.reason;
      }
    }

    if (!savedInFirestore && !savedInServerStore) {
      console.error('[MATERIALS_UPLOAD] UPLOAD_ERROR', {
        stage: 'FIRESTORE_SAVE',
        materialId,
        error: lastSaveError?.message || lastSaveError,
      });
      await this.deleteFileFromStorage(uploadResult.storagePath);
      onProgress?.(0, 'failed');
      throw new Error(
        `Material metadata save failed: ${lastSaveError?.message || 'Database write error'}`
      );
    }

    // 4. Verify saved document can be retrieved back using getMaterial
    const verifiedRecord = await this.getMaterial(materialId);
    if (!verifiedRecord) {
      await this.deleteFileFromStorage(uploadResult.storagePath);
      onProgress?.(0, 'failed');
      throw new Error('Upload verification failed: Saved material record could not be retrieved after upload.');
    }

    console.log('[MATERIALS_UPLOAD] FIRESTORE_SAVE_COMPLETED', {
      materialId,
      courseId: newRecord.courseId,
      storagePath: newRecord.storagePath,
      savedInFirestore,
      savedInServerStore,
    });

    await this.logAudit('create_material', materialId, {
      title: newRecord.title,
      materialType: newRecord.materialType,
      courseId: newRecord.courseId,
      programmeId: newRecord.programmeId,
      storagePath: newRecord.storagePath,
    });

    console.log('[MATERIALS_UPLOAD] UPLOAD_SUCCESS', {
      materialId,
      title: newRecord.title,
      courseCode: newRecord.courseCode,
      fileUrl: newRecord.fileUrl,
    });

    onProgress?.(100, 'completed');
    return verifiedRecord;
  }

  /**
   * Updates an existing material record.
   * If a replacement file is provided, uploads new file first, updates Firestore & server store,
   * and only then removes the old file.
   */
  async updateMaterial(
    id: string,
    updates: Partial<Omit<AcademicMaterialRecord, 'id' | 'createdAt'>>,
    replacementFile?: File | null,
    onProgress?: UploadProgressCallback
  ): Promise<AcademicMaterialRecord> {
    if (!id) throw new Error('Material ID is required for update');

    const existing = await this.getMaterial(id);
    if (!existing) throw new Error(`Material with ID ${id} not found`);

    let newStoragePath = existing.storagePath;
    let newFileUrl = existing.fileUrl;
    let newFileName = existing.fileName;
    let newFileSize = existing.fileSize;
    let newMimeType = existing.mimeType;
    let hasNewFile = false;

    // 1. If replacement file is provided, upload it first
    if (replacementFile) {
      const targetUni = updates.universityId || existing.universityId;
      const targetCourse = updates.courseId || existing.courseId;

      const uploadResult = await this.uploadFileToStorage(
        replacementFile,
        targetUni,
        targetCourse,
        id,
        onProgress
      );

      newStoragePath = uploadResult.storagePath;
      newFileUrl = uploadResult.fileUrl;
      newFileName = uploadResult.fileName;
      newFileSize = uploadResult.fileSize;
      newMimeType = uploadResult.mimeType;
      hasNewFile = true;
    }

    onProgress?.(95, 'saving');

    // 2. Prepare payload
    const now = new Date().toISOString();
    const finalPayload = {
      ...updates,
      ...(hasNewFile
        ? {
            storagePath: newStoragePath,
            fileUrl: newFileUrl,
            fileName: newFileName,
            fileSize: newFileSize,
            mimeType: newMimeType,
          }
        : {}),
      updatedAt: now,
    };

    const mergedUpdated: AcademicMaterialRecord = {
      ...existing,
      ...finalPayload,
      id,
    } as AcademicMaterialRecord;

    let updatedAny = false;
    let lastErr: any = null;

    // 3A. Update server metadata repository
    try {
      const srvRes = await fetch(`/api/materials/metadata/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedUpdated),
      });
      if (srvRes.ok) {
        updatedAny = true;
      } else if (srvRes.status === 404) {
        const postRes = await fetch('/api/materials/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedUpdated),
        });
        if (postRes.ok) updatedAny = true;
      }
    } catch (e) {
      lastErr = e;
    }

    // 3B. Update Firestore
    try {
      try {
        await setDoc(doc(db, 'materials', id), mergedUpdated, { merge: true });
        updatedAny = true;
        setDoc(doc(db, 'learning_materials', id), mergedUpdated, { merge: true }).catch(() => {});
      } catch {
        await setDoc(doc(dbDefault, 'materials', id), mergedUpdated, { merge: true });
        updatedAny = true;
      }
    } catch (err: any) {
      lastErr = err;
    }

    if (!updatedAny) {
      if (hasNewFile && newStoragePath && newStoragePath !== existing.storagePath) {
        await this.deleteFileFromStorage(newStoragePath);
      }
      onProgress?.(0, 'failed');
      throw new Error(`Failed to update material: ${lastErr?.message || 'Database write error'}`);
    }

    // 4. Safely remove old storage file only after update succeeds
    if (hasNewFile && existing.storagePath && existing.storagePath !== newStoragePath) {
      await this.deleteFileFromStorage(existing.storagePath);
    }

    await this.logAudit('update_material', id, {
      updatedFields: Object.keys(finalPayload),
      replacedFile: hasNewFile,
    });

    onProgress?.(100, 'completed');
    return mergedUpdated;
  }

  /**
   * Safely deletes material: removes Firestore & server metadata and deletes the storage file.
   */
  async deleteMaterial(id: string): Promise<void> {
    if (!id) throw new Error('Material ID is required for deletion');

    const existing = await this.getMaterial(id);
    if (!existing) {
      return;
    }

    let deletedAny = false;
    let lastErr: any = null;

    // 1A. Delete from server metadata store
    try {
      const res = await fetch(`/api/materials/metadata/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) deletedAny = true;
    } catch (e) {
      lastErr = e;
    }

    // 1B. Delete from Firestore
    try {
      try {
        await deleteDoc(doc(db, 'materials', id));
        deletedAny = true;
      } catch {
        await deleteDoc(doc(dbDefault, 'materials', id));
        deletedAny = true;
      }
      deleteDoc(doc(db, 'learning_materials', id)).catch(() => {});
    } catch (err: any) {
      lastErr = err;
    }

    if (!deletedAny && lastErr) {
      throw new Error(`Failed to delete material from database: ${lastErr?.message || 'Permission denied'}`);
    }

    // 2. Delete associated Storage file
    if (existing.storagePath) {
      await this.deleteFileFromStorage(existing.storagePath);
    }

    await this.logAudit('delete_material', id, {
      title: existing.title,
      storagePath: existing.storagePath,
    });
  }

  /**
   * Quick count of materials
   */
  async getMaterialsCount(): Promise<number> {
    try {
      const list = await this.getMaterials(undefined, 500);
      return list.length;
    } catch {
      return 0;
    }
  }
}

export const adminMaterialsService = new AdminMaterialsService();
