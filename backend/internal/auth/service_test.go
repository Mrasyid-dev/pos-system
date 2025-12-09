package auth

import (
	"context"
	"testing"
	"golang.org/x/crypto/bcrypt"
)

func TestGeneratePasswordHash(t *testing.T) {
	service := &Service{secret: []byte("test-secret")}
	
	password := "test123"
	hash, err := service.GeneratePasswordHash(password)
	if err != nil {
		t.Fatalf("Failed to generate hash: %v", err)
	}

	if hash == "" {
		t.Error("Hash should not be empty")
	}

	// Verify the hash
	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		t.Error("Generated hash should match password")
	}
}

func TestValidateToken(t *testing.T) {
	service := &Service{secret: []byte("test-secret")}
	
	// Generate a token
	token, err := service.generateToken(1, "testuser", "admin")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Validate the token
	claims, err := service.ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.UserID != 1 {
		t.Errorf("Expected UserID 1, got %d", claims.UserID)
	}

	if claims.Username != "testuser" {
		t.Errorf("Expected Username 'testuser', got '%s'", claims.Username)
	}

	if claims.Role != "admin" {
		t.Errorf("Expected Role 'admin', got '%s'", claims.Role)
	}
}

