import { useQuery, type QueryKey } from '@tanstack/react-query';
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
} from '@/lib/schemas';
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
} from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

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
function useDataQuery<T>(
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
    options?: { enabled?: boolean; refetchInterval?: number },
): UseDataResult<T> {
    const query = useQuery({
        queryKey,
        queryFn,
        enabled: options?.enabled,
        refetchInterval: options?.refetchInterval,
    });

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
        refetch: () => void query.refetch(),
    };
}

export function useServers(): UseDataResult<Server[]> {
    return useDataQuery(queryKeys.servers(), fetchServers);
}

export function useCPUMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<CPUMetric[]> {
    return useDataQuery(
        queryKeys.cpu(serverId, timeRange),
        () => fetchCPUMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        { enabled: !!serverId, refetchInterval: refreshInterval },
    );
}

export function useMemoryMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<MemoryMetric[]> {
    return useDataQuery(
        queryKeys.memory(serverId, timeRange),
        () => fetchMemoryMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        { enabled: !!serverId, refetchInterval: refreshInterval },
    );
}

export function useSwapMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<SwapMetric[]> {
    return useDataQuery(
        queryKeys.swap(serverId, timeRange),
        () => fetchSwapMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        { enabled: !!serverId, refetchInterval: refreshInterval },
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
    const usage = useDataQuery(
        queryKeys.diskUsage(serverId, timeRange),
        () => fetchDiskUsageMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        { enabled: !!serverId, refetchInterval: refreshInterval },
    );

    const io = useDataQuery(
        queryKeys.diskIO(serverId, timeRange),
        () => fetchDiskIOMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        { enabled: !!serverId, refetchInterval: refreshInterval },
    );

    return { usage, io };
}

export function useNetworkMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<NetworkMetric[]> {
    return useDataQuery(
        queryKeys.network(serverId, timeRange),
        () => fetchNetworkMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        { enabled: !!serverId, refetchInterval: refreshInterval },
    );
}

export function useProcessMetrics(
    serverId: string | null,
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<ProcessMetric[]> {
    return useDataQuery(
        queryKeys.process(serverId, timeRange),
        () => fetchProcessMetrics(serverId!, timeRange.startTime, timeRange.endTime),
        { enabled: !!serverId, refetchInterval: refreshInterval },
    );
}

export function useAlertRules(): UseDataResult<AlertRule[]> {
    return useDataQuery(queryKeys.alertRules(), fetchAlertRules);
}

export function useAlertHistory(
    timeRange: TimeRange,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<AlertHistory[]> {
    return useDataQuery(
        queryKeys.alertHistory(timeRange),
        () => fetchAlertHistory(timeRange.startTime, timeRange.endTime),
        { refetchInterval: refreshInterval },
    );
}

export function useActiveAlerts(
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
): UseDataResult<AlertHistory[]> {
    return useDataQuery(
        queryKeys.activeAlerts(),
        fetchActiveAlerts,
        { refetchInterval: refreshInterval },
    );
}
