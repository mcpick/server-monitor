package config

import (
	"os"
	"testing"
	"time"
)

func TestLoad_RequiredEnvVars(t *testing.T) {
	os.Clearenv()

	_, err := Load()
	if err == nil {
		t.Error("Expected error when TURSO_DATABASE_URL is missing")
	}

	t.Setenv("TURSO_DATABASE_URL", "libsql://test.turso.io")
	_, err = Load()
	if err == nil {
		t.Error("Expected error when TURSO_AUTH_TOKEN is missing")
	}
}

func TestLoad_Defaults(t *testing.T) {
	os.Clearenv()
	t.Setenv("TURSO_DATABASE_URL", "libsql://test.turso.io")
	t.Setenv("TURSO_AUTH_TOKEN", "test-token")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if cfg.CollectionInterval != 5*time.Second {
		t.Errorf("Expected default interval of 5s, got %v", cfg.CollectionInterval)
	}

	if cfg.Hostname == "" {
		t.Error("Expected hostname to be set")
	}

	if cfg.ServerID == "" {
		t.Error("Expected ServerID to be generated")
	}

	if cfg.HealthPort != "8081" {
		t.Errorf("Expected default health port of 8081, got %s", cfg.HealthPort)
	}
}

func TestLoad_CustomValues(t *testing.T) {
	os.Clearenv()
	t.Setenv("TURSO_DATABASE_URL", "libsql://custom.turso.io")
	t.Setenv("TURSO_AUTH_TOKEN", "custom-token")
	t.Setenv("COLLECTION_INTERVAL", "10s")
	t.Setenv("HOSTNAME", "custom-host")
	t.Setenv("SERVER_ID", "custom-id")
	t.Setenv("HEALTH_PORT", "9090")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if cfg.TursoDatabaseURL != "libsql://custom.turso.io" {
		t.Errorf("Expected custom database URL, got %s", cfg.TursoDatabaseURL)
	}

	if cfg.TursoAuthToken != "custom-token" {
		t.Errorf("Expected custom auth token, got %s", cfg.TursoAuthToken)
	}

	if cfg.CollectionInterval != 10*time.Second {
		t.Errorf("Expected 10s interval, got %v", cfg.CollectionInterval)
	}

	if cfg.Hostname != "custom-host" {
		t.Errorf("Expected custom hostname, got %s", cfg.Hostname)
	}

	if cfg.ServerID != "custom-id" {
		t.Errorf("Expected custom server ID, got %s", cfg.ServerID)
	}

	if cfg.HealthPort != "9090" {
		t.Errorf("Expected custom health port of 9090, got %s", cfg.HealthPort)
	}
}

func TestLoad_InvalidInterval(t *testing.T) {
	os.Clearenv()
	t.Setenv("TURSO_DATABASE_URL", "libsql://test.turso.io")
	t.Setenv("TURSO_AUTH_TOKEN", "test-token")
	t.Setenv("COLLECTION_INTERVAL", "invalid")

	_, err := Load()
	if err == nil {
		t.Error("Expected error for invalid interval")
	}
}
