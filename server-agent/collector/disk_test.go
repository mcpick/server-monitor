package collector

import (
	"testing"
)

func TestCollectDiskUsage(t *testing.T) {
	metrics, err := CollectDiskUsage()
	if err != nil {
		t.Fatalf("CollectDiskUsage failed: %v", err)
	}

	if len(metrics) == 0 {
		t.Skip("No disk partitions found")
	}

	hasValidPartition := false
	for _, m := range metrics {
		if m.MountPoint == "" {
			t.Error("Expected non-empty mount point")
		}
		if m.TotalBytes > 0 {
			hasValidPartition = true
		}
	}

	if !hasValidPartition {
		t.Error("Expected at least one partition with non-zero total bytes")
	}
}

func TestCollectDiskIO(t *testing.T) {
	metrics, err := CollectDiskIO()
	if err != nil {
		t.Fatalf("CollectDiskIO failed: %v", err)
	}

	for _, m := range metrics {
		if m.Device == "" {
			t.Error("Expected non-empty device name")
		}
	}
}
