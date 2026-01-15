export interface Server {
    id: string;
    hostname: string;
    created_at: number;
}

export interface CPUMetric {
    id: number;
    server_id: string;
    timestamp: number;
    usage_percent: number;
    load_1m: number | null;
    load_5m: number | null;
    load_15m: number | null;
}

export interface MemoryMetric {
    id: number;
    server_id: string;
    timestamp: number;
    total_bytes: number;
    used_bytes: number;
    available_bytes: number;
    cached_bytes: number | null;
}

export interface SwapMetric {
    id: number;
    server_id: string;
    timestamp: number;
    total_bytes: number;
    used_bytes: number;
    free_bytes: number;
}

export interface DiskUsageMetric {
    id: number;
    server_id: string;
    timestamp: number;
    mount_point: string;
    total_bytes: number;
    used_bytes: number;
    free_bytes: number;
}

export interface DiskIOMetric {
    id: number;
    server_id: string;
    timestamp: number;
    device: string;
    read_bytes: number;
    write_bytes: number;
    read_count: number | null;
    write_count: number | null;
}

export interface NetworkMetric {
    id: number;
    server_id: string;
    timestamp: number;
    interface: string;
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number | null;
    packets_recv: number | null;
}

export interface ProcessMetric {
    id: number;
    server_id: string;
    timestamp: number;
    pid: number;
    name: string;
    cpu_percent: number;
    memory_percent: number;
}

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
