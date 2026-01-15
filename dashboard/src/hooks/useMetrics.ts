import { useState, useEffect, useCallback } from 'react';
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

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const DEFAULT_REFRESH_INTERVAL = 10000;

export function useServers(): UseDataResult<Server[]> {
  const [data, setData] = useState<Server[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const servers = await fetchServers();
      setData(servers);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch servers'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useCPUMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<CPUMetric[]> {
  const [data, setData] = useState<CPUMetric[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      const metrics = await fetchCPUMetrics(serverId, timeRange.startTime, timeRange.endTime);
      setData(metrics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch CPU metrics'));
    } finally {
      setLoading(false);
    }
  }, [serverId, timeRange.startTime, timeRange.endTime]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refetch, refreshInterval]);

  return { data, loading, error, refetch };
}

export function useMemoryMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<MemoryMetric[]> {
  const [data, setData] = useState<MemoryMetric[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      const metrics = await fetchMemoryMetrics(serverId, timeRange.startTime, timeRange.endTime);
      setData(metrics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch memory metrics'));
    } finally {
      setLoading(false);
    }
  }, [serverId, timeRange.startTime, timeRange.endTime]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refetch, refreshInterval]);

  return { data, loading, error, refetch };
}

export function useSwapMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<SwapMetric[]> {
  const [data, setData] = useState<SwapMetric[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      const metrics = await fetchSwapMetrics(serverId, timeRange.startTime, timeRange.endTime);
      setData(metrics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch swap metrics'));
    } finally {
      setLoading(false);
    }
  }, [serverId, timeRange.startTime, timeRange.endTime]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refetch, refreshInterval]);

  return { data, loading, error, refetch };
}

export function useDiskMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): { usage: UseDataResult<DiskUsageMetric[]>; io: UseDataResult<DiskIOMetric[]> } {
  const [usageData, setUsageData] = useState<DiskUsageMetric[] | null>(null);
  const [ioData, setIoData] = useState<DiskIOMetric[] | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [ioLoading, setIoLoading] = useState(true);
  const [usageError, setUsageError] = useState<Error | null>(null);
  const [ioError, setIoError] = useState<Error | null>(null);

  const refetchUsage = useCallback(async () => {
    if (!serverId) return;
    try {
      setUsageLoading(true);
      const metrics = await fetchDiskUsageMetrics(serverId, timeRange.startTime, timeRange.endTime);
      setUsageData(metrics);
      setUsageError(null);
    } catch (e) {
      setUsageError(e instanceof Error ? e : new Error('Failed to fetch disk usage'));
    } finally {
      setUsageLoading(false);
    }
  }, [serverId, timeRange.startTime, timeRange.endTime]);

  const refetchIO = useCallback(async () => {
    if (!serverId) return;
    try {
      setIoLoading(true);
      const metrics = await fetchDiskIOMetrics(serverId, timeRange.startTime, timeRange.endTime);
      setIoData(metrics);
      setIoError(null);
    } catch (e) {
      setIoError(e instanceof Error ? e : new Error('Failed to fetch disk I/O'));
    } finally {
      setIoLoading(false);
    }
  }, [serverId, timeRange.startTime, timeRange.endTime]);

  useEffect(() => {
    refetchUsage();
    refetchIO();
    const interval = setInterval(() => {
      refetchUsage();
      refetchIO();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refetchUsage, refetchIO, refreshInterval]);

  return {
    usage: { data: usageData, loading: usageLoading, error: usageError, refetch: refetchUsage },
    io: { data: ioData, loading: ioLoading, error: ioError, refetch: refetchIO },
  };
}

export function useNetworkMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<NetworkMetric[]> {
  const [data, setData] = useState<NetworkMetric[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      const metrics = await fetchNetworkMetrics(serverId, timeRange.startTime, timeRange.endTime);
      setData(metrics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch network metrics'));
    } finally {
      setLoading(false);
    }
  }, [serverId, timeRange.startTime, timeRange.endTime]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refetch, refreshInterval]);

  return { data, loading, error, refetch };
}

export function useProcessMetrics(
  serverId: string | null,
  timeRange: TimeRange,
  refreshInterval = DEFAULT_REFRESH_INTERVAL
): UseDataResult<ProcessMetric[]> {
  const [data, setData] = useState<ProcessMetric[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      const metrics = await fetchProcessMetrics(serverId, timeRange.startTime, timeRange.endTime);
      setData(metrics);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch process metrics'));
    } finally {
      setLoading(false);
    }
  }, [serverId, timeRange.startTime, timeRange.endTime]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, refreshInterval);
    return () => clearInterval(interval);
  }, [refetch, refreshInterval]);

  return { data, loading, error, refetch };
}
