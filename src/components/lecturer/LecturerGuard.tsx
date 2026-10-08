import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Lock,
  ArrowLeft,
  RefreshCw,
  LogOut,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Building2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { LecturerWorkspace } from './LecturerWorkspace';
import { LecturerProfileScreen } from './LecturerProfileScreen';
import { LecturerRecord } from '../../types';
import { lecturerAuthService } from '../../services/lecturerAuthService';
import { auth, logoutUser } from '../../services/firebase';

interface LecturerGuardProps {
  onExitToStudent: () => void;
  onNavigateToAuth?: () => void;
  onLogout?: () => void;
}

export const LecturerGuard: React.FC<LecturerGuardProps> = ({
  onExitToStudent,
  onNavigateToAuth,
  onLogout,
}) => {
  const [checking, setChecking] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [lecturer, setLecturer] = useState<LecturerRecord | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Invitation Code Linking state (for faculty members who have not yet linked UID)
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const verifyLecturerAccess = async (user = auth.currentUser) => {
    setChecking(true);
    setCheckError(null);

    if (!user) {
      setCurrentUser(null);
      setLecturer(null);
      setChecking(false);
      return;
    }

    setCurrentUser(user);

    try {
      const record = await lecturerAuthService.getLecturerByUid(user.uid, true);
      setLecturer(record);
    } catch (err: any) {
      console.warn('LecturerGuard: Role check error:', err);
      setCheckError(err?.message || 'Failed to verify faculty credentials.');
      setLecturer(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      verifyLecturerAccess(user);
    });
    return () => unsub();
  }, []);

  const handleLinkInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setLinkSuccess(null);

    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      setLinkError('Please enter your invitation code.');
      return;
    }

    if (!currentUser) {
      setLinkError('You must be signed in to link your account.');
      return;
    }

    setLinking(true);
    try {
      const candidate = await lecturerAuthService.getLecturerByInviteCode(cleanCode);
      if (!candidate) {
        throw new Error('Invalid or expired invitation code. Please request a new code from your department administrator.');
      }

      const linked = await lecturerAuthService.linkLecturerAccount(
        candidate.id,
        currentUser.uid,
        currentUser.email || undefined
      );

      setLecturer(linked);
      setLinkSuccess(`Faculty profile linked: ${linked.fullName}! Redirecting to portal...`);
      setInviteCode('');
    } catch (err: any) {
      console.error('Error linking invitation code:', err);
      setLinkError(err?.message || 'Failed to link account with this code.');
    } finally {
      setLinking(false);
    }
  };

  const handleSignOut = async () => {
    lecturerAuthService.clearCache();
    await logoutUser();
    if (onLogout) onLogout();
    else onExitToStudent();
  };

  // 1. Loading / Verification In Progress
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
            <Shield className="h-8 w-8 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-rose-500/30 animate-ping opacity-25" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Verifying Faculty Credentials
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          Validating lecturer role and academic accreditation in VENUE registry...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated (User is not logged in)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Lock className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Faculty Authentication Required
          </h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            The VENUE Faculty & Lecturer Portal is strictly reserved for authorized academic educators and instructors. Please sign in to access your lecturer profile.
          </p>

          <div className="mt-6 space-y-3">
            {onNavigateToAuth && (
              <button
                onClick={onNavigateToAuth}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>Sign In to Faculty Account</span>
              </button>
            )}

            <button
              onClick={onExitToStudent}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Student Campus</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is signed in, but has NO lecturer profile (e.g. Student trying to access /lecturer)
  if (!lecturer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-rose-500/20 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Access Restricted
              </h2>
              <p className="text-xs text-rose-400 font-medium">
                Lecturer Role Authorization Required
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              Your authenticated account does not possess the <strong>lecturer</strong> role required to access the VENUE Faculty & Lecturer Portal. Lecturer routes are strictly protected against student access.
            </p>

            {/* Authenticated Account Details Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Account Email:</span>
                <span className="font-semibold text-white truncate max-w-[200px]">{currentUser.email || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Account UID:</span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">{currentUser.uid}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Assigned Role:</span>
                <span className="font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Student / General User
                </span>
              </div>
            </div>

            {/* Link Profile Accordion for unlinked Faculty */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>Are you a faculty member with an invitation code?</span>
                </div>
                {showInviteForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showInviteForm && (
                <div className="p-4 pt-1 border-t border-slate-800/60 space-y-3">
                  <p className="text-[11px] text-slate-400">
                    If an administrator has registered your faculty record, enter your invitation token below to link your account:
                  </p>

                  {linkError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                      {linkError}
                    </div>
                  )}

                  {linkSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{linkSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleLinkInviteCode} className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. LEC-XXXX-XXXX"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-sky-500 tracking-wider uppercase"
                    />
                    <button
                      type="submit"
                      disabled={linking || !inviteCode.trim()}
                      className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {linking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Token...</span>
                        </>
                      ) : (
                        <span>Connect Faculty Profile</span>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Safe Redirection */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExitToStudent}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Student Campus</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Inactive or Unverified Lecturer Account (Stage 9B: Account Status Active vs Inactive & Verification Enforcement)
  // An inactive or unverified lecturer cannot use lecturer-specific workspace or upload functionality.
  if (lecturer.status === 'inactive' || (lecturer.verificationStatus && lecturer.verificationStatus !== 'verified')) {
    const isInactive = lecturer.status === 'inactive';
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-amber-500/20 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                {isInactive ? 'Faculty Account Inactive' : 'Institutional Verification Required'}
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                {isInactive
                  ? 'Lecturer Access Temporarily Deactivated'
                  : `Verification Status: ${(lecturer.verificationStatus || 'pending').toUpperCase()}`}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              {isInactive ? (
                <>
                  Your faculty account for <strong>{lecturer.fullName}</strong> is currently designated as <strong>Inactive</strong> by platform or institutional administrators. In accordance with VENUE governance, inactive lecturers cannot use lecturer-specific functionality.
                </>
              ) : (
                <>
                  Your faculty profile for <strong>{lecturer.fullName}</strong> currently has a verification status of <strong>{lecturer.verificationStatus}</strong>. Only verified lecturers with active institutional accreditation can access the Faculty Workspace or upload course materials.
                </>
              )}
            </p>

            {/* Status Breakdown Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>Account Status:</span>
                <span className="font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                  Inactive
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Institutional Verification:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                  lecturer.verificationStatus === 'verified'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                    : lecturer.verificationStatus === 'pending'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/25'
                }`}>
                  {lecturer.verificationStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>University:</span>
                <span className="font-medium text-white">{lecturer.universityName || lecturer.universityId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Department:</span>
                <span className="font-medium text-white">{lecturer.departmentName || lecturer.departmentId}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Your official academic catalogue record has been preserved. Please contact your department moderator or institutional administrator to reactivate your faculty privileges.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExitToStudent}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Student Campus</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Active Lecturer Authenticated: Render Faculty Workspace (Stage 5D)
  return (
    <LecturerWorkspace
      onBackToApp={onExitToStudent}
      onLogout={handleSignOut}
    />
  );
};
