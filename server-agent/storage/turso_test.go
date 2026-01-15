package storage

import (
	"testing"
)

func TestNewTursoClient_InvalidURL(t *testing.T) {
	_, err := NewTursoClient("invalid-url", "token")
	if err == nil {
		t.Error("Expected error for invalid URL")
	}
}

func TestTursoClientStructure(t *testing.T) {
	var client *TursoClient
	if client != nil {
		t.Error("Expected nil client")
	}
}
