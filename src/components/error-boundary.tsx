'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // TODO: Log to error tracking service (e.g., Sentry)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-4">
            <Button onClick={this.handleReset}>
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 max-w-2xl text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-xs">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component
 * 
 * Reusable error fallback UI for specific error boundaries
 */
export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  description,
}: {
  error: Error;
  resetError: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-3 text-4xl">⚠️</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-4 max-w-md text-sm text-muted-foreground">
        {description || error.message}
      </p>
      <Button onClick={resetError} size="sm">
        Try Again
      </Button>
    </div>
  );
}

// Made with Bob
