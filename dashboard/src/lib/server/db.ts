import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';
import { env as cfEnv } from 'cloudflare:workers';
import { nanoid } from 'nanoid';
import type { z } from 'zod';
import type {
    ingestCpuSchema,
    ingestMemorySchema,
    ingestSwapSchema,
    ingestDiskUsageSchema,
    ingestDiskIOSchema,
    ingestNetworkSchema,
    ingestProcessSchema,
} from './validation';
import {
    servers,
    cpuMetrics,
    memoryMetrics,
    swapMetrics,
    diskUsageMetrics,
    diskIOMetrics,
    networkMetrics,
    processMetrics,
    alertRules,
    alertHistory,
} from './schema';
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
} from '@/types/metrics';

let db: DrizzleD1Database | null = null;

export function getDb(): DrizzleD1Database {
    if (db) return db;

    db = drizzle(cfEnv.DB);
    return db;
}

export async function fetchServers(): Promise<Server[]> {
    return getDb()
        .select({
            id: servers.id,
            hostname: servers.hostname,
            display_name: servers.displayName,
            created_at: servers.createdAt,
            last_seen_at: servers.lastSeenAt,
        })
        .from(servers)
        .orderBy(servers.displayName);
}

export async function createServer(displayName: string, tokenHash: string): Promise<string> {
    const id = nanoid();
    const now = Math.floor(Date.now() / 1000);
    await getDb().insert(servers).values({
        id,
        hostname: '',
        displayName,
        tokenHash,
        createdAt: now,
    });
    return id;
}

export async function findServerById(id: string): Promise<Server | undefined> {
    const rows = await getDb()
        .select({
            id: servers.id,
            hostname: servers.hostname,
            display_name: servers.displayName,
            created_at: servers.createdAt,
            last_seen_at: servers.lastSeenAt,
        })
        .from(servers)
        .where(eq(servers.id, id))
        .limit(1);
    return rows[0];
}

export async function deleteServer(id: string): Promise<void> {
    const db = getDb();
    await db.batch([
        db.delete(processMetrics).where(eq(processMetrics.serverId, id)),
        db.delete(networkMetrics).where(eq(networkMetrics.serverId, id)),
        db.delete(diskIOMetrics).where(eq(diskIOMetrics.serverId, id)),
        db.delete(diskUsageMetrics).where(eq(diskUsageMetrics.serverId, id)),
        db.delete(swapMetrics).where(eq(swapMetrics.serverId, id)),
        db.delete(memoryMetrics).where(eq(memoryMetrics.serverId, id)),
        db.delete(cpuMetrics).where(eq(cpuMetrics.serverId, id)),
        db.delete(alertHistory).where(eq(alertHistory.serverId, id)),
        db.delete(alertRules).where(eq(alertRules.serverId, id)),
        db.delete(servers).where(eq(servers.id, id)),
    ]);
}

export async function regenerateServerToken(id: string, tokenHash: string): Promise<void> {
    await getDb().update(servers).set({ tokenHash }).where(eq(servers.id, id));
}

export async function findServerByTokenHash(tokenHash: string): Promise<Server | undefined> {
    const rows = await getDb()
        .select({
            id: servers.id,
            hostname: servers.hostname,
            display_name: servers.displayName,
            created_at: servers.createdAt,
            last_seen_at: servers.lastSeenAt,
        })
        .from(servers)
        .where(eq(servers.tokenHash, tokenHash))
        .limit(1);
    return rows[0];
}

export async function fetchCPUMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<CPUMetric[]> {
    return getDb()
        .select({
            id: cpuMetrics.id,
            server_id: cpuMetrics.serverId,
            timestamp: cpuMetrics.timestamp,
            usage_percent: cpuMetrics.usagePercent,
            load_1m: cpuMetrics.load1m,
            load_5m: cpuMetrics.load5m,
            load_15m: cpuMetrics.load15m,
        })
        .from(cpuMetrics)
        .where(
            and(
                eq(cpuMetrics.serverId, serverId),
                gte(cpuMetrics.timestamp, startTime),
                lte(cpuMetrics.timestamp, endTime),
            ),
        )
        .orderBy(cpuMetrics.timestamp);
}

export async function fetchMemoryMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<MemoryMetric[]> {
    return getDb()
        .select({
            id: memoryMetrics.id,
            server_id: memoryMetrics.serverId,
            timestamp: memoryMetrics.timestamp,
            total_bytes: memoryMetrics.totalBytes,
            used_bytes: memoryMetrics.usedBytes,
            available_bytes: memoryMetrics.availableBytes,
            cached_bytes: memoryMetrics.cachedBytes,
        })
        .from(memoryMetrics)
        .where(
            and(
                eq(memoryMetrics.serverId, serverId),
                gte(memoryMetrics.timestamp, startTime),
                lte(memoryMetrics.timestamp, endTime),
            ),
        )
        .orderBy(memoryMetrics.timestamp);
}

