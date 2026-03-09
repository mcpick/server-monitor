import { useState, type ReactElement } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { checkAuth } from '@/lib/server/checkAuth';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';

function AuthenticatedLayout(): ReactElement {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    function handleToggleSidebar(): void {
        setSidebarOpen((prev) => !prev);
    }

    function handleCloseSidebar(): void {
        setSidebarOpen(false);
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <AppSidebar
                isMobileOpen={sidebarOpen}
                onMobileClose={handleCloseSidebar}
            />
            <div className="flex flex-1 flex-col min-w-0">
                <AppHeader onMobileMenuToggle={handleToggleSidebar} />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
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
