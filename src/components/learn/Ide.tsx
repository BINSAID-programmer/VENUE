import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  X,
  RotateCcw,
  Copy,
  Check,
  Download,
  Minus,
  Plus,
  Trash2,
  Smartphone,
  Tablet,
  Monitor,
  Terminal,
  Eye,
  Loader2,
  CornerDownLeft,
  Undo2,
  Redo2,
  ArrowLeft,
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { C, tokenize, CodeLang } from './tokenize';
import { runPython, PyResult } from './pyRunner';
import { previewHtml } from './wrap';

/* ------------------------------------------------------------------ constants */

const FONT = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const PREF_KEY = 'venue_ide_prefs_v1';

const FILE_NAME: Record<CodeLang, string> = { python: 'main.py', html: 'index.html', js: 'script.js' };
const LANG_LABEL: Record<CodeLang, string> = { python: 'Python 3.12', html: 'HTML5 + CSS', js: 'JavaScript' };
const MIME: Record<CodeLang, string> = { python: 'text/x-python', html: 'text/html', js: 'text/javascript' };

const WORDS: Record<CodeLang, string[]> = {
  python: (
    'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case ' +
    'print len range input int float str bool list dict set tuple sum min max abs round sorted reversed enumerate zip open type isinstance map filter any all divmod pow format super object ' +
    'append extend insert remove pop clear index count sort reverse copy keys values items get update add discard union intersection difference join split strip lstrip rstrip lower upper title capitalize replace find startswith endswith isdigit isalpha center ljust rjust zfill read readline readlines write close ' +
    'Exception ValueError TypeError KeyError IndexError ZeroDivisionError FileNotFoundError NameError AttributeError StopIteration ' +
    'random randint choice shuffle math sqrt floor ceil pi datetime timedelta json dumps loads csv os path sys re findall sub match statistics mean median mode stdev collections Counter defaultdict itertools __init__ __name__ __main__ self return unittest assertEqual'
  ).split(' '),
  js: (
    'const let var function return if else for while do break continue switch case default new class extends import from export async await try catch finally throw typeof instanceof in of this null undefined true false ' +
    'console log document window Math JSON Array Object String Number Boolean Date Promise setTimeout setInterval fetch then ' +
    'querySelector querySelectorAll getElementById getElementsByClassName createElement appendChild addEventListener removeEventListener innerHTML textContent classList style value ' +
    'forEach map filter reduce find includes indexOf push pop shift unshift slice splice join split length parseInt parseFloat toFixed random floor ceil round max min keys values entries stringify parse'
  ).split(' '),
  html: (
    'html head body title meta link style script div span p a img ul ol li table thead tbody tr td th form input button label select option textarea h1 h2 h3 h4 h5 h6 header footer nav main section article aside figure figcaption video audio source iframe br hr strong em code pre blockquote ' +
    'class id href src alt type name value placeholder required disabled checked target rel width height style onclick lang charset content viewport ' +
    'display flex grid block inline-block none position relative absolute fixed sticky top left right bottom z-index justify-content align-items flex-direction flex-wrap gap space-between center column row ' +
    'background background-color color font-family font-size font-weight line-height text-align text-decoration text-transform letter-spacing margin padding border border-radius box-shadow box-sizing width max-width min-width max-height overflow opacity transition transform translate scale rotate animation keyframes hover focus active ' +
    'grid-template-columns repeat auto-fit minmax fr px rem em vh vw solid dashed linear-gradient media prefers-color-scheme'
  ).split(' '),
};

const SYMBOLS: Record<CodeLang, string[]> = {
  python: ['(', ')', '[', ']', '{', '}', '"', "'", ':', '=', '+', '-', '*', '/', '%', '#', '_', ',', '.', '<', '>', '!', '&', '|', '\\'],
  js: ['(', ')', '[', ']', '{', '}', '"', "'", '`', ';', '=', '+', '-', '*', '/', '.', ',', '<', '>', '!', '&', '|', '_', '$'],
  html: ['<', '>', '/', '"', "'", '=', '(', ')', '{', '}', ':', ';', '#', '.', ',', '-', '_', '%', '!', '&'],
};

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr']);
const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);

interface Prefs {
  fs: number;
  split: number;
  live: boolean;
}
const loadPrefs = (): Prefs => {
  try {
    const v = JSON.parse(localStorage.getItem(PREF_KEY) || 'null');
    if (v && typeof v.fs === 'number') return { fs: v.fs, split: typeof v.split === 'number' ? v.split : 0.5, live: v.live !== false };
  } catch {
    /* storage unavailable */
  }
  return { fs: 13, split: 0.5, live: true };
};

