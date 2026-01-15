package collector

import (
	"testing"
)

func TestCollectMemory(t *testing.T) {
	metrics, err := CollectMemory()
	if err != nil {
		t.Fatalf("CollectMemory failed: %v", err)
	}

	if metrics == nil {
		t.Fatal("Expected non-nil metrics")
	}

	if metrics.TotalBytes == 0 {
		t.Error("Expected non-zero total bytes")
	}

	if metrics.AvailableBytes > metrics.TotalBytes {
		t.Error("Available bytes should not exceed total bytes")
	}
}

func TestCollectSwap(t *testing.T) {
	metrics, err := CollectSwap()
	if err != nil {
		t.Fatalf("CollectSwap failed: %v", err)
	}

	if metrics == nil {
		t.Fatal("Expected non-nil metrics")
	}

	if metrics.UsedBytes > metrics.TotalBytes {
		t.Error("Used bytes should not exceed total bytes")
	}
}
