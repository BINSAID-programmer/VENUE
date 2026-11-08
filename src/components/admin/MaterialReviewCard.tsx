import React, { useCallback, useEffect, useState } from 'react';
import { FileCheck2, RefreshCw, ExternalLink } from 'lucide-react';
import { studentSubmissionService, SubmissionItem } from '../../services/studentSubmissionService';

/** Admins: review files that students shared. Approving publishes them to all students of that course. */
export function MaterialReviewCard() {
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await studentSubmissionService.adminList('pending_review'));
    } catch (e: any) {
      setError(e?.message || 'Could not load submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (m: SubmissionItem, action: 'approve' | 'reject' | 'changes') => {
    let note: string | undefined;
    if (action !== 'approve') {
      const asked = window.prompt(action === 'reject' ? 'Reason for rejecting (the student will see it):' : 'What should the student change?');
      if (asked === null) return;
      note = asked;
    }
    setBusyId(m.id);
    setError('');
    try {
      await studentSubmissionService.adminDecide(m.id, action, note);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not save.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="rounded-2xl border border-blue-500/30 bg-slate-900/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Student uploads · Pending review</h3>
          {items.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-extrabold">{items.length}</span>
          )}
        </div>
        <button type="button" onClick={load} aria-label="Refresh" className="p-1.5 text-slate-400 cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
      {!loading && items.length === 0 && <p className="text-xs text-slate-400">Nothing waiting for review.</p>}

      {items.map((m) => (
        <div key={m.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
          <div>
            <p className="text-sm font-bold text-white">{m.title}</p>
            <p className="text-[11px] text-slate-400">
              {m.courseCode} · {m.materialType} · by {m.uploadedBy?.name || m.uploadedBy?.email || 'student'}
            </p>
            {m.description && <p className="text-xs text-slate-300 mt-1">{m.description}</p>}
          </div>
          {m.fileUrl && (
            <a
              href={m.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-300 underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open file ({m.fileName || 'file'})
            </a>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busyId === m.id}
              onClick={() => decide(m, 'approve')}
              className="flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busyId === m.id}
              onClick={() => decide(m, 'changes')}
              className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-200 text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              Changes
            </button>
            <button
              type="button"
              disabled={busyId === m.id}
              onClick={() => decide(m, 'reject')}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
