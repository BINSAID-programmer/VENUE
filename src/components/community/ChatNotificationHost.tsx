import React, { useEffect, useRef, useState } from 'react';
import { Bell, MessageCircle, X } from 'lucide-react';
import { communityService } from '../../services/communityService';
import {
  getNotificationPermission,
  playMessageTone,
  requestNotificationPermission,
  setUnreadBadge,
  showSystemNotification,
  vibrate,
} from '../../services/chatNotifier';
import type { RealChatConversation } from '../../types';

interface Props {
  uid: string;
  /** True while the student is looking at the Community screen. */
  onCommunityScreen: boolean;
  onOpenCommunity: () => void;
}

interface Banner {
  id: string;
  title: string;
  body: string;
}

const PROMPT_DISMISSED_KEY = 'venue_chat_notif_prompt_dismissed';

/**
 * Listens to the student's conversations and raises WhatsApp-style alerts when a new
 * message arrives: in-app banner, tone, vibration, system notification and unread badge.
 */
export default function ChatNotificationHost({ uid, onCommunityScreen, onOpenCommunity }: Props) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const lastUnread = useRef<Map<string, number>>(new Map());
  const firstSnapshot = useRef(true);
  const onScreenRef = useRef(onCommunityScreen);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    onScreenRef.current = onCommunityScreen;
  }, [onCommunityScreen]);

  // Ask once (politely) for permission to show phone notifications.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY) === '1';
    } catch {
      /* ignore */
    }
    if (!dismissed && getNotificationPermission() === 'default') {
      const t = window.setTimeout(() => setShowPrompt(true), 4000);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!uid) return;
    firstSnapshot.current = true;
    lastUnread.current = new Map();

    const unsub = communityService.subscribeToUserConversations(uid, async (list: RealChatConversation[]) => {
      let total = 0;
      const increased: RealChatConversation[] = [];
      for (const conv of list) {
        const unread = conv.unreadCountByUser?.[uid] || 0;
        total += unread;
        const prev = lastUnread.current.get(conv.conversationId) ?? 0;
        if (!firstSnapshot.current && unread > prev && conv.lastSenderUid !== uid) {
          increased.push(conv);
        }
        lastUnread.current.set(conv.conversationId, unread);
      }
      firstSnapshot.current = false;
      setUnreadBadge(total);

      if (increased.length === 0) return;
      let muted = new Set<string>();
      try {
        muted = await communityService.getMutedConversationIds(uid);
      } catch {
        /* ignore */
      }
      const conv = increased.find((c) => !muted.has(c.conversationId));
      if (!conv) return;

      const sender = conv.lastSenderName || 'New message';
      const isGroup = conv.type !== 'direct';
      const title = isGroup && conv.title ? conv.title : sender;
      const body = isGroup && conv.lastSenderName ? `${conv.lastSenderName}: ${conv.lastMessage}` : conv.lastMessage;
      const visible = document.visibilityState === 'visible';

      if (visible && !onScreenRef.current) {
        setBanner({ id: conv.conversationId + Date.now(), title, body });
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setBanner(null), 5000);
        playMessageTone();
        vibrate();
      } else if (!visible) {
        void showSystemNotification({ title, body, tag: conv.conversationId });
        playMessageTone();
      } else {
        playMessageTone();
      }
    });

    return () => {
      unsub();
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      setUnreadBadge(0);
    };
  }, [uid]);

  const enable = async () => {
    await requestNotificationPermission();
    setShowPrompt(false);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {banner && (
        <button
          key={banner.id}
          type="button"
          onClick={() => {
            setBanner(null);
            onOpenCommunity();
          }}
          className="fixed top-3 left-3 right-3 z-[200] max-w-md mx-auto flex items-center gap-3 rounded-2xl bg-slate-900/95 backdrop-blur border border-emerald-500/30 shadow-2xl px-3.5 py-3 text-left animate-in slide-in-from-top"
        >
          <span className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-white truncate">{banner.title}</span>
            <span className="block text-xs text-slate-300 truncate">{banner.body}</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold shrink-0">now</span>
        </button>
      )}

      {showPrompt && !banner && (
        <div className="fixed bottom-24 left-3 right-3 z-[190] max-w-md mx-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3.5 flex items-start gap-3">
          <Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Turn on message notifications</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Get alerts for new Community messages, like WhatsApp, even when VENUE is in the background.
            </p>
            <div className="flex gap-2 mt-2.5">
              <button
                type="button"
                onClick={enable}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                Turn on
              </button>
              <button
                type="button"
                onClick={dismissPrompt}
                className="px-3 py-1.5 rounded-lg text-slate-400 text-xs font-semibold cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>
          <button type="button" onClick={dismissPrompt} aria-label="Close" className="text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
