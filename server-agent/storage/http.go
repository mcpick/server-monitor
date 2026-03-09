package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"server-agent/collector"
)

type IngestPayload struct {
	ServerID  string                       `json:"serverId"`
	Hostname  string                       `json:"hostname"`
	Timestamp int64                        `json:"timestamp"`
	CPU       *collector.CPUMetrics        `json:"cpu,omitempty"`
	Memory    *collector.MemoryMetrics     `json:"memory,omitempty"`
	Swap      *collector.SwapMetrics       `json:"swap,omitempty"`
	DiskUsage []collector.DiskUsageMetrics `json:"diskUsage,omitempty"`
	DiskIO    []collector.DiskIOMetrics    `json:"diskIO,omitempty"`
	Network   []collector.NetworkMetrics   `json:"network,omitempty"`
	Processes []collector.ProcessMetrics   `json:"processes,omitempty"`
}

type HTTPClient struct {
	ingestURL string
	apiKey    string
	client    *http.Client
	retry     RetryConfig
}

func NewHTTPClient(ingestURL, apiKey string) *HTTPClient {
	return &HTTPClient{
		ingestURL: ingestURL,
		apiKey:    apiKey,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		retry: DefaultRetryConfig(),
	}
}

func (c *HTTPClient) Send(ctx context.Context, payload *IngestPayload) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal payload: %w", err)
	}

	return WithRetry(ctx, c.retry, "ingest", func() error {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.ingestURL, bytes.NewReader(body))
		if err != nil {
			return fmt.Errorf("create request: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+c.apiKey)

		resp, err := c.client.Do(req)
		if err != nil {
			return fmt.Errorf("send request: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			return nil
		}

		respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("ingest returned %d: %s", resp.StatusCode, string(respBody))
	})
}
