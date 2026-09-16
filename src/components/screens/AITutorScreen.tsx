import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  XCircle,
  Edit3,
  Camera,
  Image as ImageIcon,
  X,
  Maximize2,
  Globe,
  UploadCloud,
  Download,
  Info,
  Plus,
  MessageSquare,
  Clock,
  History,
} from 'lucide-react';
import { AIMessage, Course, AIChatConversation } from '../../types';
import { MathRenderer, MathBlock } from '../MathRenderer';
import { AIChartViewer } from '../AIChartViewer';
import { CameraCaptureModal } from '../CameraCaptureModal';
import { AIChatHistoryDrawer } from '../AIChatHistoryDrawer';
import {
  getActiveUserId,
  listUserConversations,
  loadMoreUserConversations,
  loadConversationMessages,
  saveConversationMessages,
  updateConversationTitle,
  deleteConversation,
} from '../../services/aiChatService';

interface AITutorScreenProps {
  initialCourse?: Course | null;
  courses: Course[];
  studentName?: string;
  userId?: string;
}

interface ImageAttachment {
  dataUrl: string;
  name: string;
  size: string;
  mimeType: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto (Detect Language)' },
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
  { value: 'French', label: 'Français' },
  { value: 'Spanish', label: 'Español' },
  { value: 'Arabic', label: 'العربية' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Hindi', label: 'हिन्दी' },
  { value: 'Chinese', label: '中文' },
];

/**
 * Checks if a query is explicitly requesting an image/drawing/diagram generation
 */
function isImageGenerationRequest(query: string): boolean {
  const q = query.trim().toLowerCase();
  return (
    /^(generate|create|draw|make|produce)\s+(an?\s+)?(image|picture|photo|illustration|drawing|diagram\s+of)\b/i.test(q) ||
    /^(tengeneza|chora|leta)\s+(picha|mchoro)\s+(ya|wa)\b/i.test(q)
  );
}

export const AITutorScreen: React.FC<AITutorScreenProps> = ({
  initialCourse,
  courses,
  studentName,
  userId,
}) => {
  const effectiveUserId = userId || getActiveUserId();

  // Chat History & Persistence State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversationTitle, setActiveConversationTitle] = useState<string>('New Chat');
  const [conversations, setConversations] = useState<AIChatConversation[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const [isRenamingActive, setIsRenamingActive] = useState(false);
  const [editActiveTitle, setEditActiveTitle] = useState('');

  const [selectedCourseContext, setSelectedCourseContext] = useState<string>(
    initialCourse ? initialCourse.code : 'All Courses'
  );
  const [languagePreference, setLanguagePreference] = useState<string>('auto');
  const [inputQuery, setInputQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [retryingQuery, setRetryingQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const initialWelcomeMessage: AIMessage = {
    id: 'msg-init',
    sender: 'assistant',
    role: 'assistant',
    text: `Habari${studentName ? ` ${studentName}` : ''}! I am your VENUE AI Tutor.\n\nYou can ask me university mathematics, statistics, economics, and programming problems in **English**, **Kiswahili**, or mixed language. You can also photograph or upload handwritten solutions, equations, and diagrams.`,
    timestamp: 'Just now',
    suggestions: [
      'Solve (a+b)/c when a=5, b=7, c=3 step by step',
      'Explain Bayes\' Theorem with formula and proof',
      'Plot quadratic curve y = x^2 - 4x + 3 with roots',
      'Eleza kwa Kiswahili: Normal Distribution',
      'Derive OLS estimators for linear regression',
    ],
  };

  const [messages, setMessages] = useState<AIMessage[]>([initialWelcomeMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load user's conversations on mount or UID switch
  useEffect(() => {
    let isMounted = true;
    async function loadInitialConversations() {
      try {
        const res = await listUserConversations(effectiveUserId, 20);
        if (!isMounted) return;
        setConversations(res.conversations);
        setHasMoreChats(res.hasMore);
      } catch (err) {
        console.warn('Error fetching conversations:', err);
      }
    }
    loadInitialConversations();
    return () => {
      isMounted = false;
    };
  }, [effectiveUserId]);

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
    setInputQuery('');
    setSelectedImage(null);
    setActiveConversationId(null);
    setActiveConversationTitle('New Chat');
    setIsRenamingActive(false);
    setMessages([initialWelcomeMessage]);
  };

  const handleSelectConversation = async (chat: AIChatConversation) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
    setInputQuery('');
    setSelectedImage(null);
    setIsRenamingActive(false);
    setActiveConversationId(chat.id);
    setActiveConversationTitle(chat.title);
    if (chat.courseContext) {
      setSelectedCourseContext(chat.courseContext);
    }
    if (chat.languagePreference) {
      setLanguagePreference(chat.languagePreference);
    }

    try {
      setIsLoadingChat(true);
      const msgs = await loadConversationMessages(chat.id, effectiveUserId);
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
      } else {
        setMessages([initialWelcomeMessage]);
      }
    } catch (err) {
      console.warn('Failed to load conversation messages:', err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleRenameConversation = async (chatId: string, newTitle: string) => {
    const clean = newTitle.trim();
    if (!clean) return;
    await updateConversationTitle(chatId, clean, effectiveUserId);
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: clean } : c))
    );
    if (activeConversationId === chatId) {
      setActiveConversationTitle(clean);
    }
  };

  const handleDeleteConversation = async (chatId: string) => {
    await deleteConversation(chatId, effectiveUserId);
    setConversations((prev) => prev.filter((c) => c.id !== chatId));
    if (activeConversationId === chatId) {
      handleNewChat();
    }
  };

  const handleLoadMoreConversations = async () => {
    if (isLoadingMoreChats || !hasMoreChats || conversations.length === 0) return;
    setIsLoadingMoreChats(true);
    try {
      const last = conversations[conversations.length - 1];
      const { conversations: more, hasMore } = await loadMoreUserConversations(
        effectiveUserId,
        last.updatedAt,
        20
      );
      setConversations((prev) => [...prev, ...more]);
      setHasMoreChats(hasMore);
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedImage]);

  // Track thinking duration while waiting for Gemini
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTyping) {
      setThinkingSeconds(0);
      interval = setInterval(() => {
        setThinkingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setThinkingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelThinking = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
    setRetryingQuery(null);
  };

  // Compress and read image file as data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage({
            dataUrl: compressedDataUrl,
            name: file.name || 'Uploaded photo',
            size: `${(file.size / 1024).toFixed(0)} KB`,
            mimeType: 'image/jpeg',
          });
        } else {
          setSelectedImage({
            dataUrl: result,
            name: file.name || 'Uploaded photo',
            size: `${(file.size / 1024).toFixed(0)} KB`,
            mimeType: file.type || 'image/jpeg',
          });
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Handle image captured from the Camera Modal
  const handleCameraCapture = (imageDataUrl: string, mimeType: string) => {
    setSelectedImage({
      dataUrl: imageDataUrl,
      name: `Photo_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.jpg`,
      size: 'Camera snapshot',
      mimeType,
    });
    inputRef.current?.focus();
  };

  // Immediate send after taking photo
  const handleCameraSendImmediate = (imageDataUrl: string, mimeType: string) => {
    const cameraImage: ImageAttachment = {
      dataUrl: imageDataUrl,
      name: `Photo_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.jpg`,
      size: 'Camera snapshot',
      mimeType,
    };
    handleSend('Analyze this photographed academic problem', undefined, cameraImage);
  };

  const handleSend = async (
    textToSend?: string,
    errorMsgIdToRemove?: string,
    explicitImage?: ImageAttachment
  ) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    const imageToSend = explicitImage || selectedImage;

    if ((!query && !imageToSend) || isTyping) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let baseMessages = messages;
    if (errorMsgIdToRemove) {
      baseMessages = messages.filter((m) => m.id !== errorMsgIdToRemove);
    }

    // Determine conversation ID: either continue current or start brand new
    let currentChatId = activeConversationId;
    if (!currentChatId) {
      currentChatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveConversationId(currentChatId);
      const autoTitle = (query || 'Academic Analysis').slice(0, 36).trim();
      setActiveConversationTitle(autoTitle);
    }

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      role: 'user',
      text: query || 'Analyze attached problem image',
      content: query || 'Analyze attached problem image',
      imageUrl: imageToSend?.dataUrl,
      imageAttachment: imageToSend
        ? {
            name: imageToSend.name,
            size: imageToSend.size,
            mimeType: imageToSend.mimeType,
          }
        : undefined,
      imageName: imageToSend?.name,
      imageSize: imageToSend?.size,
      imageMimeType: imageToSend?.mimeType,
      timestamp: 'Just now',
      courseContext: selectedCourseContext,
    };

