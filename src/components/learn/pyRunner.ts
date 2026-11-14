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
}

/** Runs Python code in a fresh namespace and returns what it printed and the last lines of any error. */
export async function runPython(code: string): Promise<PyResult> {
  const py = await getPyodide();
  let buf = '';
  py.setStdout({ batched: (s: string) => (buf += s + '\n') });
  py.setStderr({ batched: (s: string) => (buf += s + '\n') });
  let err = '';
  try {
    const ns = py.globals.get('dict')();
    await py.runPythonAsync(code, { globals: ns });
    ns.destroy?.();
  } catch (e: any) {
    err = String(e?.message || e).trim().split('\n').slice(-3).join('\n');
  }
  return { out: buf.trimEnd(), err };
}
