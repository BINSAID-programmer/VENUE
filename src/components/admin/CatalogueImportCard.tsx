import React, { useState } from 'react';
import { Database, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  adminCatalogueService,
  ProspectusBundle,
  ProspectusPreview,
} from '../../services/adminCatalogueService';

const BUNDLES: Array<{ id: string; label: string; load: () => Promise<ProspectusBundle> }> = [
  {
    id: 'udsm-2025-2026-conas',
    label: 'UDSM Prospectus 2025/2026 — CoNAS (17 programmes)',
    load: async () => (await import('../../data/prospectusImport/udsm-2025-2026-conas.json')).default as ProspectusBundle,
  },
];

export const CatalogueImportCard: React.FC = () => {
  const [bundleId, setBundleId] = useState(BUNDLES[0].id);
  const [bundle, setBundle] = useState<ProspectusBundle | null>(null);
  const [preview, setPreview] = useState<ProspectusPreview | null>(null);
  const [busy, setBusy] = useState<'check' | 'import' | 'hide' | null>(null);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const check = async () => {
    setBusy('check');
    setMessage(null);
    setPreview(null);
    try {
      const b = await BUNDLES.find((x) => x.id === bundleId)!.load();
      setBundle(b);
      setPreview(await adminCatalogueService.previewProspectusImport(b));
    } catch (e: any) {
      setMessage({ ok: false, text: e?.message || 'Could not check the file.' });
    } finally {
      setBusy(null);
    }
  };

  const doImport = async () => {
    if (!bundle || !preview) return;
    const total = preview.rows.reduce((a, r) => a + r.total, 0);
    if (!window.confirm(`Import ${total} courses (${bundle.intake}) into the catalogue? Existing courses with the same code will be updated. Nothing is deleted.`)) return;
    setBusy('import');
    setMessage(null);
    try {
      const res = await adminCatalogueService.applyProspectusImport(bundle, (d, t) => setProgress([d, t]));
      setMessage({
        ok: res.failed === 0,
        text: `Done: ${res.written} courses saved${res.failed ? `, ${res.failed} failed — run Import again` : ''}.`,
      });
      setPreview(await adminCatalogueService.previewProspectusImport(bundle));
    } catch (e: any) {
      setMessage({ ok: false, text: e?.message || 'Import failed.' });
    } finally {
      setBusy(null);
      setProgress(null);
    }
  };

  const hideOld = async () => {
    if (!bundle) return;
    setBusy('hide');
    setMessage(null);
    try {
      const stale = await adminCatalogueService.findStaleProspectusCourses(bundle);
      if (stale.length === 0) {
        setMessage({ ok: true, text: 'No old courses to hide.' });
        return;
      }
      const list = stale.slice(0, 40).map((s) => `${s.programmeId}: ${s.code}`).join('\n');
      if (!window.confirm(`Hide ${stale.length} courses that are not in the Prospectus?\n\n${list}${stale.length > 40 ? '\n...' : ''}\n\nThey are hidden, not deleted.`)) return;
      const res = await adminCatalogueService.hideStaleProspectusCourses(stale);
      setMessage({ ok: res.failed === 0, text: `${res.hidden} old courses hidden${res.failed ? `, ${res.failed} failed — run again` : ''}.` });
    } catch (e: any) {
      setMessage({ ok: false, text: e?.message || 'Could not hide old courses.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-bold text-white">Import catalogue (Prospectus)</h3>
      </div>
      <p className="text-[11px] text-slate-400">
        Loads every programme's courses by year and semester. Courses with the same code are updated; nothing is deleted.
      </p>

      <select
        value={bundleId}
        onChange={(e) => {
          setBundleId(e.target.value);
          setPreview(null);
          setBundle(null);
        }}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
      >
        {BUNDLES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          onClick={check}
          disabled={busy !== null}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 cursor-pointer disabled:opacity-60"
        >
          {busy === 'check' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '1. Check'}
        </button>
        <button
          onClick={doImport}
          disabled={!preview || busy !== null}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white cursor-pointer disabled:opacity-40"
        >
          {busy === 'import' ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {progress ? `${progress[0]}/${progress[1]}` : ''}
            </span>
          ) : (
            '2. Import'
          )}
        </button>
      </div>

      <button
        onClick={hideOld}
        disabled={!bundle || busy !== null}
        className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 cursor-pointer disabled:opacity-40"
      >
        {busy === 'hide' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '3. Hide old courses not in Prospectus'}
      </button>

      {message && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
            message.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {preview && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-slate-400">
            Intake {preview.intake}: <b className="text-white">{preview.rows.reduce((a, r) => a + r.total, 0)}</b> courses ·{' '}
            <b className="text-emerald-300">{preview.rows.reduce((a, r) => a + r.fresh, 0)}</b> new ·{' '}
            <b className="text-amber-300">{preview.rows.reduce((a, r) => a + r.changed, 0)}</b> changed ·{' '}
            <b className="text-slate-300">{preview.rows.reduce((a, r) => a + r.same, 0)}</b> same
          </p>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {preview.rows.map((r) => (
              <div key={r.programmeId} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-200 truncate">
                  {r.name} <span className="text-slate-500">({r.programmeId})</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  {r.total} courses · {r.fresh} new · {r.changed} changed · {r.same} same
                </p>
                {r.needsReview.length > 0 && (
                  <p className="text-[10px] text-amber-300">Check by hand: {r.needsReview.join(' | ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
