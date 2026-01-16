import { useState, type ReactElement, type FormEvent } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
    useAlertRules,
    useAlertHistory,
    useActiveAlerts,
    useAlertRuleMutations,
    useServers,
} from '../../hooks/useMetrics';
import type {
    AlertRule,
    AlertHistory,
    MetricType,
    AlertCondition,
    TimeRange,
} from '../../types/metrics';
import { getTimeRange } from '../../types/metrics';

const METRIC_TYPES: { value: MetricType; label: string }[] = [
    { value: 'cpu', label: 'CPU Usage (%)' },
    { value: 'memory', label: 'Memory Usage (%)' },
    { value: 'swap', label: 'Swap Usage (%)' },
    { value: 'disk_usage', label: 'Disk Usage (%)' },
];

const CONDITIONS: { value: AlertCondition; label: string }[] = [
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
];

function formatCondition(condition: AlertCondition): string {
    switch (condition) {
        case 'gt':
            return '>';
        case 'gte':
            return '>=';
        case 'lt':
            return '<';
        case 'lte':
            return '<=';
    }
}

function AlertRuleForm({
    onSubmit,
    onCancel,
    initialRule,
    isSubmitting,
}: {
    onSubmit: (rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
    initialRule?: AlertRule;
    isSubmitting: boolean;
}): ReactElement {
    const { data: servers } = useServers();
    const [name, setName] = useState(initialRule?.name ?? '');
    const [metricType, setMetricType] = useState<MetricType>(
        initialRule?.metric_type ?? 'cpu',
    );
    const [condition, setCondition] = useState<AlertCondition>(
        initialRule?.condition ?? 'gt',
    );
    const [threshold, setThreshold] = useState(
        initialRule?.threshold?.toString() ?? '80',
    );
    const [serverId, setServerId] = useState<string | null>(
        initialRule?.server_id ?? null,
    );
    const [enabled, setEnabled] = useState(initialRule?.enabled ?? true);

    function handleSubmit(e: FormEvent): void {
        e.preventDefault();
        onSubmit({
            name,
            metric_type: metricType,
            condition,
            threshold: parseFloat(threshold),
            server_id: serverId,
            enabled,
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            <div>
                <label
                    htmlFor="rule-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    Rule Name
                </label>
                <input
                    id="rule-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., High CPU Alert"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="metric-type"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Metric Type
                    </label>
                    <select
                        id="metric-type"
                        value={metricType}
                        onChange={(e) => setMetricType(e.target.value as MetricType)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {METRIC_TYPES.map((mt) => (
                            <option
                                key={mt.value}
                                value={mt.value}
                            >
                                {mt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="condition"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Condition
                    </label>
                    <select
                        id="condition"
                        value={condition}
                        onChange={(e) =>
                            setCondition(e.target.value as AlertCondition)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {CONDITIONS.map((c) => (
                            <option
                                key={c.value}
                                value={c.value}
                            >
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="threshold"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Threshold (%)
                    </label>
                    <input
                        id="threshold"
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                <div>
                    <label
                        htmlFor="server-id"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Server (optional)
                    </label>
                    <select
                        id="server-id"
                        value={serverId ?? ''}
                        onChange={(e) =>
                            setServerId(e.target.value || null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">All servers</option>
                        {servers?.map((server) => (
                            <option
                                key={server.id}
                                value={server.id}
                            >
                                {server.hostname}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="enabled"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                />
                <label
                    htmlFor="enabled"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                    Enabled
                </label>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : initialRule ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}

function AlertRulesList({
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

function AlertHistoryList({
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
                                {getRuleName(alert.rule_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {getServerName(alert.server_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {new Date(alert.triggered_at * 1000).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {alert.metric_value.toFixed(1)}% (threshold: {alert.threshold}%)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        alert.resolved_at
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                    }`}
                                >
                                    {alert.resolved_at ? 'Resolved' : 'Active'}
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

type TabView = 'rules' | 'history';

function AlertsPage(): ReactElement {
    const [activeTab, setActiveTab] = useState<TabView>('rules');
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
    const [timeRange] = useState<TimeRange>(() => getTimeRange('24h'));

    const { data: rules, loading: rulesLoading, refetch: refetchRules } = useAlertRules();
    const { data: history, loading: historyLoading } = useAlertHistory(timeRange);
    const { data: activeAlerts } = useActiveAlerts();
    const { createRule, updateRule, deleteRule, isCreating, isUpdating } =
        useAlertRuleMutations();

    function handleCreateRule(
        rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
    ): void {
        void createRule(rule).then(() => {
            setShowForm(false);
            refetchRules();
        });
    }

    function handleUpdateRule(
        rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
    ): void {
        if (!editingRule) return;
        void updateRule(editingRule.id, rule).then(() => {
            setEditingRule(null);
            refetchRules();
        });
    }

    function handleDeleteRule(id: string): void {
        if (confirm('Are you sure you want to delete this alert rule?')) {
            void deleteRule(id).then(() => refetchRules());
        }
    }

    function handleToggleRule(id: string, enabled: boolean): void {
        void updateRule(id, { enabled }).then(() => refetchRules());
    }

    const isLoading = activeTab === 'rules' ? rulesLoading : historyLoading;

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
                                Alerts
                            </h1>
                            {activeAlerts && activeAlerts.length > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                    {activeAlerts.length} active
                                </span>
                            )}
                        </div>
                        {activeTab === 'rules' && !showForm && !editingRule && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Create Rule
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'rules'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Alert Rules
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Alert History
                        </button>
                    </nav>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'rules' && (
                            <>
                                {(showForm || editingRule) && (
                                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
                                        </h2>
                                        <AlertRuleForm
                                            onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
                                            onCancel={() => {
                                                setShowForm(false);
                                                setEditingRule(null);
                                            }}
                                            initialRule={editingRule ?? undefined}
                                            isSubmitting={isCreating || isUpdating}
                                        />
                                    </div>
                                )}
                                <AlertRulesList
                                    rules={rules ?? []}
                                    onEdit={setEditingRule}
                                    onDelete={handleDeleteRule}
                                    onToggle={handleToggleRule}
                                />
                            </>
                        )}
                        {activeTab === 'history' && (
                            <AlertHistoryList
                                history={history ?? []}
                                rules={rules ?? []}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export const Route = createFileRoute('/_authenticated/alerts')({
    component: AlertsPage,
});
