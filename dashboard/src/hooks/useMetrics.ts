import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type {
    Server,
    CPUMetric,
    MemoryMetric,
    SwapMetric,
    DiskUsageMetric,
    DiskIOMetric,
    NetworkMetric,
    ProcessMetric,
    TimeRange,
    AlertRule,
    AlertHistory,
} from '../types/metrics';
import {
    fetchServers,
    fetchCPUMetrics,
    fetchMemoryMetrics,
    fetchSwapMetrics,
    fetchDiskUsageMetrics,
    fetchDiskIOMetrics,
    fetchNetworkMetrics,
    fetchProcessMetrics,
    fetchAlertRules,
    fetchAlertHistory,
    fetchActiveAlerts,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
} from '../lib/turso';
import { queryKeys } from '../lib/queryKeys';

interface UseDataResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

const DEFAULT_REFRESH_INTERVAL = 10000;

/**
 * Factory function to create metric hooks with consistent behavior.
 * Reduces duplication across useXMetrics hooks.
 */
function useMetricQuery<T>(
    queryKey: QueryKey,
    queryFn: () => Promise<T[]>,
    enabled: boolean,
    refreshInterval: number,
): UseDataResult<T[]> {
    const query = useQuery({
        queryKey,
        queryFn,
        enabled,
        refetchInterval: refreshInterval,
    });

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
        refetch: () => void query.refetch(),
    };
}

export function useServers(): UseDataResult<Server[]> {
    const query = useQuery({
        queryKey: queryKeys.servers(),
        queryFn: fetchServers,
    });

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
        refetch: () => void query.refetch(),
    };
}

export function useCPUMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<CPUMetric[]> {
    return useMetricQuery(
        queryKeys.cpu(serverId, timeRange),
        () =>
            fetchCPUMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        !!serverId,
        refreshInterval,
    );
}

export function useMemoryMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<MemoryMetric[]> {
    return useMetricQuery(
        queryKeys.memory(serverId, timeRange),
        () =>
            fetchMemoryMetrics(
                serverId!,
                timeRange.startTime,
                timeRange.endTime,
            ),
        !!serverId,
        refreshInterval,
    );
}

export function useSwapMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<SwapMetric[]> {
    return useMetricQuery(
        queryKeys.swap(serverId, timeRange),
        () =>
            fetchSwapMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        !!serverId,
        refreshInterval,
    );
}

export function useDiskMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): {
    usage: UseDataResult<DiskUsageMetric[]>;
    io: UseDataResult<DiskIOMetric[]>;
} {
    const usage = useMetricQuery(
        queryKeys.diskUsage(serverId, timeRange),
        () =>
            fetchDiskUsageMetrics(
                serverId!,
                timeRange.startTime,
                timeRange.endTime,
            ),
        !!serverId,
        refreshInterval,
    );

    const io = useMetricQuery(
        queryKeys.diskIO(serverId, timeRange),
        () =>
            fetchDiskIOMetrics(
                serverId!,
                timeRange.startTime,
                timeRange.endTime,
            ),
        !!serverId,
        refreshInterval,
    );

    return { usage, io };
}

export function useNetworkMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<NetworkMetric[]> {
    return useMetricQuery(
        queryKeys.network(serverId, timeRange),
        () =>
            fetchNetworkMetrics(
                serverId!,
                timeRange.startTime,
                timeRange.endTime,
            ),
        !!serverId,
        refreshInterval,
    );
}

export function useProcessMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<ProcessMetric[]> {
    return useMetricQuery(
        queryKeys.process(serverId, timeRange),
        () =>
            fetchProcessMetrics(
                serverId!,
                timeRange.startTime,
                timeRange.endTime,
            ),
        !!serverId,
        refreshInterval,
    );
}

export function useAlertRules(): UseDataResult<AlertRule[]> {
    const query = useQuery({
        queryKey: queryKeys.alertRules(),
        queryFn: fetchAlertRules,
    });

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
        refetch: () => void query.refetch(),
    };
}

export function useAlertHistory(
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<AlertHistory[]> {
    const query = useQuery({
        queryKey: queryKeys.alertHistory(timeRange),
        queryFn: () => fetchAlertHistory(timeRange.startTime, timeRange.endTime),
        refetchInterval: refreshInterval,
    });

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
        refetch: () => void query.refetch(),
    };
}

export function useActiveAlerts(
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<AlertHistory[]> {
    const query = useQuery({
        queryKey: queryKeys.activeAlerts(),
        queryFn: fetchActiveAlerts,
        refetchInterval: refreshInterval,
    });

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
        refetch: () => void query.refetch(),
    };
}

export function useAlertRuleMutations(): {
    createRule: (
        rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
    ) => Promise<void>;
    updateRule: (
        id: string,
        rule: Partial<Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>>,
    ) => Promise<void>;
    deleteRule: (id: string) => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
} {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createAlertRule,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.alertRules() });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, rule }: { id: string; rule: Partial<Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>> }) =>
            updateAlertRule(id, rule),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.alertRules() });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAlertRule,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.alertRules() });
        },
    });

    return {
        createRule: (rule) => createMutation.mutateAsync(rule),
        updateRule: (id, rule) => updateMutation.mutateAsync({ id, rule }),
        deleteRule: (id) => deleteMutation.mutateAsync(id),
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
