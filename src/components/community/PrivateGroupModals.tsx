import React, { useState, useEffect } from 'react';
import {
  Lock,
  Users,
  X,
  Plus,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Crown,
  Loader2,
} from 'lucide-react';
import {
  StudentProfile,
  LecturerRecord,
  ChatParticipantInfo,
  RealChatConversation,
} from '../../types';
import { communityService } from '../../services/communityService';

interface CreatePrivateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: StudentProfile;
  lecturer?: LecturerRecord | null;
  knownPeers: ChatParticipantInfo[];
  onGroupCreated: (conv: RealChatConversation) => void;
}

export const CreatePrivateGroupModal: React.FC<CreatePrivateGroupModalProps> = ({
  isOpen,
  onClose,
  profile,
  lecturer,
  knownPeers,
  onGroupCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setSelectedUids(new Set());
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePeer = (uid: string) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a group name.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const initialMembers = knownPeers.filter((p) => selectedUids.has(p.uid));
      const created = await communityService.createPrivateGroupChat({
        title,
        description,
        initialMembers,
        profile,
        lecturer,
      });
      onGroupCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create private group.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">New Private Study Group</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Group Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MT 100 Exam Prep Group"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose or study schedule..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Invite Verified Peers ({selectedUids.size} selected)
            </label>
            {knownPeers.length === 0 ? (
              <p className="text-[11px] text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-800">
                You can create the group now and add peers anytime as they participate in your community discussions.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950">
                {knownPeers.map((peer) => {
                  const selected = selectedUids.has(peer.uid);
                  return (
                    <button
                      key={peer.uid}
                      type="button"
                      onClick={() => togglePeer(peer.uid)}
                      className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-900 transition cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{peer.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {peer.roleLabel || 'Verified Member'}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {selected ? 'Selected' : 'Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ManagePrivateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: RealChatConversation;
  currentUserUid: string;
  knownPeers: ChatParticipantInfo[];
  onUpdated: (conv: RealChatConversation) => void;
  onShowToast: (msg: string) => void;
}

export const ManagePrivateGroupModal: React.FC<ManagePrivateGroupModalProps> = ({
  isOpen,
  onClose,
  conversation,
  currentUserUid,
  knownPeers,
  onUpdated,
  onShowToast,
}) => {
  const [title, setTitle] = useState(conversation.title || '');
  const [description, setDescription] = useState(conversation.groupDescription || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(conversation.title || '');
    setDescription(conversation.groupDescription || '');
  }, [conversation]);

  if (!isOpen) return null;

  const isGroupAdmin =
    conversation.ownerUid === currentUserUid ||
    (conversation.adminUids || []).includes(currentUserUid) ||
    conversation.memberRoles?.[currentUserUid] === 'owner' ||
    conversation.memberRoles?.[currentUserUid] === 'admin';

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGroupAdmin || !title.trim()) return;
    setSaving(true);
    try {
      await communityService.updatePrivateGroupInfo(conversation.conversationId, {
        title,
        groupDescription: description,
      });
      onUpdated({
        ...conversation,
        title: title.trim(),
        groupDescription: description.trim(),
      });
      onShowToast('Group details updated');
    } catch (err: any) {
      onShowToast(err?.message || 'Could not update group.');
    } finally {
      setSaving(false);
    }
  };

  const handleMemberAction = async (
    action: 'add' | 'remove' | 'promote_admin' | 'demote_member',
    member: ChatParticipantInfo
  ) => {
    try {
      const updated = await communityService.managePrivateGroupMember({
        conversationId: conversation.conversationId,
        action,
        targetMember: member,
      });
      onUpdated(updated);
      onShowToast('Group membership updated');
    } catch (err: any) {
      onShowToast(err?.message || 'Could not update member.');
    }
  };

  const currentParticipantSet = new Set(conversation.participantIds || []);
  const availableToAdd = knownPeers.filter((p) => !currentParticipantSet.has(p.uid));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-bold text-white">Manage Private Group</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isGroupAdmin && (
          <form onSubmit={handleSaveInfo} className="space-y-2.5 pb-3 border-b border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Group Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Group Info'}
            </button>
          </form>
        )}

        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300">
            Members ({(conversation.participantIds || []).length})
          </div>
          <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950 max-h-48 overflow-y-auto">
            {(conversation.participantIds || []).map((uid) => {
              const info = conversation.participants?.[uid] || {
                uid,
                name: 'Member',
              };
              const role =
                conversation.ownerUid === uid
                  ? 'owner'
                  : conversation.memberRoles?.[uid] ||
                    ((conversation.adminUids || []).includes(uid) ? 'admin' : 'member');

              return (
                <div
                  key={uid}
                  className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{info.name}</span>
                      {role === 'owner' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> Owner
                        </span>
                      )}
                      {role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {info.roleLabel || 'Student'}
                    </div>
                  </div>

                  {isGroupAdmin && uid !== conversation.ownerUid && uid !== currentUserUid && (
                    <div className="flex items-center gap-1">
                      {role === 'member' ? (
                        <button
                          type="button"
                          onClick={() => handleMemberAction('promote_admin', info)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-300 cursor-pointer"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMemberAction('demote_member', info)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
                        >
                          Demote
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleMemberAction('remove', info)}
                        className="p-1 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 cursor-pointer"
                        title="Remove member"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isGroupAdmin && availableToAdd.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-300">Add Peers</div>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950">
              {availableToAdd.map((peer) => (
                <div
                  key={peer.uid}
                  className="px-3 py-2 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200">{peer.name}</span>
                  <button
                    type="button"
                    onClick={() => handleMemberAction('add', peer)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-sky-300 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave Group Control for Any Member */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            You can leave this private study group at any time.
          </span>
          <button
            type="button"
            onClick={async () => {
              try {
                await communityService.leavePrivateGroupChat(conversation.conversationId);
                onShowToast('You left the private study group');
                onClose();
              } catch (err: any) {
                onShowToast(err?.message || 'Could not leave group.');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-rose-300 text-xs font-semibold cursor-pointer shrink-0"
          >
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};
