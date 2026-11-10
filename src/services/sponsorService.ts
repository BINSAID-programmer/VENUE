import { authenticatedFetch } from './apiClient';

export interface SponsorPublic {
  id: string;
  name: string;
  title: string;
  text: string;
  imageData: string;
  linkUrl: string;
}

export interface SponsorAdmin extends SponsorPublic {
  active: boolean;
  startsAt: string;
  endsAt: string;
  clicks: number;
}

async function json(res: Response) {
  return res.json().catch(() => ({}));
}

export const sponsorService = {
  async list(): Promise<SponsorPublic[]> {
    try {
      const res = await fetch('/api/sponsors');
      if (!res.ok) return [];
      return (await json(res)).sponsors || [];
    } catch {
      return [];
    }
  },

  trackClick(id: string) {
    try {
      void fetch(`/api/sponsors/${encodeURIComponent(id)}/click`, { method: 'POST', keepalive: true });
    } catch {
      /* ignore */
    }
  },

  async adminList(): Promise<SponsorAdmin[]> {
    const res = await authenticatedFetch('/api/sponsors/admin/list', { cache: 'no-store' });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not load sponsors.');
    return data.sponsors || [];
  },

  async save(input: Partial<SponsorAdmin>): Promise<void> {
    const res = await authenticatedFetch('/api/sponsors/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not save the sponsor.');
  },

  async remove(id: string): Promise<void> {
    const res = await authenticatedFetch(`/api/sponsors/admin/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete.');
  },

  /** Shrinks a chosen picture to a small JPEG data URL (max 900px wide). */
  async fileToSmallImage(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 900 / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const q of [0.82, 0.7, 0.55, 0.4]) {
      const url = canvas.toDataURL('image/jpeg', q);
      if (url.length <= 200_000) return url;
    }
    throw new Error('Picture is too detailed. Choose a simpler or smaller picture.');
  },
};
