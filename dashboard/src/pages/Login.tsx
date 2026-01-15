import type { ReactElement } from 'react';
import { LoginForm } from '../components/LoginForm';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps): ReactElement {
  return <LoginForm onSuccess={onSuccess} />;
}