const HINTS: Record<string, string> = {
  NameError: 'A name is used before it exists. Check the spelling and capital letters, and create the variable before using it. (Jina halijatengenezwa: angalia tahajia.)',
  SyntaxError: 'Python could not read this line. Look for a missing colon :, bracket ) or quotation mark " on this line or the one above. (Kosa la uandishi.)',
  IndentationError: 'The spaces at the start of the line are wrong. Lines inside a block must use the same 4 spaces. (Nafasi mwanzoni mwa mstari si sahihi.)',
  TypeError: 'You mixed types that do not go together, such as text + number. Convert with int(), float() or str(). (Aina za data hazilingani.)',
  ValueError: 'The value has the right type but a wrong content, e.g. int("abc"). Check what the user typed. (Thamani si sahihi.)',
  ZeroDivisionError: 'You divided by zero. Check the number you divide by. (Umegawanya kwa sifuri.)',
  IndexError: 'The position is outside the list. Positions start at 0 and the last one is len(list) - 1. (Nafasi haipo kwenye list.)',
  KeyError: 'That key is not in the dictionary. Check the spelling or use dict.get(key). (Key haipo.)',
  AttributeError: 'This object has no such method or attribute. Check the spelling and the type of the object. (Object haina hiyo method.)',
  ModuleNotFoundError: 'This module is not available in the browser version of Python. (Module hii haipo hapa.)',
  FileNotFoundError: 'The file does not exist here. In this browser editor files must be created first. (Faili haipo.)',
};

/* ------------------------------------------------------------------ small helpers */

const isWordCh = (c: string) => /[\w]/.test(c || '');

function lineColOf(text: string, pos: number): { line: number; col: number } {
  const before = text.slice(0, pos);
  const line = before.split('\n').length;
  const col = pos - (before.lastIndexOf('\n') + 1) + 1;
  return { line, col };
}

