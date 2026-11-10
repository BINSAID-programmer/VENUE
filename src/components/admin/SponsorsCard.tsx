import React, { useCallback, useEffect, useState } from 'react';
import { Megaphone, Trash2, Plus } from 'lucide-react';
import { sponsorService, SponsorAdmin } from '../../services/sponsorService';

const inputCls =
  'w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400';

/** Owner-only: manage the sponsor banners shown on the student Home screen. */
export function SponsorsCard() {
  const [items, setItems] = useState<SponsorAdmin[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', text: '', linkUrl: '', startsAt: '', endsAt: '', imageData: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await sponsorService.adminList());
    } catch (e: any) {
      setError(e?.message || 'Could not load sponsors.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickImage = async (f: File | null) => {
    if (!f) return;
    setError('');
    try {
      setForm((p) => ({ ...p, imageData: '' }));
      const data = await sponsorService.fileToSmallImage(f);
      setForm((p) => ({ ...p, imageData: data }));
    } catch (e: any) {
      setError(e?.message || 'Could not use this picture.');
    }
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await sponsorService.save({ ...form, active: true });
      setForm({ name: '', title: '', text: '', linkUrl: '', startsAt: '', endsAt: '', imageData: '' });
      setOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (s: SponsorAdmin) => {
    try {
      await sponsorService.save({ id: s.id, name: s.name, title: s.title, text: s.text, linkUrl: s.linkUrl, startsAt: s.startsAt, endsAt: s.endsAt, active: !s.active });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not update.');
    }
  };

  const del = async (s: SponsorAdmin) => {
    if (!window.confirm(`Delete sponsor "${s.name}"?`)) return;
    try {
      await sponsorService.remove(s.id);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not delete.');
    }
  };

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Sponsor banners (Home)</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}

      {open && (
        <div className="space-y-2 rounded-xl border border-slate-800 p-3">
          <input className={inputCls} placeholder="Sponsor name (e.g. Mlimani Books)" value={form.name} onChange={set('name')} />
          <input className={inputCls} placeholder="Headline" value={form.title} onChange={set('title')} maxLength={80} />
          <textarea className={inputCls} rows={2} placeholder="Short text (optional)" value={form.text} onChange={set('text')} maxLength={160} />
          <input className={inputCls} placeholder="Link, e.g. https://… (optional)" inputMode="url" value={form.linkUrl} onChange={set('linkUrl')} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] text-slate-400">
              Starts
              <input type="date" className={inputCls} value={form.startsAt} onChange={set('startsAt')} />
            </label>
            <label className="text-[11px] text-slate-400">
              Ends
              <input type="date" className={inputCls} value={form.endsAt} onChange={set('endsAt')} />
            </label>
          </div>
          <label className="block rounded-xl border border-dashed border-slate-600 p-3 text-center text-xs text-slate-300 cursor-pointer">
            {form.imageData ? 'Picture ready (tap to change)' : 'Tap to choose a picture (optional)'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e.target.files?.[0] || null)} />
          </label>
          {form.imageData && <img src={form.imageData} alt="" className="w-full max-h-32 object-cover rounded-lg" />}
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Saving…' : 'Save sponsor'}
          </button>
        </div>
      )}

      {items.length === 0 && !open && <p className="text-xs text-slate-400">No sponsors yet.</p>}
      {items.map((s) => (
        <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex gap-3 items-center">
          {s.imageData && <img src={s.imageData} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{s.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{s.title}</p>
            <p className="text-[11px] text-slate-500">
              {s.clicks} clicks{s.endsAt ? ` · until ${s.endsAt}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggle(s)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${s.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}
          >
            {s.active ? 'On' : 'Off'}
          </button>
          <button type="button" onClick={() => del(s)} aria-label="Delete" className="p-1.5 text-rose-300 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </section>
  );
}
