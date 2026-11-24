import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, GraduationCap, Menu, X, Lightbulb, Flame, Star, Search, Bookmark, Bot, Award } from 'lucide-react';
import { wrapHtml, wrapJs } from '../learn/wrap';
import { Ide } from '../learn/Ide';
import { useLearnStats, levelOf } from '../learn/learnStats';
import { Quiz } from '../learn/Quiz';
import { Challenge } from '../learn/Challenge';
import { CertificateModal } from '../learn/Certificate';
import { CodeBlock, CodeLang } from '../learn/highlight';
import { LEARN_TRACKS, LearnLesson, LearnSection, LearnTrack } from '../../data/learnLessons';
import { Figure, LearnTable, Steps, VideoCard } from '../learn/Figure';
import LEARN_OUTPUTS from '../../data/learnOutputs.json';

const STORE_KEY = 'venue_learn_done_v1';

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

const POS_KEY = 'venue_learn_pos_v1';

function loadPos(): { t: string; l: number } {
  try {
    const v = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
    if (v && typeof v.t === 'string' && typeof v.l === 'number') return v;
  } catch {
    /* ignore */
  }
  return { t: LEARN_TRACKS[0].id, l: 0 };
}

/** A lesson is shown as sections; older lessons are turned into one section on the fly. */
function sectionsOf(l: LearnLesson): LearnSection[] {
  if (l.sections && l.sections.length) return l.sections;
  return [{ h: 'Explained', p: l.body, code: l.code }];
}

