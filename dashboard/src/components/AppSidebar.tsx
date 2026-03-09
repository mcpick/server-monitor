import type { ReactElement } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useActiveAlerts } from '@/hooks/useMetrics';
import { logout } from '@/lib/auth';

interface AppSidebarProps {
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

export function AppSidebar({
    isMobileOpen,
    onMobileClose,
}: AppSidebarProps): ReactElement {
    const navigate = useNavigate();
    const { data: activeAlerts } = useActiveAlerts();
    const activeAlertCount = activeAlerts?.length ?? 0;

    async function handleLogout(): Promise<void> {
        await logout();
        void navigate({ to: '/login' });
    }

    const navItems = [
        {
            to: '/' as const,
            label: 'Dashboard',
            exact: true,
            icon: (
                <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                </svg>
            ),
        },
        {
            to: '/servers' as const,
            label: 'Servers',
            exact: false,
            icon: (
                <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                </svg>
            ),
        },
        {
            to: '/alerts' as const,
            label: 'Alerts',
            exact: false,
            icon: (
                <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
            ),
        },
    ];

    const sidebarContent = (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700">
                <svg
                    className="size-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Server Monitor
                </span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        activeOptions={{ exact: item.exact }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors [&>svg]:text-gray-400 dark:[&>svg]:text-gray-500"
                        activeProps={{
                            className:
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-600 dark:border-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
                        }}
                        onClick={onMobileClose}
                    >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                        {item.to === '/alerts' && activeAlertCount > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                                {activeAlertCount}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-4 space-y-3">
                <ThemeToggle />
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <svg
                        className="size-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                {sidebarContent}
            </div>

            {/* Mobile sidebar overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <button
                        type="button"
                        className="fixed inset-0 bg-black/50"
                        onClick={onMobileClose}
                        aria-label="Close menu"
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}
