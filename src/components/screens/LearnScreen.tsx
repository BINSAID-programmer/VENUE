import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, CheckCircle2, ChevronRight, Loader2, GraduationCap, RotateCcw } from 'lucide-react';
import { LEARN_TRACKS, LearnLesson, LearnTrack } from '../../data/learnLessons';

const STORE_KEY = 'venue_learn_done_v1';
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

function loadDone(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function saveDone(ids: string[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}

let pyodidePromise: Promise<any> | null = null;
function getPyodide(): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PYODIDE_URL;
      s.onload = async () => {
        try {
          resolve(await (window as any).loadPyodide());
        } catch (e) {
          reject(e);
        }
      };
      s.onerror = () => reject(new Error('Could not load Python. Check your internet and try again.'));
      document.head.appendChild(s);
    }).catch((e) => {
      pyodidePromise = null;
      throw e;
    });
  }
  return pyodidePromise;
}

const wrapJs = (code: string) =>
  `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:ui-monospace,monospace;font-size:14px;padding:10px;margin:0;color:#e2e8f0;background:#020617}div{white-space:pre-wrap;margin:2px 0}.e{color:#fda4af}</style></head><body><div id="o"></div><script>
const o=document.getElementById('o');
const fmt=a=>a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ');
console.log=(...a)=>{const d=document.createElement('div');d.textContent=fmt(a);o.appendChild(d)};
window.onerror=m=>{const d=document.createElement('div');d.className='e';d.textContent=String(m);o.appendChild(d)};
try{
${code.replace(/<\/script>/gi, '<\\/script>')}
}catch(e){window.onerror(e.message)}
</script></body></html>`;

const Runner: React.FC<{ lang: LearnTrack['lang']; code: string; runKey: number }> = ({ lang, code, runKey }) => {
  const [out, setOut] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (lang !== 'python' || runKey === 0) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setErr('');
      setOut('');
      try {
        const py = await getPyodide();
        let buf = '';
        py.setStdout({ batched: (s: string) => (buf += s + '\n') });
        py.setStderr({ batched: (s: string) => (buf += s + '\n') });
        try {
          await py.runPythonAsync(code);
        } catch (e: any) {
          setErr(String(e?.message || e).split('\n').slice(-3).join('\n'));
        }
        if (!cancelled) setOut(buf.trimEnd());
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Could not run Python.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [runKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (runKey === 0) return <p className="text-[11px] text-slate-500 p-3">Press “Run” to see the result here.</p>;

  if (lang === 'python') {
    return (
      <div className="p-3 font-mono text-xs whitespace-pre-wrap min-h-[60px]">
        {busy && (
          <span className="inline-flex items-center gap-2 text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting Python (first time takes a few seconds)…
          </span>
        )}
        {!busy && out && <div className="text-slate-100">{out}</div>}
        {!busy && err && <div className="text-rose-300">{err}</div>}
        {!busy && !out && !err && <span className="text-slate-500">(no output)</span>}
      </div>
    );
  }

  return (
    <iframe
      key={runKey}
      title="Result"
      sandbox="allow-scripts"
      srcDoc={lang === 'js' ? wrapJs(code) : code}
      className="w-full h-56 bg-white rounded-b-xl"
    />
  );
};

export const LearnScreen: React.FC = () => {
  const [track, setTrack] = useState<LearnTrack | null>(null);
  const [lesson, setLesson] = useState<LearnLesson | null>(null);
  const [code, setCode] = useState('');
  const [runKey, setRunKey] = useState(0);
  const [done, setDone] = useState<string[]>(loadDone);
  const topRef = useRef<HTMLDivElement>(null);

  const open = (t: LearnTrack, l: LearnLesson) => {
    setTrack(t);
    setLesson(l);
    setCode(l.code);
    setRunKey(0);
    topRef.current?.scrollIntoView?.({ block: 'start' });
    window.scrollTo?.({ top: 0 });
  };

  const markDone = () => {
    if (!lesson || done.includes(lesson.id)) return;
    const next = [...done, lesson.id];
    setDone(next);
    saveDone(next);
  };

  if (track && lesson) {
    const idx = track.lessons.findIndex((l) => l.id === lesson.id);
    const next = track.lessons[idx + 1];
    return (
      <div ref={topRef} className="px-4 py-4 space-y-4 pb-28">
        <button
          onClick={() => setLesson(null)}
          className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {track.title}
        </button>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            {track.title} · Lesson {idx + 1} of {track.lessons.length}
          </p>
          <h2 className="text-lg font-extrabold text-white">{lesson.title}</h2>
        </div>
        <div className="space-y-2">
          {lesson.body.map((p, i) => (
            <p key={i} className="text-sm text-slate-300 leading-relaxed">
              {p}
            </p>
          ))}
          <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            Kwa kifupi: {lesson.sw}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-[11px] font-bold text-slate-300">Try it yourself</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCode(lesson.code);
                  setRunKey(0);
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                aria-label="Reset code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRunKey((k) => k + 1)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Run
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full min-h-[180px] bg-slate-950 text-slate-100 font-mono text-xs p-3 outline-none resize-y"
          />
          <div className="border-t border-slate-800 bg-slate-900/60">
            <Runner lang={track.lang} code={code} runKey={runKey} />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-[11px] font-bold text-amber-300 mb-0.5">Your turn</p>
          <p className="text-xs text-slate-300">{lesson.task}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markDone}
            className={`flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 ${
              done.includes(lesson.id) ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-100 border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> {done.includes(lesson.id) ? 'Completed' : 'Mark as done'}
          </button>
          {next && (
            <button
              onClick={() => {
                markDone();
                open(track, next);
              }}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
            >
              Next lesson <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (track) {
    return (
      <div className="px-4 py-4 space-y-3 pb-28">
        <button onClick={() => setTrack(null)} className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> All courses
        </button>
        <h2 className="text-lg font-extrabold text-white">{track.title}</h2>
        <p className="text-xs text-slate-400">{track.tagline}</p>
        <div className="space-y-2">
          {track.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => open(track, l)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                {done.includes(l.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : i + 1}
              </span>
              <span className="flex-1 text-sm font-semibold text-slate-100">{l.title}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 pb-28">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-extrabold text-white">Learn</h2>
      </div>
      <p className="text-xs text-slate-400">
        Short lessons with examples you can edit and run right on your phone. Jifunze hatua kwa hatua.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {LEARN_TRACKS.map((t) => {
          const d = t.lessons.filter((l) => done.includes(l.id)).length;
          return (
            <button
              key={t.id}
              onClick={() => setTrack(t)}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold ${t.color}`}>{t.title}</span>
                <span className="text-[11px] text-slate-500">
                  {d}/{t.lessons.length} done
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{t.tagline}</p>
              <div className="h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(d / t.lessons.length) * 100}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LearnScreen;
