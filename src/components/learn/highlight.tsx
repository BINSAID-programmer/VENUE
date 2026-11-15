import React, { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { C, tokenize, CodeLang } from './tokenize';

export type { CodeLang };

const LANG_NAME: Record<CodeLang, string> = { python: 'Python', html: 'HTML', js: 'JavaScript' };
const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const LH = 20; // px line height shared by gutter, code layer and textarea
const FS = 12.5;

const Highlighted: React.FC<{ code: string; lang: CodeLang }> = ({ code, lang }) => (
  <>
    {tokenize(code, lang).map((k, i) => (
      <span key={i} style={k.c ? { color: k.c, fontStyle: k.i ? 'italic' : undefined } : undefined}>
        {k.t}
      </span>
    ))}
    {code.endsWith('\n') ? ' ' : ''}
  </>
);

const gutterText = (n: number) => Array.from({ length: n }, (_, i) => i + 1).join('\n');

const Chrome: React.FC<{ lang: CodeLang; title?: string; right?: React.ReactNode; children: React.ReactNode }> = ({ lang, title, right, children }) => (
  <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
    <div style={{ background: C.bar, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}>
      <span style={{ display: 'flex', gap: 5 }}>
        {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
          <i key={c} style={{ width: 8, height: 8, borderRadius: 8, background: c, display: 'block' }} />
        ))}
      </span>
      <span style={{ color: C.gutter, fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>{title || LANG_NAME[lang]}</span>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>{right}</span>
    </div>
    {children}
  </div>
);

const CopyBtn: React.FC<{ code: string }> = ({ code }) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        try {
          navigator.clipboard?.writeText(code);
          setOk(true);
          setTimeout(() => setOk(false), 1400);
        } catch {
          /* clipboard unavailable */
        }
      }}
      style={{ color: ok ? '#addb67' : '#9aa7c7', background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}
      aria-label="Copy code"
    >
      {ok ? <Check size={13} /> : <Copy size={13} />} {ok ? 'Copied' : 'Copy'}
    </button>
  );
};

/** Read-only, highlighted code with line numbers. */
export const CodeBlock: React.FC<{ code: string; lang: CodeLang; title?: string }> = ({ code, lang, title }) => {
  const text = code.replace(/\n$/, '');
  const lines = text.split('\n').length;
  return (
    <Chrome lang={lang} title={title} right={<CopyBtn code={text} />}>
      <div style={{ display: 'flex', overflowX: 'auto', fontFamily: FONT, fontSize: FS, lineHeight: `${LH}px` }}>
        <pre aria-hidden style={{ margin: 0, padding: '10px 8px 10px 12px', color: C.gutter, textAlign: 'right', userSelect: 'none', borderRight: `1px solid ${C.line}`, flexShrink: 0 }}>
          {gutterText(lines)}
        </pre>
        <pre style={{ margin: 0, padding: '10px 14px', color: C.text, whiteSpace: 'pre', minWidth: 0 }}>
          <Highlighted code={text} lang={lang} />
        </pre>
      </div>
    </Chrome>
  );
};

/** Editable code: highlighted layer under a transparent textarea, with line numbers, Tab and auto-indent. */
export const CodeEditor: React.FC<{
  value: string;
  onChange: (v: string) => void;
  lang: CodeLang;
  title?: string;
  minLines?: number;
  right?: React.ReactNode;
  fill?: boolean;
}> = ({ value, onChange, lang, title, minLines = 6, right, fill }) => {
  const ta = useRef<HTMLTextAreaElement>(null);
  const lines = Math.max(value.split('\n').length, minLines);
  const longest = Math.max(24, ...value.split('\n').map((l) => l.length)) + 2;
  const box: React.CSSProperties = {
    margin: 0,
    padding: '10px 14px',
    fontFamily: FONT,
    fontSize: FS,
    lineHeight: `${LH}px`,
    whiteSpace: 'pre',
    width: `calc(${longest}ch + 28px)`,
    minWidth: '100%',
    height: lines * LH + 20,
    boxSizing: 'border-box',
    tabSize: 4,
  };

  const set = (v: string, caret: number) => {
    onChange(v);
    requestAnimationFrame(() => {
      if (ta.current) ta.current.selectionStart = ta.current.selectionEnd = caret;
    });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: a, selectionEnd: b } = el;
    if (e.key === 'Tab') {
      e.preventDefault();
      set(value.slice(0, a) + '    ' + value.slice(b), a + 4);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', a - 1) + 1;
      const cur = value.slice(lineStart, a);
      let indent = cur.match(/^\s*/)?.[0] ?? '';
      if (/[:{(\[]\s*$/.test(cur)) indent += '    ';
      set(value.slice(0, a) + '\n' + indent + value.slice(b), a + 1 + indent.length);
    }
  };

  return (
    <Chrome lang={lang} title={title} right={right || <CopyBtn code={value} />}>
      <div style={{ display: 'flex', overflow: 'auto', maxHeight: fill ? undefined : 360, height: fill ? '100%' : undefined }}>
        <pre aria-hidden style={{ margin: 0, padding: '10px 8px 10px 12px', fontFamily: FONT, fontSize: FS, lineHeight: `${LH}px`, color: C.gutter, textAlign: 'right', userSelect: 'none', borderRight: `1px solid ${C.line}`, flexShrink: 0, position: 'sticky', left: 0, background: C.bg, zIndex: 1 }}>
          {gutterText(lines)}
        </pre>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <pre aria-hidden style={{ ...box, position: 'absolute', top: 0, left: 0, color: C.text, pointerEvents: 'none' }}>
            <Highlighted code={value} lang={lang} />
          </pre>
          <textarea
            ref={ta}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            style={{ ...box, position: 'relative', display: 'block', background: 'transparent', color: 'transparent', caretColor: '#fff', border: 0, outline: 'none', resize: 'none', overflow: 'hidden' }}
          />
        </div>
      </div>
    </Chrome>
  );
};
