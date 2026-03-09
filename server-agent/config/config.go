package config

import (
	"errors"
	"os"
	"time"

	gonanoid "github.com/matoous/go-nanoid/v2"
)

type Config struct {
	IngestURL          string
	IngestAPIKey       string
	CollectionInterval time.Duration
	Hostname           string
	ServerID           string
	HealthPort         string
}

func Load() (*Config, error) {
	cfg := &Config{}

	cfg.IngestURL = os.Getenv("INGEST_URL")
	if cfg.IngestURL == "" {
		return nil, errors.New("INGEST_URL environment variable is required")
	}

	cfg.IngestAPIKey = os.Getenv("INGEST_API_KEY")
	if cfg.IngestAPIKey == "" {
		return nil, errors.New("INGEST_API_KEY environment variable is required")
	}

	intervalStr := os.Getenv("COLLECTION_INTERVAL")
	if intervalStr == "" {
		cfg.CollectionInterval = 5 * time.Second
	} else {
		interval, err := time.ParseDuration(intervalStr)
		if err != nil {
			return nil, errors.New("COLLECTION_INTERVAL must be a valid duration (e.g., 5s, 1m)")
		}
		cfg.CollectionInterval = interval
	}

	cfg.Hostname = os.Getenv("HOSTNAME")
	if cfg.Hostname == "" {
		hostname, err := os.Hostname()
		if err != nil {
			cfg.Hostname = "unknown"
		} else {
			cfg.Hostname = hostname
		}
	}

	cfg.ServerID = os.Getenv("SERVER_ID")
	if cfg.ServerID == "" {
		cfg.ServerID = gonanoid.Must()
	}

	cfg.HealthPort = os.Getenv("HEALTH_PORT")
	if cfg.HealthPort == "" {
		cfg.HealthPort = "8081"
	}

	return cfg, nil
}
