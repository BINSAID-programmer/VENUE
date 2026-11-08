import React, { useCallback, useEffect, useState } from 'react';
import { UserCheck, X, RefreshCw } from 'lucide-react';
import { lecturerApplicationService, LecturerApplicationItem } from '../../services/lecturerApplicationService';
import { adminLecturersService } from '../../services/adminLecturersService';
import { AddLecturerModal } from './lecturers/AddLecturerModal';

/** Owner-only: review lecturer applications. Approving creates a verified lecturer linked to the applicant's account. */
export function LecturerApplicationsCard() {
  const [items, setItems] = useState<LecturerApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [approving, setApproving] = useState<LecturerApplicationItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await lecturerApplicationService.adminList());
    } catch (e: any) {
      setError(e?.message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reject = async (a: LecturerApplicationItem) => {
    const note = window.prompt('Reason (optional, the applicant will see it):') ?? null;
    if (note === null) return;
    setBusyId(a.id);
    setError('');
    try {
      await lecturerApplicationService.adminDecide(a.id, false, note);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not save.');
    } finally {
      setBusyId('');
    }
  };

  const pending = items.filter((i) => i.status === 'pending');
  const decided = items.filter((i) => i.status !== 'pending').slice(0, 6);

  return (
    <section className="rounded-2xl border border-rose-500/30 bg-slate-900/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white">Lecturer applications</h3>
          {pending.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">{pending.length} pending</span>
          )}
        </div>
        <button type="button" onClick={load} aria-label="Refresh" className="p-1.5 text-slate-400 cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-xs text-rose-300">{error}</p>}
      {!loading && pending.length === 0 && <p className="text-xs text-slate-400">No applications waiting.</p>}

      {pending.map((a) => (
        <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
          <div>
            <p className="text-sm font-bold text-white">
              {a.title} {a.fullName}
            </p>
            <p className="text-[11px] text-slate-400">
              {a.email} · {a.phone}
              {a.staffId ? ` · Staff ID ${a.staffId}` : ''}
            </p>
          </div>
          <p className="text-xs text-slate-300">
            {a.university}
            {a.college ? ` › ${a.college}` : ''} › {a.department}
          </p>
          <p className="text-xs text-slate-300">Courses: {a.courses}</p>
          {a.note && <p className="text-xs text-slate-400">Note: {a.note}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busyId === a.id}
              onClick={() => setApproving(a)}
              className="flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busyId === a.id}
              onClick={() => reject(a)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        </div>
      ))}

      {decided.length > 0 && (
        <div className="space-y-1 pt-1">
          {decided.map((a) => (
            <p key={a.id} className="text-[11px] text-slate-500">
              {a.status === 'approved' ? '✓' : '✗'} {a.fullName} — {a.status}
            </p>
          ))}
        </div>
      )}

      {approving && (
        <AddLecturerModal
          isOpen
          prefill={{
            fullName: approving.fullName,
            email: approving.email,
            phone: approving.phone,
            staffId: approving.staffId,
            title: approving.title,
          }}
          onClose={() => setApproving(null)}
          onSuccess={async (lecturer) => {
            const target = approving;
            setApproving(null);
            if (!target) return;
            try {
              await adminLecturersService.linkAccountToUid(lecturer.id, target.uid);
              await lecturerApplicationService.adminDecide(target.id, true);
            } catch (e: any) {
              setError(
                `Lecturer was created but linking the account failed (${e?.message || 'error'}). Link UID ${target.uid} manually in Lecturers.`
              );
            }
            await load();
          }}
        />
      )}
    </section>
  );
}
