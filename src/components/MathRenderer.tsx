import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';
import {
  aiRenderTelemetry,
  recoverStructuredTextIfRawJson,
} from '../utils/aiResponseRenderPipeline';

// ============================================================================
// STAGE 10P: FAULT-TOLERANT MATHEMATICAL & MARKDOWN RENDERING PIPELINE
// ============================================================================
// Architecture Pipeline (Section 4):
// AI response -> validate -> normalize safe formatting -> parse Markdown
// -> detect math blocks -> render LaTeX/KaTeX safely -> render remaining Markdown -> display.
// If any individual step fails:
// AI response -> safe fallback renderer -> display readable text.
// NEVER replace a valid AI response with "Unable to complete response".
// ============================================================================

interface MathRendererProps {
  content: string;
  className?: string;
  variant?: 'light' | 'dark';
  messageId?: string;
}

const KATEX_MACROS: Record<string, string> = {
  '\\R': '\\mathbb{R}',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Q': '\\mathbb{Q}',
  '\\C': '\\mathbb{C}',
  '\\E': '\\mathbb{E}',
  '\\P': '\\mathbb{P}',
  '\\Var': '\\operatorname{Var}',
  '\\Cov': '\\operatorname{Cov}',
  '\\Corr': '\\operatorname{Corr}',
  '\\Bias': '\\operatorname{Bias}',
  '\\MSE': '\\operatorname{MSE}',
  '\\SE': '\\operatorname{SE}',
  '\\d': '\\,\\mathrm{d}',
};

// Bounded LRU-style memoization cache for KaTeX expressions (Section 22 Performance)
const katexRenderCache = new Map<
  string,
  { html: string; fallbackText: string; usedFallback: boolean }
>();
const MAX_KATEX_CACHE_SIZE = 500;

function getCachedKatexRender(
  rawFormula: string,
  displayMode: boolean,
  messageId?: string
): { html: string; fallbackText: string; usedFallback: boolean } {
  const cleanFormula = (rawFormula || '').trim();
  if (!cleanFormula) {
    return { html: '', fallbackText: '', usedFallback: false };
  }

  const cacheKey = `${displayMode ? 'D' : 'I'}:${cleanFormula}`;
  const existing = katexRenderCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const validation = validateAndRepairLatexExpression(cleanFormula);
  if (!validation.repaired) {
    return { html: '', fallbackText: '', usedFallback: false };
  }

  let result: { html: string; fallbackText: string; usedFallback: boolean } | null = null;

  // Only invoke KaTeX if the expression passed structural validation or was safely repaired
  if (validation.isLikelyValid) {
    try {
      const html = katex.renderToString(validation.repaired, {
        displayMode,
        throwOnError: true,
        strict: false,
        trust: false, // Section 21 Security: do not trust arbitrary URLs/HTML inside LaTeX
        macros: KATEX_MACROS,
      });
      result = { html, fallbackText: '', usedFallback: false };
    } catch (strictErr: any) {
      try {
        const permissiveHtml = katex.renderToString(validation.repaired, {
          displayMode,
          throwOnError: false,
          strict: false,
          trust: false,
          macros: KATEX_MACROS,
        });
        if (!permissiveHtml.includes('katex-error')) {
          result = { html: permissiveHtml, fallbackText: '', usedFallback: false };
        } else {
          aiRenderTelemetry.logRenderIssue({
            messageId,
            stage: 'katex_render',
            errorType: 'KaTeXParseError',
            diagnosticSummary: `${strictErr?.message || 'Invalid LaTeX command'} in expression: ${cleanFormula.slice(0, 80)}`,
            recoveredWithFallback: true,
          });
        }
      } catch (permErr: any) {
        aiRenderTelemetry.logRenderIssue({
          messageId,
          stage: 'katex_render',
          errorType: 'KaTeXRenderException',
          diagnosticSummary: `${permErr?.message || 'KaTeX exception'} in expression: ${cleanFormula.slice(0, 80)}`,
          recoveredWithFallback: true,
        });
      }
    }
  } else {
    aiRenderTelemetry.logRenderIssue({
      messageId,
      stage: 'validation',
      errorType: 'UnrepairableLatexSyntax',
      diagnosticSummary: `${validation.reason || 'Malformed LaTeX'} in expression: ${cleanFormula.slice(0, 80)}`,
      recoveredWithFallback: true,
    });
  }

  if (!result) {
    result = {
      html: '',
      fallbackText: formatReadableMathFallback(cleanFormula),
      usedFallback: true,
    };
  }

  if (katexRenderCache.size >= MAX_KATEX_CACHE_SIZE) {
    const oldestKey = katexRenderCache.keys().next().value;
    if (oldestKey) katexRenderCache.delete(oldestKey);
  }
  katexRenderCache.set(cacheKey, result);
  return result;
}

/**
 * STAGE 10P SECTIONS 5, 6 & 14: CONSERVATIVE LATEX VALIDATION & NORMALIZATION
 * Detects and safely normalizes:
 * - missing closing delimiters
 * - unmatched { and }
 * - incomplete \frac and \sqrt
 * - invalid matrix delimiters
 * - broken \begin{...} / \end{...}
 * - nested or conflicting delimiters
 * Never blindly rewrites mathematical meaning when uncertain; marks `isLikelyValid: false`
 * if an expression cannot be safely repaired so it falls back to readable text.
 */
