import type { ReactElement } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { checkAuth } from '@/lib/server/checkAuth';

function AuthenticatedLayout(): ReactElement {
    return <Outlet />;
}

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async () => {
        const authenticated = await checkAuth();
        if (!authenticated) {
            throw redirect({
                to: '/login',
            });
        }
    },
    component: AuthenticatedLayout,
});