const Btn: React.FC<{
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  tone?: 'run' | 'plain';
}> = ({ onClick, label, children, active, disabled, tone = 'plain' }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      height: 32,
      minWidth: 32,
      padding: '0 9px',
      borderRadius: 9,
      border: `1px solid ${tone === 'run' ? '#16a34a' : active ? '#3b82f6' : C.line}`,
      background: tone === 'run' ? '#16a34a' : active ? 'rgba(59,130,246,.18)' : '#161f3d',
      color: tone === 'run' ? '#fff' : active ? '#bfdbfe' : '#c7d2ee',
      fontSize: 12,
      fontWeight: 800,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------ the IDE */

export const Ide: React.FC<{
  initialCode: string;
  lang: CodeLang;
  onClose: () => void;
  title?: string;
}> = ({ initialCode, lang, onClose, title }) => {
  const prefs0 = useMemo(loadPrefs, []);
  const [code, setCode] = useState(initialCode);
  const [fs, setFs] = useState(prefs0.fs);
  const [split, setSplit] = useState(prefs0.split);
  const [live, setLive] = useState(prefs0.live);
  const [mode, setMode] = useState<'split' | 'editor' | 'output'>('split');
  const [caret, setCaret] = useState({ line: 1, col: 1 });
  const [sel, setSel] = useState({ a: 0, b: 0 });
  const [errLine, setErrLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [vh, setVh] = useState<number>(typeof window !== 'undefined' ? window.visualViewport?.height ?? window.innerHeight : 700);

  // python
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PyResult | null>(null);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [runs, setRuns] = useState(0);

  // web preview
  const [srcDoc, setSrcDoc] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [device, setDevice] = useState<'phone' | 'tablet' | 'full'>('full');
  const [webTab, setWebTab] = useState<'preview' | 'console'>('preview');
  const [logs, setLogs] = useState<Array<{ type: string; text: string }>>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ta = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  const LH = Math.round(fs * 1.62);
  const lines = useMemo(() => Math.max(code.split('\n').length, 1), [code]);
  const modified = code !== initialCode;
  const isPy = lang === 'python';

  /* ---- persistence of preferences */
  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({ fs, split, live }));
    } catch {
      /* ignore */
    }
  }, [fs, split, live]);

  /* ---- keep the IDE above the phone keyboard */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => setVh(vv.height);
    vv.addEventListener('resize', on);
    on();
    return () => vv.removeEventListener('resize', on);
  }, []);

  /* ---- lock page scroll behind the IDE */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ---- console messages coming from the preview iframe */
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (!e.data || !e.data.__venue) return;
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      setLogs((l) => [...l.slice(-199), { type: String(e.data.type || 'log'), text: String(e.data.text || '') }]);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);

  /* ---- run */
  const run = useCallback(async () => {
    setErrLine(null);
    if (isPy) {
      if (running) return;
      setRunning(true);
      setShowTrace(false);
      if (mode === 'editor') setMode('split');
      try {
        const r = await runPython(code, stdin.length > 0 ? stdin.split('\n') : []);
        setResult(r);
        setRuns((n) => n + 1);
        if (r.errLine) setErrLine(r.errLine);
      } catch (e: any) {
        setResult({ out: '', err: e?.message || 'Could not run Python.' });
        setRuns((n) => n + 1);
      } finally {
        setRunning(false);
      }
    } else {
      setLogs([]);
      setSrcDoc(previewHtml(code, lang === 'js' ? 'js' : 'html'));
      setPreviewKey((k) => k + 1);
      setRuns((n) => n + 1);
      if (mode === 'editor') setMode('split');
    }
  }, [code, isPy, lang, mode, running, stdin]);

  // First open: web previews appear straight away
  useEffect(() => {
    if (!isPy) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live preview while typing (web only)
  useEffect(() => {
    if (isPy || !live || runs === 0) return;
    const t = window.setTimeout(() => {
      setLogs([]);
      setSrcDoc(previewHtml(code, lang === 'js' ? 'js' : 'html'));
      setPreviewKey((k) => k + 1);
    }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, live]);

  /* ---- editing primitives (they keep the native undo stack working) */
  const replaceRange = (start: number, end: number, text: string, selStart?: number, selEnd?: number) => {
    const el = ta.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(start, end);
    let ok = false;
    try {
      ok = document.execCommand('insertText', false, text);
    } catch {
      ok = false;
    }
    if (!ok) {
      const v = el.value.slice(0, start) + text + el.value.slice(end);
      setCode(v);
    }
    const s = selStart ?? start + text.length;
    const e2 = selEnd ?? s;
    requestAnimationFrame(() => {
      if (ta.current) {
        ta.current.setSelectionRange(s, e2);
        syncCaret();
      }
    });
    el.setSelectionRange(s, e2);
  };

  const syncCaret = () => {
    const el = ta.current;
    if (!el) return;
    setCaret(lineColOf(el.value, el.selectionStart));
    setSel({ a: el.selectionStart, b: el.selectionEnd });
  };

  const lineBounds = (v: string, a: number, b: number) => {
    const start = v.lastIndexOf('\n', a - 1) + 1;
    let end = v.indexOf('\n', b);
    if (end === -1) end = v.length;
    return { start, end };
  };

  const indentSel = (outdent: boolean) => {
    const el = ta.current;
    if (!el) return;
    const v = el.value;
    const { start, end } = lineBounds(v, el.selectionStart, el.selectionEnd);
    const block = v.slice(start, end);
    const next = block
      .split('\n')
      .map((l) => (outdent ? l.replace(/^( {1,4}|\t)/, '') : '    ' + l))
      .join('\n');
    const delta = next.length - block.length;
    const firstDelta = outdent ? -(block.length - block.replace(/^( {1,4}|\t)/, '').length) : 4;
    replaceRange(start, end, next, Math.max(start, el.selectionStart + firstDelta), el.selectionEnd + delta);
  };

  const toggleComment = () => {
    const el = ta.current;
    if (!el) return;
    const v = el.value;
    const { start, end } = lineBounds(v, el.selectionStart, el.selectionEnd);
    const block = v.slice(start, end).split('\n');
    const open = lang === 'python' ? '# ' : lang === 'js' ? '// ' : '<!-- ';
    const close = lang === 'html' ? ' -->' : '';
    const all = block.every((l) => !l.trim() || l.trim().startsWith(open.trim()));
    const next = block
      .map((l) => {
        if (!l.trim()) return l;
        const ind = l.match(/^\s*/)![0];
        const rest = l.slice(ind.length);
        if (all) {
          let r = rest.startsWith(open) ? rest.slice(open.length) : rest.slice(open.trim().length);
          if (close && r.endsWith(close)) r = r.slice(0, -close.length);
          else if (close && r.endsWith(close.trim())) r = r.slice(0, -close.trim().length);
          return ind + r;
        }
        return ind + open + rest + close;
      })
      .join('\n');
    replaceRange(start, end, next, start, start + next.length);
  };

  const moveLine = (dir: -1 | 1) => {
    const el = ta.current;
    if (!el) return;
    const v = el.value;
    const { start, end } = lineBounds(v, el.selectionStart, el.selectionEnd);
    if (dir === -1 && start === 0) return;
    if (dir === 1 && end >= v.length) return;
    const block = v.slice(start, end);
    if (dir === -1) {
      const prevStart = v.lastIndexOf('\n', start - 2) + 1;
      const prev = v.slice(prevStart, start - 1);
      replaceRange(prevStart, end, block + '\n' + prev, prevStart + (el.selectionStart - start), prevStart + (el.selectionEnd - start));
    } else {
      const nextEnd = (() => {
        const i = v.indexOf('\n', end + 1);
        return i === -1 ? v.length : i;
      })();
      const next = v.slice(end + 1, nextEnd);
      const shift = next.length + 1;
      replaceRange(start, nextEnd, next + '\n' + block, el.selectionStart + shift, el.selectionEnd + shift);
    }
  };

  const duplicateLine = () => {
    const el = ta.current;
    if (!el) return;
    const v = el.value;
    const { start, end } = lineBounds(v, el.selectionStart, el.selectionEnd);
    const block = v.slice(start, end);
    replaceRange(end, end, '\n' + block, el.selectionStart + block.length + 1, el.selectionEnd + block.length + 1);
  };

  /** Typing one character the way a real editor does (auto pairs, skipping over closers, wrapping a selection). */
  const typeChar = (ch: string): boolean => {
    const el = ta.current;
    if (!el) return false;
    const v = el.value;
    const a = el.selectionStart;
    const b = el.selectionEnd;
    const before = v[a - 1] || '';
    const after = v[a] || '';

    if (a !== b && PAIRS[ch]) {
      replaceRange(a, b, ch + v.slice(a, b) + PAIRS[ch], a + 1, b + 1);
      return true;
    }
    if (CLOSERS.has(ch) && after === ch && a === b) {
      el.setSelectionRange(a + 1, a + 1); // step over the closer that is already there
      syncCaret();
      return true;
    }
    if (PAIRS[ch] && a === b) {
      const quote = ch === '"' || ch === "'" || ch === '`';
      if (quote && (isWordCh(before) || isWordCh(after))) return false; // apostrophes in words, f"..." etc.
      if (!quote && isWordCh(after)) return false;
      replaceRange(a, a, ch + PAIRS[ch], a + 1, a + 1);
      return true;
    }
    if (ch === '>' && lang === 'html' && a === b) {
      const m = v.slice(0, a).match(/<([a-zA-Z][\w-]*)(?:\s[^<>]*)?$/);
      if (m && !VOID.has(m[1].toLowerCase()) && !/\/$/.test(v.slice(0, a))) {
        replaceRange(a, a, `></${m[1]}>`, a + 1, a + 1);
        return true;
      }
    }
    return false;
  };

  /** Enter: keep the indent, add a level after ":" / "{" / an opening tag, and split a pair of brackets onto three lines. */
  const smartEnter = () => {
    const el = ta.current;
    if (!el) return;
    const v = el.value;
    const a = el.selectionStart;
    const b = el.selectionEnd;
    const lineStart = v.lastIndexOf('\n', a - 1) + 1;
    const cur = v.slice(lineStart, a);
    let indent = cur.match(/^\s*/)?.[0] ?? '';
    const bracketOpen = (lang === 'python' ? /[:(\[{]\s*$/ : /[{(\[]\s*$/).test(cur);
    const tagOpen =
      lang === 'html' && /<(div|ul|ol|section|nav|header|footer|main|table|thead|tbody|tr|form|body|head|html|style|script|article|aside|select)\b[^<>]*>\s*$/i.test(cur);
    const deeper = bracketOpen || tagOpen;
    const nextCh = v[a] || '';
    if ((bracketOpen && nextCh !== '' && PAIRS[v[a - 1] || ''] === nextCh) || (tagOpen && v.slice(a).startsWith('</'))) {
      replaceRange(a, b, '\n' + indent + '    \n' + indent, a + 1 + indent.length + 4);
      return;
    }
    if (deeper) indent += '    ';
    replaceRange(a, b, '\n' + indent);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const v = el.value;
    const a = el.selectionStart;
    const b = el.selectionEnd;
    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key === 'Enter') {
      e.preventDefault();
      run();
      return;
    }
    if (mod && e.key === '/') {
      e.preventDefault();
      toggleComment();
      return;
    }
    if (mod && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      duplicateLine();
      return;
    }
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      moveLine(e.key === 'ArrowUp' ? -1 : 1);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey || v.slice(a, b).includes('\n')) indentSel(e.shiftKey);
      else replaceRange(a, b, '    ');
      return;
    }
    if (e.key === 'Enter' && !mod && !e.shiftKey) {
      e.preventDefault();
      smartEnter();
      return;
    }
    if (e.key === 'Backspace' && a === b && a > 0) {
      const lineStart = v.lastIndexOf('\n', a - 1) + 1;
      const cur = v.slice(lineStart, a);
      if (cur.length > 0 && /^ +$/.test(cur)) {
        const drop = cur.length % 4 === 0 ? 4 : cur.length % 4;
        e.preventDefault();
        replaceRange(a - drop, a, '');
        return;
      }
      const pair = PAIRS[v[a - 1]];
      if (pair && v[a] === pair) {
        e.preventDefault();
        replaceRange(a - 1, a + 1, '');
        return;
      }
    }
    if (e.key.length === 1 && !mod && !e.altKey) {
      if (typeChar(e.key)) e.preventDefault();
    }
  };

  // Phone keyboards often send key "Unidentified", so auto-pairs and Enter are also handled from the beforeinput event.
  const latest = useRef({ typeChar, smartEnter });
  latest.current = { typeChar, smartEnter };
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    const on = (ev: Event) => {
      const e = ev as InputEvent;
      if (e.isComposing) return;
      if (e.inputType === 'insertText' && typeof e.data === 'string' && e.data.length === 1) {
        if (latest.current.typeChar(e.data)) e.preventDefault();
      } else if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
        e.preventDefault();
        latest.current.smartEnter();
      }
    };
    el.addEventListener('beforeinput', on);
    return () => el.removeEventListener('beforeinput', on);
  }, []);

  /* ---- autocomplete */
  const prefix = useMemo(() => {
    if (sel.a !== sel.b) return '';
    const m = code.slice(0, sel.a).match(/[A-Za-z_][\w-]*$/);
    return m ? m[0] : '';
  }, [code, sel]);

  const suggestions = useMemo(() => {
    if (prefix.length < 1) return [] as string[];
    const low = prefix.toLowerCase();
    const seen = new Set<string>();
    const mine = (code.match(/[A-Za-z_][\w]{2,}/g) || []).filter((w) => w !== prefix);
    const out: string[] = [];
    for (const w of [...WORDS[lang], ...mine]) {
      if (w.length > prefix.length && w.toLowerCase().startsWith(low) && !seen.has(w)) {
        seen.add(w);
        out.push(w);
        if (out.length >= 8) break;
      }
    }
    return out;
  }, [prefix, code, lang]);

  const accept = (w: string) => {
    const a = sel.a;
    replaceRange(a - prefix.length, a, w);
  };

  const insertSymbol = (s: string) => {
    const el = ta.current;
    if (!el) return;
    el.focus();
    if (!typeChar(s)) replaceRange(el.selectionStart, el.selectionEnd, s);
  };

  const moveCaret = (d: number) => {
    const el = ta.current;
    if (!el) return;
    el.focus();
    const p = Math.max(0, Math.min(el.value.length, el.selectionStart + d));
    el.setSelectionRange(p, p);
    syncCaret();
  };

  const jumpToLine = (n: number) => {
    const el = ta.current;
    if (!el) return;
    const parts = el.value.split('\n');
    let pos = 0;
    for (let i = 0; i < Math.min(n - 1, parts.length - 1); i++) pos += parts[i].length + 1;
    el.focus();
    el.setSelectionRange(pos, pos);
    syncCaret();
    if (scroller.current) scroller.current.scrollTop = Math.max(0, (n - 3) * LH);
  };

  const reset = () => {
    replaceRange(0, code.length, initialCode, 0, 0);
    setErrLine(null);
    setResult(null);
    setLogs([]);
  };

  const copy = () => {
    try {
      navigator.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([code], { type: MIME[lang] }));
      const a = document.createElement('a');
      a.href = url;
      a.download = FILE_NAME[lang];
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      /* download unavailable */
    }
  };

  /* ---- resizable split */
  const onDragMove = (e: React.PointerEvent) => {
    if (!drag.current || !body.current) return;
    const r = body.current.getBoundingClientRect();
    const ratio = (e.clientY - r.top) / r.height;
    setSplit(Math.max(0.2, Math.min(0.8, ratio)));
  };

  /* ---- render pieces */
  const showEditor = mode !== 'output';
  const showOutput = mode !== 'editor';
  const editorFlex = mode === 'editor' ? 1 : mode === 'output' ? 0 : split;
  const outputFlex = mode === 'output' ? 1 : mode === 'editor' ? 0 : 1 - split;

  const gutter = (
    <pre
      aria-hidden
      data-lpre="g"
      style={{
        margin: 0,
        padding: `10px 8px 10px 10px`,
        fontFamily: FONT,
        fontSize: fs,
        lineHeight: `${LH}px`,
        color: C.gutter,
        ['--lc' as string]: C.gutter,
        textAlign: 'right',
        userSelect: 'none',
        borderRight: `1px solid ${C.line}`,
        flexShrink: 0,
        position: 'sticky',
        left: 0,
        background: C.bg,
        zIndex: 2,
        minWidth: `${String(lines).length + 2}ch`,
      }}
    >
      {Array.from({ length: lines }, (_, i) => {
        const n = i + 1;
        const cur = n === caret.line;
        const bad = n === errLine;
        return (
          <div key={n} style={{ height: LH, color: bad ? '#fb7185' : cur ? '#c7d2ee' : undefined, fontWeight: cur || bad ? 800 : undefined, textDecoration: bad ? 'underline wavy #fb7185' : undefined }}>
            {n}
          </div>
        );
      })}
    </pre>
  );

  const longest = Math.max(30, ...code.split('\n').map((l) => l.length)) + 4;
  const boxStyle: React.CSSProperties = {
    margin: 0,
    padding: '10px 14px 40px',
    fontFamily: FONT,
    fontSize: fs,
    lineHeight: `${LH}px`,
    whiteSpace: 'pre',
    width: `calc(${longest}ch + 28px)`,
    minWidth: '100%',
    height: lines * LH + 50,
    boxSizing: 'border-box',
    tabSize: 4,
  };

  const editor = (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: editorFlex, background: C.bg }}>
      <div ref={scroller} style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', WebkitOverflowScrolling: 'touch' }}>
        {gutter}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          {/* current line and error line highlight */}
          <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 10 + (caret.line - 1) * LH, height: LH, background: 'rgba(148,163,255,.09)', pointerEvents: 'none' }} />
          {errLine && <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 10 + (errLine - 1) * LH, height: LH, background: 'rgba(251,113,133,.16)', borderBottom: '1px dashed #fb7185', pointerEvents: 'none' }} />}
          <pre aria-hidden data-lpre="1" style={{ ...boxStyle, position: 'absolute', top: 0, left: 0, color: C.text, ['--lc' as string]: C.text, pointerEvents: 'none' }}>
            {tokenize(code, lang).map((k, i) => (
              <span key={i} style={k.c ? { color: k.c, fontStyle: k.i ? 'italic' : undefined } : undefined}>
                {k.t}
              </span>
            ))}
            {code.endsWith('\n') ? ' ' : ''}
          </pre>
          <textarea
            ref={ta}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              syncCaret();
            }}
            onKeyDown={onKeyDown}
            onKeyUp={syncCaret}
            onClick={syncCaret}
            onSelect={syncCaret}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            wrap="off"
            enterKeyHint="enter"
            aria-label="Code editor"
            data-code-editor="1"
            style={{ ...boxStyle, position: 'relative', display: 'block', background: 'transparent', color: 'transparent', caretColor: '#fff', border: 0, outline: 'none', resize: 'none', overflow: 'hidden' }}
          />
        </div>
      </div>

      {/* suggestions + symbol keys: stays above the phone keyboard */}
      <div style={{ background: C.bar, borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
        {suggestions.length > 0 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '6px 8px 0' }}>
            {suggestions.map((w) => (
              <button
                key={w}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => accept(w)}
                style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 8, border: '1px solid #3b82f6', background: 'rgba(59,130,246,.15)', color: '#dbeafe', fontFamily: FONT, fontSize: 12, fontWeight: 700 }}
              >
                {w}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', padding: '6px 8px' }}>
          {[
            { k: 'tab', node: <CornerDownLeft size={13} style={{ transform: 'scaleX(-1)' }} />, label: 'Tab', on: () => replaceRange(ta.current?.selectionStart ?? 0, ta.current?.selectionEnd ?? 0, '    ') },
            { k: 'undo', node: <Undo2 size={14} />, label: 'Undo', on: () => { ta.current?.focus(); document.execCommand('undo'); syncCaret(); } },
            { k: 'redo', node: <Redo2 size={14} />, label: 'Redo', on: () => { ta.current?.focus(); document.execCommand('redo'); syncCaret(); } },
            { k: 'l', node: <ArrowLeft size={14} />, label: 'Left', on: () => moveCaret(-1) },
            { k: 'r', node: <ArrowRight size={14} />, label: 'Right', on: () => moveCaret(1) },
          ].map((b) => (
            <button key={b.k} type="button" aria-label={b.label} onPointerDown={(e) => e.preventDefault()} onClick={b.on} style={symStyle}>
              {b.node}
            </button>
          ))}
          {SYMBOLS[lang].map((s) => (
            <button key={s} type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => insertSymbol(s)} style={{ ...symStyle, fontFamily: FONT, fontSize: 14 }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const outputPy = (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '8px 12px', fontFamily: FONT, fontSize: Math.max(11, fs - 0.5), lineHeight: 1.55 }}>
      {running && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9aa7c7' }}>
          <Loader2 size={14} className="animate-spin" /> Starting Python (the first run takes a few seconds)…
        </div>
      )}
      {!running && !result && <div style={{ color: '#6b7a99' }}>Press ▶ Run (or Ctrl+Enter) to run your program. Output appears here.</div>}
      {!running && result && (
        <>
          {result.out && (
            <pre data-lpre="1" style={{ margin: 0, color: '#e2e8f0', ['--lc' as string]: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {result.out}
            </pre>
          )}
          {!result.out && !result.err && <div style={{ color: '#6b7a99' }}>(the program printed nothing)</div>}
          {result.err && (
            <div style={{ marginTop: result.out ? 10 : 0, border: '1px solid rgba(251,113,133,.45)', background: 'rgba(251,113,133,.08)', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fda4af', fontWeight: 800, marginBottom: 4 }}>
                <AlertCircle size={14} /> {result.errType || 'Error'}
                {result.errLine ? (
                  <button type="button" onClick={() => jumpToLine(result.errLine!)} style={{ marginLeft: 'auto', color: '#bfdbfe', background: 'rgba(59,130,246,.2)', border: '1px solid #3b82f6', borderRadius: 7, padding: '2px 8px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                    Go to line {result.errLine}
                  </button>
                ) : null}
              </div>
              <pre data-lpre="1" style={{ margin: 0, color: '#fecdd3', ['--lc' as string]: '#fecdd3', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {result.err}
              </pre>
              {result.errType && HINTS[result.errType] && (
                <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(250,204,21,.1)', border: '1px solid rgba(250,204,21,.3)', color: '#fde68a', fontFamily: 'system-ui, sans-serif', fontSize: 12, lineHeight: 1.45 }}>
                  💡 {HINTS[result.errType]}
                </div>
              )}
              {result.trace && result.trace !== result.err && (
                <>
                  <button type="button" onClick={() => setShowTrace((s) => !s)} style={{ marginTop: 6, color: '#9aa7c7', background: 'none', border: 0, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {showTrace ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Full traceback
                  </button>
                  {showTrace && (
                    <pre data-lpre="1" style={{ margin: '4px 0 0', color: '#9aa7c7', ['--lc' as string]: '#9aa7c7', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 11 }}>
                      {result.trace}
                    </pre>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  const previewWidth = device === 'phone' ? 375 : device === 'tablet' ? 768 : undefined;
  const outputWeb = (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {webTab === 'preview' ? (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#1a2140', display: 'flex', justifyContent: 'center', padding: previewWidth ? 8 : 0 }}>
          <iframe
            ref={iframeRef}
            key={previewKey}
            title="Preview"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            style={{ width: previewWidth ? previewWidth : '100%', maxWidth: '100%', height: '100%', minHeight: 160, border: 0, background: lang === 'js' ? '#020617' : '#fff', borderRadius: previewWidth ? 10 : 0, flexShrink: 0 }}
          />
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '8px 12px', fontFamily: FONT, fontSize: 12, lineHeight: 1.55 }}>
          {logs.length === 0 && <div style={{ color: '#6b7a99' }}>console.log(…) and errors from your page appear here.</div>}
          {logs.map((l, i) => (
            <div key={i} style={{ color: l.type === 'error' ? '#fda4af' : l.type === 'warn' ? '#fde68a' : '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', borderBottom: '1px solid rgba(148,163,184,.1)', padding: '2px 0' }}>
              {l.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const outputHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: C.bar, borderBottom: `1px solid ${C.line}`, borderTop: `1px solid ${C.line}`, flexShrink: 0, overflowX: 'auto' }}>
      {isPy ? (
        <>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#c7d2ee', fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>
            <Terminal size={13} /> OUTPUT
          </span>
          {result && !running && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: result.err ? '#fda4af' : '#86efac' }}>
              {result.err ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
              {result.err ? 'Finished with an error' : 'Finished'} - {result.ms ?? 0} ms
            </span>
          )}
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <Btn onClick={() => setShowStdin((s) => !s)} label="Input for input()" active={showStdin}>
              <Terminal size={13} /> Input
            </Btn>
            <Btn onClick={() => { setResult(null); setErrLine(null); }} label="Clear output">
              <Trash2 size={13} />
            </Btn>
          </span>
        </>
      ) : (
        <>
          <Btn onClick={() => setWebTab('preview')} label="Preview" active={webTab === 'preview'}>
            <Eye size={13} /> Preview
          </Btn>
          <Btn onClick={() => setWebTab('console')} label="Console" active={webTab === 'console'}>
            <Terminal size={13} /> Console{logs.length ? ` (${logs.length})` : ''}
          </Btn>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {webTab === 'preview' && (
              <>
                <Btn onClick={() => setDevice('phone')} label="Phone width" active={device === 'phone'}><Smartphone size={14} /></Btn>
                <Btn onClick={() => setDevice('tablet')} label="Tablet width" active={device === 'tablet'}><Tablet size={14} /></Btn>
                <Btn onClick={() => setDevice('full')} label="Full width" active={device === 'full'}><Monitor size={14} /></Btn>
              </>
            )}
            <Btn onClick={() => setLive((l) => !l)} label="Live preview while typing" active={live}>
              <Zap size={13} /> Live
            </Btn>
            {webTab === 'console' && (
              <Btn onClick={() => setLogs([])} label="Clear console"><Trash2 size={13} /></Btn>
            )}
          </span>
        </>
      )}
    </div>
  );

  return (
    <div
      role="dialog"
      aria-label="Code editor"
      style={{ position: 'fixed', left: 0, right: 0, top: 0, height: vh, zIndex: 60, background: C.bg, display: 'flex', flexDirection: 'column', color: C.text }}
    >
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: C.bar, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
        <Btn onClick={onClose} label="Close editor"><X size={16} /></Btn>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 32, borderRadius: 9, background: C.bg, border: `1px solid ${C.line}`, fontSize: 12, fontWeight: 800, color: '#e2e8f0', minWidth: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: isPy ? '#3b82f6' : lang === 'js' ? '#facc15' : '#fb923c', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || FILE_NAME[lang]}</span>
          {modified && <span title="Edited" style={{ width: 7, height: 7, borderRadius: 7, background: '#fbbf24', flexShrink: 0 }} />}
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center' }}>
          <Btn onClick={() => setFs((f) => Math.max(10, f - 1))} label="Smaller text"><Minus size={13} /></Btn>
          <Btn onClick={() => setFs((f) => Math.min(22, f + 1))} label="Bigger text"><Plus size={13} /></Btn>
          <Btn onClick={run} label="Run (Ctrl+Enter)" tone="run" disabled={running}>
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} Run
          </Btn>
        </span>
      </div>

      {/* tools row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: C.bg, borderBottom: `1px solid ${C.line}`, flexShrink: 0, overflowX: 'auto' }}>
        <Btn onClick={reset} label="Reset to the original code"><RotateCcw size={13} /> Reset</Btn>
        <Btn onClick={copy} label="Copy code">{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}</Btn>
        <Btn onClick={download} label={`Download ${FILE_NAME[lang]}`}><Download size={13} /></Btn>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <Btn onClick={() => setMode('editor')} label="Editor only" active={mode === 'editor'}>Code</Btn>
          <Btn onClick={() => setMode('split')} label="Editor and output" active={mode === 'split'}>Split</Btn>
          <Btn onClick={() => setMode('output')} label="Output only" active={mode === 'output'}>Output</Btn>
        </span>
      </div>

      {/* body */}
      <div ref={body} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {showEditor && editor}

        {showEditor && showOutput && (
          <div
            onPointerDown={(e) => {
              drag.current = true;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={onDragMove}
            onPointerUp={() => {
              drag.current = false;
            }}
            onPointerCancel={() => {
              drag.current = false;
            }}
            aria-label="Drag to resize"
            style={{ height: 14, background: C.bar, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', cursor: 'row-resize', flexShrink: 0 }}
          >
            <span style={{ width: 44, height: 4, borderRadius: 4, background: '#3b4670' }} />
          </div>
        )}

        {showOutput && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: outputFlex, background: isPy ? '#070b16' : '#0f1530' }}>
            {outputHeader}
            {isPy && showStdin && (
              <div style={{ padding: '6px 10px', background: '#0b1020', borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
                <label style={{ display: 'block', color: '#9aa7c7', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  Values for input(), one per line (if empty, Python asks you in a box):
                </label>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  rows={3}
                  spellCheck={false}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#070b16', color: '#e2e8f0', border: `1px solid ${C.line}`, borderRadius: 8, padding: 8, fontFamily: FONT, fontSize: 12.5, outline: 'none', resize: 'vertical' }}
                />
              </div>
            )}
            {isPy ? outputPy : outputWeb}
          </div>
        )}
      </div>

      {/* status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '3px 10px', background: '#1d4ed8', color: '#e0e7ff', fontSize: 10.5, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap', overflowX: 'auto' }}>
        <span>Ln {caret.line}, Col {caret.col}{sel.a !== sel.b ? ` (${Math.abs(sel.b - sel.a)} selected)` : ''}</span>
        <span>Spaces: 4</span>
        <span>UTF-8</span>
        <span>{LANG_LABEL[lang]}</span>
        <span style={{ marginLeft: 'auto' }}>{lines} lines</span>
      </div>
    </div>
  );
};

const symStyle: React.CSSProperties = {
  flexShrink: 0,
  minWidth: 34,
  height: 34,
  padding: '0 8px',
  borderRadius: 8,
  border: `1px solid ${C.line}`,
  background: '#161f3d',
  color: '#dbe4ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  cursor: 'pointer',
};

export default Ide;