export function validateAndRepairLatexExpression(rawFormula: string): {
  repaired: string;
  isLikelyValid: boolean;
  reason?: string;
} {
  if (!rawFormula || typeof rawFormula !== 'string') {
    return { repaired: '', isLikelyValid: true };
  }

  let f = rawFormula.trim();

  // 1. Strip accidental duplicate or nested outer delimiters
  let strippedOuter = true;
  while (strippedOuter) {
    strippedOuter = false;
    if (f.startsWith('$$') && f.endsWith('$$') && f.length >= 4) {
      f = f.slice(2, -2).trim();
      strippedOuter = true;
    } else if (f.startsWith('\\[') && f.endsWith('\\]') && f.length >= 4) {
      f = f.slice(2, -2).trim();
      strippedOuter = true;
    } else if (f.startsWith('\\(') && f.endsWith('\\)') && f.length >= 4) {
      f = f.slice(2, -2).trim();
      strippedOuter = true;
    } else if (f.startsWith('$') && f.endsWith('$') && f.length >= 2 && !f.slice(1, -1).includes('$')) {
      f = f.slice(1, -1).trim();
      strippedOuter = true;
    }
  }

  // Strip stray leading/trailing single delimiter if left at the boundary
  f = f
    .replace(/^(\$\$|\$|\\\[|\\\]|\\\(|\\\))+/, '')
    .replace(/(\$\$|\$|\\\[|\\\]|\\\(|\\\))+$/, '')
    .trim();

  if (!f) {
    return { repaired: '', isLikelyValid: true };
  }

  // 2. Normalize mixed raw Unicode symbols inside LaTeX math mode into canonical LaTeX
  f = f
    .replace(/×/g, '\\times ')
    .replace(/÷/g, '\\div ')
    .replace(/±/g, '\\pm ')
    .replace(/∓/g, '\\mp ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\ne ')
    .replace(/≈/g, '\\approx ')
    .replace(/∞/g, '\\infty ')
    .replace(/→/g, '\\to ')
    .replace(/←/g, '\\leftarrow ')
    .replace(/⇒/g, '\\Rightarrow ')
    .replace(/⇔/g, '\\Leftrightarrow ')
    .replace(/∈/g, '\\in ')
    .replace(/∉/g, '\\notin ')
    .replace(/⊂/g, '\\subset ')
    .replace(/⊆/g, '\\subseteq ')
    .replace(/∪/g, '\\cup ')
    .replace(/∩/g, '\\cap ')
    .replace(/∀/g, '\\forall ')
    .replace(/∃/g, '\\exists ')
    .replace(/∑/g, '\\sum ')
    .replace(/∏/g, '\\prod ')
    .replace(/∫/g, '\\int ')
    .replace(/∂/g, '\\partial ')
    .replace(/∇/g, '\\nabla ')
    .replace(/−/g, '-');

  // Convert √(expr) or √x to \sqrt{...}
  f = f.replace(/√\(([^()]+)\)/g, '\\sqrt{$1}');
  f = f.replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}');

  // 3. Repair unambiguous incomplete/shorthand \frac and \sqrt syntax:
  // e.g. \frac{a+b}c -> \frac{a+b}{c}, \frac a b -> \frac{a}{b}, \frac12 -> \frac{1}{2}
  f = f.replace(/\\frac\s*\{([^{}]+)\}\s*([a-zA-Z0-9])(?![a-zA-Z0-9{])/g, '\\frac{$1}{$2}');
  f = f.replace(/\\frac\s*([a-zA-Z0-9])\s*\{([^{}]+)\}/g, '\\frac{$1}{$2}');
  f = f.replace(/\\frac\s+([a-zA-Z0-9])\s+([a-zA-Z0-9])(?![a-zA-Z0-9])/g, '\\frac{$1}{$2}');
  f = f.replace(/\\frac([0-9])([0-9])(?![0-9])/g, '\\frac{$1}{$2}');
  f = f.replace(/\\sqrt\s+([a-zA-Z0-9])(?![a-zA-Z0-9{])/g, '\\sqrt{$1}');

  // Detect dangling \frac or \sqrt at the very end of the expression where meaning is uncertain
  if (/\\frac\s*$/.test(f) || /\\frac\s*\{[^{}]*\}\s*$/.test(f) || /\\sqrt\s*$/.test(f)) {
    return {
      repaired: f,
      isLikelyValid: false,
      reason: 'Incomplete \\frac or \\sqrt missing required operand',
    };
  }

  // 4. Normalize align/align*/equation/equation* to aligned for KaTeX compatibility
  f = f
    .replace(/\\begin\{(align\*?|equation\*?|gather\*?)\}/g, '\\begin{aligned}')
    .replace(/\\end\{(align\*?|equation\*?|gather\*?)\}/g, '\\end{aligned}');

  // 5. Check and repair broken \begin{...} / \end{...} environments (matrices, cases, aligned)
  const beginRegex = /\\begin\{([a-zA-Z0-9*]+)\}/g;
  const endRegex = /\\end\{([a-zA-Z0-9*]+)\}/g;
  const beginEnvs: string[] = [];
  const endEnvs: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = beginRegex.exec(f)) !== null) {
    beginEnvs.push(m[1]);
  }
  while ((m = endRegex.exec(f)) !== null) {
    endEnvs.push(m[1]);
  }

  if (beginEnvs.length !== endEnvs.length) {
    // If exactly 1 environment is open and unclosed at the end, close it safely
    if (beginEnvs.length === 1 && endEnvs.length === 0) {
      f = `${f} \\end{${beginEnvs[0]}}`;
    } else if (beginEnvs.length === 0 && endEnvs.length === 1) {
      f = `\\begin{${endEnvs[0]}} ${f}`;
    } else {
      return {
        repaired: f,
        isLikelyValid: false,
        reason: 'Mismatched \\begin{...} and \\end{...} environments',
      };
    }
  } else if (beginEnvs.length === 1 && endEnvs.length === 1 && beginEnvs[0] !== endEnvs[0]) {
    // Mismatched single environment e.g. \begin{bmatrix} ... \end{pmatrix} -> align end to begin
    const validMatrixEnvs = new Set(['matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'Bmatrix', 'Vmatrix', 'aligned', 'cases']);
    if (validMatrixEnvs.has(beginEnvs[0])) {
      f = f.replace(new RegExp(`\\\\end\\{${endEnvs[0].replace('*', '\\*')}\\}$`), `\\end{${beginEnvs[0]}}`);
    } else {
      return {
        repaired: f,
        isLikelyValid: false,
        reason: `Conflicting environment tags \\begin{${beginEnvs[0]}} and \\end{${endEnvs[0]}}`,
      };
    }
  }

  // 6. Balance unclosed \left and \right delimiters
  const leftCount = (f.match(/\\left(?![a-zA-Z])/g) || []).length;
  const rightCount = (f.match(/\\right(?![a-zA-Z])/g) || []).length;
  if (leftCount > rightCount) {
    for (let i = 0; i < leftCount - rightCount; i++) {
      f += ' \\right.';
    }
  } else if (rightCount > leftCount) {
    let extraRight = rightCount - leftCount;
    f = f.replace(/\\right(?![a-zA-Z])\s*[.)\]}|]?/g, (match) => {
      if (extraRight > 0) {
        extraRight--;
        return match.replace(/\\right\s*/, '');
      }
      return match;
    });
  }

  // 7. Balance unmatched curly braces { and } safely (ignoring escaped \{ and \})
  let openBraces = 0;
  let strayClosingBraces = 0;
  let cleanedBraces = '';

  for (let i = 0; i < f.length; i++) {
    if (f[i] === '\\' && i + 1 < f.length) {
      cleanedBraces += f[i] + f[i + 1];
      i++;
      continue;
    }
    if (f[i] === '{') {
      openBraces++;
      cleanedBraces += '{';
    } else if (f[i] === '}') {
      if (openBraces > 0) {
        openBraces--;
        cleanedBraces += '}';
      } else {
        strayClosingBraces++;
        // Drop stray unmatched closing brace if there was no matching opening brace
      }
    } else {
      cleanedBraces += f[i];
    }
  }

  f = cleanedBraces;

  if (openBraces > 4 || strayClosingBraces > 4) {
    return {
      repaired: f,
      isLikelyValid: false,
      reason: 'Severely unbalanced curly braces in mathematical expression',
    };
  }

  if (openBraces > 0) {
    f += '}'.repeat(openBraces);
  }

  return { repaired: f, isLikelyValid: true };
}