    const newMessages = [...baseMessages, userMsg];
    setMessages(newMessages);
    setInputQuery('');
    setSelectedImage(null);
    setIsTyping(true);
    setRetryingQuery(textToSend ? query : null);

    // Persist user question immediately so it's never lost if user navigates away
    saveConversationMessages(
      currentChatId,
      newMessages,
      effectiveUserId,
      selectedCourseContext,
      languagePreference
    );

    try {
      // 1. Check if user explicitly asked to generate an image
      if (!imageToSend && isImageGenerationRequest(query)) {
        const genRes = await fetch('/api/tutor/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: query }),
          signal: controller.signal,
        });

        const genJson = await genRes.json();

        if (genJson.success && genJson.imageUrl) {
          // Image generation succeeded!
          const imgSuccessMsg: AIMessage = {
            id: `ai-img-${Date.now()}`,
            sender: 'assistant',
            role: 'assistant',
            text: `Here is the generated illustration for: **${query}**`,
            content: `Here is the generated illustration for: **${query}**`,
            generatedImageUrl: genJson.imageUrl,
            isImageGeneration: true,
            imageGenStatus: 'success',
            imageGenPrompt: query,
            timestamp: 'Just now',
            courseContext: selectedCourseContext,
          };
          const finalMessages = [...newMessages, imgSuccessMsg];
          setMessages(finalMessages);
          await saveConversationMessages(
            currentChatId,
            finalMessages,
            effectiveUserId,
            selectedCourseContext,
            languagePreference
          );
          listUserConversations(effectiveUserId).then((r) => {
            setConversations(r.conversations);
            setHasMoreChats(r.hasMore);
          });
          return;
        }

        if (genJson.unavailable) {
          // Report clearly that image model quota is not available under current key
          const imgUnavailableMsg: AIMessage = {
            id: `ai-img-${Date.now()}`,
            sender: 'assistant',
            role: 'assistant',
            text: genJson.fallbackMessage || `Image generation request received for "${query}". AI image generation is currently unavailable under your current API key tier.`,
            content: genJson.fallbackMessage || `Image generation request received for "${query}". AI image generation is currently unavailable under your current API key tier.`,
            isImageGeneration: true,
            imageGenStatus: 'unavailable',
            imageGenPrompt: query,
            suggestions: [
              `Explain ${query.replace(/^(generate|create|draw|make|produce)\s+(an?\s+)?(image|picture|diagram|photo)\s+of\s+/i, '')} in text with formula`,
              'Show an interactive graph for this concept',
            ],
            timestamp: 'Just now',
            courseContext: selectedCourseContext,
          };
          const finalMessages = [...newMessages, imgUnavailableMsg];
          setMessages(finalMessages);
          await saveConversationMessages(
            currentChatId,
            finalMessages,
            effectiveUserId,
            selectedCourseContext,
            languagePreference
          );
          listUserConversations(effectiveUserId).then((r) => {
            setConversations(r.conversations);
            setHasMoreChats(r.hasMore);
          });
          return;
        }
      }

