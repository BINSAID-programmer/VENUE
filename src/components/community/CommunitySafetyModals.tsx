import React, { useState, useEffect } from 'react';
import {
  Shield,
  Flag,
  Ban,
  VolumeX,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Trash2,
  UserX,
  Eye,
  EyeOff,
  Sliders,
  ShieldAlert,
  FileWarning,
  RefreshCw,
  X,
  MessageSquare,
  Users,
  BookOpen,
} from 'lucide-react';
import {
  CommunityReportCategory,
  CommunityReportRecord,
  CommunityReportStatus,
  CommunityReportTargetType,
  CommunityRestrictionType,
  CommunityUserRestrictionRecord,
  LecturerCourseAssignment,
  LecturerRecord,
  StudentProfile,
  UserCommunityPrivacySettings,
} from '../../types';
import { COMMUNITY_REPORT_REASONS, communityService } from '../../services/communityService';

// ============================================================================
// 1. VERIFIED ROLE / IDENTITY BADGE COMPONENT
// ============================================================================

export const VerifiedCommunityRoleBadge: React.FC<{
  accountRole?: 'student' | 'lecturer' | 'admin';
  roleLabel?: string;
  isVerified?: boolean;
  isGroupOwner?: boolean;
  isGroupAdmin?: boolean;
  compact?: boolean;
}> = ({ accountRole, roleLabel, isVerified, isGroupOwner, isGroupAdmin, compact = false }) => {
  const cleanLabel = (roleLabel || '').trim();
  const lower = cleanLabel.toLowerCase();

  if (accountRole === 'admin' || lower.includes('admin') || lower.includes('moderator')) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
      >
        <Shield className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        {cleanLabel || 'Admin / Moderator'}
      </span>
    );
  }

  if (accountRole === 'lecturer' || lower.includes('lecturer') || lower.includes('prof') || lower.includes('dr.')) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
      >
        <CheckCircle2 className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        {cleanLabel || 'Verified Lecturer'}
      </span>
    );
  }

  if (isGroupOwner) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
      >
        Group Owner
      </span>
    );
  }

  if (isGroupAdmin) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
      >
        Group Admin
      </span>
    );
  }

  if (cleanLabel || isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
      >
        {cleanLabel || 'Verified Student'}
      </span>
    );
  }

  return null;
};

// ============================================================================
// 2. UNIVERSAL REPORT CONTENT / USER MODAL
// ============================================================================

export interface SafetyReportTarget {
  targetType: CommunityReportTargetType;
  targetId: string;
  reportedUserUid?: string;
  reportedUserName?: string;
  targetExcerpt: string;
  communityId?: string;
  communityName?: string;
  conversationId?: string;
}

