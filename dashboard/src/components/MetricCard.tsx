import type { ReactNode, ReactElement } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface MetricCardProps {
    title: string;
    loading?: boolean;
    error?: Error | null;
    children: ReactNode;
}

export function MetricCard({
    title,
    loading,
    error,
    children,
}: MetricCardProps): ReactElement {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {title}
            </h2>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
                    <p>Error: {error.message}</p>
                </div>
            ) : (
                children
            )}
        </div>
    );
}
