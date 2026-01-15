package collector

import (
	"sort"

	"github.com/shirou/gopsutil/v4/process"
)

func CollectTopProcesses(limit int) ([]ProcessMetrics, error) {
	processes, err := process.Processes()
	if err != nil {
		return nil, err
	}

	var metrics []ProcessMetrics
	for _, p := range processes {
		name, err := p.Name()
		if err != nil {
			continue
		}

		cpuPercent, err := p.CPUPercent()
		if err != nil {
			cpuPercent = 0
		}

		memPercent, err := p.MemoryPercent()
		if err != nil {
			memPercent = 0
		}

		metrics = append(metrics, ProcessMetrics{
			PID:           p.Pid,
			Name:          name,
			CPUPercent:    cpuPercent,
			MemoryPercent: memPercent,
		})
	}

	sort.Slice(metrics, func(i, j int) bool {
		scoreI := metrics[i].CPUPercent + float64(metrics[i].MemoryPercent)
		scoreJ := metrics[j].CPUPercent + float64(metrics[j].MemoryPercent)
		return scoreI > scoreJ
	})

	if len(metrics) > limit {
		metrics = metrics[:limit]
	}

	return metrics, nil
}
