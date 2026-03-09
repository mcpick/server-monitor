import type { ReactElement } from 'react';

interface AppHeaderProps {
    onMobileMenuToggle: () => void;
}

export function AppHeader({
    onMobileMenuToggle,
}: AppHeaderProps): ReactElement {
    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <div className="flex items-center py-3 px-4">
                <button
                    type="button"
                    onClick={onMobileMenuToggle}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Open menu"
                >
                    <svg
                        className="size-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Server Monitor
                </span>
            </div>
        </header>
    );
}
