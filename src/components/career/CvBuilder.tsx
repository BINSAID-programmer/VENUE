import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Trash2, Printer, Eye, Pencil } from 'lucide-react';
import type { StudentProfile } from '../../types';

const KEY = 'venue_cv_v1';

interface Job {
  title: string;
  org: string;
  period: string;
  details: string; // one achievement per line
}
interface Cv {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  education: string; // one entry per line
  skills: string; // comma separated
  languages: string;
  jobs: Job[];
  projects: Job[];
  awards: string;
  referees: string;
}

const emptyJob = (): Job => ({ title: '', org: '', period: '', details: '' });

function initial(profile?: StudentProfile): Cv {
  const prog = profile?.programmeName || profile?.programme || '';
  const uni = profile?.universityName || profile?.university || '';
  return {
    name: profile?.fullName || profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phoneNumber || '',
    location: 'Dar es Salaam, Tanzania',
    links: '',
    summary: '',
    education: [prog && uni ? `${prog}, ${uni} (in progress)` : '', 'Advanced Certificate of Secondary Education (ACSEE)'].filter(Boolean).join('\n'),
    skills: '',
    languages: 'Kiswahili (native), English',
    jobs: [],
    projects: [],
    awards: '',
    referees: 'Available on request',
  };
}

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** The CV as clean, single-column HTML (works as the on-screen preview and as the printed page). */
function cvHtml(cv: Cv): string {
  const sec = (t: string, body: string) => (body ? `<h2>${t}</h2>${body}` : '');
  const jobs = (arr: Job[]) =>
    arr
      .filter((j) => j.title || j.org)
      .map(
        (j) =>
          `<div class="job"><div class="row"><b>${esc(j.title)}</b><span>${esc(j.period)}</span></div>${
            j.org ? `<div class="org">${esc(j.org)}</div>` : ''
          }${lines(j.details).length ? `<ul>${lines(j.details).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}</div>`
      )
      .join('');
  const contact = [cv.email, cv.phone, cv.location, ...lines(cv.links)].filter(Boolean).map(esc).join(' &nbsp;|&nbsp; ');
  return `<div class="cv"><h1>${esc(cv.name || 'Your Name')}</h1><div class="contact">${contact}</div>
${sec('Profile', cv.summary.trim() ? `<p>${esc(cv.summary.trim())}</p>` : '')}
${sec('Education', lines(cv.education).length ? `<ul>${lines(cv.education).map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : '')}
${sec('Skills', list(cv.skills).length ? `<p>${list(cv.skills).map(esc).join(' &middot; ')}</p>` : '')}
${sec('Experience', jobs(cv.jobs))}
${sec('Projects', jobs(cv.projects))}
${sec('Awards and activities', lines(cv.awards).length ? `<ul>${lines(cv.awards).map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : '')}
${sec('Languages', cv.languages.trim() ? `<p>${esc(cv.languages.trim())}</p>` : '')}
${sec('Referees', cv.referees.trim() ? `<p>${esc(cv.referees.trim())}</p>` : '')}</div>`;
}

const CSS = `.cv{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:12.5px;line-height:1.45}
.cv h1{font-size:24px;margin:0 0 4px;letter-spacing:.3px}.cv .contact{color:#444;font-size:11.5px;margin-bottom:6px;border-bottom:2px solid #1d4ed8;padding-bottom:8px}
.cv h2{font-size:12.5px;text-transform:uppercase;letter-spacing:1.2px;color:#1d4ed8;margin:14px 0 5px;border-bottom:1px solid #cbd5e1;padding-bottom:2px}
.cv p{margin:0 0 4px}.cv ul{margin:2px 0 4px 18px;padding:0}.cv li{margin:1px 0}.cv .job{margin-bottom:7px}
.cv .row{display:flex;justify-content:space-between;gap:8px}.cv .org{color:#444;font-style:italic}`;

function printCv(cv: Cv) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Allow pop-ups for this site, then try again.');
    return;
  }
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(cv.name || 'CV')} - CV</title><style>@page{size:A4;margin:14mm}body{margin:0;padding:12px}${CSS}</style></head><body>${cvHtml(cv)}<script>setTimeout(function(){window.print()},400)<\/script></body></html>`
  );
  w.document.close();
}

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-blue-500';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1">
    <span className="text-[11px] font-bold text-slate-400">{label}</span>
    {children}
    {hint && <span className="block text-[10px] text-slate-500">{hint}</span>}
  </label>
);

const JobEditor: React.FC<{
  title: string;
  titlePh: string;
  orgPh: string;
  items: Job[];
  onChange: (v: Job[]) => void;
}> = ({ title, titlePh, orgPh, items, onChange }) => {
  const set = (i: number, patch: Partial<Job>) => onChange(items.map((j, k) => (k === i ? { ...j, ...patch } : j)));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold text-slate-200">{title}</p>
        <button type="button" onClick={() => onChange([...items, emptyJob()])} className="text-[11px] font-bold text-blue-300 flex items-center gap-1 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {items.map((j, i) => (
        <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex gap-2">
            <input value={j.title} onChange={(e) => set(i, { title: e.target.value })} placeholder={titlePh} className={inputCls} />
            <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} className="px-2.5 rounded-xl bg-slate-800 text-rose-300 cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input value={j.org} onChange={(e) => set(i, { org: e.target.value })} placeholder={orgPh} className={inputCls} />
          <input value={j.period} onChange={(e) => set(i, { period: e.target.value })} placeholder="e.g. Jun 2026 - Aug 2026" className={inputCls} />
          <textarea value={j.details} onChange={(e) => set(i, { details: e.target.value })} rows={3} placeholder={'One achievement per line, start with a verb:\nBuilt a ... that ...'} className={inputCls} />
        </div>
      ))}
      {items.length === 0 && <p className="text-[11px] text-slate-500">Nothing yet. Tap Add.</p>}
    </div>
  );
};

export const CvBuilder: React.FC<{ profile?: StudentProfile }> = ({ profile }) => {
  const [cv, setCv] = useState<Cv>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && typeof v === 'object') return { ...initial(profile), ...v };
    } catch {
      /* ignore */
    }
    return initial(profile);
  });
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cv));
    } catch {
      /* storage unavailable */
    }
  }, [cv]);

  const html = useMemo(() => cvHtml(cv), [cv]);
  const up = (patch: Partial<Cv>) => setCv((c) => ({ ...c, ...patch }));

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <p className="text-sm font-extrabold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-300" /> CV Builder
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Fill in the boxes, then print or save as PDF. One clean page that employers can read quickly. Your CV is saved on this phone only.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
        {(['edit', 'preview'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${view === v ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            {v === 'edit' ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {v === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      {view === 'edit' ? (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <Field label="Full name"><input value={cv.name} onChange={(e) => up({ name: e.target.value })} className={inputCls} /></Field>
            <Field label="Email" hint="Use a professional address, not a nickname."><input value={cv.email} onChange={(e) => up({ email: e.target.value })} className={inputCls} /></Field>
            <Field label="Phone"><input value={cv.phone} onChange={(e) => up({ phone: e.target.value })} className={inputCls} /></Field>
            <Field label="Location"><input value={cv.location} onChange={(e) => up({ location: e.target.value })} className={inputCls} /></Field>
            <Field label="Links (one per line)" hint="LinkedIn or GitHub. Only add what you are proud of."><textarea value={cv.links} onChange={(e) => up({ links: e.target.value })} rows={2} className={inputCls} /></Field>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <Field label="Profile (2-3 sentences)" hint="Who you are, what you study, what you want. Example: Second-year Mathematics and Statistics student who enjoys data analysis in Python, seeking a data internship.">
              <textarea value={cv.summary} onChange={(e) => up({ summary: e.target.value })} rows={4} className={inputCls} />
            </Field>
            <Field label="Education (one per line)"><textarea value={cv.education} onChange={(e) => up({ education: e.target.value })} rows={3} className={inputCls} /></Field>
            <Field label="Skills (separate with commas)" hint="Example: Python, Excel, R, data analysis, teamwork, public speaking"><textarea value={cv.skills} onChange={(e) => up({ skills: e.target.value })} rows={2} className={inputCls} /></Field>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <JobEditor title="Experience" titlePh="Role, e.g. Teaching assistant" orgPh="Organisation" items={cv.jobs} onChange={(jobs) => up({ jobs })} />
            <JobEditor title="Projects" titlePh="Project name" orgPh="Where or for whom (optional)" items={cv.projects} onChange={(projects) => up({ projects })} />
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <Field label="Awards and activities (one per line)"><textarea value={cv.awards} onChange={(e) => up({ awards: e.target.value })} rows={3} className={inputCls} /></Field>
            <Field label="Languages"><input value={cv.languages} onChange={(e) => up({ languages: e.target.value })} className={inputCls} /></Field>
            <Field label="Referees" hint="Ask people before you list them. Writing 'Available on request' is fine."><textarea value={cv.referees} onChange={(e) => up({ referees: e.target.value })} rows={2} className={inputCls} /></Field>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 overflow-x-auto">
          <style>{CSS}</style>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}

      <button type="button" onClick={() => printCv(cv)} className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer">
        <Printer className="w-4 h-4" /> Print or save as PDF
      </button>
      <p className="text-[11px] text-slate-500 text-center">In the print window choose "Save as PDF" as the printer.</p>
    </div>
  );
};