export async function fetchSwapMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<SwapMetric[]> {
    return getDb()
        .select({
            id: swapMetrics.id,
            server_id: swapMetrics.serverId,
            timestamp: swapMetrics.timestamp,
            total_bytes: swapMetrics.totalBytes,
            used_bytes: swapMetrics.usedBytes,
            free_bytes: swapMetrics.freeBytes,
        })
        .from(swapMetrics)
        .where(
            and(
                eq(swapMetrics.serverId, serverId),
                gte(swapMetrics.timestamp, startTime),
                lte(swapMetrics.timestamp, endTime),
            ),
        )
        .orderBy(swapMetrics.timestamp);
}

export async function fetchDiskUsageMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<DiskUsageMetric[]> {
    return getDb()
        .select({
            id: diskUsageMetrics.id,
            server_id: diskUsageMetrics.serverId,
            timestamp: diskUsageMetrics.timestamp,
            mount_point: diskUsageMetrics.mountPoint,
            total_bytes: diskUsageMetrics.totalBytes,
            used_bytes: diskUsageMetrics.usedBytes,
            free_bytes: diskUsageMetrics.freeBytes,
        })
        .from(diskUsageMetrics)
        .where(
            and(
                eq(diskUsageMetrics.serverId, serverId),
                gte(diskUsageMetrics.timestamp, startTime),
                lte(diskUsageMetrics.timestamp, endTime),
            ),
        )
        .orderBy(diskUsageMetrics.timestamp, diskUsageMetrics.mountPoint);
}

export async function fetchDiskIOMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<DiskIOMetric[]> {
    return getDb()
        .select({
            id: diskIOMetrics.id,
            server_id: diskIOMetrics.serverId,
            timestamp: diskIOMetrics.timestamp,
            device: diskIOMetrics.device,
            read_bytes: diskIOMetrics.readBytes,
            write_bytes: diskIOMetrics.writeBytes,
            read_count: diskIOMetrics.readCount,
            write_count: diskIOMetrics.writeCount,
        })
        .from(diskIOMetrics)
        .where(
            and(
                eq(diskIOMetrics.serverId, serverId),
                gte(diskIOMetrics.timestamp, startTime),
                lte(diskIOMetrics.timestamp, endTime),
            ),
        )
        .orderBy(diskIOMetrics.timestamp, diskIOMetrics.device);
}

export async function fetchNetworkMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<NetworkMetric[]> {
    return getDb()
        .select({
            id: networkMetrics.id,
            server_id: networkMetrics.serverId,
            timestamp: networkMetrics.timestamp,
            interface: networkMetrics.iface,
            bytes_sent: networkMetrics.bytesSent,
            bytes_recv: networkMetrics.bytesRecv,
            packets_sent: networkMetrics.packetsSent,
            packets_recv: networkMetrics.packetsRecv,
        })
        .from(networkMetrics)
        .where(
            and(
                eq(networkMetrics.serverId, serverId),
                gte(networkMetrics.timestamp, startTime),
                lte(networkMetrics.timestamp, endTime),
            ),
        )
        .orderBy(networkMetrics.timestamp, networkMetrics.iface);
}

export async function fetchProcessMetrics(
    serverId: string,
    startTime: number,
    endTime: number,
): Promise<ProcessMetric[]> {
    return getDb()
        .select({
            id: processMetrics.id,
            server_id: processMetrics.serverId,
            timestamp: processMetrics.timestamp,
            pid: processMetrics.pid,
            name: processMetrics.name,
            cpu_percent: processMetrics.cpuPercent,
            memory_percent: processMetrics.memoryPercent,
        })
        .from(processMetrics)
        .where(
            and(
                eq(processMetrics.serverId, serverId),
                gte(processMetrics.timestamp, startTime),
                lte(processMetrics.timestamp, endTime),
            ),
        )
        .orderBy(
            desc(processMetrics.timestamp),
            desc(processMetrics.cpuPercent),
        )
        .limit(100);
}

export async function fetchAlertRules(): Promise<AlertRule[]> {
    const rows = await getDb()
        .select({
            id: alertRules.id,
            name: alertRules.name,
            metric_type: alertRules.metricType,
            condition: alertRules.condition,
            threshold: alertRules.threshold,
            server_id: alertRules.serverId,
            enabled: alertRules.enabled,
            created_at: alertRules.createdAt,
            updated_at: alertRules.updatedAt,
        })
        .from(alertRules)
        .orderBy(desc(alertRules.createdAt));
    return rows as AlertRule[];
}

