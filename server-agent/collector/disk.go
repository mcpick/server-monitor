package collector

import (
	"github.com/shirou/gopsutil/v4/disk"
)

func CollectDiskUsage() ([]DiskUsageMetrics, error) {
	partitions, err := disk.Partitions(false)
	if err != nil {
		return nil, err
	}

	var metrics []DiskUsageMetrics
	for _, partition := range partitions {
		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			continue
		}

		metrics = append(metrics, DiskUsageMetrics{
			MountPoint: partition.Mountpoint,
			TotalBytes: usage.Total,
			UsedBytes:  usage.Used,
			FreeBytes:  usage.Free,
		})
	}

	return metrics, nil
}

func CollectDiskIO() ([]DiskIOMetrics, error) {
	ioCounters, err := disk.IOCounters()
	if err != nil {
		return nil, err
	}

	var metrics []DiskIOMetrics
	for device, counter := range ioCounters {
		metrics = append(metrics, DiskIOMetrics{
			Device:     device,
			ReadBytes:  counter.ReadBytes,
			WriteBytes: counter.WriteBytes,
			ReadCount:  counter.ReadCount,
			WriteCount: counter.WriteCount,
		})
	}

	return metrics, nil
}