/**
 * STAGE 10P SECTION 5 & 7: READABLE MATHEMATICAL FALLBACK
 * Converts a broken or unsupported LaTeX expression into clean, human-readable
 * mathematical notation so the student never loses the formula or surrounding answer.
 */
export function formatReadableMathFallback(rawFormula: string): string {
  if (!rawFormula) return '';
  let s = rawFormula
    .replace(/^\$\$|\$\$$/g, '')
    .replace(/^\$|\$$/g, '')
    .replace(/^\\\[|\\\]$/g, '')
    .replace(/^\\\(|\\\)$/g, '')
    .trim();

  // Format matrices into readable bracketed rows: [a, b; c, d]
  s = s.replace(
    /\\begin\{(?:[pbvBV]?matrix)\}([\s\S]*?)\\end\{(?:[pbvBV]?matrix|[a-zA-Z*]+)\}/g,
    (_m, inner) => {
      const rows = String(inner)
        .split(/\\\\/)
        .map((r) =>
          r
            .split('&')
            .map((c) => c.trim())
            .filter(Boolean)
            .join(', ')
        )
        .filter(Boolean);
      return `[ ${rows.join(' ; ')} ]`;
    }
  );

  // Format cases environment
  s = s.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_m, inner) => {
    const rows = String(inner)
      .split(/\\\\/)
      .map((r) => r.replace(/&/g, ' ').trim())
      .filter(Boolean);
    return `{ ${rows.join(' ; ')} }`;
  });

  // Format aligned environment
  s = s.replace(/\\begin\{(?:aligned|align\*?)\}([\s\S]*?)\\end\{(?:aligned|align\*?)\}/g, (_m, inner) =>
    String(inner)
      .replace(/&/g, ' ')
      .replace(/\\\\/g, '\n')
      .trim()
  );

  // Iteratively convert nested \frac{a}{b} -> (a)/(b)
  for (let pass = 0; pass < 3; pass++) {
    s = s.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1)/($2)');
  }
  // Incomplete \frac{a} -> (a)/
  s = s.replace(/\\frac\s*\{([^{}]+)\}/g, '($1)/');

  s = s
    .replace(/\\sqrt\s*\[([^\]]+)\]\s*\{([^{}]+)\}/g, '$1√($2)')
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)')
    .replace(/\\sqrt\s*([a-zA-Z0-9]+)/g, '√$1')
    .replace(/\\binom\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, 'C($1, $2)')
    .replace(/\\bar\s*\{([^{}]+)\}/g, '$1̄')
    .replace(/\\bar\s*([a-zA-Z])/g, '$1̄')
    .replace(/\\vec\s*\{([^{}]+)\}/g, '$1⃗')
    .replace(/\\hat\s*\{([^{}]+)\}/g, '$1̂')
    .replace(/\\text\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\mathrm\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\mathbf\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\mathbb\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\mathcal\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\operatorname\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, '∑($1 to $2)')
    .replace(/\\sum_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '∑($1 to $2)')
    .replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, '∫($1 to $2)')
    .replace(/\\int_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '∫($1 to $2)')
    .replace(/\\lim_\{([^{}]+)\}/g, 'lim($1)')
    .replace(/\\sum\b/g, '∑')
    .replace(/\\prod\b/g, '∏')
    .replace(/\\int\b/g, '∫')
    .replace(/\\partial\b/g, '∂')
    .replace(/\\nabla\b/g, '∇')
    .replace(/\\to\b|\\rightarrow\b/g, '→')
    .replace(/\\leftarrow\b/g, '←')
    .replace(/\\Rightarrow\b/g, '⇒')
    .replace(/\\Leftrightarrow\b/g, '⇔')
    .replace(/\\infty\b/g, '∞')
    .replace(/\\mid\b/g, ' | ')
    .replace(/\\times\b/g, '×')
    .replace(/\\div\b/g, '÷')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\pm\b/g, '±')
    .replace(/\\mp\b/g, '∓')
    .replace(/\\le\b|\\leq\b/g, '≤')
    .replace(/\\ge\b|\\geq\b/g, '≥')
    .replace(/\\ne\b|\\neq\b/g, '≠')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\equiv\b/g, '≡')
    .replace(/\\in\b/g, '∈')
    .replace(/\\notin\b/g, '∉')
    .replace(/\\subset\b/g, '⊂')
    .replace(/\\subseteq\b/g, '⊆')
    .replace(/\\cup\b/g, '∪')
    .replace(/\\cap\b/g, '∩')
    .replace(/\\mu\b/g, 'μ')
    .replace(/\\sigma\b/g, 'σ')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\gamma\b/g, 'γ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\theta\b/g, 'θ')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\omega\b/g, 'ω')
    .replace(/\\Omega\b/g, 'Ω')
    .replace(/\\left|\\right/g, '')
    .replace(/\\,|\\;|\\:|\\!/g, ' ')
    // Strip unknown macro backslashes while preserving their arguments e.g. \invalidCommand{x} -> invalidCommand(x)
    .replace(/\\([a-zA-Z]+)\s*\{([^{}]*)\}/g, '$1($2)')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return s || rawFormula;
}

/**
 * STAGE 10P SECTIONS 5, 6, 10 & 14: CONSERVATIVE PREPROCESSING & DELIMITER NORMALIZATION
 * Handles:
 * - Protecting closed AND unclosed fenced code blocks (Section 10)
 * - Supporting \(...\), \[...\], $...$, $$...$$, and standalone [ \frac{...} ] (Section 6 & 13)
 * - Safely repairing unambiguous missing closing delimiters at line boundaries without corrupting prose
 */
