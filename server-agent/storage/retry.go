package storage

import (
	"context"
	"errors"
	"log"
	"math"
	"time"
)

// RetryConfig configures the retry behavior.
type RetryConfig struct {
	MaxAttempts     int
	InitialDelay    time.Duration
	MaxDelay        time.Duration
	BackoffFactor   float64
	RetryableErrors func(error) bool
}

// DefaultRetryConfig returns the default retry configuration.
func DefaultRetryConfig() RetryConfig {
	return RetryConfig{
		MaxAttempts:   3,
		InitialDelay:  100 * time.Millisecond,
		MaxDelay:      5 * time.Second,
		BackoffFactor: 2.0,
		RetryableErrors: func(err error) bool {
			// By default, retry all errors except context cancellation
			return err != nil && !errors.Is(err, context.Canceled)
		},
	}
}

// WithRetry executes the given function with exponential backoff retry.
func WithRetry(ctx context.Context, cfg RetryConfig, operation string, fn func() error) error {
	var lastErr error

	for attempt := 1; attempt <= cfg.MaxAttempts; attempt++ {
		err := fn()
		if err == nil {
			return nil
		}

		lastErr = err

		// Check if we should retry this error
		if !cfg.RetryableErrors(err) {
			return err
		}

		// Don't sleep on the last attempt
		if attempt == cfg.MaxAttempts {
			break
		}

		// Calculate delay with exponential backoff
		delay := time.Duration(float64(cfg.InitialDelay) * math.Pow(cfg.BackoffFactor, float64(attempt-1)))
		if delay > cfg.MaxDelay {
			delay = cfg.MaxDelay
		}

		log.Printf("Retry %d/%d for %s after error: %v (waiting %v)", attempt, cfg.MaxAttempts, operation, err, delay)

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(delay):
		}
	}

	return lastErr
}
