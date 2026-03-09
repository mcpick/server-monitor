import type { ReactElement } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { ensureAuthenticated } from '../lib/auth';

function AuthenticatedLayout(): ReactElement {
    return <Outlet />;
}

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async () => {
        const authenticated = await ensureAuthenticated();
        if (!authenticated) {
            throw redirect({
                to: '/login',
            });
        }
    },
    component: AuthenticatedLayout,
});
