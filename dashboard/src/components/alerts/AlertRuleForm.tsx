import { useState, type ReactElement, type FormEvent } from 'react';
import { useServers } from '@/hooks/useMetrics';
import { METRIC_TYPES, CONDITIONS, isMetricType, isAlertCondition } from '@/lib/alertHelpers';
import type { AlertRule, AlertRuleInput, MetricType, AlertCondition as AlertConditionType } from '@/lib/schemas';

export function AlertRuleForm({
    onSubmit,
    onCancel,
    initialRule,
    isSubmitting,
}: {
    onSubmit: (rule: AlertRuleInput) => void;
    onCancel: () => void;
    initialRule?: AlertRule;
    isSubmitting: boolean;
}): ReactElement {
    const { data: servers } = useServers();
    const [name, setName] = useState(initialRule?.name ?? '');
    const [metricType, setMetricType] = useState<MetricType>(
        initialRule?.metricType ?? 'cpu',
    );
    const [condition, setCondition] = useState<AlertConditionType>(
        initialRule?.condition ?? 'gt',
    );
    const [threshold, setThreshold] = useState(
        initialRule?.threshold?.toString() ?? '80',
    );
    const [serverId, setServerId] = useState<string | null>(
        initialRule?.serverId ?? null,
    );
    const [enabled, setEnabled] = useState(initialRule?.enabled ?? true);

    function handleMetricTypeChange(value: string): void {
        if (isMetricType(value)) {
            setMetricType(value);
        }
    }

    function handleConditionChange(value: string): void {
        if (isAlertCondition(value)) {
            setCondition(value);
        }
    }

    function handleSubmit(e: FormEvent): void {
        e.preventDefault();
        onSubmit({
            name,
            metricType,
            condition,
            threshold: parseFloat(threshold),
            serverId,
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
                        onChange={(e) => handleMetricTypeChange(e.target.value)}
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
                        onChange={(e) => handleConditionChange(e.target.value)}
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