export const LearnScreen: React.FC = () => {
  const initial = loadPos();
  const [trackId, setTrackId] = useState(LEARN_TRACKS.some((t) => t.id === initial.t) ? initial.t : LEARN_TRACKS[0].id);
  const track = LEARN_TRACKS.find((t) => t.id === trackId)!;
  const [idx, setIdx] = useState(Math.min(initial.l, track.lessons.length - 1));
  const lesson = track.lessons[idx];
  const [menu, setMenu] = useState(false);
  const [cert, setCert] = useState(false);
  const [tryCode, setTryCode] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>(loadDone);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const { stats, liveStreak, award, markQuiz, markChallenge, toggleBookmark } = useLearnStats();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify({ t: trackId, l: idx }));
    } catch {
      /* ignore */
    }
    window.scrollTo?.({ top: 0 });
  }, [trackId, idx]);

  const go = (i: number) => {
    if (i < 0 || i >= track.lessons.length) return;
    setIdx(i);
    setMenu(false);
  };
  const switchTrack = (id: string) => {
    setTrackId(id);
    setIdx(0);
    setMenu(false);
  };
  const markDone = () => {
    if (done.includes(lesson.id)) return;
    const next = [...done, lesson.id];
    setDone(next);
    saveDone(next);
    award(10);
  };
  const bmKey = `${trackId}:${lesson.id}`;
  const lv = levelOf(stats.xp);
  const results = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [] as Array<{ t: LearnTrack; i: number }>;
    const out: Array<{ t: LearnTrack; i: number }> = [];
    for (const t of LEARN_TRACKS)
      t.lessons.forEach((l, i) => {
        const hay = [l.title, l.sw, ...(l.sections || []).flatMap((s) => [s.h, ...s.p]), ...l.body].join(' ').toLowerCase();
        if (hay.includes(term)) out.push({ t, i });
      });
    return out.slice(0, 30);
  }, [q]);
  const openTry = (c: string) => {
    setTryCode(c);
  };

  const NavButtons = (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => go(idx - 1)}
        disabled={idx === 0}
        className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 flex items-center gap-1 cursor-pointer disabled:opacity-30"
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>
      <span className="text-[11px] text-slate-500">
        {idx + 1} / {track.lessons.length}
      </span>
      <button
        onClick={() => {
          markDone();
          go(idx + 1);
        }}
        disabled={idx === track.lessons.length - 1}
        className="px-3 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white flex items-center gap-1 cursor-pointer disabled:opacity-30"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="pb-28">
      {/* Language tabs */}
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto">
          <button
            onClick={() => setMenu(true)}
            className="shrink-0 p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
            aria-label="Topics"
          >
            <Menu className="w-4 h-4" />
          </button>
          {LEARN_TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTrack(t.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer ${
                t.id === trackId ? t.color : 'text-slate-400 bg-slate-900 border-slate-800'
              }`}
            >
              {t.title}
            </button>
          ))}
          <button
            onClick={() => setSearching(true)}
            className="shrink-0 p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
            aria-label="Search lessons"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 px-3 pb-2 text-[11px]">
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <Flame className="w-3.5 h-3.5" /> {liveStreak} day{liveStreak === 1 ? '' : 's'}
          </span>
          <span className="flex items-center gap-1 text-yellow-300 font-bold">
            <Star className="w-3.5 h-3.5" /> {stats.xp} XP
          </span>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-slate-400 font-bold">Lv {lv.level}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (lv.into / lv.need) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-start gap-2">
          <GraduationCap className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{lesson.chapter || `${track.title} tutorial`}</p>
            <h2 className="text-xl font-extrabold text-white leading-tight">{lesson.title}</h2>
          </div>
          <button
            onClick={() => toggleBookmark(bmKey)}
            className="ml-auto p-2 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
            aria-label="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${stats.bookmarks.includes(bmKey) ? 'text-amber-300 fill-amber-300' : 'text-slate-300'}`} />
          </button>
        </div>
        {NavButtons}

        {sectionsOf(lesson).map((sec, i) => (
          <section key={i} className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-100 border-l-4 border-blue-500 pl-2">{sec.h}</h3>
            {sec.p.map((t, k) => (
              <p key={k} className="text-sm text-slate-300 leading-relaxed">
                {t}
              </p>
            ))}
            {sec.fig && <Figure name={sec.fig} />}
            {sec.table && <LearnTable head={sec.table.head} rows={sec.table.rows} />}
            {sec.steps && <Steps items={sec.steps} />}
            {sec.video && <VideoCard id={sec.video.id} title={sec.video.title} by={sec.video.by} />}
            {sec.tip && (
              <p className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">💡 {sec.tip}</p>
            )}
            {sec.code && (
              <div className="space-y-2">
                <CodeBlock code={sec.code} lang={track.lang as CodeLang} title={`Example · ${track.lang === 'python' ? 'Python' : track.lang === 'js' ? 'JavaScript' : 'HTML'}`} />
                {(track.lang === 'html' || track.lang === 'js') && (
                  <div style={{ border: '1px solid #26304f', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                    <div style={{ background: '#111833', color: '#6b7a99', fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: '4px 12px', textTransform: 'uppercase' }}>Result</div>
                    <iframe
                      title="Result"
                      sandbox="allow-scripts"
                      srcDoc={track.lang === 'js' ? wrapJs(sec.code) : wrapHtml(sec.code)}
                      style={{ width: '100%', height: 170, border: 0, background: '#fff', display: 'block' }}
                    />
                  </div>
                )}
                {(LEARN_OUTPUTS as Record<string, string>)[sec.code] !== undefined && (
                  <div style={{ background: '#070b16', border: '1px solid #26304f', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ background: '#111833', color: '#6b7a99', fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: '4px 12px', textTransform: 'uppercase' }}>Output</div>
                    <pre data-lpre="1" style={{ margin: 0, padding: '8px 14px', color: '#c5f6a0', ['--lc' as string]: '#c5f6a0', fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12.5, lineHeight: '20px', overflowX: 'auto', whiteSpace: 'pre' }}>{(LEARN_OUTPUTS as Record<string, string>)[sec.code] || '(no output)'}</pre>
                  </div>
                )}
                <div>
                  <button
                    onClick={() => openTry(sec.code!)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Try it Yourself »
                  </button>
                </div>
              </div>
            )}
            {sec.explain && sec.explain.length > 0 && (
              <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-blue-300">How it works</p>
                {sec.explain.map((e, k) => (
                  <p key={k} className="text-xs text-slate-300 leading-relaxed">
                    <span className="text-blue-400 font-bold">{k + 1}.</span> {e}
                  </p>
                ))}
              </div>
            )}
            {sec.note && (
              <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">{sec.note}</p>
            )}
          </section>
        ))}

        {lesson.mistakes && lesson.mistakes.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <p className="text-[11px] font-bold text-amber-300">Common mistakes</p>
            {lesson.mistakes.map((m, i) => (
              <p key={i} className="text-xs text-slate-300 leading-relaxed">• {m}</p>
            ))}
          </div>
        )}

        <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          Kwa kifupi: {lesson.sw}
        </p>

        <button
          type="button"
          onClick={() => {
            const text = `Explain "${lesson.title}" (${track.title}) step by step with a simple example. I am a first-year student and I want to understand it deeply.`;
            try { sessionStorage.setItem('venue:tutor-prefill', text); } catch { /* ignore */ }
            window.dispatchEvent(new CustomEvent('venue:open-tutor'));
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-sm font-bold cursor-pointer"
        >
          <Bot className="w-4 h-4" /> Ask AI Tutor about this lesson
        </button>

        {lesson.exercises && lesson.exercises.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-100 border-l-4 border-blue-500 pl-2">Practice</h3>
            {lesson.exercises.map((ex, i) => {
              const key = `${lesson.id}-${i}`;
              return (
                <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 space-y-2">
                  <p className="text-xs text-slate-200">
                    <b>{i + 1}.</b> {ex.q}
                  </p>
                  <button
                    onClick={() => setShown((m) => ({ ...m, [key]: !m[key] }))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-100 cursor-pointer"
                  >
                    {shown[key] ? 'Hide answer' : 'Show answer'}
                  </button>
                  {shown[key] && (
                    <>
                      {track.lang === 'text' ? (
                        <p className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 leading-relaxed">{ex.a}</p>
                      ) : (
                        <>
                          <CodeBlock code={ex.a} lang={track.lang as CodeLang} title="Answer" />
                          <button
                            onClick={() => openTry(ex.a)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Try it Yourself »
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {lesson.challenge && (
          <Challenge
            key={lesson.id}
            id={`${lesson.id}:c`}
            data={lesson.challenge}
            lang={track.lang === 'html' ? 'html' : track.lang === 'js' ? 'js' : 'python'}
            solved={!!stats.challenges[`${lesson.id}:c`]}
            onSolved={markChallenge}
          />
        )}

        {lesson.quiz && lesson.quiz.length > 0 && (
          <Quiz key={lesson.id} lessonId={lesson.id} items={lesson.quiz} solved={stats.quiz} onCorrect={markQuiz} />
        )}

        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex gap-2">
          <Lightbulb className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-blue-300 mb-0.5">Your turn</p>
            <p className="text-xs text-slate-300">{lesson.task}</p>
          </div>
        </div>

        <button
          onClick={markDone}
          className={`w-full py-3 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 ${
            done.includes(lesson.id) ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-100 border border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> {done.includes(lesson.id) ? 'Completed' : 'Mark as done'}
        </button>
        {NavButtons}
      </div>

      {/* Search */}
      {searching && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <div className="flex items-center gap-2 p-3 border-b border-slate-800 bg-slate-900">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search all lessons (e.g. list, loop, f-string)"
              className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
            />
            <button
              onClick={() => {
                setSearching(false);
                setQ('');
              }}
              className="p-1.5 text-slate-400 cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {q.trim().length < 2 && stats.bookmarks.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bookmarks</p>
                {stats.bookmarks.map((b) => {
                  const [tid, lid] = b.split(':');
                  const t = LEARN_TRACKS.find((x) => x.id === tid);
                  const i = t ? t.lessons.findIndex((l) => l.id === lid) : -1;
                  if (!t || i < 0) return null;
                  return (
                    <button
                      key={b}
                      onClick={() => {
                        setTrackId(t.id);
                        setIdx(i);
                        setSearching(false);
                        setQ('');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 inline mr-1.5 text-amber-300 fill-amber-300" />
                      {t.title} · {t.lessons[i].title}
                    </button>
                  );
                })}
              </>
            )}
            {q.trim().length >= 2 && results.length === 0 && <p className="text-xs text-slate-500 p-2">No lesson matches “{q}”.</p>}
            {results.map(({ t, i }) => (
              <button
                key={t.id + i}
                onClick={() => {
                  setTrackId(t.id);
                  setIdx(i);
                  setSearching(false);
                  setQ('');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <span className="text-[10px] uppercase tracking-wider text-slate-500">{t.title}</span>
                <span className="block text-xs font-semibold text-slate-100">{t.lessons[i].title}</span>
                <span className="block text-[11px] text-slate-400">{t.lessons[i].sw}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topic menu (slide-in) */}
      {menu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[80%] h-full bg-slate-950 border-r border-slate-800 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 sticky top-0 bg-slate-950">
              <span className="text-sm font-extrabold text-white">{track.title} topics</span>
              <button onClick={() => setMenu(false)} className="p-1.5 text-slate-400 cursor-pointer" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            {(() => {
              const n = track.lessons.filter((l) => done.includes(l.id)).length;
              const all = n === track.lessons.length;
              return (
                <div className="mx-2 mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Certificate: {n} / {track.lessons.length} lessons done
                  </p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(n / track.lessons.length) * 100}%` }} />
                  </div>
                  <button
                    onClick={() => {
                      setMenu(false);
                      setCert(true);
                    }}
                    disabled={!all}
                    className="mt-2 w-full py-2 rounded-lg bg-amber-400 text-slate-900 text-xs font-extrabold cursor-pointer disabled:opacity-40"
                  >
                    {all ? 'Get my certificate' : 'Finish every lesson to unlock'}
                  </button>
                </div>
              );
            })()}
            <div className="p-2 space-y-1">
              {track.lessons.map((l, i) => (
                <React.Fragment key={l.id}>
                {l.chapter && l.chapter !== track.lessons[i - 1]?.chapter && (
                  <p className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-300">{l.chapter}</p>
                )}
                <button
                  onClick={() => go(i)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs cursor-pointer ${
                    i === idx ? 'bg-blue-600/20 text-white font-bold' : 'text-slate-300'
                  }`}
                >
                  {done.includes(l.id) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-4 text-center text-slate-500 shrink-0">{i + 1}</span>
                  )}
                  <span className="flex-1">{l.title}</span>
                </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMenu(false)} />
        </div>
      )}

      {cert && <CertificateModal track={track.title} lessons={track.lessons.length} onClose={() => setCert(false)} />}

      {/* Try it Yourself: full IDE */}
      {tryCode !== null && (
        <Ide
          key={tryCode}
          initialCode={tryCode}
          lang={track.lang as CodeLang}
          onClose={() => setTryCode(null)}
        />
      )}
    </div>
  );
};

export default LearnScreen;
