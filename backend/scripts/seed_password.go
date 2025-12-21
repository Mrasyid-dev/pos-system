//go:build ignore
// +build ignore

package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// This script generates bcrypt hashes for the seed data
// Run: go run scripts/seed_password.go
func main() {
	password := "admin123"
	
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("Hash: %s\n", string(hash))
	fmt.Printf("\nUse this hash in migrations/0002_seed.sql\n")
}

