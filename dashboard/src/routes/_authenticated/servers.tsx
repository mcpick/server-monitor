import { useState, type ReactElement } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useServers } from '@/hooks/useMetrics';
import type { Server } from '@/types/metrics';

type ViewMode = 'list' | 'details' | 'add';

interface ServerWithStatus extends Server {
    status: 'online' | 'offline' | 'unknown';
    lastSeen: string;
}

function getServerStatus(createdAt: number): {
    status: 'online' | 'offline' | 'unknown';
    lastSeen: string;
} {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - createdAt;

    // Consider server online if created within last 2 minutes
    // In real implementation, this would check the last metric timestamp
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

function StatusBadge({
    status,
}: {
    status: 'online' | 'offline' | 'unknown';
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

function ServerList({
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
                            Hostname
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Last Seen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Server ID
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
                                    {server.hostname}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={server.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {server.lastSeen}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {server.id.slice(0, 8)}...
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

function ServerDetails({
    server,
    onBack,
}: {
    server: ServerWithStatus;
    onBack: () => void;
}): ReactElement {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {server.hostname}
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
                                Hostname
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-white">
                                {server.hostname}
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
                                {new Date(server.created_at * 1000).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Quick Actions
                    </h3>
                    <div className="space-y-2">
                        <Link
                            to="/"
                            className="block w-full px-4 py-2 text-sm text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View Metrics Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddServerWizard({ onBack }: { onBack: () => void }): ReactElement {
    const [step, setStep] = useState(1);

    const installCommand = `curl -fsSL https://your-domain.com/install.sh | bash`;
    const envConfig = `TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
COLLECTION_INTERVAL=5
HOSTNAME=$(hostname)`;

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New Server
                </h2>
                <button
                    onClick={onBack}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    Cancel
                </button>
            </div>

            <div className="mb-8">
                <div className="flex items-center">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className="flex items-center"
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step >= s
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                {s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`w-16 h-1 mx-2 ${
                                        step > s
                                            ? 'bg-blue-600'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center">
                        Install
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 mx-2" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center">
                        Config
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 mx-2" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center">
                        Verify
                    </span>
                </div>
            </div>

            {step === 1 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Step 1: Install the Server Agent
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Run the following command on your server to install the
                        monitoring agent:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <code className="text-sm text-green-400 font-mono">
                            {installCommand}
                        </code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Or download the binary manually from the releases page and
                        install it as a systemd service.
                    </p>
                    <button
                        onClick={() => setStep(2)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Next: Configure
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Step 2: Configure Environment Variables
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Create a .env file or set these environment variables on your
                        server:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                            {envConfig}
                        </pre>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Replace the placeholder values with your actual Turso database
                        credentials.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Next: Verify
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Step 3: Verify Connection
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Start the server agent and verify it connects successfully:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <code className="text-sm text-green-400 font-mono">
                            sudo systemctl start server-agent
                        </code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Check the health endpoint to verify the agent is running:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <code className="text-sm text-green-400 font-mono">
                            curl http://localhost:8080/health
                        </code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Once connected, your server will appear in the list above.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep(2)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            Back
                        </button>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ServersPage(): ReactElement {
    const { data: servers, loading, error, refetch } = useServers();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedServer, setSelectedServer] = useState<ServerWithStatus | null>(
        null,
    );

    const serversWithStatus: ServerWithStatus[] = (servers || []).map((server) => ({
        ...server,
        ...getServerStatus(server.created_at),
    }));

    function handleSelectServer(server: ServerWithStatus): void {
        setSelectedServer(server);
        setViewMode('details');
    }

    function handleBack(): void {
        setSelectedServer(null);
        setViewMode('list');
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
