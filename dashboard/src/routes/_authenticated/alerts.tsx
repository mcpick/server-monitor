import { useState, type ReactElement } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
    useAlertRules,
    useAlertHistory,
    useActiveAlerts,
    useCreateAlertRuleMutation,
    useUpdateAlertRuleMutation,
    useDeleteAlertRuleMutation,
} from '../../hooks/useMetrics';
import type { AlertRule, TimeRange } from '../../types/metrics';
import { getTimeRange } from '../../types/metrics';
import { AlertRuleForm } from '../../components/alerts/AlertRuleForm';
import { AlertRulesList } from '../../components/alerts/AlertRulesList';
import { AlertHistoryList } from '../../components/alerts/AlertHistoryList';

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

    function handleCreateRule(
        rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
    ): void {
        void createMutation.mutateAsync(rule).then(() => {
            setShowForm(false);
        });
    }

    function handleUpdateRule(
        rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
    ): void {
        if (!editingRule) return;
        void updateMutation.mutateAsync({ id: editingRule.id, rule }).then(() => {
            setEditingRule(null);
        });
    }

    function handleDeleteRule(id: string): void {
        if (confirm('Are you sure you want to delete this alert rule?')) {
            void deleteMutation.mutateAsync(id);
        }
    }

    function handleToggleRule(id: string, enabled: boolean): void {
        void updateMutation.mutateAsync({ id, rule: { enabled } });
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
        </div>
    );
}

export const Route = createFileRoute('/_authenticated/alerts')({
    component: AlertsPage,
});
