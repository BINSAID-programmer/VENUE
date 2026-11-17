const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

let pyodidePromise: Promise<any> | null = null;

export function getPyodide(): Promise<any> {
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

export interface PyResult {
  out: string;
  err: string;
  /** line number of the last frame of the user's code in the traceback, when Python reported one */
  errLine?: number;
  /** e.g. "NameError" */
  errType?: string;
  /** the full traceback text */
  trace?: string;
  ms?: number;
}

/**
 * Runs Python code in a fresh namespace and returns what it printed and the last lines of any error.
 * `stdinLines` are handed to input() first, one per call; when they run out Python asks through a prompt box.
 */
export async function runPython(code: string, stdinLines: string[] = []): Promise<PyResult> {
  const py = await getPyodide();
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let buf = '';
  py.setStdout({ batched: (s: string) => (buf += s + '\n') });
  py.setStderr({ batched: (s: string) => (buf += s + '\n') });
  const queue = stdinLines.slice();
  py.setStdin({
    stdin: () => {
      if (queue.length > 0) return queue.shift() as string;
      return (typeof window !== 'undefined' ? window.prompt('Python is asking for input():') : null) ?? '';
    },
  });
  let err = '';
  let errLine: number | undefined;
  let errType: string | undefined;
  let trace: string | undefined;
  try {
    const ns = py.globals.get('dict')();
    await py.runPythonAsync(code, { globals: ns });
    ns.destroy?.();
  } catch (e: any) {
    const full = String(e?.message || e).trim();
    trace = full;
    err = full.split('\n').slice(-3).join('\n');
    const lines = Array.from(full.matchAll(/File "<exec>", line (\d+)/g));
    if (lines.length > 0) errLine = parseInt(lines[lines.length - 1][1], 10);
    else {
      const syn = full.match(/line (\d+)/);
      if (syn) errLine = parseInt(syn[1], 10);
    }
    const last = full.split('\n').filter(Boolean).pop() || '';
    const t = last.match(/^([A-Za-z_][\w.]*(?:Error|Exception|Warning|Interrupt|Exit))\b/);
    if (t) errType = t[1];
  }
  const ms = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - started);
  return { out: buf.trimEnd(), err, errLine, errType, trace, ms };
}