export function preprocessMathContent(rawText: string, messageId?: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  // 0. If the text accidentally contains a raw JSON wrapper, recover the text field first
  const recovered = recoverStructuredTextIfRawJson(rawText);
  let workingText = recovered.text || rawText;

  // 1. Protect fenced code blocks (including UNCLOSED code blocks at the end of a message — Section 10)
  // and inline code spans before transforming math delimiters
  const codeBlocks: string[] = [];
  workingText = workingText.replace(
    /```[a-zA-Z0-9_+-]*\n[\s\S]*?(?:```|$)|```[\s\S]*?(?:```|$)|`[^`\n]+`/g,
    (match) => {
      const idx = codeBlocks.length;
      codeBlocks.push(match);
      return `@@VENUE_CODE_BLOCK_${idx}@@`;
    }
  );

  // 2. Convert paired \[ ... \] display math to $$ ... $$
  workingText = workingText.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\n$$\n${inner.trim()}\n$$\n`);

  // 3. Convert paired \( ... \) inline math to $ ... $
  workingText = workingText.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner.trim()}$`);

  // 4. Handle unambiguous unclosed \( or \[ on a single line (Section 5 & 14)
  workingText = workingText.replace(/\\\[([^\n]+)$/gm, (_m, inner) => {
    aiRenderTelemetry.logRenderIssue({
      messageId,
      stage: 'normalization',
      errorType: 'UnclosedDisplayBracketDelimiter',
      diagnosticSummary: 'Closed unambiguous unclosed \\[ delimiter at end of line',
      recoveredWithFallback: true,
    });
    return `\n$$\n${inner.trim()}\n$$\n`;
  });
  workingText = workingText.replace(/\\\(([^\n]+)$/gm, (_m, inner) => {
    aiRenderTelemetry.logRenderIssue({
      messageId,
      stage: 'normalization',
      errorType: 'UnclosedInlineParenDelimiter',
      diagnosticSummary: 'Closed unambiguous unclosed \\( delimiter at end of line',
      recoveredWithFallback: true,
    });
    return `$${inner.trim()}$`;
  });

  // Remove any remaining orphan \(, \), \[, \] that had no opening partner
  workingText = workingText
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\\\[/g, '')
    .replace(/\\\]/g, '');

  // 5. Support standalone bracketed display equations [ \frac{...} ] or [ P(A\mid B) ] or [ \bar{x}=... ]
  // (Section 6 & 13: Only when inside contains clear LaTeX commands or mathematical equation syntax, never Markdown links [text](url))
  workingText = workingText.replace(
    /^\s*\[\s*(\\(?:frac|int|sum|prod|lim|sqrt|begin|bar|vec|hat|mathbf|mathbb|mathcal|partial|nabla|alpha|beta|gamma|sigma|mu|theta|lambda|binom)[\s\S]*?|[a-zA-Z0-9_{}^+\-*/=(),.\s]+\\(?:frac|int|sum|prod|lim|sqrt|begin|mid|to|infty|times|pm|le|ge|ne|approx|bar|hat|vec|sigma|mu)[\s\S]*?|P\([^)\n]+\\mid[^)\n]+\)[\s\S]*?)\s*\](?!\s*\()\s*$/gm,
    (_m, inner) => `\n$$\n${inner.trim()}\n$$\n`
  );

  // 6. Wrap un-delimited LaTeX environments (aligned, align, align*, matrix, pmatrix, bmatrix, vmatrix, cases, equation, gather)
  workingText = workingText.replace(
    /\\begin\{(aligned|align\*?|matrix|pmatrix|bmatrix|vmatrix|cases|equation\*?|gather\*?)\}[\s\S]*?(?:\\end\{\1\}|$)/g,
    (match, env, offset, fullStr) => {
      const before = fullStr.slice(Math.max(0, offset - 8), offset);
      const after = fullStr.slice(offset + match.length, offset + match.length + 8);
      if (before.includes('$') || after.includes('$')) {
        return match;
      }
      const closedMatch = match.includes(`\\end{${env}}`) ? match.trim() : `${match.trim()}\n\\end{${env}}`;
      return `\n$$\n${closedMatch}\n$$\n`;
    }
  );

  // 7. Handle odd number of $$ display delimiters (close unclosed $$ at end of block)
  const doubleDollarMatches = workingText.match(/\$\$/g);
  if (doubleDollarMatches && doubleDollarMatches.length % 2 === 1) {
    aiRenderTelemetry.logRenderIssue({
      messageId,
      stage: 'normalization',
      errorType: 'UnclosedDisplayDollarDelimiter',
      diagnosticSummary: 'Closed unclosed $$ display math block at end of message',
      recoveredWithFallback: true,
    });
    workingText = `${workingText}\n$$\n`;
  }

  // 8. Restore protected code blocks
  workingText = workingText.replace(
    /@@VENUE_CODE_BLOCK_(\d+)@@/g,
    (_m, idx) => codeBlocks[Number(idx)] || ''
  );

  return workingText;
}

/**
 * Interactive Fenced Code Block with language header, horizontal scroll, and Copy button.
 */
const CodeBlockSnippet: React.FC<{
  language?: string;
  code: string;
  isLight: boolean;
  isUnclosedFallback?: boolean;
}> = ({ language, code, isLight, isUnclosedFallback }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`my-3.5 rounded-xl overflow-hidden border text-xs max-w-full ${
        isLight
          ? 'border-slate-200 bg-slate-900 text-slate-100 shadow-xs'
          : 'border-slate-800 bg-slate-950/90 text-slate-100 shadow-xs'
      }`}
    >
      <div className="px-3.5 py-1.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider font-semibold text-sky-300">
            {language && language !== 'text' ? language : 'code'}
          </span>
          {isUnclosedFallback && (
            <span className="text-[10px] text-slate-400 font-sans">
              (auto-closed block)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-sans">Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 font-mono text-[12px] sm:text-[13px] text-emerald-300 overflow-x-auto leading-relaxed m-0 border-0! max-w-full">
        <code className="bg-transparent! text-emerald-200! p-0!">{code}</code>
      </pre>
    </div>
  );
};

/**
 * STAGE 10P SECTION 10: FAULT-TOLERANT CODE BLOCK SPLITTER
 * Handles both properly closed ```...``` blocks AND unclosed ``` blocks at the end of a message
 * so an unclosed fence never crashes or swallows the message.
 */
