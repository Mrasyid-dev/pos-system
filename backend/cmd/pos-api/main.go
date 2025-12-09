package main

import (
	"fmt"
	"log"
	"pos-system/internal/auth"
	"pos-system/internal/config"
	"pos-system/internal/db"
	"pos-system/internal/inventory"
	"pos-system/internal/product"
	"pos-system/internal/report"
	"pos-system/internal/sale"
	"pos-system/internal/server"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := config.Load()

	// Initialize logger
	var logger *zap.Logger
	var err error
	if cfg.IsProduction() {
		logger, err = zap.NewProduction()
	} else {
		logger, err = zap.NewDevelopment()
	}
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	// Connect to database
	pool, err := db.NewConnection(cfg, logger)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	// Initialize queries
	queries := db.New(pool)

	// Initialize services
	authService := auth.NewService(queries, cfg.JWTSecret)
	productService := product.NewService(queries)
	inventoryService := inventory.NewService(queries)
	saleService := sale.NewService(queries, pool)
	reportService := report.NewService(queries)

	// Initialize handlers
	authHandler := auth.NewHandler(authService)
	productHandler := product.NewHandler(productService)
	inventoryHandler := inventory.NewHandler(inventoryService)
	saleHandler := sale.NewHandler(saleService)
	reportHandler := report.NewHandler(reportService)

	// Initialize server
	srv := server.NewServer(
		authHandler,
		productHandler,
		inventoryHandler,
		saleHandler,
		reportHandler,
		authService,
		logger,
	)

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.ServerHost, cfg.ServerPort)
	logger.Info("Starting server", zap.String("address", addr))
	if err := srv.Run(addr); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}

