import React, { useCallback, useEffect, useState } from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import {
  opportunitiesService,
  PostedOpportunity,
  OPPORTUNITY_TYPES,
  OPPORTUNITY_FUNDING,
} from '../../services/opportunitiesService';

const inputCls =
  'w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400';

const EMPTY = {
  title: '',
  organization: '',
  type: 'Internship',
  location: 'Dar es Salaam',
  regionScope: 'Tanzania',
  fundingType: 'Unpaid / Experience',
  benefit: '',
  deadline: '',
  description: '',
  eligibility: '',
  applyUrl: '',
  featured: false,
};

/** Owner-only: post internships, attachments, jobs and scholarships for students. */
export function OpportunitiesCard() {
  const [items, setItems] = useState<PostedOpportunity[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await opportunitiesService.adminList());
    } catch (e: any) {
      setError(e?.message || 'Could not load.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await opportunitiesService.save({ ...form, active: true });
      setForm(EMPTY);
      setOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (o: PostedOpportunity) => {
    try {
      await opportunitiesService.save({ ...o, active: !o.active });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not update.');
    }
  };

  const del = async (o: PostedOpportunity) => {
    if (!window.confirm(`Delete "${o.title}"?`)) return;
    try {
      await opportunitiesService.remove(o.id);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Could not delete.');
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Opportunities (internships, jobs…)</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Post
        </button>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}

      {open && (
        <div className="space-y-2 rounded-xl border border-slate-800 p-3">
          <input className={inputCls} placeholder="Title (e.g. Data Analyst Intern)" value={form.title} onChange={set('title')} maxLength={140} />
          <input className={inputCls} placeholder="Organisation (e.g. NMB Bank)" value={form.organization} onChange={set('organization')} maxLength={100} />
          <div className="grid grid-cols-2 gap-2">
            <select className={inputCls} value={form.type} onChange={set('type')}>
              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select className={inputCls} value={form.fundingType} onChange={set('fundingType')}>
              {OPPORTUNITY_FUNDING.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Location" value={form.location} onChange={set('location')} />
            <select className={inputCls} value={form.regionScope} onChange={set('regionScope')}>
              {['Tanzania', 'Africa', 'International'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <input className={inputCls} placeholder="Benefit (e.g. Monthly stipend)" value={form.benefit} onChange={set('benefit')} maxLength={200} />
          <label className="text-[11px] text-slate-400 block">
            Deadline (leave empty if open)
            <input type="date" className={inputCls} value={form.deadline} onChange={set('deadline')} />
          </label>
          <textarea className={inputCls} rows={3} placeholder="Description" value={form.description} onChange={set('description')} maxLength={800} />
          <textarea className={inputCls} rows={2} placeholder="Who can apply (eligibility)" value={form.eligibility} onChange={set('eligibility')} maxLength={500} />
          <input className={inputCls} placeholder="Application link https://…" inputMode="url" value={form.applyUrl} onChange={set('applyUrl')} />
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
            Featured (shown at the top, with a Featured badge)
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Saving…' : 'Publish'}
          </button>
        </div>
      )}

      {items.length === 0 && !open && <p className="text-xs text-slate-400">Nothing posted yet.</p>}
      {items.map((o) => (
        <div key={o.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex gap-3 items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{o.title}</p>
            <p className="text-[11px] text-slate-400 truncate">
              {o.type} · {o.organization}
              {o.featured ? ' · Featured' : ''}
            </p>
            <p className="text-[11px] text-slate-500">
              {o.clicks || 0} apply clicks{o.deadline ? ` · until ${o.deadline}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggle(o)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${o.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}
          >
            {o.active ? 'On' : 'Off'}
          </button>
          <button type="button" onClick={() => del(o)} aria-label="Delete" className="p-1.5 text-rose-300 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </section>
  );
}
