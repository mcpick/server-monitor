package storage

import (
	"database/sql"
	"fmt"
	"time"

	"server-agent/collector"

	"github.com/tursodatabase/libsql-client-go/libsql"
)

// batchInsert executes an insert statement for each item in a slice.
// The argsFunc extracts the SQL arguments for each item.
// The identifierFunc returns a string identifier for error messages.
func batchInsert[T any](
	db *sql.DB,
	items []T,
	query string,
	serverID string,
	timestamp int64,
	argsFunc func(item T) []any,
	identifierFunc func(item T) string,
	metricType string,
) error {
	for _, item := range items {
		args := append([]any{serverID, timestamp}, argsFunc(item)...)
		_, err := db.Exec(query, args...)
		if err != nil {
			return fmt.Errorf("insert %s for %q: %w", metricType, identifierFunc(item), err)
		}
	}
	return nil
}

type TursoClient struct {
	db *sql.DB
}

func NewTursoClient(databaseURL, authToken string, maxOpenConns, maxIdleConns int) (*TursoClient, error) {
	connector, err := libsql.NewConnector(databaseURL, libsql.WithAuthToken(authToken))
	if err != nil {
		return nil, fmt.Errorf("failed to create connector: %w", err)
	}

	db := sql.OpenDB(connector)
	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxIdleConns)
	db.SetConnMaxLifetime(time.Hour)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &TursoClient{db: db}, nil
}

func (c *TursoClient) Close() error {
	return c.db.Close()
}

func (c *TursoClient) RegisterServer(serverID, hostname string) error {
	_, err := c.db.Exec(`
		INSERT INTO servers (id, hostname, created_at)
		VALUES (?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET hostname = excluded.hostname
	`, serverID, hostname, time.Now().Unix())
	if err != nil {
		return fmt.Errorf("register server %q: %w", hostname, err)
	}
	return nil
}

func (c *TursoClient) InsertCPUMetrics(serverID string, timestamp int64, metrics *collector.CPUMetrics) error {
	_, err := c.db.Exec(`
		INSERT INTO cpu_metrics (server_id, timestamp, usage_percent, load_1m, load_5m, load_15m)
		VALUES (?, ?, ?, ?, ?, ?)
	`, serverID, timestamp, metrics.UsagePercent, metrics.Load1m, metrics.Load5m, metrics.Load15m)
	if err != nil {
		return fmt.Errorf("insert cpu metrics: %w", err)
	}
	return nil
}

func (c *TursoClient) InsertMemoryMetrics(serverID string, timestamp int64, metrics *collector.MemoryMetrics) error {
	_, err := c.db.Exec(`
		INSERT INTO memory_metrics (server_id, timestamp, total_bytes, used_bytes, available_bytes, cached_bytes)
		VALUES (?, ?, ?, ?, ?, ?)
	`, serverID, timestamp, metrics.TotalBytes, metrics.UsedBytes, metrics.AvailableBytes, metrics.CachedBytes)
	if err != nil {
		return fmt.Errorf("insert memory metrics: %w", err)
	}
	return nil
}

func (c *TursoClient) InsertSwapMetrics(serverID string, timestamp int64, metrics *collector.SwapMetrics) error {
	_, err := c.db.Exec(`
		INSERT INTO swap_metrics (server_id, timestamp, total_bytes, used_bytes, free_bytes)
		VALUES (?, ?, ?, ?, ?)
	`, serverID, timestamp, metrics.TotalBytes, metrics.UsedBytes, metrics.FreeBytes)
	if err != nil {
		return fmt.Errorf("insert swap metrics: %w", err)
	}
	return nil
}

func (c *TursoClient) InsertDiskUsageMetrics(serverID string, timestamp int64, metrics []collector.DiskUsageMetrics) error {
	return batchInsert(
		c.db,
		metrics,
		`INSERT INTO disk_usage_metrics (server_id, timestamp, mount_point, total_bytes, used_bytes, free_bytes)
		VALUES (?, ?, ?, ?, ?, ?)`,
		serverID,
		timestamp,
		func(m collector.DiskUsageMetrics) []any {
			return []any{m.MountPoint, m.TotalBytes, m.UsedBytes, m.FreeBytes}
		},
		func(m collector.DiskUsageMetrics) string { return m.MountPoint },
		"disk usage metrics",
	)
}

func (c *TursoClient) InsertDiskIOMetrics(serverID string, timestamp int64, metrics []collector.DiskIOMetrics) error {
	return batchInsert(
		c.db,
		metrics,
		`INSERT INTO disk_io_metrics (server_id, timestamp, device, read_bytes, write_bytes, read_count, write_count)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		serverID,
		timestamp,
		func(m collector.DiskIOMetrics) []any {
			return []any{m.Device, m.ReadBytes, m.WriteBytes, m.ReadCount, m.WriteCount}
		},
		func(m collector.DiskIOMetrics) string { return m.Device },
		"disk io metrics",
	)
}

func (c *TursoClient) InsertNetworkMetrics(serverID string, timestamp int64, metrics []collector.NetworkMetrics) error {
	return batchInsert(
		c.db,
		metrics,
		`INSERT INTO network_metrics (server_id, timestamp, interface, bytes_sent, bytes_recv, packets_sent, packets_recv)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		serverID,
		timestamp,
		func(m collector.NetworkMetrics) []any {
			return []any{m.Interface, m.BytesSent, m.BytesRecv, m.PacketsSent, m.PacketsRecv}
		},
		func(m collector.NetworkMetrics) string { return m.Interface },
		"network metrics",
	)
}

func (c *TursoClient) InsertProcessMetrics(serverID string, timestamp int64, metrics []collector.ProcessMetrics) error {
	return batchInsert(
		c.db,
		metrics,
		`INSERT INTO process_metrics (server_id, timestamp, pid, name, cpu_percent, memory_percent)
		VALUES (?, ?, ?, ?, ?, ?)`,
		serverID,
		timestamp,
		func(m collector.ProcessMetrics) []any {
			return []any{m.PID, m.Name, m.CPUPercent, m.MemoryPercent}
		},
		func(m collector.ProcessMetrics) string { return fmt.Sprintf("%s (pid %d)", m.Name, m.PID) },
		"process metrics",
	)
}
