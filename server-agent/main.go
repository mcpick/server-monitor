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

	client := storage.NewHTTPClient(cfg.IngestURL, cfg.IngestAPIKey)

	// Mark as ready immediately — no DB connection to establish
	healthServer.SetDBReady(true)

	log.Printf("Server agent started for %s (ID: %s)", cfg.Hostname, cfg.ServerID)
	log.Printf("Collecting metrics every %s", cfg.CollectionInterval)
	log.Printf("Ingesting to %s", cfg.IngestURL)
	log.Printf("Health check endpoint available at http://localhost:%s/health", cfg.HealthPort)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ticker := time.NewTicker(cfg.CollectionInterval)
	defer ticker.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case <-ticker.C:
			collectAndSend(ctx, client, cfg, healthServer)
		case sig := <-sigChan:
			log.Printf("Received signal %v, shutting down...", sig)
			cancel()
			shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer shutdownCancel()
			if err := healthServer.Shutdown(shutdownCtx); err != nil {
				log.Printf("Error shutting down health server: %v", err)
			}
			return
		}
	}
}

func collectAndSend(ctx context.Context, client *storage.HTTPClient, cfg *config.Config, healthServer *health.Server) {
	timestamp := time.Now().Unix()

	payload := &storage.IngestPayload{
		ServerID:  cfg.ServerID,
		Hostname:  cfg.Hostname,
		Timestamp: timestamp,
	}

	var hasError bool

	if cpuMetrics, err := collector.CollectCPU(); err != nil {
		log.Printf("Error collecting CPU metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else {
		payload.CPU = cpuMetrics
	}

	if memMetrics, err := collector.CollectMemory(); err != nil {
		log.Printf("Error collecting memory metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else {
		payload.Memory = memMetrics
	}

	if swapMetrics, err := collector.CollectSwap(); err != nil {
		log.Printf("Error collecting swap metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else {
		payload.Swap = swapMetrics
	}

	if diskUsage, err := collector.CollectDiskUsage(); err != nil {
		log.Printf("Error collecting disk usage metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else {
		payload.DiskUsage = diskUsage
	}

	if diskIO, err := collector.CollectDiskIO(); err != nil {
		log.Printf("Error collecting disk I/O metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else {
		payload.DiskIO = diskIO
	}

	if netMetrics, err := collector.CollectNetwork(); err != nil {
		log.Printf("Error collecting network metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else {
		payload.Network = netMetrics
	}

	if procMetrics, err := collector.CollectTopProcesses(10); err != nil {
		log.Printf("Error collecting process metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	} else {
		payload.Processes = procMetrics
	}

	if err := client.Send(ctx, payload); err != nil {
		log.Printf("Error sending metrics: %v", err)
		healthServer.RecordError(err)
		hasError = true
	}

	if !hasError {
		healthServer.RecordCollection(timestamp)
	}

	log.Printf("Collected and sent metrics at %d", timestamp)
}
