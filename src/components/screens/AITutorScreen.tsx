import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
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
  BookOpen,
  FileText,
  ArrowUp,
  ArrowDown,
  Square,
  Brain,
} from 'lucide-react';
import {
  AIMessage,
  AITutorModeId,
  AILearningDifficulty,
  Course,
  AIChatConversation,
  StudentProfile,
  AcademicMaterialRecord,
} from '../../types';
import { MathRenderer, MathBlock } from '../MathRenderer';
import { AIChartViewer } from '../AIChartViewer';
import {
  SafeRenderErrorBoundary,
  aiRenderTelemetry,
  filterValidCitations,
  isLegacyFormattingFalseError,
  recoverStructuredTextIfRawJson,
  sanitizeDiagramSvg,
} from '../../utils/aiResponseRenderPipeline';
import { CameraCaptureModal } from '../CameraCaptureModal';
import { AIChatHistoryDrawer } from '../AIChatHistoryDrawer';
import { AIStudyModeWorkspace } from '../AIStudyModeWorkspace';
import { AIQuizGeneratorWorkspace } from '../AIQuizGeneratorWorkspace';
import { AIPracticeModeWorkspace } from '../AIPracticeModeWorkspace';
import { AIExamPrepWorkspace } from '../AIExamPrepWorkspace';
import { AIFlashcardsWorkspace } from '../AIFlashcardsWorkspace';
import { AIPersonalizedMemoryPanel } from '../AIPersonalizedMemoryPanel';
import {
  AIVoiceMicButton,
  AIVoiceStatusBanner,
  AIReadAloudControl,
} from '../AIVoiceTutorControls';
import { aiVoiceTutorService, AIVoiceInputState } from '../../services/aiVoiceTutorService';
import { analyticsTracker } from '../../services/analyticsTrackerService';
import { aiTutorMaterialContextService } from '../../services/aiTutorMaterialContextService';
import { aiTutorFoundationService } from '../../services/aiTutorFoundationService';
import {
  getActiveUserId,
  getCachedConversations,
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
  profile?: StudentProfile;
  studentName?: string;
  userId?: string;
  onOpenMaterialViewer?: (material: AcademicMaterialRecord, initialPage?: number) => void;
}

