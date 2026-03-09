import type { TimeRange } from '@/lib/schemas';

const queryKeys = {
    all: ['metrics'] as const,
    servers: () => [...queryKeys.all, 'servers'] as const,
    cpu: (serverId: string | null, timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'cpu',
            serverId,
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    memory: (serverId: string | null, timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'memory',
            serverId,
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    swap: (serverId: string | null, timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'swap',
            serverId,
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    diskUsage: (serverId: string | null, timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'diskUsage',
            serverId,
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    diskIO: (serverId: string | null, timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'diskIO',
            serverId,
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    network: (serverId: string | null, timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'network',
            serverId,
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    process: (serverId: string | null, timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'process',
            serverId,
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    alertRules: () => [...queryKeys.all, 'alertRules'] as const,
    alertHistory: (timeRange: TimeRange) =>
        [
            ...queryKeys.all,
            'alertHistory',
            timeRange.startTime,
            timeRange.endTime,
        ] as const,
    activeAlerts: () => [...queryKeys.all, 'activeAlerts'] as const,
};

export { queryKeys };