function splitByFencedCodeBlocksSafely(
  text: string,
  messageId?: string
): Array<{
  type: 'code' | 'text';
  language?: string;
  value: string;
  isUnclosedFallback?: boolean;
}> {
  const segments: Array<{
    type: 'code' | 'text';
    language?: string;
    value: string;
    isUnclosedFallback?: boolean;
  }> = [];

  const fenceRegex = /```([a-zA-Z0-9_+-]*)[ \t]*\n?([\s\S]*?)(```|$)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      segments.push({
        type: 'text',
        value: text.substring(lastIdx, match.index),
      });
    }

    const lang = (match[1] || 'text').trim();
    const rawCodeBody = match[2] || '';
    const closingFence = match[3];
    const isUnclosed = closingFence !== '```';

    if (isUnclosed) {
      aiRenderTelemetry.logRenderIssue({
        messageId,
        stage: 'code_block_render',
        errorType: 'UnclosedCodeFence',
        diagnosticSummary: `Unclosed Markdown code fence (lang=${lang || 'none'}); rendered safely to end of message`,
        recoveredWithFallback: true,
      });
    }

    segments.push({
      type: 'code',
      language: lang,
      value: rawCodeBody.replace(/\n$/, ''),
      isUnclosedFallback: isUnclosed,
    });

    lastIdx = match.index + match[0].length;
    if (isUnclosed) {
      break;
    }
  }

  if (lastIdx < text.length) {
    segments.push({
      type: 'text',
      value: text.substring(lastIdx),
    });
  }

  return segments;
}

/**
 * Renders mathematical expressions, university-grade LaTeX notation,
 * Markdown headings, tables, blockquotes, lists, and code blocks with multi-stage fault isolation.
 */
export const MathRenderer: React.FC<MathRendererProps> = React.memo(
  ({ content, className = '', variant = 'dark', messageId }) => {
    const isLight = variant === 'light';

    const renderedElements = useMemo(() => {
      if (!content || typeof content !== 'string') return null;

      try {
        const preprocessed = preprocessMathContent(content, messageId);
        const segments = splitByFencedCodeBlocksSafely(preprocessed, messageId);

        const output = segments.map((seg, sIdx) => {
          if (seg.type === 'code') {
            return (
              <CodeBlockSnippet
                key={`code-${sIdx}`}
                language={seg.language}
                code={seg.value}
                isLight={isLight}
                isUnclosedFallback={seg.isUnclosedFallback}
              />
            );
          }

          try {
            return (
              <div key={`text-seg-${sIdx}`} className="space-y-3 min-w-0 max-w-full">
                {renderMarkdownAndMath(seg.value, isLight, messageId)}
              </div>
            );
          } catch (segErr: any) {
            aiRenderTelemetry.logRenderIssue({
              messageId,
              stage: 'markdown_parse',
              errorType: 'SegmentMarkdownError',
              diagnosticSummary: segErr?.message || 'Markdown segment parse error',
              recoveredWithFallback: true,
            });
            return (
              <div
                key={`text-fallback-${sIdx}`}
                className="whitespace-pre-wrap break-words leading-[1.75]"
              >
                {seg.value}
              </div>
            );
          }
        });

        aiRenderTelemetry.increment('renderSuccess');
        return output;
      } catch (fatalRenderErr: any) {
        // STAGE 10P SECTION 4: Top-level safe fallback renderer — NEVER lose the raw AI response
        aiRenderTelemetry.logRenderIssue({
          messageId,
          stage: 'markdown_parse',
          errorType: 'TopLevelPipelineFallback',
          diagnosticSummary: fatalRenderErr?.message || 'Fallback to plain readable text',
          recoveredWithFallback: true,
        });
        return (
          <div className="whitespace-pre-wrap break-words leading-[1.75]">
            {content}
          </div>
        );
      }
    }, [content, isLight, messageId]);

    return (
      <div
        className={`math-content text-[14px] sm:text-[15px] leading-[1.7] max-w-full break-words ${
          isLight ? 'text-slate-800' : 'text-slate-200'
        } ${className}`}
      >
        {renderedElements}
      </div>
    );
  }
);

MathRenderer.displayName = 'MathRenderer';

/**
 * Dedicated block equation renderer for single formulas or theorems.
 * Isolated so a malformed formula never crashes the message.
 */
export const MathBlock: React.FC<{
  formula: string;
  className?: string;
  variant?: 'light' | 'dark';
  messageId?: string;
}> = React.memo(({ formula, className = '', variant = 'dark', messageId }) => {
  const isLight = variant === 'light';

  const rendered = useMemo(() => {
    if (!formula || typeof formula !== 'string') {
      return { html: '', fallbackText: '', usedFallback: false };
    }
    return getCachedKatexRender(formula, true, messageId);
  }, [formula, messageId]);

  if (rendered.fallbackText && !rendered.html) {
    return (
      <div
        className={`katex-display-block overflow-x-auto max-w-full py-2 px-3 rounded-lg text-center font-mono text-xs sm:text-sm ${
          isLight
            ? 'bg-slate-100/90 text-slate-800 border border-slate-200/80'
            : 'bg-slate-800/80 text-sky-300 border border-slate-700/80'
        } ${className}`}
        title="Displayed in readable mathematical format"
      >
        {rendered.fallbackText}
      </div>
    );
  }

  return (
    <div
      className={`katex-display-block overflow-x-auto max-w-full py-2 text-center ${
        isLight ? 'text-slate-900' : 'text-sky-300'
      } font-medium ${className}`}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  );
});

MathBlock.displayName = 'MathBlock';

/**
 * Helper to split a Markdown table row by `|` WITHOUT splitting on `\mid` or `\|` or `|` inside `$...$` math blocks.
 */
function splitTableRowSafely(line: string): string[] {
  const trimmed = line.trim().replace(/^\||\|$/g, '');
  const cells: string[] = [];
  let current = '';
  let inMath = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '\\' && i + 1 < trimmed.length) {
      current += ch + trimmed[i + 1];
      i++;
      continue;
    }
    if (ch === '$') {
      inMath = !inMath;
      current += ch;
      continue;
    }
    if (ch === '|' && !inMath) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

/**
 * STAGE 10P SECTION 9: FAULT-TOLERANT TABLE RENDERER WITH READABLE FALLBACK
 * Parses a Markdown table block into a responsive academic table.
 * If the table structure is malformed or uneven, normalizes column counts or falls back
 * to a clean readable structured text block without failing the response.
 */
