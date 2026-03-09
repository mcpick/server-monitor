import type { ReactElement } from 'react';

export type ServerStatus = 'online' | 'offline' | 'unknown';

export function StatusBadge({
    status,
}: {
    status: ServerStatus;
}): ReactElement {
    const colors = {
        online: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        offline: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
        >
            <span
                className={`w-2 h-2 mr-1.5 rounded-full ${
                    status === 'online'
                        ? 'bg-green-500'
                        : status === 'offline'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                }`}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
