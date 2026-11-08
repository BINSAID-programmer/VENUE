import { authenticatedFetch } from './apiClient';

export interface LecturerApplicationItem {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  title: string;
  phone: string;
  staffId: string;
  university: string;
  college: string;
  department: string;
  courses: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  decidedAt?: string;
  decisionNote?: string;
}

export type LecturerApplicationInput = Partial<
  Pick<LecturerApplicationItem, 'fullName' | 'title' | 'phone' | 'staffId' | 'university' | 'college' | 'department' | 'courses' | 'note'>
>;

async function json(res: Response) {
  return res.json().catch(() => ({}));
}

export const lecturerApplicationService = {
  async submit(input: LecturerApplicationInput): Promise<LecturerApplicationItem> {
    const res = await authenticatedFetch('/api/lecturer/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not send your application. Please try again.');
    return data.application;
  },

  async mine(): Promise<LecturerApplicationItem[]> {
    try {
      const res = await authenticatedFetch('/api/lecturer/apply/mine', { cache: 'no-store' });
      if (!res.ok) return [];
      return (await json(res)).applications || [];
    } catch {
      return [];
    }
  },

  async adminList(): Promise<LecturerApplicationItem[]> {
    const res = await authenticatedFetch('/api/lecturer/admin/applications', { cache: 'no-store' });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not load applications.');
    return data.applications || [];
  },

  async adminDecide(id: string, approve: boolean, note?: string): Promise<void> {
    const res = await authenticatedFetch(`/api/lecturer/admin/applications/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approve, note }),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not save the decision.');
  },
};
