import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, dbDefault, storage, handleFirestoreError, OperationType } from './firebase';
import {
  AcademicMaterialRecord,
  AcademicMaterialType,
  Course,
  StudentProfile,
} from '../types';
import {
  subscriptionEntitlementService,
  MaterialDownloadEntitlementResult,
} from './subscriptionEntitlementService';

export interface StudentAcademicContext {
  universityId?: string;
  academicUnitId?: string;
  departmentId?: string;
  programmeId?: string;
  yearId?: number;
  semesterId?: number;
  enrolledCourseCodes?: string[];
  enrolledCourseIds?: string[];
}

export interface StudentMaterialQueryFilters {
  courseId?: string;
  courseCode?: string;
  materialType?: AcademicMaterialType | 'ALL';
  semester?: number | 'ALL';
  search?: string;
  pageSize?: number;
}

export interface StudentMaterialStats {
  total: number;
  byType: Record<string, number>;
  byCourse: Record<string, number>;
}

class StudentMaterialsService {
  /**
   * Extracts academic hierarchy integers and references from student profile
   */
  extractStudentContext(profile?: StudentProfile, courses?: Course[]): StudentAcademicContext {
    let yearId: number | undefined;
    if (profile?.yearOfStudy) {
      const match = String(profile.yearOfStudy).match(/\d+/);
      if (match) yearId = parseInt(match[0], 10);
    }

    let semesterId: number | undefined;
    if (profile?.semester) {
      const match = String(profile.semester).match(/\d+/);
      if (match) semesterId = parseInt(match[0], 10);
    }

    const enrolledCourseCodes = (courses || [])
      .map((c) => (c.code || c.courseCode || '').trim().toUpperCase())
      .filter(Boolean);

    const enrolledCourseIds = (courses || [])
      .map((c) => (c.id || '').trim().toLowerCase())
      .filter(Boolean);

    return {
      universityId: profile?.universityId || profile?.institutionId || 'udsm',
      academicUnitId: profile?.academicUnitId || profile?.collegeId,
      departmentId: profile?.departmentId,
      programmeId: profile?.programmeId,
      yearId,
      semesterId,
      enrolledCourseCodes,
      enrolledCourseIds,
    };
  }

