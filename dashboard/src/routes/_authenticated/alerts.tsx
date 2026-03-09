import { useState, type ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
    useAlertRules,
    useAlertHistory,
    useActiveAlerts,
} from '@/hooks/useMetrics';
import {
    useCreateAlertRuleMutation,
    useUpdateAlertRuleMutation,
    useDeleteAlertRuleMutation,
} from '@/hooks/useAlertMutations';
import type { AlertRule, AlertRuleInput, TimeRange } from '@/lib/schemas';
import { getTimeRange } from '@/lib/schemas';
import { AlertRuleForm } from '@/components/alerts/AlertRuleForm';
import { AlertRulesList } from '@/components/alerts/AlertRulesList';
import { AlertHistoryList } from '@/components/alerts/AlertHistoryList';

type TabView = 'rules' | 'history';

function AlertsPage(): ReactElement {
    const [activeTab, setActiveTab] = useState<TabView>('rules');
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
    const [timeRange] = useState<TimeRange>(() => getTimeRange('24h'));

    const { data: rules, loading: rulesLoading } = useAlertRules();
    const { data: history, loading: historyLoading } = useAlertHistory(timeRange);
    const { data: activeAlerts } = useActiveAlerts();
    const createMutation = useCreateAlertRuleMutation();
    const updateMutation = useUpdateAlertRuleMutation();
    const deleteMutation = useDeleteAlertRuleMutation();

    async function handleCreateRule(rule: AlertRuleInput): Promise<void> {
        try {
            await createMutation.mutateAsync(rule);
            setShowForm(false);
        } catch {
            // Mutation error is available via createMutation.error
        }
    }

    async function handleUpdateRule(rule: AlertRuleInput): Promise<void> {
        if (!editingRule) return;
        try {
            await updateMutation.mutateAsync({ id: editingRule.id, rule });
            setEditingRule(null);
        } catch {
            // Mutation error is available via updateMutation.error
        }
    }

    function handleDeleteRule(id: string): void {
        if (confirm('Are you sure you want to delete this alert rule?')) {
            void deleteMutation.mutateAsync(id);
        }
    }

    function handleToggleRule(id: string, enabled: boolean): void {
        void updateMutation.mutateAsync({ id, rule: { enabled } });
    }

    function handleShowForm(): void {
        setShowForm(true);
    }

    function handleSelectRulesTab(): void {
        setActiveTab('rules');
    }

    function handleSelectHistoryTab(): void {
        setActiveTab('history');
    }

    function handleCancelForm(): void {
        setShowForm(false);
        setEditingRule(null);
    }

    const isLoading = activeTab === 'rules' ? rulesLoading : historyLoading;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
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
                        onClick={handleShowForm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Create Rule
                    </button>
                )}
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={handleSelectRulesTab}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'rules'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Alert Rules
                    </button>
                    <button
                        onClick={handleSelectHistoryTab}
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
                    <div className="animate-spin rounded-full size-8 border-b-2 border-blue-600 dark:border-blue-400" />
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
                                    {(createMutation.error || updateMutation.error) && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                            {createMutation.error?.message ?? updateMutation.error?.message}
                                        </p>
                                    )}
                                    <AlertRuleForm
                                        onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
                                        onCancel={handleCancelForm}
                                        initialRule={editingRule ?? undefined}
                                        isSubmitting={createMutation.isPending || updateMutation.isPending}
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
    );
}

export const Route = createFileRoute('/_authenticated/alerts')({
    component: AlertsPage,
});
