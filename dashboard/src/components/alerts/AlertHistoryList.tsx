import type { ReactElement } from 'react';
import { useServers } from '@/hooks/useMetrics';
import type { AlertRule, AlertHistory } from '@/lib/schemas';

export function AlertHistoryList({
    history,
    rules,
}: {
    history: AlertHistory[];
    rules: AlertRule[];
}): ReactElement {
    const { data: servers } = useServers();

    function getRuleName(ruleId: string): string {
        const rule = rules.find((r) => r.id === ruleId);
        return rule?.name ?? ruleId;
    }

    function getServerName(serverId: string): string {
        const server = servers?.find((s) => s.id === serverId);
        return server?.hostname ?? serverId;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Rule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Server
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Triggered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((alert) => (
                        <tr
                            key={alert.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {getRuleName(alert.ruleId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {getServerName(alert.serverId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {new Date(alert.triggeredAt * 1000).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {alert.metricValue.toFixed(1)}% (threshold: {alert.threshold}%)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        alert.resolvedAt
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                    }`}
                                >
                                    {alert.resolvedAt ? 'Resolved' : 'Active'}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {history.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                                No alerts triggered in this time period.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
