import React from 'react';

interface ScreenErrorBoundaryProps {
  screenName: string;
  children: React.ReactNode;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
}

/**
 * Keeps a crash inside one screen from blanking the whole app.
 * Shows a small retry card instead of an empty page.
 */
export class ScreenErrorBoundary extends React.Component<
  ScreenErrorBoundaryProps,
  ScreenErrorBoundaryState
> {
  state: ScreenErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ScreenErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`VENUE: ${this.props.screenName} failed to render:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-slate-200">
          <p className="font-semibold mb-1">{this.props.screenName} could not load</p>
          <p className="text-sm text-slate-400 mb-4">Something went wrong. Please try again.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
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
