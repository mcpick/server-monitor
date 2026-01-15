package collector

import (
	"github.com/shirou/gopsutil/v4/net"
)

func CollectNetwork() ([]NetworkMetrics, error) {
	ioCounters, err := net.IOCounters(true)
	if err != nil {
		return nil, err
	}

	var metrics []NetworkMetrics
	for _, counter := range ioCounters {
		if counter.Name == "lo" || counter.Name == "lo0" {
			continue
		}

		metrics = append(metrics, NetworkMetrics{
			Interface:   counter.Name,
			BytesSent:   counter.BytesSent,
			BytesRecv:   counter.BytesRecv,
			PacketsSent: counter.PacketsSent,
			PacketsRecv: counter.PacketsRecv,
		})
	}

	return metrics, nil
}
