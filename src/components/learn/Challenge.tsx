import React, { useState } from 'react';
import { Loader2, Play, CheckCircle2, XCircle, Lightbulb, Eye } from 'lucide-react';
import { runPython } from './pyRunner';
import { CodeBlock, CodeEditor } from './highlight';

export interface ChallengeData {
  prompt: string;
  starter: string;
  /** Python that raises AssertionError (with a message) when the learner's code is wrong. */
  check: string;
  hint: string;
  solution: string;
}

export const Challenge: React.FC<{
  id: string;
  data: ChallengeData;
  solved: boolean;
  onSolved: (id: string) => void;
}> = ({ id, data, solved, onSolved }) => {
  const [code, setCode] = useState(data.starter);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [hint, setHint] = useState(false);
  const [sol, setSol] = useState(false);

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await runPython(`${code}\n\n# ---- checks ----\n${data.check}\n`);
      if (r.err) {
        const last = r.err.split('\n').filter(Boolean).pop() || r.err;
        const isAssert = /AssertionError/.test(r.err);
        setResult({ ok: false, text: isAssert ? last.replace(/^.*AssertionError:?\s*/, '') || 'Not correct yet.' : r.err });
      } else {
        setResult({ ok: true, text: solved ? 'Correct again!' : 'Correct! +20 XP' });
        onSolved(id);
      }
    } catch (e: any) {
      setResult({ ok: false, text: e?.message || 'Could not run Python.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-extrabold text-slate-100 border-l-4 border-emerald-500 pl-2 flex items-center gap-2">
        Coding challenge {solved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      </h3>
      <p className="text-sm text-slate-300 leading-relaxed">{data.prompt}</p>
      <CodeEditor value={code} onChange={setCode} lang="python" title="Your code" minLines={6} right={<span />} />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={run}
          disabled={busy}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Check my code
        </button>
        <button onClick={() => setHint((h) => !h)} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
        <button onClick={() => setSol((h) => !h)} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer">
          <Eye className="w-3.5 h-3.5" /> Solution
        </button>
      </div>
      {result && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border whitespace-pre-wrap ${
            result.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span>{result.text}</span>
        </div>
      )}
      {hint && <CodeBlock code={data.hint} lang="python" title="Hint" />}
      {sol && <CodeBlock code={data.solution} lang="python" title="Solution" />}
    </div>
  );
};
