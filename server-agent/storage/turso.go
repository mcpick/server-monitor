package storage

import (
	"database/sql"
	"fmt"
	"time"

	"server-agent/collector"

	"github.com/tursodatabase/libsql-client-go/libsql"
)

type TursoClient struct {
	db *sql.DB
}

func NewTursoClient(databaseURL, authToken string) (*TursoClient, error) {
	connector, err := libsql.NewConnector(databaseURL, libsql.WithAuthToken(authToken))
	if err != nil {
		return nil, fmt.Errorf("failed to create connector: %w", err)
	}

	db := sql.OpenDB(connector)
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)
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
	return err
}

func (c *TursoClient) InsertCPUMetrics(serverID string, timestamp int64, metrics *collector.CPUMetrics) error {
	_, err := c.db.Exec(`
		INSERT INTO cpu_metrics (server_id, timestamp, usage_percent, load_1m, load_5m, load_15m)
		VALUES (?, ?, ?, ?, ?, ?)
	`, serverID, timestamp, metrics.UsagePercent, metrics.Load1m, metrics.Load5m, metrics.Load15m)
	return err
}

func (c *TursoClient) InsertMemoryMetrics(serverID string, timestamp int64, metrics *collector.MemoryMetrics) error {
	_, err := c.db.Exec(`
		INSERT INTO memory_metrics (server_id, timestamp, total_bytes, used_bytes, available_bytes, cached_bytes)
		VALUES (?, ?, ?, ?, ?, ?)
	`, serverID, timestamp, metrics.TotalBytes, metrics.UsedBytes, metrics.AvailableBytes, metrics.CachedBytes)
	return err
}

func (c *TursoClient) InsertSwapMetrics(serverID string, timestamp int64, metrics *collector.SwapMetrics) error {
	_, err := c.db.Exec(`
		INSERT INTO swap_metrics (server_id, timestamp, total_bytes, used_bytes, free_bytes)
		VALUES (?, ?, ?, ?, ?)
	`, serverID, timestamp, metrics.TotalBytes, metrics.UsedBytes, metrics.FreeBytes)
	return err
}

func (c *TursoClient) InsertDiskUsageMetrics(serverID string, timestamp int64, metrics []collector.DiskUsageMetrics) error {
	for _, m := range metrics {
		_, err := c.db.Exec(`
			INSERT INTO disk_usage_metrics (server_id, timestamp, mount_point, total_bytes, used_bytes, free_bytes)
			VALUES (?, ?, ?, ?, ?, ?)
		`, serverID, timestamp, m.MountPoint, m.TotalBytes, m.UsedBytes, m.FreeBytes)
		if err != nil {
			return err
		}
	}
	return nil
}

func (c *TursoClient) InsertDiskIOMetrics(serverID string, timestamp int64, metrics []collector.DiskIOMetrics) error {
	for _, m := range metrics {
		_, err := c.db.Exec(`
			INSERT INTO disk_io_metrics (server_id, timestamp, device, read_bytes, write_bytes, read_count, write_count)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, serverID, timestamp, m.Device, m.ReadBytes, m.WriteBytes, m.ReadCount, m.WriteCount)
		if err != nil {
			return err
		}
	}
	return nil
}

func (c *TursoClient) InsertNetworkMetrics(serverID string, timestamp int64, metrics []collector.NetworkMetrics) error {
	for _, m := range metrics {
		_, err := c.db.Exec(`
			INSERT INTO network_metrics (server_id, timestamp, interface, bytes_sent, bytes_recv, packets_sent, packets_recv)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, serverID, timestamp, m.Interface, m.BytesSent, m.BytesRecv, m.PacketsSent, m.PacketsRecv)
		if err != nil {
			return err
		}
	}
	return nil
}

func (c *TursoClient) InsertProcessMetrics(serverID string, timestamp int64, metrics []collector.ProcessMetrics) error {
	for _, m := range metrics {
		_, err := c.db.Exec(`
			INSERT INTO process_metrics (server_id, timestamp, pid, name, cpu_percent, memory_percent)
			VALUES (?, ?, ?, ?, ?, ?)
		`, serverID, timestamp, m.PID, m.Name, m.CPUPercent, m.MemoryPercent)
		if err != nil {
			return err
		}
	}
	return nil
}