      // 2. Standard Multimodal Academic Chat via Gemini
      const validHistory = newMessages
        .filter((m) => !m.isError && !m.isImageGeneration)
        .slice(-8)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          image: imageToSend
            ? {
                data: imageToSend.dataUrl,
                mimeType: imageToSend.mimeType,
              }
            : undefined,
          history: validHistory,
          courseContext: selectedCourseContext,
          languagePreference,
          studentName,
        }),
        signal: controller.signal,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || 'Failed to communicate with Gemini AI.');
      }

      const aiData = json.data || {};
      const assistantMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        role: 'assistant',
        text: aiData.text || 'No response generated.',
        content: aiData.text || 'No response generated.',
        steps: Array.isArray(aiData.steps) && aiData.steps.length > 0 ? aiData.steps : undefined,
        formula: typeof aiData.formula === 'string' && aiData.formula.trim() ? aiData.formula.trim() : undefined,
        suggestions: Array.isArray(aiData.suggestions) && aiData.suggestions.length > 0 ? aiData.suggestions : undefined,
        detectedLanguage: aiData.detectedLanguage,
        chart: aiData.chart && Array.isArray(aiData.chart.data) ? aiData.chart : undefined,
        diagramSvg: typeof aiData.diagramSvg === 'string' && aiData.diagramSvg.includes('<svg') ? aiData.diagramSvg : undefined,
        timestamp: 'Just now',
        courseContext: selectedCourseContext,
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      await saveConversationMessages(
        currentChatId,
        finalMessages,
        effectiveUserId,
        selectedCourseContext,
        languagePreference
      );
      listUserConversations(effectiveUserId).then((r) => {
        setConversations(r.conversations);
        setHasMoreChats(r.hasMore);
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      console.warn('Gemini AI Tutor note:', err);
      const isMissingSecret =
        err?.message?.includes('GEMINI_API_KEY') ||
        err?.message?.includes('API key') ||
        err?.message?.includes('Settings > Secrets');

      const errorMsg: AIMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        role: 'assistant',
        text: isMissingSecret
          ? 'Gemini API key is not configured. Please open Google AI Studio under Settings > Secrets and add your GEMINI_API_KEY to activate live AI responses.'
          : `Unable to receive answer from Gemini: ${err?.message || 'Network error'}. Please check your connection or retry.`,
        content: isMissingSecret
          ? 'Gemini API key is not configured. Please open Google AI Studio under Settings > Secrets and add your GEMINI_API_KEY to activate live AI responses.'
          : `Unable to receive answer from Gemini: ${err?.message || 'Network error'}. Please check your connection or retry.`,
        timestamp: 'Just now',
        courseContext: selectedCourseContext,
        isError: true,
        originalQuery: query,
      };

      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      await saveConversationMessages(
        currentChatId,
        finalMessages,
        effectiveUserId,
        selectedCourseContext,
        languagePreference
      );
      listUserConversations(effectiveUserId).then((r) => {
        setConversations(r.conversations);
        setHasMoreChats(r.hasMore);
      });
    } finally {
      setIsTyping(false);
      setRetryingQuery(null);
      abortControllerRef.current = null;
    }
  };

  const handleEditQuery = (queryText: string) => {
    setInputQuery(queryText);
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-140px)] sm:h-[750px] max-w-3xl mx-auto w-full p-2.5 sm:p-4"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Top Header & Settings Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>VENUE AI Tutor</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 text-[9px] font-semibold border border-blue-500/30">
                Multimodal AI
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">University Mathematics, Statistics, Economics & Multilingual</p>
          </div>
        </div>

        {/* Controls: New Chat, History Drawer, Language & Course */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* New Chat Action Button */}
          <button
            id="ai-tutor-new-chat-btn"
            onClick={handleNewChat}
            title="Start a new conversation"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* History / Recent Chats Trigger Button */}
          <button
            id="ai-tutor-history-drawer-btn"
            onClick={() => setIsHistoryDrawerOpen(true)}
            title="Open Recent Chats"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium hover:border-slate-700 active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Recent Chats</span>
            <span className="sm:hidden">History</span>
            {conversations.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-sky-300 font-bold border border-blue-500/30">
                {conversations.length}
              </span>
            )}
          </button>

          {/* Language Preference Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="ai-language-preference-select"
              value={languagePreference}
              onChange={(e) => setLanguagePreference(e.target.value)}
              disabled={isTyping}
              title="Response Language Preference"
              className="text-[11px] bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Course Context Picker */}
          <select
            id="ai-course-context-select"
            value={selectedCourseContext}
            onChange={(e) => setSelectedCourseContext(e.target.value)}
            disabled={isTyping}
            className="text-[11px] sm:text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-sky-300 font-medium focus:outline-none focus:border-blue-500 disabled:opacity-60 cursor-pointer max-w-[130px] sm:max-w-none truncate"
          >
            <option value="All Courses">General (All Courses)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code} className="bg-slate-900 text-slate-200">
                {c.code}: {c.title.slice(0, 18)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Conversation Sub-header Bar with Inline Rename */}
      {activeConversationId && (
        <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900/60 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold shrink-0">Current Chat:</span>
            {isRenamingActive ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editActiveTitle.trim() && activeConversationId) {
                    handleRenameConversation(activeConversationId, editActiveTitle.trim());
                  }
                  setIsRenamingActive(false);
                }}
                className="flex items-center gap-1.5 min-w-0 max-w-sm"
              >
                <input
                  type="text"
                  value={editActiveTitle}
                  onChange={(e) => setEditActiveTitle(e.target.value)}
                  autoFocus
                  className="px-2 py-0.5 text-xs bg-slate-950 border border-blue-500 rounded text-white focus:outline-none"
                />
                <button type="submit" title="Save" className="p-0.5 text-emerald-400 hover:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenamingActive(false)}
                  title="Cancel"
                  className="p-0.5 text-slate-400 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-200 font-medium truncate">{activeConversationTitle}</span>
                <button
                  id="btn-edit-active-chat-title"
                  onClick={() => {
                    setEditActiveTitle(activeConversationTitle);
                    setIsRenamingActive(true);
                  }}
                  title="Rename active chat"
                  className="p-1 rounded text-slate-400 hover:text-sky-300 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced
            </span>
          </div>
        </div>
      )}

      {/* Drag & Drop Visual Indicator */}
      {isDragging && (
        <div className="my-2 p-4 rounded-xl border-2 border-dashed border-sky-400 bg-sky-950/40 text-center flex flex-col items-center justify-center gap-1 text-sky-300 animate-pulse">
          <UploadCloud className="w-6 h-6" />
          <span className="text-xs font-semibold">Drop photo or diagram here to analyze</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 custom-scrollbar">
        {isLoadingChat ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2.5 text-sky-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-medium text-slate-300">Loading conversation history...</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 sm:gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
            {msg.sender === 'assistant' && (
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.isError
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                    : 'bg-blue-600/20 border border-blue-500/30 text-sky-400'
                }`}
              >
                {msg.isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
            )}

            <div
              className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-tr-xs shadow-md shadow-blue-600/20'
                  : msg.isError
                  ? 'bg-red-950/40 border border-red-800/60 text-red-100 rounded-tl-xs shadow-sm'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-sm'
              }`}
            >
              {/* Header language tags if detected */}
              {msg.sender === 'assistant' && !msg.isError && msg.detectedLanguage && (
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800/60">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 text-[10px] font-medium border border-slate-700/50">
                    <Globe className="w-2.5 h-2.5" />
                    {msg.detectedLanguage}
                  </span>
                </div>
              )}

              {/* User Attached Image (from camera or file upload) */}
              {msg.imageUrl && (
                <div className="mb-2.5 relative group rounded-xl overflow-hidden border border-white/20 max-w-xs shadow-md bg-black/40">
                  <img
                    src={msg.imageUrl}
                    alt="Uploaded question"
                    className="max-h-56 w-full object-contain bg-black/20 cursor-pointer transition-transform hover:scale-102"
                    onClick={() => setExpandedImage(msg.imageUrl || null)}
                  />
                  <button
                    type="button"
                    onClick={() => setExpandedImage(msg.imageUrl || null)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] flex items-center gap-1 backdrop-blur-xs cursor-pointer"
                    title="Expand photo"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {msg.courseContext && msg.sender === 'user' && (
                <div className="text-[10px] text-blue-200 font-medium mb-1">
                  Context: {msg.courseContext}
                </div>
              )}

              {/* Generated Image Result Card */}
              {msg.isImageGeneration && msg.generatedImageUrl && (
                <div className="my-2 space-y-2">
                  <div className="relative group rounded-xl overflow-hidden border border-sky-500/30 bg-black/50 shadow-md">
                    <img
                      src={msg.generatedImageUrl}
                      alt={msg.imageGenPrompt || 'AI generated image'}
                      className="w-full max-h-72 object-contain bg-slate-950 cursor-pointer"
                      onClick={() => setExpandedImage(msg.generatedImageUrl || null)}
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <a
                        href={msg.generatedImageUrl}
                        download={`venue_ai_image_${Date.now()}.png`}
                        className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs backdrop-blur-xs border border-slate-700 transition-colors"
                        title="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setExpandedImage(msg.generatedImageUrl || null)}
                        className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs backdrop-blur-xs border border-slate-700 transition-colors"
                        title="Expand view"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Generation Notice / Unavailable Card */}
              {msg.isImageGeneration && msg.imageGenStatus === 'unavailable' && (
                <div className="my-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Image Model Status</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Direct AI image generation is currently unavailable under your current API key tier in Google AI Studio. Text explanations, rigorous mathematical solutions, and function charts continue to work at full speed.
                  </p>
                </div>
              )}

              {/* Error Message Layout */}
              {msg.isError ? (
                <div>
                  <div className="flex items-center gap-1.5 text-red-300 font-semibold mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Response Notice</span>
                  </div>
                  <p className="text-xs text-red-200/95 leading-relaxed">{msg.text}</p>
                  {msg.originalQuery && (
                    <div className="mt-3 pt-2.5 border-t border-red-800/40 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSend(msg.originalQuery, msg.id)}
                        disabled={isTyping}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800/90 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs active:scale-95 disabled:opacity-50"
                      >
                        {isTyping && retryingQuery === msg.originalQuery ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            Retry Question
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEditQuery(msg.originalQuery!)}
                        disabled={isTyping}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-slate-400" />
                        Edit in Input
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* CLEAN AI RESPONSE RENDERING: Natural readable text flow, no excessive cards */}
                  {msg.sender === 'assistant' ? (
                    <div className="prose-content">
                      <MathRenderer content={msg.text} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{msg.text}</p>
                  )}

                  {/* Clean Display Equation (subtle accent, zero heavy box containers) */}
                  {msg.formula && (
                    <div className="my-3 py-2 px-3.5 rounded-lg bg-slate-950/40 border-l-2 border-sky-500/80 overflow-x-auto custom-scrollbar">
                      <span className="text-[10px] font-medium text-slate-400 block mb-0.5">
                        Key Equation / Theorem:
                      </span>
                      <MathBlock formula={msg.formula} />
                    </div>
                  )}

                  {/* Interactive Chart Viewer */}
                  {msg.chart && <AIChartViewer chart={msg.chart} />}

                  {/* Diagram Vector SVG */}
                  {msg.diagramSvg && (
                    <div className="my-3 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-850 text-center overflow-x-auto custom-scrollbar">
                      <div
                        className="inline-block max-w-full"
                        dangerouslySetInnerHTML={{ __html: msg.diagramSvg }}
                      />
                    </div>
                  )}

                  {/* Step-by-Step Breakdown: Rendered as clean ordered list, NOT nested cards */}
                  {msg.steps && msg.steps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2.5">
                      <h4 className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        Step-by-Step Derivation
                      </h4>
                      <ol className="space-y-2 pl-0.5">
                        {msg.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-800/90 text-sky-400 font-mono text-[11px] font-semibold shrink-0 mt-0.5 select-none">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <MathRenderer content={step} />
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Quick Follow-up Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Follow-up questions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(sug)}
                            disabled={isTyping}
                            className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-blue-600/30 text-sky-300 hover:text-white border border-slate-700/40 transition-colors cursor-pointer disabled:opacity-50 active:scale-98"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Message Bottom Action & Timestamp Bar */}
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && !msg.isError && (
                  <button
                    onClick={() =>
                      handleCopy(
                        msg.id,
                        `${msg.text}\n\n${msg.formula ? `Formula: ${msg.formula}\n\n` : ''}${
                          msg.steps ? msg.steps.join('\n') : ''
                        }`
                      )
                    }
                    className="hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))
      )}

        {/* Thinking Loading State */}
        {isTyping && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>

            <div className="max-w-[94%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 bg-slate-900/95 border border-blue-500/30 text-slate-200 rounded-tl-xs shadow-lg shadow-blue-950/30">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span className="text-xs font-semibold text-sky-300">Thinking...</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                    {thinkingSeconds}s
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCancelThinking}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-slate-400 hover:text-red-300 bg-slate-800/80 hover:bg-red-950/60 border border-slate-700/50 hover:border-red-800/60 transition-colors cursor-pointer"
                  title="Cancel this request"
                >
                  <XCircle className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mb-2.5">
                VENUE AI is formulating a rigorous mathematical solution
                {selectedCourseContext !== 'All Courses' ? ` for ${selectedCourseContext}` : ''}...
              </p>

              <div className="space-y-1.5">
                <div className="h-2 rounded bg-slate-800/80 animate-pulse w-3/4" />
                <div className="h-2 rounded bg-slate-800/60 animate-pulse w-5/6 delay-150" />
                <div className="h-2 rounded bg-slate-800/40 animate-pulse w-2/3 delay-300" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Attachment Preview Bar */}
      {selectedImage && (
        <div className="mb-2 p-2 rounded-xl bg-slate-900 border border-sky-500/30 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={selectedImage.dataUrl}
              alt="Preview"
              className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0 cursor-pointer"
              onClick={() => setExpandedImage(selectedImage.dataUrl)}
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-sky-200 truncate">{selectedImage.name}</p>
              <p className="text-[10px] text-slate-400">{selectedImage.size} • Attached for AI analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Retake photo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Retake</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-300 transition-colors cursor-pointer shrink-0"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* INPUT AREA: [ Camera ] [ Upload Image ] [ Text Input ] [ Send ] */}
      <div className="pt-2 border-t border-slate-800/80">
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageFileChange}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5 sm:gap-2"
        >
          {/* 1. CAMERA BUTTON */}
          <button
            id="ai-tutor-camera-btn"
            type="button"
            onClick={() => {
              if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                setIsCameraOpen(true);
              } else {
                cameraInputRef.current?.click();
              }
            }}
            disabled={isTyping}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-sky-300 active:scale-95 disabled:opacity-50 transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[40px] min-h-[40px]"
            title="Open Camera to photograph question"
            aria-label="Camera"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* 2. UPLOAD IMAGE BUTTON */}
          <button
            id="ai-tutor-upload-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-sky-300 active:scale-95 disabled:opacity-50 transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[40px] min-h-[40px]"
            title="Upload image or diagram from files"
            aria-label="Upload Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* 3. TEXT INPUT */}
          <input
            ref={inputRef}
            id="ai-tutor-prompt-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            placeholder={
              selectedImage
                ? 'Add question details (or tap Send to analyze photo)...'
                : selectedCourseContext === 'All Courses'
                ? 'Ask any academic question, take photo, or graph...'
                : `Ask AI Tutor about ${selectedCourseContext}...`
            }
            className="flex-1 px-3.5 sm:px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-60 min-w-0"
          />

          {/* 4. SEND / CANCEL BUTTON */}
          {isTyping ? (
            <button
              id="ai-tutor-cancel-btn"
              type="button"
              onClick={handleCancelThinking}
              className="p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/50 text-red-200 shadow-md transition-all active:scale-95 cursor-pointer shrink-0 flex items-center justify-center min-w-[40px] min-h-[40px]"
              title="Cancel Thinking"
            >
              <XCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="ai-tutor-send-btn"
              type="submit"
              disabled={(!inputQuery.trim() && !selectedImage) || isTyping}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer shrink-0 flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Send query"
              title="Send to AI Tutor"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Real Device Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        onSendImmediately={handleCameraSendImmediate}
        onFallbackToFile={() => fileInputRef.current?.click()}
      />

      {/* Lightbox Modal for Full-Resolution Image Viewing */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <a
                href={expandedImage}
                download="venue_academic_photo.png"
                className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setExpandedImage(null)}
                className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* AIChatHistoryDrawer for Recent Chats */}
      <AIChatHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        conversations={conversations}
        activeChatId={activeConversationId}
        onSelectChat={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameConversation}
        onDeleteChat={handleDeleteConversation}
        hasMore={hasMoreChats}
        onLoadMore={handleLoadMoreConversations}
        isLoadingMore={isLoadingMoreChats}
      />
    </div>
  );
};
