/**
 * VENUE Premium: plans, limits, payment requests and per-student entitlements.
 *
 * Payments are manual (mobile money): the student sends money, submits the transaction
 * reference, and the platform owner approves it. Entitlements are stored on the server
 * only (never trusted from the client) and mirrored to Firestore by persistence.ts.
 */
import fs from 'fs';
import path from 'path';
import { saveStoreFile } from './persistence';

// ---- Plan configuration (change here to change prices/limits) ----
export const PREMIUM_PRICE_TZS = 1500;
export const PREMIUM_DAYS = 30;
export const BASE_DOWNLOADS = 5; // downloads included per paid month
export const DOWNLOAD_PACK_SIZE = 5; // extra downloads per pack
export const DOWNLOAD_PACK_PRICE_TZS = 1500;
export const FREE_AI_DAILY_LIMIT = 10; // free AI requests per day (resets 00:00 East Africa Time)
export const FREE_CAREER_PATHS = 3; // career paths visible without Premium
export const PAYMENT_NUMBER = '255795995278';

export type RequestKind = 'premium' | 'download_pack';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface SubscriptionRecord {
  uid: string;
  email?: string;
  premiumUntil?: string;
  periodStart?: string;
  downloadedIds: string[];
  extraDownloads: number;
  aiDay?: string;
  aiCount?: number;
  updatedAt: string;
}

export interface PaymentRequest {
  id: string;
  uid: string;
  email: string;
  name: string;
  kind: RequestKind;
  amountTzs: number;
  reference: string;
  senderPhone: string;
  status: RequestStatus;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  note?: string;
}

let dir = '';
const subsFile = () => path.join(dir, 'subscriptions.json');
const reqFile = () => path.join(dir, 'payment_requests.json');

export function initSubscriptions(storageDir: string) {
  dir = storageDir;
}

function readJson<T>(file: string): Record<string, T> {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf-8')) || {};
  } catch {
    return {};
  }
}

const eatDay = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

function getRecord(uid: string): SubscriptionRecord {
  const all = readJson<SubscriptionRecord>(subsFile());
  return (
    all[uid] || { uid, downloadedIds: [], extraDownloads: 0, updatedAt: new Date(0).toISOString() }
  );
}

function saveRecord(rec: SubscriptionRecord) {
  const all = readJson<SubscriptionRecord>(subsFile());
  rec.updatedAt = new Date().toISOString();
  all[rec.uid] = rec;
  saveStoreFile(subsFile(), all);
}

export function isPremiumActive(rec: SubscriptionRecord): boolean {
  return Boolean(rec.premiumUntil && new Date(rec.premiumUntil).getTime() > Date.now());
}

export interface SubscriptionStatus {
  isPremium: boolean;
  premiumUntil: string | null;
  downloadsAllowed: number;
  downloadsUsed: number;
  downloadsLeft: number;
  aiDailyLimit: number | null; // null = unlimited
  aiRemainingToday: number | null;
  freeCareerPaths: number;
  priceTzs: number;
  downloadPackSize: number;
  downloadPackPriceTzs: number;
  paymentNumber: string;
  pending: PaymentRequest[];
  recent: PaymentRequest[];
}

