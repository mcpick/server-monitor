import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const servers = sqliteTable('servers', {
    id: text().primaryKey(),
    hostname: text().notNull(),
    displayName: text('display_name').notNull(),
    tokenHash: text('token_hash').notNull(),
    createdAt: integer('created_at').notNull(),
    lastSeenAt: integer('last_seen_at'),
});

export const cpuMetrics = sqliteTable(
    'cpu_metrics',
    {
        id: integer().primaryKey(),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        timestamp: integer().notNull(),
        usagePercent: real('usage_percent').notNull(),
        load1m: real('load_1m'),
        load5m: real('load_5m'),
        load15m: real('load_15m'),
    },
    (table) => [index('idx_cpu_timestamp').on(table.serverId, table.timestamp)],
);

export const memoryMetrics = sqliteTable(
    'memory_metrics',
    {
        id: integer().primaryKey(),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        timestamp: integer().notNull(),
        totalBytes: integer('total_bytes').notNull(),
        usedBytes: integer('used_bytes').notNull(),
        availableBytes: integer('available_bytes').notNull(),
        cachedBytes: integer('cached_bytes'),
    },
    (table) => [
        index('idx_memory_timestamp').on(table.serverId, table.timestamp),
    ],
);

export const swapMetrics = sqliteTable(
    'swap_metrics',
    {
        id: integer().primaryKey(),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        timestamp: integer().notNull(),
        totalBytes: integer('total_bytes').notNull(),
        usedBytes: integer('used_bytes').notNull(),
        freeBytes: integer('free_bytes').notNull(),
    },
    (table) => [
        index('idx_swap_timestamp').on(table.serverId, table.timestamp),
    ],
);

export const diskUsageMetrics = sqliteTable(
    'disk_usage_metrics',
    {
        id: integer().primaryKey(),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        timestamp: integer().notNull(),
        mountPoint: text('mount_point').notNull(),
        totalBytes: integer('total_bytes').notNull(),
        usedBytes: integer('used_bytes').notNull(),
        freeBytes: integer('free_bytes').notNull(),
    },
    (table) => [
        index('idx_disk_usage_timestamp').on(table.serverId, table.timestamp),
    ],
);

export const diskIOMetrics = sqliteTable(
    'disk_io_metrics',
    {
        id: integer().primaryKey(),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        timestamp: integer().notNull(),
        device: text().notNull(),
        readBytes: integer('read_bytes').notNull(),
        writeBytes: integer('write_bytes').notNull(),
        readCount: integer('read_count'),
        writeCount: integer('write_count'),
    },
    (table) => [
        index('idx_disk_io_timestamp').on(table.serverId, table.timestamp),
    ],
);

export const networkMetrics = sqliteTable(
    'network_metrics',
    {
        id: integer().primaryKey(),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        timestamp: integer().notNull(),
        iface: text('interface').notNull(),
        bytesSent: integer('bytes_sent').notNull(),
        bytesRecv: integer('bytes_recv').notNull(),
        packetsSent: integer('packets_sent'),
        packetsRecv: integer('packets_recv'),
    },
    (table) => [
        index('idx_network_timestamp').on(table.serverId, table.timestamp),
    ],
);

export const processMetrics = sqliteTable(
    'process_metrics',
    {
        id: integer().primaryKey(),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        timestamp: integer().notNull(),
        pid: integer().notNull(),
        name: text().notNull(),
        cpuPercent: real('cpu_percent').notNull(),
        memoryPercent: real('memory_percent').notNull(),
    },
    (table) => [
        index('idx_process_timestamp').on(table.serverId, table.timestamp),
    ],
);

export const alertRules = sqliteTable(
    'alert_rules',
    {
        id: text().primaryKey(),
        name: text().notNull(),
        metricType: text('metric_type').notNull(),
        condition: text().notNull(),
        threshold: real().notNull(),
        serverId: text('server_id').references(() => servers.id),
        enabled: integer({ mode: 'boolean' }).notNull().default(true),
        createdAt: integer('created_at').notNull(),
        updatedAt: integer('updated_at').notNull(),
    },
    (table) => [
        index('idx_alert_rules_metric').on(table.metricType, table.enabled),
    ],
);

export const alertHistory = sqliteTable(
    'alert_history',
    {
        id: integer().primaryKey(),
        ruleId: text('rule_id')
            .notNull()
            .references(() => alertRules.id),
        serverId: text('server_id')
            .notNull()
            .references(() => servers.id),
        triggeredAt: integer('triggered_at').notNull(),
        resolvedAt: integer('resolved_at'),
        metricValue: real('metric_value').notNull(),
        threshold: real().notNull(),
    },
    (table) => [
        index('idx_alert_history_rule').on(table.ruleId, table.triggeredAt),
        index('idx_alert_history_server').on(
            table.serverId,
            table.triggeredAt,
        ),
    ],
);