function renderMarkdownTable(
  tableLines: string[],
  keyPrefix: string,
  isLight: boolean,
  messageId?: string
): React.ReactNode {
  try {
    const rawRows = tableLines
      .map((line) => splitTableRowSafely(line))
      .filter((r) => r.length > 0 && r.some((cell) => cell.length > 0));

    if (rawRows.length === 0) return null;

    // If only 1 pipe-separated line (e.g. "Course | Topic | Score"), render as a clean readable row
    if (rawRows.length === 1) {
      aiRenderTelemetry.logRenderIssue({
        messageId,
        stage: 'table_render',
        errorType: 'SingleRowTableFallback',
        diagnosticSummary: 'Single pipe-delimited line rendered with readable table fallback',
        recoveredWithFallback: true,
      });
      return (
        <div
          key={keyPrefix}
          className={`my-3 p-3 rounded-xl border overflow-x-auto text-xs sm:text-sm font-medium ${
            isLight
              ? 'border-slate-200 bg-slate-50 text-slate-800'
              : 'border-slate-800 bg-slate-900/60 text-slate-200'
          }`}
        >
          {rawRows[0].map((cell, idx) => (
            <span key={idx} className="inline-flex items-center">
              {idx > 0 && <span className="mx-2 text-slate-400">|</span>}
              <span>{renderInlineMathAndFormatting(cell, isLight, messageId)}</span>
            </span>
          ))}
        </div>
      );
    }

    const isSeparatorRow = (row: string[]) =>
      row.every((c) => /^[:\-\s]+$/.test(c) && c.includes('-'));

    const headerRow = rawRows[0];
    const hasSeparator = rawRows.length >= 2 && isSeparatorRow(rawRows[1]);
    const bodyRows = (hasSeparator ? rawRows.slice(2) : rawRows.slice(1)).filter(
      (r) => !isSeparatorRow(r)
    );

    const maxCols = Math.max(
      headerRow.length,
      ...bodyRows.map((r) => r.length)
    );

    if (maxCols === 0 || maxCols > 20) {
      throw new Error(`Invalid table column count: ${maxCols}`);
    }

    // Pad any ragged rows so malformed column counts never break table layout
    const normalizedHeader = Array.from(
      { length: maxCols },
      (_, idx) => headerRow[idx] ?? ''
    );

    return (
      <div
        key={keyPrefix}
        className={`my-4 overflow-x-auto max-w-full rounded-xl border ${
          isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/60'
        }`}
      >
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr
              className={
                isLight
                  ? 'bg-slate-50 border-b border-slate-200 text-slate-900'
                  : 'bg-slate-800/80 border-b border-slate-700 text-slate-100'
              }
            >
              {normalizedHeader.map((cell, cIdx) => (
                <th key={cIdx} className="py-2.5 px-3.5 font-semibold whitespace-nowrap">
                  {renderInlineMathAndFormatting(cell, isLight, messageId)}
                </th>
              ))}
            </tr>
          </thead>
          {bodyRows.length > 0 && (
            <tbody
              className={
                isLight
                  ? 'divide-y divide-slate-200/80 text-slate-700'
                  : 'divide-y divide-slate-800 text-slate-300'
              }
            >
              {bodyRows.map((row, rIdx) => {
                const paddedRow = Array.from(
                  { length: maxCols },
                  (_, idx) => row[idx] ?? ''
                );
                return (
                  <tr
                    key={rIdx}
                    className={
                      isLight
                        ? 'hover:bg-slate-50/70 transition-colors'
                        : 'hover:bg-slate-800/40 transition-colors'
                    }
                  >
                    {paddedRow.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3.5 align-top tabular-nums">
                        {renderInlineMathAndFormatting(cell, isLight, messageId)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    );
  } catch (tableErr: any) {
    // Section 9: Readable plain-text/table-like fallback if Markdown table parser fails
    aiRenderTelemetry.logRenderIssue({
      messageId,
      stage: 'table_render',
      errorType: 'MalformedMarkdownTable',
      diagnosticSummary: tableErr?.message || 'Fallback to readable text table',
      recoveredWithFallback: true,
    });
    return (
      <div
        key={`${keyPrefix}-fallback`}
        className={`my-3 p-3.5 rounded-xl border overflow-x-auto font-mono text-xs sm:text-sm space-y-1 ${
          isLight
            ? 'border-slate-200 bg-slate-50 text-slate-800'
            : 'border-slate-800 bg-slate-900/60 text-slate-200'
        }`}
      >
        {tableLines.map((line, lIdx) => (
          <div key={lIdx} className="whitespace-pre-wrap break-words">
            {line}
          </div>
        ))}
      </div>
    );
  }
}

/**
 * Parse paragraphs, multiline display math $$...$$, headers, tables, blockquotes, and lists.
 * Each block is isolated so a failure in one block never discards the rest of the message.
 */
function renderMarkdownAndMath(
  text: string,
  isLight: boolean,
  messageId?: string
): React.ReactNode[] {
  const lines = text.split('\n');
  const renderedNodes: React.ReactNode[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length === 0) return;
    const paraText = currentParagraphLines.join('\n').trim();
    if (paraText) {
      renderedNodes.push(
        <div
          key={`p-${renderedNodes.length}`}
          className={`leading-[1.75] min-w-0 max-w-full break-words ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}
        >
          {renderInlineMathAndFormatting(paraText, isLight, messageId)}
        </div>
      );
    }
    currentParagraphLines = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Multi-line or single-line Display Math $$ ... $$
    if (trimmed.startsWith('$$')) {
      flushParagraph();
      if (trimmed.endsWith('$$') && trimmed.length > 4) {
        const formula = trimmed.slice(2, -2).trim();
        renderedNodes.push(
          <div
            key={`disp-math-${renderedNodes.length}`}
            className="my-3.5 py-2 px-2 overflow-x-auto max-w-full text-center"
          >
            <MathBlock
              formula={formula}
              variant={isLight ? 'light' : 'dark'}
              messageId={messageId}
            />
          </div>
        );
        i++;
        continue;
      } else {
        // Multi-line $$ block
        const mathLines: string[] = [];
        const firstLineRest = trimmed.slice(2).trim();
        if (firstLineRest) mathLines.push(firstLineRest);
        i++;
        while (i < lines.length) {
          const cur = lines[i].trim();
          if (cur.endsWith('$$')) {
            const beforeEnd = cur.slice(0, -2).trim();
            if (beforeEnd) mathLines.push(beforeEnd);
            i++;
            break;
          }
          mathLines.push(lines[i]);
          i++;
        }
        const formula = mathLines.join('\n').trim();
        if (formula) {
          renderedNodes.push(
            <div
              key={`disp-math-multi-${renderedNodes.length}`}
              className="my-3.5 py-2 px-2 overflow-x-auto max-w-full text-center"
            >
              <MathBlock
                formula={formula}
                variant={isLight ? 'light' : 'dark'}
                messageId={messageId}
              />
            </div>
          );
        }
        continue;
      }
    }

    // 2. Markdown Tables (lines containing | pipe columns, even if missing leading/trailing |)
    const isLikelyTableLine = (l: string) => {
      const t = l.trim();
      if (!t || t.startsWith('$$') || t.startsWith('>') || /^#{1,4}\s/.test(t)) return false;
      if (t.startsWith('|') && t.endsWith('|') && t.split('|').length >= 3) return true;
      // Also detect pipe-separated tables without outer pipes when followed by a separator or second pipe row
      const pipeParts = splitTableRowSafely(t);
      return t.includes('|') && pipeParts.length >= 3 && !t.includes('||');
    };

    if (
      isLikelyTableLine(trimmed) &&
      (trimmed.startsWith('|') ||
        (i + 1 < lines.length && isLikelyTableLine(lines[i + 1])))
    ) {
      flushParagraph();
      const tableLines: string[] = [];
      while (i < lines.length && isLikelyTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const tableNode = renderMarkdownTable(
        tableLines,
        `table-${renderedNodes.length}`,
        isLight,
        messageId
      );
      if (tableNode) {
        renderedNodes.push(tableNode);
        continue;
      }
    }

    // 3. Horizontal Rule (--- or ***)
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      renderedNodes.push(
        <hr
          key={`hr-${renderedNodes.length}`}
          className={`my-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}
        />
      );
      i++;
      continue;
    }

    // 4. Blockquotes (> ...)
    if (trimmed.startsWith('>')) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      renderedNodes.push(
        <blockquote
          key={`quote-${renderedNodes.length}`}
          className={`my-3 pl-3.5 border-l-2 italic ${
            isLight
              ? 'border-blue-600/60 text-slate-700 bg-slate-50/70 py-2 pr-3 rounded-r-lg'
              : 'border-sky-500/60 text-slate-300'
          }`}
        >
          {renderInlineMathAndFormatting(quoteLines.join('\n'), isLight, messageId)}
        </blockquote>
      );
      continue;
    }

    // 5. Markdown Headings (#, ##, ###, ####)
    if (trimmed.startsWith('#### ')) {
      flushParagraph();
      renderedNodes.push(
        <h5
          key={`h5-${renderedNodes.length}`}
          className={`text-xs sm:text-sm font-semibold mt-3.5 mb-1 ${
            isLight ? 'text-slate-900' : 'text-slate-200'
          }`}
        >
          {renderInlineMathAndFormatting(trimmed.slice(5), isLight, messageId)}
        </h5>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      renderedNodes.push(
        <h4
          key={`h4-${renderedNodes.length}`}
          className={`text-sm sm:text-[15px] font-semibold mt-4 mb-1.5 ${
            isLight ? 'text-slate-900' : 'text-sky-400'
          }`}
        >
          {renderInlineMathAndFormatting(trimmed.slice(4), isLight, messageId)}
        </h4>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      renderedNodes.push(
        <h3
          key={`h3-${renderedNodes.length}`}
          className={`text-[15px] sm:text-base font-bold mt-5 mb-2 pb-1 border-b ${
            isLight
              ? 'text-slate-900 border-slate-200/80'
              : 'text-slate-100 border-slate-800/80'
          }`}
        >
          {renderInlineMathAndFormatting(trimmed.slice(3), isLight, messageId)}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      renderedNodes.push(
        <h2
          key={`h2-${renderedNodes.length}`}
          className={`text-base sm:text-lg font-bold mt-5 mb-2 ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}
        >
          {renderInlineMathAndFormatting(trimmed.slice(2), isLight, messageId)}
        </h2>
      );
      i++;
      continue;
    }

    // 6. Bullet Lists (- or * or •)
    if (/^([\*\-\u2022])\s+/.test(trimmed)) {
      flushParagraph();
      const bulletContent = trimmed.replace(/^([\*\-\u2022])\s+/, '');
      renderedNodes.push(
        <div
          key={`bullet-${renderedNodes.length}`}
          className={`flex items-start gap-2.5 pl-1.5 my-1.5 ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 ${
              isLight ? 'bg-slate-400' : 'bg-sky-400/80'
            }`}
          />
          <div className="flex-1 min-w-0 leading-[1.7] break-words">
            {renderInlineMathAndFormatting(bulletContent, isLight, messageId)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 7. Numbered Lists (1. or 2. )
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      flushParagraph();
      renderedNodes.push(
        <div
          key={`num-${renderedNodes.length}`}
          className={`flex items-start gap-2.5 pl-1 my-1.5 ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}
        >
          <span
            className={`font-semibold text-xs sm:text-sm shrink-0 mt-0.5 select-none tabular-nums ${
              isLight ? 'text-slate-900' : 'text-sky-400'
            }`}
          >
            {numberedMatch[1]}.
          </span>
          <div className="flex-1 min-w-0 leading-[1.7] break-words">
            {renderInlineMathAndFormatting(numberedMatch[2], isLight, messageId)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Empty line flushes current paragraph
    if (trimmed === '') {
      flushParagraph();
      i++;
      continue;
    }

    currentParagraphLines.push(line);
    i++;
  }

  flushParagraph();
  return renderedNodes;
}

/**
 * Tokenizes a string of text to handle inline math $...$, block math $$...$$,
 * bracketed inline/block math [ \frac{...} ], bold **...**, italic *...*, and inline code `...`.
 * Also repairs unambiguous unclosed inline $... at end of line if it contains clear LaTeX commands.
 */
function renderInlineMathAndFormatting(
  lineText: string,
  isLight: boolean,
  messageId?: string
): React.ReactNode[] {
  if (!lineText) return [];

  // Safely close an unclosed inline $ at the end of a line ONLY when it clearly contains a LaTeX backslash command
  let normalizedLine = lineText;
  const singleDollars = normalizedLine.replace(/\$\$/g, '').match(/(?<!\\)\$/g);
  if (singleDollars && singleDollars.length % 2 === 1) {
    const lastDollarIdx = normalizedLine.lastIndexOf('$');
    const tailAfterDollar = normalizedLine.slice(lastDollarIdx + 1);
    if (/\\[a-zA-Z]+|[_^]\{/.test(tailAfterDollar)) {
      normalizedLine = `${normalizedLine}$`;
      aiRenderTelemetry.logRenderIssue({
        messageId,
        stage: 'normalization',
        errorType: 'UnclosedInlineDollarDelimiter',
        diagnosticSummary: 'Closed unambiguous unclosed inline $ math expression at end of line',
        recoveredWithFallback: true,
      });
    }
  }

  // Also convert inline [ \frac{...} ] or [ \int ... ] or [ \sum ... ] inside a line into $$...$$ or $...$
  normalizedLine = normalizedLine.replace(
    /\[\s*(\\(?:frac|int|sum|prod|lim|sqrt|begin|bar|vec|hat|partial|nabla|binom)[^\[\]]*?|[a-zA-Z0-9_{}^+\-*/=(),.\s]+\\(?:frac|int|sum|prod|lim|sqrt|mid|to|infty)[^\[\]]*?)\s*\](?!\s*\()/g,
    (_m, inner) => `$$${inner.trim()}$$`
  );

  const mathRegex = /(\$\$[\s\S]*?\$\$|\$(?:\\\$|[^\$\n])+\$|`[^`\n]+`)/g;

  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(normalizedLine)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`txt-${lastIndex}`}>
          {formatBoldItalicAndLinks(
            normalizedLine.substring(lastIndex, match.index),
            isLight
          )}
        </span>
      );
    }

    const matchedStr = match[0];

    if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      tokens.push(
        <code
          key={`code-inline-${match.index}`}
          className={`px-1.5 py-0.5 rounded font-mono text-[12px] border break-all ${
            isLight
              ? 'bg-slate-100 text-slate-800 border-slate-200/80'
              : 'bg-slate-800 text-sky-300 border-slate-700/50'
          }`}
        >
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else {
      let isBlock = false;
      let formula = '';

      if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
        isBlock = true;
        formula = matchedStr.slice(2, -2).trim();
      } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
        isBlock = false;
        formula = matchedStr.slice(1, -1).trim();
      }

      // If an inline formula contains \begin{aligned} or matrix environments, render as display block
      if (
        formula.includes('\\begin{align') ||
        formula.includes('\\begin{pmatrix') ||
        formula.includes('\\begin{bmatrix') ||
        formula.includes('\\begin{vmatrix') ||
        formula.includes('\\begin{matrix') ||
        formula.includes('\\begin{cases')
      ) {
        isBlock = true;
      }

      const katexResult = getCachedKatexRender(formula, isBlock, messageId);

      if (!katexResult.usedFallback && katexResult.html) {
        if (isBlock) {
          tokens.push(
            <div
              key={`math-block-${match.index}`}
              className={`my-2.5 py-1.5 px-2 overflow-x-auto max-w-full font-medium text-center ${
                isLight ? 'text-slate-900' : 'text-sky-300'
              }`}
              dangerouslySetInnerHTML={{ __html: katexResult.html }}
            />
          );
        } else {
          tokens.push(
            <span
              key={`math-inline-${match.index}`}
              className={`inline-block max-w-full overflow-x-auto px-0.5 font-medium align-baseline ${
                isLight ? 'text-slate-900' : 'text-sky-300'
              }`}
              dangerouslySetInnerHTML={{ __html: katexResult.html }}
            />
          );
        }
      } else {
        // STAGE 10P SECTION 7: Isolated KaTeX error fallback — preserve readable math and continue rendering
        tokens.push(
          <span
            key={`math-fallback-${match.index}`}
            className={`font-mono text-xs px-1.5 py-0.5 rounded inline-block max-w-full overflow-x-auto align-baseline ${
              isLight
                ? 'bg-slate-100 text-slate-800 border border-slate-200/80'
                : 'bg-slate-800 text-sky-300 border border-slate-700/80'
            }`}
            title="Displayed in readable mathematical format"
          >
            {katexResult.fallbackText}
          </span>
        );
      }
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < normalizedLine.length) {
    tokens.push(
      <span key={`txt-end-${lastIndex}`}>
        {formatBoldItalicAndLinks(normalizedLine.substring(lastIndex), isLight)}
      </span>
    );
  }

  return tokens;
}

/**
 * Formats plain-text mathematical exponents (e.g. x^2, 10^-3, e^{ix}) and subscripts (e.g. x_i, H_0, H_1)
 * that appear outside $...$ delimiters so mathematical meaning is never flattened into "x2".
 */
function renderPlainTextMathNotation(text: string): React.ReactNode {
  if (!text || (!text.includes('^') && !text.includes('_'))) {
    return text;
  }

  const notationRegex =
    /\b([a-zA-Z0-9]+)\^(\{[^{}]+\}|[+\-]?[a-zA-Z0-9]+)|\b([a-zA-Z])_(\{[^{}]+\}|[0-9iIjkmn]+)\b/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = notationRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(text.slice(lastIdx, m.index));
    }

    if (m[1] !== undefined && m[2] !== undefined) {
      const base = m[1];
      const exp = m[2].replace(/^\{|\}$/g, '');
      parts.push(
        <span key={`exp-${m.index}`} className="whitespace-nowrap font-medium">
          {base}
          <sup className="text-[0.78em] leading-none">{exp}</sup>
        </span>
      );
    } else if (m[3] !== undefined && m[4] !== undefined) {
      const base = m[3];
      const sub = m[4].replace(/^\{|\}$/g, '');
      parts.push(
        <span key={`sub-${m.index}`} className="whitespace-nowrap font-medium">
          {base}
          <sub className="text-[0.78em] leading-none">{sub}</sub>
        </span>
      );
    }

    lastIdx = m.index + m[0].length;
  }

  if (parts.length === 0) return text;
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }
  return parts;
}

/**
 * Formats markdown bold **bold**, italic *italic*, and sanitized http/https links [label](url).
 */
function formatBoldItalicAndLinks(rawText: string, isLight: boolean): React.ReactNode {
  const parts = rawText.split(/(\*\*[\s\S]*?\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
      return (
        <strong
          key={i}
          className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}
        >
          {renderPlainTextMathNotation(chunk.slice(2, -2))}
        </strong>
      );
    }
    if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      return (
        <em key={i} className={`italic ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
          {renderPlainTextMathNotation(chunk.slice(1, -1))}
        </em>
      );
    }
    // Section 21 Security: Only render links with safe http:// or https:// protocols
    const linkMatch = chunk.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/i);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 font-medium break-all ${
            isLight ? 'text-blue-600 hover:text-blue-700' : 'text-sky-400 hover:text-sky-300'
          }`}
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <React.Fragment key={i}>{renderPlainTextMathNotation(chunk)}</React.Fragment>;
  });
}
