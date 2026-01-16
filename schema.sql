-- Server Monitor Database Schema
-- For use with Turso (libSQL)

-- System identification
CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    hostname TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- CPU metrics (aggregated)
CREATE TABLE IF NOT EXISTS cpu_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    usage_percent REAL NOT NULL,
    load_1m REAL,
    load_5m REAL,
    load_15m REAL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Memory metrics
CREATE TABLE IF NOT EXISTS memory_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    total_bytes INTEGER NOT NULL,
    used_bytes INTEGER NOT NULL,
    available_bytes INTEGER NOT NULL,
    cached_bytes INTEGER,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Swap metrics
CREATE TABLE IF NOT EXISTS swap_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    total_bytes INTEGER NOT NULL,
    used_bytes INTEGER NOT NULL,
    free_bytes INTEGER NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Disk usage (per partition)
CREATE TABLE IF NOT EXISTS disk_usage_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    mount_point TEXT NOT NULL,
    total_bytes INTEGER NOT NULL,
    used_bytes INTEGER NOT NULL,
    free_bytes INTEGER NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Disk I/O
CREATE TABLE IF NOT EXISTS disk_io_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    device TEXT NOT NULL,
    read_bytes INTEGER NOT NULL,
    write_bytes INTEGER NOT NULL,
    read_count INTEGER,
    write_count INTEGER,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Network metrics (per interface)
CREATE TABLE IF NOT EXISTS network_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    interface TEXT NOT NULL,
    bytes_sent INTEGER NOT NULL,
    bytes_recv INTEGER NOT NULL,
    packets_sent INTEGER,
    packets_recv INTEGER,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Top processes snapshot
CREATE TABLE IF NOT EXISTS process_metrics (
    id INTEGER PRIMARY KEY,
    server_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    pid INTEGER NOT NULL,
    name TEXT NOT NULL,
    cpu_percent REAL NOT NULL,
    memory_percent REAL NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Alert rules for threshold-based alerting
CREATE TABLE IF NOT EXISTS alert_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    metric_type TEXT NOT NULL,  -- cpu, memory, swap, disk_usage
    condition TEXT NOT NULL,     -- gt (greater than), lt (less than), gte, lte
    threshold REAL NOT NULL,
    server_id TEXT,              -- NULL means applies to all servers
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Alert history for triggered alerts
CREATE TABLE IF NOT EXISTS alert_history (
    id INTEGER PRIMARY KEY,
    rule_id TEXT NOT NULL,
    server_id TEXT NOT NULL,
    triggered_at INTEGER NOT NULL,
    resolved_at INTEGER,
    metric_value REAL NOT NULL,
    threshold REAL NOT NULL,
    FOREIGN KEY (rule_id) REFERENCES alert_rules(id),
    FOREIGN KEY (server_id) REFERENCES servers(id)
);

-- Indexes for time-range queries
CREATE INDEX IF NOT EXISTS idx_cpu_timestamp ON cpu_metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_memory_timestamp ON memory_metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_swap_timestamp ON swap_metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_disk_usage_timestamp ON disk_usage_metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_disk_io_timestamp ON disk_io_metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_network_timestamp ON network_metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_process_timestamp ON process_metrics(server_id, timestamp);

-- Indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_alert_rules_metric ON alert_rules(metric_type, enabled);
CREATE INDEX IF NOT EXISTS idx_alert_history_rule ON alert_history(rule_id, triggered_at);
CREATE INDEX IF NOT EXISTS idx_alert_history_server ON alert_history(server_id, triggered_at);