interface ImageAttachment {
  dataUrl: string;
  name: string;
  size: string;
  mimeType: string;
  width?: number;
  height?: number;
  qualityWarning?: string;
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

const HOMEWORK_INITIAL_PROMPTS = [
  'Solve this step by step',
  'Give me a hint first',
  'Check my answer / Where did I go wrong?',
  'Show the graph',
  'Use another method',
  'Explain like a beginner',
  'Give only the formula',
];

const HOMEWORK_FOLLOWUP_ACTIONS = [
  'Explain this step',
  'Why did we use this formula?',
  'Show another method',
  'Show the graph',
  'Give me a similar question',
  'Make the explanation simpler',
];

/**
 * Checks if a query is explicitly requesting an artistic AI image/photo generation
 * rather than a mathematical graph, chart, flowchart, or conceptual SVG diagram.
 */
function isImageGenerationRequest(query: string): boolean {
  const q = query.trim().toLowerCase();
  // Never route mathematical graphs, plots, charts, flowcharts, or conceptual diagrams to raster image generation
  if (
    /\b(graph|plot|chart|histogram|parabola|function|distribution|curve|flowchart|flow\s+chart|venn|tree\s+diagram|vector|matrix|equation|formula|table|step\s+by\s+step)\b/i.test(
      q
    )
  ) {
    return false;
  }
  return (
    /^(generate|create|draw|make|produce)\s+(an?\s+)?(image|picture|photo|illustration|drawing)\b/i.test(
      q
    ) || /^(tengeneza|chora|leta)\s+(picha)\s+(ya|wa)\b/i.test(q)
  );
}

export const AITutorScreen: React.FC<AITutorScreenProps> = ({
  initialCourse,
  courses,
  profile,
  studentName,
  userId,
  onOpenMaterialViewer,
}) => {
  const effectiveUserId = userId || profile?.uid || getActiveUserId();

  // Stage 10F Foundation: Mode Architecture (Only implemented modes are exposed; defaults to CHAT)
  const [activeMode, setActiveMode] = useState<AITutorModeId>('CHAT');
  const [modeHandoffTopic, setModeHandoffTopic] = useState<string>('');
  const [modeHandoffDifficulty, setModeHandoffDifficulty] =
    useState<AILearningDifficulty>('intermediate');
  const implementedModes = aiTutorFoundationService.getImplementedModes();

  // Chat History & Persistence State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversationTitle, setActiveConversationTitle] = useState<string>('New Chat');
  const [conversations, setConversations] = useState<AIChatConversation[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const [isRenamingActive, setIsRenamingActive] = useState(false);
  const [editActiveTitle, setEditActiveTitle] = useState('');

  const [selectedCourseContext, setSelectedCourseContext] = useState<string>(
    initialCourse ? initialCourse.code : 'All Courses'
  );
  const [authorizedMaterials, setAuthorizedMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [availableMaterialsCount, setAvailableMaterialsCount] = useState<number>(0);

  // Sync selectedCourseContext if student navigated from a specific course card ("Ask AI Tutor About ...")
  useEffect(() => {
    if (initialCourse?.code) {
      setSelectedCourseContext(initialCourse.code);
    }
  }, [initialCourse?.code]);

  // Pre-warm and check authorized VENUE course materials for the selected course context
  useEffect(() => {
    let isMounted = true;
    aiTutorMaterialContextService
      .fetchAuthorizedMaterials(profile, courses, selectedCourseContext, initialCourse)
      .then((mats) => {
        if (!isMounted) return;
        setAuthorizedMaterials(mats);
        setAvailableMaterialsCount(mats.length);
      })
      .catch(() => {
        if (isMounted) {
          setAuthorizedMaterials([]);
          setAvailableMaterialsCount(0);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCourseContext, profile?.uid, profile?.programmeId, courses.length]);

  const [languagePreference, setLanguagePreference] = useState<string>('auto');
  const [inputQuery, setInputQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [retryingQuery, setRetryingQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [voiceInputStatus, setVoiceInputStatus] = useState<{
    state: AIVoiceInputState;
    interimText: string;
    notice: string | null;
    isError: boolean;
  }>({
    state: 'ready',
    interimText: '',
    notice: null,
    isError: false,
  });

  const initialWelcomeMessage: AIMessage = {
    id: 'msg-init',
    sender: 'assistant',
    role: 'assistant',
    text: `Hello${studentName ? ` ${studentName.split(' ')[0]}` : ''}. Ask any question about your coursework, mathematical derivations, statistical concepts, or upload a photo of a problem to work through step by step.`,
    timestamp: 'Just now',
    suggestions: [
      'Explain key concepts from my coursework step by step',
      'Solve a sample variance and standard deviation problem',
      'Derive the formula for arithmetic mean using the short-cut method',
      'Give me 3 practice questions with step-by-step solutions',
    ],
  };

  const [messages, setMessages] = useState<AIMessage[]>([initialWelcomeMessage]);
  const [streamingMsg, setStreamingMsg] = useState<AIMessage | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const [visibleMessageLimit, setVisibleMessageLimit] = useState<number>(30);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const streamingMsgRef = useRef<AIMessage | null>(null);
  const activeMessagesRef = useRef<AIMessage[]>(messages);
  const activeChatIdRef = useRef<string | null>(activeConversationId);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    activeMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activeChatIdRef.current = activeConversationId;
  }, [activeConversationId]);

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

  const clearActiveRevealTimer = () => {
    if (revealTimerRef.current !== null) {
      window.clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearActiveRevealTimer();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearActiveRevealTimer();
    streamingMsgRef.current = null;
    setStreamingMsg(null);
    setIsTyping(false);
    setInputQuery('');
    setSelectedImage(null);
    setActiveConversationId(null);
    setActiveConversationTitle('New Chat');
    setIsRenamingActive(false);
    setVisibleMessageLimit(30);
    isNearBottomRef.current = true;
    setShowScrollToBottom(false);
    setMessages([initialWelcomeMessage]);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleSelectConversation = async (chat: AIChatConversation) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearActiveRevealTimer();
    streamingMsgRef.current = null;
    setStreamingMsg(null);
    setIsTyping(false);
    setInputQuery('');
    setSelectedImage(null);
    setIsRenamingActive(false);
    setVisibleMessageLimit(30);
    isNearBottomRef.current = true;
    setShowScrollToBottom(false);
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
      setTimeout(() => scrollToBottom('auto', true), 40);
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

  const handleChatScroll = () => {
    const el = chatScrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 120;
    setShowScrollToBottom(distanceFromBottom > 160);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth', force = false) => {
    if (!force && !isNearBottomRef.current) return;
    const el = chatScrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
      if (force) {
        isNearBottomRef.current = true;
        setShowScrollToBottom(false);
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth', false);
  }, [messages.length, isTyping, Boolean(streamingMsg?.text)]);

  /**
   * Build clean academic copy text without UI labels, course tags, or source metadata.
   */
  const buildCleanCopyText = (msg: AIMessage): string => {
    const parts: string[] = [];
    const mainText = (msg.text || '').trim();
    if (mainText) {
      parts.push(mainText);
    }
    if (msg.formula && !mainText.includes(msg.formula.trim())) {
      parts.push(`$$${msg.formula.trim()}$$`);
    }
    if (Array.isArray(msg.steps) && msg.steps.length > 0) {
      const formattedSteps = msg.steps
        .map((step, idx) => {
          const clean = step
            .replace(/^\s*(?:\*\*?)?Step\s+\d+\s*[:.)\-]?(?:\*\*?)?\s*/i, '')
            .trim();
          return `Step ${idx + 1}: ${clean || step}`;
        })
        .join('\n');
      parts.push(formattedSteps);
    }
    return parts.join('\n\n').trim();
  };

  const handleCopy = (id: string, msg: AIMessage) => {
    const cleanText = buildCleanCopyText(msg);
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelThinking = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearActiveRevealTimer();

    // Stage 10E: Preserve any partial response generated so far when stopped
    const currentPartial = streamingMsgRef.current;
    const currentMsgs = activeMessagesRef.current;
    const lastMsg = currentMsgs[currentMsgs.length - 1];
    const lastUserQuery =
      currentPartial?.originalQuery ||
      (lastMsg?.sender === 'user' ? lastMsg.text : '') ||
      retryingQuery ||
      '';

    if (currentPartial && currentPartial.text.trim().length > 0) {
      const finalizedPartial: AIMessage = {
        ...currentPartial,
        steps: undefined,
        suggestions: undefined,
      };
      const updated = [...currentMsgs, finalizedPartial];
      setMessages(updated);
      if (activeChatIdRef.current) {
        saveConversationMessages(
          activeChatIdRef.current,
          updated,
          effectiveUserId,
          selectedCourseContext,
          languagePreference
        );
        setConversations(getCachedConversations(effectiveUserId));
      }
    } else if (lastMsg && lastMsg.sender === 'user') {
      // Stopped before tokens arrived: keep partial stopped placeholder attached to the user query so Regenerate works without duplicating the user message
      const stoppedMsg: AIMessage = {
        id: `ai-stopped-${Date.now()}`,
        sender: 'assistant',
        role: 'assistant',
        text: '_Generation stopped by user._',
        content: '_Generation stopped by user._',
        originalQuery: lastUserQuery,
        timestamp: 'Just now',
        courseContext: selectedCourseContext,
      };
      const updated = [...currentMsgs, stoppedMsg];
      setMessages(updated);
      if (activeChatIdRef.current) {
        saveConversationMessages(
          activeChatIdRef.current,
          updated,
          effectiveUserId,
          selectedCourseContext,
          languagePreference
        );
        setConversations(getCachedConversations(effectiveUserId));
      }
    }

    streamingMsgRef.current = null;
    setStreamingMsg(null);
    setIsTyping(false);
    setRetryingQuery(null);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  // Compress and read image file as data URL (Stage 10G & 10O: preserve handwriting/symbol clarity, validate file type, size, resolution & lighting)
  const processImageFile = (file: File) => {
    setImageUploadError(null);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileTypeLower = (file.type || '').toLowerCase();
    if (!allowedTypes.includes(fileTypeLower)) {
      setImageUploadError(
        'Unsupported file format. Please upload a clear JPG, PNG, or WebP photo or screenshot of your question.'
      );
      return;
    }

    const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB limit
    if (file.size > MAX_FILE_BYTES) {
      setImageUploadError(
        'This image is too large (over 15 MB). Please select a smaller or cropped photo of the question.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setImageUploadError('Something went wrong while reading the image. Please try again.');
    };
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onerror = () => {
        setImageUploadError('Could not load the selected image. Please try another photo.');
      };
      img.onload = () => {
        const origW = img.width;
        const origH = img.height;

        if (origW < 60 || origH < 60) {
          setImageUploadError(
            'This image resolution is too small to read mathematical symbols reliably. Please upload a clearer or larger image.'
          );
          return;
        }

        const MAX_DIM = 1800; // Preserve crisp resolution for small math exponents, subscripts, and handwriting
        let width = origW;
        let height = origH;

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

          // Stage 10O: Lightweight client-side readability check (resolution, brightness & contrast)
          let qualityWarning: string | undefined;
          if (origW < 240 || origH < 120) {
            qualityWarning =
              'Low image resolution detected — small exponents or subscripts may be hard to read. Verify or upload a closer photo if needed.';
          } else {
            try {
              const sampleW = Math.min(width, 200);
              const sampleH = Math.min(height, 200);
              const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
              let sumLum = 0;
              let sumSqLum = 0;
              const pixelCount = imgData.length / 4;
              for (let i = 0; i < imgData.length; i += 4) {
                const lum = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
                sumLum += lum;
                sumSqLum += lum * lum;
              }
              const meanLum = sumLum / Math.max(1, pixelCount);
              const stdLum = Math.sqrt(
                Math.max(0, sumSqLum / Math.max(1, pixelCount) - meanLum * meanLum)
              );
              if (meanLum < 38) {
                qualityWarning =
                  'This photo appears very dark. If symbols are hard to read, consider retaking with better lighting.';
              } else if (stdLum < 12) {
                qualityWarning =
                  'Low contrast or blur detected. Make sure equations and numbers are clearly visible before sending.';
              }
            } catch {}
          }

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedImage({
            dataUrl: compressedDataUrl,
            name: file.name || 'Uploaded question photo',
            size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            mimeType: 'image/jpeg',
            width,
            height,
            qualityWarning,
          });
        } else {
          setSelectedImage({
            dataUrl: result,
            name: file.name || 'Uploaded question photo',
            size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            mimeType: file.type || 'image/jpeg',
            width: origW,
            height: origH,
          });
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Rotate selected image 90 degrees clockwise so sideways mobile homework photos are easy to fix
  const handleRotateSelectedImage = () => {
    if (!selectedImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const rotatedUrl = canvas.toDataURL('image/jpeg', 0.88);
      setSelectedImage({
        ...selectedImage,
        dataUrl: rotatedUrl,
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.src = selectedImage.dataUrl;
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
    msgIdToReplace?: string,
    explicitImage?: ImageAttachment
  ) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    let imageToSend = explicitImage || selectedImage;

    if ((!query && !imageToSend) || isTyping) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearActiveRevealTimer();
    streamingMsgRef.current = null;
    setStreamingMsg(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let newMessages: AIMessage[] = [];
    if (msgIdToReplace) {
      // Stage 10E: When regenerating an AI response or retrying a failed/stopped message,
      // remove the target AI response and KEEP the existing preceding user message in place
      // so duplicate user messages are never created.
      const idx = messages.findIndex((m) => m.id === msgIdToReplace);
      if (idx !== -1) {
        const slicedBefore = messages.slice(0, idx);
        const lastBefore = slicedBefore[slicedBefore.length - 1];
        if (lastBefore && lastBefore.sender === 'user') {
          newMessages = slicedBefore;
          // Preserve attached image from the original user message when regenerating
          if (!imageToSend && lastBefore.imageUrl) {
            imageToSend = {
              dataUrl: lastBefore.imageUrl,
              name: lastBefore.imageName || 'Uploaded photo',
              size: lastBefore.imageSize || '',
              mimeType: lastBefore.imageMimeType || 'image/jpeg',
            };
          }
        } else {
          const fallbackUserMsg: AIMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            role: 'user',
            text: query || 'Analyze attached problem image',
            content: query || 'Analyze attached problem image',
            timestamp: 'Just now',
            courseContext: selectedCourseContext,
          };
          newMessages = [...slicedBefore, fallbackUserMsg];
        }
      } else {
        newMessages = [...messages];
      }
    } else {
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
      newMessages = [...messages, userMsg];
    }

    // Determine conversation ID: either continue current or start brand new
    let currentChatId = activeConversationId;
    if (!currentChatId) {
      currentChatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveConversationId(currentChatId);
      activeChatIdRef.current = currentChatId;
      const autoTitle = (query || 'Academic Analysis').slice(0, 36).trim();
      setActiveConversationTitle(autoTitle);
    }

    setMessages(newMessages);
    activeMessagesRef.current = newMessages;
    setInputQuery('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setSelectedImage(null);
    setIsTyping(true);
    setRetryingQuery(textToSend ? query : null);
    isNearBottomRef.current = true;
    setTimeout(() => scrollToBottom('smooth', true), 20);

    // Persist user question immediately
    saveConversationMessages(
      currentChatId,
      newMessages,
      effectiveUserId,
      selectedCourseContext,
      languagePreference
    );
    setConversations(getCachedConversations(effectiveUserId));

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
          const imgSuccessMsg: AIMessage = {
            id: `ai-img-${Date.now()}`,
            sender: 'assistant',
            role: 'assistant',
            text: `Here is the generated illustration for **${query}**:`,
            content: `Here is the generated illustration for **${query}**:`,
            generatedImageUrl: genJson.imageUrl,
            isImageGeneration: true,
            imageGenStatus: 'success',
            imageGenPrompt: query,
            originalQuery: query,
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
          setConversations(getCachedConversations(effectiveUserId));
          return;
        }

        if (genJson.unavailable) {
          const imgUnavailableMsg: AIMessage = {
            id: `ai-img-${Date.now()}`,
            sender: 'assistant',
            role: 'assistant',
            text:
              genJson.fallbackMessage ||
              `Image generation request received for "${query}". Direct AI image generation is currently unavailable under your current API key tier.`,
            content:
              genJson.fallbackMessage ||
              `Image generation request received for "${query}". Direct AI image generation is currently unavailable under your current API key tier.`,
            isImageGeneration: true,
            imageGenStatus: 'unavailable',
            imageGenPrompt: query,
            originalQuery: query,
            suggestions: [
              `Explain ${query.replace(
                /^(generate|create|draw|make|produce)\s+(an?\s+)?(image|picture|diagram|photo)\s+of\s+/i,
                ''
              )} in text with formula`,
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
          setConversations(getCachedConversations(effectiveUserId));
          return;
        }
      }

      // 2. Standard Multimodal Academic Chat via Gemini
      // Stage 10D: Include formula and numbered steps in history so follow-ups ("Explain step 2", "Why?", "Draw the graph") have full context
      const validHistory = newMessages
        .filter((m) => !m.isError && !m.isImageGeneration && m.id !== 'msg-init')
        .slice(-10)
        .map((m) => {
          let fullText = m.text || '';
          if (m.sender === 'assistant') {
            if (m.formula) {
              fullText += `\n\nFormula: $$${m.formula}$$`;
            }
            if (Array.isArray(m.steps) && m.steps.length > 0) {
              fullText += `\n\nSteps:\n${m.steps
                .map((s, idx) => `Step ${idx + 1}: ${s}`)
                .join('\n')}`;
            }
          }
          return {
            role: m.sender === 'user' ? ('user' as const) : ('model' as const),
            text: fullText,
          };
        });

      // Stage 10A, 10B & Foundation: Retrieve relevant authorized VENUE materials and shared mode context
      const academicContext = await aiTutorFoundationService.buildSharedModeContext({
        mode: activeMode,
        profile,
        courses,
        selectedCourseContext,
        initialCourse,
        userQuery: query,
        includeTutorMemory: true,
      });

      // Stage 10M: Retrieve relevant Personalized Tutor Memory context (respecting explicit user overrides)
      const personalizedMemoryContext = await aiTutorFoundationService.getRelevantPersonalizedMemoryContext({
        userId: effectiveUserId,
        courseCode: selectedCourseContext,
        courseId: selectedCourseContext,
        topic: query.slice(0, 120),
        userMessage: query,
        mode: activeMode,
        authorizedCourseCodes: courses.map((c) => c.code),
      });

      // Record learning signal when student asks for simpler explanation or hint in Chat/Homework Mode
      const wantsSimplerSignal = /\b(explain\s+(?:it\s+)?simpler|make\s+it\s+simpler|simple\s+explanation|don'?t\s+understand|ieleze\s+kwa\s+urahisi)\b/i.test(
        query
      );
      const wantsHintSignal = /\b(give\s+(?:me\s+)?a\s+hint|hint\s+first|only\s+a\s+hint|nipe\s+hint)\b/i.test(
        query
      );
      if (
        (activeMode === 'HOMEWORK' || wantsSimplerSignal || wantsHintSignal) &&
        selectedCourseContext &&
        selectedCourseContext !== 'All Courses'
      ) {
        const inferredTopic =
          query.length > 6 && !wantsSimplerSignal && !wantsHintSignal
            ? query.slice(0, 80)
            : activeConversationTitle !== 'New Chat'
            ? activeConversationTitle
            : `${selectedCourseContext} Problem Solving`;
        aiTutorFoundationService
          .upsertTopicMasteryMemory({
            userId: effectiveUserId,
            courseId: selectedCourseContext,
            courseCode: selectedCourseContext,
            topic: inferredTopic,
            usedHints: wantsHintSignal,
            requestedSimplerExplanation: wantsSimplerSignal,
            preferredStyle: wantsSimplerSignal ? 'visual_intuitive' : 'step_by_step',
            sourceMode: activeMode,
          })
          .catch(() => {});
      }

      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: activeMode,
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
          studentName: studentName || profile?.name,
          userId: effectiveUserId,
          academicContext,
          personalizedMemoryContext,
        }),
        signal: controller.signal,
      });

      let json: any = null;
      const rawResponseBody = await res.text();
      try {
        json = JSON.parse(rawResponseBody);
      } catch {
        // Stage 10P Section 2 & 3: If the backend returned a raw text response or non-JSON body with HTTP 200,
        // preserve the raw response rather than throwing a JSON parse error that triggers "Unable to complete response".
        if (res.ok && rawResponseBody && rawResponseBody.trim().length > 0 && !rawResponseBody.trim().startsWith('<!DOCTYPE')) {
          json = {
            success: true,
            data: recoverStructuredTextIfRawJson(rawResponseBody),
          };
        } else {
          throw new Error('We could not complete your answer right now. Please check your connection and try again.');
        }
      }

      if (!res.ok || !json || !json.success) {
        const errReason = json?.message || json?.error || 'Unable to generate response right now.';
        aiRenderTelemetry.logGenerationFailure(errReason);
        throw new Error(errReason);
      }

      // Stage 8B: Track successful AI Tutor feature usage event
      analyticsTracker.trackAITutorQuery(selectedCourseContext, query.length);

      const aiData = json.data || {};
      const recovered = recoverStructuredTextIfRawJson(String(aiData.text || ''));
      const fullText = recovered.text || aiData.text || 'No response generated.';
      const safeDiagramSvg = sanitizeDiagramSvg(aiData.diagramSvg);
      const validCitations = filterValidCitations(aiData.referencedMaterials);

      const assistantMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        role: 'assistant',
        text: fullText,
        content: fullText,
        steps:
          Array.isArray(aiData.steps) && aiData.steps.length > 0
            ? aiData.steps.map((s: any) => String(s || '')).filter(Boolean)
            : recovered.steps,
        formula:
          typeof aiData.formula === 'string' && aiData.formula.trim()
            ? aiData.formula.trim()
            : recovered.formula,
        suggestions:
          Array.isArray(aiData.suggestions) && aiData.suggestions.length > 0
            ? aiData.suggestions.map((s: any) => String(s || '')).filter(Boolean)
            : recovered.suggestions,
        detectedLanguage: aiData.detectedLanguage,
        chart: aiData.chart && Array.isArray(aiData.chart.data) ? aiData.chart : undefined,
        diagramSvg: safeDiagramSvg || undefined,
        referencedMaterials: validCitations.length > 0 ? validCitations : undefined,
        groundedInMaterials:
          typeof aiData.groundedInMaterials === 'boolean' && validCitations.length > 0
            ? aiData.groundedInMaterials
            : false,
        originalQuery: query,
        timestamp: 'Just now',
        courseContext: selectedCourseContext,
      };

      // Stage 10E: Smooth progressive response reveal with Stop support (keeps partial response if stopped)
      if (fullText.length > 120 && !controller.signal.aborted) {
        await new Promise<void>((resolve) => {
          const totalLen = fullText.length;
          const stepSize = Math.max(28, Math.ceil(totalLen / 14));
          let cursor = Math.min(totalLen, stepSize * 2);

          const initialPartial: AIMessage = {
            ...assistantMsg,
            text: fullText.slice(0, cursor),
            content: fullText.slice(0, cursor),
            steps: undefined,
            suggestions: undefined,
          };
          streamingMsgRef.current = initialPartial;
          setStreamingMsg(initialPartial);

          revealTimerRef.current = window.setInterval(() => {
            if (controller.signal.aborted) {
              clearActiveRevealTimer();
              resolve();
              return;
            }
            cursor = Math.min(totalLen, cursor + stepSize);
            const partial: AIMessage = {
              ...assistantMsg,
              text: fullText.slice(0, cursor),
              content: fullText.slice(0, cursor),
              steps: cursor >= totalLen ? assistantMsg.steps : undefined,
              suggestions: cursor >= totalLen ? assistantMsg.suggestions : undefined,
            };
            streamingMsgRef.current = partial;
            setStreamingMsg(partial);
            if (isNearBottomRef.current) {
              scrollToBottom('auto', false);
            }
            if (cursor >= totalLen) {
              clearActiveRevealTimer();
              resolve();
            }
          }, 28);
        });
      }

      if (controller.signal.aborted) {
        return;
      }

      streamingMsgRef.current = null;
      setStreamingMsg(null);
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      activeMessagesRef.current = finalMessages;
      await saveConversationMessages(
        currentChatId,
        finalMessages,
        effectiveUserId,
        selectedCourseContext,
        languagePreference
      );
      setConversations(getCachedConversations(effectiveUserId));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      console.warn('Gemini AI Tutor error:', err);
      const normalizedErr = aiTutorFoundationService.normalizeError(err, activeMode);
      const cleanUserErrorMessage = normalizedErr.userMessage;

      const errorMsg: AIMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        role: 'assistant',
        text: cleanUserErrorMessage,
        content: cleanUserErrorMessage,
        timestamp: 'Just now',
        courseContext: selectedCourseContext,
        isError: true,
        originalQuery: query,
      };

      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      activeMessagesRef.current = finalMessages;
      await saveConversationMessages(
        currentChatId,
        finalMessages,
        effectiveUserId,
        selectedCourseContext,
        languagePreference
      );
      setConversations(getCachedConversations(effectiveUserId));
    } finally {
      if (!controller.signal.aborted) {
        setIsTyping(false);
        setRetryingQuery(null);
        abortControllerRef.current = null;
      }
    }
  };

  const handleEditQuery = (queryText: string) => {
    setInputQuery(queryText);
    if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
        }
      }, 10);
    }
  };

  // Find previous user query for a given assistant message so Regenerate works even on historical messages
  const findQueryForAssistantMessage = (msgIndex: number, msg: AIMessage): string => {
    if (msg.originalQuery) return msg.originalQuery;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user' && messages[i].text) {
        return messages[i].text;
      }
    }
    return '';
  };

  // Open a cited source material inside the VENUE Material Viewer when clicked (with optional page reference)
  const handleOpenCitedSource = (materialId: string, pageNumber?: number) => {
    if (!onOpenMaterialViewer || !materialId) return;
    const found = authorizedMaterials.find((m) => m.id === materialId);
    if (found) {
      onOpenMaterialViewer(found, pageNumber);
    } else {
      // Construct minimal record so MaterialViewerScreen loads full metadata by ID
      onOpenMaterialViewer(
        {
          id: materialId,
          title: 'Course Material',
          materialType: 'Lecture Notes',
          fileName: 'document.pdf',
          fileUrl: '',
          fileSize: '',
          mimeType: 'application/pdf',
          uploadedBy: 'University Repository',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          universityId: profile?.universityId || 'udsm',
          academicUnitId: profile?.academicUnitId || '',
          departmentId: profile?.departmentId || '',
          programmeId: profile?.programmeId || '',
          yearId: profile?.yearOfStudy || 1,
          semesterId: profile?.semester || 1,
          courseId: selectedCourseContext,
        },
        pageNumber
      );
    }
  };

  const isSendReady = (inputQuery.trim().length > 0 || Boolean(selectedImage)) && !isTyping;
  const hiddenEarlierCount = Math.max(0, messages.length - visibleMessageLimit);
  const displayedMessages =
    hiddenEarlierCount > 0 ? messages.slice(hiddenEarlierCount) : messages;
  const renderedMessages = streamingMsg ? [...displayedMessages, streamingMsg] : displayedMessages;

  return (
    <div
      className="venue-ai-tutor-white flex flex-col min-h-[calc(100vh-124px)] sm:h-[780px] w-full bg-white text-slate-900 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border sm:border-slate-200/90 shadow-none sm:shadow-xs"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Clean Top Academic Toolbar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Title, Implemented Mode Switcher Slot & Course Context */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">VENUE AI Tutor</h2>
              {implementedModes.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  {implementedModes.map((modeDef) => (
                    <button
                      key={modeDef.id}
                      type="button"
                      onClick={() => setActiveMode(modeDef.id)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        activeMode === modeDef.id
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {modeDef.shortLabel}
                    </button>
                  ))}
                </div>
              )}
              {availableMaterialsCount > 0 && (
                <span
                  title={`${availableMaterialsCount} authorized VENUE course material(s) linked`}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium"
                >
                  <span className="text-slate-300">·</span>
                  <BookOpen className="w-3 h-3 text-emerald-600" />
                  <span>
                    {availableMaterialsCount}{' '}
                    {availableMaterialsCount === 1 ? 'material' : 'materials'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Course Selector, Language, History & New Chat */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Course Context Picker */}
          <select
            id="ai-course-context-select"
            value={selectedCourseContext}
            onChange={(e) => setSelectedCourseContext(e.target.value)}
            disabled={isTyping}
            aria-label="Course Context"
            className="venue-tutor-select text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-blue-600 disabled:opacity-60 cursor-pointer max-w-[140px] sm:max-w-[200px] truncate transition-colors"
          >
            <option value="All Courses">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code} — {c.title.slice(0, 22)}
              </option>
            ))}
          </select>

          {/* Language Preference Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              id="ai-language-preference-select"
              value={languagePreference}
              onChange={(e) => setLanguagePreference(e.target.value)}
              disabled={isTyping}
              title="Response Language Preference"
              aria-label="Response Language Preference"
              className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Personalized Learning Memory Button (Stage 10M) */}
          <button
            id="ai-tutor-memory-panel-btn"
            type="button"
            onClick={() => setIsMemoryPanelOpen(true)}
            title="Personalized Learning Memory & Preferences"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/80 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Memory</span>
          </button>

          {/* Recent Chats Drawer Trigger */}
          <button
            id="ai-tutor-history-drawer-btn"
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            title="Conversation History"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">History</span>
            {conversations.length > 0 && (
              <span className="text-[11px] text-slate-500 font-normal">
                ({conversations.length})
              </span>
            )}
          </button>

          {/* New Chat Button */}
          <button
            id="ai-tutor-new-chat-btn"
            type="button"
            onClick={handleNewChat}
            title="Start a new conversation"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Subtle Active Conversation Title Bar (when an active session exists in CHAT or HOMEWORK mode) */}
      {activeMode !== 'STUDY' &&
        activeMode !== 'QUIZ' &&
        activeMode !== 'PRACTICE' &&
        activeMode !== 'EXAM_PREP' &&
        activeMode !== 'FLASHCARDS' &&
        activeConversationId && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50/70 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
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
                  className="px-2 py-0.5 text-xs bg-white! border border-blue-500! rounded text-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  title="Save"
                  className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenamingActive(false)}
                  title="Cancel"
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-600 font-medium truncate">
                  {activeConversationTitle}
                </span>
                <button
                  id="btn-edit-active-chat-title"
                  type="button"
                  onClick={() => {
                    setEditActiveTitle(activeConversationTitle);
                    setIsRenamingActive(true);
                  }}
                  title="Rename conversation"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">Saved</span>
        </div>
      )}

      {/* Drag & Drop Visual Indicator */}
      {activeMode !== 'STUDY' &&
        activeMode !== 'QUIZ' &&
        activeMode !== 'PRACTICE' &&
        activeMode !== 'EXAM_PREP' &&
        activeMode !== 'FLASHCARDS' &&
        isDragging && (
        <div className="mx-4 my-2 p-4 rounded-xl border-2 border-dashed border-blue-500 bg-blue-50/60 text-center flex flex-col items-center justify-center gap-1 text-blue-700">
          <UploadCloud className="w-6 h-6" />
          <span className="text-xs font-semibold">Drop photo or equation image here to analyze</span>
        </div>
      )}

      {/* Stage 10G: Homework / Solution Mode Entry Header */}
      {activeMode === 'HOMEWORK' && (
        <div className="bg-slate-50/80 border-b border-slate-200/80 px-3 sm:px-6 py-2.5">
          <div className="max-w-3xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Homework / Solution Mode
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200/60">
                  Step-by-Step Solver
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Upload a question and I&apos;ll help you understand and solve it step by step.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    setIsCameraOpen(true);
                  } else {
                    cameraInputRef.current?.click();
                  }
                }}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take Photo</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'STUDY' ? (
        <AIStudyModeWorkspace
          courses={courses}
          initialCourse={initialCourse}
          initialTopic={modeHandoffTopic || undefined}
          initialDifficulty={modeHandoffDifficulty}
          selectedCourseContext={selectedCourseContext}
          onChangeCourseContext={setSelectedCourseContext}
          languagePreference={languagePreference}
          onChangeLanguagePreference={setLanguagePreference}
          profile={profile}
          studentName={studentName}
          userId={effectiveUserId}
          onOpenMaterialViewer={onOpenMaterialViewer}
          onExitToChat={() => setActiveMode('CHAT')}
        />
      ) : activeMode === 'QUIZ' ? (
        <AIQuizGeneratorWorkspace
          profile={profile}
          courses={courses}
          selectedCourseContext={selectedCourseContext}
          onSelectCourseContext={setSelectedCourseContext}
          languagePreference={languagePreference}
          initialTopic={modeHandoffTopic || undefined}
          initialDifficulty={modeHandoffDifficulty}
          onOpenMaterialSource={onOpenMaterialViewer}
          onAskTutorInChat={(prompt, courseCode) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setActiveMode('CHAT');
            handleSend(prompt);
          }}
          onLaunchStudyModeForTopic={(courseCode, topic) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            if (topic) setModeHandoffTopic(topic);
            setActiveMode('STUDY');
          }}
        />
      ) : activeMode === 'PRACTICE' ? (
        <AIPracticeModeWorkspace
          profile={profile}
          courses={courses}
          selectedCourseContext={selectedCourseContext}
          onSelectCourseContext={setSelectedCourseContext}
          languagePreference={languagePreference}
          initialTopic={modeHandoffTopic || undefined}
          initialDifficulty={modeHandoffDifficulty}
          onOpenMaterialSource={onOpenMaterialViewer}
          onAskTutorInChat={(prompt, courseCode) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setActiveMode('CHAT');
            handleSend(prompt);
          }}
          onLaunchStudyModeForTopic={(courseCode, topic) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            if (topic) setModeHandoffTopic(topic);
            setActiveMode('STUDY');
          }}
        />
      ) : activeMode === 'EXAM_PREP' ? (
        <AIExamPrepWorkspace
          profile={profile}
          courses={courses}
          selectedCourseContext={selectedCourseContext}
          onSelectCourseContext={setSelectedCourseContext}
          languagePreference={languagePreference}
          onOpenMaterialSource={onOpenMaterialViewer}
          onLaunchStudyModeForTopic={(courseCode, topic, diff) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setModeHandoffTopic(topic || '');
            if (diff) setModeHandoffDifficulty(diff);
            setActiveMode('STUDY');
          }}
          onLaunchPracticeModeForTopic={(courseCode, topic, diff) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setModeHandoffTopic(topic || '');
            if (diff) setModeHandoffDifficulty(diff);
            setActiveMode('PRACTICE');
          }}
          onLaunchQuizGeneratorForTopic={(courseCode, topic, diff) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setModeHandoffTopic(topic || '');
            if (diff) setModeHandoffDifficulty(diff);
            setActiveMode('QUIZ');
          }}
          onAskTutorInChat={(prompt, courseCode) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setActiveMode('CHAT');
            handleSend(prompt);
          }}
        />
      ) : activeMode === 'FLASHCARDS' ? (
        <AIFlashcardsWorkspace
          profile={profile}
          courses={courses}
          selectedCourseContext={selectedCourseContext}
          onSelectCourseContext={setSelectedCourseContext}
          languagePreference={languagePreference}
          initialTopic={modeHandoffTopic || undefined}
          initialDifficulty={modeHandoffDifficulty}
          onOpenMaterialSource={onOpenMaterialViewer}
          onLaunchStudyModeForTopic={(courseCode, topic, diff) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setModeHandoffTopic(topic || '');
            if (diff) setModeHandoffDifficulty(diff);
            setActiveMode('STUDY');
          }}
          onLaunchPracticeModeForTopic={(courseCode, topic, diff) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setModeHandoffTopic(topic || '');
            if (diff) setModeHandoffDifficulty(diff);
            setActiveMode('PRACTICE');
          }}
          onLaunchQuizGeneratorForTopic={(courseCode, topic, diff) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setModeHandoffTopic(topic || '');
            if (diff) setModeHandoffDifficulty(diff);
            setActiveMode('QUIZ');
          }}
          onAskTutorInChat={(prompt, courseCode) => {
            if (courseCode && courseCode !== 'All Courses') {
              setSelectedCourseContext(courseCode);
            }
            setActiveMode('CHAT');
            handleSend(prompt);
          }}
        />
      ) : (
        <>
          {/* Main White Conversation Stream */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleChatScroll}
            className="relative flex-1 overflow-y-auto px-3 sm:px-6 py-5 space-y-6"
          >
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {hiddenEarlierCount > 0 && !isLoadingChat && (
            <div className="flex justify-center pb-1">
              <button
                type="button"
                onClick={() => setVisibleMessageLimit((prev) => prev + 30)}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              >
                Show {Math.min(30, hiddenEarlierCount)} earlier{' '}
                {Math.min(30, hiddenEarlierCount) === 1 ? 'message' : 'messages'}
              </button>
            </div>
          )}

          {isLoadingChat ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span className="text-xs font-medium">Loading conversation...</span>
            </div>
          ) : (
            renderedMessages.map((msg, renderedIdx) => {
              const isStreamingThisMsg = Boolean(streamingMsg && msg.id === streamingMsg.id);
              const actualMsgIdx = hiddenEarlierCount + renderedIdx;
              const isUser = msg.sender === 'user';
              const regenQuery = !isUser ? findQueryForAssistantMessage(actualMsgIdx, msg) : '';

              if (isUser) {
                /* 4. USER MESSAGE: Clean, minimal conversational layout without loud colored bubbles */
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="max-w-[88%] sm:max-w-[78%] rounded-2xl bg-slate-100/90 text-slate-900 px-4 py-2.5 text-[14px] sm:text-[15px] leading-relaxed">
                      {msg.imageUrl && (
                        <div className="mb-2.5 relative group rounded-xl overflow-hidden border border-slate-200 max-w-xs bg-white">
                          <img
                            src={msg.imageUrl}
                            alt="Uploaded question"
                            className="max-h-56 w-full object-contain cursor-pointer"
                            onClick={() => setExpandedImage(msg.imageUrl || null)}
                          />
                          <button
                            type="button"
                            onClick={() => setExpandedImage(msg.imageUrl || null)}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/75 hover:bg-slate-900 text-white text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Expand photo"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words">
                        <MathRenderer content={msg.text} variant="light" />
                      </div>
                    </div>
                  </div>
                );
              }

              /* 5. AI RESPONSE: Document-like academic formatting directly on the white canvas */
              return (
                <article
                  key={msg.id}
                  className="w-full pb-5 border-b border-slate-100 last:border-b-0"
                >
                  {/* Subtle Assistant Kicker */}
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">VENUE Tutor</span>
                    {msg.courseContext && msg.courseContext !== 'All Courses' && (
                      <>
                        <span>·</span>
                        <span className="font-medium text-slate-600">{msg.courseContext}</span>
                      </>
                    )}
                    {msg.detectedLanguage && (
                      <>
                        <span>·</span>
                        <span>{msg.detectedLanguage}</span>
                      </>
                    )}
                  </div>

                  {/* Generated Image Result */}
                  {msg.isImageGeneration && msg.generatedImageUrl && (
                    <div className="my-3">
                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-lg">
                        <img
                          src={msg.generatedImageUrl}
                          alt={msg.imageGenPrompt || 'AI generated illustration'}
                          className="w-full max-h-80 object-contain cursor-pointer"
                          onClick={() => setExpandedImage(msg.generatedImageUrl || null)}
                        />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <a
                            href={msg.generatedImageUrl}
                            download={`venue_illustration_${Date.now()}.png`}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 text-xs border border-slate-200 shadow-xs transition-colors"
                            title="Download illustration"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setExpandedImage(msg.generatedImageUrl || null)}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 text-xs border border-slate-200 shadow-xs transition-colors cursor-pointer"
                            title="Expand view"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Generation Unavailable Notice */}
                  {msg.isImageGeneration && msg.imageGenStatus === 'unavailable' && (
                    <div className="my-2.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-slate-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>Image Generation Unavailable</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Direct image generation is unavailable on the current API tier. Mathematical derivations, LaTeX equations, and interactive plots remain active.
                      </p>
                    </div>
                  )}

                  {/* Error State (Strictly ONLY for true Stage A generation failures — Section 2 & 16) */}
                  {msg.isError && !isLegacyFormattingFalseError(msg.text) ? (
                    <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 text-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-red-700 font-semibold text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Unable to complete response</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{msg.text}</p>
                      {regenQuery && (
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSend(regenQuery, msg.id)}
                            disabled={isTyping}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditQuery(regenQuery)}
                            disabled={isTyping}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit question</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : msg.isError && isLegacyFormattingFalseError(msg.text) ? (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>Previous response needed regeneration</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        This earlier message from history was affected by a legacy formatting issue. Tap Regenerate below to view the full formatted answer.
                      </p>
                      {regenQuery && (
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSend(regenQuery, msg.id)}
                            disabled={isTyping}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Regenerate Answer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Standard Document-Grade Academic Explanation (Stage 10P Fault-Tolerant Pipeline) */
                    <div className="space-y-4">
                      <SafeRenderErrorBoundary
                        messageId={msg.id}
                        stage="message_container"
                        rawFallbackText={msg.text}
                      >
                        <MathRenderer content={msg.text} variant="light" messageId={msg.id} />
                      </SafeRenderErrorBoundary>

                      {/* Key Display Equation / Theorem (Only shown when not already duplicated inside msg.text) */}
                      {msg.formula &&
                        !msg.text.includes(msg.formula.trim()) && (
                          <SafeRenderErrorBoundary
                            messageId={msg.id}
                            stage="katex_render"
                            rawFallbackText={msg.formula}
                          >
                            <div className="my-3.5 py-2.5 px-4 border-l-2 border-blue-600 bg-slate-50/50 overflow-x-auto">
                              <MathBlock formula={msg.formula} variant="light" messageId={msg.id} />
                            </div>
                          </SafeRenderErrorBoundary>
                        )}

                      {/* Interactive Function / Statistical Plot */}
                      {msg.chart && (
                        <SafeRenderErrorBoundary messageId={msg.id} stage="chart_render">
                          <AIChartViewer chart={msg.chart} forceLight={true} />
                        </SafeRenderErrorBoundary>
                      )}

                      {/* Geometric / Vector / Conceptual SVG Diagram */}
                      {msg.diagramSvg && sanitizeDiagramSvg(msg.diagramSvg) && (
                        <SafeRenderErrorBoundary messageId={msg.id} stage="diagram_render">
                          <div className="my-4 py-3.5 px-3 rounded-xl bg-slate-50/70 border border-slate-200/80 text-center overflow-x-auto">
                            <div
                              className="inline-block w-full max-w-xl"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeDiagramSvg(msg.diagramSvg) || '',
                              }}
                            />
                          </div>
                        </SafeRenderErrorBoundary>
                      )}

                      {/* Step-by-Step Mathematical Solution */}
                      {msg.steps && msg.steps.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-slate-200/70 space-y-3">
                          <h4 className="text-sm font-bold text-slate-900">
                            Step-by-Step Solution
                          </h4>
                          <ol className="space-y-3 pl-0">
                            {msg.steps.map((step, idx) => {
                              const rawStepStr = String(step || '');
                              const cleanedStep = rawStepStr
                                .replace(/^\s*(?:\*\*?)?Step\s+\d+\s*[:.)\-]?(?:\*\*?)?\s*/i, '')
                                .trim();
                              return (
                                <li
                                  key={idx}
                                  className="flex items-start gap-3 text-[14px] sm:text-[15px] text-slate-800 leading-[1.7]"
                                >
                                  <span className="font-semibold text-slate-900 text-xs sm:text-sm shrink-0 mt-0.5 select-none tabular-nums">
                                    Step {idx + 1}:
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <SafeRenderErrorBoundary
                                      messageId={`${msg.id}_step_${idx}`}
                                      stage="markdown_parse"
                                      rawFallbackText={cleanedStep || rawStepStr}
                                    >
                                      <MathRenderer
                                        content={cleanedStep || rawStepStr}
                                        variant="light"
                                        messageId={`${msg.id}_step_${idx}`}
                                      />
                                    </SafeRenderErrorBoundary>
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      )}

                      {/* Stage 10B, 10C, 10D, 10E & 10P: Sources from VENUE Course Materials (Strictly shown ONLY when this specific response is grounded in valid retrieved VENUE materials) */}
                      {msg.groundedInMaterials === true &&
                        filterValidCitations(msg.referencedMaterials, msg.id).length > 0 && (
                          <SafeRenderErrorBoundary messageId={msg.id} stage="citation_render">
                            <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1.5">
                              <div className="text-xs font-semibold text-slate-700">Sources</div>
                              <ul className="space-y-1">
                                {filterValidCitations(msg.referencedMaterials, msg.id).map(
                                  (src, sIdx) => {
                                    const validPages = Array.isArray(src.pageReferences)
                                      ? src.pageReferences.filter(
                                          (p) =>
                                            typeof p === 'number' && Number.isFinite(p) && p > 0
                                        )
                                      : [];
                                    const firstPage =
                                      validPages.length > 0 ? validPages[0] : undefined;
                                    const uploaderLabel =
                                      src.uploaderRole === 'lecturer' && src.uploaderName
                                        ? ` · ${src.uploaderName}`
                                        : '';
                                    const isClickable =
                                      Boolean(onOpenMaterialViewer) &&
                                      Boolean(src.materialId) &&
                                      !src.materialId.startsWith('cm_');

                                    return (
                                      <li
                                        key={`${src.materialId}_${sIdx}`}
                                        className="text-xs text-slate-600 flex items-center gap-1.5 leading-snug"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="flex flex-wrap items-center gap-x-1">
                                          {isClickable ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleOpenCitedSource(src.materialId, firstPage)
                                              }
                                              className="text-left hover:text-blue-600 hover:underline underline-offset-2 transition-colors cursor-pointer font-medium text-slate-800"
                                              title={
                                                firstPage
                                                  ? `Open ${src.title} at page ${firstPage}`
                                                  : `Open ${src.title} in VENUE Reader`
                                              }
                                            >
                                              {src.courseCode} — {src.title}
                                            </button>
                                          ) : (
                                            <span className="font-medium text-slate-800">
                                              {src.courseCode} — {src.title}
                                            </span>
                                          )}

                                          {validPages.length === 1 &&
                                            (isClickable ? (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleOpenCitedSource(
                                                    src.materialId,
                                                    validPages[0]
                                                  )
                                                }
                                                className="text-slate-600 hover:text-blue-600 hover:underline underline-offset-2 cursor-pointer font-normal"
                                                title={`Open page ${validPages[0]}`}
                                              >
                                                , p. {validPages[0]}
                                              </button>
                                            ) : (
                                              <span className="text-slate-600 font-normal">
                                                , p. {validPages[0]}
                                              </span>
                                            ))}

                                          {validPages.length > 1 && (
                                            <span className="text-slate-600 font-normal">
                                              , pp.{' '}
                                              {validPages.map((pNum, pIdx) => (
                                                <React.Fragment key={pNum}>
                                                  {pIdx > 0 && ', '}
                                                  {isClickable ? (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleOpenCitedSource(src.materialId, pNum)
                                                      }
                                                      className="hover:text-blue-600 hover:underline underline-offset-2 cursor-pointer"
                                                      title={`Open page ${pNum}`}
                                                    >
                                                      {pNum}
                                                    </button>
                                                  ) : (
                                                    <span>{pNum}</span>
                                                  )}
                                                </React.Fragment>
                                              ))}
                                            </span>
                                          )}

                                          {uploaderLabel && (
                                            <span className="text-slate-500">{uploaderLabel}</span>
                                          )}
                                        </span>
                                      </li>
                                    );
                                  }
                                )}
                              </ul>
                            </div>
                          </SafeRenderErrorBoundary>
                        )}

                      {/* Subtle AI Response Action Bar (Copy, Read Aloud & Regenerate) */}
                      {msg.id !== 'msg-init' && !isStreamingThisMsg && (
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                          {msg.text !== '_Generation stopped by user._' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, msg)}
                                className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer py-1"
                                title="Copy response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 font-medium">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <AIReadAloudControl
                                messageId={msg.id}
                                text={msg.text}
                                formula={msg.formula}
                                steps={msg.steps}
                                languagePreference={msg.detectedLanguage || languagePreference}
                              />
                            </>
                          )}

                          {regenQuery && (
                            <button
                              type="button"
                              onClick={() => handleSend(regenQuery, msg.id)}
                              disabled={isTyping}
                              className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer py-1 disabled:opacity-40"
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Follow-up Question Prompts & Stage 10G Learning-First Homework Actions */}
                      {(activeMode === 'HOMEWORK'
                        ? msg.id !== 'msg-init'
                        : Boolean(msg.suggestions && msg.suggestions.length > 0)) && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {activeMode === 'HOMEWORK'
                              ? 'Homework learning actions & follow-ups'
                              : 'Suggested follow-ups'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeMode === 'HOMEWORK' && msg.id !== 'msg-init'
                              ? Array.from(
                                  new Set([
                                    ...HOMEWORK_FOLLOWUP_ACTIONS.slice(0, 4),
                                    ...(msg.suggestions || []).slice(0, 2),
                                  ])
                                )
                              : msg.suggestions || []
                            ).map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSend(sug)}
                                disabled={isTyping}
                                className="text-xs text-left px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}

          {/* 13. Subtle, Calm AI Generation Indicator (No huge spinners or flashing skeletons) */}
          {isTyping && (
            <div className="py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:300ms]" />
                </span>
                <span className="font-medium text-slate-600">Generating explanation...</span>
              </div>

              <button
                type="button"
                onClick={handleCancelThinking}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Stop generating"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll-to-Bottom Button when user has scrolled up in a long conversation */}
        {showScrollToBottom && (
          <div className="sticky bottom-3 left-0 right-0 flex justify-center pointer-events-none z-10">
            <button
              id="ai-tutor-scroll-bottom-btn"
              type="button"
              onClick={() => scrollToBottom('smooth', true)}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-md text-xs font-medium transition-all cursor-pointer"
              title="Scroll to latest message"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Latest</span>
            </button>
          </div>
        )}
      </div>

      {/* 12. Premium Bottom Message Composer */}
      <div className="bg-white border-t border-slate-200/80 px-3 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto w-full">
          {/* Image Upload Validation Error */}
          {imageUploadError && (
            <div className="mb-2.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{imageUploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setImageUploadError(null)}
                className="p-1 text-red-500 hover:text-red-800 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Selected Image Attachment Preview & Quick Instruction Chips */}
          {selectedImage && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              {selectedImage.qualityWarning && (
                <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{selectedImage.qualityWarning}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={selectedImage.dataUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer bg-white"
                    onClick={() => setExpandedImage(selectedImage.dataUrl)}
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {selectedImage.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedImage.size} · Tap image to inspect before sending
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleRotateSelectedImage}
                    className="px-2 py-1 rounded-lg hover:bg-slate-200/70 text-slate-600 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Rotate image 90°"
                    aria-label="Rotate image 90 degrees"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Rotate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 rounded-lg hover:bg-slate-200/70 text-slate-600 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Replace image from gallery"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-2 py-1 rounded-lg hover:bg-slate-200/70 text-slate-600 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Retake photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Optional Quick Instruction Chips when an image is attached */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {HOMEWORK_INITIAL_PROMPTS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    disabled={isTyping}
                    onClick={() => handleSend(chip)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Homework Mode Quick Prompt Chips (when in Homework Mode without an image attached yet) */}
          {activeMode === 'HOMEWORK' && !selectedImage && (
            <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {HOMEWORK_INITIAL_PROMPTS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={isTyping}
                  onClick={() => {
                    if (inputQuery.trim()) {
                      handleSend(`${chip}: ${inputQuery.trim()}`);
                    } else {
                      setInputQuery(`${chip}: `);
                      inputRef.current?.focus();
                    }
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/90 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Hidden File Inputs */}
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

          {/* Voice Input Status Banner (Stage 10N) */}
          <AIVoiceStatusBanner
            state={voiceInputStatus.state}
            notice={voiceInputStatus.notice}
            isError={voiceInputStatus.isError}
            onStopListening={() => {
              aiVoiceTutorService.stopListening();
              setVoiceInputStatus({
                state: 'ready',
                interimText: '',
                notice: null,
                isError: false,
              });
            }}
            onDismiss={() =>
              setVoiceInputStatus({
                state: 'ready',
                interimText: '',
                notice: null,
                isError: false,
              })
            }
          />

          {/* Composer Container */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              aiVoiceTutorService.stopListening();
              setVoiceInputStatus({
                state: 'ready',
                interimText: '',
                notice: null,
                isError: false,
              });
              handleSend();
            }}
            className="flex items-end gap-1.5 sm:gap-2 rounded-2xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-400 px-2.5 py-2 transition-colors shadow-2xs"
          >
            {/* Camera Button */}
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
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px]"
              title="Photograph question or notes"
              aria-label="Open Camera"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Upload Image Button */}
            <button
              id="ai-tutor-upload-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40 transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px]"
              title="Upload image or diagram"
              aria-label="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Voice Input Microphone Button (Stage 10N) */}
            <AIVoiceMicButton
              languagePreference={languagePreference}
              disabled={isTyping}
              currentText={inputQuery}
              onUpdateText={(text) => {
                setInputQuery(text);
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.style.height = 'auto';
                    inputRef.current.style.height = `${Math.min(
                      inputRef.current.scrollHeight,
                      140
                    )}px`;
                  }
                }, 10);
              }}
              onFocusInput={() => inputRef.current?.focus()}
              onVoiceStatusUpdate={(st) => setVoiceInputStatus(st)}
            />

            {/* Auto-expanding Textarea */}
            <textarea
              ref={inputRef}
              id="ai-tutor-prompt-input"
              rows={1}
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isTyping}
              placeholder={
                selectedImage
                  ? 'Add optional instructions (e.g., "Solve step by step", "Give me a hint first")...'
                  : activeMode === 'HOMEWORK'
                  ? 'Upload a photo of your question or type/paste your homework problem here...'
                  : selectedCourseContext === 'All Courses'
                  ? 'Ask a question, solve an equation, or explain a concept...'
                  : `Ask about ${selectedCourseContext}...`
              }
              className="flex-1 py-1.5 px-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm leading-relaxed focus:outline-none resize-none max-h-36 min-w-0"
            />

            {/* Send / Stop Button */}
            {isTyping ? (
              <button
                id="ai-tutor-cancel-btn"
                type="button"
                onClick={handleCancelThinking}
                className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px]"
                title="Stop generating"
                aria-label="Stop generating"
              >
                <XCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="ai-tutor-send-btn"
                type="submit"
                disabled={!isSendReady}
                className={`p-2 rounded-xl transition-all shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px] ${
                  isSendReady
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-2xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                aria-label="Send message"
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
        </>
      )}

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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedImage}
              alt="Full resolution preview"
              className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Slide-Over Chat History Drawer */}
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

      {/* Personalized Learning Memory Panel (Stage 10M) */}
      {isMemoryPanelOpen && (
        <AIPersonalizedMemoryPanel
          studentId={effectiveUserId}
          selectedCourseCode={selectedCourseContext}
          authorizedCourses={courses.map((c) => ({ code: c.code, title: c.title }))}
          onClose={() => setIsMemoryPanelOpen(false)}
          onActionSelect={(act) => {
            if (act.courseCode && act.courseCode !== 'All Courses') {
              setSelectedCourseContext(act.courseCode);
            }
            if (act.type === 'practice') {
              setStudyHandoffTopic(act.topic);
              setActiveMode('PRACTICE');
            } else if (act.type === 'study_mode') {
              setStudyHandoffTopic(act.topic);
              setActiveMode('STUDY');
            } else if (act.type === 'quiz') {
              setStudyHandoffTopic(act.topic);
              setActiveMode('QUIZ');
            } else if (act.type === 'flashcards') {
              setStudyHandoffTopic(act.topic);
              setActiveMode('FLASHCARDS');
            } else if (act.type === 'exam_prep') {
              setActiveMode('EXAM_PREP');
            }
          }}
        />
      )}
    </div>
  );
};
