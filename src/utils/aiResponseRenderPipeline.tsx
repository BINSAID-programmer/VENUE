import React, { Component, ErrorInfo, ReactNode } from 'react';

// ============================================================================
// STAGE 10P: AI RESPONSE RENDERING STABILITY, SAFE PIPELINE & OBSERVABILITY
// ============================================================================
// Core Architecture Rule:
// Separate Stage A (AI Response Generation) from Stage B (Response Rendering).
// A failure in Stage B MUST NEVER replace or discard the raw AI response with
// "Unable to complete response".
// ============================================================================

export type AIRendererStage =
  | 'validation'
  | 'normalization'
  | 'markdown_parse'
  | 'math_detection'
  | 'katex_render'
  | 'table_render'
  | 'code_block_render'
  | 'citation_render'
  | 'chart_render'
  | 'diagram_render'
  | 'message_container';

export type AIRenderTelemetryCounter =
  | 'renderSuccess'
  | 'renderFallback'
  | 'generationFailure'
  | 'latexRenderFailure'
  | 'markdownRenderFailure'
  | 'tableFallback'
  | 'codeBlockFallback'
  | 'citationFallback'
  | 'jsonRecoverySuccess';

export interface AIRenderDiagnosticEvent {
  timestamp: string;
  messageId: string;
  stage: AIRendererStage;
  errorType: string;
  diagnosticSummary: string;
  recoveredWithFallback: boolean;
}

class AIRenderObservabilityTracker {
  private counters: Record<AIRenderTelemetryCounter, number> = {
    renderSuccess: 0,
    renderFallback: 0,
    generationFailure: 0,
    latexRenderFailure: 0,
    markdownRenderFailure: 0,
    tableFallback: 0,
    codeBlockFallback: 0,
    citationFallback: 0,
    jsonRecoverySuccess: 0,
  };

  private recentDiagnostics: AIRenderDiagnosticEvent[] = [];
  private readonly MAX_DIAGNOSTICS = 60;
  private loggedKeys = new Set<string>();

  public increment(counter: AIRenderTelemetryCounter): void {
    this.counters[counter] = (this.counters[counter] || 0) + 1;
  }

  /**
   * Logs developer-level diagnostic information for rendering failures
   * without logging passwords, API keys, auth tokens, or sensitive user data (Section 26 & 27).
   * Deduplicates by messageId + stage + summary so re-renders do not spam logs.
   */
  public logRenderIssue(params: {
    messageId?: string;
    stage: AIRendererStage;
    errorType: string;
    diagnosticSummary: string;
    recoveredWithFallback?: boolean;
  }): void {
    const safeMsgId = (params.messageId || 'msg_unknown').slice(0, 64);
    const safeSummary = this.redactSensitivePatterns(params.diagnosticSummary).slice(0, 220);
    const dedupeKey = `${safeMsgId}:${params.stage}:${params.errorType}:${safeSummary.slice(0, 60)}`;

    if (this.loggedKeys.has(dedupeKey)) {
      return;
    }
    this.loggedKeys.add(dedupeKey);
    if (this.loggedKeys.size > 400) {
      const firstKey = this.loggedKeys.values().next().value;
      if (firstKey) this.loggedKeys.delete(firstKey);
    }

    const event: AIRenderDiagnosticEvent = {
      timestamp: new Date().toISOString(),
      messageId: safeMsgId,
      stage: params.stage,
      errorType: params.errorType,
      diagnosticSummary: safeSummary,
      recoveredWithFallback: params.recoveredWithFallback ?? true,
    };

    this.recentDiagnostics.unshift(event);
    if (this.recentDiagnostics.length > this.MAX_DIAGNOSTICS) {
      this.recentDiagnostics.pop();
    }

    this.increment('renderFallback');
    if (params.stage === 'katex_render' || params.stage === 'math_detection') {
      this.increment('latexRenderFailure');
    } else if (params.stage === 'markdown_parse') {
      this.increment('markdownRenderFailure');
    } else if (params.stage === 'table_render') {
      this.increment('tableFallback');
    } else if (params.stage === 'code_block_render') {
      this.increment('codeBlockFallback');
    } else if (params.stage === 'citation_render') {
      this.increment('citationFallback');
    }

    console.warn(
      `[VENUE AI Renderer Diagnostic] messageId=${safeMsgId} | stage=${params.stage} | type=${params.errorType} | fallback=${event.recoveredWithFallback} | info=${safeSummary}`
    );
  }

  public logGenerationFailure(reason: string): void {
    this.increment('generationFailure');
    const safeReason = this.redactSensitivePatterns(reason).slice(0, 200);
    console.warn(`[VENUE AI Generation Failure] reason=${safeReason}`);
  }

  public getMetricsSnapshot() {
    return {
      counters: { ...this.counters },
      recentDiagnostics: [...this.recentDiagnostics],
    };
  }

  private redactSensitivePatterns(input: string): string {
    if (!input) return '';
    return String(input)
      .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_KEY]')
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED_TOKEN]')
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]');
  }
}

export const aiRenderTelemetry = new AIRenderObservabilityTracker();

/**
 * Sanitizes an SVG string so it cannot execute inline scripts or event handlers (Section 21 Security).
 */
