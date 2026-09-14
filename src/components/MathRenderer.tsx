import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

const KATEX_MACROS = {
  '\\R': '\\mathbb{R}',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Q': '\\mathbb{Q}',
  '\\C': '\\mathbb{C}',
  '\\E': '\\mathbb{E}',
  '\\Var': '\\text{Var}',
  '\\Cov': '\\text{Cov}',
};

/**
 * Pre-processes text to ensure un-delimited math (like fractions (a+b)/c or raw \begin{pmatrix})
 * gets converted into standard LaTeX notation so KaTeX can render it as a visual formula.
 */
function preprocessMathContent(rawText: string): string {
  if (!rawText) return '';

  // 1. Normalize LaTeX delimiters
  let text = rawText
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 2. Wrap un-delimited LaTeX environments (aligned, matrix, pmatrix, bmatrix, cases)
  text = text.replace(
    /(?<!\$|\$\$)(?:\\begin\{(aligned|matrix|pmatrix|bmatrix|vmatrix|cases|equation\*?)\}[\s\S]*?\\end\{\1\})(?!\$|\$\$)/g,
    (match) => `\n$$\n${match.trim()}\n$$\n`
  );

  // 3. Convert parenthesized division expressions like (a+b)/c or (x-1)/(x+1) into proper LaTeX fractions
  // only when outside of code blocks
  text = text.replace(
    /(?<!`|\$|\$\$)(\(([a-zA-Z0-9\s\+\-\*\^\.\_\\\{\}]+)\)\/([a-zA-Z0-9\.\_\\\{\}]+|\([a-zA-Z0-9\s\+\-\*\^\.\_\\\{\}]+\)))(?!`|\$|\$\$)/g,
    (_match, _full, num, den) => {
      const cleanNum = num.trim();
      const cleanDen = den.startsWith('(') && den.endsWith(')') ? den.slice(1, -1).trim() : den.trim();
      return `$\\frac{${cleanNum}}{${cleanDen}}$`;
    }
  );

  // 4. Wrap standalone un-delimited \frac{...}{...} that are not already inside $ or $$
  text = text.replace(
    /(?<!\$|\$\$|`)(?:\\frac\{([^{}]+)\}\{([^{}]+)\})(?!\$|\$\$|`)/g,
    '$\\frac{$1}{$2}$'
  );

  return text;
}

/**
 * Renders mathematical expressions, university-grade LaTeX notation,
 * clean Markdown text flow, headings, and code snippets.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    const preprocessed = preprocessMathContent(content);

    // Split by code blocks first
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const segments: Array<{ type: 'code' | 'text'; language?: string; value: string }> = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(preprocessed)) !== null) {
      if (match.index > lastIdx) {
        segments.push({ type: 'text', value: preprocessed.substring(lastIdx, match.index) });
      }
      segments.push({ type: 'code', language: match[1] || 'text', value: match[2] });
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < preprocessed.length) {
      segments.push({ type: 'text', value: preprocessed.substring(lastIdx) });
    }

    return segments.map((seg, sIdx) => {
      if (seg.type === 'code') {
        return (
          <div key={`code-${sIdx}`} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950/90 text-xs shadow-sm">
            {seg.language && (
              <div className="px-3 py-1 bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono text-sky-400 font-semibold tracking-wider uppercase">
                {seg.language}
              </div>
            )}
            <pre className="p-3 font-mono text-emerald-300 overflow-x-auto custom-scrollbar leading-relaxed">
              <code>{seg.value}</code>
            </pre>
          </div>
        );
      }

      return (
        <div key={`text-seg-${sIdx}`} className="space-y-2.5">
          {renderMarkdownAndMath(seg.value)}
        </div>
      );
    });
  }, [content]);

  return <div className={`math-content text-slate-200 text-xs sm:text-sm leading-relaxed ${className}`}>{renderedElements}</div>;
};

/**
 * Dedicated block equation renderer for single formulas (e.g. theorem formula)
 */
