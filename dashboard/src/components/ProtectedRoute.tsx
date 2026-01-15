import { useState, type ReactNode, type ReactElement } from 'react';
import { isAuthenticated } from '../lib/auth';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): ReactElement {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  function handleLoginSuccess(): void {
    setAuthenticated(true);
  }

  if (!authenticated) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  return <>{children}</>;
}
