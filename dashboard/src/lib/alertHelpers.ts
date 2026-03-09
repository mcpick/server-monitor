import type { MetricType, AlertCondition } from '../types/metrics';

export const METRIC_TYPES: { value: MetricType; label: string }[] = [
    { value: 'cpu', label: 'CPU Usage (%)' },
    { value: 'memory', label: 'Memory Usage (%)' },
    { value: 'swap', label: 'Swap Usage (%)' },
    { value: 'disk_usage', label: 'Disk Usage (%)' },
];

export const CONDITIONS: { value: AlertCondition; label: string }[] = [
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
];

export function formatCondition(condition: AlertCondition): string {
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

const metricTypeValues = new Set<string>(METRIC_TYPES.map((m) => m.value));
const conditionValues = new Set<string>(CONDITIONS.map((c) => c.value));

export function isMetricType(value: string): value is MetricType {
    return metricTypeValues.has(value);
}

export function isAlertCondition(value: string): value is AlertCondition {
    return conditionValues.has(value);
}