export const SafetyReportModal: React.FC<{
  target: SafetyReportTarget | null;
  profile?: StudentProfile | null;
  lecturer?: LecturerRecord | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onBlockUser?: (uid: string, name: string) => void;
  onMuteUser?: (uid: string, name: string) => void;
}> = ({
  target,
  profile,
  lecturer,
  onClose,
  onSuccess,
  onError,
  onBlockUser,
  onMuteUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CommunityReportCategory>('spam');
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [alsoMute, setAlsoMute] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reasonObj = COMMUNITY_REPORT_REASONS.find((r) => r.value === selectedCategory);
      await communityService.submitSafetyReport({
        targetType: target.targetType,
        targetId: target.targetId,
        reportedUserUid: target.reportedUserUid,
        reportedUserName: target.reportedUserName,
        targetExcerpt: target.targetExcerpt,
        communityId: target.communityId,
        communityName: target.communityName,
        conversationId: target.conversationId,
        category: selectedCategory,
        reason: reasonObj?.label || selectedCategory,
        details,
        profile,
        lecturer,
      });

      if (alsoBlock && target.reportedUserUid && onBlockUser) {
        onBlockUser(target.reportedUserUid, target.reportedUserName || 'User');
      } else if (alsoMute && target.reportedUserUid && onMuteUser) {
        onMuteUser(target.reportedUserUid, target.reportedUserName || 'User');
      }

      onSuccess('Report submitted confidentially for moderator review.');
      onClose();
    } catch (err: any) {
      onError(err?.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Report {target.targetType === 'profile' ? 'User Account' : target.targetType.replace('_', ' ')}
              </h3>
              <p className="text-[11px] text-slate-400">
                Your identity is kept confidential from the reported person.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {target.targetExcerpt && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Reported Target {target.reportedUserName ? `• ${target.reportedUserName}` : ''}
              </div>
              <p className="line-clamp-2 italic text-slate-400">"{target.targetExcerpt}"</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Reason for reporting
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {COMMUNITY_REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setSelectedCategory(reason.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition flex items-center justify-between cursor-pointer ${
                    selectedCategory === reason.value
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 font-semibold'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{reason.label}</span>
                  {selectedCategory === reason.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Additional Context (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Provide any helpful context for moderators (do not include passwords or sensitive personal data)..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {target.reportedUserUid && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">
                Immediate Personal Safety Controls
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoMute}
                  onChange={(e) => setAlsoMute(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500"
                />
                <span>
                  Mute {target.reportedUserName || 'this user'} (hide their posts & notifications)
                </span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoBlock}
                  onChange={(e) => setAlsoBlock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500"
                />
                <span>
                  Block {target.reportedUserName || 'this user'} (prevent direct messages & hide content)
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 3. USER PRIVACY, BLOCKED USERS & MUTED ACCOUNTS / COMMUNITIES MODAL
// ============================================================================

export const CommunitySafetyPrivacyModal: React.FC<{
  isOpen: boolean;
  currentUserId: string;
  blockedUserIds: Set<string>;
  mutedUserIds: Set<string>;
  mutedCommunityIds: Set<string>;
  mutedConversationIds: Set<string>;
  directoryPeers?: Array<{ uid: string; name: string; roleLabel?: string }>;
  communities?: Array<{ communityId: string; name: string; shortLabel: string }>;
  onClose: () => void;
  onToggleBlockUser: (uid: string) => Promise<void>;
  onToggleMuteUser: (uid: string, name?: string) => Promise<void>;
  onToggleMuteCommunity: (communityId: string) => Promise<void>;
  onPrivacyUpdated: (settings: UserCommunityPrivacySettings) => void;
  onNotify: (msg: string) => void;
}> = ({
  isOpen,
  currentUserId,
  blockedUserIds,
  mutedUserIds,
  mutedCommunityIds,
  directoryPeers = [],
  communities = [],
  onClose,
  onToggleBlockUser,
  onToggleMuteUser,
  onToggleMuteCommunity,
  onPrivacyUpdated,
  onNotify,
}) => {
  const [subTab, setSubTab] = useState<'privacy' | 'blocked' | 'muted'>('privacy');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [privacy, setPrivacy] = useState<UserCommunityPrivacySettings>({
    userId: currentUserId,
    allowDirectMessagesFrom: 'same_university',
    allowStudyGroupInvitesFrom: 'same_university',
    showOnlineStatus: true,
    showLastActiveStatus: true,
    profileVisibilityScope: 'university',
    updatedAt: '',
  });

  useEffect(() => {
    if (!isOpen || !currentUserId) return;
    let mounted = true;
    setLoading(true);
    communityService
      .getUserPrivacySettings(currentUserId)
      .then((res) => {
        if (mounted) setPrivacy(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      const saved = await communityService.saveUserPrivacySettings(privacy);
      onPrivacyUpdated(saved);
      onNotify('Community privacy preferences saved.');
    } catch (err: any) {
      onNotify(err?.message || 'Could not update privacy settings.');
    } finally {
      setSaving(false);
    }
  };

  const resolvePeerName = (uid: string) => {
    const found = directoryPeers.find((p) => p.uid === uid);
    return found ? found.name : `User (${uid.slice(0, 8)}...)`;
  };

  const resolveCommunityName = (cid: string) => {
    const found = communities.find((c) => c.communityId === cid);
    return found ? `${found.shortLabel} — ${found.name}` : cid;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Safety, Privacy & Social Controls</h3>
              <p className="text-[11px] text-slate-400">
                Manage who can contact you, your activity visibility, and blocked or muted accounts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 flex gap-2 bg-slate-950/50">
          <button
            type="button"
            onClick={() => setSubTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              subTab === 'privacy'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Privacy Preferences
          </button>
          <button
            type="button"
            onClick={() => setSubTab('blocked')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              subTab === 'blocked'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Blocked Users ({blockedUserIds.size})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('muted')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              subTab === 'muted'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Muted ({mutedUserIds.size + mutedCommunityIds.size})
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {subTab === 'privacy' && (
            <>
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading privacy settings...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      Who can send me Direct Messages?
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Controls who can start a 1-to-1 private conversation with you.
                    </p>
                    <select
                      value={privacy.allowDirectMessagesFrom}
                      onChange={(e) =>
                        setPrivacy((prev) => ({
                          ...prev,
                          allowDirectMessagesFrom: e.target.value as any,
                        }))
                      }
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                    >
                      <option value="same_university">
                        Members of my University & Lecturers (Recommended)
                      </option>
                      <option value="everyone">All Verified VENUE Community Members</option>
                      <option value="lecturers_only">Verified Lecturers & Admins Only</option>
                      <option value="none">No One (Disable new Direct Messages)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      Who can add me to Study Groups?
                    </label>
                    <select
                      value={privacy.allowStudyGroupInvitesFrom}
                      onChange={(e) =>
                        setPrivacy((prev) => ({
                          ...prev,
                          allowStudyGroupInvitesFrom: e.target.value as any,
                        }))
                      }
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                    >
                      <option value="same_university">Members of my University</option>
                      <option value="everyone">All Verified Members</option>
                      <option value="none">No One (I will join groups manually)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      People Directory Profile Visibility
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Your email, phone number, and registration number are never exposed publicly.
                    </p>
                    <select
                      value={privacy.profileVisibilityScope}
                      onChange={(e) =>
                        setPrivacy((prev) => ({
                          ...prev,
                          profileVisibilityScope: e.target.value as any,
                        }))
                      }
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
                    >
                      <option value="university">Visible within my University</option>
                      <option value="programme_only">Visible within my Programme / Department</option>
                      <option value="minimal">Minimal (Name & Role badge only)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-white">Show Online Status</div>
                        <div className="text-[11px] text-slate-400">
                          Allow peers in active chats to see when you are online
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.showOnlineStatus}
                        onChange={(e) =>
                          setPrivacy((prev) => ({
                            ...prev,
                            showOnlineStatus: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-700 bg-slate-900 text-indigo-500 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-white">Show Recently Active</div>
                        <div className="text-[11px] text-slate-400">
                          Display "Recently active" when you are offline
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy.showLastActiveStatus}
                        onChange={(e) =>
                          setPrivacy((prev) => ({
                            ...prev,
                            showLastActiveStatus: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-700 bg-slate-900 text-indigo-500 h-4 w-4"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSavePrivacy}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {subTab === 'blocked' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Blocked users cannot start private conversations with you, send you direct messages,
                or show their posts in your community feed.
              </p>
              {blockedUserIds.size === 0 ? (
                <div className="py-10 text-center rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Ban className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">No blocked users.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    You have not blocked any accounts.
                  </p>
                </div>
              ) : (
                Array.from(blockedUserIds).map((uid) => (
                  <div
                    key={uid}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 text-xs font-bold">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{resolvePeerName(uid)}</div>
                        <div className="text-[10px] text-rose-400">Blocked from direct contact</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleBlockUser(uid)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {subTab === 'muted' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200 mb-2">
                  Muted Users ({mutedUserIds.size})
                </h4>
                <p className="text-[11px] text-slate-400 mb-2">
                  Muted users are not blocked, but their posts and notifications are hidden from your feed.
                </p>
                {mutedUserIds.size === 0 ? (
                  <div className="py-6 text-center rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                    No muted users.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.from(mutedUserIds).map((uid) => (
                      <div
                        key={uid}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
                      >
                        <span className="text-xs font-medium text-white">
                          {resolvePeerName(uid)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleMuteUser(uid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 cursor-pointer"
                        >
                          Unmute User
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 mb-2">
                  Muted Communities ({mutedCommunityIds.size})
                </h4>
                <p className="text-[11px] text-slate-400 mb-2">
                  Muting a community silences non-critical notifications while keeping all posts and official announcements accessible when you open the space.
                </p>
                {mutedCommunityIds.size === 0 ? (
                  <div className="py-6 text-center rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                    No muted communities.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.from(mutedCommunityIds).map((cid) => (
                      <div
                        key={cid}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
                      >
                        <span className="text-xs font-medium text-white">
                          {resolveCommunityName(cid)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleMuteCommunity(cid)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 cursor-pointer"
                        >
                          Unmute Space
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. MODERATION QUEUE & SAFETY ENFORCEMENT PANEL (ADMINS & AUTHORIZED LECTURERS)
// ============================================================================

export const CommunityModerationQueuePanel: React.FC<{
  profile?: StudentProfile | null;
  lecturer?: LecturerRecord | null;
  lecturerAssignments?: LecturerCourseAssignment[];
  isPlatformAdmin: boolean;
  onNotify: (msg: string) => void;
}> = ({ profile, lecturer, lecturerAssignments = [], isPlatformAdmin, onNotify }) => {
  const [reports, setReports] = useState<CommunityReportRecord[]>([]);
  const [restrictions, setRestrictions] = useState<CommunityUserRestrictionRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<CommunityReportStatus | 'all'>('pending');
  const [activeSubView, setActiveSubView] = useState<'reports' | 'restrictions'>('reports');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  // Direct Restriction Form state
  const [restrictTargetUid, setRestrictTargetUid] = useState('');
  const [restrictTargetName, setRestrictTargetName] = useState('');
  const [restrictType, setRestrictType] =
    useState<CommunityRestrictionType>('posting_restricted');
  const [restrictDurationHours, setRestrictDurationHours] = useState<number>(24);
  const [restrictReason, setRestrictReason] = useState('');

  const authorizedCourseCodes = lecturerAssignments.map((a) => a.courseCode);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      const [repList, restList] = await Promise.all([
        communityService.getModerationReportsQueue({
          statusFilter,
          authorizedCourseCodes,
          isPlatformAdmin,
        }),
        communityService.getActiveUserRestrictions(),
      ]);
      setReports(repList);
      setRestrictions(restList);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModerationData();
  }, [statusFilter, isPlatformAdmin, lecturerAssignments.length]);

  const handleMarkStatus = async (
    report: CommunityReportRecord,
    newStatus: CommunityReportStatus
  ) => {
    setActionLoadingId(report.reportId);
    try {
      await communityService.updateSafetyReportStatus({
        reportId: report.reportId,
        status: newStatus,
        actionTaken: newStatus === 'dismissed' ? 'dismissed' : 'none',
        resolutionNote: resolutionNotes[report.reportId] || `Marked ${newStatus}`,
        profile,
        lecturer,
      });
      onNotify(`Report marked as ${newStatus.replace('_', ' ')}.`);
      await loadModerationData();
    } catch (err: any) {
      onNotify(err?.message || 'Action failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveReportedContent = async (report: CommunityReportRecord) => {
    const mapType =
      report.targetType === 'post' || report.targetType === 'poll' || report.targetType === 'event'
        ? report.targetType
        : report.targetType === 'comment'
        ? 'comment'
        : report.targetType === 'message'
        ? 'message'
        : report.targetType === 'study_group'
        ? 'study_group'
        : null;

    if (!mapType) {
      onNotify('This report targets a user profile; use Warn, Restrict, or Ban instead.');
      return;
    }

    setActionLoadingId(report.reportId);
    try {
      await communityService.removeContentByModerator({
        targetType: mapType,
        targetId: report.targetId,
        conversationId: report.conversationId,
        communityId: report.communityId,
        reason:
          resolutionNotes[report.reportId] ||
          `Removed following report (${report.reason || report.category})`,
        reportId: report.reportId,
        profile,
        lecturer,
        lecturerAssignments,
      });
      onNotify('Reported content soft-removed and recorded in Audit Logs.');
      await loadModerationData();
    } catch (err: any) {
      onNotify(err?.message || 'Could not remove content.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleWarnUser = async (report: CommunityReportRecord) => {
    const targetUid = report.reportedUserUid || report.targetAuthorUid;
    if (!targetUid) {
      onNotify('No target user UID associated with this report.');
      return;
    }
    setActionLoadingId(report.reportId);
    try {
      await communityService.warnReportedUser({
        targetUid,
        targetName: report.reportedUserName || 'Member',
        warningMessage:
          resolutionNotes[report.reportId] ||
          `Please review VENUE Community Guidelines regarding ${report.reason || report.category}.`,
        reportId: report.reportId,
        profile,
        lecturer,
      });
      onNotify('Formal safety warning sent and logged.');
      await loadModerationData();
    } catch (err: any) {
      onNotify(err?.message || 'Could not warn user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestrictFromReport = async (
    report: CommunityReportRecord,
    restrictionType: CommunityRestrictionType
  ) => {
    const targetUid = report.reportedUserUid || report.targetAuthorUid;
    if (!targetUid) {
      onNotify('No target user UID associated with this report.');
      return;
    }
    setActionLoadingId(report.reportId);
    try {
      await communityService.setCommunityUserRestriction({
        targetUid,
        targetName: report.reportedUserName || 'Member',
        restrictionType,
        scope: report.communityId ? 'single_community' : 'all_communities',
        communityId: report.communityId,
        communityName: report.communityName,
        reason:
          resolutionNotes[report.reportId] ||
          `Restricted due to ${report.reason || report.category}`,
        durationHours: 48,
        active: true,
        reportId: report.reportId,
        profile,
        lecturer,
      });
      onNotify('User privileges restricted for 48 hours and logged in Audit Logs.');
      await loadModerationData();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to apply restriction.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBanFromCommunity = async (report: CommunityReportRecord) => {
    const targetUid = report.reportedUserUid || report.targetAuthorUid;
    const targetScopeId = report.communityId || report.conversationId;
    if (!targetUid || !targetScopeId) {
      onNotify('A community or group context is required for a scoped community ban.');
      return;
    }
    setActionLoadingId(report.reportId);
    try {
      await communityService.setCommunityOrGroupBan({
        targetUid,
        targetName: report.reportedUserName || 'Member',
        targetType: report.conversationId ? 'group_chat' : 'community',
        targetScopeId,
        targetNameLabel: report.communityName || report.communityId || 'Community Space',
        reason:
          resolutionNotes[report.reportId] ||
          `Banned from space due to ${report.reason || report.category}`,
        active: true,
        reportId: report.reportId,
        profile,
        lecturer,
      });
      onNotify('User banned from this community space and logged.');
      await loadModerationData();
    } catch (err: any) {
      onNotify(err?.message || 'Could not ban user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLiftRestriction = async (r: CommunityUserRestrictionRecord) => {
    setActionLoadingId(r.targetUid);
    try {
      await communityService.setCommunityUserRestriction({
        targetUid: r.targetUid,
        targetName: r.targetName,
        restrictionType: r.restrictionType,
        scope: r.scope,
        communityId: r.communityId || undefined,
        communityName: r.communityName || undefined,
        reason: 'Restriction lifted by moderator',
        active: false,
        profile,
        lecturer,
      });
      onNotify(`Restored privileges for ${r.targetName}.`);
      await loadModerationData();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to lift restriction.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleManualRestrictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restrictTargetUid.trim()) return;
    try {
      await communityService.setCommunityUserRestriction({
        targetUid: restrictTargetUid.trim(),
        targetName: restrictTargetName.trim() || 'Community User',
        restrictionType: restrictType,
        scope: 'all_communities',
        reason: restrictReason.trim() || 'Community moderation policy',
        durationHours: restrictDurationHours,
        active: true,
        profile,
        lecturer,
      });
      setRestrictTargetUid('');
      setRestrictTargetName('');
      setRestrictReason('');
      onNotify('User restriction applied and recorded in Audit Logs.');
      await loadModerationData();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to restrict user.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Community Safety & Moderation Queue
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isPlatformAdmin ? 'Platform Admin Scope' : 'Authorized Course Lecturer Scope'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Review reported content, enforce temporary restrictions, and audit safety actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubView === 'reports'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('restrictions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeSubView === 'restrictions'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Active Restrictions ({restrictions.length})
          </button>
          <button
            type="button"
            onClick={loadModerationData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {activeSubView === 'reports' && (
        <>
          {/* Status filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {(['pending', 'under_review', 'resolved', 'dismissed', 'all'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900/60 border border-slate-800">
              Loading moderation reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">No pending reports.</div>
              <p className="text-xs text-slate-400 mt-1">
                There are no community reports matching "{statusFilter.replace('_', ' ')}" in your moderation scope.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.reportId}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {rep.reason || rep.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                          Target: {rep.targetType}
                        </span>
                        {rep.communityName && (
                          <span className="text-[11px] text-indigo-300 font-medium">
                            in {rep.communityName}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          • {new Date(rep.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        {rep.reportedUserName && (
                          <span className="font-semibold text-white mr-2">
                            Reported User: {rep.reportedUserName}
                          </span>
                        )}
                        <span className="text-slate-500">
                          (Reported by {rep.reporterName || 'Verified Member'})
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        rep.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : rep.status === 'under_review'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : rep.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>

                  {rep.targetExcerpt && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-300">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                        Reported Content Excerpt (ID: {rep.targetId})
                      </div>
                      <p className="italic">"{rep.targetExcerpt}"</p>
                    </div>
                  )}

                  {(rep.description || rep.details) && (
                    <div className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Reporter Note: </span>
                      {rep.description || rep.details}
                    </div>
                  )}

                  {rep.resolutionNote && (
                    <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                      Resolution ({rep.reviewedByName || 'Moderator'}): {rep.resolutionNote}
                    </div>
                  )}

                  {/* Moderator Action Bar */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <input
                      type="text"
                      value={resolutionNotes[rep.reportId] || ''}
                      onChange={(e) =>
                        setResolutionNotes((prev) => ({
                          ...prev,
                          [rep.reportId]: e.target.value,
                        }))
                      }
                      placeholder="Add moderation reason / audit note..."
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      {rep.status === 'pending' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === rep.reportId}
                          onClick={() => handleMarkStatus(rep, 'under_review')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold cursor-pointer"
                        >
                          Mark Under Review
                        </button>
                      )}

                      {rep.targetType !== 'profile' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === rep.reportId}
                          onClick={() => handleRemoveReportedContent(rep)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove Content
                        </button>
                      )}

                      {(rep.reportedUserUid || rep.targetAuthorUid) && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === rep.reportId}
                            onClick={() => handleWarnUser(rep)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold cursor-pointer"
                          >
                            Warn User
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === rep.reportId}
                            onClick={() =>
                              handleRestrictFromReport(rep, 'posting_restricted')
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-[11px] font-semibold cursor-pointer"
                          >
                            Restrict Posting (48h)
                          </button>
                          {(rep.communityId || rep.conversationId) && (
                            <button
                              type="button"
                              disabled={actionLoadingId === rep.reportId}
                              onClick={() => handleBanFromCommunity(rep)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold cursor-pointer"
                            >
                              Ban from Space
                            </button>
                          )}
                        </>
                      )}

                      <button
                        type="button"
                        disabled={actionLoadingId === rep.reportId}
                        onClick={() => handleMarkStatus(rep, 'resolved')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                      >
                        Resolve
                      </button>

                      <button
                        type="button"
                        disabled={actionLoadingId === rep.reportId}
                        onClick={() => handleMarkStatus(rep, 'dismissed')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeSubView === 'restrictions' && (
        <div className="space-y-4">
          {/* Manual Restriction Form */}
          <form
            onSubmit={handleManualRestrictSubmit}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
          >
            <h4 className="text-xs font-bold text-white">
              Apply Scoped Community Restriction
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={restrictTargetUid}
                onChange={(e) => setRestrictTargetUid(e.target.value)}
                placeholder="Target User UID"
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                required
              />
              <input
                type="text"
                value={restrictTargetName}
                onChange={(e) => setRestrictTargetName(e.target.value)}
                placeholder="User Name (for audit log)"
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              />
              <select
                value={restrictType}
                onChange={(e) => setRestrictType(e.target.value as CommunityRestrictionType)}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value="posting_restricted">Restrict Posting & Comments</option>
                <option value="messaging_restricted">Restrict Chat Messaging</option>
                <option value="file_upload_restricted">Restrict File & Media Uploads</option>
                <option value="voice_note_restricted">Restrict Voice Notes</option>
                <option value="study_group_creation_restricted">
                  Restrict Study Group Creation
                </option>
                <option value="temporary_suspension">
                  Temporary Full Community Suspension
                </option>
              </select>
              <select
                value={restrictDurationHours}
                onChange={(e) => setRestrictDurationHours(Number(e.target.value))}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
                <option value={168}>7 Days</option>
                <option value={720}>30 Days</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={restrictReason}
                onChange={(e) => setRestrictReason(e.target.value)}
                placeholder="Reason for restriction (logged in Audit Trail)..."
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Apply Restriction
              </button>
            </div>
          </form>

          {/* Active Restrictions List */}
          {restrictions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              No moderation activity or active user restrictions.
            </div>
          ) : (
            <div className="space-y-2.5">
              {restrictions.map((r) => (
                <div
                  key={r.restrictionId}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{r.targetName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        {r.restrictionType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({r.scope === 'single_community' ? r.communityName || r.communityId : 'All Communities'})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Reason: {r.reason} • By {r.issuedByName}
                      {r.expiresAt
                        ? ` • Until ${new Date(r.expiresAt).toLocaleString()}`
                        : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={actionLoadingId === r.targetUid}
                    onClick={() => handleLiftRestriction(r)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
                  >
                    Lift Restriction
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
