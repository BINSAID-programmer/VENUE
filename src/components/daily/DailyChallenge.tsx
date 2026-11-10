import React, { useEffect, useState } from 'react';
import { Flame, Zap, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Course } from '../../types';
import { dailyService, DailyState, DailyQuestionPublic, DailyResult } from '../../services/dailyService';

interface Props {
  courses: Course[];
}

/** Home card + full-screen sheet for the 5-question Daily Challenge. */
export const DailyChallenge: React.FC<Props> = ({ courses }) => {
  const [state, setState] = useState<DailyState | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = () => void dailyService.getState().then(setState);
    load();
    return dailyService.onChange(load);
  }, []);

  if (!state) return null;

  return (
    <>
      <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-slate-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Flame className={`w-6 h-6 ${state.streak > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">
                {state.streak} {state.streak === 1 ? 'day' : 'days'} streak
              </p>
              <p className="text-[11px] text-slate-400">
                Level {state.level} · {state.xp} XP · {state.xpToNext} XP to next level
              </p>
            </div>
          </div>
          <Zap className="w-5 h-5 text-amber-300" />
        </div>
        {state.doneToday ? (
          <p className="text-xs text-emerald-300 font-semibold">
            Done for today: {state.todayScore}/5. Come back tomorrow to keep your streak.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold cursor-pointer"
          >
            Start today&apos;s challenge (5 questions)
          </button>
        )}
      </section>
      {open && <ChallengeSheet courses={courses} onClose={() => setOpen(false)} />}
    </>
  );
};

const ChallengeSheet: React.FC<{ courses: Course[]; onClose: () => void }> = ({ courses, onClose }) => {
  const [course, setCourse] = useState<Course | null>(courses.length === 1 ? courses[0] : null);
  const [questions, setQuestions] = useState<DailyQuestionPublic[] | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<DailyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const begin = async (c: Course) => {
    setCourse(c);
    setBusy(true);
    setError('');
    try {
      const r = await dailyService.start(c.code, c.title);
      if (r.alreadyDone) {
        setError('You have already completed today\'s challenge.');
      } else {
        setQuestions(r.questions);
        setAnswers([]);
        setIndex(0);
      }
    } catch (e: any) {
      setError(e?.message || 'Could not load the challenge.');
      setCourse(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (courses.length === 1) void begin(courses[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = async (opt: number) => {
    if (!questions || !course) return;
    const next = [...answers, opt];
    setAnswers(next);
    if (next.length < questions.length) {
      setIndex(next.length);
      return;
    }
    setBusy(true);
    try {
      setResult(await dailyService.submit(course.code, next));
    } catch (e: any) {
      setError(e?.message || 'Could not save your answers.');
    } finally {
      setBusy(false);
    }
  };

  const q = questions?.[index];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm overflow-y-auto overscroll-contain">
      <div className="max-w-lg mx-auto p-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Daily Challenge{course ? ` · ${course.code}` : ''}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-sm text-rose-300 mb-3">{error}</p>}

        {!course && !result && (
          <div className="space-y-2">
            <p className="text-sm text-slate-300">Choose a course for today&apos;s questions:</p>
            {courses.length === 0 && <p className="text-xs text-slate-400">Enrol in a course first (My Courses).</p>}
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => begin(c)}
                className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white cursor-pointer"
              >
                <b>{c.code}</b> <span className="text-slate-400">{c.title}</span>
              </button>
            ))}
          </div>
        )}

        {busy && !result && (
          <div className="py-12 flex flex-col items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin" />
            {questions ? 'Checking…' : 'Preparing your questions…'}
          </div>
        )}

        {!busy && q && !result && (
          <div className="space-y-3">
            <div className="flex gap-1">
              {questions!.map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-amber-400' : 'bg-slate-700'}`} />
              ))}
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {index + 1}. {q.q}
            </p>
            {q.options.map((o, i) => (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-sm text-slate-100 cursor-pointer"
              >
                {o}
              </button>
            ))}
            <p className="text-[10px] text-slate-500">Questions are AI-generated. Check anything doubtful with your notes.</p>
          </div>
        )}

        {result && questions && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <p className="text-3xl font-extrabold text-white">
                {result.score}/{result.total}
              </p>
              <p className="text-sm text-amber-200 mt-1">
                {result.xpGained > 0 ? `+${result.xpGained} XP` : 'No extra XP (already earned today)'} · {result.state.streak}-day streak
              </p>
            </div>
            {questions.map((qq, i) => (
              <div key={i} className="rounded-xl bg-slate-900 border border-slate-800 p-3 space-y-1">
                <p className="text-xs font-semibold text-white flex gap-1.5">
                  {result.results[i].correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  {qq.q}
                </p>
                {!result.results[i].correct && (
                  <p className="text-[11px] text-slate-400">Your answer: {qq.options[answers[i]]}</p>
                )}
                <p className="text-[11px] text-emerald-300">Correct: {qq.options[result.results[i].correctIndex]}</p>
                <p className="text-[11px] text-slate-400">{result.results[i].explanation}</p>
              </div>
            ))}
            <button type="button" onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-bold cursor-pointer">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
