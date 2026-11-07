/**
 * Push notifications for Community chat (works when the app is closed).
 *
 * Devices register an FCM token; after a message is sent the client pings /api/push/notify-chat.
 * The server verifies the sender really is in that conversation, builds the text from the
 * conversation document itself (never from client input) and sends to everyone else who has not
 * muted it.
 */
import fs from 'fs';
import path from 'path';
import { getMessaging } from 'firebase-admin/messaging';
import { saveStoreFile, getFirestoreHandles, getStoreAdminApp } from './persistence';

let dir = '';
const tokensFile = () => path.join(dir, 'push_tokens.json');

export function initPush(storageDir: string) {
  dir = storageDir;
}

interface TokenRecord {
  uid: string;
  tokens: string[];
  updatedAt: string;
}

function readTokens(): Record<string, TokenRecord> {
  try {
    if (!fs.existsSync(tokensFile())) return {};
    return JSON.parse(fs.readFileSync(tokensFile(), 'utf-8')) || {};
  } catch {
    return {};
  }
}

export function registerToken(uid: string, token: string): boolean {
  const t = String(token || '').trim();
  if (!uid || t.length < 40 || t.length > 4096) return false;
  const all = readTokens();
  const rec = all[uid] || { uid, tokens: [], updatedAt: '' };
  if (!rec.tokens.includes(t)) rec.tokens = [...rec.tokens, t].slice(-8); // keep latest 8 devices
  rec.updatedAt = new Date().toISOString();
  all[uid] = rec;
  saveStoreFile(tokensFile(), all);
  return true;
}

export function unregisterToken(uid: string, token: string) {
  const all = readTokens();
  const rec = all[uid];
  if (!rec) return;
  rec.tokens = rec.tokens.filter((x) => x !== token);
  all[uid] = rec;
  saveStoreFile(tokensFile(), all);
}

export function isPushReady(): boolean {
  return Boolean(getStoreAdminApp());
}

const sentLog = new Map<string, number[]>();
function overLimit(uid: string): boolean {
  const now = Date.now();
  const list = (sentLog.get(uid) || []).filter((t) => now - t < 60_000);
  if (list.length >= 40) {
    sentLog.set(uid, list);
    return true;
  }
  list.push(now);
  sentLog.set(uid, list);
  return false;
}

export async function notifyChat(
  senderUid: string,
  conversationId: string
): Promise<{ ok: boolean; sent: number; reason?: string }> {
  const app = getStoreAdminApp();
  const handles = getFirestoreHandles();
  if (!app || !handles) return { ok: false, sent: 0, reason: 'push-not-configured' };
  if (!conversationId || !/^[A-Za-z0-9_\-]{1,160}$/.test(conversationId)) return { ok: false, sent: 0, reason: 'bad-id' };
  if (overLimit(senderUid)) return { ok: false, sent: 0, reason: 'rate-limited' };

  const db = handles.named;
  const snap = await db.collection('chat_conversations').doc(conversationId).get();
  if (!snap.exists) return { ok: false, sent: 0, reason: 'no-conversation' };
  const conv = snap.data() as any;
  const participants: string[] = Array.isArray(conv.participantIds) ? conv.participantIds : [];
  if (!participants.includes(senderUid)) return { ok: false, sent: 0, reason: 'not-a-member' };
  if (conv.lastSenderUid && conv.lastSenderUid !== senderUid) return { ok: false, sent: 0, reason: 'stale' };

  const recipients = participants.filter((u) => u !== senderUid).slice(0, 300);
  if (recipients.length === 0) return { ok: true, sent: 0 };

  // Skip people who muted this conversation.
  const muted = new Set<string>();
  await Promise.all(
    recipients.map(async (uid) => {
      try {
        const m = await db.collection('user_muted_conversations').doc(uid).get();
        const list = m.exists ? (m.data() as any)?.mutedConversationIds : null;
        if (Array.isArray(list) && list.includes(conversationId)) muted.add(uid);
      } catch {
        /* treat as not muted */
      }
    })
  );

  const all = readTokens();
  const owners: { token: string; uid: string }[] = [];
  for (const uid of recipients) {
    if (muted.has(uid)) continue;
    for (const t of all[uid]?.tokens || []) owners.push({ token: t, uid });
  }
  if (owners.length === 0) return { ok: true, sent: 0 };

  const isGroup = conv.type && conv.type !== 'direct';
  const senderName = String(conv.lastSenderName || conv.participants?.[senderUid]?.name || 'New message').slice(0, 60);
  const title = isGroup ? String(conv.title || conv.name || conv.groupName || 'Community').slice(0, 60) : senderName;
  const text = String(conv.lastMessage || 'New message').slice(0, 140);
  const body = isGroup ? `${senderName}: ${text}` : text;

  let sent = 0;
  const messaging = getMessaging(app);
  for (let i = 0; i < owners.length; i += 400) {
    const batch = owners.slice(i, i + 400);
    const res = await messaging.sendEachForMulticast({
      tokens: batch.map((b) => b.token),
      data: { title, body, tag: conversationId, url: '/#community' },
      webpush: { headers: { Urgency: 'high', TTL: '3600' } },
    });
    sent += res.successCount;
    res.responses.forEach((r, idx) => {
      const code = r.error?.code || '';
      if (!r.success && (code.includes('registration-token-not-registered') || code.includes('invalid-argument'))) {
        unregisterToken(batch[idx].uid, batch[idx].token);
      }
    });
  }
  return { ok: true, sent };
}
