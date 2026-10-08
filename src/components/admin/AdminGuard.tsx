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
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { AdminUserRecord } from '../../types';
import { adminAuthService } from '../../services/adminAuthService';
import { lecturerAuthService } from '../../services/lecturerAuthService';
import { auth } from '../../services/firebase';

interface AdminGuardProps {
  onExitToStudent: () => void;
  onNavigateToAuth?: () => void;
  onNavigateToLecturer?: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  onExitToStudent,
  onNavigateToAuth,
  onNavigateToLecturer,
}) => {
  const [checking, setChecking] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<AdminUserRecord | null>(null);
  const [isLecturerUser, setIsLecturerUser] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const verifyAdminPrivileges = async (userArg?: any) => {
    setChecking(true);
    setCheckError(null);

    // Ensure Firebase Auth has finished restoring persistence before checking currentUser
    if (typeof auth.authStateReady === 'function') {
      try {
        await auth.authStateReady();
      } catch {
        // ignore
      }
    }

    // Guard against React MouseEvent being passed when verifyAdminPrivileges is used as an onClick handler
    const resolvedUser =
      userArg && typeof userArg.uid === 'string' ? userArg : auth.currentUser;

    if (!resolvedUser || !resolvedUser.uid) {
      setAuthEmail(null);
      setAuthUid(null);
      setAdminUser(null);
      setIsLecturerUser(false);
      setChecking(false);
      return;
    }

    setAuthEmail(resolvedUser.email);
    setAuthUid(resolvedUser.uid);

    try {
      const record = await adminAuthService.fetchAdminUser(
        resolvedUser.uid,
        resolvedUser.email
      );
      if (record && record.role === 'super_admin') {
        setAdminUser(record);
        setIsLecturerUser(false);
      } else {
        setAdminUser(record);
        // Check if user is an accredited faculty lecturer
        try {
          const lecturerRecord = await lecturerAuthService.getLecturerByUid(resolvedUser.uid);
          setIsLecturerUser(Boolean(lecturerRecord));
        } catch {
          setIsLecturerUser(false);
        }
      }
    } catch (err: any) {
      console.warn('AdminGuard: Role verification failed:', err);
      setCheckError(err?.message || 'Failed to verify administrative permissions due to a network or service error.');
      setAdminUser(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const initAuthGuard = async () => {
      if (typeof auth.authStateReady === 'function') {
        try {
          await auth.authStateReady();
        } catch {
          // ignore
        }
      }
      if (!isMounted) return;
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (isMounted) {
          verifyAdminPrivileges(user);
        }
      });
    };

    initAuthGuard();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 1. Verifying State
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Shield className="h-8 w-8 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/30 animate-ping opacity-25" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Verifying Administrative Credentials
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          Auditing role-based permissions in Firestore security registry...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (Not logged in)
  if (!authUid) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Lock className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Authentication Required
          </h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            The VENUE Admin Dashboard is strictly reserved for authorized platform administrators.
            Please sign in with your verified administrative credentials to continue.
          </p>

          <div className="mt-6 space-y-3">
            {onNavigateToAuth && (
              <button
                onClick={onNavigateToAuth}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
              >
                <KeyRound className="h-4 w-4" />
                <span>Sign In with Admin Account</span>
              </button>
            )}

            <button
              onClick={onExitToStudent}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Student Campus</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Network / Verification Error State (Separated from genuine access restrictions)
  if (checkError && !adminUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-amber-500/20 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Verification Service Temporarily Unavailable
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                Network or Security Registry Connection Issue
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              We encountered a temporary connectivity error while verifying your administrative role in Firestore. Your account has not been restricted.
            </p>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[11px] text-rose-300">
              {checkError}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => verifyAdminPrivileges(auth.currentUser)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Verification</span>
            </button>
            <button
              onClick={onExitToStudent}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Student Campus</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Restricted / Inactive Admin Account State (Never blocks verified platform owner)
  if (adminUser && adminUser.status !== 'active') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-amber-500/20 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Administrative Account Inactive
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                Account Status: {adminUser.status}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              Your administrative role record is currently marked as <strong>{adminUser.status}</strong>. Please contact the VENUE Platform Owner to reactivate your administrative access.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExitToStudent}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Student Campus</span>
            </button>
            <button
              onClick={() => verifyAdminPrivileges(auth.currentUser)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-check Access</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Unauthorized State (Authenticated user lacks Super Admin role)
  if (!adminUser || adminUser.role !== 'super_admin') {
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
                Administrative Authorization Required
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              Your account does not possess the <strong>Super Admin</strong> role required to access
              the VENUE platform administrative control center.
            </p>

            {/* Account Details Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Account Email:</span>
                <span className="font-semibold text-white truncate max-w-[200px]">{authEmail || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Account UID:</span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">{authUid}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Assigned Role:</span>
                {isLecturerUser ? (
                  <span className="font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/25 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Lecturer (Faculty Educator)
                  </span>
                ) : (
                  <span className="font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {adminUser?.role || 'Student / General User'}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-[11px] text-slate-400 leading-normal">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {isLecturerUser
                    ? 'Lecturer accounts do not possess administrative privileges for the Admin Dashboard. Faculty members manage their profiles in the Faculty Lecturer Portal.'
                    : 'Admin roles are stored securely in the Firestore admin_users collection. Direct URL navigation without verified Super Admin credentials is automatically rejected.'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Safe Redirections */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {isLecturerUser && onNavigateToLecturer && (
              <button
                onClick={onNavigateToLecturer}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Go to Lecturer Portal</span>
              </button>
            )}

            <button
              onClick={onExitToStudent}
              className={`${isLecturerUser ? 'flex-1' : 'flex-1'} flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Student Campus</span>
            </button>

            <button
              onClick={() => verifyAdminPrivileges(auth.currentUser)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white cursor-pointer"
              title="Re-query Firestore to check if administrative rights were granted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-check Access</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized State: Render Full Admin Layout
  return (
    <AdminLayout
      adminUser={adminUser}
      onExitToStudent={onExitToStudent}
    />
  );
};
