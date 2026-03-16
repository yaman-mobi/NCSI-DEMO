import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Catches React render errors and shows a friendly fallback so the app
 * doesn't blank the screen. Production-ready for demo and beyond.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof window !== 'undefined' && window.console) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-portal-bg-section px-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md rounded-portal-lg border border-portal-border bg-white p-8 shadow-card text-center">
          <h1 className="font-display text-xl font-bold text-portal-navy-dark mb-2">
            Something went wrong
          </h1>
          <p className="text-portal-gray-muted text-sm mb-6">
            We&apos;re sorry. The page encountered an error. Please try again or return to the home page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-portal-md bg-portal-blue-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-portal-blue-primary focus:ring-offset-2"
            >
              Try again
            </button>
            <Link
              to="/"
              className="rounded-portal-md border border-portal-border bg-white px-4 py-2 text-sm font-medium text-portal-navy hover:bg-portal-bg-alt focus:outline-none focus:ring-2 focus:ring-portal-blue-primary focus:ring-offset-2"
            >
              Go to home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