  /**
   * Queries Firestore for materials relevant to the student's academic context and courses.
   * Enforces status === 'active' at both query and in-memory level.
   * Preserves shared canonical-course materials across all programmes that take the course.
   */
  async getStudentMaterials(
    context: StudentAcademicContext,
    filters?: StudentMaterialQueryFilters
  ): Promise<AcademicMaterialRecord[]> {
    const pageSize = filters?.pageSize || 100;
    const rawMap = new Map<string, AcademicMaterialRecord>();

    const addSnapDocs = (snap: any) => {
      if (!snap || snap.empty) return;
      snap.docs.forEach((d: any) => {
        rawMap.set(d.id, {
          id: d.id,
          ...(d.data() as any),
        } as AcademicMaterialRecord);
      });
    };

    const targetCourseId = filters?.courseId?.trim();
    const targetCourseCode = filters?.courseCode?.trim().toUpperCase();
    const targetCanonId = (targetCourseCode || targetCourseId || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');

    try {
      // 0. Query persistent server metadata repository first so uploaded materials are always found
      try {
        const params = new URLSearchParams();
        params.set('status', 'active');
        if (targetCourseCode) params.set('courseCode', targetCourseCode);
        else if (targetCourseId) params.set('courseId', targetCourseId);
        const srvRes = await fetch(`/api/materials/metadata?${params.toString()}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (srvRes.ok) {
          const payload = await srvRes.json();
          if (Array.isArray(payload?.materials)) {
            for (const item of payload.materials) {
              if (item && item.id) {
                rawMap.set(item.id, item as AcademicMaterialRecord);
              }
            }
          }
        }
        // If filtering by a specific course and server returned 0 with strict param, also fetch all active materials to match by canonicalCourseId or code alias
        if ((targetCourseCode || targetCourseId) && rawMap.size === 0) {
          const fallbackSrvRes = await fetch('/api/materials/metadata?status=active', {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          if (fallbackSrvRes.ok) {
            const payload = await fallbackSrvRes.json();
            if (Array.isArray(payload?.materials)) {
              for (const item of payload.materials) {
                if (item && item.id) {
                  rawMap.set(item.id, item as AcademicMaterialRecord);
                }
              }
            }
          }
        }
      } catch {
        // Non-fatal fallback to Firestore
      }

      // 1. If filtering by a specific course, query by courseCode, courseId, and canonicalCourseId
      if (targetCourseCode) {
        try {
          const qCode = query(
            collection(db, 'materials'),
            where('status', '==', 'active'),
            where('courseCode', '==', targetCourseCode),
            limit(pageSize)
          );
          addSnapDocs(await getDocs(qCode));
        } catch {
          try {
            const fbCode = query(
              collection(db, 'materials'),
              where('courseCode', '==', targetCourseCode),
              limit(pageSize)
            );
            addSnapDocs(await getDocs(fbCode));
          } catch {}
        }
      }

      if (targetCourseId && rawMap.size === 0) {
        try {
          const qId = query(
            collection(db, 'materials'),
            where('status', '==', 'active'),
            where('courseId', '==', targetCourseId),
            limit(pageSize)
          );
          addSnapDocs(await getDocs(qId));
        } catch {
          try {
            const fbId = query(
              collection(db, 'materials'),
              where('courseId', '==', targetCourseId),
              limit(pageSize)
            );
            addSnapDocs(await getDocs(fbId));
          } catch {}
        }
      }

      if (targetCanonId && rawMap.size === 0) {
        try {
          const qCanon = query(
            collection(db, 'materials'),
            where('status', '==', 'active'),
            where('canonicalCourseId', '==', targetCanonId),
            limit(pageSize)
          );
          addSnapDocs(await getDocs(qCanon));
        } catch {}
      }

      // 2. Also query active materials across the university so shared canonical course materials
      // uploaded under another programme (or general university scope) are never missed
      try {
        const defaultSnap = await getDocs(
          query(collection(dbDefault, 'materials'), where('status', '==', 'active'), limit(pageSize))
        );
        addSnapDocs(defaultSnap);
      } catch {
        try {
          const allDefaultSnap = await getDocs(query(collection(dbDefault, 'materials'), limit(pageSize)));
          addSnapDocs(allDefaultSnap);
        } catch {}
      }

      if (rawMap.size === 0 || (!targetCourseId && !targetCourseCode)) {
        try {
          const uniQ = query(
            collection(db, 'materials'),
            where('status', '==', 'active'),
            limit(pageSize)
          );
          addSnapDocs(await getDocs(uniQ));
        } catch {
          try {
            const allSnap = await getDocs(query(collection(db, 'materials'), limit(pageSize)));
            addSnapDocs(allSnap);
          } catch {
            // Handled via dbDefault and server metadata above
          }
        }
      }
    } catch (err) {
      console.warn('StudentMaterialsService: Error querying materials:', err);
      return [];
    }

    const rawDocs = Array.from(rawMap.values());

    // Strict security filter: Only active materials visible to students
    let filtered = rawDocs.filter((m) => m.status === 'active');

    // Context filter: Check if material belongs to student's university and either their programme OR any of their enrolled canonical courses
    if (context.universityId) {
      const uni = context.universityId.toLowerCase();
      filtered = filtered.filter(
        (m) => !m.universityId || m.universityId.toLowerCase() === uni || m.universityId === 'udsm'
      );
    }

    // Specific Course filter (if selected): match by courseId, courseCode, or canonicalCourseId
    if (targetCourseId || targetCourseCode) {
      const normTargetId = (targetCourseId || '').toLowerCase().trim();
      const normTargetCode = (targetCourseCode || '').toUpperCase().trim();
      const normTargetCanon = (normTargetCode || normTargetId).toLowerCase().replace(/[^a-z0-9]+/g, '_');

      filtered = filtered.filter((m) => {
        const mId = (m.courseId || '').toLowerCase().trim();
        const mCode = (m.courseCode || '').toUpperCase().trim();
        const mCanon = (m.canonicalCourseId || mCode || mId).toLowerCase().replace(/[^a-z0-9]+/g, '_');

        const matchId = normTargetId && mId === normTargetId;
        const matchCode = normTargetCode && mCode === normTargetCode;
        const matchCanon =
          normTargetCanon &&
          mCanon &&
          (mCanon === normTargetCanon ||
            normTargetCanon.endsWith(`_${mCanon}`) ||
            mCanon.endsWith(`_${normTargetCanon}`));

        return Boolean(matchId || matchCode || matchCanon);
      });
    } else if (
      (context.enrolledCourseCodes && context.enrolledCourseCodes.length > 0) ||
      context.programmeId
    ) {
      // When viewing general student Resources screen ('ALL' courses), include materials that match:
      // 1) Any of the student's enrolled canonical courses (by courseCode or courseId), OR
      // 2) The student's programmeId (if they haven't loaded courses yet)
      const enrolledCodesSet = new Set(
        (context.enrolledCourseCodes || []).map((c) => c.trim().toUpperCase())
      );
      const enrolledCanonSet = new Set(
        (context.enrolledCourseCodes || []).map((c) =>
          c.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
        )
      );
      const enrolledIdsSet = new Set(
        (context.enrolledCourseIds || []).map((id) => id.trim().toLowerCase())
      );
      const studentProg = (context.programmeId || '').trim().toLowerCase();

      if (enrolledCodesSet.size > 0 || enrolledIdsSet.size > 0) {
        filtered = filtered.filter((m) => {
          const mCode = (m.courseCode || '').trim().toUpperCase();
          const mId = (m.courseId || '').trim().toLowerCase();
          const mCanon = (m.canonicalCourseId || mCode || mId).toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const mProg = (m.programmeId || '').trim().toLowerCase();

          if (mCode && enrolledCodesSet.has(mCode)) return true;
          if (mId && enrolledIdsSet.has(mId)) return true;
          if (mCanon && enrolledCanonSet.has(mCanon)) return true;
          if (studentProg && mProg === studentProg) return true;
          // If no programme or course filter on material, allow general university resource
          if (!mCode && !mId && !mProg) return true;
          return false;
        });
      }
    }

    // Material Type filter
    if (filters?.materialType && filters.materialType !== 'ALL') {
      filtered = filtered.filter((m) => m.materialType === filters.materialType);
    }

    // Semester filter
    if (filters?.semester && filters.semester !== 'ALL') {
      filtered = filtered.filter((m) => {
        if (m.semesterId === undefined || m.semesterId === null) return true;
        return Number(m.semesterId) === Number(filters.semester);
      });
    }

    // Debounced Search filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.courseCode?.toLowerCase().includes(q) ||
          m.courseTitle?.toLowerCase().includes(q) ||
          m.fileName?.toLowerCase().includes(q) ||
          m.materialType?.toLowerCase().includes(q) ||
          m.programmeName?.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return filtered;
  }

  /**
   * Dedicated helper to fetch all active materials for a specific course (used by CourseDetailScreen)
   */
  async getMaterialsForCourse(
    courseId: string,
    courseCode?: string,
    universityId?: string
  ): Promise<AcademicMaterialRecord[]> {
    return this.getStudentMaterials(
      { universityId: universityId || 'udsm' },
      { courseId, courseCode, pageSize: 50 }
    );
  }

  /**
   * Fetches a single material record by ID from Firestore or server repository (used when opening /materials/:materialId/view directly)
   */
  async getMaterialById(materialId: string): Promise<AcademicMaterialRecord | null> {
    if (!materialId) return null;

    // 1. Check persistent server metadata repository first for fast resolution
    try {
      const res = await fetch(`/api/materials/metadata/${encodeURIComponent(materialId)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.material && (payload.material.status === 'active' || !payload.material.status)) {
          return { ...payload.material, id: payload.material.id || materialId } as AcademicMaterialRecord;
        }
      }
    } catch {
      // Fall through to Firestore
    }

    // 2. Check dbDefault and db across 'materials' and 'learning_materials'
    for (const [database, colName] of [
      [dbDefault, 'materials'],
      [db, 'materials'],
      [dbDefault, 'learning_materials'],
      [db, 'learning_materials'],
    ] as const) {
      try {
        const snap = await getDoc(doc(database, colName, materialId));
        if (snap.exists()) {
          const data = snap.data() as AcademicMaterialRecord;
          if (!data.status || data.status === 'active') {
            return { ...data, id: snap.id };
          }
        }
      } catch {
        // Ignore individual database/collection error and try next
      }
    }

    return null;
  }

  /**
   * Resolves the canonical storage file URL for reading/streaming the actual uploaded file.
   * Ensures we NEVER point to a frontend SPA route (e.g. /materials/...) which would return index.html ("AI.html").
   */
  resolveStorageFileUrl(material: AcademicMaterialRecord, mode: 'view' | 'download' = 'view'): string {
    const matId = String(material.id || material.materialId || '').trim();
    const rawUrl = String(
      material.fileUrl || (material as any).downloadURL || (material as any).downloadUrl || ''
    ).trim();
    const rawStoragePath = String(
      material.storagePath || (material as any).filePath || (material as any).objectPath || ''
    ).trim();

    // 1. If storagePath is available, construct the canonical /api/materials/file endpoint URL with materialId
    if (rawStoragePath) {
      const cleanPath = rawStoragePath.startsWith('materials/')
        ? rawStoragePath
        : `materials/${rawStoragePath.replace(/^\/+/, '')}`;
      return `/api/materials/file?path=${encodeURIComponent(cleanPath)}${
        matId ? `&materialId=${encodeURIComponent(matId)}` : ''
      }&mode=${mode}`;
    }

    // 2. If it's a direct Firebase Cloud Storage URL (https://firebasestorage.googleapis.com/...)
    if (
      rawUrl.startsWith('https://firebasestorage.googleapis.com/') ||
      rawUrl.startsWith('https://storage.googleapis.com/')
    ) {
      return rawUrl;
    }

    // 3. If fileUrl already points to /api/materials/file
    if (rawUrl.startsWith('/api/materials/file')) {
      let nextUrl = rawUrl;
      if (matId && !nextUrl.includes('materialId=')) {
        nextUrl += `${nextUrl.includes('?') ? '&' : '?'}materialId=${encodeURIComponent(matId)}`;
      }
      if (!nextUrl.includes('mode=')) {
        nextUrl += `${nextUrl.includes('?') ? '&' : '?'}mode=${mode}`;
      }
      return nextUrl;
    }

    // 4. If fileUrl was a relative path like "materials/udsm/..." or "/materials/udsm/..."
    // route it through /api/materials/file so Vite SPA fallback NEVER returns index.html ("AI.html")!
    if (rawUrl.startsWith('materials/') || rawUrl.startsWith('/materials/')) {
      const cleanRel = rawUrl.replace(/^\/+/, '');
      return `/api/materials/file?path=${encodeURIComponent(cleanRel)}${
        matId ? `&materialId=${encodeURIComponent(matId)}` : ''
      }&mode=${mode}`;
    }

    // 5. If only materialId is available, still query /api/materials/file by materialId
    if (!rawUrl && matId) {
      return `/api/materials/file?materialId=${encodeURIComponent(matId)}&mode=${mode}`;
    }

    return rawUrl;
  }

  /**
   * Multi-tier resilient binary file retrieval for the Student Material Viewer:
   * 1. Attempts canonical server storage endpoint (`/api/materials/file`, which self-heals from `.storage/material_blobs/`).
   * 2. Attempts direct Firebase Cloud Storage downloadURL (`https://firebasestorage.googleapis.com/...` or `getDownloadURL(ref(storage, storagePath))`).
   * 3. Attempts Firebase Firestore binary chunk store (`material_file_manifests` + `material_file_chunks` across `dbDefault` and `db`),
   *    reassembling the exact binary file in the browser and syncing it back to `/api/materials/storage/upload` in the background.
   */
  async retrieveMaterialFileBinary(material: AcademicMaterialRecord): Promise<{
    ok: boolean;
    status: number;
    arrayBuffer?: ArrayBuffer;
    contentType?: string;
    errorCode?: 'STORAGE_FILE_MISSING' | 'PERMISSION_DENIED' | 'AUTH_EXPIRED' | 'NETWORK_FAILURE';
    errorMessage?: string;
  }> {
    const matId = String(material.id || material.materialId || '').trim();
    const rawStoragePath = String(
      material.storagePath || (material as any).filePath || (material as any).objectPath || ''
    ).trim();
    const cleanStoragePath = rawStoragePath
      ? rawStoragePath.startsWith('materials/')
        ? rawStoragePath
        : `materials/${rawStoragePath.replace(/^\/+/, '')}`
      : '';
    const rawUrl = String(
      material.fileUrl || (material as any).downloadURL || (material as any).downloadUrl || ''
    ).trim();

    let lastStatus = 404;
    let lastErrorMessage = 'The requested material file was not found in storage.';

    // Tier 1: Canonical Server Storage Endpoint (/api/materials/file)
    const serverEndpointUrl = this.resolveStorageFileUrl(material, 'view');
    if (serverEndpointUrl) {
      try {
        const res = await fetch(serverEndpointUrl, { method: 'GET' });
        lastStatus = res.status;
        if (res.ok) {
          const ct = (res.headers.get('content-type') || '').toLowerCase();
          if (!ct.includes('text/html')) {
            const buf = await res.arrayBuffer();
            if (buf.byteLength > 0) {
              return {
                ok: true,
                status: 200,
                arrayBuffer: buf,
                contentType: ct || material.mimeType || 'application/octet-stream',
              };
            }
          }
        } else {
          const errData = await res.json().catch(() => null);
          if (errData?.message) lastErrorMessage = errData.message;
          if (res.status === 401) {
            return {
              ok: false,
              status: 401,
              errorCode: 'AUTH_EXPIRED',
              errorMessage: 'Your session has expired. Please sign in again to access course materials.',
            };
          }
          if (res.status === 403) {
            return {
              ok: false,
              status: 403,
              errorCode: 'PERMISSION_DENIED',
              errorMessage: errData?.message || 'You do not have permission to view this course material.',
            };
          }
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || lastErrorMessage;
      }
    }

    // Tier 2: Direct Firebase Cloud Storage URL or SDK getDownloadURL(ref(storage, storagePath))
    const candidateCloudUrls: string[] = [];
    if (
      rawUrl.startsWith('https://firebasestorage.googleapis.com/') ||
      rawUrl.startsWith('https://storage.googleapis.com/')
    ) {
      candidateCloudUrls.push(rawUrl);
    }
    if (cleanStoragePath) {
      try {
        const sdkUrl = await getDownloadURL(ref(storage, cleanStoragePath));
        if (sdkUrl && !candidateCloudUrls.includes(sdkUrl)) {
          candidateCloudUrls.push(sdkUrl);
        }
      } catch {
        // Cloud Storage bucket may not be enabled on free tier; proceed to Tier 3
      }
    }

    for (const cloudUrl of candidateCloudUrls) {
      try {
        const res = await fetch(cloudUrl, { method: 'GET' });
        if (res.ok) {
          const ct = (res.headers.get('content-type') || '').toLowerCase();
          if (!ct.includes('text/html')) {
            const buf = await res.arrayBuffer();
            if (buf.byteLength > 0) {
              return {
                ok: true,
                status: 200,
                arrayBuffer: buf,
                contentType: ct || material.mimeType || 'application/octet-stream',
              };
            }
          }
        }
      } catch {
        // Ignore and proceed to Tier 3
      }
    }

    // Tier 3: Firebase Firestore Binary Chunk Store (material_file_manifests & material_file_chunks)
    if (matId) {
      for (const database of [dbDefault, db]) {
        try {
          const manifestSnap = await getDoc(doc(database, 'material_file_manifests', matId));
          if (!manifestSnap.exists()) continue;

          const manifest = manifestSnap.data() as any;
          const totalChunks = Number(manifest?.totalChunks || 0);
          if (totalChunks <= 0) continue;

          const chunkPromises: Promise<any>[] = [];
          for (let i = 0; i < totalChunks; i++) {
            chunkPromises.push(getDoc(doc(database, 'material_file_chunks', `${matId}_chunk_${i}`)));
          }
          const chunkSnaps = await Promise.all(chunkPromises);
          if (chunkSnaps.some((s) => !s.exists())) continue;

          const combinedBase64 = chunkSnaps.map((s) => String(s.data()?.data || '')).join('');
          if (!combinedBase64) continue;

          const binaryStr = window.atob(combinedBase64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          // Self-heal server disk cache in background so subsequent requests & AI Tutor indexing are instant
          const syncPath =
            cleanStoragePath ||
            manifest.storagePath ||
            `materials/${material.universityId || 'udsm'}/${material.courseId || 'general'}/${matId}/${
              material.fileName || manifest.fileName || 'document.pdf'
            }`;
          fetch('/api/materials/storage/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storagePath: syncPath,
              materialId: matId,
              base64Data: combinedBase64,
              mimeType: material.mimeType || manifest.mimeType || 'application/pdf',
              fileName: material.fileName || manifest.fileName || 'document.pdf',
            }),
          }).catch(() => {});

          return {
            ok: true,
            status: 200,
            arrayBuffer: bytes.buffer,
            contentType: (material.mimeType || manifest.mimeType || 'application/pdf').toLowerCase(),
          };
        } catch {
          // Try next database
        }
      }
    }

    return {
      ok: false,
      status: lastStatus,
      errorCode: lastStatus === 404 ? 'STORAGE_FILE_MISSING' : 'NETWORK_FAILURE',
      errorMessage: lastErrorMessage,
    };
  }

  /**
   * Determines how a material file can be viewed inside the VENUE in-app viewer.
   * - 'pdf': In-app interactive PDF canvas reader (zoom, page nav, fit-width, fullscreen)
   * - 'image': In-app zoomable image viewer (JPG, JPEG, PNG, WEBP)
   * - 'text': In-app formatted document text viewer (TXT)
   * - 'unsupported': Office binary formats (DOC, DOCX, PPT, PPTX, XLS, XLSX) that cannot be safely rendered natively without external conversion
   */
  getViewerSupportType(
    fileName?: string,
    mimeType?: string
  ): 'pdf' | 'image' | 'text' | 'unsupported' {
    const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
    const mime = (mimeType || '').toLowerCase();

    if (ext === 'pdf' || mime.includes('pdf')) {
      return 'pdf';
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || mime.startsWith('image/')) {
      return 'image';
    }
    if (['txt', 'md', 'csv'].includes(ext) || mime.startsWith('text/plain')) {
      return 'text';
    }
    return 'unsupported';
  }

  /**
   * Preserves the original uploaded filename and extension (e.g., "Calculus_Notes.pdf").
   */
  getCleanOriginalFileName(material: AcademicMaterialRecord): string {
    const rawName = (material.fileName || '').trim();
    if (rawName && rawName.includes('.')) {
      return rawName;
    }
    const extFromMime =
      material.mimeType?.includes('pdf')
        ? '.pdf'
        : material.mimeType?.includes('word')
        ? '.docx'
        : material.mimeType?.includes('presentation')
        ? '.pptx'
        : material.mimeType?.includes('sheet')
        ? '.xlsx'
        : material.mimeType?.includes('png')
        ? '.png'
        : material.mimeType?.includes('jpeg') || material.mimeType?.includes('jpg')
        ? '.jpg'
        : '.pdf';
    const baseTitle = (material.title || 'Course_Material')
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, '_');
    return `${baseTitle}${extFromMime}`;
  }

