package collector

import (
	"testing"
)

func TestCollectCPU(t *testing.T) {
	metrics, err := CollectCPU()
	if err != nil {
		t.Fatalf("CollectCPU failed: %v", err)
	}

	if metrics == nil {
		t.Fatal("Expected non-nil metrics")
	}

	if metrics.UsagePercent < 0 || metrics.UsagePercent > 100 {
		t.Errorf("Invalid CPU usage percent: %v", metrics.UsagePercent)
	}

	if metrics.Load1m < 0 {
		t.Errorf("Invalid load 1m: %v", metrics.Load1m)
	}
}
