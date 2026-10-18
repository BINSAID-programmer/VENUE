import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Volume2,
  VolumeX,
  MoreVertical,
  Settings,
  ShieldOff,
  Flag,
  X,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Send,
  Smile,
  Reply,
  CornerUpRight,
  Pin,
  Edit2,
  Trash2,
  ShieldAlert,
  Bookmark,
  ChevronDown,
  ChevronUp,
  FileText,
  AtSign,
  Copy,
  Check,
  CheckCheck,
  Clock,
  Loader2,
  Lock,
  Users,
  MessageCircle,
} from 'lucide-react';
import {
  RealChatMessage,
  RealChatConversation,
  StudentProfile,
  LecturerRecord,
  LecturerCourseAssignment,
  UserPresenceRecord,
} from '../../types';
import {
  communityService,
  SUPPORTED_REACTION_EMOJIS,
} from '../../services/communityService';
import { auth } from '../../services/firebase';
import {
  VoiceNotePlayer,
  VoiceNoteRecorderBar,
  ChatFileAttachmentCard,
  ChatLinkPreviewCard,
  ImageLightboxModal,
  ForwardMessageModal,
  PinnedMessagesBar,
  formatFileSize,
} from './ChatAdvancedMedia';

export interface FullScreenWhatsAppChatProps {
  conversation: RealChatConversation;
  allConversations?: RealChatConversation[];
  currentUserUid: string;
  profile?: StudentProfile | null;
  lecturerRecord?: LecturerRecord | null;
  lecturerAssignments?: LecturerCourseAssignment[];
  isAdminOrOwner: boolean;
  onClose: () => void;
  peerPresence?: UserPresenceRecord | null;
  mutedConversationIds: Set<string>;
  mutedUserUids: Set<string>;
  blockedUids: Set<string>;
  onToggleMuteConversation: (conversationId: string) => Promise<void>;
  onToggleMuteUser: (uid: string, name?: string) => Promise<void>;
  onToggleBlockPeer: (uid: string, name?: string) => Promise<void>;
  onReportMessage: (target: {
    targetType: 'message' | 'file' | 'image' | 'profile';
    targetId: string;
    targetAuthorUid: string;
    targetExcerpt: string;
    conversationId: string;
    reportedUserName?: string;
  }) => void;
  onManageGroup?: () => void;
  onSaveBookmarkItem: (item: {
    itemType: 'message' | 'file';
    targetId: string;
    conversationId: string;
    courseCode?: string;
    title: string;
    excerpt: string;
    authorName: string;
    fileUrl?: string;
    fileName?: string;
    fileSizeLabel?: string;
    imageUrl?: string;
  }) => void;
  onModeratorRemoveMessage?: (messageId: string) => Promise<void>;
  showToast: (msg: string) => void;
}

