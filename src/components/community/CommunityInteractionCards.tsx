import React, { useState } from 'react';
import {
  BarChart2,
  Calendar,
  MapPin,
  Clock,
  Globe,
  Check,
  CheckCircle2,
  Award,
  Sparkles,
  Users,
  Lock,
  Unlock,
  Plus,
  Bookmark,
  Trash2,
  FileText,
  ExternalLink,
  MessageCircle,
  Loader2,
  HelpCircle,
  Image as ImageIcon,
  Paperclip,
  Link2,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  RealCommunityPost,
  CommunityPollData,
  CommunityEventData,
  CommunityEventRsvpStatus,
  CommunityStudyGroupRecord,
  StudyGroupVisibility,
  CommunitySavedItemRecord,
  CommunitySpace,
  CommunityPostType,
  CommunityPostCategory,
  ChatParticipantInfo,
  StudentProfile,
  LecturerRecord,
} from '../../types';
import { ChatFileAttachmentCard, ChatLinkPreviewCard } from './ChatAdvancedMedia';

// ============================================================================
// 1. INTERACTIVE POLL CARD COMPONENT
// ============================================================================

export const CommunityPollCard: React.FC<{
  post: RealCommunityPost;
  poll?: CommunityPollData;
  userSelectedOptionIds: string[];
  onVote: (selectedOptionIds: string[]) => Promise<void>;
}> = ({ post, poll: pollProp, userSelectedOptionIds, onVote }) => {
  const poll = pollProp || post.poll!;
  const [draftOptions, setDraftOptions] = useState<string[]>(userSelectedOptionIds);
  const [submittingVote, setSubmittingVote] = useState(false);

  if (!poll) return null;

  const isClosed = Boolean(poll.closesAt && new Date(poll.closesAt).getTime() < Date.now());
  const hasVoted = userSelectedOptionIds.length > 0;
  const canSeeResults = hasVoted || isClosed || poll.showResultsBeforeVoting;

  const totalOptionVotesSum = poll.options.reduce(
    (sum, o) => sum + Math.max(0, Number(o.voteCount) || 0),
    0
  );
  const totalVoters = Math.max(Number(poll.totalVotes) || 0, hasVoted ? 1 : 0);

  const handleOptionClick = async (optionId: string) => {
    if (isClosed || submittingVote) return;

    if (!poll.allowMultipleChoice) {
      setSubmittingVote(true);
      try {
        await onVote([optionId]);
        setDraftOptions([optionId]);
      } finally {
        setSubmittingVote(false);
      }
    } else {
      setDraftOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    }
  };

  const handleSubmitMultipleVote = async () => {
    if (draftOptions.length === 0 || isClosed || submittingVote) return;
    setSubmittingVote(true);
    try {
      await onVote(draftOptions);
    } finally {
      setSubmittingVote(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
              {poll.question}
            </h4>
            <p className="text-[10px] text-slate-400">
              {poll.allowMultipleChoice ? 'Multiple choice poll' : 'Single choice poll'}
              {poll.closesAt
                ? isClosed
                  ? ' • Poll closed'
                  : ` • Closes ${new Date(poll.closesAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                : ''}
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
            isClosed
              ? 'bg-slate-800 text-slate-400 border border-slate-700'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}
        >
          {isClosed ? 'Closed' : 'Active Poll'}
        </span>
      </div>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const isSelectedByMe = poll.allowMultipleChoice
            ? draftOptions.includes(opt.id) || userSelectedOptionIds.includes(opt.id)
            : userSelectedOptionIds.includes(opt.id);
          const count = Math.max(0, Number(opt.voteCount) || 0);
          const pct =
            totalOptionVotesSum > 0 ? Math.round((count / totalOptionVotesSum) * 100) : 0;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isClosed || submittingVote}
              onClick={() => handleOptionClick(opt.id)}
              className={`w-full relative overflow-hidden rounded-xl border p-2.5 text-left transition cursor-pointer ${
                isSelectedByMe
                  ? 'border-indigo-500/70 bg-indigo-950/40 text-white'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 text-slate-200'
              }`}
            >
              {canSeeResults && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isSelectedByMe ? 'bg-indigo-500/25' : 'bg-slate-800/70'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelectedByMe
                        ? 'bg-indigo-500 border-indigo-400 text-white'
                        : 'border-slate-600 bg-slate-950'
                    }`}
                  >
                    {isSelectedByMe && <Check className="w-3 h-3" />}
                  </div>
                  <span className="font-medium truncate">{opt.text}</span>
                </div>

                {canSeeResults && (
                  <span className="text-[11px] font-bold text-indigo-200 shrink-0">
                    {count} {count === 1 ? 'vote' : 'votes'} ({pct}%)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
        <span>
          {totalOptionVotesSum} total {totalOptionVotesSum === 1 ? 'vote' : 'votes'}
          {totalVoters > 0 ? ` • ${totalVoters} participant${totalVoters === 1 ? '' : 's'}` : ''}
        </span>

        {poll.allowMultipleChoice && !isClosed && (
          <button
            type="button"
            disabled={draftOptions.length === 0 || submittingVote}
            onClick={handleSubmitMultipleVote}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-semibold cursor-pointer"
          >
            {submittingVote ? 'Submitting...' : hasVoted ? 'Update Vote' : 'Submit Vote'}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. STUDY SESSION & ACADEMIC EVENT CARD COMPONENT (WITH RSVP + PLANNER SYNC)
// ============================================================================

export const CommunityEventCard: React.FC<{
  post: RealCommunityPost;
  event?: CommunityEventData;
  myRsvp?: CommunityEventRsvpStatus | undefined;
  userRsvp?: CommunityEventRsvpStatus | undefined;
  onRsvp: (status: CommunityEventRsvpStatus) => Promise<void>;
  onAddToPlanner: () => Promise<void>;
}> = ({ post, event: eventProp, myRsvp: myRsvpProp, userRsvp, onRsvp, onAddToPlanner }) => {
  const event = eventProp || post.event!;
  const myRsvp = myRsvpProp !== undefined ? myRsvpProp : userRsvp;
  const [updatingRsvp, setUpdatingRsvp] = useState(false);
  const [addingToPlanner, setAddingToPlanner] = useState(false);
  const [addedPlannerSuccess, setAddedPlannerSuccess] = useState(false);

  if (!event) return null;

  const handleSelectRsvp = async (status: CommunityEventRsvpStatus) => {
    if (updatingRsvp) return;
    setUpdatingRsvp(true);
    try {
      await onRsvp(status);
    } finally {
      setUpdatingRsvp(false);
    }
  };

  const handlePlannerClick = async () => {
    if (addingToPlanner) return;
    setAddingToPlanner(true);
    try {
      await onAddToPlanner();
      setAddedPlannerSuccess(true);
    } finally {
      setAddingToPlanner(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/35 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                Study Session / Event
              </span>
              {event.courseCode && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-800 font-semibold">
                  {event.courseCode}
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white mt-1">{event.title}</h4>
          </div>
        </div>
      </div>

      {/* Date, Time & Location Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {event.date} • {event.startTime}
            {event.endTime ? ` – ${event.endTime}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300 min-w-0">
          {event.locationType === 'online' ? (
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="truncate" title={event.locationOrLink}>
            {event.locationType === 'online' ? 'Online: ' : 'Venue: '}
            {event.locationOrLink}
          </span>
        </div>
      </div>

      {/* RSVP Buttons + Save to Study Planner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={updatingRsvp}
            onClick={() => handleSelectRsvp('going')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition flex items-center gap-1 cursor-pointer ${
              myRsvp === 'going'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Going ({Math.max(0, event.goingCount || 0)})</span>
          </button>

          <button
            type="button"
            disabled={updatingRsvp}
            onClick={() => handleSelectRsvp('interested')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition flex items-center gap-1 cursor-pointer ${
              myRsvp === 'interested'
                ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-sky-500/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interested ({Math.max(0, event.interestedCount || 0)})</span>
          </button>

          <button
            type="button"
            disabled={updatingRsvp}
            onClick={() => handleSelectRsvp('not_going')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
              myRsvp === 'not_going'
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Not Going ({Math.max(0, event.notGoingCount || 0)})</span>
          </button>
        </div>

        <button
          type="button"
          disabled={addingToPlanner || addedPlannerSuccess}
          onClick={handlePlannerClick}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
            addedPlannerSuccess
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/40 text-sky-300'
          }`}
        >
          {addingToPlanner ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : addedPlannerSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
          <span>{addedPlannerSuccess ? 'Saved to Study Planner' : 'Add to Study Planner'}</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 3. STUDY GROUPS DISCOVERY & CREATION PANEL
// ============================================================================

export const CommunityStudyGroupsPanel: React.FC<{
  groups: CommunityStudyGroupRecord[];
  authorizedCommunities: CommunitySpace[];
  currentUserUid: string;
  profile?: StudentProfile;
  lecturer?: LecturerRecord | null;
  knownPeers: ChatParticipantInfo[];
  onCreateStudyGroup: (input: {
    name: string;
    description: string;
    community: CommunitySpace;
    visibility: StudyGroupVisibility;
  }) => Promise<void>;
  onJoinOrRequestGroup: (group: CommunityStudyGroupRecord) => Promise<void>;
  onApproveOrDeclineRequest: (
    group: CommunityStudyGroupRecord,
    requesterUid: string,
    requesterName: string,
    requesterRoleLabel: string | undefined,
    approve: boolean
  ) => Promise<void>;
  onOpenGroupChat: (conversationId: string) => void;
  onReportStudyGroup?: (group: CommunityStudyGroupRecord) => void;
}> = ({
  groups,
  authorizedCommunities,
  currentUserUid,
  onCreateStudyGroup,
  onJoinOrRequestGroup,
  onApproveOrDeclineRequest,
  onOpenGroupChat,
  onReportStudyGroup,
}) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCommId, setSelectedCommId] = useState(
    authorizedCommunities.find((c) => c.communityType === 'course')?.communityId ||
      authorizedCommunities[0]?.communityId ||
      ''
  );
  const [visibility, setVisibility] = useState<StudyGroupVisibility>('open');
  const [creating, setCreating] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;
    const comm =
      authorizedCommunities.find((c) => c.communityId === selectedCommId) ||
      authorizedCommunities[0];
    if (!comm) return;

    setCreating(true);
    try {
      await onCreateStudyGroup({
        name: name.trim(),
        description: description.trim() || `Collaborative study group for ${comm.shortLabel}`,
        community: comm,
        visibility,
      });
      setName('');
      setDescription('');
      setCreateOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Course &amp; Programme Study Groups ({groups.length})</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Create or join Open, Request-to-Join, or Private study groups connected to your courses and degree programme.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen((prev) => !prev)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Study Group</span>
        </button>
      </div>

      {createOpen && (
        <form
          onSubmit={handleSubmitCreate}
          className="p-4 rounded-2xl bg-slate-900 border border-blue-500/40 space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              New Course / Programme Study Group
            </h4>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Group Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MT 100 Calculus Study Group"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Connected Course / Programme
              </label>
              <select
                value={selectedCommId}
                onChange={(e) => setSelectedCommId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {authorizedCommunities.map((space) => (
                  <option key={space.communityId} value={space.communityId}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Study Goals &amp; Schedule Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly problem-sheet reviews, past paper practice, and exam preparation..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
              Membership Access Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  {
                    id: 'open',
                    label: 'Open to Course/Programme',
                    desc: 'Authorized students can join immediately',
                  },
                  {
                    id: 'request_to_join',
                    label: 'Request to Join',
                    desc: 'Group admin approves requests',
                  },
                  {
                    id: 'private',
                    label: 'Private (Invite Only)',
                    desc: 'Only invited peers can view & join',
                  },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setVisibility(mode.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    visibility === mode.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{mode.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
            >
              {creating ? 'Creating...' : 'Create & Open Chat'}
            </button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs font-bold text-white">No Study Groups Created Yet</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Start the first study group for your courses or degree programme so classmates can collaborate on tutorials, problem sheets, and past papers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {groups.map((grp) => {
            const isMember = (grp.memberUids || []).includes(currentUserUid);
            const isPending = (grp.pendingRequestUids || []).includes(currentUserUid);
            const isGroupAdmin =
              grp.ownerUid === currentUserUid || (grp.adminUids || []).includes(currentUserUid);
            const pendingList = Object.values(grp.pendingRequests || {});

            return (
              <div
                key={grp.groupId}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{grp.name}</h4>
                      {grp.courseCode && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                          {grp.courseCode}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-semibold flex items-center gap-1">
                        {grp.visibility === 'open' ? (
                          <>
                            <Unlock className="w-3 h-3 text-emerald-400" /> Open Group
                          </>
                        ) : grp.visibility === 'request_to_join' ? (
                          <>
                            <UserPlus className="w-3 h-3 text-sky-400" /> Request to Join
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-400" /> Private
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{grp.description}</p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5">
                      <span>{grp.communityName}</span>
                      <span>• {grp.memberCount || (grp.memberUids || []).length} members</span>
                      <span>• Led by {grp.ownerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isMember ? (
                      <button
                        type="button"
                        onClick={() => grp.conversationId && onOpenGroupChat(grp.conversationId)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Open Study Chat</span>
                      </button>
                    ) : isPending ? (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-semibold">
                        Request Pending
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busyGroupId === grp.groupId}
                        onClick={async () => {
                          setBusyGroupId(grp.groupId);
                          try {
                            await onJoinOrRequestGroup(grp);
                          } finally {
                            setBusyGroupId(null);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>
                          {grp.visibility === 'open' ? 'Join Study Group' : 'Request to Join'}
                        </span>
                      </button>
                    )}
                    {!isGroupAdmin && onReportStudyGroup && (
                      <button
                        type="button"
                        onClick={() => onReportStudyGroup(grp)}
                        className="px-2.5 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/50 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-medium cursor-pointer"
                        title="Report Study Group"
                      >
                        Report
                      </button>
                    )}
                  </div>
                </div>

                {/* Admin Pending Join Requests Queue */}
                {isGroupAdmin && pendingList.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      Pending Join Requests ({pendingList.length})
                    </span>
                    <div className="space-y-1.5">
                      {pendingList.map((req) => (
                        <div
                          key={req.uid}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{req.name}</span>
                            {req.roleLabel && (
                              <span className="text-[10px] text-slate-400 ml-2">
                                {req.roleLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onApproveOrDeclineRequest(
                                  grp,
                                  req.uid,
                                  req.name,
                                  req.roleLabel,
                                  true
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onApproveOrDeclineRequest(
                                  grp,
                                  req.uid,
                                  req.name,
                                  req.roleLabel,
                                  false
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 text-[11px] font-medium cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. SAVED ITEMS / BOOKMARKS HUB (POSTS, MESSAGES, FILES, ANNOUNCEMENTS, EVENTS)
// ============================================================================

export const CommunitySavedHubPanel: React.FC<{
  savedItems: CommunitySavedItemRecord[];
  bookmarkedPosts: RealCommunityPost[];
  onRemoveSavedItem: (item: CommunitySavedItemRecord) => Promise<void>;
  onOpenPost?: (postId: string) => void;
}> = ({ savedItems, bookmarkedPosts, onRemoveSavedItem }) => {
  const [filterType, setFilterType] = useState<
    'all' | 'post' | 'message' | 'file' | 'announcement' | 'event'
  >('all');

  const combinedItems = React.useMemo(() => {
    const list: CommunitySavedItemRecord[] = [...savedItems];
    const existingIds = new Set(list.map((i) => `${i.itemType}_${i.targetId}`));

    for (const p of bookmarkedPosts) {
      const key = `${p.event ? 'event' : 'post'}_${p.postId}`;
      if (!existingIds.has(key)) {
        list.push({
          id: `bm_${p.postId}`,
          userId: '',
          itemType: p.event ? 'event' : 'post',
          targetId: p.postId,
          communityId: p.communityId,
          courseCode: p.courseCode || p.communityName,
          title: p.title,
          excerpt: p.content.slice(0, 240),
          authorName: p.authorName,
          fileUrl: p.attachmentUrl,
          fileName: p.attachmentName,
          fileSizeLabel: p.attachmentSizeLabel,
          imageUrl: p.imageUrl,
          eventDate: p.event?.date,
          eventTime: p.event?.startTime,
          eventLocation: p.event?.locationOrLink,
          createdAt: p.createdAt,
        });
      }
    }
    return list.filter((i) => filterType === 'all' || i.itemType === filterType);
  }, [savedItems, bookmarkedPosts, filterType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(
          [
            { id: 'all', label: 'All Saved' },
            { id: 'post', label: 'Posts & Q&A' },
            { id: 'message', label: 'Chat Messages' },
            { id: 'file', label: 'Shared Files' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'event', label: 'Study Sessions' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
              filterType === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {combinedItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
          <Bookmark className="w-7 h-7 text-slate-500 mx-auto" />
          <p className="text-xs font-bold text-white">No Saved Items in This Category</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Bookmark posts, helpful solutions, chat messages, shared academic files, lecturer notices, or study events to access them anytime.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {combinedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-sky-300 border border-blue-500/30 font-bold uppercase">
                    {item.itemType}
                  </span>
                  {item.courseCode && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {item.courseCode}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">• By {item.authorName}</span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-line">
                  {item.excerpt}
                </p>

                {item.fileUrl && (
                  <div className="pt-1">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 hover:text-sky-300 text-xs font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{item.fileName || 'Open Saved File'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {item.eventDate && (
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-2 pt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {item.eventDate} {item.eventTime ? `• ${item.eventTime}` : ''}{' '}
                      {item.eventLocation ? `• ${item.eventLocation}` : ''}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemoveSavedItem(item)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer shrink-0"
                title="Remove from Saved Items"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
