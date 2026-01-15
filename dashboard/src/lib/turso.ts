import { createClient, Client } from '@libsql/client';
import type {
  Server,
  CPUMetric,
  MemoryMetric,
  SwapMetric,
  DiskUsageMetric,
  DiskIOMetric,
  NetworkMetric,
  ProcessMetric,
} from '../types/metrics';

let client: Client | null = null;

export function createTursoClient(): Client {
  if (client) {
    return client;
  }

  const url = import.meta.env.VITE_TURSO_DATABASE_URL;
  const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing VITE_TURSO_DATABASE_URL or VITE_TURSO_AUTH_TOKEN environment variables');
  }

  client = createClient({
    url,
    authToken,
  });

  return client;
}

export async function fetchServers(): Promise<Server[]> {
  const db = createTursoClient();
  const result = await db.execute('SELECT id, hostname, created_at FROM servers ORDER BY hostname');
  return result.rows.map((row) => ({
    id: row.id as string,
    hostname: row.hostname as string,
    created_at: row.created_at as number,
  }));
}

export async function fetchCPUMetrics(
  serverId: string,
  startTime: number,
  endTime: number
): Promise<CPUMetric[]> {
  const db = createTursoClient();
  const result = await db.execute({
    sql: `SELECT id, server_id, timestamp, usage_percent, load_1m, load_5m, load_15m
          FROM cpu_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp`,
    args: [serverId, startTime, endTime],
  });
  return result.rows.map((row) => ({
    id: row.id as number,
    server_id: row.server_id as string,
    timestamp: row.timestamp as number,
    usage_percent: row.usage_percent as number,
    load_1m: row.load_1m as number | null,
    load_5m: row.load_5m as number | null,
    load_15m: row.load_15m as number | null,
  }));
}

export async function fetchMemoryMetrics(
  serverId: string,
  startTime: number,
  endTime: number
): Promise<MemoryMetric[]> {
  const db = createTursoClient();
  const result = await db.execute({
    sql: `SELECT id, server_id, timestamp, total_bytes, used_bytes, available_bytes, cached_bytes
          FROM memory_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp`,
    args: [serverId, startTime, endTime],
  });
  return result.rows.map((row) => ({
    id: row.id as number,
    server_id: row.server_id as string,
    timestamp: row.timestamp as number,
    total_bytes: row.total_bytes as number,
    used_bytes: row.used_bytes as number,
    available_bytes: row.available_bytes as number,
    cached_bytes: row.cached_bytes as number | null,
  }));
}

export async function fetchSwapMetrics(
  serverId: string,
  startTime: number,
  endTime: number
): Promise<SwapMetric[]> {
  const db = createTursoClient();
  const result = await db.execute({
    sql: `SELECT id, server_id, timestamp, total_bytes, used_bytes, free_bytes
          FROM swap_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp`,
    args: [serverId, startTime, endTime],
  });
  return result.rows.map((row) => ({
    id: row.id as number,
    server_id: row.server_id as string,
    timestamp: row.timestamp as number,
    total_bytes: row.total_bytes as number,
    used_bytes: row.used_bytes as number,
    free_bytes: row.free_bytes as number,
  }));
}

export async function fetchDiskUsageMetrics(
  serverId: string,
  startTime: number,
  endTime: number
): Promise<DiskUsageMetric[]> {
  const db = createTursoClient();
  const result = await db.execute({
    sql: `SELECT id, server_id, timestamp, mount_point, total_bytes, used_bytes, free_bytes
          FROM disk_usage_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp, mount_point`,
    args: [serverId, startTime, endTime],
  });
  return result.rows.map((row) => ({
    id: row.id as number,
    server_id: row.server_id as string,
    timestamp: row.timestamp as number,
    mount_point: row.mount_point as string,
    total_bytes: row.total_bytes as number,
    used_bytes: row.used_bytes as number,
    free_bytes: row.free_bytes as number,
  }));
}

export async function fetchDiskIOMetrics(
  serverId: string,
  startTime: number,
  endTime: number
): Promise<DiskIOMetric[]> {
  const db = createTursoClient();
  const result = await db.execute({
    sql: `SELECT id, server_id, timestamp, device, read_bytes, write_bytes, read_count, write_count
          FROM disk_io_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp, device`,
    args: [serverId, startTime, endTime],
  });
  return result.rows.map((row) => ({
    id: row.id as number,
    server_id: row.server_id as string,
    timestamp: row.timestamp as number,
    device: row.device as string,
    read_bytes: row.read_bytes as number,
    write_bytes: row.write_bytes as number,
    read_count: row.read_count as number | null,
    write_count: row.write_count as number | null,
  }));
}

export async function fetchNetworkMetrics(
  serverId: string,
  startTime: number,
  endTime: number
): Promise<NetworkMetric[]> {
  const db = createTursoClient();
  const result = await db.execute({
    sql: `SELECT id, server_id, timestamp, interface, bytes_sent, bytes_recv, packets_sent, packets_recv
          FROM network_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp, interface`,
    args: [serverId, startTime, endTime],
  });
  return result.rows.map((row) => ({
    id: row.id as number,
    server_id: row.server_id as string,
    timestamp: row.timestamp as number,
    interface: row.interface as string,
    bytes_sent: row.bytes_sent as number,
    bytes_recv: row.bytes_recv as number,
    packets_sent: row.packets_sent as number | null,
    packets_recv: row.packets_recv as number | null,
  }));
}

export async function fetchProcessMetrics(
  serverId: string,
  startTime: number,
  endTime: number
): Promise<ProcessMetric[]> {
  const db = createTursoClient();
  const result = await db.execute({
    sql: `SELECT id, server_id, timestamp, pid, name, cpu_percent, memory_percent
          FROM process_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp DESC, cpu_percent DESC
          LIMIT 100`,
    args: [serverId, startTime, endTime],
  });
  return result.rows.map((row) => ({
    id: row.id as number,
    server_id: row.server_id as string,
    timestamp: row.timestamp as number,
    pid: row.pid as number,
    name: row.name as string,
    cpu_percent: row.cpu_percent as number,
    memory_percent: row.memory_percent as number,
  }));
}
