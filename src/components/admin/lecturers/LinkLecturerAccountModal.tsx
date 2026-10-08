import React, { useState } from 'react';
import {
  X,
  Link as LinkIcon,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Copy,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Sparkles,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { LecturerRecord } from '../../../types';
import { adminLecturersService } from '../../../services/adminLecturersService';

interface LinkLecturerAccountModalProps {
  lecturer: LecturerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: LecturerRecord) => void;
}

export const LinkLecturerAccountModal: React.FC<LinkLecturerAccountModalProps> = ({
  lecturer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [manualUid, setManualUid] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [submittingLink, setSubmittingLink] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lecturer) return null;

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    setError(null);
    try {
      const code = await adminLecturersService.generateInvitationCode(lecturer.id);
      const updated = { ...lecturer, invitationCode: code };
      onSuccess(updated);
    } catch (err: any) {
      console.error('Error generating invitation code:', err);
      setError(err?.message || 'Failed to generate invitation code.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUid.trim()) {
      setError('Please provide a valid Firebase Authentication UID.');
      return;
    }

    setSubmittingLink(true);
    setError(null);
    try {
      const updated = await adminLecturersService.linkAccountToUid(
        lecturer.id,
        manualUid.trim()
      );
      onSuccess(updated);
      setManualUid('');
    } catch (err: any) {
      console.error('Error linking account:', err);
      setError(err?.message || 'Failed to link account to UID.');
    } finally {
      setSubmittingLink(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink this account? The lecturer will no longer be able to log in to this faculty profile.')) {
      return;
    }

    setUnlinking(true);
    setError(null);
    try {
      const updated = await adminLecturersService.unlinkAccount(lecturer.id);
      onSuccess(updated);
    } catch (err: any) {
      console.error('Error unlinking account:', err);
      setError(err?.message || 'Failed to unlink account.');
    } finally {
      setUnlinking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isLinked = Boolean(lecturer.userId && lecturer.userId.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Lecturer Account Authentication
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage Firebase Authentication identity for {lecturer.fullName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Account Status Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Connection Status
              </span>
              {isLinked ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Account Linked
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  No VENUE account linked
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Lecturer Name:</span>
                <span className="font-semibold text-white">{lecturer.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Institutional Email:</span>
                <span className="text-slate-300 font-mono">{lecturer.email}</span>
              </div>

              {isLinked && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Firebase Auth UID:</span>
                    <span className="text-sky-400 font-mono text-[11px] truncate max-w-[240px]">
                      {lecturer.userId}
                    </span>
                  </div>
                  {lecturer.linkedAt && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Linked On:</span>
                      <span className="text-slate-300">
                        {new Date(lecturer.linkedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {isLinked && (
              <div className="pt-2">
                <button
                  onClick={handleUnlink}
                  disabled={unlinking}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>{unlinking ? 'Unlinking...' : 'Unlink Account'}</span>
                </button>
              </div>
            )}
          </div>

          {/* If NOT linked: Invitation Code or Manual Linking */}
          {!isLinked && (
            <div className="space-y-4">
              {/* Option 1: Invitation Code */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Option 1: Setup Invitation Code
                  </span>
                  <span className="text-[10px] text-slate-500">Recommended</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate a one-time invitation code. The lecturer can sign in using Firebase Authentication and provide this token to link their account securely.
                </p>

                {lecturer.invitationCode ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-sky-500/30">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Active Invitation Code
                      </span>
                      <span className="font-mono text-base font-bold text-sky-400 tracking-wider">
                        {lecturer.invitationCode}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(lecturer.invitationCode!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="w-full py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{generatingCode ? 'Generating...' : 'Generate Invitation Code'}</span>
                  </button>
                )}
              </div>

              {/* Option 2: Manual UID Linking */}
              <form onSubmit={handleManualLink} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Option 2: Direct Firebase UID Linking
                </span>
                <p className="text-xs text-slate-400">
                  If the lecturer already has an authenticated account in Firebase, enter their UID directly:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualUid}
                    onChange={(e) => setManualUid(e.target.value)}
                    placeholder="Enter Firebase Auth UID..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={submittingLink || !manualUid.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    {submittingLink ? 'Linking...' : 'Link UID'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
