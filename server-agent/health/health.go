package health

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync/atomic"
	"time"
)

// Status represents the current health status of the daemon.
type Status struct {
	Status              string `json:"status"`
	LastCollectionTime  int64  `json:"last_collection_time,omitempty"`
	LastCollectionError string `json:"last_collection_error,omitempty"`
	ErrorCount          int64  `json:"error_count"`
	Uptime              string `json:"uptime"`
}

// Server provides HTTP health check endpoints for the daemon.
type Server struct {
	server              *http.Server
	startTime           time.Time
	lastCollectionTime  atomic.Int64
	lastCollectionError atomic.Value // stores string
	errorCount          atomic.Int64
	dbReady             atomic.Bool
}

// NewServer creates a new health check server listening on the given address.
func NewServer(addr string) *Server {
	s := &Server{
		startTime: time.Now(),
	}
	s.lastCollectionError.Store("")

	mux := http.NewServeMux()
	mux.HandleFunc("/health", s.handleHealth)
	mux.HandleFunc("/ready", s.handleReady)

	s.server = &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	return s
}

// Start begins listening for health check requests.
func (s *Server) Start() error {
	log.Printf("Health check server starting on %s", s.server.Addr)
	return s.server.ListenAndServe()
}

// Shutdown gracefully stops the health check server.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}

// SetDBReady marks the database connection as ready.
func (s *Server) SetDBReady(ready bool) {
	s.dbReady.Store(ready)
}

// RecordCollection records a successful metric collection.
func (s *Server) RecordCollection(timestamp int64) {
	s.lastCollectionTime.Store(timestamp)
	s.lastCollectionError.Store("")
}

// RecordError records a collection error.
func (s *Server) RecordError(err error) {
	s.errorCount.Add(1)
	if err != nil {
		s.lastCollectionError.Store(err.Error())
	}
}

// handleHealth is the liveness probe endpoint.
// Returns 200 OK if the daemon process is running.
func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	status := Status{
		Status:              "healthy",
		LastCollectionTime:  s.lastCollectionTime.Load(),
		LastCollectionError: s.lastCollectionError.Load().(string),
		ErrorCount:          s.errorCount.Load(),
		Uptime:              time.Since(s.startTime).Round(time.Second).String(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(status); err != nil {
		log.Printf("Error encoding health response: %v", err)
	}
}

// handleReady is the readiness probe endpoint.
// Returns 200 OK if the daemon is ready to collect and store metrics.
func (s *Server) handleReady(w http.ResponseWriter, _ *http.Request) {
	ready := s.dbReady.Load()

	status := Status{
		LastCollectionTime:  s.lastCollectionTime.Load(),
		LastCollectionError: s.lastCollectionError.Load().(string),
		ErrorCount:          s.errorCount.Load(),
		Uptime:              time.Since(s.startTime).Round(time.Second).String(),
	}

	w.Header().Set("Content-Type", "application/json")

	if ready {
		status.Status = "ready"
		w.WriteHeader(http.StatusOK)
	} else {
		status.Status = "not_ready"
		w.WriteHeader(http.StatusServiceUnavailable)
	}

	if err := json.NewEncoder(w).Encode(status); err != nil {
		log.Printf("Error encoding ready response: %v", err)
	}
}
