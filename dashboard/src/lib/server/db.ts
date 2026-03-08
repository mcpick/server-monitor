import { createClient, type Client, type Row } from '@libsql/client';
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
    MetricType,
    AlertCondition,
} from '../../types/metrics';

let client: Client | null = null;

function isLocalURL(url: string): boolean {
    return url.includes('localhost') || url.includes('127.0.0.1') || url.includes('sqld:');
}

// Validate environment variables at module load time
(function validateEnvVars() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        throw new Error(
            'TURSO_DATABASE_URL environment variable is required. Please set it in your environment.'
        );
    }

    // Auth token is only required for remote databases
    if (!authToken && !isLocalURL(url)) {
        throw new Error(
            'TURSO_AUTH_TOKEN environment variable is required for remote databases. Please set it in your environment.'
        );
    }
})();

export function getTursoClient(): Client {
    if (client) {
        return client;
    }

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        throw new Error('Missing TURSO_DATABASE_URL environment variable');
    }

    // Auth token is only required for remote databases
    if (!authToken && !isLocalURL(url)) {
        throw new Error(
            'TURSO_AUTH_TOKEN environment variable is required for remote databases',
        );
    }

    client = createClient({
        url,
        authToken: authToken || '',
    });

    return client;
}

/**
 * Generic fetch utility for time-range based metrics queries.
 * Reduces duplication across metric fetch functions.
 */
async function fetchTimeRangeMetrics<T>(
    sql: string,
    serverId: string,
    startTime: number,
    endTime: number,
    mapper: (row: Row) => T,
): Promise<T[]> {
    const db = getTursoClient();
    const result = await db.execute({
        sql,
        args: [serverId, startTime, endTime],
    });
    return result.rows.map(mapper);
}

export async function fetchServers(): Promise<Server[]> {
    const db = getTursoClient();
    const result = await db.execute(
        'SELECT id, hostname, created_at FROM servers ORDER BY hostname',
    );
    return result.rows.map((row) => ({
        id: row.id as string,
        hostname: row.hostname as string,
        created_at: row.created_at as number,
    }));
}

export async function fetchCPUMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<CPUMetric[]> {
    return fetchTimeRangeMetrics(
        `SELECT id, server_id, timestamp, usage_percent, load_1m, load_5m, load_15m
          FROM cpu_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp`,
        serverId,
        startTime,
        endTime,
        (row) => ({
            id: row.id as number,
            server_id: row.server_id as string,
            timestamp: row.timestamp as number,
            usage_percent: row.usage_percent as number,
            load_1m: row.load_1m as number | null,
            load_5m: row.load_5m as number | null,
            load_15m: row.load_15m as number | null,
        }),
    );
}

export async function fetchMemoryMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<MemoryMetric[]> {
    return fetchTimeRangeMetrics(
        `SELECT id, server_id, timestamp, total_bytes, used_bytes, available_bytes, cached_bytes
          FROM memory_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp`,
        serverId,
        startTime,
        endTime,
        (row) => ({
            id: row.id as number,
            server_id: row.server_id as string,
            timestamp: row.timestamp as number,
            total_bytes: row.total_bytes as number,
            used_bytes: row.used_bytes as number,
            available_bytes: row.available_bytes as number,
            cached_bytes: row.cached_bytes as number | null,
        }),
    );
}

export async function fetchSwapMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<SwapMetric[]> {
    return fetchTimeRangeMetrics(
        `SELECT id, server_id, timestamp, total_bytes, used_bytes, free_bytes
          FROM swap_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp`,
        serverId,
        startTime,
        endTime,
        (row) => ({
            id: row.id as number,
            server_id: row.server_id as string,
            timestamp: row.timestamp as number,
            total_bytes: row.total_bytes as number,
            used_bytes: row.used_bytes as number,
            free_bytes: row.free_bytes as number,
        }),
    );
}

export async function fetchDiskUsageMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<DiskUsageMetric[]> {
    return fetchTimeRangeMetrics(
        `SELECT id, server_id, timestamp, mount_point, total_bytes, used_bytes, free_bytes
          FROM disk_usage_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp, mount_point`,
        serverId,
        startTime,
        endTime,
        (row) => ({
            id: row.id as number,
            server_id: row.server_id as string,
            timestamp: row.timestamp as number,
            mount_point: row.mount_point as string,
            total_bytes: row.total_bytes as number,
            used_bytes: row.used_bytes as number,
            free_bytes: row.free_bytes as number,
        }),
    );
}

export async function fetchDiskIOMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<DiskIOMetric[]> {
    return fetchTimeRangeMetrics(
        `SELECT id, server_id, timestamp, device, read_bytes, write_bytes, read_count, write_count
          FROM disk_io_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp, device`,
        serverId,
        startTime,
        endTime,
        (row) => ({
            id: row.id as number,
            server_id: row.server_id as string,
            timestamp: row.timestamp as number,
            device: row.device as string,
            read_bytes: row.read_bytes as number,
            write_bytes: row.write_bytes as number,
            read_count: row.read_count as number | null,
            write_count: row.write_count as number | null,
        }),
    );
}