const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function getDateDivider(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'Yesterday';

    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

function formatMessageTime(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export const FullScreenWhatsAppChat: React.FC<FullScreenWhatsAppChatProps> = ({
  conversation,
  allConversations = [],
  currentUserUid,
  profile,
  lecturerRecord,
  lecturerAssignments = [],
  isAdminOrOwner,
  onClose,
  peerPresence,
  mutedConversationIds,
  mutedUserUids,
  blockedUids,
  onToggleMuteConversation,
  onToggleMuteUser,
  onToggleBlockPeer,
  onReportMessage,
  onManageGroup,
  onSaveBookmarkItem,
  onModeratorRemoveMessage,
  showToast,
}) => {
  // Messages and live subscriptions
  const [messages, setMessages] = useState<RealChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<Array<{ uid: string; name: string }>>([]);

  // Composer State
  const [inputText, setInputText] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
  } | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [recordingVoiceMode, setRecordingVoiceMode] = useState<boolean>(false);
  const [sendingVoiceNote, setSendingVoiceNote] = useState<boolean>(false);
  const [attachmentDrawerOpen, setAttachmentDrawerOpen] = useState<boolean>(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<boolean>(false);

  // Replying & Editing
  const [replyingTo, setReplyingTo] = useState<{
    messageId: string;
    senderName: string;
    excerpt: string;
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    messageId: string;
    text: string;
  } | null>(null);

  // Mention autocomplete
  const [mentionPickerOpen, setMentionPickerOpen] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');
  const [selectedMentions, setSelectedMentions] = useState<Array<{ uid: string; name: string }>>([]);

  // In-Conversation Search
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMatchIndex, setSearchMatchIndex] = useState<number>(0);

  // Modals & Context Menus
  const [lightboxMedia, setLightboxMedia] = useState<{
    imageUrl: string;
    caption?: string;
    senderName?: string;
  } | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<RealChatMessage | null>(null);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState<boolean>(false);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState<RealChatMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Scrolling & Unread tracking
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);
  const [newMessagesWhileScrolled, setNewMessagesWhileScrolled] = useState<number>(0);

  // DOM Refs
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastTypingBroadcastRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  // Swipe-to-reply gesture ref
  const swipeTouchRef = useRef<{
    messageId: string | null;
    startX: number;
    startY: number;
    currentX: number;
    swiping: boolean;
  }>({
    messageId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    swiping: false,
  });
  const [swipeOffset, setSwipeOffset] = useState<{ messageId: string | null; offset: number }>({
    messageId: null,
    offset: 0,
  });

  // Long press timer ref
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. History API & Android Back Button Integration
  useEffect(() => {
    // Push chat state into history so hardware back / browser back exits chat
    window.history.pushState({ venueChatOpen: true, convId: conversation.conversationId }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [conversation.conversationId, onClose]);

  const handleBackNavigation = () => {
    if (window.history.state?.venueChatOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  // 2. Subscribe to Conversation Messages
  useEffect(() => {
    setLoadingMessages(true);
    isFirstLoadRef.current = true;
    communityService.markConversationRead(conversation.conversationId);

    const unsubscribe = communityService.subscribeToConversationMessages(
      conversation.conversationId,
      100,
      (liveMsgs) => {
        setMessages(liveMsgs);
        setLoadingMessages(false);

        // Auto-scroll to bottom on first load or if user is near bottom
        if (isFirstLoadRef.current) {
          isFirstLoadRef.current = false;
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 60);
        } else {
          const container = messagesContainerRef.current;
          if (container) {
            const distanceFromBottom =
              container.scrollHeight - container.scrollTop - container.clientHeight;
            if (distanceFromBottom < 140) {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              setNewMessagesWhileScrolled(0);
            } else {
              setNewMessagesWhileScrolled((prev) => prev + 1);
            }
          }
        }
      },
      (err) => {
        console.warn('Conversation message stream warning:', err);
        setLoadingMessages(false);
      }
    );

    // Typing indicators subscription
    const unsubscribeTyping = communityService.subscribeToConversationTyping(
      conversation.conversationId,
      currentUserUid,
      (activeTypers) => {
        setTypingUsers(activeTypers);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [conversation.conversationId, currentUserUid]);

  // Handle Scroll tracking for "scroll to bottom" button
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom > 160) {
      setIsScrolledUp(true);
    } else {
      setIsScrolledUp(false);
      setNewMessagesWhileScrolled(0);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setIsScrolledUp(false);
    setNewMessagesWhileScrolled(0);
  };

  // Jump to specific message and highlight it
  const handleScrollToMessage = (messageId?: string | null) => {
    if (!messageId) return;
    const el = messageItemRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId((prev) => (prev === messageId ? null : prev));
      }, 2500);
    } else {
      showToast('Original message is earlier in the history.');
    }
  };

  // 3. Conversation Display Metadata
  const info = useMemo(() => {
    if (conversation.type === 'private_group') {
      const count = (conversation.participantIds || []).length;
      return {
        title: conversation.title || 'Private Study Group',
        subtitle: `${count} member${count === 1 ? '' : 's'}`,
        avatarText: (conversation.title || 'PG').slice(0, 2).toUpperCase(),
        isGroup: true,
        isPrivateGroup: true,
      };
    }
    if (conversation.type === 'community_group') {
      return {
        title: conversation.title || conversation.communityName || 'Academic Discussion',
        subtitle: conversation.communityName || 'Official Group Chat',
        avatarText: (conversation.title || conversation.communityName || 'COMM')
          .slice(0, 2)
          .toUpperCase(),
        isGroup: true,
        isPrivateGroup: false,
      };
    }
    // Direct chat
    const otherUid =
      (conversation.participantIds || []).find((id) => id !== currentUserUid) || '';
    const otherParticipant = conversation.participants?.[otherUid];
    const peerName = otherParticipant?.name || 'Academic Peer';
    return {
      title: peerName,
      subtitle: otherParticipant?.programmeName || otherParticipant?.roleLabel || 'Student',
      avatarText: peerName.slice(0, 2).toUpperCase(),
      avatarPhoto: otherParticipant?.photo,
      isGroup: false,
      isPrivateGroup: false,
      peerUid: otherUid,
    };
  }, [conversation, currentUserUid]);

  const isMuted = mutedConversationIds.has(conversation.conversationId);
  const isGroupAdmin =
    conversation.type === 'private_group' &&
    (conversation.ownerUid === currentUserUid ||
      (conversation.adminUids || []).includes(currentUserUid));
  const canPinInConv =
    isAdminOrOwner ||
    isGroupAdmin ||
    (conversation.type === 'community_group' && Boolean(lecturerRecord));

  // Compute real presence for direct chat
  const presenceSubtitle = useMemo(() => {
    if (typingUsers.length > 0) {
      return (
        <span className="text-emerald-400 font-semibold animate-pulse">
          {typingUsers.map((u) => u.name).join(', ')}{' '}
          {typingUsers.length === 1 ? 'is typing...' : 'are typing...'}
        </span>
      );
    }
    if (conversation.type === 'direct' && peerPresence) {
      const lastActiveMs = peerPresence.lastActiveAt
        ? new Date(peerPresence.lastActiveAt).getTime()
        : 0;
      const diffSec = Math.floor((Date.now() - lastActiveMs) / 1000);
      if (peerPresence.isOnline && diffSec < 150) {
        return (
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active now
          </span>
        );
      }
      if (peerPresence.lastActiveAt) {
        return `Last seen ${formatMessageTime(peerPresence.lastActiveAt)}`;
      }
    }
    return info.subtitle;
  }, [typingUsers, conversation.type, peerPresence, info.subtitle]);

  // Filter messages based on search query
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return messages.filter(
      (m) =>
        (m.text || '').toLowerCase().includes(q) ||
        (m.senderName || '').toLowerCase().includes(q) ||
        (m.fileName || '').toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  // Navigate through search matches
  useEffect(() => {
    if (searchMatches.length > 0) {
      const target = searchMatches[searchMatchIndex % searchMatches.length];
      if (target) {
        handleScrollToMessage(target.messageId);
      }
    }
  }, [searchMatchIndex, searchMatches]);

  // 4. Swipe-to-reply gesture handlers
  const handleTouchStart = (msg: RealChatMessage, e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeTouchRef.current = {
      messageId: msg.messageId,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      swiping: false,
    };

    // Long press detection for mobile action menu (450ms)
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setSelectedMessageForMenu(msg);
      if (navigator.vibrate) navigator.vibrate(25);
    }, 450);
  };

  const handleTouchMove = (msg: RealChatMessage, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeTouchRef.current.startX;
    const deltaY = touch.clientY - swipeTouchRef.current.startY;

    // If vertical movement is dominant, cancel long press and swipe
    if (Math.abs(deltaY) > 8 && !swipeTouchRef.current.swiping) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      return;
    }

    // Cancel long press on horizontal movement
    if (Math.abs(deltaX) > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Swiping to reply (swipe right)
    if (deltaX > 15 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      swipeTouchRef.current.swiping = true;
      const clamped = Math.min(deltaX * 0.5, 65);
      setSwipeOffset({ messageId: msg.messageId, offset: clamped });
    }
  };

  const handleTouchEnd = (msg: RealChatMessage) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const { swiping, startX, currentX } = swipeTouchRef.current;
    if (swiping && swipeOffset.offset >= 40) {
      // Trigger reply
      triggerReply(msg);
      if (navigator.vibrate) navigator.vibrate(15);
    }

    // Reset swipe
    setSwipeOffset({ messageId: null, offset: 0 });
    swipeTouchRef.current = {
      messageId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      swiping: false,
    };
  };

  const triggerReply = (msg: RealChatMessage) => {
    setReplyingTo({
      messageId: msg.messageId,
      senderName: msg.senderName,
      excerpt:
        msg.text ||
        msg.fileName ||
        (msg.imageUrl ? 'Photo' : msg.voiceUrl ? 'Voice message' : 'Message'),
    });
    setEditingMessage(null);
    textareaRef.current?.focus();
  };

  // 5. Context Menu & Actions
  const handleCopyMessage = async (msg: RealChatMessage) => {
    const textToCopy = msg.text || msg.fileUrl || msg.imageUrl || '';
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Copied to clipboard');
    } catch {
      showToast('Could not copy to clipboard');
    }
    setSelectedMessageForMenu(null);
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      await communityService.toggleChatMessageReaction(
        conversation.conversationId,
        messageId,
        emoji
      );
    } catch (err: any) {
      showToast(err?.message || 'Could not add reaction.');
    }
    setSelectedMessageForMenu(null);
  };

  const handleTogglePin = async (msg: RealChatMessage) => {
    try {
      await communityService.togglePinChatMessage({
        conversation,
        messageId: msg.messageId,
        pin: !msg.isPinned,
        isAdminOrOwner,
        lecturer: lecturerRecord,
        lecturerAssignments,
      });
      showToast(msg.isPinned ? 'Message unpinned' : 'Message pinned to chat');
    } catch (err: any) {
      showToast(err?.message || 'Could not update pin state.');
    }
    setSelectedMessageForMenu(null);
  };

  const handleDeleteMessage = async (msg: RealChatMessage) => {
    try {
      await communityService.deleteChatMessage(conversation.conversationId, msg.messageId);
      showToast('Message deleted');
    } catch (err: any) {
      showToast(err?.message || 'Could not delete message.');
    }
    setSelectedMessageForMenu(null);
  };

  const handleStartEdit = (msg: RealChatMessage) => {
    setEditingMessage({
      messageId: msg.messageId,
      text: msg.text,
    });
    setInputText(msg.text);
    setReplyingTo(null);
    setSelectedMessageForMenu(null);
    textareaRef.current?.focus();
  };

  // 6. Composer Typing & Send Logic
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Auto-grow textarea up to 120px
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }

    // Mention trigger
    const atIndex = val.lastIndexOf('@');
    if (atIndex !== -1 && (atIndex === 0 || val[atIndex - 1] === ' ')) {
      const queryPart = val.slice(atIndex + 1);
      if (!queryPart.includes(' ') && queryPart.length <= 20) {
        setMentionQuery(queryPart);
        setMentionPickerOpen(true);
      } else {
        setMentionPickerOpen(false);
      }
    } else {
      setMentionPickerOpen(false);
    }

    // Broadcast Typing Indicator (throttled)
    const now = Date.now();
    if (val.trim() && now - lastTypingBroadcastRef.current > 3000) {
      lastTypingBroadcastRef.current = now;
      const senderName =
        lecturerRecord?.name || profile?.name || auth.currentUser?.displayName || 'Member';
      communityService.setTypingIndicator(conversation.conversationId, senderName, true);
    } else if (!val.trim() && lastTypingBroadcastRef.current > 0) {
      lastTypingBroadcastRef.current = 0;
      const senderName =
        lecturerRecord?.name || profile?.name || auth.currentUser?.displayName || 'Member';
      communityService.setTypingIndicator(conversation.conversationId, senderName, false);
    }
  };

  const handleSelectMention = (peer: { uid: string; name: string }) => {
    const atIndex = inputText.lastIndexOf('@');
    const prefix = atIndex !== -1 ? inputText.slice(0, atIndex) : inputText;
    const nextText = `${prefix}@${peer.name} `;
    setInputText(nextText);
    setSelectedMentions((prev) => {
      if (prev.some((m) => m.uid === peer.uid)) return prev;
      return [...prev, peer];
    });
    setMentionPickerOpen(false);
    textareaRef.current?.focus();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sendingMessage) return;

    if (editingMessage) {
      if (!inputText.trim()) return;
      setSendingMessage(true);
      try {
        await communityService.editChatMessage(
          conversation.conversationId,
          editingMessage.messageId,
          inputText.trim()
        );
        setEditingMessage(null);
        setInputText('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        showToast('Message updated');
      } catch (err: any) {
        showToast(err?.message || 'Could not edit message.');
      } finally {
        setSendingMessage(false);
      }
      return;
    }

    if (!inputText.trim() && !attachedImageUrl && !attachedFile) return;

    const textToSend = inputText.trim();
    const imageToSend = attachedImageUrl;
    const fileToSend = attachedFile;
    const replyQuote = replyingTo;
    const mentionsToSend = selectedMentions;

    // Reset local composer immediately
    setInputText('');
    setAttachedImageUrl('');
    setAttachedFile(null);
    setReplyingTo(null);
    setSelectedMentions([]);
    setAttachmentDrawerOpen(false);
    setEmojiPickerOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setSendingMessage(true);
    try {
      await communityService.sendChatMessage({
        conversation,
        text: textToSend,
        imageUrl: imageToSend,
        fileAttachment: fileToSend,
        replyTo: replyQuote,
        mentionedUids: mentionsToSend.map((m) => m.uid),
        mentionedNames: mentionsToSend.map((m) => m.name),
        profile,
        lecturer: lecturerRecord,
      });

      // Clear typing indicator
      if (lastTypingBroadcastRef.current > 0) {
        lastTypingBroadcastRef.current = 0;
        const senderName =
          lecturerRecord?.name || profile?.name || auth.currentUser?.displayName || 'Member';
        communityService.setTypingIndicator(conversation.conversationId, senderName, false);
      }

      // Smooth scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err: any) {
      // Restore on failure
      setInputText(textToSend);
      setAttachedImageUrl(imageToSend);
      setAttachedFile(fileToSend);
      setReplyingTo(replyQuote);
      setSelectedMentions(mentionsToSend);
      showToast(err?.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle enter key on desktop
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setAttachmentDrawerOpen(false);
    try {
      const url = await communityService.uploadCommunityImage(file, 'chat');
      setAttachedImageUrl(url);
    } catch (err: any) {
      showToast(err?.message || 'Could not upload image.');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setAttachmentDrawerOpen(false);
    try {
      const attachment = await communityService.uploadChatFile(file);
      setAttachedFile(attachment);
    } catch (err: any) {
      showToast(err?.message || 'Could not attach document.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Voice Note Send
  const handleSendVoiceNote = async (blob: Blob, durationSec: number) => {
    if (sendingVoiceNote) return;
    setSendingVoiceNote(true);
    try {
      const uploadedVoice = await communityService.uploadVoiceNote(blob, durationSec);
      await communityService.sendChatMessage({
        conversation,
        text: '',
        voiceAttachment: uploadedVoice,
        replyTo: replyingTo,
        profile,
        lecturer: lecturerRecord,
      });
      setRecordingVoiceMode(false);
      setReplyingTo(null);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } catch (err: any) {
      showToast(err?.message || 'Failed to send voice note.');
    } finally {
      setSendingVoiceNote(false);
    }
  };

  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.isPinned && !m.isDeleted && !blockedUids.has(m.senderUid)),
    [messages, blockedUids]
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col h-[100dvh] w-full bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {/* ==================================================================== */}
      {/* 1. WHATSAPP-STYLE FIXED TOP HEADER */}
      {/* ==================================================================== */}
      <header className="shrink-0 z-20 h-14 sm:h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div className="h-full max-w-4xl lg:max-w-5xl mx-auto px-2.5 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="p-2 rounded-full hover:bg-slate-800 active:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Back to Community"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Conversation Avatar */}
          <div className="relative shrink-0">
            {info.avatarPhoto ? (
              <img
                src={info.avatarPhoto}
                alt={info.title}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-700 shadow-sm"
              />
            ) : (
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-inner ${
                  info.isPrivateGroup
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/30'
                    : info.isGroup
                    ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'bg-gradient-to-br from-blue-500/20 to-sky-600/30 text-sky-300 border border-blue-500/30'
                }`}
              >
                {info.avatarText}
              </div>
            )}
            {conversation.type === 'direct' && peerPresence?.isOnline && (
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5"
                title="Active now"
              />
            )}
          </div>

          {/* Title & Online / Members Subtitle */}
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {info.title}
              </h2>
              {isMuted && (
                <span title="Notifications muted" className="text-slate-400">
                  <VolumeX className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[180px] sm:max-w-sm">
              {presenceSubtitle}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {/* Search in chat toggle */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((prev) => !prev);
              if (searchOpen) setSearchQuery('');
            }}
            className={`p-2 rounded-full transition cursor-pointer ${
              searchOpen
                ? 'bg-blue-600/20 text-sky-300'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Search messages"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Mute toggle button */}
          <button
            type="button"
            onClick={() => onToggleMuteConversation(conversation.conversationId)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOptionsMenuOpen((prev) => !prev)}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Conversation options"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {optionsMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setOptionsMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 z-40 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-1 text-xs">
                  {conversation.type === 'private_group' && onManageGroup && (
                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        onManageGroup();
                      }}
                      className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-sky-400" />
                      <span>Group settings & members</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setOptionsMenuOpen(false);
                      onToggleMuteConversation(conversation.conversationId);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    {isMuted ? (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>Unmute notifications</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 text-amber-400" />
                        <span>Mute notifications</span>
                      </>
                    )}
                  </button>

                  {conversation.type === 'direct' && info.peerUid && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setOptionsMenuOpen(false);
                          onToggleMuteUser(info.peerUid!, info.title);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <VolumeX className="w-4 h-4 text-slate-400" />
                        <span>
                          {mutedUserUids.has(info.peerUid) ? 'Unmute user' : 'Mute user'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOptionsMenuOpen(false);
                          onToggleBlockPeer(info.peerUid!, info.title);
                        }}
                        className="w-full px-4 py-2.5 text-left text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldOff className="w-4 h-4" />
                        <span>{blockedUids.has(info.peerUid) ? 'Unblock user' : 'Block user'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOptionsMenuOpen(false);
                          onReportMessage({
                            targetType: 'profile',
                            targetId: info.peerUid!,
                            targetAuthorUid: info.peerUid!,
                            targetExcerpt: `User account: ${info.title}`,
                            conversationId: conversation.conversationId,
                            reportedUserName: info.title,
                          });
                        }}
                        className="w-full px-4 py-2.5 text-left text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Report account</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* IN-CONVERSATION SEARCH BAR (EXPANDABLE) */}
      {/* ==================================================================== */}
      {searchOpen && (
        <div className="shrink-0 bg-slate-900 border-b border-slate-800 shadow-inner">
          <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 text-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchMatchIndex(0);
              }}
              placeholder="Search in this conversation..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                <span className="text-[11px]">
                  {searchMatches.length > 0
                    ? `${(searchMatchIndex % searchMatches.length) + 1} of ${searchMatches.length}`
                    : '0 found'}
                </span>
                <button
                  type="button"
                  disabled={searchMatches.length <= 1}
                  onClick={() =>
                    setSearchMatchIndex((prev) =>
                      prev > 0 ? prev - 1 : searchMatches.length - 1
                    )
                  }
                  className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                  title="Previous match"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={searchMatches.length <= 1}
                  onClick={() => setSearchMatchIndex((prev) => prev + 1)}
                  className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                  title="Next match"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PINNED MESSAGES BANNER */}
      {/* ==================================================================== */}
      {pinnedMessages.length > 0 && (
        <div className="shrink-0 bg-indigo-950/40 border-b border-indigo-500/30">
          <div className="max-w-4xl lg:max-w-5xl mx-auto">
            <PinnedMessagesBar
              pinnedMessages={pinnedMessages}
              canPin={canPinInConv}
              onJumpToMessage={(msgId) => handleScrollToMessage(msgId)}
              onUnpinMessage={(msgId) => {
                const target = messages.find((m) => m.messageId === msgId);
                if (target) handleTogglePin(target);
              }}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MESSAGES STREAM (WHATSAPP-STYLE BUBBLES) */}
      {/* ==================================================================== */}
      <main
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 bg-[#0b0f19] select-text overscroll-contain"
      >
        <div className="max-w-4xl lg:max-w-5xl mx-auto w-full space-y-2.5">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span>Loading encrypted conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-500 p-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Start of conversation</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Messages, academic attachments, and voice notes sent here are securely stored.
              </p>
            </div>
          </div>
        ) : (
          (() => {
            const visibleMessages = messages.filter((m) => {
              if (blockedUids.has(m.senderUid)) return false;
              if (conversation.type !== 'direct' && mutedUserUids.has(m.senderUid)) {
                return false;
              }
              return true;
            });

            let lastDateLabel = '';

            return visibleMessages.map((msg, idx) => {
              const isMine = msg.senderUid === currentUserUid;
              const isDeleted = Boolean(msg.isDeleted);
              const isHighlighted = highlightedMessageId === msg.messageId;
              const isSearchMatch =
                searchQuery.trim().length > 0 &&
                ((msg.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (msg.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()));

              // Date separator check
              const dateLabel = getDateDivider(msg.createdAt);
              const showDateDivider = dateLabel !== lastDateLabel;
              lastDateLabel = dateLabel;

              // Check if seen by others (for direct or group chat)
              const seenByOthers = isMine
                ? Object.entries(conversation.lastReadAtByUser || {}).some(
                    ([uid, readIso]) =>
                      uid !== currentUserUid && readIso && readIso >= msg.createdAt
                  )
                : false;

              // Swipe translation for this message
              const currentOffset =
                swipeOffset.messageId === msg.messageId ? swipeOffset.offset : 0;

              return (
                <React.Fragment key={msg.messageId}>
                  {/* WhatsApp-Style Centered Date Divider */}
                  {showDateDivider && (
                    <div className="flex justify-center my-3 select-none">
                      <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-400 shadow-sm">
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  {/* Message Row with Swipe-to-Reply */}
                  <div
                    ref={(el) => {
                      messageItemRefs.current[msg.messageId] = el;
                    }}
                    className={`relative flex items-center transition-all ${
                      isMine ? 'justify-end' : 'justify-start'
                    } ${isHighlighted ? 'scale-[1.01]' : ''}`}
                    onTouchStart={(e) => handleTouchStart(msg, e)}
                    onTouchMove={(e) => handleTouchMove(msg, e)}
                    onTouchEnd={() => handleTouchEnd(msg)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedMessageForMenu(msg);
                    }}
                  >
                    {/* Swipe Reply Icon Indicator (revealed behind bubble on swipe) */}
                    {currentOffset > 0 && (
                      <div
                        className="absolute left-2 z-0 w-8 h-8 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center transition-transform"
                        style={{
                          transform: `scale(${Math.min(currentOffset / 35, 1)})`,
                          opacity: Math.min(currentOffset / 30, 1),
                        }}
                      >
                        <Reply className="w-4 h-4" />
                      </div>
                    )}

                    {/* WhatsApp Bubble Container */}
                    <div
                      style={{
                        transform: currentOffset > 0 ? `translateX(${currentOffset}px)` : 'none',
                        transition: currentOffset === 0 ? 'transform 0.2s ease-out' : 'none',
                      }}
                      className={`relative group max-w-[85%] sm:max-w-[72%] rounded-2xl p-2.5 sm:p-3 text-xs leading-relaxed shadow-sm select-text ${
                        isHighlighted
                          ? 'ring-2 ring-sky-400 bg-sky-950/60'
                          : isSearchMatch
                          ? 'ring-1 ring-amber-400/80 bg-amber-950/30'
                          : ''
                      } ${
                        isDeleted
                          ? 'bg-slate-900/60 border border-slate-800/80 text-slate-500 italic'
                          : isMine
                          ? 'bg-blue-600 text-white rounded-tr-xs ml-auto shadow-blue-950/20'
                          : 'bg-slate-900/95 border border-slate-800 text-slate-100 rounded-tl-xs mr-auto shadow-black/20'
                      }`}
                    >
                      {/* Pinned Tag */}
                      {msg.isPinned && !isDeleted && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold mb-1">
                          <Pin className="w-2.5 h-2.5 fill-amber-300" />
                          <span>Pinned</span>
                        </div>
                      )}

                      {/* Group Chat Sender Name */}
                      {!isMine && !isDeleted && conversation.type !== 'direct' && (
                        <div className="text-[11px] font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                          <span>{msg.senderName}</span>
                          {msg.senderRoleLabel && (
                            <span className="text-[9px] text-slate-400 font-normal">
                              • {msg.senderRoleLabel}
                            </span>
                          )}
                        </div>
                      )}

                      {isDeleted ? (
                        <div className="flex items-center gap-1.5 py-0.5 text-slate-400">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {msg.status === 'removed'
                              ? 'This message was removed by a moderator.'
                              : 'This message was deleted.'}
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Forwarded Tag */}
                          {msg.isForwarded && (
                            <div
                              className={`flex items-center gap-1 text-[10px] italic mb-1 ${
                                isMine ? 'text-blue-100' : 'text-sky-300'
                              }`}
                            >
                              <CornerUpRight className="w-3 h-3" />
                              <span>
                                Forwarded
                                {msg.forwardedFromSenderName
                                  ? ` from ${msg.forwardedFromSenderName}`
                                  : ''}
                              </span>
                            </div>
                          )}

                          {/* Reply Quote Banner (Click to jump) */}
                          {msg.replyToExcerpt && (
                            <button
                              type="button"
                              onClick={() => handleScrollToMessage(msg.replyToMessageId)}
                              className={`w-full text-left mb-2 px-2.5 py-1.5 rounded-xl border-l-3 text-[11px] transition cursor-pointer ${
                                isMine
                                  ? 'bg-blue-700/60 hover:bg-blue-700/80 border-sky-200 text-blue-100'
                                  : 'bg-slate-950/80 hover:bg-slate-950 border-sky-400 text-slate-300'
                              }`}
                              title="Jump to quoted message"
                            >
                              <div className="font-bold text-[10px] text-sky-200">
                                {msg.replyToSenderName || 'Member'}
                              </div>
                              <div className="truncate opacity-90">{msg.replyToExcerpt}</div>
                            </button>
                          )}

                          {/* Image Attachment */}
                          {msg.imageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxMedia({
                                  imageUrl: msg.imageUrl!,
                                  caption: msg.text,
                                  senderName: msg.senderName,
                                })
                              }
                              className="block mb-2 cursor-pointer text-left overflow-hidden rounded-xl"
                              title="Tap to view full photo"
                            >
                              <img
                                src={msg.imageUrl}
                                alt="Shared photo"
                                loading="lazy"
                                className="max-h-72 w-full object-cover rounded-xl border border-white/10 hover:opacity-95 transition"
                              />
                            </button>
                          )}

                          {/* Document / Academic Attachment */}
                          {msg.fileUrl && (
                            <div className="mb-2">
                              <ChatFileAttachmentCard
                                fileUrl={msg.fileUrl}
                                fileName={msg.fileName}
                                fileSize={msg.fileSize}
                                fileMimeType={msg.fileMimeType}
                                isMine={isMine}
                              />
                            </div>
                          )}

                          {/* Voice Note Player */}
                          {msg.voiceUrl && (
                            <div className="mb-1">
                              <VoiceNotePlayer
                                voiceUrl={msg.voiceUrl}
                                durationSec={msg.voiceDurationSec || 0}
                                isMine={isMine}
                              />
                            </div>
                          )}

                          {/* Message Text with Link formatting */}
                          {msg.text && (
                            <p className="whitespace-pre-wrap break-words text-[13px] sm:text-sm leading-relaxed">
                              {msg.text}
                            </p>
                          )}

                          {/* Rich Link Preview */}
                          {msg.linkPreview && (
                            <div className="mt-1.5 mb-1">
                              <ChatLinkPreviewCard
                                preview={msg.linkPreview}
                                isMine={isMine}
                              />
                            </div>
                          )}

                          {/* Metadata: Timestamp, Edited label, Seen checkmarks */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                              isMine ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {msg.editedAt && <span>edited</span>}
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isMine && (
                              <span title={seenByOthers ? 'Read' : 'Sent'}>
                                {seenByOthers ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-blue-200 inline" />
                                )}
                              </span>
                            )}
                          </div>

                          {/* Reaction Badges on Bubble */}
                          {msg.reactionCounts &&
                            Object.entries(msg.reactionCounts).some(([, c]) => c > 0) && (
                              <div
                                className={`absolute -bottom-2.5 flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-full px-1.5 py-0.5 shadow-md text-[11px] ${
                                  isMine ? 'right-2' : 'left-2'
                                }`}
                              >
                                {Object.entries(msg.reactionCounts).map(([emoji, count]) =>
                                  count > 0 ? (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleReactToMessage(msg.messageId, emoji)}
                                      className="flex items-center gap-0.5 hover:scale-110 transition cursor-pointer"
                                      title="Toggle reaction"
                                    >
                                      <span>{emoji}</span>
                                      {count > 1 && (
                                        <span className="text-[10px] text-slate-300 font-semibold">
                                          {count}
                                        </span>
                                      )}
                                    </button>
                                  ) : null
                                )}
                              </div>
                            )}

                          {/* Subtle Desktop Hover Actions Trigger */}
                          <div
                            className={`hidden md:group-hover:flex absolute top-1.5 ${
                              isMine ? '-left-8' : '-right-8'
                            } z-10`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessageForMenu(msg);
                              }}
                              className="p-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 shadow cursor-pointer"
                              title="Message options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            });
          })()
        )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </main>

      {/* ==================================================================== */}
      {/* FLOATING SCROLL-TO-BOTTOM BUTTON */}
      {/* ==================================================================== */}
      {isScrolledUp && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-24 right-4 z-20 p-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-sky-400 border border-slate-700 shadow-xl cursor-pointer flex items-center justify-center transition active:scale-95"
          title="Jump to latest messages"
        >
          <ChevronDown className="w-5 h-5" />
          {newMessagesWhileScrolled > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold text-[10px]">
              {newMessagesWhileScrolled}
            </span>
          )}
        </button>
      )}

      {/* ==================================================================== */}
      {/* 3. WHATSAPP-STYLE CONTEXTUAL ACTION MODAL (LONG-PRESS / RIGHT-CLICK) */}
      {/* ==================================================================== */}
      {selectedMessageForMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedMessageForMenu(null)}
        >
          <div
            className="w-full max-w-xs sm:max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-3 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Emoji Reactions Bar */}
            <div className="flex items-center justify-around p-2 bg-slate-950/80 rounded-2xl border border-slate-800">
              {QUICK_REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReactToMessage(selectedMessageForMenu.messageId, emoji)}
                  className="text-xl sm:text-2xl hover:scale-125 active:scale-95 transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEmojiPickerOpen(true);
                  setSelectedMessageForMenu(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-xs cursor-pointer"
                title="More emojis"
              >
                +
              </button>
            </div>

            {/* Actions Menu List */}
            <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/50 border border-slate-800 overflow-hidden text-xs">
              {/* Reply */}
              <button
                type="button"
                onClick={() => {
                  triggerReply(selectedMessageForMenu);
                  setSelectedMessageForMenu(null);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-slate-200 hover:bg-slate-800/80 cursor-pointer"
              >
                <Reply className="w-4 h-4 text-sky-400" />
                <span className="font-semibold">Reply</span>
              </button>

              {/* Copy */}
              {selectedMessageForMenu.text && (
                <button
                  type="button"
                  onClick={() => handleCopyMessage(selectedMessageForMenu)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-slate-200 hover:bg-slate-800/80 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy text</span>
                </button>
              )}

              {/* Forward */}
              <button
                type="button"
                onClick={() => {
                  setForwardingMessage(selectedMessageForMenu);
                  setSelectedMessageForMenu(null);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-slate-200 hover:bg-slate-800/80 cursor-pointer"
              >
                <CornerUpRight className="w-4 h-4 text-blue-400" />
                <span>Forward to another chat</span>
              </button>

              {/* Save to Bookmarks */}
              <button
                type="button"
                onClick={() => {
                  onSaveBookmarkItem({
                    itemType: selectedMessageForMenu.fileUrl ? 'file' : 'message',
                    targetId: selectedMessageForMenu.messageId,
                    conversationId: conversation.conversationId,
                    courseCode: conversation.courseCode,
                    title: selectedMessageForMenu.fileName
                      ? selectedMessageForMenu.fileName
                      : `Message from ${selectedMessageForMenu.senderName}`,
                    excerpt:
                      selectedMessageForMenu.text ||
                      selectedMessageForMenu.fileName ||
                      (selectedMessageForMenu.imageUrl ? 'Photo' : 'Voice note'),
                    authorName: selectedMessageForMenu.senderName,
                    fileUrl: selectedMessageForMenu.fileUrl,
                    fileName: selectedMessageForMenu.fileName,
                    fileSizeLabel: selectedMessageForMenu.fileSize
                      ? formatFileSize(selectedMessageForMenu.fileSize)
                      : undefined,
                    imageUrl: selectedMessageForMenu.imageUrl,
                  });
                  setSelectedMessageForMenu(null);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-slate-200 hover:bg-slate-800/80 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-emerald-400" />
                <span>Save to Bookmarks</span>
              </button>

              {/* Pin / Unpin */}
              {canPinInConv && (
                <button
                  type="button"
                  onClick={() => handleTogglePin(selectedMessageForMenu)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-slate-200 hover:bg-slate-800/80 cursor-pointer"
                >
                  <Pin className="w-4 h-4 text-amber-400" />
                  <span>
                    {selectedMessageForMenu.isPinned ? 'Unpin message' : 'Pin to conversation'}
                  </span>
                </button>
              )}

              {/* Edit (Own message) */}
              {selectedMessageForMenu.senderUid === currentUserUid &&
                selectedMessageForMenu.text &&
                !selectedMessageForMenu.isDeleted && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(selectedMessageForMenu)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-slate-200 hover:bg-slate-800/80 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-indigo-400" />
                    <span>Edit message</span>
                  </button>
                )}

              {/* Delete (Own message or Group Admin) */}
              {(selectedMessageForMenu.senderUid === currentUserUid || isGroupAdmin) && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(selectedMessageForMenu)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete message</span>
                </button>
              )}

              {/* Moderator Remove */}
              {selectedMessageForMenu.senderUid !== currentUserUid &&
                (isAdminOrOwner || Boolean(lecturerRecord)) &&
                onModeratorRemoveMessage && (
                  <button
                    type="button"
                    onClick={() => {
                      onModeratorRemoveMessage(selectedMessageForMenu.messageId);
                      setSelectedMessageForMenu(null);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Remove as Moderator</span>
                  </button>
                )}

              {/* Report Message */}
              {selectedMessageForMenu.senderUid !== currentUserUid && (
                <button
                  type="button"
                  onClick={() => {
                    onReportMessage({
                      targetType: selectedMessageForMenu.fileUrl
                        ? 'file'
                        : selectedMessageForMenu.imageUrl
                        ? 'image'
                        : 'message',
                      targetId: selectedMessageForMenu.messageId,
                      targetAuthorUid: selectedMessageForMenu.senderUid,
                      targetExcerpt:
                        selectedMessageForMenu.text ||
                        selectedMessageForMenu.fileName ||
                        'Media message',
                      conversationId: conversation.conversationId,
                      reportedUserName: selectedMessageForMenu.senderName,
                    });
                    setSelectedMessageForMenu(null);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                >
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>Report content</span>
                </button>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setSelectedMessageForMenu(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. WHATSAPP-STYLE FIXED BOTTOM COMPOSER */}
      {/* ==================================================================== */}
      <footer className="shrink-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <div className="max-w-4xl lg:max-w-5xl mx-auto w-full">
        {/* Reply or Edit Banner above Composer */}
        {(replyingTo || editingMessage) && (
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-1 h-8 rounded-full shrink-0 ${
                  editingMessage ? 'bg-amber-400' : 'bg-sky-400'
                }`}
              />
              <div className="truncate">
                {editingMessage ? (
                  <span className="text-amber-300 font-bold">Editing message</span>
                ) : (
                  <>
                    <span className="text-sky-400 font-bold">
                      Replying to {replyingTo?.senderName}:
                    </span>{' '}
                    <span className="text-slate-400">{replyingTo?.excerpt}</span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setEditingMessage(null);
                if (editingMessage) setInputText('');
              }}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Attachment Preview Badge */}
        {attachedImageUrl && (
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={attachedImageUrl}
                alt="Upload preview"
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow"
              />
              <span className="text-xs text-slate-300 font-medium">
                Photo ready to send (add caption below)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImageUrl('')}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* File Attachment Preview Badge */}
        {attachedFile && (
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-sky-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {attachedFile.fileName}
                </div>
                <div className="text-[11px] text-slate-400">
                  {formatFileSize(attachedFile.fileSize)} • Document ready
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* @Mention Autocomplete Drawer */}
        {mentionPickerOpen && (
          <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 max-h-40 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <AtSign className="w-3 h-3 text-sky-400" />
              <span>Mention Participant</span>
            </div>
            {Object.values(conversation.participants || {})
              .filter(
                (p) =>
                  p.uid !== currentUserUid &&
                  (!mentionQuery ||
                    (p.name || '').toLowerCase().includes(mentionQuery.toLowerCase()))
              )
              .slice(0, 5)
              .map((peer) => (
                <button
                  key={peer.uid}
                  type="button"
                  onClick={() => handleSelectMention({ uid: peer.uid, name: peer.name })}
                  className="w-full px-3 py-1.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-left cursor-pointer"
                >
                  <span className="font-semibold text-white">{peer.name}</span>
                  <span className="text-[10px] text-slate-400">{peer.roleLabel || 'Member'}</span>
                </button>
              ))}
          </div>
        )}

        {/* Emoji Quick Palette Drawer */}
        {emojiPickerOpen && (
          <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {SUPPORTED_REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  textareaRef.current?.focus();
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 text-lg flex items-center justify-center cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Options Drawer */}
        {attachmentDrawerOpen && (
          <div className="p-3 bg-slate-950 border-b border-slate-800 grid grid-cols-2 gap-2 text-xs animate-in slide-in-from-bottom-2 duration-150">
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => imageInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 text-left cursor-pointer transition"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">Photo / Image</div>
                <div className="text-[10px] text-slate-400">Share camera or gallery</div>
              </div>
            </button>

            <button
              type="button"
              disabled={uploadingFile}
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 text-left cursor-pointer transition"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white">Academic Document</div>
                <div className="text-[10px] text-slate-400">PDF, DOCX, Slides, Sheets</div>
              </div>
            </button>
          </div>
        )}

        {/* Hidden Inputs for Media */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Voice Note Recording Bar OR Standard Composer */}
        {recordingVoiceMode ? (
          <VoiceNoteRecorderBar
            onSendVoiceNote={handleSendVoiceNote}
            onCancel={() => setRecordingVoiceMode(false)}
            sending={sendingVoiceNote}
          />
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="p-2 sm:p-2.5 flex items-end gap-1.5 sm:gap-2"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setAttachmentDrawerOpen((prev) => !prev)}
              className={`p-2.5 rounded-full transition cursor-pointer shrink-0 ${
                attachmentDrawerOpen
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Attach media or document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setEmojiPickerOpen((prev) => !prev)}
              className={`p-2.5 rounded-full transition cursor-pointer shrink-0 ${
                emojiPickerOpen
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Insert emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Multiline Text Input */}
            <div className="flex-1 min-w-0 bg-slate-950 border border-slate-800 focus-within:border-blue-500 rounded-2xl px-3.5 py-2 flex items-center transition">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  editingMessage
                    ? 'Edit your message...'
                    : attachedImageUrl || attachedFile
                    ? 'Add a caption...'
                    : 'Message (use @ to mention)...'
                }
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none max-h-28 overflow-y-auto leading-relaxed"
              />
            </div>

            {/* Send Button OR Microphone Button */}
            {inputText.trim() || attachedImageUrl || attachedFile ? (
              <button
                type="submit"
                disabled={sendingMessage}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition shrink-0 cursor-pointer"
                title="Send message (Enter)"
              >
                {sendingMessage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRecordingVoiceMode(true)}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-sky-400 flex items-center justify-center transition shrink-0 cursor-pointer"
                title="Record voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      {/* ==================================================================== */}
      {lightboxMedia && (
        <ImageLightboxModal
          imageUrl={lightboxMedia.imageUrl}
          caption={lightboxMedia.caption}
          senderName={lightboxMedia.senderName}
          onClose={() => setLightboxMedia(null)}
        />
      )}

      {/* ==================================================================== */}
      {/* FORWARD MESSAGE MODAL */}
      {/* ==================================================================== */}
      {forwardingMessage && (
        <ForwardMessageModal
          message={forwardingMessage}
          sourceConversation={conversation}
          conversations={allConversations}
          currentUserUid={currentUserUid}
          onClose={() => setForwardingMessage(null)}
          onForwardToConversation={async (targetConv) => {
            try {
              await communityService.forwardChatMessage({
                sourceMessage: forwardingMessage,
                sourceConversation: conversation,
                targetConversation: targetConv,
                profile,
                lecturer: lecturerRecord,
              });
              showToast(`Forwarded to ${targetConv.title || 'conversation'}`);
            } catch (err: any) {
              showToast(err?.message || 'Failed to forward message.');
            }
          }}
        />
      )}
    </div>
  );
};
