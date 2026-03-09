import { useState, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useRegenerateServerTokenMutation } from '@/hooks/useServerMutations';
import { StatusBadge } from '@/components/StatusBadge';
import { CopyButton } from '@/components/CopyButton';
import type { ServerWithStatus } from '@/routes/_authenticated/servers';

export function ServerDetails({
    server,
    onBack,
    onDelete,
}: {
    server: ServerWithStatus;
    onBack: () => void;
    onDelete: (id: string) => void;
}): ReactElement {
    const regenerateTokenMutation = useRegenerateServerTokenMutation();
    const [newToken, setNewToken] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

    function handleRegenerateToken(): void {
        regenerateTokenMutation.mutate(server.id, {
            onSuccess: (data) => {
                setNewToken(data.token);
                setShowRegenerateConfirm(false);
            },
        });
    }

    function handleDeleteServer(): void {
        onDelete(server.id);
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {server.displayName}
                </h2>
                <button
                    onClick={onBack}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    Back to List
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Server Information
                    </h3>
                    <dl className="space-y-2">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600 dark:text-gray-400">
                                Status
                            </dt>
                            <dd>
                                <StatusBadge status={server.status} />
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600 dark:text-gray-400">
                                Display Name
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-white">
                                {server.displayName}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600 dark:text-gray-400">
                                Hostname
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-white font-mono">
                                {server.hostname || '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600 dark:text-gray-400">
                                Server ID
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-white font-mono">
                                {server.id}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600 dark:text-gray-400">
                                Last Seen
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-white">
                                {server.lastSeen}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-600 dark:text-gray-400">
                                Registered
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-white">
                                {new Date(server.createdAt * 1000).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Actions
                    </h3>
                    <div className="space-y-2">
                        <Link
                            to="/"
                            className="block w-full px-4 py-2 text-sm text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View Metrics Dashboard
                        </Link>

                        {!showRegenerateConfirm ? (
                            <button
                                onClick={() => setShowRegenerateConfirm(true)}
                                className="block w-full px-4 py-2 text-sm text-center bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                            >
                                Regenerate Token
                            </button>
                        ) : (
                            <div className="border border-yellow-500 rounded-md p-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    This will invalidate the current token. The agent will need to be reconfigured.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleRegenerateToken}
                                        disabled={regenerateTokenMutation.isPending}
                                        className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                                    >
                                        {regenerateTokenMutation.isPending ? 'Regenerating...' : 'Confirm'}
                                    </button>
                                    <button
                                        onClick={() => setShowRegenerateConfirm(false)}
                                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {newToken && (
                            <div className="border border-yellow-500 rounded-md p-3 bg-yellow-50 dark:bg-yellow-900/20">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                    New token (save now - it cannot be shown again):
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono bg-gray-900 text-green-400 px-2 py-1 rounded break-all flex-1">
                                        {newToken}
                                    </code>
                                    <CopyButton text={newToken} />
                                </div>
                            </div>
                        )}

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="block w-full px-4 py-2 text-sm text-center bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete Server
                            </button>
                        ) : (
                            <div className="border border-red-500 rounded-md p-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    This will permanently delete the server and all its metric data. This cannot be undone.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteServer}
                                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
