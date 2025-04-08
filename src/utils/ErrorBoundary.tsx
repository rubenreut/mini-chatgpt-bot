import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        // Use function fallback if applicable
        if (typeof fallback === 'function' && error) {
          // Cast the function return type to ReactNode
          return fallback(error, this.resetError) as ReactNode;
        }
        // Otherwise use the provided ReactNode fallback
        return fallback as ReactNode;
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please refresh the page or try again later.</p>
          <button onClick={this.resetError} className="error-reset-button">
            Reset Application
          </button>
          <details className="error-details">
            <summary>Error Details</summary>
            <pre>{error && error.toString()}</pre>
          </details>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