export function getStatus(uid: string, isOwner: boolean): SubscriptionStatus {
  const rec = getRecord(uid);
  const premium = isOwner || isPremiumActive(rec);
  const allowed = BASE_DOWNLOADS + (rec.extraDownloads || 0);
  const used = rec.downloadedIds.length;
  const requests = Object.values(readJson<PaymentRequest>(reqFile()))
    .filter((r) => r.uid === uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const today = eatDay();
  const aiUsed = rec.aiDay === today ? rec.aiCount || 0 : 0;
  return {
    isPremium: premium,
    premiumUntil: rec.premiumUntil || null,
    downloadsAllowed: isOwner ? 9999 : allowed,
    downloadsUsed: used,
    downloadsLeft: isOwner ? 9999 : premium ? Math.max(0, allowed - used) : 0,
    aiDailyLimit: premium ? null : FREE_AI_DAILY_LIMIT,
    aiRemainingToday: premium ? null : Math.max(0, FREE_AI_DAILY_LIMIT - aiUsed),
    freeCareerPaths: FREE_CAREER_PATHS,
    priceTzs: PREMIUM_PRICE_TZS,
    downloadPackSize: DOWNLOAD_PACK_SIZE,
    downloadPackPriceTzs: DOWNLOAD_PACK_PRICE_TZS,
    paymentNumber: PAYMENT_NUMBER,
    pending: requests.filter((r) => r.status === 'pending'),
    recent: requests.filter((r) => r.status !== 'pending').slice(0, 5),
  };
}

/** Counts one AI request for a free student. Returns whether it is allowed. */
export function consumeAi(uid: string, isOwner: boolean): { allowed: boolean; remaining: number | null } {
  if (isOwner) return { allowed: true, remaining: null };
  const rec = getRecord(uid);
  if (isPremiumActive(rec)) return { allowed: true, remaining: null };
  const today = eatDay();
  const used = rec.aiDay === today ? rec.aiCount || 0 : 0;
  if (used >= FREE_AI_DAILY_LIMIT) return { allowed: false, remaining: 0 };
  rec.aiDay = today;
  rec.aiCount = used + 1;
  saveRecord(rec);
  return { allowed: true, remaining: FREE_AI_DAILY_LIMIT - used - 1 };
}

export function isPremium(uid: string, isOwner: boolean): boolean {
  return isOwner || isPremiumActive(getRecord(uid));
}

export type DownloadCheck =
  | { allowed: true; alreadyHad: boolean; left: number }
  | { allowed: false; reason: 'PREMIUM_REQUIRED' | 'DOWNLOAD_LIMIT_REACHED'; left: number };

export function checkDownload(uid: string, isOwner: boolean, materialKey: string): DownloadCheck {
  if (isOwner) return { allowed: true, alreadyHad: false, left: 9999 };
  const rec = getRecord(uid);
  if (!isPremiumActive(rec)) return { allowed: false, reason: 'PREMIUM_REQUIRED', left: 0 };
  const allowed = BASE_DOWNLOADS + (rec.extraDownloads || 0);
  if (materialKey && rec.downloadedIds.includes(materialKey)) {
    return { allowed: true, alreadyHad: true, left: Math.max(0, allowed - rec.downloadedIds.length) };
  }
  if (rec.downloadedIds.length >= allowed) {
    return { allowed: false, reason: 'DOWNLOAD_LIMIT_REACHED', left: 0 };
  }
  return { allowed: true, alreadyHad: false, left: allowed - rec.downloadedIds.length };
}

export function registerDownload(uid: string, isOwner: boolean, materialKey: string) {
  if (isOwner || !materialKey) return;
  const rec = getRecord(uid);
  if (!isPremiumActive(rec) || rec.downloadedIds.includes(materialKey)) return;
  rec.downloadedIds.push(materialKey);
  saveRecord(rec);
}

export function createRequest(
  user: { uid: string; email: string; name?: string },
  kind: RequestKind,
  reference: string,
  senderPhone: string
): { ok: true; request: PaymentRequest } | { ok: false; error: string } {
  const ref = String(reference || '').trim().toUpperCase();
  const phone = String(senderPhone || '').replace(/[^0-9+]/g, '');
  if (!['premium', 'download_pack'].includes(kind)) return { ok: false, error: 'Invalid request type.' };
  if (!/^[A-Z0-9]{6,20}$/.test(ref)) {
    return { ok: false, error: 'Enter the transaction ID from your payment message (6–20 letters/numbers).' };
  }
  if (phone.replace('+', '').length < 9) return { ok: false, error: 'Enter the phone number you paid from.' };

  const all = readJson<PaymentRequest>(reqFile());
  const list = Object.values(all);
  if (list.some((r) => r.reference === ref)) {
    return { ok: false, error: 'This transaction ID was already submitted.' };
  }
  if (list.some((r) => r.uid === user.uid && r.kind === kind && r.status === 'pending')) {
    return { ok: false, error: 'You already have a pending request. Please wait for approval.' };
  }
  if (kind === 'download_pack' && !isPremiumActive(getRecord(user.uid))) {
    return { ok: false, error: 'Extra downloads are available only while your Premium is active.' };
  }

  const request: PaymentRequest = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    uid: user.uid,
    email: user.email,
    name: user.name || '',
    kind,
    amountTzs: kind === 'premium' ? PREMIUM_PRICE_TZS : DOWNLOAD_PACK_PRICE_TZS,
    reference: ref,
    senderPhone: phone,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  all[request.id] = request;
  saveStoreFile(reqFile(), all);
  return { ok: true, request };
}

export function listRequests(status?: RequestStatus): PaymentRequest[] {
  return Object.values(readJson<PaymentRequest>(reqFile()))
    .filter((r) => !status || r.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200);
}

export function decideRequest(
  id: string,
  approve: boolean,
  adminUid: string,
  note?: string
): { ok: true; request: PaymentRequest } | { ok: false; error: string } {
  const all = readJson<PaymentRequest>(reqFile());
  const r = all[id];
  if (!r) return { ok: false, error: 'Request not found.' };
  if (r.status !== 'pending') return { ok: false, error: 'This request was already decided.' };

  if (approve) {
    const rec = getRecord(r.uid);
    rec.email = r.email;
    if (r.kind === 'premium') {
      const base = isPremiumActive(rec) ? new Date(rec.premiumUntil as string).getTime() : Date.now();
      rec.premiumUntil = new Date(base + PREMIUM_DAYS * 86400000).toISOString();
      rec.periodStart = new Date().toISOString();
      rec.downloadedIds = [];
      rec.extraDownloads = 0;
    } else {
      rec.extraDownloads = (rec.extraDownloads || 0) + DOWNLOAD_PACK_SIZE;
    }
    saveRecord(rec);
  }
  r.status = approve ? 'approved' : 'rejected';
  r.decidedAt = new Date().toISOString();
  r.decidedBy = adminUid;
  if (note) r.note = String(note).slice(0, 200);
  all[id] = r;
  saveStoreFile(reqFile(), all);
  return { ok: true, request: r };
}
