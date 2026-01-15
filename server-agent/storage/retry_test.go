package storage

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestWithRetry_SuccessOnFirstAttempt(t *testing.T) {
	cfg := DefaultRetryConfig()
	callCount := 0

	err := WithRetry(context.Background(), cfg, "test", func() error {
		callCount++
		return nil
	})

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if callCount != 1 {
		t.Errorf("expected 1 call, got %d", callCount)
	}
}

func TestWithRetry_SuccessOnSecondAttempt(t *testing.T) {
	cfg := DefaultRetryConfig()
	cfg.InitialDelay = 10 * time.Millisecond
	callCount := 0

	err := WithRetry(context.Background(), cfg, "test", func() error {
		callCount++
		if callCount < 2 {
			return errors.New("temporary error")
		}
		return nil
	})

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if callCount != 2 {
		t.Errorf("expected 2 calls, got %d", callCount)
	}
}

func TestWithRetry_FailsAfterMaxAttempts(t *testing.T) {
	cfg := DefaultRetryConfig()
	cfg.MaxAttempts = 3
	cfg.InitialDelay = 10 * time.Millisecond
	callCount := 0
	expectedErr := errors.New("persistent error")

	err := WithRetry(context.Background(), cfg, "test", func() error {
		callCount++
		return expectedErr
	})

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
	if callCount != 3 {
		t.Errorf("expected 3 calls, got %d", callCount)
	}
}

func TestWithRetry_RespectsContextCancellation(t *testing.T) {
	cfg := DefaultRetryConfig()
	cfg.InitialDelay = 1 * time.Second
	callCount := 0

	ctx, cancel := context.WithCancel(context.Background())

	go func() {
		time.Sleep(50 * time.Millisecond)
		cancel()
	}()

	err := WithRetry(ctx, cfg, "test", func() error {
		callCount++
		return errors.New("temporary error")
	})

	if !errors.Is(err, context.Canceled) {
		t.Errorf("expected context.Canceled error, got %v", err)
	}
}

func TestWithRetry_NonRetryableError(t *testing.T) {
	cfg := DefaultRetryConfig()
	cfg.InitialDelay = 10 * time.Millisecond
	callCount := 0
	nonRetryableErr := errors.New("non-retryable error")

	cfg.RetryableErrors = func(err error) bool {
		return !errors.Is(err, nonRetryableErr)
	}

	err := WithRetry(context.Background(), cfg, "test", func() error {
		callCount++
		return nonRetryableErr
	})

	if !errors.Is(err, nonRetryableErr) {
		t.Errorf("expected error %v, got %v", nonRetryableErr, err)
	}
	if callCount != 1 {
		t.Errorf("expected 1 call (no retry), got %d", callCount)
	}
}

func TestDefaultRetryConfig(t *testing.T) {
	cfg := DefaultRetryConfig()

	if cfg.MaxAttempts != 3 {
		t.Errorf("expected MaxAttempts 3, got %d", cfg.MaxAttempts)
	}
	if cfg.InitialDelay != 100*time.Millisecond {
		t.Errorf("expected InitialDelay 100ms, got %v", cfg.InitialDelay)
	}
	if cfg.MaxDelay != 5*time.Second {
		t.Errorf("expected MaxDelay 5s, got %v", cfg.MaxDelay)
	}
	if cfg.BackoffFactor != 2.0 {
		t.Errorf("expected BackoffFactor 2.0, got %f", cfg.BackoffFactor)
	}
	if cfg.RetryableErrors == nil {
		t.Error("expected RetryableErrors to be set")
	}
}
