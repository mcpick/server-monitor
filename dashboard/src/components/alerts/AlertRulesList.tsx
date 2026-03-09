import type { ReactElement } from 'react';
import { useServers } from '@/hooks/useMetrics';
import { METRIC_TYPES, formatCondition } from '@/lib/alertHelpers';
import type { AlertRule } from '@/types/metrics';

export function AlertRulesList({
    rules,
    onEdit,
    onDelete,
    onToggle,
}: {
    rules: AlertRule[];
    onEdit: (rule: AlertRule) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, enabled: boolean) => void;
}): ReactElement {
    const { data: servers } = useServers();

    function getServerName(serverId: string | null): string {
        if (!serverId) return 'All servers';
        const server = servers?.find((s) => s.id === serverId);
        return server?.hostname ?? serverId;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Server
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {rules.map((rule) => (
                        <tr
                            key={rule.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {rule.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {METRIC_TYPES.find((m) => m.value === rule.metric_type)?.label}{' '}
                                {formatCondition(rule.condition)} {rule.threshold}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {getServerName(rule.server_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => onToggle(rule.id, !rule.enabled)}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        rule.enabled
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {rule.enabled ? 'Enabled' : 'Disabled'}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onEdit(rule)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(rule.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {rules.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                                No alert rules configured. Create one to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
