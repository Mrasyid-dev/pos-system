package server

import (
	"pos-system/internal/auth"
	"pos-system/internal/category"
	"pos-system/internal/inventory"
	"pos-system/internal/product"
	"pos-system/internal/report"
	"pos-system/internal/sale"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type Server struct {
	router          *gin.Engine
	authHandler     *auth.Handler
	productHandler  *product.Handler
	inventoryHandler *inventory.Handler
	categoryHandler *category.Handler
	saleHandler     *sale.Handler
	reportHandler   *report.Handler
	authService     *auth.Service
	logger          *zap.Logger
}

func NewServer(
	authHandler *auth.Handler,
	productHandler *product.Handler,
	inventoryHandler *inventory.Handler,
	categoryHandler *category.Handler,
	saleHandler *sale.Handler,
	reportHandler *report.Handler,
	authService *auth.Service,
	logger *zap.Logger,
) *Server {
	if logger == nil {
		logger, _ = zap.NewProduction()
	}

	router := gin.Default()
	if logger != nil {
		router.Use(ginLogger(logger))
	}
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())

	s := &Server{
		router:           router,
		authHandler:      authHandler,
		productHandler:   productHandler,
		inventoryHandler: inventoryHandler,
		categoryHandler:  categoryHandler,
		saleHandler:      saleHandler,
		reportHandler:    reportHandler,
		authService:      authService,
		logger:           logger,
	}

	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	// Health check
	s.router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1
	v1 := s.router.Group("/api/v1")
	{
		// Auth (public)
		authGroup := v1.Group("/auth")
		{
			authGroup.POST("/login", s.authHandler.Login)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(auth.AuthMiddleware(s.authService))
		{
			// Categories
			categories := protected.Group("/categories")
			{
				categories.GET("", s.categoryHandler.List)
				categories.POST("", auth.AdminOnlyMiddleware(), s.categoryHandler.Create)
				categories.PUT("/:id", auth.AdminOnlyMiddleware(), s.categoryHandler.Update)
				categories.DELETE("/:id", auth.AdminOnlyMiddleware(), s.categoryHandler.Delete)
			}

			// Products
			products := protected.Group("/products")
			{
				products.GET("", s.productHandler.List)
				products.GET("/search", s.productHandler.Search)
				products.GET("/:id", s.productHandler.GetByID)
				products.POST("", auth.AdminOnlyMiddleware(), s.productHandler.Create)
				products.PUT("/:id", auth.AdminOnlyMiddleware(), s.productHandler.Update)
				products.DELETE("/:id", auth.AdminOnlyMiddleware(), s.productHandler.Delete)
			}

			// Inventory
			inventory := protected.Group("/inventory")
			{
				inventory.GET("", s.inventoryHandler.List)
				inventory.GET("/:product_id", s.inventoryHandler.GetByProductID)
				inventory.POST("/adjust", auth.AdminOnlyMiddleware(), s.inventoryHandler.Adjust)
			}

			// Sales
			sales := protected.Group("/sales")
			{
				sales.POST("", s.saleHandler.Create)
				sales.GET("", s.saleHandler.List)
				sales.GET("/:id", s.saleHandler.GetByID)
			}

			// Reports
			reports := protected.Group("/reports")
			{
				reports.GET("/sales", s.reportHandler.GetSales)
				reports.GET("/top-products", s.reportHandler.GetTopProducts)
				reports.GET("/stats", s.reportHandler.GetStats)
			}
		}
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}

func ginLogger(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		logger.Info("HTTP Request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
		)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

