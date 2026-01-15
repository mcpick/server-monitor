import { useState, Component, type ReactNode, type ReactElement } from 'react';
import { isAuthenticated } from './lib/auth';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
            <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App(): ReactElement {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  function handleLoginSuccess(): void {
    setAuthenticated(true);
  }

  function handleLogout(): void {
    setAuthenticated(false);
  }

  return (
    <ErrorBoundary>
      {authenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onSuccess={handleLoginSuccess} />
      )}
    </ErrorBoundary>
  );
}

export { App };
