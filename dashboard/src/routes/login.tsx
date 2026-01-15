import type { ReactElement } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '../components/LoginForm';
import { isAuthenticated } from '../lib/auth';

function LoginPage(): ReactElement {
    const navigate = useNavigate();

    function handleLoginSuccess(): void {
        void navigate({ to: '/' });
    }

    return <LoginForm onSuccess={handleLoginSuccess} />;
}

export const Route = createFileRoute('/login')({
    beforeLoad: () => {
        if (isAuthenticated()) {
            throw redirect({
                to: '/',
            });
        }
    },
    component: LoginPage,
});
