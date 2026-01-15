package collector

import (
	"testing"
)

func TestCollectTopProcesses(t *testing.T) {
	metrics, err := CollectTopProcesses(10)
	if err != nil {
		t.Fatalf("CollectTopProcesses failed: %v", err)
	}

	if len(metrics) == 0 {
		t.Skip("No processes found")
	}

	if len(metrics) > 10 {
		t.Errorf("Expected at most 10 processes, got %d", len(metrics))
	}

	for _, m := range metrics {
		if m.PID <= 0 {
			t.Error("Expected positive PID")
		}
		if m.Name == "" {
			t.Error("Expected non-empty process name")
		}
	}
}

func TestCollectTopProcesses_Sorted(t *testing.T) {
	metrics, err := CollectTopProcesses(5)
	if err != nil {
		t.Fatalf("CollectTopProcesses failed: %v", err)
	}

	if len(metrics) < 2 {
		t.Skip("Not enough processes to test sorting")
	}

	for i := 0; i < len(metrics)-1; i++ {
		scoreI := metrics[i].CPUPercent + float64(metrics[i].MemoryPercent)
		scoreJ := metrics[i+1].CPUPercent + float64(metrics[i+1].MemoryPercent)
		if scoreI < scoreJ {
			t.Errorf("Processes not properly sorted by CPU+Memory at index %d", i)
		}
	}
}
