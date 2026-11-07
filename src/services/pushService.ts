import { getApp } from 'firebase/app';
import { auth, firebaseConfig } from './firebase';
import { authenticatedFetch } from './apiClient';

/**
 * Background push for chat (works when VENUE is closed).
 * Needs the Firebase "Web Push certificate" public key (vapidKey in firebase-applet-config.json
 * or VITE_FCM_VAPID_KEY). Without it everything here quietly does nothing.
 */
const VAPID_KEY: string =
  ((import.meta as any).env?.VITE_FCM_VAPID_KEY as string) || ((firebaseConfig as any)?.vapidKey as string) || '';

const TOKEN_KEY = 'venue_push_token';

export function isPushConfigured(): boolean {
  return Boolean(VAPID_KEY);
}

export async function registerPush(): Promise<'ok' | 'not-configured' | 'unsupported' | 'denied' | 'failed'> {
  try {
    if (!VAPID_KEY) return 'not-configured';
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission !== 'granted') return 'denied';
    if (!auth.currentUser) return 'failed';

    const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
    if (!(await isSupported())) return 'unsupported';

    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(getMessaging(getApp()), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return 'failed';

    let previous = '';
    try {
      previous = localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      /* ignore */
    }
    const key = `${auth.currentUser.uid}:${token}`;
    if (previous === key) return 'ok';

    const res = await authenticatedFetch('/api/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return 'failed';
    try {
      localStorage.setItem(TOKEN_KEY, key);
    } catch {
      /* ignore */
    }
    return 'ok';
  } catch (err) {
    console.warn('Push registration skipped:', err);
    return 'failed';
  }
}

/** Fire-and-forget: tell the server a message was just sent so it can alert the other members. */
export function notifyChatMessage(conversationId: string): void {
  if (!VAPID_KEY || !conversationId) return;
  authenticatedFetch('/api/push/notify-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId }),
  }).catch(() => undefined);
}
