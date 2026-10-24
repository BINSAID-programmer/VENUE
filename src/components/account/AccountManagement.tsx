import React, { useState } from 'react';
import { AlertTriangle, Download, GraduationCap, Loader2, Trash2, X } from 'lucide-react';
import type { StudentProfile } from '../../types';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import {
  MAX_PLACEMENT_CORRECTIONS,
  accountUsesPassword,
  correctPlacement,
  correctionsLeft,
  deleteMyAccount,
  exportMyData,
  updateAcademicProgress,
  type PlacementInput,
} from '../../services/accountService';

interface Props {
  profile: StudentProfile;
  onProfileUpdated: (p: StudentProfile) => void;
  onAccountDeleted: () => void;
}

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

export const AccountManagement: React.FC<Props> = ({ profile, onProfileUpdated, onAccountDeleted }) => {
  const [year, setYear] = useState(profile.yearOfStudy || 'Year 1');
  const [semester, setSemester] = useState(profile.semester || 'Semester 1');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const left = correctionsLeft(profile);

  const run = async (key: string, fn: () => Promise<void>, ok: string) => {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      setMsg({ text: ok });
    } catch (err: any) {
      setMsg({ text: err?.message || 'Something went wrong. Please try again.', error: true });
    } finally {
      setBusy('');
    }
  };

  const saveProgress = () =>
    run(
      'progress',
      async () => {
        const updated = await updateAcademicProgress(profile, { yearOfStudy: year, semester });
        onProfileUpdated(updated);
      },
      'Year and semester saved.'
    );

  const submitCorrection = async (payload: Partial<StudentProfile>) => {
    setShowCorrection(false);
    await run(
      'correction',
      async () => {
        const updated = await correctPlacement(profile, {
          ...(payload as unknown as PlacementInput),
          academicYear: profile.academicYear,
        });
        onProfileUpdated(updated);
        setYear(updated.yearOfStudy || year);
        setSemester(updated.semester || semester);
      },
      'Your course was corrected. Your courses and data now follow the new programme.'
    );
  };

  const doDelete = () =>
    run(
      'delete',
      async () => {
        await deleteMyAccount(accountUsesPassword() ? password : undefined);
        onAccountDeleted();
      },
      'Account deleted.'
    );

  const selectCls =
    'w-full mt-1 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-200 text-xs';

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Course & Year of Study</h3>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl text-xs border ${
              msg.error
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="text-slate-400">
            Year of study
            <select className={selectCls} value={year} onChange={(e) => setYear(e.target.value)}>
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="text-slate-400">
            Semester
            <select className={selectCls} value={semester} onChange={(e) => setSemester(e.target.value)}>
              {SEMESTERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={saveProgress}
          disabled={!!busy}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
        >
          {busy === 'progress' ? 'Saving...' : 'Save year/semester'}
        </button>

        <div className="pt-3 border-t border-slate-800 space-y-2">
          <p className="text-xs text-slate-400 leading-relaxed">
            Chose the wrong university or course? You can correct it up to {MAX_PLACEMENT_CORRECTIONS} times. Corrections
            left: <span className="font-bold text-white">{left}</span>
          </p>
          <button
            type="button"
            onClick={() => setShowCorrection(true)}
            disabled={!!busy || left === 0}
            className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 text-xs font-semibold disabled:opacity-40"
          >
            {busy === 'correction' ? 'Correcting...' : left === 0 ? 'Limit reached' : 'Correct university / course'}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Download className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data & Account</h3>
        </div>
        <button
          type="button"
          onClick={() => run('export', exportMyData, 'Your data was downloaded.')}
          disabled={!!busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-50"
        >
          {busy === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download my data
        </button>

        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
          <p className="text-xs text-rose-300 flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4" /> Danger zone
          </p>
          <p className="text-xs text-slate-400">
            Deleting your account removes your profile, results and all your data. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            disabled={!!busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Delete my account
          </button>
        </div>
      </div>

      {showCorrection && (
        <div className="fixed inset-0 z-[80] bg-[#070b14] overflow-y-auto flex flex-col">
          <OnboardingScreen
            mode="correction"
            correctionsLeft={left}
            initialProfile={profile}
            onComplete={submitCorrection}
            onBackToAuth={() => setShowCorrection(false)}
          />
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-rose-500/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Delete account?</h4>
              <button type="button" onClick={() => setShowDelete(false)} aria-label="Close">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Type <span className="font-mono text-rose-300">DELETE</span> to confirm
              {accountUsesPassword() ? ' and enter your password.' : '. You will be asked to sign in with Google again.'}
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className={selectCls}
            />
            {accountUsesPassword() && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={selectCls}
              />
            )}
            {msg?.error && <p className="text-xs text-rose-300">{msg.text}</p>}
            <button
              type="button"
              onClick={doDelete}
              disabled={
                busy === 'delete' || confirmText.trim().toUpperCase() !== 'DELETE' || (accountUsesPassword() && !password)
              }
              className="w-full px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-40"
            >
              {busy === 'delete' ? 'Deleting...' : 'Delete permanently'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
