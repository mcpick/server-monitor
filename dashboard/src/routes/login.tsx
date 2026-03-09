import type { ReactElement } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/components/LoginForm';
import { checkAuth } from '@/lib/server/checkAuth';

function LoginPage(): ReactElement {
    const navigate = useNavigate();

    function handleLoginSuccess(): void {
        void navigate({ to: '/' });
    }

    return <LoginForm onSuccess={handleLoginSuccess} />;
}

export const Route = createFileRoute('/login')({
    beforeLoad: async () => {
        const authenticated = await checkAuth();
        if (authenticated) {
            throw redirect({
                to: '/',
            });
        }
    },
    component: LoginPage,
});