export const MathBlock: React.FC<{ formula: string; className?: string }> = ({ formula, className = '' }) => {
  const html = useMemo(() => {
    try {
      let clean = formula.trim();
      if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith('\\[') && clean.endsWith('\\]')) {
        clean = clean.slice(2, -2).trim();
      }

      // If formula has parenthesized fraction, convert
      clean = clean.replace(
        /\(([a-zA-Z0-9\s\+\-\*\^\.\_\\\{\}]+)\)\/([a-zA-Z0-9\.\_\\\{\}]+|\([a-zA-Z0-9\s\+\-\*\^\.\_\\\{\}]+\))/g,
        '\\frac{$1}{$2}'
      );

      return katex.renderToString(clean, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: KATEX_MACROS,
      });
    } catch {
      return formula;
    }
  }, [formula]);

  return (
    <div
      className={`katex-display-block overflow-x-auto custom-scrollbar py-2 text-sky-300 font-medium ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * Parse paragraphs, headers, bullet/numbered lists, and LaTeX formulas
 */
function renderMarkdownAndMath(text: string): React.ReactNode[] {
  // Split into lines/paragraphs
  const lines = text.split('\n');
  const renderedNodes: React.ReactNode[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length === 0) return;
    const paraText = currentParagraphLines.join('\n').trim();
    if (paraText) {
      renderedNodes.push(
        <div key={`p-${renderedNodes.length}`} className="leading-relaxed text-slate-300">
          {renderInlineMathAndFormatting(paraText)}
        </div>
      );
    }
    currentParagraphLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for display math block start $$ ... $$ on single line or multiline
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) {
      flushParagraph();
      const formula = trimmed.slice(2, -2).trim();
      renderedNodes.push(
        <div
          key={`disp-math-${renderedNodes.length}`}
          className="my-3 py-2 px-3 rounded-lg bg-slate-950/40 border border-slate-850/60 overflow-x-auto custom-scrollbar text-center"
        >
          <MathBlock formula={formula} />
        </div>
      );
      continue;
    }

    // Check for Markdown headings
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      renderedNodes.push(
        <h4 key={`h4-${renderedNodes.length}`} className="text-xs sm:text-sm font-semibold text-sky-400 mt-3.5 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
          {renderInlineMathAndFormatting(trimmed.slice(4))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      renderedNodes.push(
        <h3 key={`h3-${renderedNodes.length}`} className="text-sm sm:text-base font-bold text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-800/80">
          {renderInlineMathAndFormatting(trimmed.slice(3))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      renderedNodes.push(
        <h2 key={`h2-${renderedNodes.length}`} className="text-base sm:text-lg font-bold text-slate-100 mt-4 mb-2">
          {renderInlineMathAndFormatting(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Check for bullet lists (- or * )
    if (/^[\*\-]\s+/.test(trimmed)) {
      flushParagraph();
      const bulletContent = trimmed.replace(/^[\*\-]\s+/, '');
      renderedNodes.push(
        <div key={`bullet-${renderedNodes.length}`} className="flex items-start gap-2 pl-2 my-1 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400/80 mt-1.5 shrink-0" />
          <div className="flex-1 min-w-0">{renderInlineMathAndFormatting(bulletContent)}</div>
        </div>
      );
      continue;
    }

    // Check for numbered lists (1. or 2. )
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      flushParagraph();
      renderedNodes.push(
        <div key={`num-${renderedNodes.length}`} className="flex items-start gap-2.5 pl-1 my-1.5 text-slate-300">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-800/90 text-sky-400 font-mono text-[11px] font-semibold shrink-0 mt-0.5 select-none">
            {numberedMatch[1]}
          </span>
          <div className="flex-1 min-w-0">{renderInlineMathAndFormatting(numberedMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Empty line triggers paragraph flush
    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    // Accumulate normal text line
    currentParagraphLines.push(line);
  }

  flushParagraph();
  return renderedNodes;
}

/**
 * Tokenizes a string of text to handle inline math $...$, block math $$...$$,
 * bold **...**, italic *...*, and inline code `...`.
 */
function renderInlineMathAndFormatting(lineText: string): React.ReactNode[] {
  // Regex to match:
  // 1. Block math: $$ ... $$
  // 2. Inline math: $ ... $
  // 3. Inline code: ` ... `
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$(?:\\\$|[^\$\n])+\$|`[^`\n]+`)/g;

  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(lineText)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`txt-${lastIndex}`}>
          {formatBoldAndItalic(lineText.substring(lastIndex, match.index))}
        </span>
      );
    }

    const matchedStr = match[0];

    if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      // Inline code
      tokens.push(
        <code
          key={`code-inline-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px] border border-slate-700/50"
        >
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else {
      // Math formula
      let isBlock = false;
      let formula = '';

      if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
        isBlock = true;
        formula = matchedStr.slice(2, -2).trim();
      } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
        isBlock = false;
        formula = matchedStr.slice(1, -1).trim();
      }

      try {
        const renderedHtml = katex.renderToString(formula, {
          displayMode: isBlock,
          throwOnError: false,
          strict: false,
          trust: true,
          macros: KATEX_MACROS,
        });

        if (isBlock) {
          tokens.push(
            <div
              key={`math-block-${match.index}`}
              className="my-2 py-1.5 px-2 overflow-x-auto custom-scrollbar text-sky-300 font-medium text-center"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          );
        } else {
          tokens.push(
            <span
              key={`math-inline-${match.index}`}
              className="inline-block px-1 text-sky-300 font-medium align-baseline"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          );
        }
      } catch {
        tokens.push(
          <span key={`math-fallback-${match.index}`} className="text-sky-400 font-mono text-xs">
            {matchedStr}
          </span>
        );
      }
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < lineText.length) {
    tokens.push(
      <span key={`txt-end-${lastIndex}`}>
        {formatBoldAndItalic(lineText.substring(lastIndex))}
      </span>
    );
  }

  return tokens;
}

/**
 * Format markdown bold **bold** and italic *italic*
 */
function formatBoldAndItalic(rawText: string): React.ReactNode {
  const parts = rawText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    if (chunk.startsWith('*') && chunk.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-200">
          {chunk.slice(1, -1)}
        </em>
      );
    }
    return chunk;
  });
}
