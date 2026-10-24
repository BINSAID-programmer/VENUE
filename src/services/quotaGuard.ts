/**
 * Firestore quota protection.
 * When Firestore says "resource-exhausted" (daily free quota used up) we stop all optional
 * background writes (presence, typing, analytics) for a cooldown instead of hammering the
 * database. Reads/writes the student really asked for still go through.
 */
const KEY = 'venue_fs_quota_until';
const COOLDOWN_MS = 30 * 60 * 1000;
const EVENT = 'venue:quota-state';

let pausedUntil = 0;
try {
  pausedUntil = Number(sessionStorage.getItem(KEY) || 0);
} catch {
  /* ignore */
}

export function isQuotaError(err: unknown): boolean {
  const e = err as any;
  const text = `${e?.code || ''} ${e?.message || ''}`.toLowerCase();
  return text.includes('resource-exhausted') || text.includes('quota') || text.includes('429');
}

export function isFirestoreQuotaPaused(): boolean {
  return Date.now() < pausedUntil;
}

export function reportFirestoreError(err: unknown): void {
  if (!isQuotaError(err)) return;
  const wasPaused = isFirestoreQuotaPaused();
  pausedUntil = Date.now() + COOLDOWN_MS;
  try {
    sessionStorage.setItem(KEY, String(pausedUntil));
  } catch {
    /* ignore */
  }
  if (!wasPaused && typeof window !== 'undefined') {
    console.warn('[quota] Firestore quota exceeded - background writes paused for 30 minutes');
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { paused: true } }));
  }
}

export function onQuotaStateChange(cb: (paused: boolean) => void): () => void {
  const handler = (e: Event) => cb(!!(e as CustomEvent).detail?.paused);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** Catch quota errors that nobody handled (any Firestore call in the app). */
export function installGlobalQuotaWatcher(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('unhandledrejection', (e) => reportFirestoreError((e as PromiseRejectionEvent).reason));
}
