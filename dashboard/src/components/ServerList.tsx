import type { ReactElement } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import type { ServerWithStatus } from '@/routes/_authenticated/servers';

export function ServerList({
    servers,
    onSelectServer,
}: {
    servers: ServerWithStatus[];
    onSelectServer: (server: ServerWithStatus) => void;
}): ReactElement {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Hostname
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Last Seen
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {servers.map((server) => (
                        <tr
                            key={server.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {server.displayName}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {server.hostname || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={server.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {server.lastSeen}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onSelectServer(server)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                    {servers.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                                No servers registered yet. Add a new server to get
                                started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
