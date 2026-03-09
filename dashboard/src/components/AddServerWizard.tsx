import { useState, type ReactElement } from 'react';
import { useServers } from '@/hooks/useMetrics';
import { useCreateServerMutation } from '@/hooks/useServerMutations';
import { CopyButton } from '@/components/CopyButton';
import type { ServerRegistration } from '@/lib/schemas';

export function AddServerWizard({ onBack }: { onBack: () => void }): ReactElement {
    const [step, setStep] = useState(1);
    const [displayName, setDisplayName] = useState('');
    const [registration, setRegistration] = useState<ServerRegistration | null>(null);
    const createServerMutation = useCreateServerMutation();
    const { data: servers } = useServers();

    function handleSubmitName(e: React.FormEvent): void {
        e.preventDefault();
        createServerMutation.mutate(displayName, {
            onSuccess: (data) => {
                setRegistration(data);
                setStep(2);
            },
        });
    }

    const registeredServer = registration
        ? servers?.find((s) => s.id === registration.id)
        : null;
    const isConnected = Boolean(registeredServer?.hostname);

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
                        Name
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
                        Step 1: Name Your Server
                    </h3>
                    <form onSubmit={handleSubmitName}>
                        <div className="mb-4">
                            <label
                                htmlFor="displayName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="e.g. Production Web Server"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                                maxLength={100}
                            />
                        </div>
                        {createServerMutation.isError && (
                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                Failed to create server: {createServerMutation.error.message}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={createServerMutation.isPending || !displayName.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {createServerMutation.isPending ? 'Creating...' : 'Create Server'}
                        </button>
                    </form>
                </div>
            )}

            {step === 2 && registration && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Step 2: Install & Configure
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Configure the server agent with these credentials:
                    </p>

                    <div className="bg-gray-900 rounded-lg p-4 mb-4 relative">
                        <div className="absolute top-2 right-2">
                            <CopyButton
                                text={`INGEST_URL=${window.location.origin}/api/ingest\nSERVER_ID=${registration.id}\nINGEST_API_KEY=${registration.token}`}
                            />
                        </div>
                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
{`INGEST_URL=${window.location.origin}/api/ingest
SERVER_ID=${registration.id}
INGEST_API_KEY=${registration.token}`}
                        </pre>
                    </div>

                    <div className="border border-yellow-500 rounded-md p-3 bg-yellow-50 dark:bg-yellow-900/20 mb-4">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Save this token now - it cannot be shown again.
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Install and start the agent:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
{`sudo dpkg -i server-agent_*.deb
sudo systemctl enable --now server-agent`}
                        </pre>
                    </div>

                    <div className="flex gap-2">
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

                    {isConnected ? (
                        <div className="border border-green-500 rounded-md p-4 bg-green-50 dark:bg-green-900/20 mb-4">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                Server connected! Hostname: {registeredServer?.hostname}
                            </p>
                        </div>
                    ) : (
                        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Waiting for the agent to connect...
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Check the agent status on your server:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <code className="text-sm text-green-400 font-mono">
                            sudo systemctl status server-agent
                        </code>
                    </div>

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
