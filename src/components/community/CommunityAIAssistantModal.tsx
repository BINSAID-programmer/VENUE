import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Bell,
  HelpCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Flag,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Globe,
  ExternalLink,
  Trash2,
  Clock,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import {
  CommunityDefinition,
  CommunityPost,
  CommunityComment,
  CommunityAISummaryScope,
  CommunityAISourceReference,
  CommunityAIMessage,
  StudentProfile,
  Course,
} from '../../types';
import { communityService } from '../../services/communityService';
import { MathRenderer } from '../MathRenderer';

// ============================================================================
// 1. INLINE AI TRANSLATION BUTTON & DISPLAY
// ============================================================================

interface InlineAITranslationProps {
  itemId: string;
  text: string;
  communityId: string;
  courseCode?: string;
  subscriptionPlan?: string;
  compact?: boolean;
}

export const InlineAITranslationBlock: React.FC<InlineAITranslationProps> = ({
  itemId,
  text,
  communityId,
  courseCode,
  subscriptionPlan,
  compact = false,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'sw'>('sw');
  const [showTranslated, setShowTranslated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!text || text.trim().length < 8) return null;

  const handleTranslate = async (lang: 'en' | 'sw') => {
    if (translatedText && targetLanguage === lang) {
      setShowTranslated(!showTranslated);
      return;
    }

    setIsTranslating(true);
    setError(null);
    setTargetLanguage(lang);

    try {
      const res = await communityService.translateCommunityContent({
        itemId,
        text,
        targetLanguage: lang,
        communityId,
        courseCode,
        subscriptionPlan,
      });
      setTranslatedText(res.translatedText);
      setShowTranslated(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to translate right now.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {!showTranslated ? (
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              disabled={isTranslating}
              onClick={(e) => {
                e.stopPropagation();
                handleTranslate('sw');
              }}
              className={`inline-flex items-center gap-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors ${
                compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
              } font-semibold`}
              title="Translate to Kiswahili using VENUE AI"
            >
              <Globe size={compact ? 10 : 12} className="text-indigo-500" />
              <span>{isTranslating && targetLanguage === 'sw' ? 'Translating...' : 'Kiswahili'}</span>
            </button>
            <button
              type="button"
              disabled={isTranslating}
              onClick={(e) => {
                e.stopPropagation();
                handleTranslate('en');
              }}
              className={`inline-flex items-center gap-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors ${
                compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
              } font-semibold`}
              title="Translate to English using VENUE AI"
            >
              <Globe size={compact ? 10 : 12} className="text-indigo-500" />
              <span>{isTranslating && targetLanguage === 'en' ? 'Translating...' : 'English'}</span>
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200/60 dark:border-indigo-500/30">
              <Sparkles size={10} />
              Translated by AI ({targetLanguage === 'sw' ? 'Kiswahili' : 'English'})
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTranslate(targetLanguage === 'sw' ? 'en' : 'sw');
              }}
              disabled={isTranslating}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Switch to {targetLanguage === 'sw' ? 'English' : 'Kiswahili'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTranslated(false);
              }}
              className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Hide translation
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      )}

      {showTranslated && translatedText && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-500/30 text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
        >
          <MathRenderer content={translatedText} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. COMMUNITY AI ASSISTANT MODAL / DRAWER
// ============================================================================

export interface CommunityAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: {
    id: string;
    name: string;
    type: string;
    description?: string;
    courseId?: string;
    canonicalCourseId?: string;
    courseCode?: string;
    courseTitle?: string;
    academicUnitId?: string;
    departmentId?: string;
    programmeId?: string;
  };
  posts: Array<any>;
  lecturerAnnouncements?: Array<any>;
  commentsByPostId?: Record<string, Array<any>>;
  lastVisitedAtIso?: string | null;
  profile?: StudentProfile;
  courses?: Course[];
  blockedUserIds?: Set<string>;
  mutedUserIds?: Set<string>;
  initialAction?:
    | 'ask'
    | 'summarize_discussion'
    | 'find_unanswered'
    | 'summarize_announcements'
    | 'explain_item';
  initialTargetItem?: {
    id: string;
    type: 'post' | 'comment' | 'announcement' | 'shared_file';
    title?: string;
    content: string;
    authorName?: string;
    authorRole?: string;
    courseCode?: string;
    createdAt?: string;
    fileName?: string;
    fileUrl?: string;
  } | null;
  initialPrompt?: string;
  onOpenSourceItem?: (source: CommunityAISourceReference) => void;
  onOpenAITutorForCourse?: (courseCode?: string, initialPrompt?: string) => void;
}

const SCOPE_LABELS: Record<CommunityAISummaryScope, string> = {
  last_24h: 'Last 24 Hours',
  last_7d: 'Last 7 Days',
  since_last_visit: 'Since Last Visit',
  selected: 'All Recent Posts',
};

export const CommunityAIAssistantModal: React.FC<CommunityAIAssistantModalProps> = ({
  isOpen,
  onClose,
  community,
  posts,
  lecturerAnnouncements,
  commentsByPostId,
  lastVisitedAtIso,
  profile,
  courses,
  blockedUserIds,
  mutedUserIds,
  initialAction = 'ask',
  initialTargetItem = null,
  initialPrompt = '',
  onOpenSourceItem,
  onOpenAITutorForCourse,
}) => {
  const [messages, setMessages] = useState<CommunityAIMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryScope, setSummaryScope] = useState<CommunityAISummaryScope>('last_7d');
  const [languageMode, setLanguageMode] = useState<'auto' | 'en' | 'sw'>('auto');
  const [activeTargetItem, setActiveTargetItem] = useState(initialTargetItem);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitialRef = useRef<string | null>(null);

  // Load saved per-user, per-community AI conversation history
  useEffect(() => {
    if (!isOpen || !community?.id) return;
    let isMounted = true;

    communityService
      .loadCommunityAIConversation(community.id, profile?.uid)
      .then((saved) => {
        if (!isMounted) return;
        if (saved && Array.isArray(saved.messages) && saved.messages.length > 0) {
          setMessages(saved.messages);
        } else {
          setMessages([]);
        }
      })
      .catch(() => {
        if (isMounted) setMessages([]);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, community?.id, profile?.uid]);

  // Trigger automatic action when opened via "Explain with AI", "Summarize Discussion", etc.
  useEffect(() => {
    if (!isOpen) {
      hasTriggeredInitialRef.current = null;
      return;
    }

    setActiveTargetItem(initialTargetItem || null);

    const triggerKey = `${community.id}_${initialAction}_${initialTargetItem?.id || ''}_${initialPrompt || ''}`;
    if (hasTriggeredInitialRef.current === triggerKey) return;

    if (initialTargetItem && initialAction === 'explain_item') {
      hasTriggeredInitialRef.current = triggerKey;
      const label =
        initialTargetItem.type === 'announcement'
          ? `Explain lecturer announcement: "${initialTargetItem.title || initialTargetItem.content.slice(0, 70)}..."`
          : initialTargetItem.type === 'shared_file'
          ? `Explain shared resource "${initialTargetItem.fileName || initialTargetItem.title || 'File'}" in academic context`
          : `Explain this ${initialTargetItem.type} by ${initialTargetItem.authorName || 'member'} step by step`;
      void executeAIAction('explain_item', initialPrompt || label, initialTargetItem);
    } else if (
      initialAction === 'summarize_discussion' ||
      initialAction === 'find_unanswered' ||
      initialAction === 'summarize_announcements'
    ) {
      hasTriggeredInitialRef.current = triggerKey;
      const defaultPrompt =
        initialAction === 'summarize_discussion'
          ? `Summarize the discussion in ${community.name} (${SCOPE_LABELS[summaryScope]}).`
          : initialAction === 'find_unanswered'
          ? `Which student questions in ${community.name} have not been answered yet?`
          : `Summarize the lecturer's latest announcements and instructions in ${community.name}.`;
      void executeAIAction(initialAction, initialPrompt || defaultPrompt, null);
    } else if (initialPrompt && initialPrompt.trim().length > 0) {
      hasTriggeredInitialRef.current = triggerKey;
      void executeAIAction('ask', initialPrompt.trim(), null);
    }
  }, [isOpen, community.id, initialAction, initialTargetItem, initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const persistMessages = (nextMessages: CommunityAIMessage[]) => {
    setMessages(nextMessages);
    void communityService.saveCommunityAIConversation({
      communityId: community.id,
      courseId: community.courseId || community.canonicalCourseId,
      courseCode: community.courseCode,
      messages: nextMessages,
      userId: profile?.uid,
    });
  };

  const executeAIAction = async (
    action:
      | 'ask'
      | 'summarize_discussion'
      | 'find_unanswered'
      | 'summarize_announcements'
      | 'explain_item',
    userPromptText: string,
    targetItemOverride?: typeof initialTargetItem,
    scopeOverride?: CommunityAISummaryScope
  ) => {
    if (isLoading) return;
    setErrorBanner(null);

    const effectiveScope = scopeOverride || summaryScope;
    const effectiveTarget =
      targetItemOverride !== undefined ? targetItemOverride : activeTargetItem;

    const userMsg: CommunityAIMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userPromptText,
      actionType: action,
      createdAt: new Date().toISOString(),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setInputQuery('');
    setIsLoading(true);

    try {
      const historyForContext = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await communityService.queryCommunityAI({
        action,
        community,
        posts,
        lecturerAnnouncements,
        commentsByPostId,
        lastVisitedAtIso,
        userQuery: userPromptText,
        summaryScope: effectiveScope,
        targetItem: effectiveTarget,
        languageMode,
        conversationHistory: historyForContext,
        profile,
        courses,
        subscriptionPlan: profile?.subscriptionPlan,
        blockedUserIds,
        mutedUserIds,
      });

      const assistantMsg: CommunityAIMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        actionType: action,
        sources: result.sources,
        structuredSummary: result.structuredSummary || null,
        unansweredQuestions: result.unansweredQuestions || [],
        confidenceNote: result.confidenceNote || null,
        detectedLanguage: result.detectedLanguage,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...updatedWithUser, assistantMsg];
      persistMessages(finalMessages);
    } catch (err: any) {
      setErrorBanner(
        err?.message ||
          'Unable to generate AI response right now. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setMessages([]);
    setActiveTargetItem(null);
    await communityService.clearCommunityAIConversation(community.id, profile?.uid);
  };

  const handleFeedback = async (
    messageId: string,
    rating: 'helpful' | 'not_helpful' | 'reported',
    reason?: string
  ) => {
    const updated = messages.map((m) =>
      m.id === messageId ? { ...m, feedback: rating } : m
    );
    persistMessages(updated);
    setReportingMessageId(null);
    setReportReason('');

    await communityService.submitCommunityAIFeedback({
      messageId,
      communityId: community.id,
      courseId: community.courseId || community.canonicalCourseId,
      rating,
      reason,
    });

    setFeedbackToast(
      rating === 'reported'
        ? 'AI response reported for review.'
        : 'Thank you for your feedback!'
    );
    setTimeout(() => setFeedbackToast(null), 2800);
  };

  const quickPrompts = [
    {
      label: 'Summarize discussion',
      icon: MessageSquare,
      action: 'summarize_discussion' as const,
      prompt: `Summarize the main points from the ${SCOPE_LABELS[summaryScope].toLowerCase()} discussion in ${community.name}.`,
    },
    {
      label: 'Unanswered questions',
      icon: HelpCircle,
      action: 'find_unanswered' as const,
      prompt: `Which student questions in ${community.name} have not been answered or solved yet?`,
    },
    {
      label: 'Lecturer instructions',
      icon: Bell,
      action: 'summarize_announcements' as const,
      prompt: `Summarize the lecturer's latest announcements, deadlines, and instructions for ${community.courseCode || community.name}.`,
    },
    {
      label: 'Explain main topic',
      icon: BookOpen,
      action: 'ask' as const,
      prompt: `Explain the main academic topic everyone is discussing in ${community.name} step by step.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-3xl h-[92vh] sm:h-[85vh] bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Sparkles size={20} className="text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg truncate">
                  Ask VENUE AI
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20 text-white border border-white/25">
                  {community.courseCode || community.type}
                </span>
              </div>
              <p className="text-xs text-indigo-100 truncate">
                {community.name} • Grounded in authorized community & course context
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language selector */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-0.5 border border-white/15 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setLanguageMode('auto')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  languageMode === 'auto'
                    ? 'bg-white text-indigo-700 font-bold'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('en')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  languageMode === 'en'
                    ? 'bg-white text-indigo-700 font-bold'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('sw')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  languageMode === 'sw'
                    ? 'bg-white text-indigo-700 font-bold'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                SW
              </button>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white transition-colors"
                title="Clear private AI history for this community"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Ask VENUE AI"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scope & Quick Action Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
              <Clock size={12} />
              Scope:
            </span>
            {(['last_24h', 'last_7d', 'since_last_visit', 'selected'] as CommunityAISummaryScope[]).map(
              (sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => setSummaryScope(sc)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                    summaryScope === sc
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {SCOPE_LABELS[sc]}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenAITutorForCourse && (community.courseCode || community.courseId) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAITutorForCourse(
                    community.courseCode,
                    `Help me study ${community.courseCode || community.name} based on our recent community discussions.`
                  );
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 text-[11px] font-bold hover:bg-violet-100 transition-colors"
              >
                <GraduationCap size={13} />
                <span>Open in AI Tutor</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Target Item Banner (when user clicked "Explain with AI" on a specific post/announcement/file) */}
        {activeTargetItem && (
          <div className="px-4 sm:px-6 py-2.5 bg-indigo-50/90 dark:bg-indigo-950/40 border-b border-indigo-200/70 dark:border-indigo-800/50 flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                <Sparkles size={12} />
                <span className="uppercase tracking-wider">
                  Focused {activeTargetItem.type.replace('_', ' ')}
                </span>
                {activeTargetItem.authorName && (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    • by {activeTargetItem.authorName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mt-0.5">
                {activeTargetItem.title
                  ? `${activeTargetItem.title}: ${activeTargetItem.content}`
                  : activeTargetItem.content}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTargetItem(null)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              title="Clear focused item"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Quick Actions Strip */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((qp) => {
            const Icon = qp.icon;
            return (
              <button
                key={qp.label}
                type="button"
                disabled={isLoading}
                onClick={() => executeAIAction(qp.action, qp.prompt, null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/15 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold transition-all shrink-0 disabled:opacity-50"
              >
                <Icon size={13} className="text-indigo-600 dark:text-indigo-400" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Conversation Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {feedbackToast && (
            <div className="sticky top-0 z-10 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-sm">
              <CheckCircle2 size={14} />
              <span>{feedbackToast}</span>
            </div>
          )}

          {errorBanner && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Community AI Notice</p>
                <p className="mt-0.5">{errorBanner}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorBanner(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="py-8 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {community.name} AI Intelligence
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Ask questions about today&apos;s discussions, summarize lecturer instructions, detect unanswered student questions, or get step-by-step explanations grounded in authorized{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {community.courseCode || community.name}
                </span>{' '}
                materials.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {[
                  'Explain the topic everyone is discussing.',
                  "What are the main points from today's discussion?",
                  'Which questions have not been answered?',
                  "Summarize the lecturer's latest instructions.",
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => executeAIAction('ask', sample, null)}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all group flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                      &ldquo;{sample}&rdquo;
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-slate-400 group-hover:text-indigo-500 shrink-0"
                    />
                  </button>
                ))}
              </div>

              <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Private to you • Uses only authorized community &amp; course content</span>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs shadow-xs'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles size={10} />
                        AI Generated
                      </span>
                      {community.courseCode && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                          {community.courseCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                )}

                {/* Structured Discussion Summary Card if available */}
                {msg.role === 'assistant' && msg.structuredSummary && (
                  <div className="mb-3 space-y-2.5 bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={13} />
                      <span>Structured Discussion Summary ({msg.structuredSummary.scopeLabel})</span>
                    </div>

                    {msg.structuredSummary.mainTopics.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Main Topics Discussed:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mt-0.5">
                          {msg.structuredSummary.mainTopics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.structuredSummary.importantAnnouncements.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          Important Announcements &amp; Deadlines:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mt-0.5">
                          {msg.structuredSummary.importantAnnouncements.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.structuredSummary.keyQuestionsAsked.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Key Questions Asked:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mt-0.5">
                          {msg.structuredSummary.keyQuestionsAsked.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.structuredSummary.unansweredQuestions.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          Unanswered / Open Questions:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mt-0.5">
                          {msg.structuredSummary.unansweredQuestions.map((uq, i) => (
                            <li key={i}>{uq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Markdown / Math Content */}
                <div
                  className={`text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MathRenderer content={msg.content} />
                  )}
                </div>

                {/* Unanswered Questions Interactive Cards */}
                {msg.role === 'assistant' &&
                  Array.isArray(msg.unansweredQuestions) &&
                  msg.unansweredQuestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <HelpCircle size={13} />
                        <span>Detected Open / Unanswered Questions ({msg.unansweredQuestions.length})</span>
                      </p>
                      <div className="space-y-2">
                        {msg.unansweredQuestions.map((uq) => (
                          <div
                            key={uq.postId}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-500/30 flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                {uq.authorName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                {uq.status === 'unanswered' ? '0 Replies' : 'Needs Clear Answer'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                              {uq.title ? `${uq.title} — ${uq.excerpt}` : uq.excerpt}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {onOpenSourceItem && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onOpenSourceItem({
                                      id: uq.postId,
                                      type: 'post',
                                      label: uq.title || uq.excerpt.slice(0, 50),
                                      authorName: uq.authorName,
                                      courseCode: uq.courseCode,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  <ExternalLink size={11} />
                                  <span>Jump to question in community</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  executeAIAction(
                                    'explain_item',
                                    `Help explain and solve this unanswered student question by ${uq.authorName}: "${uq.excerpt}"`,
                                    {
                                      id: uq.postId,
                                      type: 'post',
                                      title: uq.title,
                                      content: uq.excerpt,
                                      authorName: uq.authorName,
                                      courseCode: uq.courseCode,
                                    }
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <Sparkles size={11} />
                                <span>Draft AI explanation</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Confidence / Verification Note */}
                {msg.role === 'assistant' && msg.confidenceNote && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-700/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{msg.confidenceNote}</span>
                  </div>
                )}

                {/* Grounding Source Pills */}
                {msg.role === 'assistant' &&
                  Array.isArray(msg.sources) &&
                  msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Grounded Sources Used ({msg.sources.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, idx) => (
                          <button
                            key={`${src.id}_${idx}`}
                            type="button"
                            onClick={() => {
                              if (onOpenSourceItem && (src.type === 'post' || src.type === 'announcement')) {
                                onClose();
                                onOpenSourceItem(src);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
                            title={src.excerpt || src.label}
                          >
                            {src.type === 'announcement' ? (
                              <Bell size={11} className="text-amber-500 shrink-0" />
                            ) : src.type === 'course_material' || src.type === 'shared_file' ? (
                              <FileText size={11} className="text-emerald-500 shrink-0" />
                            ) : (
                              <MessageSquare size={11} className="text-indigo-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[190px] font-medium">{src.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* AI Response Safety & Feedback Controls */}
                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, 'helpful')}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          msg.feedback === 'helpful'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <ThumbsUp size={11} />
                        <span>Helpful</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, 'not_helpful')}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          msg.feedback === 'not_helpful'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <ThumbsDown size={11} />
                        <span>Not helpful</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReportingMessageId(
                            reportingMessageId === msg.id ? null : msg.id
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          msg.feedback === 'reported'
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <Flag size={11} />
                        <span>{msg.feedback === 'reported' ? 'Reported' : 'Report AI'}</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      Never replaces official lecturer instructions
                    </span>
                  </div>
                )}

                {/* Inline Report AI Response Drawer */}
                {reportingMessageId === msg.id && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2">
                    <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                      Report inaccurate or inappropriate AI output
                    </p>
                    <input
                      type="text"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="What was inaccurate or unhelpful? (optional)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReportingMessageId(null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFeedback(
                            msg.id,
                            'reported',
                            reportReason.trim() || 'Inaccurate AI response'
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        Submit Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-4 flex items-center gap-3">
                <RefreshCw size={16} className=" text-indigo-600 dark:text-indigo-400 animate-spin" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Analyzing authorized {community.courseCode || community.name} discussions &amp; materials...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputQuery.trim() || isLoading) return;
            void executeAIAction(
              activeTargetItem ? 'explain_item' : 'ask',
              inputQuery.trim(),
              activeTargetItem
            );
          }}
          className="p-3.5 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask VENUE AI about ${community.name} (English or Kiswahili)...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm transition-all shrink-0"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
