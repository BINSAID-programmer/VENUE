import React, { useEffect, useState } from 'react';
import { X, UserCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { auth } from '../../services/firebase';
import { lecturerApplicationService, LecturerApplicationItem } from '../../services/lecturerApplicationService';

interface Props {
  onClose: () => void;
  /** Render as a page section (no overlay/close button) – used during staff sign-up. */
  embedded?: boolean;
  onSubmitted?: () => void;
}

const inputCls =
  'w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400';

/** A signed-in user asks to become a verified VENUE lecturer. The platform owner reviews it. */
export const LecturerApplyModal: React.FC<Props> = ({ onClose, embedded, onSubmitted }) => {
  const [mine, setMine] = useState<LecturerApplicationItem[] | null>(null);
  const [form, setForm] = useState({
    fullName: auth.currentUser?.displayName || '',
    title: 'Dr.',
    phone: '',
    staffId: '',
    university: '',
    college: '',
    department: '',
    courses: '',
    note: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void lecturerApplicationService.mine().then(setMine);
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const pending = mine?.find((a) => a.status === 'pending');
  const approved = mine?.find((a) => a.status === 'approved');
  const rejected = !pending && !approved ? mine?.find((a) => a.status === 'rejected') : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await lecturerApplicationService.submit(form);
      setSent(true);
      onSubmitted?.();
    } catch (err: any) {
      setError(err?.message || 'Could not send your application.');
    } finally {
      setBusy(false);
    }
  };

  const Info = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 flex gap-2">
      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );

  return (
    <div
      className={
        embedded
          ? 'w-full'
          : 'fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto overscroll-contain'
      }
    >
      <div className="w-full max-w-lg mx-auto my-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold">Apply as Lecturer</h3>
          </div>
          {!embedded && (
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          {mine === null ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : approved ? (
            <Info>
              Your lecturer application was approved. Open <strong>Faculty &amp; Lecturer Portal</strong> in More to upload
              materials for your courses.
            </Info>
          ) : pending || sent ? (
            <Info>
              Your application was received. The VENUE team will review it and your account will be activated once it is
              approved.
            </Info>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs text-slate-400">
                Lecturers who are verified can upload course materials that students see straight away.
              </p>
              {rejected && (
                <p className="text-xs text-rose-300">
                  Your previous application was not approved{rejected.decisionNote ? `: ${rejected.decisionNote}` : ''}. You can
                  apply again with correct details.
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                <select value={form.title} onChange={set('title')} className={inputCls}>
                  {['Prof.', 'Assoc. Prof.', 'Dr.', 'Mr.', 'Ms.', 'Mrs.'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input className={`${inputCls} col-span-2`} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
              </div>
              <input className={inputCls} placeholder="Phone number (e.g. 0712345678)" inputMode="tel" value={form.phone} onChange={set('phone')} required />
              <input className={inputCls} placeholder="Staff ID (if you have one)" value={form.staffId} onChange={set('staffId')} />
              <input className={inputCls} placeholder="University (e.g. UDSM)" value={form.university} onChange={set('university')} required />
              <input className={inputCls} placeholder="College / School" value={form.college} onChange={set('college')} />
              <input className={inputCls} placeholder="Department" value={form.department} onChange={set('department')} required />
              <textarea className={inputCls} rows={2} placeholder="Courses you teach (e.g. ST113, MT101)" value={form.courses} onChange={set('courses')} required />
              <textarea className={inputCls} rows={2} placeholder="Anything that helps us confirm you (staff page link, etc.)" value={form.note} onChange={set('note')} />
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold disabled:opacity-60 cursor-pointer"
              >
                {busy ? 'Sending…' : 'Send application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
