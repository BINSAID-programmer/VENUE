/**
 * WhatsApp-style chat alerts: system notification, sound, vibration and app badge.
 * Works while the app (or installed PWA/APK) is open or in the background.
 */

export function canUseSystemNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  return canUseSystemNotifications() ? Notification.permission : 'unsupported';
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!canUseSystemNotifications()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

let audioCtx: AudioContext | null = null;

/** Short two-tone "pop" similar to a chat message tone. */
export function playMessageTone(): void {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.11;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  } catch {
    /* sound is best-effort */
  }
}

export function vibrate(): void {
  try {
    navigator.vibrate?.([120, 60, 120]);
  } catch {
    /* ignore */
  }
}

export async function showSystemNotification(opts: {
  title: string;
  body: string;
  tag: string;
}): Promise<void> {
  if (getNotificationPermission() !== 'granted') return;
  const options: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
    body: opts.body,
    tag: opts.tag,
    renotify: true,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [120, 60, 120],
    data: { url: '/#community' },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(opts.title, options);
      return;
    }
    new Notification(opts.title, options);
  } catch {
    /* ignore */
  }
}

const BASE_TITLE = typeof document !== 'undefined' ? document.title : 'VENUE';

/** Shows the total unread count on the app icon (where supported) and in the tab title. */
export function setUnreadBadge(count: number): void {
  try {
    if (count > 0) (navigator as any).setAppBadge?.(count);
    else (navigator as any).clearAppBadge?.();
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') {
    document.title = count > 0 ? `(${count}) ${BASE_TITLE}` : BASE_TITLE;
  }
}
