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
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-64 text-red-600">
                    <p>Error: {error.message}</p>
                </div>
            ) : (
                children
            )}
        </div>
    );
}
