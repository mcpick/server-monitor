package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"server-agent/collector"
	"server-agent/config"
	"server-agent/health"
	"server-agent/storage"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Start health check server
	healthServer := health.NewServer(":" + cfg.HealthPort)
	go func() {
		if err := healthServer.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Printf("Health server error: %v", err)
		}
	}()

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

	// Mark database as ready after successful connection and registration
	healthServer.SetDBReady(true)

	log.Printf("Server agent started for %s (ID: %s)", cfg.Hostname, cfg.ServerID)
	log.Printf("Collecting metrics every %s", cfg.CollectionInterval)
	log.Printf("Health check endpoint available at http://localhost:%s/health", cfg.HealthPort)

	ticker := time.NewTicker(cfg.CollectionInterval)
	defer ticker.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case <-ticker.C:
			collectAndStoreWithHealth(client, cfg.ServerID, healthServer)
		case sig := <-sigChan:
			log.Printf("Received signal %v, shutting down...", sig)
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if err := healthServer.Shutdown(ctx); err != nil {
				log.Printf("Error shutting down health server: %v", err)
			}
			return
		}
	}
}

func collectAndStoreWithHealth(client *storage.TursoClient, serverID string, healthServer *health.Server) {
	timestamp := time.Now().Unix()
	var hasError bool

	cpuMetrics, err := collector.CollectCPU()
	if err != nil {
		log.Printf("Error collecting CPU metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else if err := client.InsertCPUMetrics(serverID, timestamp, cpuMetrics); err != nil {
		log.Printf("Error storing CPU metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	memMetrics, err := collector.CollectMemory()
	if err != nil {
		log.Printf("Error collecting memory metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else if err := client.InsertMemoryMetrics(serverID, timestamp, memMetrics); err != nil {
		log.Printf("Error storing memory metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	swapMetrics, err := collector.CollectSwap()
	if err != nil {
		log.Printf("Error collecting swap metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else if err := client.InsertSwapMetrics(serverID, timestamp, swapMetrics); err != nil {
		log.Printf("Error storing swap metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	diskUsage, err := collector.CollectDiskUsage()
	if err != nil {
		log.Printf("Error collecting disk usage metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else if err := client.InsertDiskUsageMetrics(serverID, timestamp, diskUsage); err != nil {
		log.Printf("Error storing disk usage metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	diskIO, err := collector.CollectDiskIO()
	if err != nil {
		log.Printf("Error collecting disk I/O metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else if err := client.InsertDiskIOMetrics(serverID, timestamp, diskIO); err != nil {
		log.Printf("Error storing disk I/O metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	netMetrics, err := collector.CollectNetwork()
	if err != nil {
		log.Printf("Error collecting network metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else if err := client.InsertNetworkMetrics(serverID, timestamp, netMetrics); err != nil {
		log.Printf("Error storing network metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	procMetrics, err := collector.CollectTopProcesses(10)
	if err != nil {
		log.Printf("Error collecting process metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else if err := client.InsertProcessMetrics(serverID, timestamp, procMetrics); err != nil {
		log.Printf("Error storing process metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	if !hasError {
		healthServer.RecordCollection(timestamp)
	}

	log.Printf("Collected and stored metrics at %d", timestamp)
}
