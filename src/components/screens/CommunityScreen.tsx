import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Send,
  X,
  Search,
  Bookmark,
  Flag,
  Trash2,
  Edit2,
  Share2,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  Flame,
  Clock,
  Image as ImageIcon,
  MessageCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CornerDownRight,
  Check,
  Sparkles,
  Megaphone,
  Settings,
  Reply,
  ShieldOff,
  Lock,
  Paperclip,
  Mic,
  Pin,
  Volume2,
  VolumeX,
  CornerUpRight,
  AtSign,
  FileText,
  BarChart2,
  Calendar,
  Award,
  Link2,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import {
  StudentProfile,
  Course,
  CommunityPost,
  CommunitySpace,
  RealCommunityPost,
  RealCommunityComment,
  CommunityPostCategory,
  CommunityPostType,
  CommunityReportCategory,
  RealChatConversation,
  RealChatMessage,
  ChatParticipantInfo,
  LecturerCourseAnnouncement,
  LecturerRecord,
  LecturerCourseAssignment,
  AnnouncementRecord,
  UserPresenceRecord,
  CommunityEventRsvpStatus,
  CommunityStudyGroupRecord,
  StudyGroupVisibility,
  CommunitySavedItemRecord,
  UserCommunityPrivacySettings,
} from '../../types';
import {
  communityService,
  buildAuthorizedCommunities,
  SUPPORTED_REACTION_EMOJIS,
} from '../../services/communityService';
import { announcementsService } from '../../services/announcementsService';
import { auth, isVerifiedOwnerAccount } from '../../services/firebase';
import {
  CourseAnnouncementPanel,
  OfficialAnnouncementsTab,
} from '../community/CourseAndOfficialAnnouncements';
import {
  CreatePrivateGroupModal,
  ManagePrivateGroupModal,
} from '../community/PrivateGroupModals';
import {
  VoiceNotePlayer,
  VoiceNoteRecorderBar,
  ChatFileAttachmentCard,
  ChatLinkPreviewCard,
  ImageLightboxModal,
  ForwardMessageModal,
  PinnedMessagesBar,
  formatFileSize,
} from '../community/ChatAdvancedMedia';
import {
  CommunityPollCard,
  CommunityEventCard,
  CommunityStudyGroupsPanel,
  CommunitySavedHubPanel,
} from '../community/CommunityInteractionCards';
import {
  VerifiedCommunityRoleBadge,
  SafetyReportModal,
  SafetyReportTarget,
  CommunitySafetyPrivacyModal,
  CommunityModerationQueuePanel,
} from '../community/CommunitySafetyModals';
import {
  CommunityAIAssistantModal,
  InlineAITranslationBlock,
} from '../community/CommunityAIAssistantModal';
import { HelpCircle } from 'lucide-react';

interface CommunityScreenProps {
  posts?: CommunityPost[];
  profile?: StudentProfile;
  courses?: Course[];
  onAddPost?: (post: CommunityPost) => void;
  onNavigateToProfile?: () => void;
}

type MainTab =
  | 'discussions'
  | 'announcements'
  | 'study_groups'
  | 'communities'
  | 'chat'
  | 'saved'
  | 'moderation';
type FeedSort = 'recent' | 'trending';
type CourseModeTab = 'discussion' | 'announcements';

const POST_CATEGORIES: CommunityPostCategory[] = [
  'Academic Discussion',
  'Question',
  'Study Group',
  'Exam Prep',
  'Resource Share',
  'Announcement',
];

const REPORT_CATEGORIES: CommunityReportCategory[] = [
  'Spam or misleading',
  'Harassment or abusive behavior',
  'Academic dishonesty / exam leak',
  'Off-topic or inappropriate content',
  'Other',
];

