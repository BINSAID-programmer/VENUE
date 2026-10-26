import { authenticatedFetch } from './apiClient';

export interface PaymentRequestItem {
  id: string;
  kind: 'premium' | 'download_pack';
  amountTzs: number;
  reference: string;
  senderPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  decidedAt?: string;
  note?: string;
  email?: string;
  name?: string;
  uid?: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: string | null;
  downloadsAllowed: number;
  downloadsUsed: number;
  downloadsLeft: number;
  aiDailyLimit: number | null;
  aiRemainingToday: number | null;
  freeCareerPaths: number;
  priceTzs: number;
  downloadPackSize: number;
  downloadPackPriceTzs: number;
  paymentNumber: string;
  pending: PaymentRequestItem[];
  recent: PaymentRequestItem[];
}

const OPEN_EVENT = 'venue:open-premium';
let cache: { at: number; value: PremiumStatus } | null = null;

export const premiumService = {
  openPremium(message?: string) {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { message: message || '' } }));
  },
  openEventName: OPEN_EVENT,

  async getStatus(force = false): Promise<PremiumStatus | null> {
    if (!force && cache && Date.now() - cache.at < 30000) return cache.value;
    try {
      const res = await authenticatedFetch('/api/subscription/status', { cache: 'no-store' });
      if (!res.ok) return cache?.value || null;
      const data = await res.json();
      cache = { at: Date.now(), value: data as PremiumStatus };
      return cache.value;
    } catch {
      return cache?.value || null;
    }
  },

  invalidate() {
    cache = null;
  },

  async submitRequest(kind: 'premium' | 'download_pack', reference: string, senderPhone: string) {
    const res = await authenticatedFetch('/api/subscription/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, reference, senderPhone }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || 'Could not send your request. Please try again.');
    cache = null;
    return data.request as PaymentRequestItem;
  },

  async adminListRequests(status?: string): Promise<PaymentRequestItem[]> {
    const res = await authenticatedFetch(`/api/subscription/admin/requests${status ? `?status=${status}` : ''}`, {
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || 'Could not load payment requests.');
    return data.requests || [];
  },

  async adminDecide(id: string, approve: boolean, note?: string): Promise<void> {
    const res = await authenticatedFetch(`/api/subscription/admin/requests/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approve, note }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || 'Could not save the decision.');
  },
};
