import type {
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
} from '../types/metrics';
import { getAuthToken } from './auth';

/**
 * Generic fetch utility for API requests with auth.
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const token = getAuthToken();
    const headers = new Headers(options?.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
}

/**
 * Generic fetch utility for time-range based metrics API requests.
 */
async function fetchMetricsFromAPI<T>(
    metricType: string,
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<T[]> {
    const params = new URLSearchParams({
        server_id: serverId,
        start: startTime.toString(),
        end: endTime.toString(),
    });
    return apiFetch<T[]>(`/api/metrics/${metricType}?${params}`);
}

export async function fetchServers(): Promise<Server[]> {
    return apiFetch<Server[]>('/api/servers');
}

export async function fetchCPUMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<CPUMetric[]> {
    return fetchMetricsFromAPI<CPUMetric>('cpu', serverId, startTime, endTime);
}

export async function fetchMemoryMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<MemoryMetric[]> {
    return fetchMetricsFromAPI<MemoryMetric>('memory', serverId, startTime, endTime);
}

export async function fetchSwapMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<SwapMetric[]> {
    return fetchMetricsFromAPI<SwapMetric>('swap', serverId, startTime, endTime);
}

export async function fetchDiskUsageMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<DiskUsageMetric[]> {
    return fetchMetricsFromAPI<DiskUsageMetric>('disk-usage', serverId, startTime, endTime);
}

export async function fetchDiskIOMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<DiskIOMetric[]> {
    return fetchMetricsFromAPI<DiskIOMetric>('disk-io', serverId, startTime, endTime);
}

export async function fetchNetworkMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<NetworkMetric[]> {
    return fetchMetricsFromAPI<NetworkMetric>('network', serverId, startTime, endTime);
}

export async function fetchProcessMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<ProcessMetric[]> {
    return fetchMetricsFromAPI<ProcessMetric>('process', serverId, startTime, endTime);
}

export async function fetchAlertRules(): Promise<AlertRule[]> {
    return apiFetch<AlertRule[]>('/api/alerts/rules');
}

export async function fetchAlertHistory(
    startTime: number,
    endTime: number,
): Promise<AlertHistory[]> {
    const params = new URLSearchParams({
        start: startTime.toString(),
        end: endTime.toString(),
    });
    return apiFetch<AlertHistory[]>(`/api/alerts/history?${params}`);
}

export async function fetchActiveAlerts(): Promise<AlertHistory[]> {
    return apiFetch<AlertHistory[]>('/api/alerts/active');
}

export async function createAlertRule(
    rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
): Promise<void> {
    await apiFetch<AlertRule>('/api/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
    });
}

export async function updateAlertRule(
    id: string,
    rule: Partial<Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
    await apiFetch<void>(`/api/alerts/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
    });
}

export async function deleteAlertRule(id: string): Promise<void> {
    await apiFetch<void>(`/api/alerts/rules/${id}`, {
        method: 'DELETE',
    });
}
