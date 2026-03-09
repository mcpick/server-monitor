import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import {
    servers,
    cpuMetrics,
    memoryMetrics,
    swapMetrics,
    diskUsageMetrics,
    diskIOMetrics,
    networkMetrics,
    processMetrics,
    alertRules,
    alertHistory,
} from '@/lib/server/schema';

// --- Select schemas (what the DB returns) ---

export const serverSchema = createSelectSchema(servers).omit({ tokenHash: true });
export const cpuMetricSchema = createSelectSchema(cpuMetrics);
export const memoryMetricSchema = createSelectSchema(memoryMetrics);
export const swapMetricSchema = createSelectSchema(swapMetrics);
export const diskUsageMetricSchema = createSelectSchema(diskUsageMetrics);
export const diskIOMetricSchema = createSelectSchema(diskIOMetrics);
export const networkMetricSchema = createSelectSchema(networkMetrics);
export const processMetricSchema = createSelectSchema(processMetrics);
export const alertRuleSchema = createSelectSchema(alertRules, {
    condition: () => z.enum(['gt', 'lt', 'gte', 'lte']),
    metricType: () => z.enum(['cpu', 'memory', 'swap', 'disk_usage']),
});
export const alertHistorySchema = createSelectSchema(alertHistory);

// --- Derived TypeScript types (all camelCase) ---

export type Server = z.infer<typeof serverSchema>;
export type CPUMetric = z.infer<typeof cpuMetricSchema>;
export type MemoryMetric = z.infer<typeof memoryMetricSchema>;
export type SwapMetric = z.infer<typeof swapMetricSchema>;
export type DiskUsageMetric = z.infer<typeof diskUsageMetricSchema>;
export type DiskIOMetric = z.infer<typeof diskIOMetricSchema>;
export type NetworkMetric = z.infer<typeof networkMetricSchema>;
export type ProcessMetric = z.infer<typeof processMetricSchema>;
export type AlertRule = z.infer<typeof alertRuleSchema>;
export type AlertHistory = z.infer<typeof alertHistorySchema>;
