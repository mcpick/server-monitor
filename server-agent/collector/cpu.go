package collector

import (
	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/load"
)

func CollectCPU() (*CPUMetrics, error) {
	percentages, err := cpu.Percent(0, false)
	if err != nil {
		return nil, err
	}

	var usagePercent float64
	if len(percentages) > 0 {
		usagePercent = percentages[0]
	}

	loadAvg, err := load.Avg()
	if err != nil {
		return &CPUMetrics{
			UsagePercent: usagePercent,
		}, nil
	}

	return &CPUMetrics{
		UsagePercent: usagePercent,
		Load1m:       loadAvg.Load1,
		Load5m:       loadAvg.Load5,
		Load15m:      loadAvg.Load15,
	}, nil
}
