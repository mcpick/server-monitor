import { z } from 'zod';

// --- Type re-exports from server schemas (type-only, no runtime drizzle-zod) ---

export type {
    Server,
    CPUMetric,
    MemoryMetric,
    SwapMetric,
    DiskUsageMetric,
    DiskIOMetric,
    NetworkMetric,
    ProcessMetric,
    AlertRule,
    AlertHistory,
} from '@/lib/server/schemas';

// --- Enums ---

export const alertMetricTypeSchema = z.enum(['cpu', 'memory', 'swap', 'disk_usage']);
export type MetricType = z.infer<typeof alertMetricTypeSchema>;

export const alertConditionSchema = z.enum(['gt', 'lt', 'gte', 'lte']);
export type AlertCondition = z.infer<typeof alertConditionSchema>;

// --- Input types ---

import type { AlertRule } from '@/lib/server/schemas';

export type AlertRuleInput = Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>;

export interface ServerRegistration {
    id: string;
    displayName: string;
    token: string;
}

// --- Time range utilities ---

export type TimeRangePreset = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';

export interface TimeRange {
    preset: TimeRangePreset;
    startTime: number;
    endTime: number;
}

export function getTimeRange(preset: TimeRangePreset): TimeRange {
    const now = Date.now();
    const endTime = Math.floor(now / 1000);
    let startTime: number;

    switch (preset) {
        case '1h':
            startTime = endTime - 60 * 60;
            break;
        case '6h':
            startTime = endTime - 6 * 60 * 60;
            break;
        case '24h':
            startTime = endTime - 24 * 60 * 60;
            break;
        case '7d':
            startTime = endTime - 7 * 24 * 60 * 60;
            break;
        case '30d':
            startTime = endTime - 30 * 24 * 60 * 60;
            break;
        default:
            startTime = endTime - 60 * 60;
    }

    return { preset, startTime, endTime };
}
