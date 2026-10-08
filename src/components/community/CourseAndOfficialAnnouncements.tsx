import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  ShieldCheck,
  CheckCircle2,
  Pin,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  X,
  Eye,
  BookOpen,
  Building2,
  Sparkles,
} from 'lucide-react';
import {
  CommunitySpace,
  StudentProfile,
  LecturerCourseAnnouncement,
  LecturerCourseNoticeType,
  AnnouncementRecord,
  CommunityAcknowledgementRecord,
} from '../../types';
import {
  communityService,
  SUPPORTED_REACTION_EMOJIS,
} from '../../services/communityService';
import { auth } from '../../services/firebase';
import { InlineAITranslationBlock } from './CommunityAIAssistantModal';

const NOTICE_TYPES: LecturerCourseNoticeType[] = [
  'Announcement',
  'Lecture Reminder',
  'Assignment Instruction',
  'Timetable / Room Change',
  'Academic Notice',
];

function formatDateBadge(iso?: string | null): string {
  if (!iso) return 'Just now';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface CourseAnnouncementPanelProps {
  courseSpace: CommunitySpace;
  profile?: StudentProfile;
  canPublishAsLecturer: boolean;
  assignedLecturers: Array<{
    lecturerId: string;
    userId?: string;
    name: string;
    title?: string;
    email?: string;
  }>;
  userReactionsMap: Record<string, string>;
  acknowledgedIds: Set<string>;
  onToggleReaction: (
    targetId: string,
    targetType: 'post' | 'lecturer_announcement' | 'official_announcement',
    emoji: string
  ) => void;
  onAcknowledge: (
    targetId: string,
    targetType: 'lecturer_announcement' | 'official_announcement',
    courseCode?: string
  ) => void;
  onShowToast: (msg: string) => void;
  onExplainWithAI?: (item: {
    id: string;
    type: 'announcement';
    title?: string;
    content: string;
    authorName?: string;
    authorRole?: string;
    courseCode?: string;
    createdAt?: string;
  }) => void;
  onSummarizeAnnouncementsWithAI?: () => void;
}

export const CourseAnnouncementPanel: React.FC<CourseAnnouncementPanelProps> = ({
  courseSpace,
  profile,
  canPublishAsLecturer,
  assignedLecturers,
  userReactionsMap,
  acknowledgedIds,
  onToggleReaction,
  onAcknowledge,
  onShowToast,
  onExplainWithAI,
  onSummarizeAnnouncementsWithAI,
}) => {
  const currentUserUid = auth.currentUser?.uid || '';
  const courseCode = (courseSpace.courseCode || courseSpace.shortLabel || '').toUpperCase();
  const courseId = courseSpace.courseId || courseCode;

  const [items, setItems] = useState<LecturerCourseAnnouncement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<LecturerCourseAnnouncement | null>(null);
  const [noticeType, setNoticeType] = useState<LecturerCourseNoticeType>('Announcement');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [externalLink, setExternalLink] = useState<string>('');
  const [pinned, setPinned] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [inspectingAckFor, setInspectingAckFor] = useState<string | null>(null);
  const [ackList, setAckList] = useState<CommunityAcknowledgementRecord[]>([]);
  const [loadingAcks, setLoadingAcks] = useState<boolean>(false);

  useEffect(() => {
    if (!courseCode) return;
    setLoading(true);
    const unsub = communityService.subscribeToLecturerCourseAnnouncements(
      {
        courseCode,
        universityId: courseSpace.universityId,
        limitCount: 40,
      },
      (list) => {
        setItems(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, [courseCode, courseSpace.universityId]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNoticeType('Announcement');
    setTitle('');
    setContent('');
    setExternalLink('');
    setPinned(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LecturerCourseAnnouncement) => {
    setEditingItem(item);
    setNoticeType(item.noticeType);
    setTitle(item.title);
    setContent(item.content);
    setExternalLink(item.externalLink || '');
    setPinned(Boolean(item.pinned));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      if (editingItem) {
        await communityService.updateLecturerCourseAnnouncement(
          editingItem.id,
          courseId,
          courseCode,
          {
            title,
            content,
            noticeType,
            externalLink,
            pinned,
          }
        );
        onShowToast('Official course announcement updated');
      } else {
        await communityService.createLecturerCourseAnnouncement({
          courseSpace,
          noticeType,
          title,
          content,
          externalLink,
          pinned,
        });
        onShowToast('Official course announcement published');
      }
      setModalOpen(false);
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await communityService.deleteLecturerCourseAnnouncement(id, courseId, courseCode);
      onShowToast('Announcement removed');
    } catch (err: any) {
      onShowToast(err?.message || 'Could not remove announcement.');
    }
  };

  const handleInspectAcks = async (announcementId: string) => {
    if (inspectingAckFor === announcementId) {
      setInspectingAckFor(null);
      return;
    }
    setInspectingAckFor(announcementId);
    setLoadingAcks(true);
    try {
      const list = await communityService.getAcknowledgementsForTarget(announcementId, 50);
      setAckList(list);
    } finally {
      setLoadingAcks(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/35 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Megaphone className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {courseCode} Official Lecturer Announcement Channel
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              Read, React &amp; Acknowledge Only
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            {assignedLecturers.length > 0
              ? `Assigned Lecturer${assignedLecturers.length > 1 ? 's' : ''}: ${assignedLecturers
                  .map((l) => l.name)
                  .join(', ')}`
              : 'Lecturer not assigned yet in the official course assignment registry.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSummarizeAnnouncementsWithAI && items.length > 0 && (
            <button
              type="button"
              onClick={onSummarizeAnnouncementsWithAI}
              className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Summary</span>
            </button>
          )}
          {canPublishAsLecturer && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post Official Notice</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading lecturer announcements...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
          <Megaphone className="w-7 h-7 text-slate-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">
            No official lecturer announcements published for {courseCode} yet.
          </p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Students cannot post or reply here. Use the Course Discussion tab for peer questions and group study.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const myEmoji = userReactionsMap[item.id];
            const isAcked = acknowledgedIds.has(item.id);
            const canEditThis = canPublishAsLecturer || item.lecturerUid === currentUserUid;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border space-y-3 ${
                  item.pinned
                    ? 'bg-indigo-950/30 border-indigo-500/40'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.pinned && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          <span>Pinned</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                        {item.noticeType}
                      </span>
                      <span className="text-xs font-bold text-white">{item.lecturerName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-[10px] text-slate-400">
                        {formatDateBadge(item.createdAt)}
                        {item.editedAt ? ' (Edited)' : ''}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  </div>

                  {canEditThis && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-sky-400 border border-slate-800 cursor-pointer"
                        title="Edit announcement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {item.content}
                </p>

                <InlineAITranslationBlock
                  itemId={item.id}
                  text={`${item.title}\n${item.content}`}
                  communityId={courseSpace.communityId}
                  courseCode={courseCode}
                  subscriptionPlan={profile?.subscriptionPlan}
                  compact
                />

                {item.externalLink && (
                  <a
                    href={item.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 hover:text-sky-300 text-xs font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="truncate max-w-xs">{item.externalLink}</span>
                  </a>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SUPPORTED_REACTION_EMOJIS.map((emoji) => {
                      const count = Math.max(0, item.reactionCounts?.[emoji] || 0);
                      const active = myEmoji === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            onToggleReaction(item.id, 'lecturer_announcement', emoji)
                          }
                          className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 border transition cursor-pointer ${
                            active
                              ? 'bg-indigo-600/30 border-indigo-500/50 text-white font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="text-[10px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {onExplainWithAI && (
                      <button
                        type="button"
                        onClick={() =>
                          onExplainWithAI({
                            id: item.id,
                            type: 'announcement',
                            title: item.title,
                            content: item.content,
                            authorName: item.lecturerName,
                            authorRole: 'lecturer',
                            courseCode: item.courseCode || courseCode,
                            createdAt: item.createdAt,
                          })
                        }
                        className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Explain with AI</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isAcked}
                      onClick={() =>
                        onAcknowledge(item.id, 'lecturer_announcement', item.courseCode)
                      }
                      className={`px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                        isAcked
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {isAcked ? 'Acknowledged' : 'Acknowledge'} ({item.ackCount || 0})
                      </span>
                    </button>

                    {canEditThis && (
                      <button
                        type="button"
                        onClick={() => handleInspectAcks(item.id)}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Receipts</span>
                      </button>
                    )}
                  </div>
                </div>

                {inspectingAckFor === item.id && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300">
                      Student Acknowledgements ({ackList.length})
                    </div>
                    {loadingAcks ? (
                      <div className="text-slate-500">Loading receipts...</div>
                    ) : ackList.length === 0 ? (
                      <div className="text-slate-500">No acknowledgements recorded yet.</div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-1">
                        {ackList.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between text-[11px] text-slate-300"
                          >
                            <span>
                              {a.userName}{' '}
                              {a.registrationNumber ? `(${a.registrationNumber})` : ''}
                            </span>
                            <span className="text-slate-500">
                              {formatDateBadge(a.acknowledgedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingItem
                  ? `Edit ${courseCode} Notice`
                  : `Publish ${courseCode} Lecturer Notice`}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Notice Type</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as LecturerCourseNoticeType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {NOTICE_TYPES.map((nt) => (
                    <option key={nt} value={nt}>
                      {nt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Test 1 Venue & Time Confirmed"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Official Message</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write official course instructions..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Reference Link (Optional)
                </label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <span>Pin this announcement at the top of the course channel</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {submitting ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface OfficialAnnouncementsTabProps {
  profile?: StudentProfile;
  courseSpaces: CommunitySpace[];
  lecturerAnnouncements: LecturerCourseAnnouncement[];
  officialAnnouncements: AnnouncementRecord[];
  loadingOfficial: boolean;
  userReactionsMap: Record<string, string>;
  acknowledgedIds: Set<string>;
  onToggleReaction: (
    targetId: string,
    targetType: 'post' | 'lecturer_announcement' | 'official_announcement',
    emoji: string
  ) => void;
  onAcknowledge: (
    targetId: string,
    targetType: 'lecturer_announcement' | 'official_announcement',
    courseCode?: string
  ) => void;
  onSelectCourseAnnouncements: (space: CommunitySpace) => void;
  onExplainWithAI?: (item: {
    id: string;
    type: 'announcement';
    title?: string;
    content: string;
    authorName?: string;
    authorRole?: string;
    courseCode?: string;
    createdAt?: string;
  }) => void;
}

export const OfficialAnnouncementsTab: React.FC<OfficialAnnouncementsTabProps> = ({
  profile,
  courseSpaces,
  lecturerAnnouncements,
  officialAnnouncements,
  loadingOfficial,
  userReactionsMap,
  acknowledgedIds,
  onToggleReaction,
  onAcknowledge,
  onSelectCourseAnnouncements,
  onExplainWithAI,
}) => {
  return (
    <div className="space-y-5">
      {/* Quick Course Announcement Channels Bar */}
      {courseSpaces.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Course Lecturer Announcement Channels
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {courseSpaces.map((cs) => (
              <button
                key={cs.communityId}
                type="button"
                onClick={() => onSelectCourseAnnouncements(cs)}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 shrink-0 flex items-center gap-2 transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-white">{cs.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lecturer Course Notices */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recent Lecturer Course Announcements ({lecturerAnnouncements.length})
        </h3>
        {lecturerAnnouncements.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-center text-xs text-slate-400">
            No lecturer course announcements posted for your enrolled courses yet.
          </div>
        ) : (
          lecturerAnnouncements.map((item) => {
            const isAcked = acknowledgedIds.has(item.id);
            const myEmoji = userReactionsMap[item.id];
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                      {item.courseCode}
                    </span>
                    <span className="text-xs font-bold text-white">{item.lecturerName}</span>
                    <span className="text-[10px] text-slate-400">
                      • {formatDateBadge(item.createdAt)}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-semibold">
                    {item.noticeType}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {item.content}
                </p>
                <InlineAITranslationBlock
                  itemId={item.id}
                  text={`${item.title}\n${item.content}`}
                  communityId={`course_${item.courseCode}`}
                  courseCode={item.courseCode}
                  subscriptionPlan={profile?.subscriptionPlan}
                  compact
                />
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {SUPPORTED_REACTION_EMOJIS.map((emoji) => {
                      const count = Math.max(0, item.reactionCounts?.[emoji] || 0);
                      const active = myEmoji === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            onToggleReaction(item.id, 'lecturer_announcement', emoji)
                          }
                          className={`px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 border cursor-pointer ${
                            active
                              ? 'bg-indigo-600/30 border-indigo-500/50 text-white font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="text-[10px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {onExplainWithAI && (
                      <button
                        type="button"
                        onClick={() =>
                          onExplainWithAI({
                            id: item.id,
                            type: 'announcement',
                            title: item.title,
                            content: item.content,
                            authorName: item.lecturerName,
                            authorRole: 'lecturer',
                            courseCode: item.courseCode,
                            createdAt: item.createdAt,
                          })
                        }
                        className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Explain with AI</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isAcked}
                      onClick={() =>
                        onAcknowledge(item.id, 'lecturer_announcement', item.courseCode)
                      }
                      className={`px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 border cursor-pointer ${
                        isAcked
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-950 text-slate-200 border-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAcked ? 'Acknowledged' : 'Acknowledge'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Institutional University & College Announcements */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          University &amp; College Official Notices ({officialAnnouncements.length})
        </h3>
        {loadingOfficial ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Loading institutional notices...</span>
          </div>
        ) : officialAnnouncements.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-center text-xs text-slate-400">
            No institutional announcements targeted to your placement right now.
          </div>
        ) : (
          officialAnnouncements.map((ann) => {
            const isAcked = acknowledgedIds.has(ann.id);
            return (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-bold text-white">
                      {ann.createdByName || 'University Administration'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatDateBadge(ann.publishedAt || ann.createdAt)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
                <InlineAITranslationBlock
                  itemId={ann.id}
                  text={`${ann.title}\n${ann.content}`}
                  communityId="official_announcements"
                  subscriptionPlan={profile?.subscriptionPlan}
                  compact
                />
                <div className="pt-2 flex items-center justify-end gap-2">
                  {onExplainWithAI && (
                    <button
                      type="button"
                      onClick={() =>
                        onExplainWithAI({
                          id: ann.id,
                          type: 'announcement',
                          title: ann.title,
                          content: ann.content,
                          authorName: ann.createdByName || 'University Administration',
                          authorRole: 'admin',
                          createdAt: ann.publishedAt || ann.createdAt,
                        })
                      }
                      className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Explain with AI</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isAcked}
                    onClick={() => onAcknowledge(ann.id, 'official_announcement')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 border cursor-pointer ${
                      isAcked
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-950 text-slate-200 border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAcked ? 'Acknowledged' : 'Mark Read'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
