package collector

type CPUMetrics struct {
	UsagePercent float64
	Load1m       float64
	Load5m       float64
	Load15m      float64
}

type MemoryMetrics struct {
	TotalBytes     uint64
	UsedBytes      uint64
	AvailableBytes uint64
	CachedBytes    uint64
}

type SwapMetrics struct {
	TotalBytes uint64
	UsedBytes  uint64
	FreeBytes  uint64
}

type DiskUsageMetrics struct {
	MountPoint string
	TotalBytes uint64
	UsedBytes  uint64
	FreeBytes  uint64
}

type DiskIOMetrics struct {
	Device     string
	ReadBytes  uint64
	WriteBytes uint64
	ReadCount  uint64
	WriteCount uint64
}

type NetworkMetrics struct {
	Interface   string
	BytesSent   uint64
	BytesRecv   uint64
	PacketsSent uint64
	PacketsRecv uint64
}

type ProcessMetrics struct {
	PID           int32
	Name          string
	CPUPercent    float64
	MemoryPercent float32
}
