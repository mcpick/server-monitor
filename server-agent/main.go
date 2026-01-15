package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"server-agent/collector"
	"server-agent/config"
	"server-agent/storage"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	client, err := storage.NewTursoClient(cfg.TursoDatabaseURL, cfg.TursoAuthToken)
	if err != nil {
		log.Fatalf("Failed to connect to Turso: %v", err)
	}
	defer func() {
		if err := client.Close(); err != nil {
			log.Printf("Error closing Turso client: %v", err)
		}
	}()

	if err := client.RegisterServer(cfg.ServerID, cfg.Hostname); err != nil {
		log.Fatalf("Failed to register server: %v", err)
	}

	log.Printf("Server agent started for %s (ID: %s)", cfg.Hostname, cfg.ServerID)
	log.Printf("Collecting metrics every %s", cfg.CollectionInterval)

	ticker := time.NewTicker(cfg.CollectionInterval)
	defer ticker.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case <-ticker.C:
			collectAndStore(client, cfg.ServerID)
		case sig := <-sigChan:
			log.Printf("Received signal %v, shutting down...", sig)
			return
		}
	}
}

func collectAndStore(client *storage.TursoClient, serverID string) {
	timestamp := time.Now().Unix()

	cpuMetrics, err := collector.CollectCPU()
	if err != nil {
		log.Printf("Error collecting CPU metrics: %v", err)
	} else if err := client.InsertCPUMetrics(serverID, timestamp, cpuMetrics); err != nil {
		log.Printf("Error storing CPU metrics: %v", err)
	}

	memMetrics, err := collector.CollectMemory()
	if err != nil {
		log.Printf("Error collecting memory metrics: %v", err)
	} else if err := client.InsertMemoryMetrics(serverID, timestamp, memMetrics); err != nil {
		log.Printf("Error storing memory metrics: %v", err)
	}

	swapMetrics, err := collector.CollectSwap()
	if err != nil {
		log.Printf("Error collecting swap metrics: %v", err)
	} else if err := client.InsertSwapMetrics(serverID, timestamp, swapMetrics); err != nil {
		log.Printf("Error storing swap metrics: %v", err)
	}

	diskUsage, err := collector.CollectDiskUsage()
	if err != nil {
		log.Printf("Error collecting disk usage metrics: %v", err)
	} else if err := client.InsertDiskUsageMetrics(serverID, timestamp, diskUsage); err != nil {
		log.Printf("Error storing disk usage metrics: %v", err)
	}

	diskIO, err := collector.CollectDiskIO()
	if err != nil {
		log.Printf("Error collecting disk I/O metrics: %v", err)
	} else if err := client.InsertDiskIOMetrics(serverID, timestamp, diskIO); err != nil {
		log.Printf("Error storing disk I/O metrics: %v", err)
	}

	netMetrics, err := collector.CollectNetwork()
	if err != nil {
		log.Printf("Error collecting network metrics: %v", err)
	} else if err := client.InsertNetworkMetrics(serverID, timestamp, netMetrics); err != nil {
		log.Printf("Error storing network metrics: %v", err)
	}

	procMetrics, err := collector.CollectTopProcesses(10)
	if err != nil {
		log.Printf("Error collecting process metrics: %v", err)
	} else if err := client.InsertProcessMetrics(serverID, timestamp, procMetrics); err != nil {
		log.Printf("Error storing process metrics: %v", err)
	}

	log.Printf("Collected and stored metrics at %d", timestamp)
}
