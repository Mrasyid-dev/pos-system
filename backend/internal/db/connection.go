package db

import (
	"context"
	"fmt"
	"pos-system/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

func NewConnection(cfg *config.Config, logger *zap.Logger) (*pgxpool.Pool, error) {
	dsn := cfg.GetDSN()
	
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set search_path explicitly for custom schema
	if cfg.DBSchema != "" && cfg.DBSchema != "public" {
		_, err = pool.Exec(context.Background(), fmt.Sprintf("SET search_path TO \"%s\", public", cfg.DBSchema))
		if err != nil {
			logger.Warn("Failed to set search_path", zap.Error(err))
		} else {
			logger.Info("Search path set", zap.String("schema", cfg.DBSchema))
		}
	}

	logger.Info("Database connection established")
	return pool, nil
}

