import { useQuery } from '@tanstack/react-query';
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
} from '../lib/turso';
import { queryKeys } from '../lib/queryKeys';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const DEFAULT_REFRESH_INTERVAL = 10000;

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
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<CPUMetric[]> {
  const query = useQuery({
    queryKey: queryKeys.cpu(serverId, timeRange),
    queryFn: () => fetchCPUMetrics(serverId!, timeRange.startTime, timeRange.endTime),
    enabled: !!serverId,
    refetchInterval: refreshInterval,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

export function useMemoryMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<MemoryMetric[]> {
  const query = useQuery({
    queryKey: queryKeys.memory(serverId, timeRange),
    queryFn: () => fetchMemoryMetrics(serverId!, timeRange.startTime, timeRange.endTime),
    enabled: !!serverId,
    refetchInterval: refreshInterval,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

export function useSwapMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<SwapMetric[]> {
  const query = useQuery({
    queryKey: queryKeys.swap(serverId, timeRange),
    queryFn: () => fetchSwapMetrics(serverId!, timeRange.startTime, timeRange.endTime),
    enabled: !!serverId,
    refetchInterval: refreshInterval,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

export function useDiskMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): { usage: UseDataResult<DiskUsageMetric[]>; io: UseDataResult<DiskIOMetric[]> } {
  const usageQuery = useQuery({
    queryKey: queryKeys.diskUsage(serverId, timeRange),
    queryFn: () => fetchDiskUsageMetrics(serverId!, timeRange.startTime, timeRange.endTime),
    enabled: !!serverId,
    refetchInterval: refreshInterval,
  });

  const ioQuery = useQuery({
    queryKey: queryKeys.diskIO(serverId, timeRange),
    queryFn: () => fetchDiskIOMetrics(serverId!, timeRange.startTime, timeRange.endTime),
    enabled: !!serverId,
    refetchInterval: refreshInterval,
  });

  return {
    usage: {
      data: usageQuery.data ?? null,
      loading: usageQuery.isLoading,
      error: usageQuery.error,
      refetch: () => void usageQuery.refetch(),
    },
    io: {
      data: ioQuery.data ?? null,
      loading: ioQuery.isLoading,
      error: ioQuery.error,
      refetch: () => void ioQuery.refetch(),
    },
  };
}

export function useNetworkMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<NetworkMetric[]> {
  const query = useQuery({
    queryKey: queryKeys.network(serverId, timeRange),
    queryFn: () => fetchNetworkMetrics(serverId!, timeRange.startTime, timeRange.endTime),
    enabled: !!serverId,
    refetchInterval: refreshInterval,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

export function useProcessMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<ProcessMetric[]> {
  const query = useQuery({
    queryKey: queryKeys.process(serverId, timeRange),
    queryFn: () => fetchProcessMetrics(serverId!, timeRange.startTime, timeRange.endTime),
    enabled: !!serverId,
    refetchInterval: refreshInterval,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}
