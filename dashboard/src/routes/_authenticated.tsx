import type { ReactElement } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '../lib/auth';

function AuthenticatedLayout(): ReactElement {
    return <Outlet />;
}

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: () => {
        if (!isAuthenticated()) {
            throw redirect({
                to: '/login',
            });
        }
    },
    component: AuthenticatedLayout,
});
