import { ReactNode, useState, useEffect } from 'react';
import { isAuthenticated } from '../lib/auth';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  return <>{children}</>;
}
