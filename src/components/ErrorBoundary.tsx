import { Component, type ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#050505' }}>
          <div className="text-center p-5">
            <FaExclamationTriangle size={60} className="text-danger mb-4" />
            <h2 className="text-white mb-3">Something went wrong</h2>
            <p className="text-muted mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              type="button"
              className="btn btn-outline-light rounded-pill px-4"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
