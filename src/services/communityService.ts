import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  onSnapshot,
  DocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  db,
  auth,
  storage,
  handleFirestoreError,
  OperationType,
  isVerifiedOwnerAccount,
} from './firebase';
import {
  StudentProfile,
  Course,
  CommunitySpace,
  RealCommunityPost,
  RealCommunityComment,
  CommunityPostCategory,
  CommunityReportCategory,
  CommunityReportRecord,
  RealChatConversation,
  RealChatMessage,
  ChatParticipantInfo,
  LecturerCourseAnnouncement,
  LecturerCourseNoticeType,
  CommunityReactionRecord,
  CommunityAcknowledgementRecord,
  GroupMemberRole,
  LecturerCourseAssignment,
  LecturerRecord,
  AnnouncementRecord,
  NotificationItem,
  ChatLinkPreview,
  UserPresenceRecord,
  ConversationTypingStateRecord,
  MessageAttachmentType,
  CommunityPostType,
  CommunityPollData,
  CommunityPollVoteRecord,
  CommunityEventData,
  CommunityEventRsvpStatus,
  CommunityEventRsvpRecord,
  CommunityStudyGroupRecord,
  StudyGroupVisibility,
  CommunitySavedItemRecord,
  CommunityReportStatus,
  CommunityReportTargetType,
  CommunityRestrictionType,
  CommunityUserRestrictionRecord,
  UserCommunityPrivacySettings,
  CommunityAISummaryScope,
  CommunityAISourceReference,
  CommunityAIDiscussionSummary,
  CommunityAIUnansweredQuestion,
  CommunityAIMessage,
  CommunityAIConversation,
  CommunityAIFeedbackRecord,
  Course,
  StudentProfile,
} from '../types';
import { lecturerCourseService } from './lecturerCourseService';
import { lecturerAuthService } from './lecturerAuthService';
import { announcementsService } from './announcementsService';
import { studentDashboardService } from './studentDashboardService';
import { aiTutorMaterialContextService } from './aiTutorMaterialContextService';

export const COMMUNITY_COLLECTIONS = {
  POSTS: 'community_posts',
  COMMENTS: 'community_comments',
  LIKES: 'community_likes',
  REACTIONS: 'community_reactions',
  BOOKMARKS: 'community_bookmarks',
  SAVED_ITEMS: 'community_saved_items',
  POLL_VOTES: 'community_poll_votes',
  EVENT_RSVPS: 'community_event_rsvps',
  STUDY_GROUPS: 'community_study_groups',
  REPORTS: 'community_reports',
  CONVERSATIONS: 'chat_conversations',
  MESSAGES: 'messages', // Subcollection under chat_conversations/{conversationId}/messages
  LECTURER_ANNOUNCEMENTS: 'lecturer_course_announcements',
  ACKNOWLEDGEMENTS: 'community_acknowledgements',
  READ_STATES: 'community_read_states',
  BLOCKED_PEERS: 'user_blocked_peers',
  MUTED_CONVERSATIONS: 'user_muted_conversations',
  MUTED_USERS: 'user_muted_users',
  MUTED_COMMUNITIES: 'user_muted_communities',
  PRIVACY_SETTINGS: 'user_community_privacy_settings',
  USER_RESTRICTIONS: 'community_user_restrictions',
  COMMUNITY_BANS: 'community_bans',
  USER_PRESENCE: 'user_presence',
  TYPING_STATES: 'conversation_typing_states',
  NOTIFICATIONS: 'user_notifications',
  AI_CONVERSATIONS: 'community_ai_conversations',
  AI_FEEDBACK: 'community_ai_feedback',
} as const;

export const COMMUNITY_REPORT_REASONS: Array<{
  value: CommunityReportCategory;
  label: string;
}> = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'bullying', label: 'Bullying' },
  { value: 'hate_abusive', label: 'Hate / Abusive Content' },
  { value: 'sexual_inappropriate', label: 'Sexual / Inappropriate Content' },
  { value: 'scam_fraud', label: 'Scam / Fraud' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'academic_misconduct', label: 'Academic Misconduct' },
  { value: 'dangerous_content', label: 'Dangerous Content' },
  { value: 'other', label: 'Other' },
];

export const SUPPORTED_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👏'] as const;

export const ALLOWED_CHAT_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
] as const;

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Safely extracts HTTP/HTTPS links and generates a client-safe Link Preview
 * without fetching arbitrary external websites or exposing users to SSRF/malicious URLs.
 */
export function extractLinksAndSafePreview(text: string): {
  links: string[];
  preview: ChatLinkPreview | null;
} {
  if (!text) return { links: [], preview: null };
  const urlRegex = /https?:\/\/[^\s<>"'`]+/gi;
  const rawMatches = text.match(urlRegex) || [];
  const cleanLinks: string[] = [];

  for (const raw of rawMatches) {
    const trimmed = raw.replace(/[.,;!?)]+$/, '');
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        // Block suspicious IP-literal or credential-embedded URLs
        if (!parsed.username && !parsed.password && parsed.hostname.includes('.')) {
          if (!cleanLinks.includes(parsed.href)) {
            cleanLinks.push(parsed.href);
          }
        }
      }
    } catch {
      // ignore invalid URL
    }
  }

  if (cleanLinks.length === 0) {
    return { links: [], preview: null };
  }

  try {
    const firstUrl = new URL(cleanLinks[0]);
    const domain = firstUrl.hostname.replace(/^www\./i, '');
    const pathSegments = firstUrl.pathname
      .split('/')
      .filter(Boolean)
      .map((s) => decodeURIComponent(s).replace(/[-_]/g, ' '));

    const isAcademic =
      domain.endsWith('.ac.tz') ||
      domain.endsWith('.edu') ||
      domain.endsWith('.org') ||
      domain.endsWith('.gov.tz') ||
      domain.includes('udsm') ||
      domain.includes('scholar.google') ||
      domain.includes('arxiv.org') ||
      domain.includes('github.com') ||
      domain.includes('doi.org');

    const readablePath =
      pathSegments.length > 0
        ? pathSegments.slice(0, 2).join(' › ').slice(0, 80)
        : 'Shared Web Resource';

    return {
      links: cleanLinks.slice(0, 10),
      preview: {
        url: cleanLinks[0],
        domain,
        title: `${domain} — ${readablePath}`,
        description: isAcademic
          ? `Verified academic or reference link on ${domain}`
          : `Shared external link (${firstUrl.protocol}//${domain})`,
        isAcademicOrTrusted: isAcademic,
      },
    };
  } catch {
    return { links: cleanLinks.slice(0, 10), preview: null };
  }
}