export async function fetchAlertHistory(
    startTime: number,
    endTime: number,
): Promise<AlertHistory[]> {
    return getDb()
        .select({
            id: alertHistory.id,
            rule_id: alertHistory.ruleId,
            server_id: alertHistory.serverId,
            triggered_at: alertHistory.triggeredAt,
            resolved_at: alertHistory.resolvedAt,
            metric_value: alertHistory.metricValue,
            threshold: alertHistory.threshold,
        })
        .from(alertHistory)
        .where(
            and(
                gte(alertHistory.triggeredAt, startTime),
                lte(alertHistory.triggeredAt, endTime),
            ),
        )
        .orderBy(desc(alertHistory.triggeredAt));
}

export async function fetchActiveAlerts(): Promise<AlertHistory[]> {
    return getDb()
        .select({
            id: alertHistory.id,
            rule_id: alertHistory.ruleId,
            server_id: alertHistory.serverId,
            triggered_at: alertHistory.triggeredAt,
            resolved_at: alertHistory.resolvedAt,
            metric_value: alertHistory.metricValue,
            threshold: alertHistory.threshold,
        })
        .from(alertHistory)
        .where(isNull(alertHistory.resolvedAt))
        .orderBy(desc(alertHistory.triggeredAt));
}

export async function createAlertRule(
    rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>,
): Promise<AlertRule> {
    const id = nanoid();
    const now = Math.floor(Date.now() / 1000);

    await getDb().insert(alertRules).values({
        id,
        name: rule.name,
        metricType: rule.metric_type,
        condition: rule.condition,
        threshold: rule.threshold,
        serverId: rule.server_id,
        enabled: rule.enabled,
        createdAt: now,
        updatedAt: now,
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
    const now = Math.floor(Date.now() / 1000);

    const values: Record<string, unknown> = { updatedAt: now };
    if (rule.name !== undefined) values.name = rule.name;
    if (rule.metric_type !== undefined) values.metricType = rule.metric_type;
    if (rule.condition !== undefined) values.condition = rule.condition;
    if (rule.threshold !== undefined) values.threshold = rule.threshold;
    if (rule.server_id !== undefined) values.serverId = rule.server_id;
    if (rule.enabled !== undefined) values.enabled = rule.enabled;

    await getDb().update(alertRules).set(values).where(eq(alertRules.id, id));
}

export async function deleteAlertRule(id: string): Promise<void> {
    await getDb().delete(alertRules).where(eq(alertRules.id, id));
}

// --- Ingest functions ---

export async function updateServerOnIngest(id: string, hostname: string): Promise<void> {
    await getDb()
        .update(servers)
        .set({ hostname, lastSeenAt: Math.floor(Date.now() / 1000) })
        .where(eq(servers.id, id));
}

export async function insertCpuMetric(
    serverId: string,
    timestamp: number,
    data: z.infer<typeof ingestCpuSchema>,
): Promise<void> {
    await getDb()
        .insert(cpuMetrics)
        .values({ serverId, timestamp, ...data });
}

export async function insertMemoryMetric(
    serverId: string,
    timestamp: number,
    data: z.infer<typeof ingestMemorySchema>,
): Promise<void> {
    await getDb()
        .insert(memoryMetrics)
        .values({ serverId, timestamp, ...data });
}

export async function insertSwapMetric(
    serverId: string,
    timestamp: number,
    data: z.infer<typeof ingestSwapSchema>,
): Promise<void> {
    await getDb()
        .insert(swapMetrics)
        .values({ serverId, timestamp, ...data });
}

export async function insertDiskUsageMetrics(
    serverId: string,
    timestamp: number,
    data: z.infer<typeof ingestDiskUsageSchema>[],
): Promise<void> {
    if (data.length === 0) return;
    await getDb()
        .insert(diskUsageMetrics)
        .values(data.map((d) => ({ serverId, timestamp, ...d })));
}

export async function insertDiskIOMetrics(
    serverId: string,
    timestamp: number,
    data: z.infer<typeof ingestDiskIOSchema>[],
): Promise<void> {
    if (data.length === 0) return;
    await getDb()
        .insert(diskIOMetrics)
        .values(data.map((d) => ({ serverId, timestamp, ...d })));
}

export async function insertNetworkMetrics(
    serverId: string,
    timestamp: number,
    data: z.infer<typeof ingestNetworkSchema>[],
): Promise<void> {
    if (data.length === 0) return;
    await getDb()
        .insert(networkMetrics)
        .values(data.map((d) => ({ serverId, timestamp, ...d })));
}

export async function insertProcessMetrics(
    serverId: string,
    timestamp: number,
    data: z.infer<typeof ingestProcessSchema>[],
): Promise<void> {
    if (data.length === 0) return;
    await getDb()
        .insert(processMetrics)
        .values(data.map((d) => ({ serverId, timestamp, ...d })));
}
