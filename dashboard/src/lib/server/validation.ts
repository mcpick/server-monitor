import { z } from 'zod';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import {
    alertRules,
    cpuMetrics,
    memoryMetrics,
    swapMetrics,
    diskUsageMetrics,
    diskIOMetrics,
    networkMetrics,
    processMetrics,
} from './schema';

export const uuidSchema = z.string().uuid();

export const createServerSchema = z.object({
    displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be 100 characters or less'),
});

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const insertAlertRuleSchema = createInsertSchema(alertRules, {
    name: () => z.string().min(1, 'Name is required'),
    metricType: () => z.enum(['cpu', 'memory', 'swap', 'disk_usage']),
    condition: () => z.enum(['gt', 'lt', 'gte', 'lte']),
    threshold: () => z.number().finite(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateAlertRuleSchema = createUpdateSchema(alertRules, {
    metricType: () => z.enum(['cpu', 'memory', 'swap', 'disk_usage']).optional(),
    condition: () => z.enum(['gt', 'lt', 'gte', 'lte']).optional(),
    threshold: () => z.number().finite().optional(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

const sharedMetricFields = { id: true, serverId: true, timestamp: true } as const;

export const ingestCpuSchema = createInsertSchema(cpuMetrics).omit(sharedMetricFields);

export const ingestMemorySchema = createInsertSchema(memoryMetrics).omit(sharedMetricFields);

export const ingestSwapSchema = createInsertSchema(swapMetrics).omit(sharedMetricFields);

export const ingestDiskUsageSchema = createInsertSchema(diskUsageMetrics).omit(sharedMetricFields);

export const ingestDiskIOSchema = createInsertSchema(diskIOMetrics).omit(sharedMetricFields);

export const ingestNetworkSchema = createInsertSchema(networkMetrics).omit({
    ...sharedMetricFields,
    iface: true,
}).extend({
    iface: z.string(),
});

export const ingestProcessSchema = createInsertSchema(processMetrics).omit(sharedMetricFields);

export const ingestPayloadSchema = z.object({
    serverId: z.string().min(1),
    hostname: z.string().min(1),
    timestamp: z.number().int().positive(),
    cpu: ingestCpuSchema.optional(),
    memory: ingestMemorySchema.optional(),
    swap: ingestSwapSchema.optional(),
    diskUsage: z.array(ingestDiskUsageSchema).optional(),
    diskIO: z.array(ingestDiskIOSchema).optional(),
    network: z.array(ingestNetworkSchema).optional(),
    processes: z.array(ingestProcessSchema).optional(),
});

export const metricsQuerySchema = z.object({
    server_id: z.string().min(1, 'server_id is required'),
    start: z.coerce.number().int().positive().optional(),
    end: z.coerce.number().int().positive().optional(),
});

export const alertHistoryQuerySchema = z.object({
    start: z.coerce.number().int().positive({ message: 'start is required' }),
    end: z.coerce.number().int().positive({ message: 'end is required' }),
});

export const metricTypeSchema = z.enum([
    'cpu',
    'memory',
    'swap',
    'disk-usage',
    'disk-io',
    'network',
    'process',
]);

export function parseRequestBody<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (!result.success) {
        const messages = result.error.issues.map((i) => i.message).join(', ');
        return { success: false, error: messages };
    }
    return { success: true, data: result.data };
}
