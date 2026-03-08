package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
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
	DBMaxOpenConns     int
	DBMaxIdleConns     int
}

// isLocalURL checks if the database URL is for local development
func isLocalURL(url string) bool {
	return strings.Contains(url, "localhost") || 
		   strings.Contains(url, "127.0.0.1") ||
		   strings.Contains(url, "sqld:")
}

func Load() (*Config, error) {
	cfg := &Config{}

	cfg.TursoDatabaseURL = os.Getenv("TURSO_DATABASE_URL")
	if cfg.TursoDatabaseURL == "" {
		return nil, errors.New("TURSO_DATABASE_URL environment variable is required")
	}

	cfg.TursoAuthToken = os.Getenv("TURSO_AUTH_TOKEN")
	// Make auth token optional for local development (localhost, 127.0.0.1)
	if cfg.TursoAuthToken == "" && !isLocalURL(cfg.TursoDatabaseURL) {
		return nil, errors.New("TURSO_AUTH_TOKEN environment variable is required for remote databases")
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

	// DB connection pool configuration
	cfg.DBMaxOpenConns = 5 // default
	if maxOpenConnsStr := os.Getenv("DB_MAX_OPEN_CONNS"); maxOpenConnsStr != "" {
		if maxOpenConns, err := strconv.Atoi(maxOpenConnsStr); err != nil {
			return nil, errors.New("DB_MAX_OPEN_CONNS must be a valid integer")
		} else {
			cfg.DBMaxOpenConns = maxOpenConns
		}
	}

	cfg.DBMaxIdleConns = 2 // default
	if maxIdleConnsStr := os.Getenv("DB_MAX_IDLE_CONNS"); maxIdleConnsStr != "" {
		if maxIdleConns, err := strconv.Atoi(maxIdleConnsStr); err != nil {
			return nil, errors.New("DB_MAX_IDLE_CONNS must be a valid integer")
		} else {
			cfg.DBMaxIdleConns = maxIdleConns
		}
	}

	return cfg, nil
}
