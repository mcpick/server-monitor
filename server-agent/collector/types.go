package collector

type CPUMetrics struct {
	UsagePercent float64 `json:"usagePercent"`
	Load1m       float64 `json:"load1m"`
	Load5m       float64 `json:"load5m"`
	Load15m      float64 `json:"load15m"`
}

type MemoryMetrics struct {
	TotalBytes     uint64 `json:"totalBytes"`
	UsedBytes      uint64 `json:"usedBytes"`
	AvailableBytes uint64 `json:"availableBytes"`
	CachedBytes    uint64 `json:"cachedBytes"`
}

type SwapMetrics struct {
	TotalBytes uint64 `json:"totalBytes"`
	UsedBytes  uint64 `json:"usedBytes"`
	FreeBytes  uint64 `json:"freeBytes"`
}

type DiskUsageMetrics struct {
	MountPoint string `json:"mountPoint"`
	TotalBytes uint64 `json:"totalBytes"`
	UsedBytes  uint64 `json:"usedBytes"`
	FreeBytes  uint64 `json:"freeBytes"`
}

type DiskIOMetrics struct {
	Device     string `json:"device"`
	ReadBytes  uint64 `json:"readBytes"`
	WriteBytes uint64 `json:"writeBytes"`
	ReadCount  uint64 `json:"readCount"`
	WriteCount uint64 `json:"writeCount"`
}

type NetworkMetrics struct {
	Interface   string `json:"iface"`
	BytesSent   uint64 `json:"bytesSent"`
	BytesRecv   uint64 `json:"bytesRecv"`
	PacketsSent uint64 `json:"packetsSent"`
	PacketsRecv uint64 `json:"packetsRecv"`
}

type ProcessMetrics struct {
	PID           int32   `json:"pid"`
	Name          string  `json:"name"`
	CPUPercent    float64 `json:"cpuPercent"`
	MemoryPercent float32 `json:"memoryPercent"`
}
