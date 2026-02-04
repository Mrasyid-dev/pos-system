package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSchema       string
	JWTSecret      string
	ServerPort     string
	ServerHost     string
	Environment    string
}

func Load() *Config {
	return &Config{
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASS", "postgres"),
		DBName:      getEnv("DB_NAME", "pos_db"),
		DBSchema:    getEnv("DB_SCHEMA", "public"),
		JWTSecret:   getEnv("JWT_SECRET", "change_this_secret_key_in_production"),
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		ServerHost:  getEnv("SERVER_HOST", "0.0.0.0"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}
}

func (c *Config) GetDSN() string {
	// Untuk Supabase/production gunakan sslmode=require
	sslMode := "disable"
	if c.Environment == "production" || c.DBHost != "localhost" {
		sslMode = "require"
	}
	
	// Tambahkan search_path untuk custom schema
	searchPath := ""
	if c.DBSchema != "" && c.DBSchema != "public" {
		searchPath = fmt.Sprintf("&search_path=%s", c.DBSchema)
	}
	
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s%s",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName, sslMode, searchPath)
}

func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

