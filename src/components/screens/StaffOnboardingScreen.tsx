import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, GraduationCap } from 'lucide-react';
import { LecturerApplyModal } from '../lecturer/LecturerApplyModal';
import { lecturerApplicationService, LecturerApplicationItem } from '../../services/lecturerApplicationService';

export const STAFF_SIGNUP_KEY = 'venue:signup-role';

export function isStaffSignupIntent(): boolean {
  try {
    return localStorage.getItem(STAFF_SIGNUP_KEY) === 'staff';
  } catch {
    return false;
  }
}

export function clearStaffSignupIntent() {
  try {
    localStorage.removeItem(STAFF_SIGNUP_KEY);
  } catch {
    /* ignore */
  }
}

interface Props {
  onOpenLecturerPortal: () => void;
  onContinueAsStudent: () => void;
}

/** Shown instead of the student onboarding when someone signs up as Staff / Lecturer. */
export const StaffOnboardingScreen: React.FC<Props> = ({ onOpenLecturerPortal, onContinueAsStudent }) => {
  const [apps, setApps] = useState<LecturerApplicationItem[] | null>(null);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    setApps(await lecturerApplicationService.mine());
    setChecking(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const approved = apps?.some((a) => a.status === 'approved');
  const pending = apps?.some((a) => a.status === 'pending');

  const goStudent = () => {
    clearStaffSignupIntent();
    onContinueAsStudent();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-10 flex flex-col">
      <div className="max-w-lg w-full mx-auto pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-rose-400" />
          <h1 className="text-lg font-bold">Staff / Lecturer account</h1>
        </div>

        {apps === null ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : approved ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
            <p className="text-sm text-emerald-200">Your lecturer account is approved. You can now upload materials for your courses.</p>
            <button
              type="button"
              onClick={() => {
                clearStaffSignupIntent();
                onOpenLecturerPortal();
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold cursor-pointer"
            >
              Open Lecturer Portal
            </button>
          </div>
        ) : pending ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
            <p className="text-sm text-amber-100">
              Your application is being reviewed. You will get access to the Lecturer Portal as soon as it is approved.
            </p>
            <button
              type="button"
              onClick={refresh}
              disabled={checking}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-100 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} /> Check status
            </button>
          </div>
        ) : (
          <LecturerApplyModal embedded onClose={() => {}} onSubmitted={() => void refresh()} />
        )}

        <button
          type="button"
          onClick={goStudent}
          className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
        >
          {pending ? 'Continue as a student while I wait' : 'I am actually a student'}
        </button>
      </div>
    </div>
  );
};
