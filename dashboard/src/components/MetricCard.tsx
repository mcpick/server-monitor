import type { ReactNode, ReactElement } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface MetricCardProps {
    title: string;
    loading?: boolean;
    error?: Error | null;
    onRetry?: () => void;
    children: ReactNode;
}

function formatErrorMessage(error: Error): string {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
        return 'Unable to connect to the server. Please check your network connection.';
    }
    if (message.includes('timeout')) {
        return 'Request timed out. The server may be slow or unavailable.';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
        return 'Authentication failed. Please try logging in again.';
    }
    return `Failed to load data: ${error.message}`;
}

export function MetricCard({
    title,
    loading,
    error,
    onRetry,
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
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-red-600 dark:text-red-400 text-center max-w-xs">
                        {formatErrorMessage(error)}
                    </p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    )}
                </div>
            ) : (
                children
            )}
        </div>
    );
}
