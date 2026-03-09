import { useState, type ReactElement } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useServers } from '@/hooks/useMetrics';
import { useDeleteServerMutation } from '@/hooks/useServerMutations';
import { ServerList } from '@/components/ServerList';
import { ServerDetails } from '@/components/ServerDetails';
import { AddServerWizard } from '@/components/AddServerWizard';
import type { Server } from '@/types/metrics';
import type { ServerStatus } from '@/components/StatusBadge';

type ViewMode = 'list' | 'details' | 'add';

export interface ServerWithStatus extends Server {
    status: ServerStatus;
    lastSeen: string;
}

function getServerStatus(lastSeenAt: number | null): {
    status: ServerStatus;
    lastSeen: string;
} {
    if (lastSeenAt === null) {
        return { status: 'unknown', lastSeen: 'Never' };
    }

    const now = Math.floor(Date.now() / 1000);
    const diff = now - lastSeenAt;

    if (diff < 120) {
        return { status: 'online', lastSeen: 'Just now' };
    } else if (diff < 300) {
        return { status: 'online', lastSeen: `${Math.floor(diff / 60)} minutes ago` };
    } else if (diff < 3600) {
        return { status: 'offline', lastSeen: `${Math.floor(diff / 60)} minutes ago` };
    } else if (diff < 86400) {
        return { status: 'offline', lastSeen: `${Math.floor(diff / 3600)} hours ago` };
    } else {
        return { status: 'unknown', lastSeen: `${Math.floor(diff / 86400)} days ago` };
    }
}

function ServersPage(): ReactElement {
    const { data: servers, loading, error, refetch } = useServers();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedServer, setSelectedServer] = useState<ServerWithStatus | null>(
        null,
    );
    const deleteServerMutation = useDeleteServerMutation();

    const serversWithStatus: ServerWithStatus[] = (servers || []).map((server) => ({
        ...server,
        ...getServerStatus(server.last_seen_at),
    }));

    function handleSelectServer(server: ServerWithStatus): void {
        setSelectedServer(server);
        setViewMode('details');
    }

    function handleBack(): void {
        setSelectedServer(null);
        setViewMode('list');
    }

    function handleDeleteServer(id: string): void {
        deleteServerMutation.mutate(id, {
            onSuccess: () => {
                handleBack();
            },
        });
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            Failed to load servers: {error.message}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                Dashboard
                            </Link>
                            <span className="text-gray-400 dark:text-gray-600">/</span>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Servers
                            </h1>
                        </div>
                        {viewMode === 'list' && (
                            <button
                                onClick={() => setViewMode('add')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add Server
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {viewMode === 'list' && (
                    <ServerList
                        servers={serversWithStatus}
                        onSelectServer={handleSelectServer}
                    />
                )}
                {viewMode === 'details' && selectedServer && (
                    <ServerDetails
                        server={selectedServer}
                        onBack={handleBack}
                        onDelete={handleDeleteServer}
                    />
                )}
                {viewMode === 'add' && <AddServerWizard onBack={handleBack} />}
            </main>
        </div>
    );
}

export const Route = createFileRoute('/_authenticated/servers')({
    component: ServersPage,
});
