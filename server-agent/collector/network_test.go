package collector

import (
	"testing"
)

func TestCollectNetwork(t *testing.T) {
	metrics, err := CollectNetwork()
	if err != nil {
		t.Fatalf("CollectNetwork failed: %v", err)
	}

	for _, m := range metrics {
		if m.Interface == "" {
			t.Error("Expected non-empty interface name")
		}
		if m.Interface == "lo" || m.Interface == "lo0" {
			t.Error("Loopback interface should be filtered out")
		}
	}
}
