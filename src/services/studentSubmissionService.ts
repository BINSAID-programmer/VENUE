import { authenticatedFetch } from './apiClient';
import { auth } from './firebase';

export const STUDENT_MAX_FILE_MB = 20;
export const STUDENT_ALLOWED_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

export interface SubmissionItem {
  id: string;
  title: string;
  description?: string;
  materialType: string;
  courseCode?: string;
  courseName?: string;
  fileName?: string;
  fileUrl?: string;
  status: 'pending_review' | 'active' | 'rejected' | 'changes_requested' | string;
  reviewNote?: string;
  createdAt?: string;
  uploadedBy?: { name?: string; email?: string };
}

export interface SubmitInput {
  file: File;
  title: string;
  description: string;
  materialType: string;
  course: {
    id: string;
    code: string;
    name: string;
    universityId?: string;
    academicUnitId?: string;
    departmentId?: string;
    programmeId?: string;
    year?: number | string;
    semester?: number | string;
  };
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(new Error('Could not read the file.'));
    r.readAsDataURL(file);
  });

async function json(res: Response) {
  return res.json().catch(() => ({}));
}

export const studentSubmissionService = {
  validate(file: File): string | null {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!STUDENT_ALLOWED_EXT.includes(ext)) return 'Allowed files: PDF, Word, PowerPoint, Excel, JPG, PNG.';
    if (file.size > STUDENT_MAX_FILE_MB * 1024 * 1024) return `File is too large (maximum ${STUDENT_MAX_FILE_MB}MB).`;
    if (file.size === 0) return 'This file is empty.';
    return null;
  },

  async submit(input: SubmitInput): Promise<SubmissionItem> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Please sign in again.');
    const bad = this.validate(input.file);
    if (bad) throw new Error(bad);

    const id = `mat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const safeName = input.file.name.replace(/[^A-Za-z0-9._-]+/g, '_').slice(-120);
    const storagePath = `materials/student/${uid}/${id}/${safeName}`;

    const up = await authenticatedFetch('/api/materials/storage/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storagePath,
        materialId: id,
        fileName: input.file.name,
        mimeType: input.file.type || 'application/octet-stream',
        base64Data: await toBase64(input.file),
      }),
    });
    const upData = await json(up);
    if (!up.ok || upData?.success === false) {
      throw new Error(upData?.error || upData?.message || 'Upload failed. Please try again.');
    }

    const c = input.course;
    const res = await authenticatedFetch('/api/materials/student-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        title: input.title,
        description: input.description,
        materialType: input.materialType,
        courseId: c.id,
        courseCode: c.code,
        courseName: c.name,
        canonicalCourseId: c.code.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        universityId: c.universityId,
        academicUnitId: c.academicUnitId,
        departmentId: c.departmentId,
        programmeId: c.programmeId,
        yearId: c.year,
        semesterId: c.semester,
        storagePath: upData.storagePath || storagePath,
        fileName: upData.fileName || input.file.name,
        fileSize: upData.fileSize || input.file.size,
        mimeType: upData.mimeType || input.file.type,
      }),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not send your file for review.');
    return data.material;
  },

  async mine(): Promise<SubmissionItem[]> {
    try {
      const res = await authenticatedFetch('/api/materials/mine', { cache: 'no-store' });
      if (!res.ok) return [];
      return (await json(res)).materials || [];
    } catch {
      return [];
    }
  },

  async adminList(status = 'pending_review'): Promise<SubmissionItem[]> {
    const res = await authenticatedFetch(`/api/materials/review?status=${encodeURIComponent(status)}`, { cache: 'no-store' });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not load submissions.');
    return data.materials || [];
  },

  async adminDecide(id: string, action: 'approve' | 'reject' | 'changes', note?: string): Promise<void> {
    const res = await authenticatedFetch(`/api/materials/review/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not save the decision.');
  },
};

export const STATUS_LABEL: Record<string, string> = {
  pending_review: 'Waiting for review',
  active: 'Published',
  rejected: 'Not approved',
  changes_requested: 'Changes requested',
};