export function sanitizeIdSegment(val?: string | null): string {
  if (!val) return '';
  return val
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

/**
 * Derives the exact set of authorized academic communities from the student's or lecturer's real placement
 * and enrolled/assigned courses in the canonical VENUE catalogue.
 * Never returns hardcoded or demo communities.
 */
export function buildAuthorizedCommunities(
  profile?: StudentProfile | null,
  courses: Course[] = [],
  lecturerAssignments: LecturerCourseAssignment[] = []
): CommunitySpace[] {
  const spaces: CommunitySpace[] = [];
  const seenCommIds = new Set<string>();

  const addSpace = (space: CommunitySpace) => {
    if (!seenCommIds.has(space.communityId)) {
      seenCommIds.add(space.communityId);
      spaces.push(space);
    }
  };

  const uniRaw =
    profile?.universityId ||
    profile?.universityShort ||
    profile?.university ||
    lecturerAssignments[0]?.universityId ||
    '';
  const uniId = sanitizeIdSegment(uniRaw);
  const uniName =
    profile?.universityName ||
    profile?.university ||
    profile?.universityShort ||
    (uniId === 'udsm' ? 'University of Dar es Salaam' : uniRaw);

  if (!uniId || !uniName || uniName === 'Not Selected') {
    return [];
  }

  // 1. University Community
  const uniCommId = `comm_uni_${uniId}`;
  addSpace({
    communityId: uniCommId,
    communityType: 'university',
    name: `${uniName} Community`,
    shortLabel: profile?.universityShort || uniName,
    description: `Official campus-wide academic discussions and peer collaboration for ${uniName}.`,
    universityId: uniId,
    universityName: uniName,
  });

  // 2. College / Academic Unit Community (Open discussion space for all members of the College/School/Institute)
  const unitRawId =
    profile?.academicUnitId ||
    profile?.collegeId ||
    profile?.institutionId ||
    lecturerAssignments[0]?.academicUnitId ||
    '';
  const unitName =
    profile?.academicUnitName ||
    profile?.college ||
    profile?.institutionName ||
    lecturerAssignments[0]?.academicUnitName ||
    '';
  const unitId = sanitizeIdSegment(unitRawId || unitName);
  if (unitId && unitName) {
    addSpace({
      communityId: `comm_unit_${uniId}_${unitId}`.slice(0, 120),
      communityType: 'academic_unit',
      name: unitName,
      shortLabel: unitName.length > 26 ? `${unitName.slice(0, 24)}…` : unitName,
      description: `Open College / Academic Unit discussion space for students and faculty in ${unitName}.`,
      universityId: uniId,
      universityName: uniName,
      academicUnitId: unitRawId || unitId,
      academicUnitName: unitName,
    });
  }

  // 3. Department Community
  const deptRawId = profile?.departmentId || lecturerAssignments[0]?.departmentId || '';
  const deptName =
    profile?.departmentName ||
    profile?.department ||
    lecturerAssignments[0]?.departmentName ||
    '';
  const deptId = sanitizeIdSegment(deptRawId || deptName);
  if (deptId && deptName) {
    addSpace({
      communityId: `comm_dept_${uniId}_${deptId}`.slice(0, 120),
      communityType: 'department',
      name: deptName,
      shortLabel: deptName.length > 26 ? `${deptName.slice(0, 24)}…` : deptName,
      description: `Departmental discussion space for students and lecturers in ${deptName}.`,
      universityId: uniId,
      universityName: uniName,
      academicUnitId: unitRawId || unitId,
      academicUnitName: unitName,
      departmentId: deptRawId || deptId,
      departmentName: deptName,
    });
  }

  // 4. Degree Programme Community
  const progRawId = profile?.programmeId || '';
  const progName = profile?.programmeName || profile?.programme || '';
  const progId = sanitizeIdSegment(progRawId || progName);
  if (progId && progName && progName !== 'Select Degree Programme') {
    addSpace({
      communityId: `comm_prog_${uniId}_${progId}`.slice(0, 120),
      communityType: 'programme',
      name: progName,
      shortLabel: profile?.programmeShort || progName,
      description: `Open degree programme community for ${progName} (${profile?.yearOfStudy || 'All Years'}).`,
      universityId: uniId,
      universityName: uniName,
      academicUnitId: unitRawId || unitId,
      academicUnitName: unitName,
      departmentId: deptRawId || deptId,
      departmentName: deptName,
      programmeId: progRawId || progId,
      programmeName: progName,
    });
  }

  // 5. Course Communities (from student's real enrolled curriculum courses)
  const seenCourseCodes = new Set<string>();
  for (const c of courses) {
    const code = (c.code || c.courseCode || '').trim().toUpperCase();
    if (!code || seenCourseCodes.has(code)) continue;
    seenCourseCodes.add(code);

    const codeSlug = sanitizeIdSegment(code);
    const cId = sanitizeIdSegment(c.id || codeSlug);
    const title = (c.title || c.courseName || code).trim();

    addSpace({
      communityId: `comm_course_${uniId}_${codeSlug}`.slice(0, 120),
      communityType: 'course',
      name: `${code}: ${title}`,
      shortLabel: code,
      description: `Course Community for ${code} (${title}) — includes Lecturer Announcements and Open Course Discussion.`,
      universityId: uniId,
      universityName: uniName,
      academicUnitId: unitRawId || unitId,
      departmentId: deptRawId || deptId,
      programmeId: progRawId || progId,
      courseId: c.id || cId,
      courseCode: code,
      courseTitle: title,
    });
  }

  // 6. Also include any courses assigned to the authenticated user if they are a Lecturer
  for (const lca of lecturerAssignments) {
    if (lca.status !== 'active') continue;
    const code = (lca.courseCode || '').trim().toUpperCase();
    if (!code || seenCourseCodes.has(code)) continue;
    seenCourseCodes.add(code);

    const codeSlug = sanitizeIdSegment(code);
    const cId = sanitizeIdSegment(lca.courseId || codeSlug);
    const title = (lca.courseTitle || code).trim();

    addSpace({
      communityId: `comm_course_${uniId}_${codeSlug}`.slice(0, 120),
      communityType: 'course',
      name: `${code}: ${title}`,
      shortLabel: code,
      description: `Course Community for ${code} (${title}) — Lecturer Channel & Open Student Discussion.`,
      universityId: uniId,
      universityName: uniName,
      academicUnitId: lca.academicUnitId || unitRawId || unitId,
      departmentId: lca.departmentId || deptRawId || deptId,
      programmeId: lca.programmeId || progRawId || progId,
      courseId: lca.courseId || cId,
      courseCode: code,
      courseTitle: title,
    });
  }

  return spaces;
}

class CommunityService {
  // In-memory cache for lecturer assignments by courseCode
  private courseLecturersCache = new Map<
    string,
    Array<{ lecturerId: string; userId?: string; name: string; title?: string; email?: string }>
  >();

  /**
   * Resolves the authenticated user's verified UID and identity details.
   * Rejects unauthenticated calls so fake identities can never be injected.
   */
  getAuthenticatedIdentity(
    profile?: StudentProfile | null,
    lecturerRecord?: LecturerRecord | null
  ): {
    uid: string;
    name: string;
    photo: string;
    roleLabel: string;
    accountRole: 'student' | 'lecturer' | 'admin';
    isVerified: boolean;
  } {
    const currentUser = auth.currentUser;
    const uid = (currentUser?.uid || profile?.uid || '').trim();
    if (!uid) {
      throw new Error('Authentication required. Please sign in to participate in the VENUE Community.');
    }

    const isOwnerAdmin = isVerifiedOwnerAccount(uid, currentUser?.email || profile?.email);

    if (lecturerRecord && lecturerRecord.status === 'active') {
      const lecDisplay = lecturerRecord.title
        ? `${lecturerRecord.title} ${lecturerRecord.fullName}`
        : lecturerRecord.fullName;
      return {
        uid,
        name: lecDisplay.slice(0, 100),
        photo: (lecturerRecord.photoURL || currentUser?.photoURL || '').trim(),
        roleLabel: `${lecturerRecord.position || 'Lecturer'} • ${lecturerRecord.departmentName || 'Faculty'}`.slice(
          0,
          120
        ),
        accountRole: 'lecturer',
        isVerified: lecturerRecord.verificationStatus === 'verified',
      };
    }

    const name = (
      profile?.name ||
      profile?.fullName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Verified Student'
    )
      .trim()
      .slice(0, 100);

    const photo = (
      profile?.profilePhoto ||
      profile?.avatar ||
      profile?.photoURL ||
      currentUser?.photoURL ||
      ''
    ).trim();

    const progLabel = (profile?.programmeShort || profile?.programmeName || profile?.programme || '').trim();
    const yrLabel = (profile?.yearOfStudy || '').trim();
    const roleLabel = isOwnerAdmin
      ? 'Platform Administrator'
      : progLabel && progLabel !== 'Select Degree Programme'
      ? yrLabel
        ? `${progLabel} • ${yrLabel}`
        : progLabel
      : yrLabel || 'Verified Student';

    return {
      uid,
      name,
      photo,
      roleLabel: roleLabel.slice(0, 120),
      accountRole: isOwnerAdmin ? 'admin' : 'student',
      isVerified: Boolean(
        currentUser?.emailVerified || profile?.emailVerified || profile?.registrationNumber || isOwnerAdmin
      ),
    };
  }

  /**
   * Resolves whether the current authenticated user is an active verified lecturer,
   * and returns their LecturerRecord + assigned courses.
   */
  async getAuthenticatedLecturerContext(uid?: string): Promise<{
    isLecturer: boolean;
    lecturer: LecturerRecord | null;
    assignments: LecturerCourseAssignment[];
  }> {
    const targetUid = uid || auth.currentUser?.uid || '';
    if (!targetUid) {
      return { isLecturer: false, lecturer: null, assignments: [] };
    }
    try {
      const lecturer = await lecturerAuthService.getLecturerByUid(targetUid);
      if (!lecturer || lecturer.status !== 'active') {
        return { isLecturer: false, lecturer: null, assignments: [] };
      }
      const assignments = await lecturerCourseService.getAssignmentsByLecturer(lecturer.id);
      return {
        isLecturer: true,
        lecturer,
        assignments: assignments.filter((a) => a.status === 'active'),
      };
    } catch {
      return { isLecturer: false, lecturer: null, assignments: [] };
    }
  }

  /**
   * Resolves the real lecturers assigned to a given courseCode or courseId from `lecturer_courses`.
   */
  async getAssignedLecturersForCourse(
    courseId: string,
    courseCode: string
  ): Promise<Array<{ lecturerId: string; userId?: string; name: string; title?: string; email?: string }>> {
    const cleanCode = (courseCode || '').trim().toUpperCase();
    const cacheKey = `${courseId}_${cleanCode}`;
    if (this.courseLecturersCache.has(cacheKey)) {
      return this.courseLecturersCache.get(cacheKey) || [];
    }

    try {
      const byId = courseId ? await lecturerCourseService.getAssignmentsByCourse(courseId) : [];
      let assignments = byId;

      if (assignments.length === 0 && cleanCode) {
        const q = query(
          collection(db, 'lecturer_courses'),
          where('courseCode', '==', cleanCode),
          limit(10)
        );
        const snap = await getDocs(q);
        assignments = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as LecturerCourseAssignment[];
      }

      const activeAssignments = assignments.filter((a) => a.status === 'active');
      const results: Array<{
        lecturerId: string;
        userId?: string;
        name: string;
        title?: string;
        email?: string;
      }> = [];
      const seenLecIds = new Set<string>();

      for (const a of activeAssignments) {
        if (!a.lecturerId || seenLecIds.has(a.lecturerId)) continue;
        seenLecIds.add(a.lecturerId);
        try {
          const lecSnap = await getDoc(doc(db, 'lecturers', a.lecturerId));
          if (lecSnap.exists()) {
            const lec = lecSnap.data() as LecturerRecord;
            if (lec.status === 'active') {
              results.push({
                lecturerId: a.lecturerId,
                userId: lec.userId || a.userId,
                name: lec.title ? `${lec.title} ${lec.fullName}` : lec.fullName,
                title: lec.position || lec.title,
                email: lec.email,
              });
            }
          }
        } catch {
          // ignore individual lookup error
        }
      }

      this.courseLecturersCache.set(cacheKey, results);
      return results;
    } catch {
      return [];
    }
  }

  /**
   * Uploads an image attachment for a community post, lecturer announcement, or chat message.
   */
  async uploadCommunityImage(file: File, folder: 'posts' | 'chat' | 'announcements' = 'posts'): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be signed in to upload an image.');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be under 5 MB.');
    }

    const compressedDataUrl = await this.compressImageFile(file, 1000, 0.8);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
      const storagePath = `community_${folder}/${currentUser.uid}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch {
      return compressedDataUrl;
    }
  }

  private compressImageFile(file: File, maxDimension = 1000, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Failed to process image file.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }

  // ============================================================================
  // LECTURER COURSE ANNOUNCEMENT CHANNEL (SEPARATED FROM OPEN COURSE DISCUSSION)
  // ============================================================================

  /**
   * Verifies that the authenticated user is either an active lecturer assigned to the target course
   * OR an authorized platform admin.
   * Throws an error if a student or unassigned lecturer attempts to publish to a Lecturer Course Channel.
   */
  async verifyCanManageLecturerCourseChannel(
    courseId: string,
    courseCode: string
  ): Promise<{
    authorized: boolean;
    lecturerId: string;
    lecturerName: string;
    lecturerTitle: string;
    lecturerPhoto: string;
  }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    const cleanCode = (courseCode || '').trim().toUpperCase();
    const cleanCourseId = (courseId || '').trim();

    // Check if user is an assigned lecturer for this course
    const lecCtx = await this.getAuthenticatedLecturerContext(currentUser.uid);
    if (lecCtx.isLecturer && lecCtx.lecturer) {
      const matchingAssignment = lecCtx.assignments.find(
        (a) =>
          a.courseId === cleanCourseId ||
          (a.courseCode || '').trim().toUpperCase() === cleanCode ||
          sanitizeIdSegment(a.courseCode) === sanitizeIdSegment(cleanCode)
      );

      if (matchingAssignment) {
        return {
          authorized: true,
          lecturerId: lecCtx.lecturer.id,
          lecturerName: lecCtx.lecturer.title
            ? `${lecCtx.lecturer.title} ${lecCtx.lecturer.fullName}`
            : lecCtx.lecturer.fullName,
          lecturerTitle: lecCtx.lecturer.position || lecCtx.lecturer.title || 'Course Lecturer',
          lecturerPhoto: lecCtx.lecturer.photoURL || currentUser.photoURL || '',
        };
      }

      throw new Error(
        `Access denied: You are not assigned as a lecturer for ${cleanCode}. Lecturers can only publish official course announcements for their assigned courses.`
      );
    }

    // Allow verified platform owner / super admin for institutional oversight
    if (isVerifiedOwnerAccount(currentUser.uid, currentUser.email)) {
      return {
        authorized: true,
        lecturerId: `admin_${currentUser.uid}`,
        lecturerName: currentUser.displayName || 'Course Administration',
        lecturerTitle: 'Academic Administration',
        lecturerPhoto: currentUser.photoURL || '',
      };
    }

    throw new Error(
      'Permission denied: Only the verified lecturer assigned to this course can publish to the Lecturer Announcement Channel.'
    );
  }

  /**
   * Subscribes to official Lecturer Course Announcements for a course or list of courseCodes.
   */
  subscribeToLecturerCourseAnnouncements(
    options: {
      courseCode?: string;
      courseCodes?: string[];
      universityId?: string;
      limitCount?: number;
    },
    onUpdate: (items: LecturerCourseAnnouncement[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!auth.currentUser) {
      onUpdate([]);
      return () => {};
    }

    const colRef = collection(db, COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS);
    const maxItems = options.limitCount || 40;
    const cleanCode = options.courseCode ? options.courseCode.trim().toUpperCase() : '';

    const q = cleanCode
      ? query(colRef, where('courseCode', '==', cleanCode), limit(maxItems))
      : options.universityId
      ? query(colRef, where('universityId', '==', sanitizeIdSegment(options.universityId)), limit(maxItems))
      : query(colRef, limit(maxItems));

    const allowedCodes =
      options.courseCodes && options.courseCodes.length > 0
        ? new Set(options.courseCodes.map((c) => c.trim().toUpperCase()))
        : null;

    return onSnapshot(
      q,
      (snap) => {
        const list: LecturerCourseAnnouncement[] = [];
        snap.forEach((d) => {
          const data = d.data() as LecturerCourseAnnouncement;
          if (data.status === 'active') {
            if (!allowedCodes || allowedCodes.has((data.courseCode || '').toUpperCase())) {
              list.push({
                ...data,
                id: data.id || d.id,
              });
            }
          }
        });
        list.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        onUpdate(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }

  /**
   * Publishes a new official Lecturer Course Announcement.
   * Strictly checks lecturer-course assignment first.
   */
  async createLecturerCourseAnnouncement(input: {
    courseSpace: CommunitySpace;
    noticeType: LecturerCourseNoticeType;
    title: string;
    content: string;
    externalLink?: string;
    imageUrl?: string;
    pinned?: boolean;
  }): Promise<LecturerCourseAnnouncement> {
    const courseCode = (input.courseSpace.courseCode || input.courseSpace.shortLabel || '').trim().toUpperCase();
    const courseId = input.courseSpace.courseId || sanitizeIdSegment(courseCode);

    const authCheck = await this.verifyCanManageLecturerCourseChannel(courseId, courseCode);

    const cleanTitle = input.title.trim().slice(0, 200);
    const cleanContent = input.content.trim().slice(0, 8000);
    if (cleanTitle.length < 3 || cleanContent.length < 3) {
      throw new Error('Announcement title and content must be at least 3 characters.');
    }

    const id = `lca_notice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const record: LecturerCourseAnnouncement = {
      id,
      courseId,
      courseCode,
      courseTitle: input.courseSpace.courseTitle || input.courseSpace.name,
      universityId: input.courseSpace.universityId,
      academicUnitId: input.courseSpace.academicUnitId || '',
      departmentId: input.courseSpace.departmentId || '',
      programmeId: input.courseSpace.programmeId || '',
      lecturerId: authCheck.lecturerId,
      lecturerUid: auth.currentUser!.uid,
      lecturerName: authCheck.lecturerName,
      lecturerTitle: authCheck.lecturerTitle,
      lecturerPhoto: authCheck.lecturerPhoto,
      noticeType: input.noticeType,
      title: cleanTitle,
      content: cleanContent,
      externalLink: (input.externalLink || '').trim().slice(0, 500),
      imageUrl: input.imageUrl || '',
      pinned: Boolean(input.pinned),
      reactionCounts: {},
      ackCount: 0,
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
      editedAt: null,
    };

    try {
      await setDoc(doc(db, COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS, id), record);
      return record;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `${COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS}/${id}`
      );
    }
  }

  /**
   * Updates an existing Lecturer Course Announcement (edit title, content, noticeType, or pin status).
   */
  async updateLecturerCourseAnnouncement(
    announcementId: string,
    courseId: string,
    courseCode: string,
    updates: {
      title?: string;
      content?: string;
      noticeType?: LecturerCourseNoticeType;
      externalLink?: string;
      pinned?: boolean;
    }
  ): Promise<void> {
    await this.verifyCanManageLecturerCourseChannel(courseId, courseCode);
    const nowIso = new Date().toISOString();
    const payload: Record<string, any> = {
      updatedAt: nowIso,
    };
    if (typeof updates.title === 'string') {
      payload.title = updates.title.trim().slice(0, 200);
      payload.editedAt = nowIso;
    }
    if (typeof updates.content === 'string') {
      payload.content = updates.content.trim().slice(0, 8000);
      payload.editedAt = nowIso;
    }
    if (updates.noticeType) payload.noticeType = updates.noticeType;
    if (typeof updates.externalLink === 'string') payload.externalLink = updates.externalLink.trim().slice(0, 500);
    if (typeof updates.pinned === 'boolean') payload.pinned = updates.pinned;

    try {
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS, announcementId), payload);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS}/${announcementId}`
      );
    }
  }

  /**
   * Deletes a Lecturer Course Announcement.
   */
  async deleteLecturerCourseAnnouncement(
    announcementId: string,
    courseId: string,
    courseCode: string
  ): Promise<void> {
    await this.verifyCanManageLecturerCourseChannel(courseId, courseCode);
    try {
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS, announcementId), {
        status: 'deleted',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `${COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS}/${announcementId}`
      );
    }
  }

  // ============================================================================
  // LIGHTWEIGHT REACTIONS & ACKNOWLEDGEMENTS (READ RECEIPTS FOR ANNOUNCEMENTS)
  // ============================================================================

  /**
   * Fetches all reactions created by the current user so UI buttons highlight accurately.
   * Returns a map of targetId -> emoji.
   */
  async getUserReactionsMap(userId: string): Promise<Record<string, string>> {
    if (!userId || !auth.currentUser) return {};
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.REACTIONS),
        where('userId', '==', userId),
        limit(300)
      );
      const snap = await getDocs(q);
      const map: Record<string, string> = {};
      snap.forEach((d) => {
        const data = d.data() as CommunityReactionRecord;
        if (data?.targetId && data?.emoji) {
          map[data.targetId] = data.emoji;
        }
      });
      return map;
    } catch {
      return {};
    }
  }

  /**
   * Toggles a reaction emoji on a post, lecturer announcement, or official university/college announcement.
   * Uses a single deterministic document `${targetId}_${userId}` to prevent excessive writes.
   */
  async toggleReaction(input: {
    targetId: string;
    targetType: 'post' | 'lecturer_announcement' | 'official_announcement';
    emoji: string;
    profile?: StudentProfile | null;
  }): Promise<{ activeEmoji: string | null }> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Please sign in to react.');

    const uid = currentUser.uid;
    const reactionDocId = `${input.targetId}_${uid}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    const reactionRef = doc(db, COMMUNITY_COLLECTIONS.REACTIONS, reactionDocId);

    const parentCollection =
      input.targetType === 'post'
        ? COMMUNITY_COLLECTIONS.POSTS
        : input.targetType === 'lecturer_announcement'
        ? COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS
        : 'announcements';
    const parentRef = doc(db, parentCollection, input.targetId);

    try {
      const existing = await getDoc(reactionRef);
      if (existing.exists()) {
        const prevEmoji = existing.data()?.emoji;
        if (prevEmoji === input.emoji) {
          // Remove reaction
          await deleteDoc(reactionRef);
          if (input.targetType !== 'official_announcement') {
            await updateDoc(parentRef, {
              [`reactionCounts.${input.emoji}`]: increment(-1),
            }).catch(() => {});
          }
          return { activeEmoji: null };
        } else {
          // Switch emoji
          await setDoc(reactionRef, {
            id: reactionDocId,
            targetId: input.targetId,
            targetType: input.targetType,
            userId: uid,
            userName: input.profile?.name || currentUser.displayName || 'Student',
            emoji: input.emoji,
            createdAt: new Date().toISOString(),
          });
          if (input.targetType !== 'official_announcement') {
            await updateDoc(parentRef, {
              [`reactionCounts.${prevEmoji}`]: increment(-1),
              [`reactionCounts.${input.emoji}`]: increment(1),
            }).catch(() => {});
          }
          return { activeEmoji: input.emoji };
        }
      } else {
        await setDoc(reactionRef, {
          id: reactionDocId,
          targetId: input.targetId,
          targetType: input.targetType,
          userId: uid,
          userName: input.profile?.name || currentUser.displayName || 'Student',
          emoji: input.emoji,
          createdAt: new Date().toISOString(),
        });
        if (input.targetType !== 'official_announcement') {
          await updateDoc(parentRef, {
            [`reactionCounts.${input.emoji}`]: increment(1),
          }).catch(() => {});
        }
        return { activeEmoji: input.emoji };
      }
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.REACTIONS}/${reactionDocId}`
      );
    }
  }

  /**
   * Fetches the set of announcement IDs acknowledged by the current user.
   */
  async getUserAcknowledgedIds(userId: string): Promise<Set<string>> {
    if (!userId || !auth.currentUser) return new Set();
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.ACKNOWLEDGEMENTS),
        where('userId', '==', userId),
        limit(300)
      );
      const snap = await getDocs(q);
      const set = new Set<string>();
      snap.forEach((d) => {
        const data = d.data() as CommunityAcknowledgementRecord;
        if (data?.targetId) set.add(data.targetId);
      });
      return set;
    } catch {
      return new Set();
    }
  }

  /**
   * Marks an official Lecturer Course Announcement or University/College Announcement as Acknowledged / Read.
   */
  async acknowledgeAnnouncement(input: {
    targetId: string;
    targetType: 'lecturer_announcement' | 'official_announcement';
    courseCode?: string;
    profile?: StudentProfile | null;
  }): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');

    const uid = currentUser.uid;
    const ackId = `${input.targetId}_${uid}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    const ackRef = doc(db, COMMUNITY_COLLECTIONS.ACKNOWLEDGEMENTS, ackId);

    try {
      const existing = await getDoc(ackRef);
      if (existing.exists()) return true;

      const record: CommunityAcknowledgementRecord = {
        id: ackId,
        targetId: input.targetId,
        targetType: input.targetType,
        courseCode: input.courseCode || '',
        userId: uid,
        userName: (input.profile?.name || currentUser.displayName || 'Verified Student').slice(0, 100),
        registrationNumber: input.profile?.registrationNumber || '',
        acknowledgedAt: new Date().toISOString(),
      };

      await setDoc(ackRef, record);

      if (input.targetType === 'lecturer_announcement') {
        await updateDoc(doc(db, COMMUNITY_COLLECTIONS.LECTURER_ANNOUNCEMENTS, input.targetId), {
          ackCount: increment(1),
        }).catch(() => {});
      } else {
        await announcementsService.markAsRead(input.targetId, uid).catch(() => {});
      }

      return true;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.ACKNOWLEDGEMENTS}/${ackId}`
      );
    }
  }

  /**
   * Allows a lecturer or admin to inspect the list of students who acknowledged a specific announcement.
   */
  async getAcknowledgementsForTarget(
    targetId: string,
    maxCount = 50
  ): Promise<CommunityAcknowledgementRecord[]> {
    if (!targetId || !auth.currentUser) return [];
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.ACKNOWLEDGEMENTS),
        where('targetId', '==', targetId),
        limit(maxCount)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => d.data() as CommunityAcknowledgementRecord);
      list.sort((a, b) => (b.acknowledgedAt || '').localeCompare(a.acknowledgedAt || ''));
      return list;
    } catch {
      return [];
    }
  }

  // ============================================================================
  // UNREAD COUNTS & READ STATE TRACKING (SCALABLE WITHOUT FULL DOWNLOADS)
  // ============================================================================

  async getUserCommunityReadStates(userId: string): Promise<Record<string, string>> {
    if (!userId || !auth.currentUser) return {};
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.READ_STATES),
        where('userId', '==', userId),
        limit(100)
      );
      const snap = await getDocs(q);
      const map: Record<string, string> = {};
      snap.forEach((d) => {
        const data = d.data();
        if (data?.communityId && data?.lastReadAt) {
          map[data.communityId] = data.lastReadAt;
        }
      });
      return map;
    } catch {
      return {};
    }
  }

  async markCommunityVisited(communityId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !communityId || communityId === 'all') return;
    const docId = `${currentUser.uid}_${communityId}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    try {
      await setDoc(
        doc(db, COMMUNITY_COLLECTIONS.READ_STATES, docId),
        {
          id: docId,
          userId: currentUser.uid,
          communityId,
          lastReadAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // non-blocking
    }
  }

  /**
   * Computes real unread / activity summary for the Home Dashboard Community Card and Notifications
   * without downloading entire collections.
   */
  async getHomeCommunitySummary(
    profile?: StudentProfile | null,
    courses: Course[] = []
  ): Promise<{
    unreadMessagesCount: number;
    recentDiscussionsCount: number;
    unreadAnnouncementsCount: number;
  }> {
    const uid = auth.currentUser?.uid || profile?.uid || '';
    if (!uid) {
      return { unreadMessagesCount: 0, recentDiscussionsCount: 0, unreadAnnouncementsCount: 0 };
    }

    try {
      const spaces = buildAuthorizedCommunities(profile, courses);
      const uniSpace = spaces.find((s) => s.communityType === 'university');
      const allowedCommIds = new Set(spaces.map((s) => s.communityId));

      const [convSnap, postsSnap, readStates] = await Promise.all([
        getDocs(
          query(
            collection(db, COMMUNITY_COLLECTIONS.CONVERSATIONS),
            where('participantIds', 'array-contains', uid),
            limit(30)
          )
        ).catch(() => null),
        uniSpace
          ? getDocs(
              query(
                collection(db, COMMUNITY_COLLECTIONS.POSTS),
                where('universityId', '==', uniSpace.universityId),
                limit(25)
              )
            ).catch(() => null)
          : Promise.resolve(null),
        this.getUserCommunityReadStates(uid),
      ]);

      let unreadMessagesCount = 0;
      if (convSnap) {
        convSnap.forEach((d) => {
          const data = d.data() as RealChatConversation;
          const myUnread = data.unreadCountByUser?.[uid] || 0;
          unreadMessagesCount += myUnread;
        });
      }

      let recentDiscussionsCount = 0;
      if (postsSnap) {
        postsSnap.forEach((d) => {
          const post = d.data() as RealCommunityPost;
          if (post.status === 'active' && allowedCommIds.has(post.communityId)) {
            const lastRead = readStates[post.communityId];
            if (!lastRead || (post.createdAt > lastRead && post.authorUid !== uid)) {
              recentDiscussionsCount += 1;
            }
          }
        });
      }

      return {
        unreadMessagesCount,
        recentDiscussionsCount,
        unreadAnnouncementsCount: 0,
      };
    } catch {
      return { unreadMessagesCount: 0, recentDiscussionsCount: 0, unreadAnnouncementsCount: 0 };
    }
  }

  // ============================================================================
  // POSTS CRUD & QUERIES
  // ============================================================================

  async getCommunityPosts(options: {
    communityId?: string;
    authorizedCommunityIds?: string[];
    universityId?: string;
    pageSize?: number;
    lastDoc?: DocumentSnapshot | null;
  }): Promise<{
    posts: RealCommunityPost[];
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    const pageSize = options.pageSize || 20;
    const colRef = collection(db, COMMUNITY_COLLECTIONS.POSTS);

    try {
      let q;
      if (options.communityId && options.communityId !== 'all') {
        q = options.lastDoc
          ? query(
              colRef,
              where('communityId', '==', options.communityId),
              orderBy('createdAt', 'desc'),
              startAfter(options.lastDoc),
              limit(pageSize + 1)
            )
          : query(
              colRef,
              where('communityId', '==', options.communityId),
              orderBy('createdAt', 'desc'),
              limit(pageSize + 1)
            );
      } else if (options.universityId) {
        q = options.lastDoc
          ? query(
              colRef,
              where('universityId', '==', sanitizeIdSegment(options.universityId)),
              orderBy('createdAt', 'desc'),
              startAfter(options.lastDoc),
              limit(pageSize + 1)
            )
          : query(
              colRef,
              where('universityId', '==', sanitizeIdSegment(options.universityId)),
              orderBy('createdAt', 'desc'),
              limit(pageSize + 1)
            );
      } else {
        q = options.lastDoc
          ? query(colRef, orderBy('createdAt', 'desc'), startAfter(options.lastDoc), limit(pageSize + 1))
          : query(colRef, orderBy('createdAt', 'desc'), limit(pageSize + 1));
      }

      const snap = await getDocs(q);
      const allowedSet =
        options.authorizedCommunityIds && options.authorizedCommunityIds.length > 0
          ? new Set(options.authorizedCommunityIds)
          : null;

      const rawDocs = snap.docs;
      const hasMore = rawDocs.length > pageSize;
      const sliceDocs = hasMore ? rawDocs.slice(0, pageSize) : rawDocs;

      const posts: RealCommunityPost[] = [];
      for (const d of sliceDocs) {
        const data = d.data() as RealCommunityPost;
        if (data.status !== 'active') continue;
        if (allowedSet && !allowedSet.has(data.communityId)) continue;
        posts.push({
          ...data,
          postId: data.postId || d.id,
        });
      }

      return {
        posts,
        lastDoc: sliceDocs.length > 0 ? sliceDocs[sliceDocs.length - 1] : null,
        hasMore,
      };
    } catch (error: any) {
      if (error?.message?.includes('index') || error?.code === 'failed-precondition') {
        try {
          const fallbackQ =
            options.communityId && options.communityId !== 'all'
              ? query(colRef, where('communityId', '==', options.communityId), limit(50))
              : options.universityId
              ? query(colRef, where('universityId', '==', sanitizeIdSegment(options.universityId)), limit(50))
              : query(colRef, limit(50));

          const snap = await getDocs(fallbackQ);
          const allowedSet =
            options.authorizedCommunityIds && options.authorizedCommunityIds.length > 0
              ? new Set(options.authorizedCommunityIds)
              : null;

          const posts = snap.docs
            .map((d) => ({ ...(d.data() as RealCommunityPost), postId: d.id }))
            .filter((p) => p.status === 'active' && (!allowedSet || allowedSet.has(p.communityId)))
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

          return {
            posts: posts.slice(0, pageSize),
            lastDoc: null,
            hasMore: false,
          };
        } catch (innerErr) {
          handleFirestoreError(innerErr, OperationType.LIST, COMMUNITY_COLLECTIONS.POSTS);
        }
      }
      handleFirestoreError(error, OperationType.LIST, COMMUNITY_COLLECTIONS.POSTS);
    }
  }

  subscribeToPosts(
    options: {
      communityId?: string;
      authorizedCommunityIds?: string[];
      universityId?: string;
      limitCount?: number;
    },
    onUpdate: (posts: RealCommunityPost[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!auth.currentUser) {
      onUpdate([]);
      return () => {};
    }

    const maxItems = options.limitCount || 40;
    const colRef = collection(db, COMMUNITY_COLLECTIONS.POSTS);
    const q =
      options.communityId && options.communityId !== 'all'
        ? query(colRef, where('communityId', '==', options.communityId), limit(maxItems))
        : options.universityId
        ? query(colRef, where('universityId', '==', sanitizeIdSegment(options.universityId)), limit(maxItems))
        : query(colRef, limit(maxItems));

    const allowedSet =
      options.authorizedCommunityIds && options.authorizedCommunityIds.length > 0
        ? new Set(options.authorizedCommunityIds)
        : null;

    return onSnapshot(
      q,
      (snap) => {
        const list: RealCommunityPost[] = [];
        snap.forEach((d) => {
          const data = d.data() as RealCommunityPost;
          if (data.status === 'active') {
            if (!allowedSet || allowedSet.has(data.communityId)) {
              list.push({
                ...data,
                postId: data.postId || d.id,
              });
            }
          }
        });
        list.sort((a, b) => {
          if (Boolean(a.pinned) !== Boolean(b.pinned)) {
            return a.pinned ? -1 : 1;
          }
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        onUpdate(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }

  async createPost(input: {
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
    community: CommunitySpace;
    category: CommunityPostCategory;
    postType?: CommunityPostType;
    title: string;
    content: string;
    imageUrl?: string;
    imageUrls?: string[];
    attachment?: {
      fileUrl: string;
      fileName: string;
      fileSize?: number;
      fileMimeType?: string;
    } | null;
    externalLink?: string;
    poll?: {
      question: string;
      options: string[];
      allowMultipleChoice?: boolean;
      closesAt?: string | null;
      showResultsBeforeVoting?: boolean;
    } | null;
    event?: {
      title: string;
      description?: string;
      courseId?: string;
      courseCode?: string;
      date: string;
      startTime: string;
      endTime?: string;
      locationType: 'physical' | 'online';
      locationOrLink: string;
    } | null;
    mentions?: string[];
    mentionNames?: string[];
  }): Promise<RealCommunityPost> {
    if (input.community.isOfficialAnnouncementOnly) {
      const isOwner = isVerifiedOwnerAccount(auth.currentUser?.uid, auth.currentUser?.email);
      if (!isOwner && !input.lecturer) {
        throw new Error('This is an official announcement-only channel. Students cannot create posts here.');
      }
    }

    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const cleanTitle = input.title.trim().slice(0, 200);
    const cleanContent = input.content.trim().slice(0, 8000);

    if (cleanTitle.length < 3) {
      throw new Error('Post title must be at least 3 characters.');
    }
    if (cleanContent.length < 3) {
      throw new Error('Post content must be at least 3 characters.');
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    // Extract link preview if link provided or embedded in content
    const cleanLink = (input.externalLink || '').trim().slice(0, 500);
    const { preview: extractedPreview } = extractLinksAndSafePreview(
      cleanLink ? `${cleanLink} ${cleanContent}` : cleanContent
    );

    // Build Poll Data if POLL post
    let pollData: CommunityPollData | null = null;
    if (input.poll && input.poll.options && input.poll.options.length >= 2) {
      const validOpts = input.poll.options
        .map((o) => o.trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 8);
      if (validOpts.length >= 2) {
        pollData = {
          question: (input.poll.question || cleanTitle).trim().slice(0, 240),
          options: validOpts.map((text, idx) => ({
            id: `opt_${idx + 1}`,
            text,
            voteCount: 0,
          })),
          allowMultipleChoice: Boolean(input.poll.allowMultipleChoice),
          closesAt: input.poll.closesAt || null,
          showResultsBeforeVoting: Boolean(input.poll.showResultsBeforeVoting),
          totalVotes: 0,
        };
      }
    }

    // Build Event Data if EVENT post
    let eventData: CommunityEventData | null = null;
    if (input.event && input.event.date && input.event.startTime) {
      eventData = {
        title: (input.event.title || cleanTitle).trim().slice(0, 200),
        description: (input.event.description || cleanContent).trim().slice(0, 1000),
        courseId: input.event.courseId || input.community.courseId || '',
        courseCode: input.event.courseCode || input.community.courseCode || '',
        date: input.event.date.trim().slice(0, 30),
        startTime: input.event.startTime.trim().slice(0, 20),
        endTime: (input.event.endTime || '').trim().slice(0, 20),
        locationType: input.event.locationType === 'online' ? 'online' : 'physical',
        locationOrLink: (input.event.locationOrLink || 'TBA').trim().slice(0, 300),
        goingCount: 0,
        interestedCount: 0,
        notGoingCount: 0,
      };
    }

    const resolvedPostType: CommunityPostType =
      input.postType ||
      (pollData
        ? 'POLL'
        : eventData
        ? 'EVENT'
        : input.category === 'Question'
        ? 'QUESTION'
        : input.attachment?.fileUrl
        ? 'FILE'
        : input.imageUrl
        ? 'IMAGE'
        : cleanLink
        ? 'LINK'
        : 'TEXT');

    const newPost: RealCommunityPost = {
      postId,
      authorUid: identity.uid,
      authorName: identity.name,
      authorPhoto: identity.photo || '',
      authorRoleLabel: identity.roleLabel,
      authorRole: identity.accountRole,
      isVerifiedAuthor: identity.isVerified,
      communityId: input.community.communityId,
      communityType: input.community.communityType,
      communityName: input.community.name,
      universityId: input.community.universityId,
      academicUnitId: input.community.academicUnitId || '',
      departmentId: input.community.departmentId || '',
      programmeId: input.community.programmeId || '',
      courseId: input.community.courseId || '',
      courseCode: input.community.courseCode || '',
      category: input.category,
      postType: resolvedPostType,
      title: cleanTitle,
      content: cleanContent,
      imageUrl: input.imageUrl || (input.imageUrls && input.imageUrls[0]) || '',
      imageUrls: input.imageUrls || (input.imageUrl ? [input.imageUrl] : []),
      attachmentUrl: input.attachment?.fileUrl || '',
      attachmentName: input.attachment?.fileName || '',
      attachmentSize: input.attachment?.fileSize || 0,
      attachmentSizeLabel: input.attachment?.fileSize
        ? formatFileSize(input.attachment.fileSize)
        : '',
      attachmentMimeType: input.attachment?.fileMimeType || '',
      externalLink: cleanLink,
      linkPreview: extractedPreview,
      poll: pollData,
      event: eventData,
      mentions: Array.isArray(input.mentions) ? input.mentions.slice(0, 15) : [],
      mentionNames: Array.isArray(input.mentionNames) ? input.mentionNames.slice(0, 15) : [],
      pinned: false,
      pinnedByUid: null,
      pinnedByName: null,
      pinnedAt: null,
      commentsLocked: false,
      lockedByUid: null,
      lockedByName: null,
      bestAnswerCommentId: null,
      bestAnswerMarkedByUid: null,
      bestAnswerMarkedByName: null,
      bestAnswerMarkedByRole: null,
      reactionCounts: {},
      createdAt: nowIso,
      updatedAt: nowIso,
      editedAt: null,
      status: 'active',
      likeCount: 0,
      commentCount: 0,
    };

    try {
      await setDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, postId), newPost);

      // Notify mentioned users in the post
      for (const mUid of newPost.mentions || []) {
        if (mUid && mUid !== identity.uid) {
          this.createInAppNotification({
            recipientUid: mUid,
            title: `${identity.name} mentioned you in ${input.community.shortLabel}`,
            message: `${cleanTitle}: "${cleanContent.slice(0, 90)}"`,
            category: 'community',
          }).catch(() => {});
        }
      }

      return newPost;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COMMUNITY_COLLECTIONS.POSTS}/${postId}`);
    }
  }

  async updatePost(
    postId: string,
    updates: {
      title: string;
      content: string;
      category?: CommunityPostCategory;
    }
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');

    const cleanTitle = updates.title.trim().slice(0, 200);
    const cleanContent = updates.content.trim().slice(0, 8000);
    if (cleanTitle.length < 3 || cleanContent.length < 3) {
      throw new Error('Title and content must be at least 3 characters.');
    }

    const nowIso = new Date().toISOString();
    const payload: Record<string, any> = {
      title: cleanTitle,
      content: cleanContent,
      updatedAt: nowIso,
      editedAt: nowIso,
    };
    if (updates.category) {
      payload.category = updates.category;
    }

    try {
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, postId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COMMUNITY_COLLECTIONS.POSTS}/${postId}`);
    }
  }

  async deletePost(postId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');

    try {
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, postId), {
        status: 'deleted',
        updatedAt: new Date().toISOString(),
      });
    } catch {
      try {
        await deleteDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, postId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${COMMUNITY_COLLECTIONS.POSTS}/${postId}`);
      }
    }
  }

  // ============================================================================
  // POST & COMMENT LIKES
  // ============================================================================

  async getUserLikedIds(userId: string): Promise<Set<string>> {
    if (!userId || !auth.currentUser) return new Set();
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.LIKES),
        where('userId', '==', userId),
        limit(250)
      );
      const snap = await getDocs(q);
      const set = new Set<string>();
      snap.forEach((d) => {
        const data = d.data();
        if (data?.targetId) set.add(data.targetId);
      });
      return set;
    } catch {
      return new Set();
    }
  }

  async toggleLike(targetId: string, targetType: 'post' | 'comment'): Promise<{ liked: boolean }> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Please sign in to like posts.');

    const uid = currentUser.uid;
    const likeDocId = `${targetId}_${uid}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    const likeRef = doc(db, COMMUNITY_COLLECTIONS.LIKES, likeDocId);
    const targetCollection =
      targetType === 'post' ? COMMUNITY_COLLECTIONS.POSTS : COMMUNITY_COLLECTIONS.COMMENTS;
    const targetRef = doc(db, targetCollection, targetId);

    try {
      const existing = await getDoc(likeRef);
      if (existing.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(targetRef, {
          likeCount: increment(-1),
        }).catch(() => {});
        return { liked: false };
      } else {
        await setDoc(likeRef, {
          id: likeDocId,
          targetId,
          targetType,
          userId: uid,
          createdAt: new Date().toISOString(),
        });
        await updateDoc(targetRef, {
          likeCount: increment(1),
        }).catch(() => {});
        return { liked: true };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COMMUNITY_COLLECTIONS.LIKES}/${likeDocId}`);
    }
  }

  // ============================================================================
  // BOOKMARKS / SAVED POSTS
  // ============================================================================

  async getUserBookmarkedPostIds(userId: string): Promise<Set<string>> {
    if (!userId || !auth.currentUser) return new Set();
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.BOOKMARKS),
        where('userId', '==', userId),
        limit(200)
      );
      const snap = await getDocs(q);
      const set = new Set<string>();
      snap.forEach((d) => {
        const data = d.data();
        if (data?.postId) set.add(data.postId);
      });
      return set;
    } catch {
      return new Set();
    }
  }

  async toggleBookmark(postId: string, communityId: string): Promise<{ bookmarked: boolean }> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Please sign in to save posts.');

    const uid = currentUser.uid;
    const bookmarkId = `${uid}_${postId}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    const bookmarkRef = doc(db, COMMUNITY_COLLECTIONS.BOOKMARKS, bookmarkId);

    try {
      const existing = await getDoc(bookmarkRef);
      if (existing.exists()) {
        await deleteDoc(bookmarkRef);
        return { bookmarked: false };
      } else {
        await setDoc(bookmarkRef, {
          id: bookmarkId,
          userId: uid,
          postId,
          communityId,
          createdAt: new Date().toISOString(),
        });
        return { bookmarked: true };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COMMUNITY_COLLECTIONS.BOOKMARKS}/${bookmarkId}`);
    }
  }

  // ============================================================================
  // COMMENTS & REPLIES (PAGINATED / LAZY LOADED)
  // ============================================================================

  async getPostComments(postId: string, pageSize = 30): Promise<RealCommunityComment[]> {
    if (!postId) return [];
    const colRef = collection(db, COMMUNITY_COLLECTIONS.COMMENTS);
    try {
      const q = query(colRef, where('postId', '==', postId), limit(pageSize));
      const snap = await getDocs(q);
      const comments: RealCommunityComment[] = [];
      snap.forEach((d) => {
        const data = d.data() as RealCommunityComment;
        if (data.status === 'active') {
          comments.push({
            ...data,
            commentId: data.commentId || d.id,
          });
        }
      });
      comments.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      return comments;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COMMUNITY_COLLECTIONS.COMMENTS);
    }
  }

  async addComment(input: {
    postId: string;
    postAuthorUid?: string;
    postTitle?: string;
    parentCommentId?: string | null;
    content: string;
    mentions?: string[];
    mentionNames?: string[];
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<RealCommunityComment> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const cleanContent = input.content.trim().slice(0, 3000);
    if (!cleanContent) {
      throw new Error('Comment cannot be empty.');
    }

    // Check if post comments are locked
    try {
      const postSnap = await getDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, input.postId));
      if (postSnap.exists()) {
        const postData = postSnap.data() as RealCommunityPost;
        if (
          postData.commentsLocked &&
          identity.accountRole !== 'lecturer' &&
          identity.accountRole !== 'admin'
        ) {
          throw new Error('Comments on this post have been locked by a moderator or lecturer.');
        }
      }
    } catch (lockErr: any) {
      if (lockErr?.message?.includes('locked')) throw lockErr;
    }

    const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const comment: RealCommunityComment = {
      commentId,
      postId: input.postId,
      parentCommentId: input.parentCommentId || null,
      authorUid: identity.uid,
      authorName: identity.name,
      authorPhoto: identity.photo || '',
      authorRoleLabel: identity.roleLabel,
      authorRole: identity.accountRole,
      isVerifiedAuthor: identity.isVerified,
      content: cleanContent,
      mentions: Array.isArray(input.mentions) ? input.mentions.slice(0, 10) : [],
      mentionNames: Array.isArray(input.mentionNames) ? input.mentionNames.slice(0, 10) : [],
      isBestAnswer: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      likeCount: 0,
      status: 'active',
    };

    try {
      await setDoc(doc(db, COMMUNITY_COLLECTIONS.COMMENTS, commentId), comment);
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, input.postId), {
        commentCount: increment(1),
        updatedAt: nowIso,
      }).catch(() => {});

      // Notify post author if someone else replied
      if (input.postAuthorUid && input.postAuthorUid !== identity.uid) {
        this.createInAppNotification({
          recipientUid: input.postAuthorUid,
          title: `New reply from ${identity.name}`,
          message: `${identity.name} commented on "${(input.postTitle || 'your discussion').slice(0, 60)}": "${cleanContent.slice(0, 80)}"`,
          category: 'community',
        }).catch(() => {});
      }

      // Notify mentioned users
      for (const mUid of comment.mentions || []) {
        if (mUid && mUid !== identity.uid && mUid !== input.postAuthorUid) {
          this.createInAppNotification({
            recipientUid: mUid,
            title: `${identity.name} mentioned you in a comment`,
            message: cleanContent.slice(0, 100),
            category: 'community',
          }).catch(() => {});
        }
      }

      return comment;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COMMUNITY_COLLECTIONS.COMMENTS}/${commentId}`);
    }
  }

  // ============================================================================
  // STAGE 11C-D: BEST ANSWER, PIN POST, LOCK COMMENTS, POLLS, EVENTS, SAVED ITEMS & STUDY GROUPS
  // ============================================================================

  /**
   * Marks or unmarks a comment as the Helpful / Best Answer on a Question or Discussion post.
   * Strictly verifies that the caller is the Question Author, an Assigned Course Lecturer, or a Platform Admin.
   */
  async toggleBestAnswer(input: {
    post: RealCommunityPost;
    commentId: string;
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
    lecturerAssignments?: LecturerCourseAssignment[];
  }): Promise<{ bestAnswerCommentId: string | null }> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const isPostAuthor = input.post.authorUid === identity.uid;
    const isAdmin = identity.accountRole === 'admin';

    let isAssignedLecturer = false;
    if (identity.accountRole === 'lecturer' && input.lecturer) {
      if (input.post.communityType === 'course') {
        const cleanCode = (input.post.courseCode || '').trim().toUpperCase();
        isAssignedLecturer = (input.lecturerAssignments || []).some(
          (a) =>
            a.courseId === input.post.courseId ||
            (a.courseCode || '').trim().toUpperCase() === cleanCode
        );
      } else {
        isAssignedLecturer = true;
      }
    }

    if (!isPostAuthor && !isAssignedLecturer && !isAdmin) {
      throw new Error(
        'Only the question author, assigned course lecturer, or administrator can mark a Best Answer.'
      );
    }

    const isUnmarking = input.post.bestAnswerCommentId === input.commentId;
    const nextCommentId = isUnmarking ? null : input.commentId;
    const markedByRole: 'author' | 'lecturer' | 'admin' | null = isUnmarking
      ? null
      : isAssignedLecturer
      ? 'lecturer'
      : isAdmin
      ? 'admin'
      : 'author';

    const nowIso = new Date().toISOString();
    const postRef = doc(db, COMMUNITY_COLLECTIONS.POSTS, input.post.postId);

    try {
      await updateDoc(postRef, {
        bestAnswerCommentId: nextCommentId,
        bestAnswerMarkedByUid: isUnmarking ? null : identity.uid,
        bestAnswerMarkedByName: isUnmarking ? null : identity.name,
        bestAnswerMarkedByRole: markedByRole,
        updatedAt: nowIso,
      });

      // Notify comment author if their answer was selected
      if (!isUnmarking) {
        const cmtSnap = await getDoc(doc(db, COMMUNITY_COLLECTIONS.COMMENTS, input.commentId));
        if (cmtSnap.exists()) {
          const cmtData = cmtSnap.data() as RealCommunityComment;
          if (cmtData.authorUid && cmtData.authorUid !== identity.uid) {
            this.createInAppNotification({
              recipientUid: cmtData.authorUid,
              title: `Your reply was marked as Best Answer!`,
              message: `${identity.name} marked your solution on "${input.post.title.slice(0, 60)}" as the Best Answer.`,
              category: 'community',
            }).catch(() => {});
          }
        }
      }

      return { bestAnswerCommentId: nextCommentId };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.POSTS}/${input.post.postId}`
      );
    }
  }

  /**
   * Moderator / Lecturer Tools: Pin or Unpin a Community Post, or Lock / Unlock Comments.
   */
  async updatePostModerationState(input: {
    post: RealCommunityPost;
    pinned?: boolean;
    commentsLocked?: boolean;
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<void> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const canModerate =
      identity.accountRole === 'admin' ||
      identity.accountRole === 'lecturer' ||
      isVerifiedOwnerAccount(identity.uid, auth.currentUser?.email);

    if (!canModerate) {
      throw new Error('Only lecturers and moderators can pin posts or lock comments.');
    }

    const nowIso = new Date().toISOString();
    const updates: Record<string, any> = {
      updatedAt: nowIso,
    };

    if (typeof input.pinned === 'boolean') {
      updates.pinned = input.pinned;
      updates.pinnedByUid = input.pinned ? identity.uid : null;
      updates.pinnedByName = input.pinned ? identity.name : null;
      updates.pinnedAt = input.pinned ? nowIso : null;
    }

    if (typeof input.commentsLocked === 'boolean') {
      updates.commentsLocked = input.commentsLocked;
      updates.lockedByUid = input.commentsLocked ? identity.uid : null;
      updates.lockedByName = input.commentsLocked ? identity.name : null;
    }

    try {
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, input.post.postId), updates);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.POSTS}/${input.post.postId}`
      );
    }
  }

  /**
   * Fetches all poll votes cast by the current user (`postId -> selectedOptionIds[]`).
   */
  async getUserPollVotesMap(userId: string): Promise<Record<string, string[]>> {
    if (!userId || !auth.currentUser) return {};
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.POLL_VOTES),
        where('userId', '==', userId),
        limit(200)
      );
      const snap = await getDocs(q);
      const map: Record<string, string[]> = {};
      snap.forEach((d) => {
        const data = d.data() as CommunityPollVoteRecord;
        if (data?.postId && Array.isArray(data.selectedOptionIds)) {
          map[data.postId] = data.selectedOptionIds;
        }
      });
      return map;
    } catch {
      return {};
    }
  }

  /**
   * Casts or updates a user's vote on a real Community Poll.
   * Uses a deterministic document ID `${postId}_${userId}` to prevent duplicate votes and updates option counts accurately.
   */
  async voteOnPoll(input: {
    post: RealCommunityPost;
    selectedOptionIds: string[];
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<{ updatedPoll: CommunityPollData; selectedOptionIds: string[] }> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const poll = input.post.poll;
    if (!poll) throw new Error('This post does not contain an active poll.');

    if (poll.closesAt && new Date(poll.closesAt).getTime() < Date.now()) {
      throw new Error('This poll has closed and is no longer accepting votes.');
    }

    const cleanSelected = Array.from(new Set(input.selectedOptionIds.filter(Boolean)));
    if (cleanSelected.length === 0) {
      throw new Error('Please select at least one option to vote.');
    }
    if (!poll.allowMultipleChoice && cleanSelected.length > 1) {
      throw new Error('This poll only allows a single choice.');
    }

    const voteDocId = `${input.post.postId}_${identity.uid}`
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 120);
    const voteRef = doc(db, COMMUNITY_COLLECTIONS.POLL_VOTES, voteDocId);
    const postRef = doc(db, COMMUNITY_COLLECTIONS.POSTS, input.post.postId);

    try {
      const [existingVoteSnap, freshPostSnap] = await Promise.all([
        getDoc(voteRef),
        getDoc(postRef),
      ]);

      const currentPost = freshPostSnap.exists()
        ? (freshPostSnap.data() as RealCommunityPost)
        : input.post;
      const currentPoll = currentPost.poll || poll;

      const prevSelectedIds: string[] = existingVoteSnap.exists()
        ? (existingVoteSnap.data() as CommunityPollVoteRecord).selectedOptionIds || []
        : [];

      const updatedOptions = currentPoll.options.map((opt) => {
        let count = Math.max(0, Number(opt.voteCount) || 0);
        if (prevSelectedIds.includes(opt.id)) {
          count = Math.max(0, count - 1);
        }
        if (cleanSelected.includes(opt.id)) {
          count += 1;
        }
        return {
          ...opt,
          voteCount: count,
        };
      });

      const wasVoterBefore = prevSelectedIds.length > 0;
      const totalVotes = Math.max(
        updatedOptions.reduce((max, o) => Math.max(max, o.voteCount), 0),
        (Number(currentPoll.totalVotes) || 0) + (wasVoterBefore ? 0 : 1)
      );

      const updatedPoll: CommunityPollData = {
        ...currentPoll,
        options: updatedOptions,
        totalVotes,
      };

      const voteRecord: CommunityPollVoteRecord = {
        id: voteDocId,
        postId: input.post.postId,
        communityId: input.post.communityId,
        userId: identity.uid,
        userName: identity.name,
        selectedOptionIds: cleanSelected,
        votedAt: new Date().toISOString(),
      };

      await setDoc(voteRef, voteRecord);
      await updateDoc(postRef, {
        poll: updatedPoll,
        updatedAt: new Date().toISOString(),
      });

      return { updatedPoll, selectedOptionIds: cleanSelected };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.POLL_VOTES}/${voteDocId}`
      );
    }
  }

  /**
   * Fetches all event RSVPs for the current user (`postId -> status`).
   */
  async getUserEventRsvpsMap(userId: string): Promise<Record<string, CommunityEventRsvpStatus>> {
    if (!userId || !auth.currentUser) return {};
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.EVENT_RSVPS),
        where('userId', '==', userId),
        limit(200)
      );
      const snap = await getDocs(q);
      const map: Record<string, CommunityEventRsvpStatus> = {};
      snap.forEach((d) => {
        const data = d.data() as CommunityEventRsvpRecord;
        if (data?.postId && data?.status) {
          map[data.postId] = data.status;
        }
      });
      return map;
    } catch {
      return {};
    }
  }

  /**
   * Updates the user's RSVP ('going' | 'interested' | 'not_going') on a Study Session / Academic Event post.
   */
  async rsvpToEvent(input: {
    post: RealCommunityPost;
    status: CommunityEventRsvpStatus;
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<{ updatedEvent: CommunityEventData; status: CommunityEventRsvpStatus }> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    if (!input.post.event) {
      throw new Error('This post does not contain an academic event.');
    }

    const rsvpDocId = `${input.post.postId}_${identity.uid}`
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 120);
    const rsvpRef = doc(db, COMMUNITY_COLLECTIONS.EVENT_RSVPS, rsvpDocId);
    const postRef = doc(db, COMMUNITY_COLLECTIONS.POSTS, input.post.postId);

    try {
      const [existingSnap, freshPostSnap] = await Promise.all([getDoc(rsvpRef), getDoc(postRef)]);
      const prevStatus: CommunityEventRsvpStatus | null = existingSnap.exists()
        ? (existingSnap.data() as CommunityEventRsvpRecord).status
        : null;

      const currentPost = freshPostSnap.exists()
        ? (freshPostSnap.data() as RealCommunityPost)
        : input.post;
      const currentEvent = currentPost.event || input.post.event;

      let goingCount = Math.max(0, Number(currentEvent.goingCount) || 0);
      let interestedCount = Math.max(0, Number(currentEvent.interestedCount) || 0);
      let notGoingCount = Math.max(0, Number(currentEvent.notGoingCount) || 0);

      if (prevStatus === 'going') goingCount = Math.max(0, goingCount - 1);
      if (prevStatus === 'interested') interestedCount = Math.max(0, interestedCount - 1);
      if (prevStatus === 'not_going') notGoingCount = Math.max(0, notGoingCount - 1);

      if (input.status === 'going') goingCount += 1;
      if (input.status === 'interested') interestedCount += 1;
      if (input.status === 'not_going') notGoingCount += 1;

      const updatedEvent: CommunityEventData = {
        ...currentEvent,
        goingCount,
        interestedCount,
        notGoingCount,
      };

      const record: CommunityEventRsvpRecord = {
        id: rsvpDocId,
        postId: input.post.postId,
        communityId: input.post.communityId,
        userId: identity.uid,
        userName: identity.name,
        status: input.status,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(rsvpRef, record);
      await updateDoc(postRef, {
        event: updatedEvent,
        updatedAt: new Date().toISOString(),
      });

      return { updatedEvent, status: input.status };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.EVENT_RSVPS}/${rsvpDocId}`
      );
    }
  }

  /**
   * Adds a Community Study Session / Academic Event directly into the student's real VENUE Study Planner (`students/{uid}/study_tasks`).
   */
  async addEventToStudyPlanner(post: RealCommunityPost, uid?: string): Promise<void> {
    const targetUid = uid || auth.currentUser?.uid || '';
    if (!targetUid || !post.event) {
      throw new Error('Please sign in to save this session to your Study Planner.');
    }

    const ev = post.event;
    const timeSlot = ev.endTime ? `${ev.startTime} - ${ev.endTime}` : ev.startTime;
    const taskId = `comm_evt_${post.postId}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 90);

    await studentDashboardService.saveStudentTask(
      {
        id: taskId,
        title: `${ev.title} (${ev.locationOrLink})`,
        courseCode: ev.courseCode || post.courseCode || post.communityName || 'Study Session',
        date: ev.date || 'Today',
        timeSlot,
        estimatedMinutes: 90,
        completed: false,
        priority: 'high',
      },
      targetUid
    );
  }

  // ============================================================================
  // MULTI-TYPE SAVED ITEMS / BOOKMARKS (POSTS, MESSAGES, FILES, ANNOUNCEMENTS, EVENTS)
  // ============================================================================

  async getUserSavedItems(userId: string): Promise<CommunitySavedItemRecord[]> {
    if (!userId || !auth.currentUser) return [];
    try {
      const q = query(
        collection(db, COMMUNITY_COLLECTIONS.SAVED_ITEMS),
        where('userId', '==', userId),
        limit(150)
      );
      const snap = await getDocs(q);
      const list: CommunitySavedItemRecord[] = [];
      snap.forEach((d) => {
        const data = d.data() as CommunitySavedItemRecord;
        if (data?.targetId) {
          list.push({
            ...data,
            id: data.id || d.id,
          });
        }
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return list;
    } catch {
      return [];
    }
  }

  async toggleSavedItem(input: {
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
    linkUrl?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
  }): Promise<{ saved: boolean; item: CommunitySavedItemRecord | null }> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Please sign in to bookmark items.');

    const uid = currentUser.uid;
    const docId = `${uid}_${input.itemType}_${input.targetId}`
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 120);
    const docRef = doc(db, COMMUNITY_COLLECTIONS.SAVED_ITEMS, docId);

    try {
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        await deleteDoc(docRef);
        return { saved: false, item: null };
      }

      const item: CommunitySavedItemRecord = {
        id: docId,
        userId: uid,
        itemType: input.itemType,
        targetId: input.targetId,
        communityId: input.communityId || '',
        conversationId: input.conversationId || '',
        courseCode: input.courseCode || '',
        title: (input.title || 'Saved Item').slice(0, 200),
        excerpt: (input.excerpt || '').slice(0, 400),
        authorName: (input.authorName || 'Member').slice(0, 100),
        fileUrl: input.fileUrl || '',
        fileName: input.fileName || '',
        fileSizeLabel: input.fileSizeLabel || '',
        imageUrl: input.imageUrl || '',
        linkUrl: input.linkUrl || '',
        eventDate: input.eventDate || '',
        eventTime: input.eventTime || '',
        eventLocation: input.eventLocation || '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(docRef, item);
      return { saved: true, item };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.SAVED_ITEMS}/${docId}`
      );
    }
  }

  // ============================================================================
  // COURSE & PROGRAMME STUDY GROUPS (DISCOVERABLE: OPEN, REQUEST-TO-JOIN, PRIVATE)
  // ============================================================================

  subscribeToStudyGroups(
    options: {
      universityId?: string;
      communityId?: string;
      authorizedCommunityIds?: string[];
      currentUserUid?: string;
    },
    onUpdate: (groups: CommunityStudyGroupRecord[]) => void
  ): Unsubscribe {
    if (!auth.currentUser) {
      onUpdate([]);
      return () => {};
    }

    const colRef = collection(db, COMMUNITY_COLLECTIONS.STUDY_GROUPS);
    const q = options.universityId
      ? query(
          colRef,
          where('universityId', '==', sanitizeIdSegment(options.universityId)),
          limit(60)
        )
      : query(colRef, limit(60));

    const allowedSet =
      options.authorizedCommunityIds && options.authorizedCommunityIds.length > 0
        ? new Set(options.authorizedCommunityIds)
        : null;

    return onSnapshot(
      q,
      (snap) => {
        const list: CommunityStudyGroupRecord[] = [];
        snap.forEach((d) => {
          const data = d.data() as CommunityStudyGroupRecord;
          if (data.status !== 'active') return;
          if (options.communityId && options.communityId !== 'all' && data.communityId !== options.communityId) {
            return;
          }
          if (allowedSet && !allowedSet.has(data.communityId)) return;

          // If private invite-only group, only show to members or owner
          const isMember = (data.memberUids || []).includes(options.currentUserUid || '');
          if (data.visibility === 'private' && !isMember && data.ownerUid !== options.currentUserUid) {
            return;
          }

          list.push({
            ...data,
            groupId: data.groupId || d.id,
          });
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(list);
      },
      () => {
        onUpdate([]);
      }
    );
  }

  /**
   * Creates a Course or Programme Study Group and links it with a real Private Group Chat room
   * so members can collaborate immediately with full Stage 11C-C messaging & media.
   */
  async createStudyGroup(input: {
    name: string;
    description: string;
    community: CommunitySpace;
    visibility: StudyGroupVisibility;
    initialMembers?: ChatParticipantInfo[];
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<{ group: CommunityStudyGroupRecord; conversation: RealChatConversation }> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const cleanName = input.name.trim().slice(0, 100);
    const cleanDesc = input.description.trim().slice(0, 500);
    if (cleanName.length < 3) {
      throw new Error('Study group name must be at least 3 characters.');
    }

    // Create backing chat conversation for the study group
    const conversation = await this.createPrivateGroupChat({
      title: cleanName,
      description: cleanDesc,
      initialMembers: input.initialMembers,
      profile: input.profile,
      lecturer: input.lecturer,
    });

    const groupId = `sgrp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const group: CommunityStudyGroupRecord = {
      groupId,
      name: cleanName,
      description: cleanDesc,
      communityId: input.community.communityId,
      communityName: input.community.name,
      universityId: input.community.universityId,
      academicUnitId: input.community.academicUnitId || '',
      departmentId: input.community.departmentId || '',
      programmeId: input.community.programmeId || '',
      programmeName: input.community.programmeName || '',
      courseId: input.community.courseId || '',
      courseCode: input.community.courseCode || '',
      courseTitle: input.community.courseTitle || '',
      visibility: input.visibility,
      ownerUid: identity.uid,
      ownerName: identity.name,
      adminUids: [identity.uid],
      memberUids: conversation.participantIds,
      pendingRequestUids: [],
      pendingRequests: {},
      conversationId: conversation.conversationId,
      memberCount: conversation.participantIds.length,
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(doc(db, COMMUNITY_COLLECTIONS.STUDY_GROUPS, groupId), group);
      return { group, conversation };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `${COMMUNITY_COLLECTIONS.STUDY_GROUPS}/${groupId}`
      );
    }
  }

  /**
   * Joins an Open study group immediately or submits a join request for a Request-to-Join study group.
   */
  async joinOrRequestStudyGroup(input: {
    group: CommunityStudyGroupRecord;
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<{ status: 'joined' | 'requested'; conversationId?: string }> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const groupRef = doc(db, COMMUNITY_COLLECTIONS.STUDY_GROUPS, input.group.groupId);
    const nowIso = new Date().toISOString();

    if ((input.group.memberUids || []).includes(identity.uid)) {
      return { status: 'joined', conversationId: input.group.conversationId };
    }

    try {
      if (input.group.visibility === 'open') {
        const nextMembers = Array.from(new Set([...(input.group.memberUids || []), identity.uid]));
        await updateDoc(groupRef, {
          memberUids: nextMembers,
          memberCount: nextMembers.length,
          updatedAt: nowIso,
        });

        // Also add to backing chat conversation
        if (input.group.conversationId) {
          const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, input.group.conversationId);
          const convSnap = await getDoc(convRef);
          if (convSnap.exists()) {
            const convData = convSnap.data() as RealChatConversation;
            const convParticipants = Array.from(
              new Set([...(convData.participantIds || []), identity.uid])
            );
            const myInfo: ChatParticipantInfo = {
              uid: identity.uid,
              name: identity.name,
              photo: identity.photo || '',
              programmeName: input.profile?.programmeShort || input.profile?.programmeName || '',
              yearOfStudy: input.profile?.yearOfStudy || '',
              universityShort: input.profile?.universityShort || '',
              roleLabel: identity.roleLabel,
              accountRole: identity.accountRole,
              groupRole: 'member',
            };
            await updateDoc(convRef, {
              participantIds: convParticipants,
              [`participants.${identity.uid}`]: myInfo,
              [`memberRoles.${identity.uid}`]: 'member',
              updatedAt: nowIso,
            }).catch(() => {});
          }
        }

        return { status: 'joined', conversationId: input.group.conversationId };
      } else if (input.group.visibility === 'request_to_join') {
        const nextPending = Array.from(
          new Set([...(input.group.pendingRequestUids || []), identity.uid])
        );
        await updateDoc(groupRef, {
          pendingRequestUids: nextPending,
          [`pendingRequests.${identity.uid}`]: {
            uid: identity.uid,
            name: identity.name,
            roleLabel: identity.roleLabel,
            requestedAt: nowIso,
          },
          updatedAt: nowIso,
        });

        this.createInAppNotification({
          recipientUid: input.group.ownerUid,
          title: `Join request for ${input.group.name}`,
          message: `${identity.name} requested to join your study group "${input.group.name}".`,
          category: 'community',
        }).catch(() => {});

        return { status: 'requested' };
      } else {
        throw new Error('This study group is private (invite-only).');
      }
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.STUDY_GROUPS}/${input.group.groupId}`
      );
    }
  }

  /**
   * Approves or declines a pending request to join a Request-to-Join Study Group (Group Owner / Admin only).
   */
  async handleStudyGroupJoinRequest(input: {
    group: CommunityStudyGroupRecord;
    requesterUid: string;
    requesterName: string;
    requesterRoleLabel?: string;
    approve: boolean;
  }): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');
    const isGroupAdmin =
      input.group.ownerUid === currentUser.uid ||
      (input.group.adminUids || []).includes(currentUser.uid);
    if (!isGroupAdmin) {
      throw new Error('Only study group owners or admins can review join requests.');
    }

    const groupRef = doc(db, COMMUNITY_COLLECTIONS.STUDY_GROUPS, input.group.groupId);
    const nowIso = new Date().toISOString();
    const nextPending = (input.group.pendingRequestUids || []).filter(
      (id) => id !== input.requesterUid
    );
    const nextRequestsMap = { ...(input.group.pendingRequests || {}) };
    delete nextRequestsMap[input.requesterUid];

    const nextMembers = input.approve
      ? Array.from(new Set([...(input.group.memberUids || []), input.requesterUid]))
      : input.group.memberUids || [];

    try {
      await updateDoc(groupRef, {
        pendingRequestUids: nextPending,
        pendingRequests: nextRequestsMap,
        memberUids: nextMembers,
        memberCount: nextMembers.length,
        updatedAt: nowIso,
      });

      if (input.approve && input.group.conversationId) {
        const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, input.group.conversationId);
        const convSnap = await getDoc(convRef);
        if (convSnap.exists()) {
          const convData = convSnap.data() as RealChatConversation;
          const convParticipants = Array.from(
            new Set([...(convData.participantIds || []), input.requesterUid])
          );
          await updateDoc(convRef, {
            participantIds: convParticipants,
            [`participants.${input.requesterUid}`]: {
              uid: input.requesterUid,
              name: input.requesterName,
              roleLabel: input.requesterRoleLabel || 'Student',
              groupRole: 'member',
            },
            [`memberRoles.${input.requesterUid}`]: 'member',
            updatedAt: nowIso,
          }).catch(() => {});
        }

        this.createInAppNotification({
          recipientUid: input.requesterUid,
          title: `Approved to join ${input.group.name}`,
          message: `Your request to join "${input.group.name}" was approved!`,
          category: 'community',
        }).catch(() => {});
      }
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.STUDY_GROUPS}/${input.group.groupId}`
      );
    }
  }

  async deleteComment(commentId: string, postId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');

    try {
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.COMMENTS, commentId), {
        status: 'deleted',
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, COMMUNITY_COLLECTIONS.POSTS, postId), {
        commentCount: increment(-1),
      }).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COMMUNITY_COLLECTIONS.COMMENTS}/${commentId}`);
    }
  }

  // ============================================================================
  // MODERATION & CONTENT REPORTING + PEER BLOCKING
  // ============================================================================

  async submitReport(input: {
    targetType: 'post' | 'comment' | 'message' | 'lecturer_announcement';
    targetId: string;
    targetAuthorUid?: string;
    targetExcerpt: string;
    communityId?: string;
    conversationId?: string;
    category: CommunityReportCategory;
    details?: string;
    profile?: StudentProfile | null;
  }): Promise<CommunityReportRecord> {
    const identity = this.getAuthenticatedIdentity(input.profile);
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const record: CommunityReportRecord = {
      reportId,
      reporterUid: identity.uid,
      reporterName: identity.name,
      targetType: input.targetType,
      targetId: input.targetId,
      targetAuthorUid: input.targetAuthorUid || '',
      targetExcerpt: (input.targetExcerpt || '').slice(0, 300),
      communityId: input.communityId || '',
      conversationId: input.conversationId || '',
      category: input.category,
      details: (input.details || '').trim().slice(0, 1000),
      status: 'pending',
      createdAt: nowIso,
    };

    try {
      await setDoc(doc(db, COMMUNITY_COLLECTIONS.REPORTS, reportId), record);
      return record;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COMMUNITY_COLLECTIONS.REPORTS}/${reportId}`);
    }
  }

  async getBlockedUserUids(userId: string): Promise<Set<string>> {
    if (!userId || !auth.currentUser) return new Set();
    try {
      const snap = await getDoc(doc(db, COMMUNITY_COLLECTIONS.BLOCKED_PEERS, userId));
      if (snap.exists()) {
        const list = snap.data()?.blockedUids;
        if (Array.isArray(list)) return new Set(list);
      }
      return new Set();
    } catch {
      return new Set();
    }
  }

  async toggleBlockUser(targetUid: string): Promise<{ blocked: boolean }> {
    const currentUser = auth.currentUser;
    if (!currentUser || !targetUid || targetUid === currentUser.uid) {
      throw new Error('Invalid block target.');
    }
    const docRef = doc(db, COMMUNITY_COLLECTIONS.BLOCKED_PEERS, currentUser.uid);
    try {
      const currentSet = await this.getBlockedUserUids(currentUser.uid);
      let blocked = false;
      if (currentSet.has(targetUid)) {
        currentSet.delete(targetUid);
        blocked = false;
      } else {
        if (currentSet.size >= 100) {
          throw new Error('Blocked list limit reached.');
        }
        currentSet.add(targetUid);
        blocked = true;
      }
      await setDoc(
        docRef,
        {
          userId: currentUser.uid,
          blockedUids: Array.from(currentSet),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return { blocked };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.BLOCKED_PEERS}/${currentUser.uid}`
      );
    }
  }

  // ============================================================================
  // REAL IN-APP NOTIFICATIONS
  // ============================================================================

  async createInAppNotification(input: {
    recipientUid: string;
    title: string;
    message: string;
    category: 'community' | 'academic' | 'system';
  }): Promise<void> {
    if (!input.recipientUid || !auth.currentUser) return;
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await setDoc(doc(db, COMMUNITY_COLLECTIONS.NOTIFICATIONS, notifId), {
        id: notifId,
        recipientUid: input.recipientUid,
        senderUid: auth.currentUser.uid,
        title: input.title.slice(0, 140),
        message: input.message.slice(0, 300),
        timestamp: new Date().toISOString(),
        read: false,
        category: input.category,
        type: input.category === 'community' ? 'community' : 'academic',
        targetScreen: 'community',
      });
    } catch {
      // non-blocking notification write
    }
  }

  subscribeToUserNotifications(
    userId: string,
    onUpdate: (items: NotificationItem[]) => void
  ): Unsubscribe {
    if (!userId || !auth.currentUser) {
      onUpdate([]);
      return () => {};
    }
    const q = query(
      collection(db, COMMUNITY_COLLECTIONS.NOTIFICATIONS),
      where('recipientUid', '==', userId),
      limit(40)
    );
    return onSnapshot(
      q,
      (snap) => {
        const items: NotificationItem[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          items.push({
            id: data.id || d.id,
            title: data.title || 'Community Alert',
            message: data.message || '',
            timestamp: data.timestamp || new Date().toISOString(),
            read: Boolean(data.read),
            category: data.category || 'community',
            type: data.type || 'community',
            targetScreen: data.targetScreen || 'community',
          });
        });
        items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        onUpdate(items);
      },
      () => {}
    );
  }

  // ============================================================================
  // REAL IN-APP CHAT: 1-TO-1 DIRECT, PRIVATE GROUPS & COMMUNITY GROUP CHATS
  // ============================================================================

  /**
   * Opens or creates a deterministic 1-to-1 direct conversation between the current user
   * and another verified peer, lecturer, or authorized staff member.
   */
  async getOrCreateDirectConversation(input: {
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
    peer: ChatParticipantInfo;
  }): Promise<RealChatConversation> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    if (!input.peer.uid || input.peer.uid === identity.uid) {
      throw new Error('Cannot start a direct conversation with yourself.');
    }

    const sortedUids = [identity.uid, input.peer.uid].sort();
    const conversationId = `dm_${sanitizeIdSegment(sortedUids[0])}_${sanitizeIdSegment(sortedUids[1])}`.slice(
      0,
      120
    );
    const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, conversationId);

    try {
      const existing = await getDoc(convRef);
      if (existing.exists()) {
        return {
          ...(existing.data() as RealChatConversation),
          conversationId,
        };
      }

      const nowIso = new Date().toISOString();
      const myInfo: ChatParticipantInfo = {
        uid: identity.uid,
        name: identity.name,
        photo: identity.photo || '',
        programmeName: input.profile?.programmeShort || input.profile?.programmeName || '',
        yearOfStudy: input.profile?.yearOfStudy || '',
        universityShort: input.profile?.universityShort || '',
        roleLabel: identity.roleLabel,
        accountRole: identity.accountRole,
      };

      const peerInfo: ChatParticipantInfo = {
        uid: input.peer.uid,
        name: input.peer.name || 'Student',
        photo: input.peer.photo || '',
        programmeName: input.peer.programmeName || '',
        yearOfStudy: input.peer.yearOfStudy || '',
        universityShort: input.peer.universityShort || '',
        roleLabel: input.peer.roleLabel || 'Student',
        accountRole: input.peer.accountRole || 'student',
      };

      const newConv: RealChatConversation = {
        conversationId,
        type: 'direct',
        participantIds: sortedUids,
        participants: {
          [identity.uid]: myInfo,
          [input.peer.uid]: peerInfo,
        },
        universityId: sanitizeIdSegment(
          input.profile?.universityId || input.profile?.universityShort || ''
        ),
        lastMessage: 'Direct conversation started',
        lastSenderUid: identity.uid,
        lastSenderName: identity.name,
        lastMessageAt: nowIso,
        unreadCountByUser: {
          [identity.uid]: 0,
          [input.peer.uid]: 0,
        },
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await setDoc(convRef, newConv);
      return newConv;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conversationId}`
      );
    }
  }

  /**
   * Creates a new Private Group Chat with Owner / Admin / Member roles.
   * Only invited/added participants can access a Private Group Chat.
   */
  async createPrivateGroupChat(input: {
    title: string;
    description?: string;
    initialMembers?: ChatParticipantInfo[];
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<RealChatConversation> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const cleanTitle = input.title.trim().slice(0, 100);
    if (cleanTitle.length < 2) {
      throw new Error('Group name must be at least 2 characters.');
    }

    const conversationId = `pgrp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const myInfo: ChatParticipantInfo = {
      uid: identity.uid,
      name: identity.name,
      photo: identity.photo || '',
      programmeName: input.profile?.programmeShort || input.profile?.programmeName || '',
      yearOfStudy: input.profile?.yearOfStudy || '',
      universityShort: input.profile?.universityShort || '',
      roleLabel: identity.roleLabel,
      accountRole: identity.accountRole,
      groupRole: 'owner',
    };

    const participantIds: string[] = [identity.uid];
    const participants: Record<string, ChatParticipantInfo> = {
      [identity.uid]: myInfo,
    };
    const memberRoles: Record<string, GroupMemberRole> = {
      [identity.uid]: 'owner',
    };
    const unreadCountByUser: Record<string, number> = {
      [identity.uid]: 0,
    };

    for (const m of input.initialMembers || []) {
      const mUid = (m.uid || '').trim();
      if (!mUid || mUid === identity.uid || participantIds.includes(mUid)) continue;
      if (participantIds.length >= 100) break;
      participantIds.push(mUid);
      participants[mUid] = {
        ...m,
        uid: mUid,
        name: (m.name || 'Member').slice(0, 100),
        groupRole: 'member',
      };
      memberRoles[mUid] = 'member';
      unreadCountByUser[mUid] = 1;
    }

    const groupConv: RealChatConversation = {
      conversationId,
      type: 'private_group',
      title: cleanTitle,
      groupDescription: (input.description || '').trim().slice(0, 300),
      ownerUid: identity.uid,
      adminUids: [identity.uid],
      memberRoles,
      participantIds,
      participants,
      universityId: sanitizeIdSegment(
        input.profile?.universityId || input.profile?.universityShort || ''
      ),
      lastMessage: `${identity.name} created group "${cleanTitle}"`,
      lastSenderUid: identity.uid,
      lastSenderName: identity.name,
      lastMessageAt: nowIso,
      unreadCountByUser,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, conversationId), groupConv);

      // Notify added members
      for (const mUid of participantIds) {
        if (mUid !== identity.uid) {
          this.createInAppNotification({
            recipientUid: mUid,
            title: `Added to study group: ${cleanTitle}`,
            message: `${identity.name} invited you to private group "${cleanTitle}".`,
            category: 'community',
          }).catch(() => {});
        }
      }

      return groupConv;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conversationId}`
      );
    }
  }

  /**
   * Private Group Management: Rename or update description (Owner or Group Admin only).
   */
  async updatePrivateGroupInfo(
    conversationId: string,
    updates: { title: string; groupDescription?: string }
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');
    const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, conversationId);
    const snap = await getDoc(convRef);
    if (!snap.exists()) throw new Error('Group not found.');

    const data = snap.data() as RealChatConversation;
    const myRole = data.memberRoles?.[currentUser.uid];
    const isGroupAdmin =
      data.ownerUid === currentUser.uid ||
      myRole === 'owner' ||
      myRole === 'admin' ||
      (data.adminUids || []).includes(currentUser.uid);

    if (!isGroupAdmin) {
      throw new Error('Only group owners and admins can update group information.');
    }

    try {
      await updateDoc(convRef, {
        title: updates.title.trim().slice(0, 100),
        groupDescription: (updates.groupDescription || '').trim().slice(0, 300),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conversationId}`
      );
    }
  }

  /**
   * Private Group Management: Add member, Remove member, or Promote/Demote Admin.
   */
  async managePrivateGroupMember(input: {
    conversationId: string;
    action: 'add' | 'remove' | 'promote_admin' | 'demote_member';
    targetMember: ChatParticipantInfo;
  }): Promise<RealChatConversation> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');
    const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, input.conversationId);
    const snap = await getDoc(convRef);
    if (!snap.exists()) throw new Error('Group not found.');

    const data = snap.data() as RealChatConversation;
    const myRole = data.memberRoles?.[currentUser.uid];
    const isGroupAdmin =
      data.ownerUid === currentUser.uid ||
      myRole === 'owner' ||
      myRole === 'admin' ||
      (data.adminUids || []).includes(currentUser.uid);

    if (!isGroupAdmin) {
      throw new Error('Only group owners and admins can manage group members.');
    }

    const targetUid = input.targetMember.uid;
    const participantIds = [...(data.participantIds || [])];
    const participants = { ...(data.participants || {}) };
    const memberRoles = { ...(data.memberRoles || {}) };
    const adminUids = new Set(data.adminUids || [data.ownerUid || '']);

    if (input.action === 'add') {
      if (!participantIds.includes(targetUid)) {
        if (participantIds.length >= 150) {
          throw new Error('Group member limit reached.');
        }
        participantIds.push(targetUid);
      }
      participants[targetUid] = {
        ...input.targetMember,
        groupRole: 'member',
      };
      memberRoles[targetUid] = 'member';
    } else if (input.action === 'remove') {
      if (targetUid === data.ownerUid) {
        throw new Error('The group owner cannot be removed.');
      }
      const idx = participantIds.indexOf(targetUid);
      if (idx !== -1) participantIds.splice(idx, 1);
      delete participants[targetUid];
      delete memberRoles[targetUid];
      adminUids.delete(targetUid);
    } else if (input.action === 'promote_admin') {
      memberRoles[targetUid] = 'admin';
      if (participants[targetUid]) participants[targetUid].groupRole = 'admin';
      adminUids.add(targetUid);
    } else if (input.action === 'demote_member') {
      if (targetUid === data.ownerUid) {
        throw new Error('The group owner cannot be demoted.');
      }
      memberRoles[targetUid] = 'member';
      if (participants[targetUid]) participants[targetUid].groupRole = 'member';
      adminUids.delete(targetUid);
    }

    const updatedPayload = {
      participantIds,
      participants,
      memberRoles,
      adminUids: Array.from(adminUids).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(convRef, updatedPayload);
      return {
        ...data,
        ...updatedPayload,
      };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${input.conversationId}`
      );
    }
  }

  /**
   * Opens or joins an official Open Community Discussion / Group Chat room for an authorized CommunitySpace
   * (University, College, Department, Programme, or Course Open Discussion).
   */
  async getOrJoinCommunityGroupChat(input: {
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
    community: CommunitySpace;
  }): Promise<RealChatConversation> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const conversationId = `grp_${sanitizeIdSegment(input.community.communityId)}`.slice(0, 120);
    const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, conversationId);

    const myInfo: ChatParticipantInfo = {
      uid: identity.uid,
      name: identity.name,
      photo: identity.photo || '',
      programmeName: input.profile?.programmeShort || input.profile?.programmeName || '',
      yearOfStudy: input.profile?.yearOfStudy || '',
      universityShort: input.profile?.universityShort || '',
      roleLabel: identity.roleLabel,
      accountRole: identity.accountRole,
    };

    try {
      const existing = await getDoc(convRef);
      if (existing.exists()) {
        const data = existing.data() as RealChatConversation;
        const currentParticipants = Array.isArray(data.participantIds) ? data.participantIds : [];
        if (!currentParticipants.includes(identity.uid) && currentParticipants.length < 200) {
          const updatedIds = [...currentParticipants, identity.uid];
          const updatedMap = {
            ...(data.participants || {}),
            [identity.uid]: myInfo,
          };
          await updateDoc(convRef, {
            participantIds: updatedIds,
            participants: updatedMap,
          }).catch(() => {});
          return {
            ...data,
            conversationId,
            participantIds: updatedIds,
            participants: updatedMap,
          };
        }
        return {
          ...data,
          conversationId,
        };
      }

      const nowIso = new Date().toISOString();
      const newGroupConv: RealChatConversation = {
        conversationId,
        type: 'community_group',
        participantIds: [identity.uid],
        participants: {
          [identity.uid]: myInfo,
        },
        communityId: input.community.communityId,
        communityName: input.community.name,
        universityId: input.community.universityId,
        programmeId: input.community.programmeId || '',
        courseCode: input.community.courseCode || '',
        title:
          input.community.communityType === 'course'
            ? `${input.community.shortLabel} — Course Discussion`
            : `${input.community.shortLabel} Discussion Chat`,
        lastMessage: `Open discussion room for ${input.community.name}.`,
        lastSenderUid: identity.uid,
        lastSenderName: identity.name,
        lastMessageAt: nowIso,
        unreadCountByUser: {},
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await setDoc(convRef, newGroupConv);
      return newGroupConv;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conversationId}`
      );
    }
  }

  subscribeToUserConversations(
    userId: string,
    onUpdate: (conversations: RealChatConversation[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!userId || !auth.currentUser) {
      onUpdate([]);
      return () => {};
    }

    const colRef = collection(db, COMMUNITY_COLLECTIONS.CONVERSATIONS);
    const q = query(colRef, where('participantIds', 'array-contains', userId), limit(50));

    return onSnapshot(
      q,
      (snap) => {
        const list: RealChatConversation[] = [];
        snap.forEach((d) => {
          const data = d.data() as RealChatConversation;
          list.push({
            ...data,
            conversationId: data.conversationId || d.id,
          });
        });
        list.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
        onUpdate(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }

  subscribeToConversationMessages(
    conversationId: string,
    limitCount = 60,
    onUpdate: (messages: RealChatMessage[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!conversationId || !auth.currentUser) {
      onUpdate([]);
      return () => {};
    }

    const msgColRef = collection(
      db,
      COMMUNITY_COLLECTIONS.CONVERSATIONS,
      conversationId,
      COMMUNITY_COLLECTIONS.MESSAGES
    );
    const q = query(msgColRef, orderBy('createdAt', 'asc'), limit(limitCount));

    return onSnapshot(
      q,
      (snap) => {
        const list: RealChatMessage[] = [];
        snap.forEach((d) => {
          const data = d.data() as RealChatMessage;
          // Preserve soft-deleted messages ("This message was deleted.") so thread structure & reply references stay consistent
          if (data.status === 'deleted' || data.isDeleted) {
            list.push({
              messageId: data.messageId || d.id,
              conversationId: data.conversationId || conversationId,
              senderUid: data.senderUid,
              senderName: data.senderName,
              senderPhoto: data.senderPhoto || '',
              senderRoleLabel: data.senderRoleLabel || '',
              text: 'This message was deleted.',
              messageType: 'text',
              createdAt: data.createdAt,
              deletedAt: data.deletedAt || data.editedAt || null,
              status: 'deleted',
              isDeleted: true,
            });
          } else {
            list.push({
              ...data,
              messageId: data.messageId || d.id,
              isPinned: Boolean(data.isPinned ?? data.pinned),
              pinned: Boolean(data.pinned ?? data.isPinned),
              isDeleted: false,
            });
          }
        });
        onUpdate(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }

  /**
   * Uploads a conversation image to Firebase Storage under `community_media/{conversationId}/{senderUid}/{timestamp}_{filename}`.
   * Optimizes large images before upload so unnecessarily huge original files are not uploaded.
   */
  async uploadChatImageAttachment(
    conversationId: string,
    file: File
  ): Promise<{ downloadUrl: string; storagePath: string; fileSize: number }> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('You must be signed in to upload an image.');
    if (!file.type.startsWith('image/')) throw new Error('Only image files are supported.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Image size must be under 10 MB.');

    const compressedDataUrl = await this.compressImageFile(file, 1280, 0.82);
    const res = await fetch(compressedDataUrl);
    const optimizedBlob = await res.blob();

    const safeConvId = sanitizeIdSegment(conversationId) || 'chat';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60) || 'image.jpg';
    const storagePath = `community_media/${safeConvId}/${currentUser.uid}/${Date.now()}_${safeName}`;

    try {
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, optimizedBlob, {
        contentType: optimizedBlob.type || 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(storageRef);
      return {
        downloadUrl,
        storagePath,
        fileSize: optimizedBlob.size || file.size,
      };
    } catch {
      return {
        downloadUrl: compressedDataUrl,
        storagePath,
        fileSize: optimizedBlob.size || file.size,
      };
    }
  }

  /**
   * Uploads a voice-note audio recording to Firebase Storage under `community_voice/{conversationId}/{senderUid}/{timestamp}_voice.webm`.
   * Stores actual audio binary in Firebase Storage and only metadata in Firestore.
   */
  async uploadVoiceNote(
    conversationIdOrBlob: string | Blob,
    audioBlobOrDuration: Blob | number,
    maybeDurationSec?: number
  ): Promise<{
    downloadUrl: string;
    storagePath: string;
    durationSec: number;
    contentType: string;
  }> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required to send a voice note.');

    const conversationId =
      typeof conversationIdOrBlob === 'string' ? conversationIdOrBlob : 'chat';
    const audioBlob =
      conversationIdOrBlob instanceof Blob
        ? conversationIdOrBlob
        : (audioBlobOrDuration as Blob);
    const durationSec =
      typeof conversationIdOrBlob === 'string'
        ? Number(maybeDurationSec || 1)
        : Number(audioBlobOrDuration || 1);

    if (!audioBlob || audioBlob.size === 0) throw new Error('Voice recording is empty.');
    if (audioBlob.size > 15 * 1024 * 1024) throw new Error('Voice note exceeds 15 MB limit.');

    const contentType = audioBlob.type || 'audio/webm';
    const ext = contentType.includes('mp4') || contentType.includes('aac')
      ? 'm4a'
      : contentType.includes('ogg')
      ? 'ogg'
      : 'webm';
    const safeConvId = sanitizeIdSegment(conversationId) || 'chat';
    const storagePath = `community_voice/${safeConvId}/${currentUser.uid}/${Date.now()}_voice.${ext}`;

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, audioBlob, { contentType });
    const downloadUrl = await getDownloadURL(storageRef);

    return {
      downloadUrl,
      storagePath,
      durationSec: Math.max(1, Math.round(durationSec || 1)),
      contentType,
    };
  }

  /**
   * Alias for uploadChatDocument for single-argument file uploads from CommunityScreen
   */
  async uploadChatFile(file: File): Promise<{
    fileUrl: string;
    downloadUrl: string;
    storagePath: string;
    fileName: string;
    fileSize: number;
    fileSizeLabel: string;
    fileMimeType: string;
    contentType: string;
  }> {
    const res = await this.uploadChatDocument('chat', file);
    return {
      ...res,
      fileUrl: res.downloadUrl,
      fileMimeType: res.contentType,
    };
  }

  /**
   * Uploads a supported academic document (PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT) to Firebase Storage
   * under `community_files/{conversationId}/{senderUid}/{timestamp}_{filename}`.
   */
  async uploadChatDocument(
    conversationId: string,
    file: File
  ): Promise<{
    downloadUrl: string;
    storagePath: string;
    fileName: string;
    fileSize: number;
    fileSizeLabel: string;
    contentType: string;
  }> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required to share files.');

    const lowerName = file.name.toLowerCase();
    const isAllowedExt = ALLOWED_CHAT_DOCUMENT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!isAllowedExt) {
      throw new Error(
        'Unsupported document format. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT.'
      );
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('Document size must be under 25 MB.');
    }

    const contentType =
      file.type ||
      (lowerName.endsWith('.pdf')
        ? 'application/pdf'
        : lowerName.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : lowerName.endsWith('.doc')
        ? 'application/msword'
        : lowerName.endsWith('.pptx')
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : lowerName.endsWith('.ppt')
        ? 'application/vnd.ms-powerpoint'
        : lowerName.endsWith('.xlsx')
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : lowerName.endsWith('.xls')
        ? 'application/vnd.ms-excel'
        : 'text/plain');

    const safeConvId = sanitizeIdSegment(conversationId) || 'chat';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const storagePath = `community_files/${safeConvId}/${currentUser.uid}/${Date.now()}_${safeName}`;

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, { contentType });
    const downloadUrl = await getDownloadURL(storageRef);

    return {
      downloadUrl,
      storagePath,
      fileName: file.name.slice(0, 120),
      fileSize: file.size,
      fileSizeLabel: formatFileSize(file.size),
      contentType,
    };
  }

  /**
   * Sends a real message in a conversation (supports text, image, voice note, document, reply quote, @mentions, and safe link preview).
   * Enforces announcement-only restrictions, @everyone role restrictions, and mute-aware notifications.
   */
  async sendChatMessage(input: {
    conversation: RealChatConversation;
    text: string;
    imageUrl?: string;
    imageStoragePath?: string;
    fileAttachment?: {
      downloadUrl?: string;
      fileUrl?: string;
      storagePath?: string;
      fileName: string;
      fileSize: number;
      fileSizeLabel?: string;
      contentType?: string;
      fileMimeType?: string;
    } | null;
    voiceAttachment?: {
      downloadUrl?: string;
      voiceUrl?: string;
      storagePath?: string;
      durationSec: number;
      contentType?: string;
      voiceMimeType?: string;
    } | null;
    replyTo?: {
      messageId: string;
      senderName: string;
      excerpt: string;
      isAnnouncementOnly?: boolean;
    } | null;
    mentions?: string[];
    mentionedUids?: string[];
    mentionNames?: string[];
    mentionedNames?: string[];
    isForwarded?: boolean;
    forwardedFromSenderName?: string | null;
    forwardedFromConversationType?: RealChatConversation['type'] | null;
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<RealChatMessage> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const cleanText = input.text.trim().slice(0, 4000);
    const resolvedFileUrl =
      input.fileAttachment?.downloadUrl || input.fileAttachment?.fileUrl || '';
    const resolvedFileMime =
      input.fileAttachment?.contentType || input.fileAttachment?.fileMimeType || '';
    const resolvedVoiceUrl =
      input.voiceAttachment?.downloadUrl || input.voiceAttachment?.voiceUrl || '';
    const resolvedVoiceMime =
      input.voiceAttachment?.contentType || input.voiceAttachment?.voiceMimeType || '';

    const hasImage = Boolean(input.imageUrl);
    const hasFile = Boolean(resolvedFileUrl);
    const hasVoice = Boolean(resolvedVoiceUrl);

    if (!cleanText && !hasImage && !hasFile && !hasVoice) {
      throw new Error('Cannot send an empty message.');
    }

    // 1. Respect announcement-only permissions: students cannot reply to announcement-only messages or post in announcement-only channels
    const isGroupAdmin =
      input.conversation.ownerUid === identity.uid ||
      (input.conversation.adminUids || []).includes(identity.uid) ||
      input.conversation.memberRoles?.[identity.uid] === 'owner' ||
      input.conversation.memberRoles?.[identity.uid] === 'admin';
    const isAuthorizedOfficial =
      identity.accountRole === 'lecturer' || identity.accountRole === 'admin' || isGroupAdmin;

    if (input.conversation.isAnnouncementOnly && !isAuthorizedOfficial) {
      throw new Error('Only authorized lecturers or administrators can post in announcement-only channels.');
    }

    if (input.replyTo?.isAnnouncementOnly && identity.accountRole === 'student' && !isGroupAdmin) {
      throw new Error('Students cannot reply directly to announcement-only messages.');
    }

    // 2. Enforce @everyone restriction: normal students cannot trigger @everyone
    const rawMentionsSource = input.mentions || input.mentionedUids || [];
    const rawMentions = Array.isArray(rawMentionsSource) ? rawMentionsSource.slice(0, 20) : [];
    const requestsEveryone =
      rawMentions.includes('everyone') || /(?:^|\s)@everyone\b/i.test(cleanText);
    if (requestsEveryone && !isAuthorizedOfficial) {
      throw new Error(
        'Only lecturers, platform admins, or group admins are permitted to mention @everyone.'
      );
    }

    const validMentions = requestsEveryone
      ? Array.from(new Set([...rawMentions, 'everyone']))
      : rawMentions.filter((m) => m !== 'everyone');
    const resolvedMentionNames = input.mentionNames || input.mentionedNames || [];

    // 3. Extract safe links and preview
    const { links, preview } = extractLinksAndSafePreview(cleanText);

    const messageType: MessageAttachmentType = hasVoice
      ? 'voice'
      : hasFile
      ? 'file'
      : hasImage
      ? 'image'
      : 'text';

    const fallbackText =
      cleanText ||
      (hasVoice
        ? `🎤 Voice note (${input.voiceAttachment!.durationSec}s)`
        : hasFile
        ? `📄 ${input.fileAttachment!.fileName}`
        : hasImage
        ? '📷 Shared an image'
        : '');

    const conversationId = input.conversation.conversationId;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const message: RealChatMessage = {
      messageId,
      conversationId,
      senderUid: identity.uid,
      senderName: identity.name,
      senderPhoto: identity.photo || '',
      senderRoleLabel: identity.roleLabel,
      senderAccountRole: identity.accountRole,
      text: fallbackText,
      messageType,
      imageUrl: input.imageUrl || '',
      imageStoragePath: input.imageStoragePath || '',
      fileUrl: resolvedFileUrl,
      fileStoragePath: input.fileAttachment?.storagePath || '',
      fileName: input.fileAttachment?.fileName || '',
      fileSize: input.fileAttachment?.fileSize || 0,
      fileSizeLabel:
        input.fileAttachment?.fileSizeLabel ||
        (input.fileAttachment?.fileSize ? formatFileSize(input.fileAttachment.fileSize) : ''),
      fileContentType: resolvedFileMime,
      fileMimeType: resolvedFileMime,
      voiceUrl: resolvedVoiceUrl,
      voiceStoragePath: input.voiceAttachment?.storagePath || '',
      voiceDurationSec: input.voiceAttachment?.durationSec || 0,
      voiceContentType: resolvedVoiceMime,
      replyToMessageId: input.replyTo?.messageId || null,
      replyToSenderName: input.replyTo?.senderName || null,
      replyToExcerpt: input.replyTo?.excerpt ? input.replyTo.excerpt.slice(0, 140) : null,
      isForwarded: Boolean(input.isForwarded),
      forwardedFromSenderName: input.forwardedFromSenderName || null,
      forwardedFromConversationType: input.forwardedFromConversationType || null,
      pinned: false,
      isPinned: false,
      pinnedByUid: null,
      pinnedByName: null,
      pinnedAt: null,
      mentions: validMentions,
      mentionNames: Array.isArray(resolvedMentionNames) ? resolvedMentionNames.slice(0, 20) : [],
      extractedLinks: links,
      linkPreview: preview,
      reactions: {},
      reactionCounts: {},
      isAnnouncementOnly: Boolean(input.conversation.isAnnouncementOnly),
      createdAt: nowIso,
      editedAt: null,
      deletedAt: null,
      deletedByUid: null,
      status: 'sent',
      isDeleted: false,
    };

    const msgRef = doc(
      db,
      COMMUNITY_COLLECTIONS.CONVERSATIONS,
      conversationId,
      COMMUNITY_COLLECTIONS.MESSAGES,
      messageId
    );
    const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, conversationId);

    try {
      await setDoc(msgRef, message);

      const lastPreviewText = cleanText
        ? cleanText.slice(0, 140)
        : hasVoice
        ? `🎤 Voice note (${input.voiceAttachment!.durationSec}s)`
        : hasFile
        ? `📄 ${input.fileAttachment!.fileName}`
        : '📷 Image attachment';

      const convUpdates: Record<string, any> = {
        lastMessage: lastPreviewText,
        lastSenderUid: identity.uid,
        lastSenderName: identity.name,
        lastMessageAt: nowIso,
        updatedAt: nowIso,
        [`unreadCountByUser.${identity.uid}`]: 0,
      };

      // Increment unread count for recipients (even if muted — unread state remains accurate)
      for (const pUid of (input.conversation.participantIds || []).slice(0, 40)) {
        if (pUid && pUid !== identity.uid) {
          convUpdates[`unreadCountByUser.${pUid}`] = increment(1);
        }
      }

      await updateDoc(convRef, convUpdates).catch(() => {});

      // Clear sender's typing indicator immediately on send
      this.setTypingStatus(conversationId, identity.name, false).catch(() => {});

      // Dispatch mute-aware notifications for direct messages, replies, and @mentions
      this.dispatchMessageNotifications({
        conversation: input.conversation,
        message,
        senderUid: identity.uid,
        senderName: identity.name,
      }).catch(() => {});

      return message;
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.CREATE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conversationId}/${COMMUNITY_COLLECTIONS.MESSAGES}/${messageId}`
      );
    }
  }

  /**
   * Dispatches real notifications for Direct Messages, Replies, and @Mentions,
   * while respecting each recipient's Mute settings for that conversation.
   */
  private async dispatchMessageNotifications(input: {
    conversation: RealChatConversation;
    message: RealChatMessage;
    senderUid: string;
    senderName: string;
  }): Promise<void> {
    const convId = input.conversation.conversationId;
    const convTitle =
      input.conversation.title || input.conversation.communityName || 'Direct Message';
    const notifiedUids = new Set<string>();

    const shouldNotifyRecipient = async (recipientUid: string): Promise<boolean> => {
      if (!recipientUid || recipientUid === input.senderUid || notifiedUids.has(recipientUid)) {
        return false;
      }
      const isMuted = await this.isConversationMutedByUser(recipientUid, convId);
      if (isMuted) return false;
      notifiedUids.add(recipientUid);
      return true;
    };

    // 1. Direct message notification
    if (input.conversation.type === 'direct') {
      const otherUid = (input.conversation.participantIds || []).find((u) => u !== input.senderUid);
      if (otherUid && (await shouldNotifyRecipient(otherUid))) {
        await this.createInAppNotification({
          recipientUid: otherUid,
          title: `New message from ${input.senderName}`,
          message: input.message.text.slice(0, 120),
          category: 'community',
        });
      }
    }

    // 2. @Mentions notification
    const mentions = input.message.mentions || [];
    if (mentions.includes('everyone')) {
      for (const pUid of (input.conversation.participantIds || []).slice(0, 30)) {
        if (await shouldNotifyRecipient(pUid)) {
          await this.createInAppNotification({
            recipientUid: pUid,
            title: `${input.senderName} mentioned @everyone in ${convTitle}`,
            message: input.message.text.slice(0, 120),
            category: 'community',
          });
        }
      }
    } else {
      for (const mUid of mentions) {
        if (await shouldNotifyRecipient(mUid)) {
          await this.createInAppNotification({
            recipientUid: mUid,
            title: `${input.senderName} mentioned you in ${convTitle}`,
            message: input.message.text.slice(0, 120),
            category: 'community',
          });
        }
      }
    }

    // 3. Direct reply notification (if replying to another participant's message)
    if (input.message.replyToMessageId) {
      try {
        const origSnap = await getDoc(
          doc(
            db,
            COMMUNITY_COLLECTIONS.CONVERSATIONS,
            convId,
            COMMUNITY_COLLECTIONS.MESSAGES,
            input.message.replyToMessageId
          )
        );
        if (origSnap.exists()) {
          const origData = origSnap.data() as RealChatMessage;
          if (origData.senderUid && (await shouldNotifyRecipient(origData.senderUid))) {
            await this.createInAppNotification({
              recipientUid: origData.senderUid,
              title: `${input.senderName} replied to your message`,
              message: input.message.text.slice(0, 120),
              category: 'community',
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Edits own eligible text message.
   * Strictly verifies that the authenticated user is the original sender.
   * Lecturers/admins cannot edit another user's message.
   */
  async editChatMessage(
    conversationId: string,
    messageId: string,
    newText: string
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');
    const cleanText = newText.trim().slice(0, 4000);
    if (!cleanText) throw new Error('Message text cannot be empty.');

    const msgRef = doc(
      db,
      COMMUNITY_COLLECTIONS.CONVERSATIONS,
      conversationId,
      COMMUNITY_COLLECTIONS.MESSAGES,
      messageId
    );
    const snap = await getDoc(msgRef);
    if (!snap.exists()) throw new Error('Message not found.');
    const existing = snap.data() as RealChatMessage;

    if (existing.senderUid !== currentUser.uid) {
      throw new Error('Permission denied: You can only edit your own messages.');
    }
    if (existing.status === 'deleted') {
      throw new Error('Cannot edit a deleted message.');
    }

    const { links, preview } = extractLinksAndSafePreview(cleanText);

    try {
      await updateDoc(msgRef, {
        text: cleanText,
        extractedLinks: links,
        linkPreview: preview,
        editedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conversationId}/${COMMUNITY_COLLECTIONS.MESSAGES}/${messageId}`
      );
    }
  }

  /**
   * Toggles a user's reaction emoji (👍 ❤️ 😂 😮 😢 👏) on a chat message.
   * Users can add or remove their own reaction; counts are recalculated accurately without excessive writes.
   */
  async toggleChatMessageReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const uid = currentUser.uid;
    const msgRef = doc(
      db,
      COMMUNITY_COLLECTIONS.CONVERSATIONS,
      conversationId,
      COMMUNITY_COLLECTIONS.MESSAGES,
      messageId
    );
    try {
      const snap = await getDoc(msgRef);
      if (!snap.exists()) return;
      const data = snap.data() as RealChatMessage;
      if (data.status === 'deleted') return;

      const reactions: Record<string, string[]> = { ...(data.reactions || {}) };
      const reactionCounts: Record<string, number> = { ...(data.reactionCounts || {}) };

      const currentUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
      const existingIdx = currentUsers.indexOf(uid);

      if (existingIdx !== -1) {
        currentUsers.splice(existingIdx, 1);
      } else {
        if (currentUsers.length < 200) {
          currentUsers.push(uid);
        }
      }

      reactions[emoji] = currentUsers;
      reactionCounts[emoji] = currentUsers.length;

      await updateDoc(msgRef, {
        reactions,
        reactionCounts,
      });
    } catch {
      // ignore non-critical reaction error
    }
  }

  /**
   * Soft-deletes a chat message ("This message was deleted.") while preserving conversation thread structure.
   * Scrubs sensitive media/file/voice URLs so deleted message contents are not exposed.
   */
  async deleteChatMessage(conversationId: string, messageId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required.');
    const msgRef = doc(
      db,
      COMMUNITY_COLLECTIONS.CONVERSATIONS,
      conversationId,
      COMMUNITY_COLLECTIONS.MESSAGES,
      messageId
    );
    const nowIso = new Date().toISOString();
    try {
      await updateDoc(msgRef, {
        status: 'deleted',
        text: 'This message was deleted.',
        messageType: 'text',
        imageUrl: '',
        fileUrl: '',
        fileName: '',
        voiceUrl: '',
        extractedLinks: [],
        linkPreview: null,
        pinned: false,
        deletedAt: nowIso,
        deletedByUid: currentUser.uid,
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conversationId}/${COMMUNITY_COLLECTIONS.MESSAGES}/${messageId}`
      );
    }
  }

  /**
   * Pins or unpins an important message in a conversation.
   * Only authorized users (Lecturers, Platform Admins, Group Owners/Admins, or participants in a 1-to-1 Direct Chat) can pin/unpin.
   */
  async togglePinChatMessage(input: {
    conversation: RealChatConversation;
    message?: RealChatMessage;
    messageId?: string;
    pin?: boolean;
    isAdminOrOwner?: boolean;
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
    lecturerAssignments?: LecturerCourseAssignment[];
  }): Promise<{ pinned: boolean }> {
    const identity = this.getAuthenticatedIdentity(input.profile, input.lecturer);
    const conv = input.conversation;
    const isGroupAdmin =
      conv.ownerUid === identity.uid ||
      (conv.adminUids || []).includes(identity.uid) ||
      conv.memberRoles?.[identity.uid] === 'owner' ||
      conv.memberRoles?.[identity.uid] === 'admin';

    const canPin =
      Boolean(input.isAdminOrOwner) ||
      identity.accountRole === 'lecturer' ||
      identity.accountRole === 'admin' ||
      isGroupAdmin ||
      (conv.type === 'direct' && (conv.participantIds || []).includes(identity.uid));

    if (!canPin) {
      throw new Error(
        'Only lecturers, administrators, or group admins can pin messages in this community.'
      );
    }

    const targetMessageId = input.messageId || input.message?.messageId || '';
    if (!targetMessageId) throw new Error('Message ID is required.');

    const nextPinned =
      typeof input.pin === 'boolean'
        ? input.pin
        : !(input.message?.isPinned ?? input.message?.pinned);
    const nowIso = new Date().toISOString();
    const msgRef = doc(
      db,
      COMMUNITY_COLLECTIONS.CONVERSATIONS,
      conv.conversationId,
      COMMUNITY_COLLECTIONS.MESSAGES,
      targetMessageId
    );
    const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, conv.conversationId);

    try {
      await updateDoc(msgRef, {
        pinned: nextPinned,
        isPinned: nextPinned,
        pinnedByUid: nextPinned ? identity.uid : null,
        pinnedByName: nextPinned ? identity.name : null,
        pinnedAt: nextPinned ? nowIso : null,
      });

      const currentPinnedIds = Array.isArray(conv.pinnedMessageIds) ? [...conv.pinnedMessageIds] : [];
      const updatedPinnedIds = nextPinned
        ? Array.from(new Set([targetMessageId, ...currentPinnedIds])).slice(0, 15)
        : currentPinnedIds.filter((id) => id !== targetMessageId);

      await updateDoc(convRef, {
        pinnedMessageIds: updatedPinnedIds,
        updatedAt: nowIso,
      }).catch(() => {});

      return { pinned: nextPinned };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `${COMMUNITY_COLLECTIONS.CONVERSATIONS}/${conv.conversationId}/${COMMUNITY_COLLECTIONS.MESSAGES}/${targetMessageId}`
      );
    }
  }

  /**
   * Forwards an eligible message into another target conversation where the user is authorized to send.
   * Respects private conversation privacy, announcement restrictions, and deleted message checks.
   */
  async forwardChatMessage(input: {
    sourceMessage: RealChatMessage;
    sourceConversation: RealChatConversation;
    targetConversation: RealChatConversation;
    profile?: StudentProfile | null;
    lecturer?: LecturerRecord | null;
  }): Promise<RealChatMessage> {
    if (input.sourceMessage.status === 'deleted') {
      throw new Error('Deleted messages cannot be forwarded.');
    }

    return this.sendChatMessage({
      conversation: input.targetConversation,
      text: input.sourceMessage.text,
      imageUrl: input.sourceMessage.imageUrl,
      imageStoragePath: input.sourceMessage.imageStoragePath,
      fileAttachment: input.sourceMessage.fileUrl
        ? {
            downloadUrl: input.sourceMessage.fileUrl,
            storagePath: input.sourceMessage.fileStoragePath || '',
            fileName: input.sourceMessage.fileName || 'Document',
            fileSize: input.sourceMessage.fileSize || 0,
            fileSizeLabel: input.sourceMessage.fileSizeLabel || '',
            contentType: input.sourceMessage.fileContentType || 'application/pdf',
          }
        : null,
      voiceAttachment: input.sourceMessage.voiceUrl
        ? {
            downloadUrl: input.sourceMessage.voiceUrl,
            storagePath: input.sourceMessage.voiceStoragePath || '',
            durationSec: input.sourceMessage.voiceDurationSec || 1,
            contentType: input.sourceMessage.voiceContentType || 'audio/webm',
          }
        : null,
      isForwarded: true,
      forwardedFromSenderName:
        input.sourceConversation.type === 'direct'
          ? 'Private Chat'
          : input.sourceMessage.senderName,
      forwardedFromConversationType: input.sourceConversation.type,
      profile: input.profile,
      lecturer: input.lecturer,
    });
  }

  /**
   * Paginated, bounded search inside a specific conversation without downloading the entire history.
   * Supports filtering by message text, sender name, and date range.
   */
  async searchConversationMessages(options: {
    conversationId: string;
    queryText: string;
    senderFilter?: string;
    pageSize?: number;
    lastDoc?: DocumentSnapshot | null;
  }): Promise<{
    messages: RealChatMessage[];
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    if (!options.conversationId || !auth.currentUser) {
      return { messages: [], lastDoc: null, hasMore: false };
    }

    const batchSize = options.pageSize || 40;
    const msgColRef = collection(
      db,
      COMMUNITY_COLLECTIONS.CONVERSATIONS,
      options.conversationId,
      COMMUNITY_COLLECTIONS.MESSAGES
    );

    const q = options.lastDoc
      ? query(
          msgColRef,
          orderBy('createdAt', 'desc'),
          startAfter(options.lastDoc),
          limit(batchSize)
        )
      : query(msgColRef, orderBy('createdAt', 'desc'), limit(batchSize));

    try {
      const snap = await getDocs(q);
      const cleanTerm = options.queryText.trim().toLowerCase();
      const cleanSender = (options.senderFilter || '').trim().toLowerCase();

      const matched: RealChatMessage[] = [];
      snap.docs.forEach((d) => {
        const data = d.data() as RealChatMessage;
        if (data.status === 'deleted') return;
        const textMatch =
          !cleanTerm ||
          (data.text || '').toLowerCase().includes(cleanTerm) ||
          (data.fileName || '').toLowerCase().includes(cleanTerm) ||
          (data.senderName || '').toLowerCase().includes(cleanTerm);
        const senderMatch =
          !cleanSender || (data.senderName || '').toLowerCase().includes(cleanSender);

        if (textMatch && senderMatch) {
          matched.push({
            ...data,
            messageId: data.messageId || d.id,
          });
        }
      });

      return {
        messages: matched,
        lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
        hasMore: snap.docs.length === batchSize,
      };
    } catch {
      return { messages: [], lastDoc: null, hasMore: false };
    }
  }

  // ============================================================================
  // REAL-TIME TYPING INDICATOR (THROTTLED, EPHEMERAL, AUTO-EXPIRING)
  // ============================================================================

  private lastTypingWriteByConv = new Map<string, number>();

  async setTypingStatus(
    conversationId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !conversationId) return;

    const now = Date.now();
    const lastWrite = this.lastTypingWriteByConv.get(conversationId) || 0;
    // Throttle typing true writes to at most once every 3.5 seconds to prevent Firestore write spam
    if (isTyping && now - lastWrite < 3500) {
      return;
    }
    this.lastTypingWriteByConv.set(conversationId, isTyping ? now : 0);

    const docRef = doc(db, COMMUNITY_COLLECTIONS.TYPING_STATES, conversationId);
    try {
      await setDoc(
        docRef,
        {
          conversationId,
          typingUsers: {
            [currentUser.uid]: {
              uid: currentUser.uid,
              name: (userName || currentUser.displayName || 'Member').slice(0, 60),
              updatedAt: isTyping ? now : 0,
            },
          },
          updatedAt: new Date(now).toISOString(),
        },
        { merge: true }
      );
    } catch {
      // non-blocking ephemeral typing state
    }
  }

  subscribeToTypingStatus(
    conversationId: string,
    currentUserUid: string,
    onUpdate: (activeTypers: Array<{ uid: string; name: string }>) => void
  ): Unsubscribe {
    if (!conversationId || !auth.currentUser) {
      onUpdate([]);
      return () => {};
    }

    const docRef = doc(db, COMMUNITY_COLLECTIONS.TYPING_STATES, conversationId);
    return onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          onUpdate([]);
          return;
        }
        const data = snap.data() as ConversationTypingStateRecord;
        const map = data?.typingUsers || {};
        const now = Date.now();
        const active: Array<{ uid: string; name: string }> = [];
        for (const [uid, entry] of Object.entries(map)) {
          if (uid !== currentUserUid && entry && entry.updatedAt && now - entry.updatedAt < 7500) {
            active.push({ uid, name: entry.name });
          }
        }
        onUpdate(active);
      },
      () => {
        onUpdate([]);
      }
    );
  }

  async setTypingIndicator(
    conversationId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    return this.setTypingStatus(conversationId, userName, isTyping);
  }

  subscribeToConversationTyping(
    conversationId: string,
    currentUserUid: string,
    onUpdate: (activeTypers: Array<{ uid: string; name: string }>) => void
  ): Unsubscribe {
    return this.subscribeToTypingStatus(conversationId, currentUserUid, onUpdate);
  }

  // ============================================================================
  // ONLINE / RECENTLY ACTIVE PRESENCE (PRIVACY-AWARE, NO CONTINUOUS POLLING)
  // ============================================================================

  private lastPresenceHeartbeat = 0;

  async updateUserPresence(name?: string, isOnline = true): Promise<void> {
    return this.updateMyPresence({
      name,
      status: isOnline ? 'online' : 'recently_active',
    });
  }

  async updateMyPresence(options: {
    name?: string;
    status?: 'online' | 'recently_active' | 'offline';
    hideActivityStatus?: boolean;
    force?: boolean;
  }): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const now = Date.now();
    if (!options.force && now - this.lastPresenceHeartbeat < 60_000) {
      return;
    }
    this.lastPresenceHeartbeat = now;

    const resolvedStatus = options.hideActivityStatus ? 'offline' : options.status || 'online';
    const docRef = doc(db, COMMUNITY_COLLECTIONS.USER_PRESENCE, currentUser.uid);
    const payload: Record<string, any> = {
      uid: currentUser.uid,
      name: (options.name || currentUser.displayName || 'Student').slice(0, 80),
      status: resolvedStatus,
      isOnline: resolvedStatus === 'online',
      lastActiveAt: new Date(now).toISOString(),
    };
    if (typeof options.hideActivityStatus === 'boolean') {
      payload.hideActivityStatus = options.hideActivityStatus;
    }

    try {
      await setDoc(docRef, payload, { merge: true });
    } catch {
      // non-blocking
    }
  }

  subscribeToUserPresence(
    uid: string,
    onUpdate: (presence: UserPresenceRecord | null) => void
  ): Unsubscribe {
    if (!uid || !auth.currentUser) {
      onUpdate(null);
      return () => {};
    }
    const docRef = doc(db, COMMUNITY_COLLECTIONS.USER_PRESENCE, uid);
    return onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          onUpdate(null);
          return;
        }
        const data = snap.data() as UserPresenceRecord;
        onUpdate({
          ...data,
          uid: data.uid || uid,
          isOnline: Boolean(data.isOnline ?? data.status === 'online'),
        });
      },
      () => {
        onUpdate(null);
      }
    );
  }

  subscribeToUsersPresence(
    uids: string[],
    onUpdate: (presenceMap: Record<string, UserPresenceRecord>) => void
  ): Unsubscribe {
    const cleanUids = Array.from(new Set(uids.filter(Boolean))).slice(0, 10);
    if (cleanUids.length === 0 || !auth.currentUser) {
      onUpdate({});
      return () => {};
    }

    const q = query(
      collection(db, COMMUNITY_COLLECTIONS.USER_PRESENCE),
      where('uid', 'in', cleanUids)
    );
    return onSnapshot(
      q,
      (snap) => {
        const map: Record<string, UserPresenceRecord> = {};
        snap.forEach((d) => {
          const data = d.data() as UserPresenceRecord;
          if (data?.uid) {
            map[data.uid] = {
              ...data,
              isOnline: Boolean(data.isOnline ?? data.status === 'online'),
            };
          }
        });
        onUpdate(map);
      },
      () => {}
    );
  }

  // ============================================================================
  // MUTE CONVERSATION SETTINGS
  // ============================================================================

  async getMutedConversationIds(userId: string): Promise<Set<string>> {
    if (!userId || !auth.currentUser) return new Set();
    try {
      const snap = await getDoc(doc(db, COMMUNITY_COLLECTIONS.MUTED_CONVERSATIONS, userId));
      if (snap.exists()) {
        const list = snap.data()?.mutedConversationIds;
        if (Array.isArray(list)) return new Set(list);
      }
      return new Set();
    } catch {
      return new Set();
    }
  }

  async isConversationMutedByUser(userId: string, conversationId: string): Promise<boolean> {
    if (!userId || !conversationId) return false;
    const set = await this.getMutedConversationIds(userId);
    return set.has(conversationId);
  }

  async toggleMuteConversation(conversationId: string): Promise<{ muted: boolean }> {
    const currentUser = auth.currentUser;
    if (!currentUser || !conversationId) throw new Error('Authentication required.');
    const docRef = doc(db, COMMUNITY_COLLECTIONS.MUTED_CONVERSATIONS, currentUser.uid);

    try {
      const currentSet = await this.getMutedConversationIds(currentUser.uid);
      let muted = false;
      if (currentSet.has(conversationId)) {
        currentSet.delete(conversationId);
        muted = false;
      } else {
        if (currentSet.size >= 200) {
          throw new Error('Muted conversation limit reached.');
        }
        currentSet.add(conversationId);
        muted = true;
      }

      await setDoc(
        docRef,
        {
          userId: currentUser.uid,
          mutedConversationIds: Array.from(currentSet),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return { muted };
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `${COMMUNITY_COLLECTIONS.MUTED_CONVERSATIONS}/${currentUser.uid}`
      );
    }
  }

  async markConversationRead(conversationId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !conversationId) return;
    try {
      const convRef = doc(db, COMMUNITY_COLLECTIONS.CONVERSATIONS, conversationId);
      await updateDoc(convRef, {
        [`unreadCountByUser.${currentUser.uid}`]: 0,
        [`lastReadAtByUser.${currentUser.uid}`]: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }

  // ===========================================================================
  // STAGE 11C-F: AI COMMUNITY INTELLIGENCE
  // ===========================================================================

  private translationCache: Map<
    string,
    {
      translatedText: string;
      targetLanguage: string;
      detectedLanguage?: string;
      timestamp: number;
    }
  > = new Map();

  /**
   * Loads the user's private Community AI conversation history for a specific community.
   * Stored under community_ai_conversations/{userId}_{communityId} so it is strictly
   * isolated to the individual user and community.
   */
  async loadCommunityAIConversation(
    communityId: string,
    userId?: string
  ): Promise<CommunityAIConversation | null> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid || !communityId) return null;
    const docId = `${uid}_${communityId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    try {
      const snap = await getDoc(doc(db, COMMUNITY_COLLECTIONS.AI_CONVERSATIONS, docId));
      if (!snap.exists()) return null;
      const data = snap.data() as CommunityAIConversation;
      if (data.userId !== uid) return null;
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Saves the user's private Community AI conversation history for a specific community.
   */
  async saveCommunityAIConversation(params: {
    communityId: string;
    courseId?: string;
    courseCode?: string;
    messages: CommunityAIMessage[];
    userId?: string;
  }): Promise<void> {
    const uid = params.userId || auth.currentUser?.uid;
    if (!uid || !params.communityId) return;
    const docId = `${uid}_${params.communityId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const nowIso = new Date().toISOString();
    // Bound stored messages to most recent 30 to keep document size small
    const boundedMessages = (params.messages || []).slice(-30).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      actionType: m.actionType || 'ask',
      sources: m.sources || [],
      structuredSummary: m.structuredSummary || null,
      unansweredQuestions: m.unansweredQuestions || [],
      confidenceNote: m.confidenceNote || null,
      detectedLanguage: m.detectedLanguage || 'en',
      feedback: m.feedback || null,
      createdAt: m.createdAt || nowIso,
    }));
    try {
      await setDoc(
        doc(db, COMMUNITY_COLLECTIONS.AI_CONVERSATIONS, docId),
        {
          id: docId,
          communityId: params.communityId,
          userId: uid,
          courseId: params.courseId || null,
          courseCode: params.courseCode || null,
          messages: boundedMessages,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    } catch {
      // Non-blocking persistence fallback
    }
  }

  /**
   * Clears the user's private Community AI conversation history for a specific community.
   */
  async clearCommunityAIConversation(communityId: string, userId?: string): Promise<void> {
    const uid = userId || auth.currentUser?.uid;
    if (!uid || !communityId) return;
    const docId = `${uid}_${communityId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    try {
      await deleteDoc(doc(db, COMMUNITY_COLLECTIONS.AI_CONVERSATIONS, docId));
    } catch {
      // Ignore if not found
    }
  }

  /**
   * Queries the VENUE Community AI Assistant with strictly authorized community context,
   * course materials (when community is linked to a canonical course), lecturer announcements,
   * and comments/replies.
   *
   * NEVER accesses or includes private 1-to-1 chats, unauthorized courses, or hidden/deleted items.
   */
  async queryCommunityAI(params: {
    action:
      | 'ask'
      | 'summarize_discussion'
      | 'find_unanswered'
      | 'summarize_announcements'
      | 'explain_item';
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
    userQuery?: string;
    summaryScope?: CommunityAISummaryScope;
    selectedPostIds?: string[];
    lastVisitedAtIso?: string | null;
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
    languageMode?: 'auto' | 'en' | 'sw';
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    profile?: StudentProfile;
    courses?: Course[];
    subscriptionPlan?: string;
    blockedUserIds?: Set<string>;
    mutedUserIds?: Set<string>;
  }): Promise<{
    answer: string;
    detectedLanguage: 'en' | 'sw';
    sources: CommunityAISourceReference[];
    structuredSummary?: CommunityAIDiscussionSummary | null;
    unansweredQuestions?: CommunityAIUnansweredQuestion[];
    confidenceNote?: string | null;
    cached?: boolean;
    rateLimitRemaining?: number;
  }> {
    const currentUser = auth.currentUser;
    const uid = currentUser?.uid || params.profile?.uid || 'anonymous';

    // 1. Filter posts to strictly authorized, active, non-blocked, non-muted posts in this community
    const blocked = params.blockedUserIds || new Set<string>();
    const muted = params.mutedUserIds || new Set<string>();
    const nowMs = Date.now();
    const scope: CommunityAISummaryScope = params.summaryScope || 'last_7d';
    const selectedSet = new Set(params.selectedPostIds || []);

    const eligiblePosts = (params.posts || []).filter((p) => {
      if (p.status === 'deleted' || p.status === 'hidden' || p.status === 'removed') return false;
      const authorId = p.authorUid || p.authorId;
      if (authorId && (blocked.has(authorId) || muted.has(authorId))) return false;

      if (
        (params.action === 'summarize_discussion' || params.action === 'find_unanswered') &&
        scope
      ) {
        const pid = p.postId || p.id;
        if (scope === 'selected' && selectedSet.size > 0) {
          return selectedSet.has(pid);
        }
        const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : nowMs;
        if (!Number.isNaN(createdMs)) {
          if (scope === 'last_24h' && nowMs - createdMs > 24 * 60 * 60 * 1000) {
            return false;
          }
          if (scope === 'last_7d' && nowMs - createdMs > 7 * 24 * 60 * 60 * 1000) {
            return false;
          }
          if (scope === 'since_last_visit' && params.lastVisitedAtIso) {
            const lastVisitMs = new Date(params.lastVisitedAtIso).getTime();
            if (!Number.isNaN(lastVisitMs) && createdMs < lastVisitMs) {
              return false;
            }
          }
        }
      }
      return true;
    });

    // If scope filtering yielded 0 posts on last_24h or since_last_visit, fall back to recent posts in community if action is 'ask'
    const postsToProcess =
      eligiblePosts.length > 0
        ? eligiblePosts.slice(0, 25)
        : params.action === 'ask'
        ? (params.posts || [])
            .filter((p) => p.status !== 'deleted' && p.status !== 'hidden' && p.status !== 'removed')
            .slice(0, 20)
        : [];

    // 2. Ensure comments are loaded for top posts when detecting unanswered questions or summarizing discussion
    const commentsMap: Record<string, Array<any>> = {
      ...(params.commentsByPostId || {}),
    };

    const postsNeedingComments = postsToProcess
      .filter((p) => {
        const pid = p.postId || p.id;
        const cCount = p.commentCount ?? p.commentsCount ?? 0;
        return cCount > 0 && !commentsMap[pid];
      })
      .slice(0, 8);

    if (postsNeedingComments.length > 0) {
      await Promise.all(
        postsNeedingComments.map(async (p) => {
          const pid = p.postId || p.id;
          try {
            const fetched = await this.getCommentsForPost(pid);
            commentsMap[pid] = fetched.filter((c: any) => {
              const cAuthor = c.authorUid || c.authorId;
              return (
                c.status !== 'deleted' &&
                c.status !== 'removed' &&
                (!cAuthor || (!blocked.has(cAuthor) && !muted.has(cAuthor)))
              );
            });
          } catch {
            commentsMap[pid] = [];
          }
        })
      );
    }

    // 3. Separate Lecturer Announcements vs regular Discussion Posts vs Shared Files
    const explicitLecturerNotices = (params.lecturerAnnouncements || []).map((la: any) => ({
      id: la.id,
      title: la.title || la.noticeType || 'Lecturer Notice',
      content: la.content,
      authorName: la.lecturerName || la.authorName || 'Lecturer',
      authorRole: 'lecturer',
      courseCode: la.courseCode || params.community.courseCode || '',
      isUrgent: Boolean(la.pinned || la.isUrgent),
      createdAt: la.createdAt,
    }));

    const postBasedAnnouncements = (params.posts || [])
      .filter((p) => {
        const pid = p.postId || p.id || '';
        return (
          p.status !== 'deleted' &&
          p.status !== 'hidden' &&
          p.status !== 'removed' &&
          (p.category === 'Announcements' ||
            p.category === 'Announcement' ||
            p.isOfficial ||
            p.authorRole === 'lecturer' ||
            pid.startsWith('lec_ann_'))
        );
      })
      .slice(0, 12)
      .map((a) => ({
        id: a.postId || a.id,
        title: a.title || '',
        content: a.content,
        authorName: a.authorName,
        authorRole: a.authorRole || 'lecturer',
        courseCode: a.courseCode || params.community.courseCode || '',
        isUrgent: Boolean(a.pinned || a.isUrgent || a.priority === 'urgent' || a.priority === 'important'),
        createdAt: a.createdAt || a.timestamp,
      }));

    const announcementsPayload = [...explicitLecturerNotices, ...postBasedAnnouncements].slice(0, 15);

    const sharedFilesPayload: Array<{
      id: string;
      postId: string;
      fileName: string;
      fileType?: string;
      authorName?: string;
      courseCode?: string;
      description?: string;
      createdAt?: string;
    }> = [];

    for (const p of postsToProcess) {
      const pid = p.postId || p.id;
      if (p.fileUrl && p.fileName) {
        sharedFilesPayload.push({
          id: `${pid}_file`,
          postId: pid,
          fileName: p.fileName,
          fileType: p.fileMimeType || 'document',
          authorName: p.authorName,
          courseCode: p.courseCode || params.community.courseCode,
          description: p.title || p.content.slice(0, 180),
          createdAt: p.createdAt || p.timestamp,
        });
      }
      if (Array.isArray(p.attachments) && p.attachments.length > 0) {
        for (const att of p.attachments) {
          sharedFilesPayload.push({
            id: att.id || `${pid}_att`,
            postId: pid,
            fileName: att.name || 'Shared Resource',
            fileType: att.type || att.mimeType || 'document',
            authorName: p.authorName,
            courseCode: p.courseCode || params.community.courseCode,
            description: p.title || p.content.slice(0, 180),
            createdAt: p.createdAt || p.timestamp,
          });
        }
      }
    }

    const formattedPosts = postsToProcess.map((p) => {
      const pid = p.postId || p.id;
      const postComments = (commentsMap[pid] || []).slice(0, 8).map((c: any) => ({
        id: c.commentId || c.id,
        authorName: c.authorName,
        authorRole: c.authorRole || 'student',
        content: c.content,
        isHelpful: Boolean(c.isHelpful || p.bestAnswerCommentId === (c.commentId || c.id)),
        createdAt: c.createdAt || c.timestamp,
      }));

      const attList = Array.isArray(p.attachments)
        ? p.attachments.map((att: any) => ({ name: att.name, type: att.type }))
        : p.fileName
        ? [{ name: p.fileName, type: p.fileMimeType || 'file' }]
        : [];

      return {
        id: pid,
        authorName: p.authorName,
        authorRole: p.authorRole || 'student',
        title: p.title || '',
        content: p.content,
        category: p.category || (p.postType === 'QUESTION' ? 'Question' : 'Discussion'),
        courseCode: p.courseCode || params.community.courseCode || '',
        isPinned: Boolean(p.pinned || p.isPinned),
        isOfficial: Boolean(p.isOfficial || p.authorRole === 'lecturer'),
        isSolved: Boolean(p.isSolved || p.bestAnswerCommentId || p.acceptedAnswerCommentId),
        acceptedAnswerCommentId: p.bestAnswerCommentId || p.acceptedAnswerCommentId || null,
        likesCount: p.likeCount ?? p.likes ?? 0,
        commentsCount: p.commentCount ?? p.commentsCount ?? postComments.length,
        createdAt: p.createdAt || p.timestamp,
        attachments: attList,
        comments: postComments,
      };
    });

    // 4. Build authorized course & material context if this community is tied to a canonical course
    // or if the student is enrolled in courses
    let academicContextPayload = undefined;
    try {
      const targetCourseCode =
        params.community.courseCode ||
        params.targetItem?.courseCode ||
        'All Courses';
      academicContextPayload = await aiTutorMaterialContextService.buildContextForQuery({
        profile: params.profile,
        courses: params.courses || [],
        selectedCourseContext: targetCourseCode,
        userQuery:
          params.userQuery ||
          params.targetItem?.content ||
          params.community.courseTitle ||
          params.community.name,
      });
    } catch {
      academicContextPayload = undefined;
    }

    // 5. Call the server-side Community AI endpoint
    const response = await fetch('/api/community/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: params.action,
        userId: uid,
        subscriptionPlan:
          params.subscriptionPlan || params.profile?.subscriptionPlan || 'Free',
        languageMode: params.languageMode || 'auto',
        userQuery: params.userQuery || '',
        summaryScope: scope,
        conversationHistory: (params.conversationHistory || []).slice(-6),
        targetItem: params.targetItem || null,
        communityContext: {
          communityId: params.community.id,
          communityName: params.community.name,
          communityType: params.community.type,
          description: params.community.description,
          courseId: params.community.courseId,
          canonicalCourseId: params.community.canonicalCourseId,
          courseCode: params.community.courseCode,
          courseTitle: params.community.courseTitle,
          academicUnitId: params.community.academicUnitId,
          departmentId: params.community.departmentId,
          programmeId: params.community.programmeId,
          posts: formattedPosts,
          announcements: announcementsPayload,
          sharedFiles: sharedFilesPayload,
        },
        academicContext: academicContextPayload,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.details ||
          'Unable to process Community AI request right now. Please try again.'
      );
    }

    return {
      answer: data.answer || '',
      detectedLanguage: data.detectedLanguage === 'sw' ? 'sw' : 'en',
      sources: Array.isArray(data.sources) ? data.sources : [],
      structuredSummary: data.structuredSummary || null,
      unansweredQuestions: Array.isArray(data.unansweredQuestions)
        ? data.unansweredQuestions
        : [],
      confidenceNote: data.confidenceNote || null,
      cached: Boolean(data.cached),
      rateLimitRemaining:
        typeof data.rateLimitRemaining === 'number' ? data.rateLimitRemaining : undefined,
    };
  }

  /**
   * Translates an eligible community post, comment, or announcement without modifying
   * the original message. Caches translations in memory to prevent duplicate calls.
   */
  async translateCommunityContent(params: {
    itemId: string;
    text: string;
    targetLanguage: 'en' | 'sw' | 'fr' | 'ar';
    communityId: string;
    courseCode?: string;
    subscriptionPlan?: string;
  }): Promise<{
    translatedText: string;
    targetLanguage: 'en' | 'sw' | 'fr' | 'ar';
    detectedLanguage?: string;
    cached?: boolean;
  }> {
    const cacheKey = `${params.itemId}_${params.targetLanguage}`;
    const existing = this.translationCache.get(cacheKey);
    if (existing && Date.now() - existing.timestamp < 30 * 60 * 1000) {
      return {
        translatedText: existing.translatedText,
        targetLanguage: params.targetLanguage,
        detectedLanguage: existing.detectedLanguage,
        cached: true,
      };
    }

    const uid = auth.currentUser?.uid || 'anonymous';
    const response = await fetch('/api/community/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'translate',
        userId: uid,
        subscriptionPlan: params.subscriptionPlan || 'Free',
        targetLanguage: params.targetLanguage,
        targetItem: {
          id: params.itemId,
          type: 'post',
          content: params.text,
          courseCode: params.courseCode,
        },
        communityContext: {
          communityId: params.communityId,
          communityName: params.courseCode || 'Community',
          communityType: 'course',
          courseCode: params.courseCode,
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data?.error || 'Unable to translate message right now. Please try again.'
      );
    }

    const translatedText = (data.translatedText || data.answer || '').trim();
    if (translatedText) {
      this.translationCache.set(cacheKey, {
        translatedText,
        targetLanguage: params.targetLanguage,
        detectedLanguage: data.detectedLanguage,
        timestamp: Date.now(),
      });
    }

    return {
      translatedText,
      targetLanguage: params.targetLanguage,
      detectedLanguage: data.detectedLanguage,
      cached: Boolean(data.cached),
    };
  }

  /**
   * Records user feedback (Helpful / Not Helpful / Report AI response) for a Community AI response.
   */
  async submitCommunityAIFeedback(params: {
    messageId: string;
    communityId: string;
    courseId?: string;
    rating: 'helpful' | 'not_helpful' | 'reported';
    reason?: string;
  }): Promise<void> {
    const uid = auth.currentUser?.uid || 'anonymous';
    const nowIso = new Date().toISOString();
    const recordId = `aifb_${uid}_${params.messageId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      if (auth.currentUser) {
        const payload: CommunityAIFeedbackRecord = {
          id: recordId,
          messageId: params.messageId,
          communityId: params.communityId,
          courseId: params.courseId,
          userId: uid,
          rating: params.rating,
          reason: params.reason ? params.reason.slice(0, 300) : undefined,
          createdAt: nowIso,
        };
        await setDoc(doc(db, COMMUNITY_COLLECTIONS.AI_FEEDBACK, recordId), payload, {
          merge: true,
        });
      }
    } catch {
      // Fall back to backend endpoint
    }

    try {
      await fetch('/api/community/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: params.messageId,
          communityId: params.communityId,
          courseId: params.courseId,
          userId: uid,
          rating: params.rating,
          reason: params.reason,
        }),
      });
    } catch {
      // Ignore network errors on lightweight telemetry
    }
  }
}

export const communityService = new CommunityService();