export async function fetchNetworkMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<NetworkMetric[]> {
    return fetchTimeRangeMetrics(
        `SELECT id, server_id, timestamp, interface, bytes_sent, bytes_recv, packets_sent, packets_recv
          FROM network_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp, interface`,
        serverId,
        startTime,
        endTime,
        (row) => ({
            id: row.id as number,
            server_id: row.server_id as string,
            timestamp: row.timestamp as number,
            interface: row.interface as string,
            bytes_sent: row.bytes_sent as number,
            bytes_recv: row.bytes_recv as number,
            packets_sent: row.packets_sent as number | null,
            packets_recv: row.packets_recv as number | null,
        }),
    );
}

export async function fetchProcessMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<ProcessMetric[]> {
    return fetchTimeRangeMetrics(
        `SELECT id, server_id, timestamp, pid, name, cpu_percent, memory_percent
          FROM process_metrics
          WHERE server_id = ? AND timestamp >= ? AND timestamp <= ?
          ORDER BY timestamp DESC, cpu_percent DESC
          LIMIT 100`,
        serverId,
        startTime,
        endTime,
        (row) => ({
            id: row.id as number,
            server_id: row.server_id as string,
            timestamp: row.timestamp as number,
            pid: row.pid as number,
            name: row.name as string,
            cpu_percent: row.cpu_percent as number,
            memory_percent: row.memory_percent as number,
        }),
    );
}

export async function fetchAlertRules(): Promise<AlertRule[]> {
    const db = getTursoClient();
    const result = await db.execute(
        'SELECT id, name, metric_type, condition, threshold, server_id, enabled, created_at, updated_at FROM alert_rules ORDER BY created_at DESC',
    );
    return result.rows.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        metric_type: row.metric_type as MetricType,
        condition: row.condition as AlertCondition,
        threshold: row.threshold as number,
        server_id: row.server_id as string | null,
        enabled: Boolean(row.enabled),
        created_at: row.created_at as number,
        updated_at: row.updated_at as number,
    }));
}

export async function fetchAlertHistory(
    startTime: number,
    endTime: number,
): Promise<AlertHistory[]> {
    const db = getTursoClient();
    const result = await db.execute({
        sql: `SELECT id, rule_id, server_id, triggered_at, resolved_at, metric_value, threshold
              FROM alert_history
              WHERE triggered_at >= ? AND triggered_at <= ?
              ORDER BY triggered_at DESC`,
        args: [startTime, endTime],
    });
    return result.rows.map((row) => ({
        id: row.id as number,
        rule_id: row.rule_id as string,
        server_id: row.server_id as string,
        triggered_at: row.triggered_at as number,
        resolved_at: row.resolved_at as number | null,
        metric_value: row.metric_value as number,
        threshold: row.threshold as number,
    }));
}

export async function fetchActiveAlerts(): Promise<AlertHistory[]> {
    const db = getTursoClient();
    const result = await db.execute(
        'SELECT id, rule_id, server_id, triggered_at, resolved_at, metric_value, threshold FROM alert_history WHERE resolved_at IS NULL ORDER BY triggered_at DESC',
    );
    return result.rows.map((row) => ({
        id: row.id as number,
        rule_id: row.rule_id as string,
        server_id: row.server_id as string,
        triggered_at: row.triggered_at as number,
        resolved_at: row.resolved_at as number | null,
        metric_value: row.metric_value as number,
        threshold: row.threshold as number,
    }));
}

export async function createAlertRule(
    rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
): Promise<AlertRule> {
    const db = getTursoClient();
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    await db.execute({
        sql: `INSERT INTO alert_rules (id, name, metric_type, condition, threshold, server_id, enabled, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            id,
            rule.name,
            rule.metric_type,
            rule.condition,
            rule.threshold,
            rule.server_id,
            rule.enabled ? 1 : 0,
            now,
            now,
        ],
    });
    return {
        ...rule,
        id,
        created_at: now,
        updated_at: now,
    };
}

export async function updateAlertRule(
    id: string,
    rule: Partial<Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
    const db = getTursoClient();
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = ['updated_at = ?'];
    const args: (string | number | null)[] = [now];

    if (rule.name !== undefined) {
        updates.push('name = ?');
        args.push(rule.name);
    }
    if (rule.metric_type !== undefined) {
        updates.push('metric_type = ?');
        args.push(rule.metric_type);
    }
    if (rule.condition !== undefined) {
        updates.push('condition = ?');
        args.push(rule.condition);
    }
    if (rule.threshold !== undefined) {
        updates.push('threshold = ?');
        args.push(rule.threshold);
    }
    if (rule.server_id !== undefined) {
        updates.push('server_id = ?');
        args.push(rule.server_id);
    }
    if (rule.enabled !== undefined) {
        updates.push('enabled = ?');
        args.push(rule.enabled ? 1 : 0);
    }

    args.push(id);
    await db.execute({
        sql: `UPDATE alert_rules SET ${updates.join(', ')} WHERE id = ?`,
        args,
    });
}

export async function deleteAlertRule(id: string): Promise<void> {
    const db = getTursoClient();
    await db.execute({
        sql: 'DELETE FROM alert_rules WHERE id = ?',
        args: [id],
    });
}
