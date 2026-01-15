import { LoginForm } from '../components/LoginForm';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  return <LoginForm onSuccess={onSuccess} />;
}
