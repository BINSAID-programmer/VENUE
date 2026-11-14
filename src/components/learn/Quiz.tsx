import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface QuizItem {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export const Quiz: React.FC<{
  lessonId: string;
  items: QuizItem[];
  solved: Record<string, boolean>;
  onCorrect: (key: string) => void;
}> = ({ lessonId, items, solved, onCorrect }) => {
  const [picked, setPicked] = useState<Record<number, number>>({});

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold text-slate-100 border-l-4 border-violet-500 pl-2">Test yourself</h3>
      {items.map((it, i) => {
        const key = `${lessonId}:${i}`;
        const choice = picked[i];
        const answered = choice !== undefined;
        return (
          <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 space-y-2">
            <p className="text-xs text-slate-100 font-semibold">
              {i + 1}. {it.q}
            </p>
            <div className="space-y-1.5">
              {it.options.map((o, k) => {
                const isRight = k === it.answer;
                const isPicked = choice === k;
                const cls = !answered
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : isRight
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : isPicked
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500';
                return (
                  <button
                    key={k}
                    disabled={answered}
                    onClick={() => {
                      setPicked((p) => ({ ...p, [i]: k }));
                      if (k === it.answer) onCorrect(key);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 cursor-pointer ${cls}`}
                  >
                    <span className="flex-1 whitespace-pre-wrap">{o}</span>
                    {answered && isRight && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    {answered && isPicked && !isRight && <XCircle className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className="text-xs text-slate-300 leading-relaxed">
                <b className={choice === it.answer ? 'text-emerald-300' : 'text-rose-300'}>
                  {choice === it.answer ? (solved[key] ? 'Correct!' : 'Correct! +5 XP') : 'Not quite.'}
                </b>{' '}
                {it.why}
              </p>
            )}
            {answered && choice !== it.answer && (
              <button
                onClick={() => setPicked((p) => {
                  const n = { ...p };
                  delete n[i];
                  return n;
                })}
                className="text-[11px] font-bold text-blue-300 cursor-pointer"
              >
                Try again
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
