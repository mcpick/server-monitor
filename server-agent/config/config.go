package config

import (
	"errors"
	"os"
	"time"

	"github.com/google/uuid"
)

type Config struct {
	TursoDatabaseURL   string
	TursoAuthToken     string
	CollectionInterval time.Duration
	Hostname           string
	ServerID           string
	HealthPort         string
}

func Load() (*Config, error) {
	cfg := &Config{}

	cfg.TursoDatabaseURL = os.Getenv("TURSO_DATABASE_URL")
	if cfg.TursoDatabaseURL == "" {
		return nil, errors.New("TURSO_DATABASE_URL environment variable is required")
	}

	cfg.TursoAuthToken = os.Getenv("TURSO_AUTH_TOKEN")
	if cfg.TursoAuthToken == "" {
		return nil, errors.New("TURSO_AUTH_TOKEN environment variable is required")
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
		cfg.ServerID = uuid.NewString()
	}

	cfg.HealthPort = os.Getenv("HEALTH_PORT")
	if cfg.HealthPort == "" {
		cfg.HealthPort = "8081"
	}

	return cfg, nil
}