function formatRelativeTime(isoDate?: string | null): string {
  if (!isoDate) return 'Just now';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  profile,
  courses = [],
  onNavigateToProfile,
}) => {
  const currentUserUid = auth.currentUser?.uid || profile?.uid || '';
  const isAdminOrOwner = isVerifiedOwnerAccount(currentUserUid, profile?.email);

  // Authenticated Lecturer Context (for Lecturer Course Announcement Channels)
  const [lecturerRecord, setLecturerRecord] = useState<LecturerRecord | null>(null);
  const [lecturerAssignments, setLecturerAssignments] = useState<LecturerCourseAssignment[]>([]);

  useEffect(() => {
    if (!currentUserUid) return;
    let isMounted = true;
    communityService.getAuthenticatedLecturerContext(currentUserUid).then((ctx) => {
      if (!isMounted) return;
      setLecturerRecord(ctx.lecturer);
      setLecturerAssignments(ctx.assignments);
    });
    return () => {
      isMounted = false;
    };
  }, [currentUserUid]);

  // Build authorized communities strictly from the student's real academic placement, enrolled courses, and lecturer assignments
  const authorizedCommunities = useMemo(
    () => buildAuthorizedCommunities(profile, courses, lecturerAssignments),
    [profile, courses, lecturerAssignments]
  );

  const authorizedCommunityIds = useMemo(
    () => authorizedCommunities.map((c) => c.communityId),
    [authorizedCommunities]
  );

  const courseSpaces = useMemo(
    () => authorizedCommunities.filter((c) => c.communityType === 'course'),
    [authorizedCommunities]
  );

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<MainTab>('discussions');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('all');
  const [courseModeTab, setCourseModeTab] = useState<CourseModeTab>('discussion');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [feedSort, setFeedSort] = useState<FeedSort>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real Firestore Posts State
  const [posts, setPosts] = useState<RealCommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Lecturer Announcements & Official Announcements State
  const [lecturerAnnouncements, setLecturerAnnouncements] = useState<LecturerCourseAnnouncement[]>(
    []
  );
  const [officialAnnouncements, setOfficialAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loadingOfficialAnnouncements, setLoadingOfficialAnnouncements] = useState<boolean>(false);
  const [assignedLecturersByCourse, setAssignedLecturersByCourse] = useState<
    Record<
      string,
      Array<{ lecturerId: string; userId?: string; name: string; title?: string; email?: string }>
    >
  >({});

  // User's Liked, Reacted, Acknowledged, Bookmarked & Blocked IDs + Read States + Stage 11C-D Polls, RSVPs, Saved Items, Study Groups
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [userReactionsMap, setUserReactionsMap] = useState<Record<string, string>>({});
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<CommunitySavedItemRecord[]>([]);
  const [userPollVotesMap, setUserPollVotesMap] = useState<Record<string, string[]>>({});
  const [userEventRsvpsMap, setUserEventRsvpsMap] = useState<
    Record<string, CommunityEventRsvpStatus>
  >({});
  const [studyGroups, setStudyGroups] = useState<CommunityStudyGroupRecord[]>([]);
  const [loadingStudyGroups, setLoadingStudyGroups] = useState<boolean>(false);
  const [blockedUids, setBlockedUids] = useState<Set<string>>(new Set());
  const [mutedUserUids, setMutedUserUids] = useState<Set<string>>(new Set());
  const [mutedCommunityIds, setMutedCommunityIds] = useState<Set<string>>(new Set());
  const [safetyPrivacyModalOpen, setSafetyPrivacyModalOpen] = useState<boolean>(false);
  const [communityReadStates, setCommunityReadStates] = useState<Record<string, string>>({});
  const [selectedPostTypeFilter, setSelectedPostTypeFilter] = useState<string>('ALL');

  // Stage 11C-F: Community AI Intelligence Modal State
  const [aiAssistantModalState, setAiAssistantModalState] = useState<{
    isOpen: boolean;
    communitySpace?: CommunitySpace | null;
    action?:
      | 'ask'
      | 'summarize_discussion'
      | 'find_unanswered'
      | 'summarize_announcements'
      | 'explain_item';
    targetItem?: {
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
  }>({
    isOpen: false,
    communitySpace: null,
    action: 'ask',
    targetItem: null,
    initialPrompt: '',
  });

  // Expanded Post & Comments State
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, RealCommunityComment[]>>({});
  const [loadingCommentsFor, setLoadingCommentsFor] = useState<string | null>(null);
  const [commentInputByPost, setCommentInputByPost] = useState<Record<string, string>>({});
  const [replyingToComment, setReplyingToComment] = useState<{
    postId: string;
    commentId: string;
    authorName: string;
  } | null>(null);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // Create / Edit Rich Post Modal State (TEXT, QUESTION, IMAGE, FILE, LINK, POLL, EVENT)
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<RealCommunityPost | null>(null);
  const [formCommunityId, setFormCommunityId] = useState<string>('');
  const [formPostType, setFormPostType] = useState<CommunityPostType>('QUESTION');
  const [formCategory, setFormCategory] = useState<CommunityPostCategory>('Question');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [uploadingPostImage, setUploadingPostImage] = useState<boolean>(false);
  const [formFileAttachment, setFormFileAttachment] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
  } | null>(null);
  const [uploadingPostFile, setUploadingPostFile] = useState<boolean>(false);
  const [formExternalLink, setFormExternalLink] = useState<string>('');
  const [formLinkUrl, setFormLinkUrl] = useState<string>('');
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollMultipleChoice, setPollMultipleChoice] = useState<boolean>(false);
  const [pollClosesAt, setPollClosesAt] = useState<string>('');
  const [pollResultsVisibleBeforeVote, setPollResultsVisibleBeforeVote] = useState<boolean>(true);
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('16:00');
  const [eventEndTime, setEventEndTime] = useState<string>('18:00');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [eventOnlineLink, setEventOnlineLink] = useState<string>('');
  const [submittingPost, setSubmittingPost] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const postImageInputRef = useRef<HTMLInputElement | null>(null);
  const postFileInputRef = useRef<HTMLInputElement | null>(null);

  // Stage 11C-E Universal Safety Report Target
  const [reportTarget, setReportTarget] = useState<SafetyReportTarget | null>(null);

  // Delete Confirmation Modal State
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState<boolean>(false);

  // Toast / Copy Feedback
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real In-App Chat State (1-to-1 Direct, Community Group Chats & Private Group Chats)
  const [conversations, setConversations] = useState<RealChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<RealChatConversation | null>(null);
  const [chatMessages, setChatMessages] = useState<RealChatMessage[]>([]);
  const [loadingChatMessages, setLoadingChatMessages] = useState<boolean>(false);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [chatImageUrl, setChatImageUrl] = useState<string>('');
  const [uploadingChatImage, setUploadingChatImage] = useState<boolean>(false);
  const [chatFileAttachment, setChatFileAttachment] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
  } | null>(null);
  const [uploadingChatFile, setUploadingChatFile] = useState<boolean>(false);
  const [recordingVoiceMode, setRecordingVoiceMode] = useState<boolean>(false);
  const [sendingVoiceNote, setSendingVoiceNote] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [startingChat, setStartingChat] = useState<boolean>(false);
  const [replyingToMessage, setReplyingToMessage] = useState<{
    messageId: string;
    senderName: string;
    excerpt: string;
  } | null>(null);
  const [editingChatMessage, setEditingChatMessage] = useState<{
    messageId: string;
    text: string;
  } | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [activeReactionPickerMessageId, setActiveReactionPickerMessageId] = useState<string | null>(
    null
  );
  const [forwardingMessage, setForwardingMessage] = useState<RealChatMessage | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    imageUrl: string;
    caption?: string | null;
    senderName?: string | null;
  } | null>(null);
  const [chatSearchOpen, setChatSearchOpen] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<Array<{ uid: string; name: string }>>([]);
  const [peerPresence, setPeerPresence] = useState<UserPresenceRecord | null>(null);
  const [mutedConversationIds, setMutedConversationIds] = useState<Set<string>>(new Set());
  const [mentionPickerOpen, setMentionPickerOpen] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');
  const [selectedMentions, setSelectedMentions] = useState<
    Array<{ uid: string; name: string }>
  >([]);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState<boolean>(false);
  const [manageGroupModalOpen, setManageGroupModalOpen] = useState<boolean>(false);

  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatImageInputRef = useRef<HTMLInputElement | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement | null>(null);
  const messageItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastTypingBroadcastRef = useRef<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Initialize default community selection for post form
  useEffect(() => {
    if (!formCommunityId && authorizedCommunities.length > 0) {
      const progComm = authorizedCommunities.find((c) => c.communityType === 'programme');
      setFormCommunityId((progComm || authorizedCommunities[0]).communityId);
    }
  }, [authorizedCommunities, formCommunityId]);

  // Load user's likes, reactions, acknowledgements, bookmarks, blocked peers, muted conversations, read states, poll votes, event RSVPs, and saved items
  useEffect(() => {
    if (!currentUserUid) return;
    let isMounted = true;
    Promise.all([
      communityService.getUserLikedIds(currentUserUid),
      communityService.getUserReactionsMap(currentUserUid),
      communityService.getUserAcknowledgedIds(currentUserUid),
      communityService.getUserBookmarkedPostIds(currentUserUid),
      communityService.getBlockedUserUids(currentUserUid),
      communityService.getUserCommunityReadStates(currentUserUid),
      communityService.getMutedConversationIds(currentUserUid),
      communityService.getUserPollVotesMap(currentUserUid),
      communityService.getUserEventRsvpsMap(currentUserUid),
      communityService.getUserSavedItems(currentUserUid),
      communityService.getMutedUserUids(currentUserUid),
      communityService.getMutedCommunityIds(currentUserUid),
    ]).then(
      ([
        likes,
        reactions,
        acks,
        bookmarks,
        blocked,
        readStates,
        mutedIds,
        pollVotes,
        eventRsvps,
        loadedSavedItems,
        mutedUsers,
        mutedComms,
      ]) => {
        if (!isMounted) return;
        setLikedIds(likes);
        setUserReactionsMap(reactions);
        setAcknowledgedIds(acks);
        setBookmarkedPostIds(bookmarks);
        setBlockedUids(blocked);
        setCommunityReadStates(readStates);
        setMutedConversationIds(mutedIds);
        setUserPollVotesMap(pollVotes);
        setUserEventRsvpsMap(eventRsvps);
        setSavedItems(loadedSavedItems);
        setMutedUserUids(mutedUsers);
        setMutedCommunityIds(mutedComms);
      }
    );
    return () => {
      isMounted = false;
    };
  }, [currentUserUid]);

  // Subscribe to discoverable Course & Programme Study Groups
  useEffect(() => {
    if (!currentUserUid || authorizedCommunities.length === 0) {
      setStudyGroups([]);
      return;
    }
    const uniSpace = authorizedCommunities.find((c) => c.communityType === 'university');
    const unsub = communityService.subscribeToStudyGroups(
      {
        universityId: uniSpace?.universityId,
        communityId: selectedCommunityId !== 'all' ? selectedCommunityId : undefined,
        authorizedCommunityIds,
        currentUserUid,
      },
      (liveGroups) => {
        setStudyGroups(liveGroups);
      }
    );
    return () => unsub();
  }, [currentUserUid, selectedCommunityId, authorizedCommunities, authorizedCommunityIds]);

  // Publish real presence heartbeat while Community is active
  useEffect(() => {
    if (!currentUserUid) return;
    const displayName =
      lecturerRecord?.name || profile?.name || auth.currentUser?.displayName || 'Student';
    communityService.updateUserPresence(displayName, true);
    const interval = window.setInterval(() => {
      communityService.updateUserPresence(displayName, true);
    }, 60_000);
    return () => {
      window.clearInterval(interval);
    };
  }, [currentUserUid, lecturerRecord?.name, profile?.name]);

  // Mark community visited when selected
  useEffect(() => {
    if (!currentUserUid || !selectedCommunityId || selectedCommunityId === 'all') return;
    const nowIso = new Date().toISOString();
    setCommunityReadStates((prev) => ({ ...prev, [selectedCommunityId]: nowIso }));
    communityService.markCommunityVisited(selectedCommunityId);
  }, [currentUserUid, selectedCommunityId]);

  // Resolve assigned lecturers when a Course Community is selected
  const activeSpace =
    selectedCommunityId === 'all'
      ? null
      : authorizedCommunities.find((c) => c.communityId === selectedCommunityId) || null;

  useEffect(() => {
    if (!activeSpace || activeSpace.communityType !== 'course') return;
    const code = (activeSpace.courseCode || activeSpace.shortLabel || '').toUpperCase();
    const cId = activeSpace.courseId || code;
    if (!code || assignedLecturersByCourse[code]) return;

    let isMounted = true;
    communityService.getAssignedLecturersForCourse(cId, code).then((list) => {
      if (!isMounted) return;
      setAssignedLecturersByCourse((prev) => ({ ...prev, [code]: list }));
    });
    return () => {
      isMounted = false;
    };
  }, [activeSpace, assignedLecturersByCourse]);

  // Subscribe to real Firestore posts for the user's authorized communities
  useEffect(() => {
    if (!currentUserUid || authorizedCommunities.length === 0) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    setPostsError(null);

    const uniSpace = authorizedCommunities.find((c) => c.communityType === 'university');
    const unsubscribe = communityService.subscribeToPosts(
      {
        communityId: selectedCommunityId !== 'all' ? selectedCommunityId : undefined,
        authorizedCommunityIds,
        universityId: uniSpace?.universityId,
        limitCount: 50,
      },
      (livePosts) => {
        setPosts(livePosts);
        setLoadingPosts(false);
      },
      (err) => {
        console.warn('Community posts subscription warning:', err);
        setPostsError('Unable to load live discussions right now. Please check your connection.');
        setLoadingPosts(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserUid, selectedCommunityId, authorizedCommunities, authorizedCommunityIds]);

  // Subscribe to Lecturer Course Announcements for the student's enrolled/assigned courses
  useEffect(() => {
    if (!currentUserUid || courseSpaces.length === 0) {
      setLecturerAnnouncements([]);
      return;
    }

    const courseCodes = courseSpaces
      .map((cs) => (cs.courseCode || cs.shortLabel || '').toUpperCase())
      .filter(Boolean);
    const uniSpace = authorizedCommunities.find((c) => c.communityType === 'university');

    const unsub = communityService.subscribeToLecturerCourseAnnouncements(
      {
        courseCodes,
        universityId: uniSpace?.universityId,
        limitCount: 40,
      },
      (items) => {
        setLecturerAnnouncements(items);
      }
    );

    return () => unsub();
  }, [currentUserUid, courseSpaces, authorizedCommunities]);

  // Load Official Institutional Announcements (University / College / Department)
  useEffect(() => {
    if (!currentUserUid) return;
    let isMounted = true;
    setLoadingOfficialAnnouncements(true);
    announcementsService
      .getStudentAnnouncements(profile, currentUserUid)
      .then((list) => {
        if (!isMounted) return;
        setOfficialAnnouncements(list);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingOfficialAnnouncements(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentUserUid, profile?.universityId, profile?.academicUnitId, profile?.programmeId]);

  // Subscribe to user's real chat conversations
  useEffect(() => {
    if (!currentUserUid) {
      setConversations([]);
      return;
    }

    const unsubscribe = communityService.subscribeToUserConversations(
      currentUserUid,
      (liveConvs) => {
        setConversations(liveConvs);
        if (activeConversation) {
          const updatedActive = liveConvs.find(
            (c) => c.conversationId === activeConversation.conversationId
          );
          if (updatedActive) {
            setActiveConversation(updatedActive);
          }
        }
      },
      (err) => {
        console.warn('Chat conversations subscription warning:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserUid, activeConversation?.conversationId]);

  // Subscribe to messages, typing indicators, and peer presence when a conversation is open
  useEffect(() => {
    if (!activeConversation?.conversationId) {
      setChatMessages([]);
      setTypingUsers([]);
      setPeerPresence(null);
      return;
    }

    setLoadingChatMessages(true);
    communityService.markConversationRead(activeConversation.conversationId);

    const unsubscribeMsgs = communityService.subscribeToConversationMessages(
      activeConversation.conversationId,
      80,
      (liveMsgs) => {
        setChatMessages(liveMsgs);
        setLoadingChatMessages(false);
        setTimeout(() => {
          chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      },
      (err) => {
        console.warn('Conversation messages subscription warning:', err);
        setLoadingChatMessages(false);
      }
    );

    const unsubscribeTyping = communityService.subscribeToConversationTyping(
      activeConversation.conversationId,
      currentUserUid,
      (activeTypers) => {
        setTypingUsers(activeTypers);
      }
    );

    let unsubscribePresence: (() => void) | null = null;
    if (activeConversation.type === 'direct') {
      const otherUid =
        (activeConversation.participantIds || []).find((id) => id !== currentUserUid) || '';
      if (otherUid) {
        unsubscribePresence = communityService.subscribeToUserPresence(otherUid, (pres) => {
          setPeerPresence(pres);
        });
      }
    } else {
      setPeerPresence(null);
    }

    return () => {
      unsubscribeMsgs();
      unsubscribeTyping();
      if (unsubscribePresence) unsubscribePresence();
    };
  }, [activeConversation?.conversationId, activeConversation?.type, currentUserUid]);

  // Derive known peers from discussions & conversations so users can invite real peers into Private Group Chats
  const knownPeers = useMemo(() => {
    const map = new Map<string, ChatParticipantInfo>();
    for (const p of posts) {
      if (p.authorUid && p.authorUid !== currentUserUid && !blockedUids.has(p.authorUid)) {
        map.set(p.authorUid, {
          uid: p.authorUid,
          name: p.authorName,
          photo: p.authorPhoto,
          roleLabel: p.authorRoleLabel,
          accountRole: p.authorRole,
        });
      }
    }
    for (const conv of conversations) {
      for (const [uid, info] of Object.entries(conv.participants || {})) {
        if (uid && uid !== currentUserUid && !blockedUids.has(uid)) {
          map.set(uid, info);
        }
      }
    }
    return Array.from(map.values());
  }, [posts, conversations, currentUserUid, blockedUids]);

  // Load comments lazily when a post is expanded
  const handleToggleExpandPost = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      setReplyingToComment(null);
      return;
    }
    setExpandedPostId(postId);
    setLoadingCommentsFor(postId);
    try {
      const loaded = await communityService.getPostComments(postId, 40);
      setCommentsByPost((prev) => ({ ...prev, [postId]: loaded }));
    } catch (err) {
      console.warn('Error loading post comments:', err);
    } finally {
      setLoadingCommentsFor(null);
    }
  };

  // Filtered & sorted posts (excluding blocked and muted users)
  const displayedPosts = useMemo(() => {
    let list = posts.filter(
      (p) => !blockedUids.has(p.authorUid) && !mutedUserUids.has(p.authorUid)
    );

    if (activeTab === 'saved') {
      list = list.filter((p) => bookmarkedPostIds.has(p.postId));
    }

    if (selectedCommunityId !== 'all') {
      list = list.filter((p) => p.communityId === selectedCommunityId);
    }

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedPostTypeFilter !== 'ALL') {
      list = list.filter((p) => {
        if (selectedPostTypeFilter === 'POLL') return Boolean(p.poll);
        if (selectedPostTypeFilter === 'EVENT') return Boolean(p.event);
        if (selectedPostTypeFilter === 'QUESTION') {
          return p.postType === 'QUESTION' || p.category === 'Question';
        }
        if (selectedPostTypeFilter === 'FILE') return Boolean(p.attachmentUrl || p.fileUrl);
        return p.postType === selectedPostTypeFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          (p.courseCode && p.courseCode.toLowerCase().includes(q)) ||
          (p.communityName && p.communityName.toLowerCase().includes(q)) ||
          (p.attachmentName && p.attachmentName.toLowerCase().includes(q))
      );
    }

    if (feedSort === 'trending') {
      list.sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        const scoreA = (a.likeCount || 0) * 2 + (a.commentCount || 0) * 3;
        const scoreB = (b.likeCount || 0) * 2 + (b.commentCount || 0) * 3;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    } else {
      list.sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
    }

    return list;
  }, [
    posts,
    blockedUids,
    mutedUserUids,
    activeTab,
    bookmarkedPostIds,
    selectedCommunityId,
    selectedCategory,
    selectedPostTypeFilter,
    searchQuery,
    feedSort,
  ]);

  // Open Create Post Modal
  const handleOpenCreateModal = (
    defaultCommunityId?: string,
    defaultPostType: CommunityPostType = 'QUESTION'
  ) => {
    setEditingPost(null);
    const targetCommId =
      defaultCommunityId && defaultCommunityId !== 'all'
        ? defaultCommunityId
        : selectedCommunityId !== 'all'
        ? selectedCommunityId
        : authorizedCommunities.find((c) => c.communityType === 'programme')?.communityId ||
          authorizedCommunities[0]?.communityId ||
          '';
    setFormCommunityId(targetCommId);
    setFormPostType(defaultPostType);
    setFormCategory(
      defaultPostType === 'QUESTION'
        ? 'Question'
        : defaultPostType === 'EVENT'
        ? 'Study Group'
        : defaultPostType === 'FILE' || defaultPostType === 'LINK'
        ? 'Resource Share'
        : 'Academic Discussion'
    );
    setFormTitle('');
    setFormContent('');
    setFormImageUrl('');
    setFormImageUrls([]);
    setFormFileAttachment(null);
    setFormExternalLink('');
    setFormLinkUrl('');
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollMultipleChoice(false);
    setPollClosesAt('');
    setPollResultsVisibleBeforeVote(true);
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime('16:00');
    setEventEndTime('18:00');
    setEventLocation('');
    setEventOnlineLink('');
    setFormError(null);
    setPostModalOpen(true);
  };

  // Open Edit Post Modal
  const handleOpenEditModal = (post: RealCommunityPost) => {
    setEditingPost(post);
    setFormCommunityId(post.communityId);
    setFormPostType(post.postType || 'TEXT');
    setFormCategory(post.category);
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormImageUrl(post.imageUrl || '');
    setFormImageUrls(post.imageUrls || (post.imageUrl ? [post.imageUrl] : []));
    setFormError(null);
    setPostModalOpen(true);
  };

  // Handle Post Image Attachment
  const handlePostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPostImage(true);
    setFormError(null);
    try {
      const url = await communityService.uploadCommunityImage(file, 'posts');
      setFormImageUrls((prev) => {
        const next = [...prev, url].slice(0, 4);
        setFormImageUrl(next[0] || '');
        return next;
      });
    } catch (err: any) {
      setFormError(err?.message || 'Failed to attach image.');
    } finally {
      setUploadingPostImage(false);
      if (postImageInputRef.current) postImageInputRef.current.value = '';
    }
  };

  // Handle Post Academic File Attachment
  const handlePostFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPostFile(true);
    setFormError(null);
    try {
      const uploaded = await communityService.uploadChatFile(file);
      setFormFileAttachment(uploaded);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to attach document.');
    } finally {
      setUploadingPostFile(false);
      if (postFileInputRef.current) postFileInputRef.current.value = '';
    }
  };

  // Submit Create or Edit Rich Post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Please provide both a title and discussion details.');
      return;
    }

    if (formPostType === 'POLL') {
      const validPollOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (validPollOptions.length < 2) {
        setFormError('Please provide at least 2 poll options.');
        return;
      }
    }

    if (formPostType === 'EVENT') {
      if (!eventDate || !eventTime || (!eventLocation.trim() && !eventOnlineLink.trim())) {
        setFormError('Please specify event date, start time, and physical location or meeting link.');
        return;
      }
    }

    setSubmittingPost(true);
    setFormError(null);

    try {
      if (editingPost) {
        await communityService.updatePost(editingPost.postId, {
          title: formTitle,
          content: formContent,
          category: formCategory,
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === editingPost.postId
              ? {
                  ...p,
                  title: formTitle.trim(),
                  content: formContent.trim(),
                  category: formCategory,
                  editedAt: new Date().toISOString(),
                }
              : p
          )
        );
        showToast('Post updated.');
      } else {
        const targetComm =
          authorizedCommunities.find((c) => c.communityId === formCommunityId) ||
          authorizedCommunities[0];
        if (!targetComm) {
          throw new Error('No authorized academic community found for your profile.');
        }

        const resolvedLink = (formLinkUrl || formExternalLink || '').trim();
        const created = await communityService.createPost({
          profile,
          lecturer: lecturerRecord,
          community: targetComm,
          category: formCategory,
          postType: formPostType,
          title: formTitle,
          content: formContent,
          imageUrl: formImageUrls[0] || formImageUrl,
          imageUrls: formImageUrls,
          attachment: formFileAttachment,
          externalLink: resolvedLink,
          poll:
            formPostType === 'POLL'
              ? {
                  question: (pollQuestion || formTitle).trim(),
                  options: pollOptions.map((o) => o.trim()).filter(Boolean),
                  allowMultipleChoice: pollMultipleChoice,
                  closesAt: pollClosesAt || null,
                  showResultsBeforeVoting: pollResultsVisibleBeforeVote,
                }
              : null,
          event:
            formPostType === 'EVENT'
              ? {
                  title: formTitle.trim(),
                  description: formContent.trim(),
                  courseId: targetComm.courseId,
                  courseCode: targetComm.courseCode,
                  date: eventDate,
                  startTime: eventTime,
                  endTime: eventEndTime,
                  locationType: eventOnlineLink.trim() && !eventLocation.trim() ? 'online' : 'physical',
                  locationOrLink: (eventLocation.trim() || eventOnlineLink.trim()),
                }
              : null,
        });

        setPosts((prev) => {
          if (prev.some((p) => p.postId === created.postId)) return prev;
          return [created, ...prev];
        });
        showToast(`Published to ${targetComm.shortLabel}`);
      }
      setPostModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to publish post. Please try again.');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Vote on Community Poll
  const handleVoteOnPoll = async (post: RealCommunityPost, selectedOptionIds: string[]) => {
    try {
      const res = await communityService.voteOnPoll({
        post,
        selectedOptionIds,
        profile,
        lecturer: lecturerRecord,
      });
      setUserPollVotesMap((prev) => ({ ...prev, [post.postId]: res.selectedOptionIds }));
      setPosts((prev) =>
        prev.map((p) => (p.postId === post.postId ? { ...p, poll: res.updatedPoll } : p))
      );
      showToast('Vote recorded');
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit vote.');
    }
  };
  const handleVotePoll = handleVoteOnPoll;

  // RSVP to Study Session / Academic Event
  const handleRsvpToEvent = async (post: RealCommunityPost, status: CommunityEventRsvpStatus) => {
    try {
      const res = await communityService.rsvpToEvent({
        post,
        status,
        profile,
        lecturer: lecturerRecord,
      });
      setUserEventRsvpsMap((prev) => ({ ...prev, [post.postId]: res.status }));
      setPosts((prev) =>
        prev.map((p) => (p.postId === post.postId ? { ...p, event: res.updatedEvent } : p))
      );
      showToast(
        status === 'going'
          ? 'RSVP: Going!'
          : status === 'interested'
          ? 'RSVP: Interested'
          : 'RSVP updated'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to update RSVP.');
    }
  };
  const handleRsvpEvent = handleRsvpToEvent;
  const userEventRsvpMap = userEventRsvpsMap;

  // Add Study Session / Event to Student's Real VENUE Study Planner
  const handleAddEventToPlanner = async (post: RealCommunityPost) => {
    try {
      await communityService.addEventToStudyPlanner(post, currentUserUid);
      showToast('Study session added to your Study Planner!');
    } catch (err: any) {
      showToast(err?.message || 'Could not add session to Study Planner.');
    }
  };

  // Mark or Unmark Best / Helpful Answer on Question or Discussion Post
  const handleToggleBestAnswer = async (post: RealCommunityPost, commentId: string) => {
    try {
      const res = await communityService.toggleBestAnswer({
        post,
        commentId,
        profile,
        lecturer: lecturerRecord,
        lecturerAssignments,
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === post.postId
            ? {
                ...p,
                bestAnswerCommentId: res.bestAnswerCommentId,
                bestAnswerMarkedByUid: res.bestAnswerCommentId ? currentUserUid : null,
                bestAnswerMarkedByName: res.bestAnswerCommentId
                  ? lecturerRecord?.fullName || profile?.name || 'Author'
                  : null,
                bestAnswerMarkedByRole: res.bestAnswerCommentId
                  ? lecturerRecord
                    ? 'lecturer'
                    : isAdminOrOwner
                    ? 'admin'
                    : 'author'
                  : null,
              }
            : p
        )
      );
      showToast(
        res.bestAnswerCommentId
          ? 'Marked as Best Answer'
          : 'Removed Best Answer badge'
      );
    } catch (err: any) {
      showToast(err?.message || 'Could not update Best Answer.');
    }
  };

  // Moderator / Lecturer Tools: Pin Post or Lock Comments
  const handleModeratorPostAction = async (
    post: RealCommunityPost,
    updates: { pinned?: boolean; commentsLocked?: boolean }
  ) => {
    try {
      await communityService.updatePostModerationState({
        post,
        ...updates,
        profile,
        lecturer: lecturerRecord,
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === post.postId
            ? {
                ...p,
                ...(typeof updates.pinned === 'boolean' ? { pinned: updates.pinned } : {}),
                ...(typeof updates.commentsLocked === 'boolean'
                  ? { commentsLocked: updates.commentsLocked }
                  : {}),
              }
            : p
        )
      );
      if (typeof updates.pinned === 'boolean') {
        showToast(updates.pinned ? 'Post pinned to top of community' : 'Post unpinned');
      }
      if (typeof updates.commentsLocked === 'boolean') {
        showToast(
          updates.commentsLocked ? 'Comments locked on this post' : 'Comments unlocked'
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Moderator action failed.');
    }
  };

  // Save / Bookmark Any Item (Chat Message, File, Announcement, Event)
  const handleToggleSaveGenericItem = async (input: {
    itemType: 'post' | 'message' | 'file' | 'announcement' | 'event';
    targetId: string;
    communityId?: string;
    conversationId?: string;
    courseCode?: string;
    title: string;
    excerpt: string;
    authorName: string;
    fileUrl?: string;
    fileName?: string;
    fileSizeLabel?: string;
    imageUrl?: string;
  }) => {
    try {
      const res = await communityService.toggleSavedItem(input);
      if (res.saved && res.item) {
        setSavedItems((prev) => [res.item!, ...prev.filter((i) => i.id !== res.item!.id)]);
        showToast('Saved to your Bookmarks');
      } else {
        setSavedItems((prev) =>
          prev.filter((i) => !(i.itemType === input.itemType && i.targetId === input.targetId))
        );
        showToast('Removed from Bookmarks');
      }
    } catch (err: any) {
      showToast(err?.message || 'Could not update bookmark.');
    }
  };

  // Confirm Delete Post
  const handleConfirmDeletePost = async () => {
    if (!deletingPostId) return;
    setIsDeletingPost(true);
    try {
      await communityService.deletePost(deletingPostId);
      setPosts((prev) => prev.filter((p) => p.postId !== deletingPostId));
      setDeletingPostId(null);
      showToast('Post deleted.');
    } catch (err: any) {
      showToast(err?.message || 'Could not delete post.');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Toggle Like on Post or Comment
  const handleToggleLike = async (
    targetId: string,
    targetType: 'post' | 'comment',
    postId?: string
  ) => {
    if (!currentUserUid) return;
    const alreadyLiked = likedIds.has(targetId);

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (alreadyLiked) next.delete(targetId);
      else next.add(targetId);
      return next;
    });

    if (targetType === 'post') {
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === targetId
            ? { ...p, likeCount: Math.max(0, (p.likeCount || 0) + (alreadyLiked ? -1 : 1)) }
            : p
        )
      );
    } else if (postId) {
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) =>
          c.commentId === targetId
            ? { ...c, likeCount: Math.max(0, (c.likeCount || 0) + (alreadyLiked ? -1 : 1)) }
            : c
        ),
      }));
    }

    try {
      await communityService.toggleLike(targetId, targetType);
    } catch (err) {
      console.warn('Error toggling like:', err);
    }
  };

  // Toggle Reaction Emoji on Post, Lecturer Announcement, or Official Notice
  const handleToggleReaction = async (
    targetId: string,
    targetType: 'post' | 'lecturer_announcement' | 'official_announcement',
    emoji: string
  ) => {
    if (!currentUserUid) return;
    const prevEmoji = userReactionsMap[targetId];
    const nextEmoji = prevEmoji === emoji ? null : emoji;

    setUserReactionsMap((prev) => {
      const copy = { ...prev };
      if (nextEmoji) copy[targetId] = nextEmoji;
      else delete copy[targetId];
      return copy;
    });

    if (targetType === 'post') {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.postId !== targetId) return p;
          const counts = { ...(p.reactionCounts || {}) };
          if (prevEmoji) counts[prevEmoji] = Math.max(0, (counts[prevEmoji] || 1) - 1);
          if (nextEmoji) counts[nextEmoji] = (counts[nextEmoji] || 0) + 1;
          return { ...p, reactionCounts: counts };
        })
      );
    }

    try {
      await communityService.toggleReaction({
        targetId,
        targetType,
        emoji,
        profile,
      });
    } catch (err) {
      console.warn('Error toggling reaction:', err);
    }
  };

  // Acknowledge Official Lecturer / University Announcement
  const handleAcknowledgeAnnouncement = async (
    targetId: string,
    targetType: 'lecturer_announcement' | 'official_announcement',
    courseCode?: string
  ) => {
    if (!currentUserUid || acknowledgedIds.has(targetId)) return;

    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });

    try {
      await communityService.acknowledgeAnnouncement({
        targetId,
        targetType,
        courseCode,
        profile,
      });
      showToast('Announcement acknowledged');
    } catch (err: any) {
      showToast(err?.message || 'Failed to acknowledge announcement.');
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (post: RealCommunityPost) => {
    if (!currentUserUid) return;
    const alreadySaved = bookmarkedPostIds.has(post.postId);

    setBookmarkedPostIds((prev) => {
      const next = new Set(prev);
      if (alreadySaved) next.delete(post.postId);
      else next.add(post.postId);
      return next;
    });

    try {
      const res = await communityService.toggleBookmark(post.postId, post.communityId);
      showToast(res.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) {
      console.warn('Error toggling bookmark:', err);
    }
  };

  // Block / Unblock Peer
  const handleToggleBlockPeer = async (targetUid: string, targetName: string) => {
    if (!targetUid || targetUid === currentUserUid) return;
    try {
      const res = await communityService.toggleBlockUser(targetUid);
      setBlockedUids((prev) => {
        const next = new Set(prev);
        if (res.blocked) next.add(targetUid);
        else next.delete(targetUid);
        return next;
      });
      showToast(res.blocked ? `Blocked ${targetName}` : `Unblocked ${targetName}`);
    } catch (err: any) {
      showToast(err?.message || 'Could not update block setting.');
    }
  };

  // Mute / Unmute User (hides posts & notifications without blocking direct chat)
  const handleToggleMuteUser = async (targetUid: string, targetName = 'Member') => {
    if (!targetUid || targetUid === currentUserUid) return;
    try {
      const res = await communityService.toggleMuteUser(targetUid, targetName);
      setMutedUserUids((prev) => {
        const next = new Set(prev);
        if (res.muted) next.add(targetUid);
        else next.delete(targetUid);
        return next;
      });
      showToast(res.muted ? `Muted ${targetName}` : `Unmuted ${targetName}`);
    } catch (err: any) {
      showToast(err?.message || 'Could not update mute setting.');
    }
  };

  // Mute / Unmute Community Space
  const handleToggleMuteCommunity = async (communityId: string, communityLabel = 'Community') => {
    if (!communityId) return;
    try {
      const res = await communityService.toggleMuteCommunity(communityId);
      setMutedCommunityIds((prev) => {
        const next = new Set(prev);
        if (res.muted) next.add(communityId);
        else next.delete(communityId);
        return next;
      });
      showToast(
        res.muted
          ? `Muted notifications for ${communityLabel}`
          : `Unmuted notifications for ${communityLabel}`
      );
    } catch (err: any) {
      showToast(err?.message || 'Could not update community mute setting.');
    }
  };

  // Moderator Soft-Remove Content (Post, Comment, or Chat Message)
  const handleModeratorSoftRemove = async (input: {
    targetType: 'post' | 'comment' | 'message';
    targetId: string;
    conversationId?: string;
    communityId?: string;
    reason?: string;
  }) => {
    try {
      await communityService.removeContentByModerator({
        targetType: input.targetType,
        targetId: input.targetId,
        conversationId: input.conversationId,
        communityId: input.communityId,
        reason: input.reason || 'Removed by moderator for community safety',
        profile,
        lecturer: lecturerRecord,
        lecturerAssignments,
      });
      if (input.targetType === 'post') {
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === input.targetId
              ? {
                  ...p,
                  status: 'removed',
                  title: 'Removed by Moderator',
                  content: 'This post was removed by a moderator.',
                  imageUrl: '',
                  imageUrls: [],
                  poll: null,
                  event: null,
                }
              : p
          )
        );
      }
      showToast('Content removed by moderation and logged in Audit Trail.');
    } catch (err: any) {
      showToast(err?.message || 'Moderator removal failed.');
    }
  };

  // Share / Copy Post Link
  const handleSharePost = async (post: RealCommunityPost) => {
    const shareUrl = `${window.location.origin}/#community?post=${encodeURIComponent(post.postId)}`;
    const shareText = `${post.title} — ${post.communityName} on VENUE`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: shareText, url: shareUrl });
        return;
      }
    } catch {
      // fallback to clipboard
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedPostId(post.postId);
      showToast('Post link copied to clipboard');
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch {
      showToast('Link ready to share');
    }
  };

  // Add Comment or Reply
  const handleAddComment = async (post: RealCommunityPost) => {
    const postId = post.postId;
    const rawText = (commentInputByPost[postId] || '').trim();
    if (!rawText || submittingComment) return;

    setSubmittingComment(true);
    try {
      const parentCommentId =
        replyingToComment && replyingToComment.postId === postId
          ? replyingToComment.commentId
          : null;

      const created = await communityService.addComment({
        postId,
        postAuthorUid: post.authorUid,
        postTitle: post.title,
        parentCommentId,
        content: rawText,
        profile,
        lecturer: lecturerRecord,
      });

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
        )
      );
      setCommentInputByPost((prev) => ({ ...prev, [postId]: '' }));
      setReplyingToComment(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      await communityService.deleteComment(commentId, postId);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.commentId !== commentId),
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) } : p
        )
      );
      showToast('Comment deleted.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete comment.');
    }
  };

  // Submit Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;
    setSubmittingReport(true);
    try {
      await communityService.submitReport({
        targetType: reportTarget.targetType,
        targetId: reportTarget.targetId,
        targetAuthorUid: reportTarget.targetAuthorUid,
        targetExcerpt: reportTarget.targetExcerpt,
        communityId: reportTarget.communityId,
        conversationId: reportTarget.conversationId,
        category: reportCategory,
        details: reportDetails,
        profile,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportTarget(null);
        setReportSuccess(false);
        setReportDetails('');
      }, 1500);
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Start 1-to-1 Direct Chat with a Peer or Lecturer
  const handleStartDirectChat = async (peer: ChatParticipantInfo) => {
    if (!peer.uid || peer.uid === currentUserUid) return;
    setStartingChat(true);
    try {
      const conv = await communityService.getOrCreateDirectConversation({
        profile,
        lecturer: lecturerRecord,
        peer,
      });
      setActiveConversation(conv);
      setActiveTab('chat');
    } catch (err: any) {
      showToast(err?.message || 'Could not start direct chat.');
    } finally {
      setStartingChat(false);
    }
  };

  // Open or Join a Community Group Chat Room (University, College, Dept, Programme, or Course Open Discussion)
  const handleOpenCommunityGroupChat = async (space: CommunitySpace) => {
    setStartingChat(true);
    try {
      const conv = await communityService.getOrJoinCommunityGroupChat({
        profile,
        lecturer: lecturerRecord,
        community: space,
      });
      setActiveConversation(conv);
      setActiveTab('chat');
    } catch (err: any) {
      showToast(err?.message || 'Could not join community chat room.');
    } finally {
      setStartingChat(false);
    }
  };

  // Handle Chat Image Upload
  const handleChatImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingChatImage(true);
    try {
      const url = await communityService.uploadCommunityImage(file, 'chat');
      setChatImageUrl(url);
      setChatFileAttachment(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to attach image.');
    } finally {
      setUploadingChatImage(false);
      if (chatImageInputRef.current) chatImageInputRef.current.value = '';
    }
  };

  // Handle Chat Document / File Upload (PDF, DOCX, PPTX, XLSX, TXT, ZIP)
  const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingChatFile(true);
    try {
      const uploaded = await communityService.uploadChatFile(file);
      setChatFileAttachment(uploaded);
      setChatImageUrl('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to attach document.');
    } finally {
      setUploadingChatFile(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  // Handle Voice Note Upload & Send
  const handleSendVoiceNote = async (blob: Blob, durationSec: number) => {
    if (!activeConversation || sendingVoiceNote) return;
    setSendingVoiceNote(true);
    try {
      const uploadedVoice = await communityService.uploadVoiceNote(blob, durationSec);
      await communityService.sendChatMessage({
        conversation: activeConversation,
        text: chatInputText.trim(),
        voiceAttachment: uploadedVoice,
        replyTo: replyingToMessage,
        mentionedUids: selectedMentions.map((m) => m.uid),
        mentionedNames: selectedMentions.map((m) => m.name),
        profile,
        lecturer: lecturerRecord,
      });
      setRecordingVoiceMode(false);
      setChatInputText('');
      setReplyingToMessage(null);
      setSelectedMentions([]);
    } catch (err: any) {
      showToast(err?.message || 'Failed to send voice note.');
    } finally {
      setSendingVoiceNote(false);
    }
  };

  // Broadcast Typing Indicator (Throttled to avoid excessive writes)
  const handleComposerTextChange = (val: string) => {
    setChatInputText(val);

    // Check for @mention trigger
    const atIndex = val.lastIndexOf('@');
    if (atIndex !== -1 && (atIndex === 0 || val[atIndex - 1] === ' ')) {
      const queryPart = val.slice(atIndex + 1);
      if (!queryPart.includes(' ') && queryPart.length <= 24) {
        setMentionQuery(queryPart);
        setMentionPickerOpen(true);
      } else {
        setMentionPickerOpen(false);
      }
    } else {
      setMentionPickerOpen(false);
    }

    if (!activeConversation) return;
    const now = Date.now();
    if (val.trim() && now - lastTypingBroadcastRef.current > 3000) {
      lastTypingBroadcastRef.current = now;
      const senderName =
        lecturerRecord?.name || profile?.name || auth.currentUser?.displayName || 'Member';
      communityService.setTypingIndicator(activeConversation.conversationId, senderName, true);
    } else if (!val.trim() && lastTypingBroadcastRef.current > 0) {
      lastTypingBroadcastRef.current = 0;
      const senderName =
        lecturerRecord?.name || profile?.name || auth.currentUser?.displayName || 'Member';
      communityService.setTypingIndicator(activeConversation.conversationId, senderName, false);
    }
  };

  // Insert @mention into composer
  const handleSelectMention = (peer: { uid: string; name: string }) => {
    const atIndex = chatInputText.lastIndexOf('@');
    const prefix = atIndex !== -1 ? chatInputText.slice(0, atIndex) : chatInputText;
    const nextText = `${prefix}@${peer.name} `;
    setChatInputText(nextText);
    setSelectedMentions((prev) => {
      if (prev.some((m) => m.uid === peer.uid)) return prev;
      return [...prev, peer];
    });
    setMentionPickerOpen(false);
  };

  // Scroll to and highlight an original message when tapping a reply preview or pinned message
  const handleScrollToMessage = (messageId?: string | null) => {
    if (!messageId) return;
    const el = messageItemRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId((prev) => (prev === messageId ? null : prev));
      }, 2400);
    } else {
      showToast('Original message is earlier in the conversation history.');
    }
  };

  // Toggle Pin / Unpin Message
  const handleTogglePinChatMessage = async (msg: RealChatMessage) => {
    if (!activeConversation) return;
    try {
      await communityService.togglePinChatMessage({
        conversation: activeConversation,
        messageId: msg.messageId,
        pin: !msg.isPinned,
        isAdminOrOwner,
        lecturer: lecturerRecord,
        lecturerAssignments,
      });
      showToast(msg.isPinned ? 'Message unpinned' : 'Message pinned to conversation');
    } catch (err: any) {
      showToast(err?.message || 'Could not update pin state.');
    }
  };

  // Toggle Mute / Unmute Conversation Notifications
  const handleToggleMuteConversation = async (conversationId: string) => {
    try {
      const res = await communityService.toggleMuteConversation(conversationId);
      setMutedConversationIds((prev) => {
        const next = new Set(prev);
        if (res.muted) next.add(conversationId);
        else next.delete(conversationId);
        return next;
      });
      showToast(res.muted ? 'Conversation notifications muted' : 'Conversation notifications unmuted');
    } catch (err: any) {
      showToast(err?.message || 'Could not update mute setting.');
    }
  };

  // Forward Message to Another Conversation
  const handleForwardMessageToConversation = async (targetConversation: RealChatConversation) => {
    if (!forwardingMessage || !activeConversation) return;
    try {
      await communityService.forwardChatMessage({
        sourceMessage: forwardingMessage,
        sourceConversation: activeConversation,
        targetConversation,
        profile,
        lecturer: lecturerRecord,
      });
      showToast(`Forwarded to ${targetConversation.title || 'conversation'}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to forward message.');
      throw err;
    }
  };

  // Send or Edit Real Chat Message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || sendingMessage) return;

    if (editingChatMessage) {
      if (!chatInputText.trim()) return;
      setSendingMessage(true);
      try {
        await communityService.editChatMessage(
          activeConversation.conversationId,
          editingChatMessage.messageId,
          chatInputText
        );
        setEditingChatMessage(null);
        setChatInputText('');
        showToast('Message updated.');
      } catch (err: any) {
        showToast(err?.message || 'Could not edit message.');
      } finally {
        setSendingMessage(false);
      }
      return;
    }

    if (!chatInputText.trim() && !chatImageUrl && !chatFileAttachment) return;

    const textToSend = chatInputText;
    const imageToSend = chatImageUrl;
    const fileToSend = chatFileAttachment;
    const replyQuote = replyingToMessage;
    const mentionsToSend = selectedMentions;

    setChatInputText('');
    setChatImageUrl('');
    setChatFileAttachment(null);
    setReplyingToMessage(null);
    setSelectedMentions([]);
    setMentionPickerOpen(false);
    setSendingMessage(true);

    try {
      await communityService.sendChatMessage({
        conversation: activeConversation,
        text: textToSend,
        imageUrl: imageToSend,
        fileAttachment: fileToSend,
        replyTo: replyQuote,
        mentionedUids: mentionsToSend.map((m) => m.uid),
        mentionedNames: mentionsToSend.map((m) => m.name),
        profile,
        lecturer: lecturerRecord,
      });
    } catch (err: any) {
      setChatInputText(textToSend);
      setChatImageUrl(imageToSend);
      setChatFileAttachment(fileToSend);
      setReplyingToMessage(replyQuote);
      setSelectedMentions(mentionsToSend);
      showToast(err?.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Delete Own Chat Message (or as Group Admin in Private Group)
  const handleDeleteChatMessage = async (messageId: string) => {
    if (!activeConversation) return;
    try {
      await communityService.deleteChatMessage(activeConversation.conversationId, messageId);
    } catch (err: any) {
      showToast(err?.message || 'Could not delete message.');
    }
  };

  // React to a Chat Message
  const handleReactChatMessage = async (messageId: string, emoji: string) => {
    if (!activeConversation) return;
    await communityService.toggleChatMessageReaction(
      activeConversation.conversationId,
      messageId,
      emoji
    );
  };

  // Helper to get conversation display info
  const getConversationDisplay = (conv: RealChatConversation) => {
    if (conv.type === 'private_group') {
      const count = (conv.participantIds || []).length;
      return {
        title: conv.title || 'Private Study Group',
        subtitle: `Private Group • ${count} member${count === 1 ? '' : 's'}`,
        avatarText: (conv.title || 'PG').slice(0, 2).toUpperCase(),
        isGroup: true,
        isPrivateGroup: true,
      };
    }

    if (conv.type === 'community_group') {
      return {
        title: conv.title || conv.communityName || 'Academic Group Chat',
        subtitle: conv.courseCode
          ? `Course Discussion • ${conv.courseCode}`
          : `${(conv.participantIds || []).length} member${(conv.participantIds || []).length === 1 ? '' : 's'}`,
        avatarText: (conv.courseCode || conv.title || 'G').slice(0, 2).toUpperCase(),
        isGroup: true,
        isPrivateGroup: false,
      };
    }

    const otherUid = (conv.participantIds || []).find((id) => id !== currentUserUid) || '';
    const peerInfo = conv.participants?.[otherUid];
    const name = peerInfo?.name || 'Verified Member';
    const subtitle = peerInfo?.roleLabel || peerInfo?.programmeName || 'Direct Message';
    return {
      title: name,
      subtitle,
      avatarText: name.charAt(0).toUpperCase(),
      photo: peerInfo?.photo,
      isGroup: false,
      isPrivateGroup: false,
      peerUid: otherUid,
    };
  };

  const getSpaceIcon = (type: CommunitySpace['communityType']) => {
    switch (type) {
      case 'university':
        return <Building2 className="w-4 h-4 text-sky-400" />;
      case 'academic_unit':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'department':
        return <Users className="w-4 h-4 text-teal-400" />;
      case 'programme':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
    }
  };

  // Compute total unread chat messages
  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce(
      (sum, conv) => sum + (conv.unreadCountByUser?.[currentUserUid] || 0),
      0
    );
  }, [conversations, currentUserUid]);

  // Compute whether current user is an authorized lecturer/admin for the selected Course Community
  const canPublishToSelectedCourse = useMemo(() => {
    if (!activeSpace || activeSpace.communityType !== 'course') return false;
    if (isAdminOrOwner) return true;
    if (!lecturerRecord) return false;
    const code = (activeSpace.courseCode || activeSpace.shortLabel || '').toUpperCase();
    return lecturerAssignments.some(
      (a) =>
        a.courseId === activeSpace.courseId ||
        (a.courseCode || '').trim().toUpperCase() === code
    );
  }, [activeSpace, isAdminOrOwner, lecturerRecord, lecturerAssignments]);

  // Empty Academic Placement Guard
  if (authorizedCommunities.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-5 pb-24">
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">Complete Your Academic Placement</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              VENUE Communities are structured around your real University, College / Academic Unit, Department, Degree Programme, and enrolled Courses. Complete your academic profile to unlock your communities, lecturer channels, and live peer chat.
            </p>
          </div>
          {onNavigateToProfile && (
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              Complete Academic Profile
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-500/40 text-white text-xs font-medium shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Academic Community
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Campus
            </span>
            {lecturerRecord && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold">
                Verified Lecturer
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile?.universityName || profile?.university}
            {profile?.college || profile?.academicUnitName
              ? ` • ${profile.college || profile.academicUnitName}`
              : ''}
            {profile?.programmeShort || profile?.programmeName || profile?.programme
              ? ` • ${profile.programmeShort || profile.programmeName || profile.programme}`
              : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              setAiAssistantModalState({
                isOpen: true,
                communitySpace: activeSpace || authorizedCommunities[0] || null,
                action: 'ask',
                targetItem: null,
                initialPrompt: '',
              })
            }
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Ask VENUE AI about your community discussions, lecturer announcements & course topics"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask VENUE AI</span>
          </button>

          <button
            type="button"
            onClick={() => setPrivacyModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Privacy, Safety, Blocked & Muted Users"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Safety &amp; Privacy</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateGroupModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Private Group</span>
          </button>

          <button
            id="community-create-post-btn"
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('discussions')}
          className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'discussions'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Discussions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Official Channels</span>
          {lecturerAnnouncements.length + officialAnnouncements.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
              {lecturerAnnouncements.length + officialAnnouncements.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('communities')}
          className={`flex-1 min-w-[125px] py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'communities'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>My Communities ({authorizedCommunities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('study_groups')}
          className={`flex-1 min-w-[115px] py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'study_groups'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Study Groups ({studyGroups.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Live Chat</span>
          {totalUnreadMessages > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {totalUnreadMessages}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({Math.max(bookmarkedPostIds.size, savedItems.length)})</span>
        </button>

        {(isAdminOrOwner || Boolean(lecturerRecord)) && (
          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'moderation'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-400 hover:text-rose-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Moderation</span>
          </button>
        )}
      </div>

      {/* =====================================================================
          TAB: MODERATION QUEUE & SAFETY LOGS (LECTURERS & ADMINS)
         ===================================================================== */}
      {activeTab === 'moderation' && (isAdminOrOwner || Boolean(lecturerRecord)) && (
        <CommunityModerationQueuePanel
          isPlatformAdmin={isAdminOrOwner}
          lecturer={lecturerRecord}
          lecturerAssignments={lecturerAssignments}
          profile={profile}
          onNotify={showToast}
        />
      )}

      {/* =====================================================================
          TAB: ACADEMIC STUDY GROUPS (CREATE, BROWSE, JOIN, REQUEST, PRIVATE CHAT)
         ===================================================================== */}
      {activeTab === 'study_groups' && (
        <CommunityStudyGroupsPanel
          groups={studyGroups}
          authorizedCommunities={authorizedCommunities}
          currentUserUid={currentUserUid}
          profile={profile}
          lecturer={lecturerRecord}
          knownPeers={knownPeers}
          onCreateStudyGroup={async (input) => {
            try {
              const created = await communityService.createStudyGroup({
                ...input,
                profile,
                lecturer: lecturerRecord,
              });
              showToast(`Study group "${created.name}" created!`);
              if (created.conversationId) {
                const conv = conversations.find((c) => c.conversationId === created.conversationId);
                if (conv) {
                  setActiveConversation(conv);
                  setActiveTab('chat');
                }
              }
            } catch (err: any) {
              showToast(err?.message || 'Could not create study group.');
            }
          }}
          onJoinOrRequestGroup={async (grp) => {
            try {
              const res = await communityService.joinOrRequestStudyGroup({
                group: grp,
                profile,
                lecturer: lecturerRecord,
              });
              if (res.status === 'joined') {
                showToast(`Joined "${grp.name}"!`);
              } else {
                showToast(`Request sent to join "${grp.name}"`);
              }
            } catch (err: any) {
              showToast(err?.message || 'Could not join study group.');
            }
          }}
          onApproveOrDeclineRequest={async (grp, reqUid, reqName, reqRole, approve) => {
            try {
              await communityService.handleStudyGroupJoinRequest({
                group: grp,
                requesterUid: reqUid,
                requesterName: reqName,
                requesterRoleLabel: reqRole,
                approve,
              });
              showToast(approve ? `Approved ${reqName}` : `Declined request from ${reqName}`);
            } catch (err: any) {
              showToast(err?.message || 'Could not process request.');
            }
          }}
          onOpenGroupChat={(conversationId) => {
            const found = conversations.find((c) => c.conversationId === conversationId);
            if (found) {
              setActiveConversation(found);
              setActiveTab('chat');
            } else {
              setActiveTab('chat');
            }
          }}
          onReportStudyGroup={(grp) =>
            setReportTarget({
              targetType: 'study_group',
              targetId: grp.groupId,
              targetAuthorUid: grp.ownerUid,
              targetExcerpt: grp.name,
              communityId: grp.communityId,
              conversationId: grp.conversationId,
            })
          }
        />
      )}

      {/* =====================================================================
          TAB: SAVED ITEMS / BOOKMARKS HUB (POSTS, MESSAGES, FILES, ANNOUNCEMENTS, EVENTS)
         ===================================================================== */}
      {activeTab === 'saved' && (
        <CommunitySavedHubPanel
          savedItems={savedItems}
          bookmarkedPosts={posts.filter((p) => bookmarkedPostIds.has(p.postId))}
          onRemoveSavedItem={async (item) => {
            try {
              await communityService.toggleSavedItem({
                itemType: item.itemType,
                targetId: item.targetId,
                title: item.title,
                excerpt: item.excerpt,
                authorName: item.authorName,
              });
              setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
              if (item.itemType === 'post') {
                setBookmarkedPostIds((prev) => {
                  const next = new Set(prev);
                  next.delete(item.targetId);
                  return next;
                });
              }
              showToast('Removed from Saved Items');
            } catch (err: any) {
              showToast(err?.message || 'Could not remove saved item.');
            }
          }}
          onOpenPost={(postId) => {
            setSelectedCommunityId('all');
            setActiveTab('discussions');
            setExpandedPostId(postId);
          }}
        />
      )}

      {/* =====================================================================
          TAB: OFFICIAL ANNOUNCEMENT CHANNELS (LECTURER, UNIVERSITY & COLLEGE)
         ===================================================================== */}
      {activeTab === 'announcements' && (
        <OfficialAnnouncementsTab
          profile={profile}
          courseSpaces={courseSpaces}
          lecturerAnnouncements={lecturerAnnouncements}
          officialAnnouncements={officialAnnouncements}
          loadingOfficial={loadingOfficialAnnouncements}
          userReactionsMap={userReactionsMap}
          acknowledgedIds={acknowledgedIds}
          onToggleReaction={handleToggleReaction}
          onAcknowledge={handleAcknowledgeAnnouncement}
          onSelectCourseAnnouncements={(cs) => {
            setSelectedCommunityId(cs.communityId);
            setCourseModeTab('announcements');
            setActiveTab('discussions');
          }}
          onExplainWithAI={(item) => {
            const matchedCourseSpace =
              courseSpaces.find(
                (cs) =>
                  (cs.courseCode || cs.shortLabel || '').toUpperCase() ===
                  (item.courseCode || '').toUpperCase()
              ) ||
              activeSpace ||
              authorizedCommunities[0] ||
              null;
            setAiAssistantModalState({
              isOpen: true,
              communitySpace: matchedCourseSpace,
              action: 'explain_item',
              targetItem: item,
              initialPrompt: `Explain this official announcement: "${item.title || item.content.slice(0, 70)}"`,
            });
          }}
        />
      )}

      {/* =====================================================================
          TAB: MY COMMUNITIES (UNIVERSITY -> COLLEGE -> DEPT -> PROGRAMME -> COURSES)
         ===================================================================== */}
      {activeTab === 'communities' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Your Authorized Academic Communities
              </h3>
              <p className="text-[11px] text-slate-400">
                University, College / Academic Unit, Department, Degree Programme, and Course Communities synced with your verified placement.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {authorizedCommunities.map((space) => {
              const postCountForSpace = posts.filter(
                (p) => p.communityId === space.communityId
              ).length;
              const lastVisited = communityReadStates[space.communityId];
              const unreadPostsInSpace = posts.filter(
                (p) =>
                  p.communityId === space.communityId &&
                  p.authorUid !== currentUserUid &&
                  (!lastVisited || p.createdAt > lastVisited)
              ).length;

              return (
                <div
                  key={space.communityId}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getSpaceIcon(space.communityType)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{space.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 uppercase font-semibold">
                          {space.communityType === 'academic_unit'
                            ? 'College / Unit'
                            : space.communityType.replace('_', ' ')}
                        </span>
                        {unreadPostsInSpace > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                            {unreadPostsInSpace} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{space.description}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span>
                          {postCountForSpace} active discussion
                          {postCountForSpace === 1 ? '' : 's'}
                        </span>
                        {space.communityType === 'course' && (
                          <span className="text-indigo-400 font-medium">
                            • Includes Lecturer Channel &amp; Course Discussion
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        setAiAssistantModalState({
                          isOpen: true,
                          communitySpace: space,
                          action: 'ask',
                          targetItem: null,
                          initialPrompt: '',
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                      title={`Ask VENUE AI inside ${space.name}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ask VENUE AI</span>
                    </button>
                    {space.communityType === 'course' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCommunityId(space.communityId);
                          setCourseModeTab('announcements');
                          setActiveTab('discussions');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Lecturer Channel</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCommunityId(space.communityId);
                        setCourseModeTab('discussion');
                        setActiveTab('discussions');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      Open Discussion
                    </button>
                    <button
                      type="button"
                      disabled={startingChat}
                      onClick={() => handleOpenCommunityGroupChat(space)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-sky-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Group Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleMuteCommunity(space.communityId, space.name)}
                      className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
                        mutedCommunityIds.has(space.communityId)
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                      }`}
                      title={
                        mutedCommunityIds.has(space.communityId)
                          ? 'Unmute community notifications'
                          : 'Mute community notifications'
                      }
                    >
                      {mutedCommunityIds.has(space.communityId) ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReportTarget({
                          targetType: 'community',
                          targetId: space.communityId,
                          targetExcerpt: space.name,
                          communityId: space.communityId,
                        })
                      }
                      className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Report community issue"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB: REAL IN-APP CHAT (1-TO-1 DIRECT, PRIVATE GROUPS & COMMUNITY CHATS)
         ===================================================================== */}
      {activeTab === 'chat' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
          {!activeConversation ? (
            <div className="p-4 sm:p-5 space-y-5">
              {/* Quick Join Community Group Chats + Create Private Group */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Official Academic Group Chats
                  </span>
                  <button
                    type="button"
                    onClick={() => setCreateGroupModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Private Study Group</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {authorizedCommunities.map((space) => (
                    <button
                      key={space.communityId}
                      type="button"
                      disabled={startingChat}
                      onClick={() => handleOpenCommunityGroupChat(space)}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 shrink-0 flex items-center gap-2 transition cursor-pointer"
                    >
                      {getSpaceIcon(space.communityType)}
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{space.shortLabel}</div>
                        <div className="text-[10px] text-slate-500 capitalize">
                          {space.communityType === 'academic_unit'
                            ? 'College Chat'
                            : `${space.communityType.replace('_', ' ')} Chat`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Conversations List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Your Conversations ({conversations.length})
                </span>

                {conversations.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center space-y-2">
                    <MessageCircle className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">
                      No active conversations yet
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Join one of your College, Programme, or Course group chats above, create a Private Study Group, or tap any student&apos;s name in a discussion to message them directly.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
                    {conversations.map((conv) => {
                      const info = getConversationDisplay(conv);
                      const unread = conv.unreadCountByUser?.[currentUserUid] || 0;
                      return (
                        <button
                          key={conv.conversationId}
                          type="button"
                          onClick={() => setActiveConversation(conv)}
                          className="w-full p-3.5 hover:bg-slate-900/90 transition flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                info.isPrivateGroup
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : info.isGroup
                                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-blue-600/20 text-sky-300 border border-blue-500/30'
                              }`}
                            >
                              {info.avatarText}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  {info.title}
                                </span>
                                <span className="text-[10px] text-slate-500 shrink-0">
                                  {info.subtitle}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {conv.lastSenderName ? `${conv.lastSenderName}: ` : ''}
                                {conv.lastMessage}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] text-slate-500">
                              {formatRelativeTime(conv.lastMessageAt)}
                            </span>
                            {unread > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                {unread}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Active Conversation Message View */
            <div className="flex flex-col h-[600px]">
              {/* Conversation Header */}
              {(() => {
                const info = getConversationDisplay(activeConversation);
                const isMuted = mutedConversationIds.has(activeConversation.conversationId);
                const isGroupAdmin =
                  activeConversation.type === 'private_group' &&
                  (activeConversation.ownerUid === currentUserUid ||
                    (activeConversation.adminUids || []).includes(currentUserUid));
                const canPinInConv =
                  isAdminOrOwner ||
                  isGroupAdmin ||
                  (activeConversation.type === 'community_group' && Boolean(lecturerRecord));

                const pinnedMessages = chatMessages.filter(
                  (m) => m.isPinned && !m.isDeleted && !blockedUids.has(m.senderUid)
                );

                // Compute real peer online/last-seen indicator for direct chats
                let presenceBadgeText: string | null = null;
                let isPeerCurrentlyOnline = false;
                if (activeConversation.type === 'direct' && peerPresence) {
                  const lastActiveMs = peerPresence.lastActiveAt
                    ? new Date(peerPresence.lastActiveAt).getTime()
                    : 0;
                  const diffSec = Math.floor((Date.now() - lastActiveMs) / 1000);
                  if (peerPresence.isOnline && diffSec < 150) {
                    isPeerCurrentlyOnline = true;
                    presenceBadgeText = 'Active now';
                  } else if (peerPresence.lastActiveAt) {
                    presenceBadgeText = `Last active ${formatRelativeTime(peerPresence.lastActiveAt)}`;
                  }
                }

                return (
                  <>
                    <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveConversation(null);
                            setReplyingToMessage(null);
                            setEditingChatMessage(null);
                            setChatSearchOpen(false);
                            setChatSearchQuery('');
                            setRecordingVoiceMode(false);
                          }}
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                          title="Back to conversations"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="relative shrink-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              info.isPrivateGroup
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : info.isGroup
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-blue-600/20 text-sky-300 border border-blue-500/30'
                            }`}
                          >
                            {info.avatarText}
                          </div>
                          {activeConversation.type === 'direct' && isPeerCurrentlyOnline && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 absolute -bottom-0.5 -right-0.5"
                              title="Active now"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {info.title}
                            </h4>
                            {isMuted && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-400 flex items-center gap-0.5"
                                title="Notifications muted"
                              >
                                <VolumeX className="w-2.5 h-2.5" /> Muted
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {typingUsers.length > 0 ? (
                              <span className="text-sky-400 font-semibold animate-pulse">
                                {typingUsers.map((u) => u.name).join(', ')}{' '}
                                {typingUsers.length === 1 ? 'is' : 'are'} typing...
                              </span>
                            ) : presenceBadgeText ? (
                              <span
                                className={
                                  isPeerCurrentlyOnline ? 'text-emerald-400 font-medium' : ''
                                }
                              >
                                {info.subtitle} • {presenceBadgeText}
                              </span>
                            ) : (
                              info.subtitle
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Search Messages in Conversation Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            setChatSearchOpen((prev) => !prev);
                            if (chatSearchOpen) setChatSearchQuery('');
                          }}
                          className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                            chatSearchOpen
                              ? 'bg-blue-600/20 border-blue-500/40 text-sky-300'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                          title="Search in conversation"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>

                        {/* Mute / Unmute Conversation Notifications */}
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleMuteConversation(activeConversation.conversationId)
                          }
                          className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                            isMuted
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                          title={isMuted ? 'Unmute conversation' : 'Mute conversation'}
                        >
                          {isMuted ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {activeConversation.type === 'private_group' && (
                          <button
                            type="button"
                            onClick={() => setManageGroupModalOpen(true)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                            title="Manage Group Members & Roles"
                          >
                            <Settings className="w-3.5 h-3.5 text-sky-400" />
                            <span className="hidden sm:inline">Manage</span>
                          </button>
                        )}
                        {activeConversation.type === 'direct' && info.peerUid && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleMuteUser(info.peerUid!, info.title)}
                              className={`px-2 py-1.5 rounded-xl border text-[11px] flex items-center gap-1 cursor-pointer ${
                                mutedUserUids.has(info.peerUid)
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                              }`}
                              title="Mute or Unmute Peer"
                            >
                              <VolumeX className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {mutedUserUids.has(info.peerUid) ? 'Unmute User' : 'Mute User'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleBlockPeer(info.peerUid!, info.title)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                              title="Block or Unblock Peer"
                            >
                              <ShieldOff className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {blockedUids.has(info.peerUid) ? 'Unblock' : 'Block'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setReportTarget({
                                  targetType: 'profile',
                                  targetId: info.peerUid!,
                                  targetAuthorUid: info.peerUid!,
                                  targetExcerpt: `User profile: ${info.title}`,
                                  conversationId: activeConversation.conversationId,
                                })
                              }
                              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-300 cursor-pointer"
                              title="Report User"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* In-Conversation Message Search Bar */}
                    {chatSearchOpen && (
                      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                          placeholder="Search messages, sender names, or shared file names..."
                          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                          autoFocus
                        />
                        {chatSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setChatSearchQuery('')}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Pinned Messages Banner */}
                    <PinnedMessagesBar
                      pinnedMessages={pinnedMessages}
                      canPin={canPinInConv}
                      onJumpToMessage={(msgId) => handleScrollToMessage(msgId)}
                      onUnpinMessage={(msgId) => {
                        const target = chatMessages.find((m) => m.messageId === msgId);
                        if (target) handleTogglePinChatMessage(target);
                      }}
                    />
                  </>
                );
              })()}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                {loadingChatMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Loading messages...</span>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-500">
                    <MessageSquare className="w-7 h-7 text-slate-600" />
                    <p className="text-xs font-medium text-slate-300">No messages yet</p>
                    <p className="text-[11px] max-w-xs">
                      Send a message, image, academic document, or voice note below to start collaborating.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const visibleMessages = chatMessages.filter((m) => {
                      if (blockedUids.has(m.senderUid)) return false;
                      if (
                        activeConversation.type !== 'direct' &&
                        mutedUserUids.has(m.senderUid)
                      ) {
                        return false;
                      }
                      if (!chatSearchQuery.trim()) return true;
                      const q = chatSearchQuery.trim().toLowerCase();
                      return (
                        (m.text || '').toLowerCase().includes(q) ||
                        (m.senderName || '').toLowerCase().includes(q) ||
                        (m.fileName || '').toLowerCase().includes(q)
                      );
                    });

                    if (visibleMessages.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-1 text-slate-500">
                          <Search className="w-5 h-5 text-slate-600" />
                          <p className="text-xs text-slate-400">
                            No messages matching &ldquo;{chatSearchQuery}&rdquo;
                          </p>
                        </div>
                      );
                    }

                    return visibleMessages.map((msg) => {
                      const isMine = msg.senderUid === currentUserUid;
                      const isGroupAdmin =
                        activeConversation.type === 'private_group' &&
                        (activeConversation.ownerUid === currentUserUid ||
                          (activeConversation.adminUids || []).includes(currentUserUid));
                      const canPinInConv =
                        isAdminOrOwner ||
                        isGroupAdmin ||
                        (activeConversation.type === 'community_group' && Boolean(lecturerRecord));
                      const isHighlighted = highlightedMessageId === msg.messageId;
                      const isDeleted = Boolean(msg.isDeleted);

                      // Check if message has been seen by other participants
                      const seenByOthers = isMine
                        ? Object.entries(activeConversation.lastReadAtByUser || {}).some(
                            ([uid, readIso]) =>
                              uid !== currentUserUid && readIso && readIso >= msg.createdAt
                          )
                        : false;

                      return (
                        <div
                          key={msg.messageId}
                          ref={(el) => {
                            messageItemRefs.current[msg.messageId] = el;
                          }}
                          className={`flex flex-col transition-all duration-300 ${
                            isMine ? 'items-end' : 'items-start'
                          } ${
                            isHighlighted
                              ? 'ring-2 ring-sky-400/80 bg-sky-500/10 rounded-2xl p-1.5'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            {!isMine && (
                              <span className="text-[10px] font-bold text-slate-300">
                                {msg.senderName}
                              </span>
                            )}
                            {!isMine && msg.senderRoleLabel && (
                              <span className="text-[9px] text-slate-500">
                                • {msg.senderRoleLabel}
                              </span>
                            )}
                            {msg.isPinned && !isDeleted && (
                              <span className="text-[9px] text-amber-400 font-semibold flex items-center gap-0.5">
                                <Pin className="w-2.5 h-2.5" /> Pinned
                              </span>
                            )}
                            <span className="text-[9px] text-slate-500">
                              {formatRelativeTime(msg.createdAt)}
                              {msg.editedAt && !isDeleted ? ' • Edited' : ''}
                            </span>
                            {isMine && !isDeleted && (
                              <span
                                className={`text-[9px] font-semibold ${
                                  seenByOthers ? 'text-sky-400' : 'text-slate-500'
                                }`}
                                title={seenByOthers ? 'Seen' : 'Sent'}
                              >
                                {seenByOthers ? '• Seen' : '• Sent'}
                              </span>
                            )}
                          </div>

                          <div
                            className={`group relative max-w-[85%] sm:max-w-[76%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                              isDeleted
                                ? 'bg-slate-900/60 border border-slate-800/80 text-slate-500 italic'
                                : isMine
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                            }`}
                          >
                            {isDeleted ? (
                              <p className="text-xs italic text-slate-400">
                                {msg.status === 'removed'
                                  ? 'This message was removed by a moderator.'
                                  : 'This message was deleted.'}
                              </p>
                            ) : (
                              <>
                                {/* Forwarded Indicator */}
                                {msg.isForwarded && (
                                  <div
                                    className={`mb-1.5 flex items-center gap-1 text-[10px] italic ${
                                      isMine ? 'text-blue-100' : 'text-sky-400'
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

                                {/* Reply Quote Banner (Clickable to scroll to original message) */}
                                {msg.replyToExcerpt && (
                                  <button
                                    type="button"
                                    onClick={() => handleScrollToMessage(msg.replyToMessageId)}
                                    className={`w-full text-left mb-2 px-2.5 py-1.5 rounded-lg border-l-2 text-[10px] transition cursor-pointer ${
                                      isMine
                                        ? 'bg-blue-700/60 hover:bg-blue-700/80 border-white/60 text-blue-100'
                                        : 'bg-slate-950 hover:bg-slate-950/80 border-sky-400 text-slate-400'
                                    }`}
                                    title="Tap to jump to original message"
                                  >
                                    <div className="font-bold">
                                      Replying to {msg.replyToSenderName || 'Member'}
                                    </div>
                                    <div className="truncate opacity-90">{msg.replyToExcerpt}</div>
                                  </button>
                                )}

                                {/* Image Attachment (Click to open Lightbox) */}
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
                                    className="block mb-2 cursor-pointer text-left"
                                    title="Tap to view full image"
                                  >
                                    <img
                                      src={msg.imageUrl}
                                      alt="Chat attachment"
                                      loading="lazy"
                                      className="rounded-xl max-h-60 object-cover border border-white/10 hover:opacity-95 transition"
                                    />
                                  </button>
                                )}

                                {/* File / Document Attachment */}
                                {msg.fileUrl && (
                                  <ChatFileAttachmentCard
                                    fileUrl={msg.fileUrl}
                                    fileName={msg.fileName}
                                    fileSize={msg.fileSize}
                                    fileMimeType={msg.fileMimeType}
                                    isMine={isMine}
                                  />
                                )}

                                {/* Voice Note Player */}
                                {msg.voiceUrl && (
                                  <VoiceNotePlayer
                                    voiceUrl={msg.voiceUrl}
                                    durationSec={msg.voiceDurationSec || 0}
                                    isMine={isMine}
                                  />
                                )}

                                {/* Message Text with Highlighted @Mentions */}
                                {msg.text && (
                                  <p className="whitespace-pre-line break-words">{msg.text}</p>
                                )}

                                {/* Link Preview Card */}
                                {msg.linkPreview && (
                                  <ChatLinkPreviewCard
                                    preview={msg.linkPreview}
                                    isMine={isMine}
                                  />
                                )}

                                {/* Reaction Pills on Message */}
                                {msg.reactionCounts &&
                                  Object.entries(msg.reactionCounts).some(([, c]) => c > 0) && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {Object.entries(msg.reactionCounts).map(([emoji, count]) =>
                                        count > 0 ? (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() =>
                                              handleReactChatMessage(msg.messageId, emoji)
                                            }
                                            className="px-1.5 py-0.5 rounded-full bg-black/25 hover:bg-black/40 text-[10px] flex items-center gap-1 cursor-pointer"
                                          >
                                            <span>{emoji}</span>
                                            <span>{count}</span>
                                          </button>
                                        ) : null
                                      )}
                                    </div>
                                  )}

                                {/* Expandable Multi-Emoji Reaction Bar */}
                                {activeReactionPickerMessageId === msg.messageId && (
                                  <div className="mt-2 p-1.5 rounded-xl bg-slate-950/95 border border-slate-700 flex items-center gap-1.5 shadow-lg">
                                    {SUPPORTED_REACTION_EMOJIS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => {
                                          handleReactChatMessage(msg.messageId, emoji);
                                          setActiveReactionPickerMessageId(null);
                                        }}
                                        className="p-1 rounded-lg hover:bg-slate-800 text-sm transition cursor-pointer"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Message Actions (Reply, React, Forward, Pin, Edit own, Delete own/admin, Report) */}
                                <div
                                  className={`mt-1.5 flex flex-wrap items-center gap-2.5 text-[10px] opacity-85 ${
                                    isMine
                                      ? 'justify-end text-blue-200'
                                      : 'justify-start text-slate-400'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyingToMessage({
                                        messageId: msg.messageId,
                                        senderName: msg.senderName,
                                        excerpt:
                                          msg.text ||
                                          (msg.fileName
                                            ? `📎 ${msg.fileName}`
                                            : msg.imageUrl
                                            ? '📷 Image'
                                            : msg.voiceUrl
                                            ? '🎤 Voice Note'
                                            : 'Message'),
                                      })
                                    }
                                    className="hover:text-white flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Reply className="w-3 h-3" />
                                    <span>Reply</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveReactionPickerMessageId((prev) =>
                                        prev === msg.messageId ? null : msg.messageId
                                      )
                                    }
                                    className="hover:text-white cursor-pointer"
                                    title="React with emoji"
                                  >
                                    😊 React
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setForwardingMessage(msg)}
                                    className="hover:text-white flex items-center gap-0.5 cursor-pointer"
                                    title="Forward message"
                                  >
                                    <CornerUpRight className="w-3 h-3" />
                                    <span>Forward</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleSaveGenericItem({
                                        itemType: msg.fileUrl ? 'file' : 'message',
                                        targetId: msg.messageId,
                                        conversationId: activeConversation.conversationId,
                                        courseCode: activeConversation.courseCode,
                                        title: msg.fileName
                                          ? msg.fileName
                                          : `Message from ${msg.senderName}`,
                                        excerpt:
                                          msg.text ||
                                          msg.fileName ||
                                          (msg.imageUrl ? 'Shared image' : 'Voice note'),
                                        authorName: msg.senderName,
                                        fileUrl: msg.fileUrl,
                                        fileName: msg.fileName,
                                        fileSizeLabel: msg.fileSize
                                          ? formatFileSize(msg.fileSize)
                                          : undefined,
                                        imageUrl: msg.imageUrl,
                                      })
                                    }
                                    className="hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                                    title="Save message or file to Bookmarks"
                                  >
                                    <Bookmark className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>

                                  {canPinInConv && (
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePinChatMessage(msg)}
                                      className="hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                                      title={msg.isPinned ? 'Unpin message' : 'Pin message'}
                                    >
                                      <Pin className="w-3 h-3" />
                                      <span>{msg.isPinned ? 'Unpin' : 'Pin'}</span>
                                    </button>
                                  )}

                                  {isMine && msg.text && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingChatMessage({
                                          messageId: msg.messageId,
                                          text: msg.text,
                                        });
                                        setChatInputText(msg.text);
                                      }}
                                      className="hover:text-white flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      <span>Edit</span>
                                    </button>
                                  )}

                                  {isMine && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteChatMessage(msg.messageId)}
                                      className="hover:text-white flex items-center gap-0.5 cursor-pointer"
                                      title="Delete message"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  )}

                                  {!isMine &&
                                    activeConversation.type !== 'direct' &&
                                    (isGroupAdmin || isAdminOrOwner || Boolean(lecturerRecord)) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleModeratorRemoveChatMessage(msg.messageId)
                                        }
                                        className="hover:text-rose-300 flex items-center gap-0.5 cursor-pointer"
                                        title="Moderator Remove Message"
                                      >
                                        <ShieldAlert className="w-3 h-3" />
                                        <span>Mod Remove</span>
                                      </button>
                                    )}

                                  {!isMine && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReportTarget({
                                          targetType: msg.fileUrl
                                            ? 'file'
                                            : msg.imageUrl
                                            ? 'image'
                                            : 'message',
                                          targetId: msg.messageId,
                                          targetAuthorUid: msg.senderUid,
                                          targetExcerpt:
                                            msg.text || msg.fileName || 'Media message',
                                          conversationId: activeConversation.conversationId,
                                        })
                                      }
                                      className="hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                                      title="Report message or attachment"
                                    >
                                      <Flag className="w-3 h-3" />
                                      <span>Report</span>
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* @Mention Autocomplete Picker */}
              {mentionPickerOpen && (
                <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 max-h-36 overflow-y-auto space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <AtSign className="w-3 h-3 text-sky-400" />
                    <span>Mention Participant</span>
                  </div>
                  {Object.values(activeConversation.participants || {})
                    .filter(
                      (p) =>
                        p.uid !== currentUserUid &&
                        (!mentionQuery ||
                          (p.name || '').toLowerCase().includes(mentionQuery.toLowerCase()))
                    )
                    .slice(0, 6)
                    .map((peer) => (
                      <button
                        key={peer.uid}
                        type="button"
                        onClick={() => handleSelectMention({ uid: peer.uid, name: peer.name })}
                        className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs text-left cursor-pointer"
                      >
                        <span className="font-semibold text-white">{peer.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {peer.roleLabel || 'Member'}
                        </span>
                      </button>
                    ))}
                </div>
              )}

              {/* Reply or Edit Banner above Composer */}
              {(replyingToMessage || editingChatMessage) && (
                <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="truncate">
                    {editingChatMessage ? (
                      <span className="text-amber-300 font-semibold">Editing your message</span>
                    ) : (
                      <>
                        <span className="text-sky-400 font-semibold">
                          Replying to {replyingToMessage?.senderName}:{' '}
                        </span>
                        <span className="text-slate-400">{replyingToMessage?.excerpt}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToMessage(null);
                      setEditingChatMessage(null);
                      if (editingChatMessage) setChatInputText('');
                    }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Chat Image Attachment Preview */}
              {chatImageUrl && (
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={chatImageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                    <span className="text-[11px] text-slate-300">
                      Image attached — add a caption below or press send
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatImageUrl('')}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Chat File / Document Attachment Preview */}
              {chatFileAttachment && (
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {chatFileAttachment.fileName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatFileSize(chatFileAttachment.fileSize)} • Ready to send
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatFileAttachment(null)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Voice Note Recorder Bar OR Standard Message Composer */}
              {recordingVoiceMode ? (
                <VoiceNoteRecorderBar
                  onSendVoiceNote={handleSendVoiceNote}
                  onCancel={() => setRecordingVoiceMode(false)}
                  sending={sendingVoiceNote}
                />
              ) : (
                <form
                  onSubmit={handleSendChatMessage}
                  className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 sm:gap-2"
                >
                  {/* Hidden Image Input */}
                  <input
                    ref={chatImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChatImageChange}
                    className="hidden"
                  />
                  {/* Hidden Academic File Input */}
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,application/pdf"
                    onChange={handleChatFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingChatImage || uploadingChatFile || Boolean(editingChatMessage)}
                    onClick={() => chatImageInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                    title="Share image"
                  >
                    {uploadingChatImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={uploadingChatFile || uploadingChatImage || Boolean(editingChatMessage)}
                    onClick={() => chatFileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                    title="Attach academic document (PDF, DOCX, PPTX, XLSX, TXT, ZIP)"
                  >
                    {uploadingChatFile ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(editingChatMessage)}
                    onClick={() => setRecordingVoiceMode(true)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                    title="Record voice note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => handleComposerTextChange(e.target.value)}
                    placeholder={
                      editingChatMessage
                        ? 'Update your message...'
                        : chatImageUrl || chatFileAttachment
                        ? 'Add a caption...'
                        : 'Write a message (use @ to mention)...'
                    }
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={
                      sendingMessage ||
                      (!chatInputText.trim() && !chatImageUrl && !chatFileAttachment)
                    }
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition cursor-pointer"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB: DISCUSSIONS FEED (+ COURSE COMMUNITY DUAL CHANNELS)
         ===================================================================== */}
      {activeTab === 'discussions' && (
        <div className="space-y-4">
          {/* Community Scope Selector Pills (University -> College -> Dept -> Programme -> Courses) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Academic Community Hierarchy
              </span>
              {selectedCommunityId !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCommunityId('all')}
                  className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                >
                  Show All My Communities
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCommunityId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                  selectedCommunityId === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All My Communities
              </button>

              {authorizedCommunities.map((space) => (
                <button
                  key={space.communityId}
                  type="button"
                  onClick={() => {
                    setSelectedCommunityId(space.communityId);
                    if (space.communityType !== 'course') {
                      setCourseModeTab('discussion');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                    selectedCommunityId === space.communityId
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {getSpaceIcon(space.communityType)}
                  <span>{space.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Community Space Banner */}
          {activeSpace && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {getSpaceIcon(activeSpace.communityType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        {activeSpace.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase font-semibold">
                        {activeSpace.communityType === 'academic_unit'
                          ? 'College / Unit Community'
                          : `${activeSpace.communityType.replace('_', ' ')} Community`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{activeSpace.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setAiAssistantModalState({
                        isOpen: true,
                        communitySpace: activeSpace,
                        action: 'ask',
                        targetItem: null,
                        initialPrompt: '',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask VENUE AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAiAssistantModalState({
                        isOpen: true,
                        communitySpace: activeSpace,
                        action: 'summarize_discussion',
                        targetItem: null,
                        initialPrompt: '',
                      })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Summarize</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAiAssistantModalState({
                        isOpen: true,
                        communitySpace: activeSpace,
                        action: 'find_unanswered',
                        targetItem: null,
                        initialPrompt: '',
                      })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Unanswered</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCommunityGroupChat(activeSpace)}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open Live Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal(activeSpace.communityId)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Post</span>
                  </button>
                </div>
              </div>

              {/* COURSE COMMUNITY DUAL COMMUNICATION MODES:
                  1) Course Discussion (Open to enrolled students & assigned lecturers)
                  2) Course Announcements (Official Lecturer Channel — Read, React & Acknowledge Only) */}
              {activeSpace.communityType === 'course' && (
                <div className="pt-2.5 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseModeTab('discussion')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      courseModeTab === 'discussion'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Course Discussion (Open Peer &amp; Q&amp;A)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseModeTab('announcements')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      courseModeTab === 'announcements'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Lecturer Announcements (Official Channel)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* If Course Community is in "Lecturer Announcements" mode, render CourseAnnouncementPanel */}
          {activeSpace?.communityType === 'course' && courseModeTab === 'announcements' ? (
            <CourseAnnouncementPanel
              courseSpace={activeSpace}
              profile={profile}
              canPublishAsLecturer={canPublishToSelectedCourse}
              assignedLecturers={
                assignedLecturersByCourse[
                  (activeSpace.courseCode || activeSpace.shortLabel || '').toUpperCase()
                ] || []
              }
              userReactionsMap={userReactionsMap}
              acknowledgedIds={acknowledgedIds}
              onToggleReaction={handleToggleReaction}
              onAcknowledge={handleAcknowledgeAnnouncement}
              onShowToast={showToast}
              onExplainWithAI={(item) =>
                setAiAssistantModalState({
                  isOpen: true,
                  communitySpace: activeSpace,
                  action: 'explain_item',
                  targetItem: item,
                  initialPrompt: `Explain this lecturer announcement for ${activeSpace.courseCode || activeSpace.name}: "${item.title || item.content.slice(0, 70)}"`,
                })
              }
              onSummarizeAnnouncementsWithAI={() =>
                setAiAssistantModalState({
                  isOpen: true,
                  communitySpace: activeSpace,
                  action: 'summarize_announcements',
                  targetItem: null,
                  initialPrompt: `Summarize the lecturer's latest announcements and instructions for ${activeSpace.courseCode || activeSpace.name}.`,
                })
              }
            />
          ) : (
            <>
              {/* Quick Create Rich Post Bar */}
              <div className="p-3 rounded-2xl bg-slate-900/85 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal( undefined, 'TEXT')}
                  className="flex-1 min-w-[180px] text-left px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-950/80 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Ask a question, share notes, create a poll, or schedule a study session...
                </button>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal(undefined, 'QUESTION')}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Question</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal(undefined, 'POLL')}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Poll</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal(undefined, 'EVENT')}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Study Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal(undefined, 'FILE')}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>File</span>
                  </button>
                </div>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts, questions, polls, study events, course codes, or authors..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFeedSort('recent')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1 cursor-pointer ${
                      feedSort === 'recent'
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Recent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedSort('trending')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1 cursor-pointer ${
                      feedSort === 'trending'
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Active / Trending</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['All', ...POST_CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Posts Feed */}
              {loadingPosts ? (
                <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                  <span className="text-xs">Loading live community discussions...</span>
                </div>
              ) : postsError ? (
                <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
                  <p className="text-xs text-rose-200 font-medium">{postsError}</p>
                </div>
              ) : displayedPosts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-sky-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      {searchQuery
                        ? 'No Matching Discussions Found'
                        : 'No posts yet. Start the first discussion.'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      {searchQuery
                        ? 'Try clearing your search filter or switching to All My Communities.'
                        : `Be the first member in ${
                            activeSpace
                              ? activeSpace.name
                              : profile?.programmeName ||
                                profile?.college ||
                                profile?.university ||
                                'your community'
                          } to ask a question, share study notes, create a poll, or schedule a study session.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Post</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedPosts.map((post) => {
                    const isExpanded = expandedPostId === post.postId;
                    const isLiked = likedIds.has(post.postId);
                    const myReactionEmoji = userReactionsMap[post.postId];
                    const isBookmarked = bookmarkedPostIds.has(post.postId);
                    const isAuthor = post.authorUid === currentUserUid;
                    const isAssignedCourseLecturer = Boolean(
                      lecturerRecord &&
                        post.courseCode &&
                        lecturerAssignments.some(
                          (a) =>
                            a.courseId === post.courseId ||
                            (a.courseCode || '').trim().toUpperCase() ===
                              (post.courseCode || '').trim().toUpperCase()
                        )
                    );
                    const isPostModerator =
                      isAdminOrOwner || Boolean(lecturerRecord) || isAssignedCourseLecturer;
                    const canModify = isAuthor || isPostModerator;
                    const canMarkBestAnswer =
                      isAuthor || isAdminOrOwner || isAssignedCourseLecturer || Boolean(lecturerRecord);

                    const rawPostComments = (commentsByPost[post.postId] || []).filter(
                      (c) => !blockedUids.has(c.authorUid) && !mutedUserUids.has(c.authorUid)
                    );
                    // Sort comments so Best Answer appears first, then chronological
                    const postComments = [...rawPostComments].sort((a, b) => {
                      const aBest = post.bestAnswerCommentId === a.commentId;
                      const bBest = post.bestAnswerCommentId === b.commentId;
                      if (aBest !== bBest) return aBest ? -1 : 1;
                      return (a.createdAt || '').localeCompare(b.createdAt || '');
                    });

                    if (post.status === 'removed') {
                      return (
                        <div
                          key={post.postId}
                          className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs italic text-slate-400 flex items-center justify-between gap-2"
                        >
                          <span>This post was removed by a moderator.</span>
                          <span className="text-[10px] text-slate-500">
                            {post.courseCode || post.communityName}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={post.postId}
                        className={`p-4 sm:p-5 rounded-2xl bg-slate-900/85 border space-y-3.5 transition ${
                          post.pinned
                            ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                            : post.bestAnswerCommentId
                            ? 'border-emerald-500/35'
                            : 'border-slate-800 hover:border-slate-700/80'
                        }`}
                      >
                        {/* Pinned / Question Solved / Locked Status Banner */}
                        {(post.pinned || post.bestAnswerCommentId || post.commentsLocked) && (
                          <div className="flex flex-wrap items-center gap-2 pb-1">
                            {post.pinned && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                                <Pin className="w-3 h-3" />
                                <span>Pinned in Community</span>
                              </span>
                            )}
                            {post.bestAnswerCommentId && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                <span>
                                  Answered
                                  {post.bestAnswerMarkedByRole === 'lecturer'
                                    ? ' • Verified by Lecturer'
                                    : ''}
                                </span>
                              </span>
                            )}
                            {post.commentsLocked && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>Comments Locked</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Post Author & Community Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {post.authorPhoto ? (
                              <img
                                src={post.authorPhoto}
                                alt={post.authorName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-blue-600/20 text-sky-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                {(post.authorName || 'S').charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white truncate">
                                  {post.authorName}
                                </span>
                                {post.isVerifiedAuthor && (
                                  <CheckCircle2
                                    className="w-3.5 h-3.5 text-sky-400 shrink-0"
                                    title="Verified Account"
                                  />
                                )}
                                {post.authorRole === 'lecturer' && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                                    Lecturer
                                  </span>
                                )}
                                {!isAuthor && post.authorUid && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartDirectChat({
                                        uid: post.authorUid,
                                        name: post.authorName,
                                        photo: post.authorPhoto,
                                        roleLabel: post.authorRoleLabel,
                                        accountRole: post.authorRole,
                                      })
                                    }
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-blue-600/30 text-sky-400 border border-slate-700 transition cursor-pointer"
                                    title={`Message ${post.authorName}`}
                                  >
                                    Message
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">
                                {post.authorRoleLabel || 'Student'} •{' '}
                                {formatRelativeTime(post.createdAt)}
                                {post.editedAt ? ' (edited)' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center gap-1">
                              {post.postType && post.postType !== 'TEXT' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                                  {post.postType}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-sky-400 border border-blue-500/20 font-medium">
                                {post.category}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {post.courseCode || post.communityName}
                            </span>
                          </div>
                        </div>

                        {/* Title, Rich Content, Images, Files, Links, Polls & Events */}
                        <div className="space-y-2.5">
                          <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line break-words">
                            {post.content}
                          </p>
                          <InlineAITranslationBlock
                            itemId={post.postId}
                            text={`${post.title ? `${post.title}\n` : ''}${post.content}`}
                            communityId={post.communityId}
                            courseCode={post.courseCode}
                            subscriptionPlan={profile?.subscriptionPlan}
                            compact
                          />

                          {/* Single or Multiple Images */}
                          {post.imageUrls && post.imageUrls.length > 1 ? (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {post.imageUrls.map((imgUrl, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() =>
                                    setLightboxMedia({
                                      imageUrl: imgUrl,
                                      caption: post.title,
                                      senderName: post.authorName,
                                    })
                                  }
                                  className="block cursor-pointer text-left"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`${post.title} (${idx + 1})`}
                                    loading="lazy"
                                    className="rounded-xl h-44 w-full object-cover border border-slate-800 hover:opacity-95 transition"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : post.imageUrl ? (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setLightboxMedia({
                                    imageUrl: post.imageUrl!,
                                    caption: post.title,
                                    senderName: post.authorName,
                                  })
                                }
                                className="block cursor-pointer text-left"
                                title="Tap to view full image"
                              >
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  loading="lazy"
                                  className="rounded-xl max-h-80 w-auto object-cover border border-slate-800 hover:opacity-95 transition"
                                />
                              </button>
                            </div>
                          ) : null}

                          {/* Academic File Attachment on Post */}
                          {post.fileUrl && (
                            <div className="pt-1 flex items-center gap-2 flex-wrap">
                              <div className="flex-1 min-w-[220px]">
                                <ChatFileAttachmentCard
                                  fileUrl={post.fileUrl}
                                  fileName={post.fileName}
                                  fileSize={post.fileSize}
                                  fileMimeType={post.fileMimeType}
                                  isMine={false}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleSaveGenericItem({
                                    itemType: 'file',
                                    targetId: `postfile_${post.postId}`,
                                    communityId: post.communityId,
                                    courseCode: post.courseCode,
                                    title: post.fileName || post.title,
                                    excerpt: `Shared by ${post.authorName} in ${post.communityName}`,
                                    authorName: post.authorName,
                                    fileUrl: post.fileUrl,
                                    fileName: post.fileName,
                                    fileSizeLabel: post.fileSize
                                      ? formatFileSize(post.fileSize)
                                      : undefined,
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-amber-300 flex items-center gap-1 cursor-pointer"
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Save File</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const matchedSpace =
                                    authorizedCommunities.find(
                                      (c) => c.communityId === post.communityId
                                    ) ||
                                    activeSpace ||
                                    authorizedCommunities[0] ||
                                    null;
                                  setAiAssistantModalState({
                                    isOpen: true,
                                    communitySpace: matchedSpace,
                                    action: 'explain_item',
                                    targetItem: {
                                      id: `postfile_${post.postId}`,
                                      type: 'shared_file',
                                      title: post.title,
                                      content: `${post.title}\n${post.content}`,
                                      authorName: post.authorName,
                                      authorRole: post.authorRole,
                                      courseCode: post.courseCode,
                                      createdAt: post.createdAt,
                                      fileName: post.fileName,
                                      fileUrl: post.fileUrl,
                                    },
                                    initialPrompt: `Explain the academic context and key concepts of the shared file "${post.fileName || post.title}" in ${post.courseCode || post.communityName}.`,
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300 flex items-center gap-1 cursor-pointer"
                                title="Ask VENUE AI about this shared file"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Ask AI about File</span>
                              </button>
                            </div>
                          )}

                          {/* Link Preview on Post */}
                          {post.linkPreview && (
                            <div className="pt-1">
                              <ChatLinkPreviewCard preview={post.linkPreview} isMine={false} />
                            </div>
                          )}

                          {/* Interactive Poll Card */}
                          {post.poll && (
                            <CommunityPollCard
                              post={post}
                              userSelectedOptionIds={userPollVotesMap[post.postId] || []}
                              onVote={(optIds) => handleVotePoll(post, optIds)}
                            />
                          )}

                          {/* Interactive Event / Study Session Card */}
                          {post.event && (
                            <CommunityEventCard
                              post={post}
                              userRsvp={userEventRsvpMap[post.postId]}
                              onRsvp={(status) => handleRsvpEvent(post, status)}
                              onAddToPlanner={() => handleAddEventToPlanner(post)}
                            />
                          )}
                        </div>

                        {/* Lightweight Emoji Reactions Row */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {SUPPORTED_REACTION_EMOJIS.map((emoji) => {
                            const count = Math.max(0, post.reactionCounts?.[emoji] || 0);
                            const isSelected = myReactionEmoji === emoji;
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(post.postId, 'post', emoji)}
                                className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 border transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600/30 border-blue-500/50 text-white font-bold'
                                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <span>{emoji}</span>
                                {count > 0 && <span className="text-[10px]">{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Action Bar */}
                        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Like Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleLike(post.postId, 'post')}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                                isLiked
                                  ? 'bg-blue-600/30 text-sky-300 border border-blue-500/40 font-bold'
                                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{post.likeCount || 0}</span>
                            </button>

                            {/* Comments Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleExpandPost(post.postId)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                                isExpanded
                                  ? 'bg-slate-800 text-white border border-slate-700'
                                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>
                                {post.commentCount || 0}{' '}
                                {(post.commentCount || 0) === 1 ? 'Comment' : 'Comments'}
                              </span>
                            </button>

                            {/* Bookmark */}
                            <button
                              type="button"
                              onClick={() => handleToggleBookmark(post)}
                              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                                isBookmarked
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800/80'
                              }`}
                              title={isBookmarked ? 'Remove bookmark' : 'Save post'}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>

                            {/* Share / Copy Link */}
                            <button
                              type="button"
                              onClick={() => handleSharePost(post)}
                              className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 transition cursor-pointer"
                              title="Share or copy post link"
                            >
                              {copiedPostId === post.postId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Explain with VENUE AI */}
                            <button
                              type="button"
                              onClick={() => {
                                const matchedSpace =
                                  authorizedCommunities.find(
                                    (c) => c.communityId === post.communityId
                                  ) ||
                                  activeSpace ||
                                  authorizedCommunities[0] ||
                                  null;
                                setAiAssistantModalState({
                                  isOpen: true,
                                  communitySpace: matchedSpace,
                                  action: 'explain_item',
                                  targetItem: {
                                    id: post.postId,
                                    type: 'post',
                                    title: post.title,
                                    content: post.content,
                                    authorName: post.authorName,
                                    authorRole: post.authorRole,
                                    courseCode: post.courseCode,
                                    createdAt: post.createdAt,
                                  },
                                  initialPrompt:
                                    post.postType === 'QUESTION' || post.category === 'Question'
                                      ? `Help me understand and solve this question from ${post.authorName} step by step: "${post.title || post.content.slice(0, 80)}"`
                                      : `Explain this post by ${post.authorName} in ${post.courseCode || post.communityName}: "${post.title || post.content.slice(0, 80)}"`,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Explain this post or question with VENUE AI"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span className="hidden sm:inline">Explain with AI</span>
                            </button>
                          </div>

                          {/* Right Side: Moderator Tools (Pin / Lock), Edit / Delete (Author/Admin) or Report / Block */}
                          <div className="flex items-center gap-1.5">
                            {isPostModerator && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModeratorPostAction(post, { pinned: !post.pinned })
                                  }
                                  className={`p-1.5 rounded-xl border transition cursor-pointer ${
                                    post.pinned
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-slate-950 text-slate-400 hover:text-amber-300 border-slate-800/80'
                                  }`}
                                  title={post.pinned ? 'Unpin post' : 'Pin post to top'}
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModeratorPostAction(post, {
                                      commentsLocked: !post.commentsLocked,
                                    })
                                  }
                                  className={`p-1.5 rounded-xl border transition cursor-pointer ${
                                    post.commentsLocked
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                      : 'bg-slate-950 text-slate-400 hover:text-rose-300 border-slate-800/80'
                                  }`}
                                  title={
                                    post.commentsLocked
                                      ? 'Unlock comments'
                                      : 'Lock comments on post'
                                  }
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {isAuthor && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(post)}
                                  className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-sky-400 border border-slate-800/80 transition cursor-pointer"
                                  title="Edit post"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingPostId(post.postId)}
                                  className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800/80 transition cursor-pointer"
                                  title="Delete post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {!isAuthor && isPostModerator && (
                              <button
                                type="button"
                                onClick={() => handleModeratorRemovePost(post)}
                                className="p-1.5 rounded-xl bg-slate-950 text-rose-400 hover:bg-rose-950/50 border border-rose-500/30 transition cursor-pointer"
                                title="Moderator Remove Post"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {!isAuthor && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReportTarget({
                                      targetType:
                                        post.postType === 'POLL'
                                          ? 'poll'
                                          : post.postType === 'EVENT'
                                          ? 'event'
                                          : post.postType === 'FILE'
                                          ? 'file'
                                          : post.postType === 'IMAGE'
                                          ? 'image'
                                          : 'post',
                                      targetId: post.postId,
                                      targetAuthorUid: post.authorUid,
                                      targetExcerpt: post.title,
                                      communityId: post.communityId,
                                    })
                                  }
                                  className="p-1.5 rounded-xl bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800/80 transition cursor-pointer"
                                  title="Report post"
                                >
                                  <Flag className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleMuteUser(post.authorUid, post.authorName)
                                  }
                                  className="p-1.5 rounded-xl bg-slate-950 text-slate-500 hover:text-amber-400 border border-slate-800/80 transition cursor-pointer"
                                  title={`Mute ${post.authorName}`}
                                >
                                  <VolumeX className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleBlockPeer(post.authorUid, post.authorName)
                                  }
                                  className="p-1.5 rounded-xl bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800/80 transition cursor-pointer"
                                  title={`Block ${post.authorName}`}
                                >
                                  <ShieldOff className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Expanded Comments & Replies Section */}
                        {isExpanded && (
                          <div className="pt-3 mt-2 border-t border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Comments &amp; Answers ({postComments.length})
                              </span>
                              {canMarkBestAnswer && postComments.length > 0 && (
                                <span className="text-[10px] text-emerald-400">
                                  Tip: You can mark the most helpful response as Best Answer
                                </span>
                              )}
                            </div>

                            {loadingCommentsFor === post.postId ? (
                              <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                                <span>Loading comments...</span>
                              </div>
                            ) : postComments.length === 0 ? (
                              <p className="text-xs text-slate-500 py-2">
                                No comments yet. Write an academic response below.
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {postComments.map((cmt) => {
                                  const isCommentAuthor = cmt.authorUid === currentUserUid;
                                  const canDeleteComment = isCommentAuthor || isPostModerator;
                                  const isCommentLiked = likedIds.has(cmt.commentId);
                                  const isBestAnswer =
                                    post.bestAnswerCommentId === cmt.commentId;
                                  const parentCmt = cmt.parentCommentId
                                    ? postComments.find((x) => x.commentId === cmt.parentCommentId)
                                    : null;

                                  return (
                                    <div
                                      key={cmt.commentId}
                                      className={`p-3 rounded-xl space-y-1.5 text-xs ${
                                        isBestAnswer
                                          ? 'bg-emerald-950/30 border-2 border-emerald-500/50'
                                          : 'bg-slate-950/90 border border-slate-800/90'
                                      } ${
                                        cmt.parentCommentId
                                          ? 'ml-4 border-l-2 border-l-blue-500/40'
                                          : ''
                                      }`}
                                    >
                                      {isBestAnswer && (
                                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-emerald-500/20">
                                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5" />
                                            <span>
                                              {post.bestAnswerMarkedByRole === 'lecturer'
                                                ? 'Lecturer Verified Answer'
                                                : 'Helpful / Best Answer'}
                                            </span>
                                          </span>
                                          {post.bestAnswerMarkedByName && (
                                            <span className="text-[10px] text-emerald-300/80">
                                              Marked by {post.bestAnswerMarkedByName}
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {parentCmt && (
                                        <div className="flex items-center gap-1 text-[10px] text-sky-400/90">
                                          <CornerDownRight className="w-3 h-3" />
                                          <span>Replying to {parentCmt.authorName}</span>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-white text-[11px]">
                                            {cmt.authorName}
                                          </span>
                                          {cmt.authorRole === 'lecturer' && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                                              Lecturer
                                            </span>
                                          )}
                                          {cmt.authorRoleLabel && (
                                            <span className="text-[10px] text-slate-500">
                                              {cmt.authorRoleLabel}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                          {formatRelativeTime(cmt.createdAt)}
                                        </span>
                                      </div>

                                      <p className="text-slate-300 leading-relaxed whitespace-pre-line break-words">
                                        {cmt.content}
                                      </p>

                                      <InlineAITranslationBlock
                                        itemId={cmt.commentId}
                                        text={cmt.content}
                                        communityId={post.communityId}
                                        courseCode={post.courseCode}
                                        subscriptionPlan={profile?.subscriptionPlan}
                                        compact
                                      />

                                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 flex-wrap gap-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const matchedSpace =
                                                authorizedCommunities.find(
                                                  (c) => c.communityId === post.communityId
                                                ) ||
                                                activeSpace ||
                                                authorizedCommunities[0] ||
                                                null;
                                              setAiAssistantModalState({
                                                isOpen: true,
                                                communitySpace: matchedSpace,
                                                action: 'explain_item',
                                                targetItem: {
                                                  id: cmt.commentId,
                                                  type: 'comment',
                                                  title: `Reply on: ${post.title}`,
                                                  content: cmt.content,
                                                  authorName: cmt.authorName,
                                                  authorRole: cmt.authorRole,
                                                  courseCode: post.courseCode,
                                                  createdAt: cmt.createdAt,
                                                },
                                                initialPrompt: `Explain this comment by ${cmt.authorName} on "${post.title}": "${cmt.content.slice(0, 90)}"`,
                                              });
                                            }}
                                            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                                          >
                                            <Sparkles className="w-3 h-3 text-amber-300" />
                                            <span>Explain</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleToggleLike(
                                                cmt.commentId,
                                                'comment',
                                                post.postId
                                              )
                                            }
                                            className={`flex items-center gap-1 hover:text-sky-400 cursor-pointer ${
                                              isCommentLiked ? 'text-sky-400 font-bold' : ''
                                            }`}
                                          >
                                            <ThumbsUp className="w-3 h-3" />
                                            <span>{cmt.likeCount || 0}</span>
                                          </button>

                                          {!post.commentsLocked && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setReplyingToComment({
                                                  postId: post.postId,
                                                  commentId: cmt.commentId,
                                                  authorName: cmt.authorName,
                                                })
                                              }
                                              className="hover:text-slate-300 cursor-pointer"
                                            >
                                              Reply
                                            </button>
                                          )}

                                          {canMarkBestAnswer && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleToggleBestAnswer(post, cmt.commentId)
                                              }
                                              className={`flex items-center gap-1 cursor-pointer ${
                                                isBestAnswer
                                                  ? 'text-emerald-400 font-bold'
                                                  : 'hover:text-emerald-400'
                                              }`}
                                            >
                                              <Award className="w-3 h-3" />
                                              <span>
                                                {isBestAnswer
                                                  ? 'Unmark Best Answer'
                                                  : 'Mark Best Answer'}
                                              </span>
                                            </button>
                                          )}

                                          {!isCommentAuthor && cmt.authorUid && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleStartDirectChat({
                                                  uid: cmt.authorUid,
                                                  name: cmt.authorName,
                                                  photo: cmt.authorPhoto,
                                                  roleLabel: cmt.authorRoleLabel,
                                                })
                                              }
                                              className="hover:text-sky-400 cursor-pointer"
                                            >
                                              Message
                                            </button>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {isCommentAuthor && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteComment(cmt.commentId, post.postId)
                                              }
                                              className="hover:text-rose-400 cursor-pointer"
                                              title="Delete comment"
                                            >
                                              Delete
                                            </button>
                                          )}
                                          {!isCommentAuthor &&
                                            isPostModerator &&
                                            cmt.status !== 'removed' && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleModeratorRemoveComment(
                                                    cmt.commentId,
                                                    post.postId
                                                  )
                                                }
                                                className="text-rose-400 hover:text-rose-300 cursor-pointer font-semibold"
                                                title="Moderator Remove Comment"
                                              >
                                                Mod Remove
                                              </button>
                                            )}
                                          {!isCommentAuthor && cmt.status !== 'removed' && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setReportTarget({
                                                  targetType: 'comment',
                                                  targetId: cmt.commentId,
                                                  targetAuthorUid: cmt.authorUid,
                                                  targetExcerpt: cmt.content,
                                                  communityId: post.communityId,
                                                })
                                              }
                                              className="hover:text-rose-400 cursor-pointer"
                                              title="Report comment"
                                            >
                                              Report
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Reply Indicator */}
                            {replyingToComment && replyingToComment.postId === post.postId && (
                              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-950/50 border border-blue-500/30 text-[11px] text-sky-300">
                                <span>Replying to {replyingToComment.authorName}</span>
                                <button
                                  type="button"
                                  onClick={() => setReplyingToComment(null)}
                                  className="text-slate-400 hover:text-white cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Add Comment Input OR Locked Notice */}
                            {post.commentsLocked && !isPostModerator ? (
                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-rose-400" />
                                <span>Comments on this discussion have been locked by a moderator.</span>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={commentInputByPost[post.postId] || ''}
                                  onChange={(e) =>
                                    setCommentInputByPost((prev) => ({
                                      ...prev,
                                      [post.postId]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment(post);
                                    }
                                  }}
                                  placeholder={
                                    replyingToComment && replyingToComment.postId === post.postId
                                      ? `Reply to ${replyingToComment.authorName}...`
                                      : 'Add a comment, explanation, or @mention...'
                                  }
                                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  disabled={
                                    submittingComment ||
                                    !(commentInputByPost[post.postId] || '').trim()
                                  }
                                  onClick={() => handleAddComment(post)}
                                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  {submittingComment ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Send className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          CREATE / EDIT RICH COMMUNITY POST MODAL (STAGE 11C-D)
         ===================================================================== */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingPost ? 'Edit Community Post' : 'Create Community Post'}
              </h3>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-3.5">
              {!editingPost && (
                <>
                  {/* Post Type Selector Tabs */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Post Format
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {(
                        [
                          { type: 'TEXT', label: 'Text' },
                          { type: 'QUESTION', label: 'Question' },
                          { type: 'POLL', label: 'Poll' },
                          { type: 'EVENT', label: 'Event' },
                          { type: 'IMAGE', label: 'Image' },
                          { type: 'FILE', label: 'File' },
                          { type: 'LINK', label: 'Link' },
                        ] as { type: CommunityPostType; label: string }[]
                      ).map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => {
                            setFormPostType(item.type);
                            if (item.type === 'QUESTION') setFormCategory('Question');
                            if (item.type === 'EVENT') setFormCategory('Study Group');
                            if (item.type === 'FILE') setFormCategory('Resource Share');
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                            formPostType === item.type
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Community Space */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Target Community
                      </label>
                      <select
                        value={formCommunityId}
                        onChange={(e) => setFormCommunityId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        {authorizedCommunities.map((space) => (
                          <option key={space.communityId} value={space.communityId}>
                            {space.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as CommunityPostCategory)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        {POST_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {editingPost && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CommunityPostCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {POST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {formPostType === 'QUESTION'
                    ? 'Your Academic Question'
                    : formPostType === 'EVENT'
                    ? 'Study Session / Event Title'
                    : 'Title'}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    formPostType === 'QUESTION'
                      ? 'e.g. Can someone explain how to solve this problem?'
                      : formPostType === 'POLL'
                      ? 'e.g. Which day should we hold the revision session?'
                      : formPostType === 'EVENT'
                      ? 'e.g. Weekend Past Paper Revision Session'
                      : 'e.g. Question on Lecture 4 Derivations / Summary Notes'
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Details</label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Provide context, problem steps, or discussion details..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Optional Link URL Input */}
              {!editingPost && (formPostType === 'LINK' || formLinkUrl) && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Reference Link (HTTPS URL)
                  </label>
                  <input
                    type="url"
                    value={formLinkUrl}
                    onChange={(e) => setFormLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* POLL BUILDER SECTION */}
              {!editingPost && formPostType === 'POLL' && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <BarChart2 className="w-4 h-4" />
                    <span>Configure Poll</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Poll Question (Defaults to post title if left blank)
                    </label>
                    <input
                      type="text"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="e.g. Which day works best for the study session?"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-slate-400">Poll Options</label>
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...pollOptions];
                            next[idx] = e.target.value;
                            setPollOptions(next);
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPollOptions(pollOptions.filter((_, i) => i !== idx))
                            }
                            className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 6 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pollMultipleChoice}
                        onChange={(e) => setPollMultipleChoice(e.target.checked)}
                      />
                      <span>Allow multiple choices</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pollResultsVisibleBeforeVote}
                        onChange={(e) => setPollResultsVisibleBeforeVote(e.target.checked)}
                      />
                      <span>Show results before voting</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Closing Date &amp; Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={pollClosesAt}
                      onChange={(e) => setPollClosesAt(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* STUDY SESSION / EVENT BUILDER SECTION */}
              {!editingPost && formPostType === 'EVENT' && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Study Session / Academic Event</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Date *</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required={formPostType === 'EVENT'}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Start Time *</label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        required={formPostType === 'EVENT'}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        End Time (Opt)
                      </label>
                      <input
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Location / Venue
                      </label>
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g. Main Library Room 3 / Lecture Theatre B"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Online Meeting Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={eventOnlineLink}
                        onChange={(e) => setEventOnlineLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGE & ACADEMIC FILE ATTACHMENTS */}
              {!editingPost && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={postImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePostImageChange}
                      className="hidden"
                    />
                    <input
                      ref={postFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,application/pdf"
                      onChange={handlePostFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingPostImage}
                      onClick={() => postImageInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      {uploadingPostImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingPostImage ? 'Uploading...' : 'Add Image'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={uploadingPostFile}
                      onClick={() => postFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      {uploadingPostFile ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Paperclip className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingPostFile ? 'Uploading...' : 'Attach Academic File'}</span>
                    </button>
                  </div>

                  {/* Uploaded Images Preview */}
                  {formImageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formImageUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-1"
                        >
                          <img
                            src={url}
                            alt="Attachment preview"
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = formImageUrls.filter((_, i) => i !== idx);
                              setFormImageUrls(next);
                              setFormImageUrl(next[0] || '');
                            }}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Uploaded File Preview */}
                  {formFileAttachment && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {formFileAttachment.fileName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatFileSize(formFileAttachment.fileSize)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormFileAttachment(null)}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost || uploadingPostImage || uploadingPostFile}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                >
                  {submittingPost
                    ? 'Publishing...'
                    : editingPost
                    ? 'Save Changes'
                    : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE POST CONFIRMATION MODAL
         ===================================================================== */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Delete Discussion Post?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently remove your post from the community feed. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={handleConfirmDeletePost}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                {isDeletingPost ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          REPORT CONTENT & USER MODAL (STAGE 11C-E SAFETY & MODERATION)
         ===================================================================== */}
      <SafetyReportModal
        target={
          reportTarget
            ? {
                targetType: reportTarget.targetType,
                targetId: reportTarget.targetId,
                reportedUserUid: reportTarget.targetAuthorUid,
                targetExcerpt: reportTarget.targetExcerpt,
                communityId: reportTarget.communityId,
                conversationId: reportTarget.conversationId,
              }
            : null
        }
        profile={profile}
        lecturer={lecturerRecord}
        onClose={() => setReportTarget(null)}
        onSuccess={(msg) => showToast(msg)}
        onError={(msg) => showToast(msg)}
        onBlockUser={(uid, name) => handleToggleBlockPeer(uid, name)}
        onMuteUser={(uid, name) => handleToggleMuteUser(uid, name)}
      />

      {/* =====================================================================
          PRIVACY, SAFETY, BLOCKED & MUTED SETTINGS MODAL (STAGE 11C-E)
         ===================================================================== */}
      <CommunitySafetyPrivacyModal
        isOpen={privacyModalOpen}
        currentUserId={currentUserUid}
        blockedUserIds={blockedUids}
        mutedUserIds={mutedUserUids}
        mutedCommunityIds={mutedCommunityIds}
        mutedConversationIds={mutedConversationIds}
        directoryPeers={knownPeers}
        communities={authorizedCommunities}
        onClose={() => setPrivacyModalOpen(false)}
        onToggleBlockUser={async (uid) => {
          const peer = knownPeers.find((p) => p.uid === uid);
          await handleToggleBlockPeer(uid, peer?.name || 'User');
        }}
        onToggleMuteUser={async (uid, name) => {
          const peer = knownPeers.find((p) => p.uid === uid);
          await handleToggleMuteUser(uid, name || peer?.name || 'User');
        }}
        onToggleMuteCommunity={async (cid) => {
          const sp = authorizedCommunities.find((c) => c.communityId === cid);
          await handleToggleMuteCommunity(cid, sp?.name || cid);
        }}
        onPrivacyUpdated={() => {}}
        onNotify={showToast}
      />

      {/* =====================================================================
          PRIVATE GROUP MODALS (CREATE & MANAGE ROLES / MEMBERS)
         ===================================================================== */}
      <CreatePrivateGroupModal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        profile={profile}
        lecturer={lecturerRecord}
        knownPeers={knownPeers}
        onGroupCreated={(created) => {
          setActiveConversation(created);
          setActiveTab('chat');
          showToast(`Created private group "${created.title}"`);
        }}
      />

      {activeConversation && activeConversation.type === 'private_group' && (
        <ManagePrivateGroupModal
          isOpen={manageGroupModalOpen}
          onClose={() => setManageGroupModalOpen(false)}
          conversation={activeConversation}
          currentUserUid={currentUserUid}
          knownPeers={knownPeers}
          onUpdated={(updated) => setActiveConversation(updated)}
          onShowToast={showToast}
        />
      )}

      {/* Full-Screen Image Lightbox Modal */}
      <ImageLightboxModal
        imageUrl={lightboxMedia?.imageUrl || null}
        caption={lightboxMedia?.caption}
        senderName={lightboxMedia?.senderName}
        onClose={() => setLightboxMedia(null)}
      />

      {/* Forward Message Modal */}
      <ForwardMessageModal
        message={forwardingMessage}
        sourceConversation={activeConversation}
        conversations={conversations}
        currentUserUid={currentUserUid}
        onClose={() => setForwardingMessage(null)}
        onForwardToConversation={handleForwardMessageToConversation}
      />

      {/* Stage 11C-F: Community AI Intelligence Modal */}
      {aiAssistantModalState.isOpen && (
        <CommunityAIAssistantModal
          isOpen={aiAssistantModalState.isOpen}
          onClose={() =>
            setAiAssistantModalState((prev) => ({
              ...prev,
              isOpen: false,
            }))
          }
          community={{
            id:
              aiAssistantModalState.communitySpace?.communityId ||
              activeSpace?.communityId ||
              authorizedCommunities[0]?.communityId ||
              'all_communities',
            name:
              aiAssistantModalState.communitySpace?.name ||
              activeSpace?.name ||
              authorizedCommunities[0]?.name ||
              'Academic Community',
            type:
              aiAssistantModalState.communitySpace?.communityType ||
              activeSpace?.communityType ||
              authorizedCommunities[0]?.communityType ||
              'course',
            description:
              aiAssistantModalState.communitySpace?.description ||
              activeSpace?.description ||
              authorizedCommunities[0]?.description,
            courseId:
              aiAssistantModalState.communitySpace?.courseId ||
              activeSpace?.courseId,
            courseCode:
              aiAssistantModalState.communitySpace?.courseCode ||
              activeSpace?.courseCode,
            courseTitle:
              aiAssistantModalState.communitySpace?.name ||
              activeSpace?.name,
          }}
          posts={posts.filter((p) => {
            const targetCid =
              aiAssistantModalState.communitySpace?.communityId ||
              activeSpace?.communityId;
            if (!targetCid || targetCid === 'all') return true;
            return p.communityId === targetCid;
          })}
          lecturerAnnouncements={lecturerAnnouncements.filter((la) => {
            const targetCode = (
              aiAssistantModalState.communitySpace?.courseCode ||
              activeSpace?.courseCode ||
              ''
            ).toUpperCase();
            if (!targetCode) return true;
            return (la.courseCode || '').toUpperCase() === targetCode;
          })}
          commentsByPostId={commentsByPost}
          lastVisitedAtIso={
            communityReadStates[
              aiAssistantModalState.communitySpace?.communityId ||
                activeSpace?.communityId ||
                ''
            ] || null
          }
          profile={profile}
          courses={courses}
          blockedUserIds={blockedUids}
          mutedUserIds={mutedUserUids}
          initialAction={aiAssistantModalState.action || 'ask'}
          initialTargetItem={aiAssistantModalState.targetItem || null}
          initialPrompt={aiAssistantModalState.initialPrompt || ''}
          onOpenSourceItem={(src) => {
            if (src.type === 'post') {
              setActiveTab('discussions');
              setExpandedPostId(src.id);
              void handleToggleExpandPost(src.id);
            } else if (src.type === 'announcement') {
              setActiveTab('announcements');
            }
          }}
        />
      )}
    </div>
  );
};
