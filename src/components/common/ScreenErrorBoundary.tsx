import React from 'react';

interface ScreenErrorBoundaryProps {
  screenName: string;
  children: React.ReactNode;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Keeps a crash inside one screen from blanking the whole app.
 * Shows a small retry card instead of an empty page.
 */
export class ScreenErrorBoundary extends React.Component<
  ScreenErrorBoundaryProps,
  ScreenErrorBoundaryState
> {
  state: ScreenErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): ScreenErrorBoundaryState {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? 'Unknown error');
    return { hasError: true, message: message.slice(0, 300) };
  }

  componentDidCatch(error: unknown) {
    console.error(`VENUE: ${this.props.screenName} failed to render:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-slate-200">
          <p className="font-semibold mb-1">{this.props.screenName} could not load</p>
          <p className="text-sm text-slate-400 mb-2">Something went wrong. Please try again.</p>
          {this.state.message && (
            <p className="text-[11px] font-mono text-slate-500 mb-4 break-words">
              {this.state.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