export function sanitizeDiagramSvg(rawSvg?: string): string | null {
  if (!rawSvg || typeof rawSvg !== 'string') return null;
  const trimmed = rawSvg.trim();
  if (!trimmed.includes('<svg') || !trimmed.includes('</svg>')) return null;

  const startIdx = trimmed.indexOf('<svg');
  const endIdx = trimmed.lastIndexOf('</svg>') + 6;
  if (startIdx === -1 || endIdx <= startIdx) return null;

  const extracted = trimmed.slice(startIdx, endIdx);
  return extracted
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

/**
 * Validates and filters source citations so malformed source items are hidden safely
 * without crashing the response or inventing fake citations (Section 11).
 */
export function filterValidCitations<T extends Record<string, any>>(
  citations: T[] | undefined | null,
  messageId?: string
): T[] {
  if (!Array.isArray(citations)) return [];
  const valid: T[] = [];

  for (let i = 0; i < citations.length; i++) {
    const item = citations[i];
    if (
      item &&
      typeof item === 'object' &&
      typeof item.title === 'string' &&
      item.title.trim().length > 0 &&
      typeof item.courseCode === 'string' &&
      item.courseCode.trim().length > 0
    ) {
      valid.push(item);
    } else {
      aiRenderTelemetry.logRenderIssue({
        messageId,
        stage: 'citation_render',
        errorType: 'MalformedSourceMetadata',
        diagnosticSummary: `Skipped invalid source citation at index ${i}`,
        recoveredWithFallback: true,
      });
    }
  }
  return valid;
}

/**
 * Detects whether a stored message was mistakenly marked `isError: true` due to the
 * legacy formatting/JSON bug ("The AI response could not be formatted properly...").
 */
export function isLegacyFormattingFalseError(text?: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim().toLowerCase();
  return (
    t.includes('the ai response could not be formatted properly') ||
    t.includes('could not format the response properly')
  );
}

/**
 * Client-side recovery if `msg.text` is accidentally a raw JSON payload or markdown-fenced JSON
 * from an older chat history message or partial structured response.
 */
export function recoverStructuredTextIfRawJson(rawText: string): {
  text: string;
  formula?: string;
  steps?: string[];
  suggestions?: string[];
} {
  if (!rawText || typeof rawText !== 'string') {
    return { text: '' };
  }
  const trimmed = rawText.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('```json')) {
    return { text: rawText };
  }

  const candidate = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!candidate.startsWith('{')) {
    return { text: rawText };
  }

  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === 'object' && typeof parsed.text === 'string') {
      aiRenderTelemetry.increment('jsonRecoverySuccess');
      return {
        text: parsed.text,
        formula: typeof parsed.formula === 'string' ? parsed.formula : undefined,
        steps: Array.isArray(parsed.steps)
          ? parsed.steps.map((s: any) => String(s)).filter(Boolean)
          : undefined,
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.map((s: any) => String(s)).filter(Boolean)
          : undefined,
      };
    }
  } catch {
    // Attempt regex extraction of "text": "..." when raw LaTeX backslashes broke JSON.parse
    const textMatch = candidate.match(/"text"\s*:\s*"((?:\\.|[^"\\])*)"/);
    if (textMatch && textMatch[1]) {
      const recovered = textMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      if (recovered.trim().length > 0) {
        aiRenderTelemetry.increment('jsonRecoverySuccess');
        return { text: recovered };
      }
    }
  }

  return { text: rawText };
}

interface SafeSectionErrorBoundaryProps {
  messageId?: string;
  stage: AIRendererStage;
  rawFallbackText?: string;
  children: ReactNode;
}

interface SafeSectionErrorBoundaryState {
  hasError: boolean;
  retryCount: number;
}

/**
 * Component-level React Error Boundary for isolating individual rendering sub-components
 * (charts, diagrams, citations, or full message formatting).
 * If a child component throws during render, it logs the diagnostic and either displays
 * the preserved raw text or hides the broken visual widget without ever showing
 * "Unable to complete response" (Sections 2, 3, 4, 15, 16).
 */
export class SafeRenderErrorBoundary extends Component<
  SafeSectionErrorBoundaryProps,
  SafeSectionErrorBoundaryState
> {
  constructor(props: SafeSectionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<SafeSectionErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    aiRenderTelemetry.logRenderIssue({
      messageId: this.props.messageId,
      stage: this.props.stage,
      errorType: error?.name || 'ReactRenderException',
      diagnosticSummary: `${error?.message || 'Component render error'} ${
        errorInfo?.componentStack ? errorInfo.componentStack.slice(0, 100) : ''
      }`,
      recoveredWithFallback: true,
    });
  }

  componentDidUpdate(prevProps: SafeSectionErrorBoundaryProps): void {
    if (
      prevProps.rawFallbackText !== this.props.rawFallbackText &&
      this.state.hasError
    ) {
      this.setState({ hasError: false });
    }
  }

  handleRetrySafeRender = (): void => {
    this.setState((prev) => ({
      hasError: false,
      retryCount: prev.retryCount + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If rawFallbackText is provided (e.g. main message text or step text), always display the readable text
      if (typeof this.props.rawFallbackText === 'string' && this.props.rawFallbackText.trim()) {
        return (
          <div className="space-y-2">
            <div className="whitespace-pre-wrap break-words text-[14px] sm:text-[15px] leading-[1.75] text-slate-800">
              {this.props.rawFallbackText}
            </div>
            {this.state.retryCount < 2 && (
              <button
                type="button"
                onClick={this.handleRetrySafeRender}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer"
              >
                Retry rich formatting
              </button>
            )}
          </div>
        );
      }
      // For optional visual widgets (charts, diagrams, citations), fail silently so the text response remains intact
      return null;
    }

    return <React.Fragment key={this.state.retryCount}>{this.props.children}</React.Fragment>;
  }
}
