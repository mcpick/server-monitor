package collector

import (
	"github.com/shirou/gopsutil/v4/mem"
)

func CollectMemory() (*MemoryMetrics, error) {
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	return &MemoryMetrics{
		TotalBytes:     vmStat.Total,
		UsedBytes:      vmStat.Used,
		AvailableBytes: vmStat.Available,
		CachedBytes:    vmStat.Cached,
	}, nil
}

func CollectSwap() (*SwapMetrics, error) {
	swapStat, err := mem.SwapMemory()
	if err != nil {
		return nil, err
	}

	return &SwapMetrics{
		TotalBytes: swapStat.Total,
		UsedBytes:  swapStat.Used,
		FreeBytes:  swapStat.Free,
	}, nil
}