  /**
   * Gated Premium Download Flow:
   * 1. Checks subscription entitlement BEFORE starting any Storage file download.
   * 2. If Free user (not Premium), immediately returns `{ allowed: false, requiresPremium: true }`
   *    without downloading the file.
   * 3. When Premium is active in future stages, fetches the binary blob, verifies Content-Type is NOT text/html,
   *    and triggers download with the exact original filename.
   */
  async requestMaterialDownload(
    material: AcademicMaterialRecord,
    userId?: string
  ): Promise<{
    success: boolean;
    requiresPremium: boolean;
    message: string;
    entitlement?: MaterialDownloadEntitlementResult;
  }> {
    // Step 1: Check entitlement BEFORE touching the storage file
    const entitlement = await subscriptionEntitlementService.verifyMaterialDownloadEntitlement({
      userId,
      materialId: material.id,
      storagePath: material.storagePath,
    });

    if (!entitlement.allowed || !entitlement.isPremium) {
      return {
        success: false,
        requiresPremium: true,
        message: entitlement.message,
        entitlement,
      };
    }

    // Step 2: Only executed if user is verified as Premium by backend
    const downloadUrl = this.resolveStorageFileUrl(material, 'download');
    if (!downloadUrl) {
      return {
        success: false,
        requiresPremium: false,
        message: 'Storage file reference is missing for this material.',
      };
    }

    try {
      const response = await fetch(downloadUrl, { method: 'GET' });
      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        if (response.status === 403 && errJson?.error === 'PREMIUM_DOWNLOAD_REQUIRED') {
          return {
            success: false,
            requiresPremium: true,
            message: errJson.message || entitlement.message,
            entitlement,
          };
        }
        throw new Error(errJson?.message || `Download failed (${response.status})`);
      }

      // Guard against accidentally saving an HTML fallback page ("AI.html")
      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        throw new Error(
          'Storage file could not be retrieved: Server returned an HTML document instead of the binary material file.'
        );
      }

