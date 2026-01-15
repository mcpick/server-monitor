package health

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestNewServer(t *testing.T) {
	s := NewServer(":8081")
	if s == nil {
		t.Fatal("NewServer returned nil")
	}
	if s.server.Addr != ":8081" {
		t.Errorf("Expected address :8081, got %s", s.server.Addr)
	}
}

func TestHealthEndpoint(t *testing.T) {
	s := NewServer(":8081")

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	s.handleHealth(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var status Status
	if err := json.NewDecoder(w.Body).Decode(&status); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if status.Status != "healthy" {
		t.Errorf("Expected status 'healthy', got '%s'", status.Status)
	}

	if status.ErrorCount != 0 {
		t.Errorf("Expected error count 0, got %d", status.ErrorCount)
	}
}

func TestReadyEndpoint_NotReady(t *testing.T) {
	s := NewServer(":8081")

	req := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()

	s.handleReady(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected status 503, got %d", w.Code)
	}

	var status Status
	if err := json.NewDecoder(w.Body).Decode(&status); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if status.Status != "not_ready" {
		t.Errorf("Expected status 'not_ready', got '%s'", status.Status)
	}
}

func TestReadyEndpoint_Ready(t *testing.T) {
	s := NewServer(":8081")
	s.SetDBReady(true)

	req := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()

	s.handleReady(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var status Status
	if err := json.NewDecoder(w.Body).Decode(&status); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if status.Status != "ready" {
		t.Errorf("Expected status 'ready', got '%s'", status.Status)
	}
}

func TestRecordCollection(t *testing.T) {
	s := NewServer(":8081")

	timestamp := time.Now().Unix()
	s.RecordCollection(timestamp)

	if s.lastCollectionTime.Load() != timestamp {
		t.Errorf("Expected timestamp %d, got %d", timestamp, s.lastCollectionTime.Load())
	}

	if s.lastCollectionError.Load().(string) != "" {
		t.Errorf("Expected empty error, got '%s'", s.lastCollectionError.Load().(string))
	}
}

func TestRecordError(t *testing.T) {
	s := NewServer(":8081")

	err := errors.New("test error")
	s.RecordError(err)

	if s.errorCount.Load() != 1 {
		t.Errorf("Expected error count 1, got %d", s.errorCount.Load())
	}

	if s.lastCollectionError.Load().(string) != "test error" {
		t.Errorf("Expected error 'test error', got '%s'", s.lastCollectionError.Load().(string))
	}

	// Record another error
	s.RecordError(errors.New("another error"))
	if s.errorCount.Load() != 2 {
		t.Errorf("Expected error count 2, got %d", s.errorCount.Load())
	}
}

func TestRecordError_Nil(t *testing.T) {
	s := NewServer(":8081")

	s.RecordError(nil)

	if s.errorCount.Load() != 1 {
		t.Errorf("Expected error count 1, got %d", s.errorCount.Load())
	}

	// Error message should remain empty for nil error
	if s.lastCollectionError.Load().(string) != "" {
		t.Errorf("Expected empty error message for nil error, got '%s'", s.lastCollectionError.Load().(string))
	}
}

func TestHealthEndpoint_WithData(t *testing.T) {
	s := NewServer(":8081")

	timestamp := time.Now().Unix()
	s.RecordCollection(timestamp)
	s.RecordError(errors.New("some error"))
	s.RecordCollection(timestamp + 5) // New successful collection clears error

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	s.handleHealth(w, req)

	var status Status
	if err := json.NewDecoder(w.Body).Decode(&status); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if status.LastCollectionTime != timestamp+5 {
		t.Errorf("Expected timestamp %d, got %d", timestamp+5, status.LastCollectionTime)
	}

	if status.ErrorCount != 1 {
		t.Errorf("Expected error count 1, got %d", status.ErrorCount)
	}

	// Error should be cleared after successful collection
	if status.LastCollectionError != "" {
		t.Errorf("Expected empty error after successful collection, got '%s'", status.LastCollectionError)
	}
}

func TestSetDBReady(t *testing.T) {
	s := NewServer(":8081")

	if s.dbReady.Load() {
		t.Error("Expected dbReady to be false initially")
	}

	s.SetDBReady(true)
	if !s.dbReady.Load() {
		t.Error("Expected dbReady to be true after SetDBReady(true)")
	}

	s.SetDBReady(false)
	if s.dbReady.Load() {
		t.Error("Expected dbReady to be false after SetDBReady(false)")
	}
}

func TestHealthEndpoint_ContentType(t *testing.T) {
	s := NewServer(":8081")

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	s.handleHealth(w, req)

	contentType := w.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected Content-Type 'application/json', got '%s'", contentType)
	}
}

func TestReadyEndpoint_ContentType(t *testing.T) {
	s := NewServer(":8081")

	req := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()

	s.handleReady(w, req)

	contentType := w.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected Content-Type 'application/json', got '%s'", contentType)
	}
}