      const blob = await response.blob();
      const originalFileName = this.getCleanOriginalFileName(material);
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = originalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      return {
        success: true,
        requiresPremium: false,
        message: `Downloaded ${originalFileName}`,
      };
    } catch (err: any) {
      return {
        success: false,
        requiresPremium: false,
        message: err?.message || 'Unable to download material file.',
      };
    }
  }

  /**
   * Legacy synchronous caller wrapper — never triggers raw HTML anchor download.
   */
  downloadMaterial(_material: AcademicMaterialRecord): {
    success: boolean;
    requiresPremium: boolean;
    message: string;
  } {
    return {
      success: false,
      requiresPremium: true,
      message:
        'Reading this material is free inside VENUE. Downloading course materials is available with VENUE Premium.',
    };
  }

  /**
   * Formats ISO timestamp to human friendly relative or date format
   */
  formatDate(isoString?: string): string {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Recent';

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;

      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  }

  /**
   * Visual badge styling helper for file types
   */
  getFileTypeBadge(fileName: string, mimeType?: string): {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  } {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (ext === 'pdf' || mimeType?.includes('pdf')) {
      return {
        label: 'PDF',
        bgColor: 'bg-rose-500/10',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/20',
      };
    }
    if (ext === 'doc' || ext === 'docx' || mimeType?.includes('word')) {
      return {
        label: 'DOCX',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/20',
      };
    }
    if (ext === 'ppt' || ext === 'pptx' || mimeType?.includes('presentation')) {
      return {
        label: 'PPTX',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/20',
      };
    }
    if (ext === 'xls' || ext === 'xlsx' || mimeType?.includes('sheet')) {
      return {
        label: 'XLSX',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/20',
      };
    }
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return {
        label: ext.toUpperCase(),
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/20',
      };
    }

    return {
      label: ext ? ext.toUpperCase() : 'DOC',
      bgColor: 'bg-slate-800',
      textColor: 'text-slate-300',
      borderColor: 'border-slate-700',
    };
  }

  /**
   * Visual badge styling helper for material types
   */
  getMaterialTypeBadge(type: AcademicMaterialType): {
    bgColor: string;
    textColor: string;
    borderColor: string;
  } {
    switch (type) {
      case 'Lecture Notes':
        return {
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-500/25',
        };
      case 'Slides':
        return {
          bgColor: 'bg-sky-500/10',
          textColor: 'text-sky-400',
          borderColor: 'border-sky-500/25',
        };
      case 'Past Papers':
        return {
          bgColor: 'bg-amber-500/10',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/25',
        };
      case 'Assignments':
        return {
          bgColor: 'bg-purple-500/10',
          textColor: 'text-purple-400',
          borderColor: 'border-purple-500/25',
        };
      case 'Solutions':
        return {
          bgColor: 'bg-emerald-500/10',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/25',
        };
      case 'Handouts':
        return {
          bgColor: 'bg-indigo-500/10',
          textColor: 'text-indigo-400',
          borderColor: 'border-indigo-500/25',
        };
      case 'Tutorials':
        return {
          bgColor: 'bg-teal-500/10',
          textColor: 'text-teal-400',
          borderColor: 'border-teal-500/25',
        };
      case 'Reference Materials':
        return {
          bgColor: 'bg-cyan-500/10',
          textColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/25',
        };
      default:
        return {
          bgColor: 'bg-slate-800',
          textColor: 'text-slate-400',
          borderColor: 'border-slate-700',
        };
    }
  }
}

export const studentMaterialsService = new StudentMaterialsService();
