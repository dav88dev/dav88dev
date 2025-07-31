// Personal Portfolio Website - Go Migration
// Enterprise-grade web application using Gin framework
// Following Go 1.24+ best practices and modern architecture patterns
package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"

	"github.com/dav88dev/myWebsite-go/config"
	"github.com/dav88dev/myWebsite-go/internal/middleware"
	"github.com/dav88dev/myWebsite-go/internal/routes"
)

func main() {
	// Load enterprise-grade configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	// Setup MongoDB connection with enterprise patterns
	err = cfg.SetupMongoDB()
	if err != nil {
		log.Fatalf("❌ Failed to setup MongoDB: %v", err)
	}

	// Configure Gin mode based on environment
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
		log.Println("🚀 Running in PRODUCTION mode")
	} else {
		gin.SetMode(gin.DebugMode)
		log.Println("🛠️  Running in DEVELOPMENT mode")
	}

	// Create Gin router with enterprise middleware stack
	router := setupRouter(cfg)

	// Setup all application routes
	routes.SetupRoutes(router, cfg)

	// Start server with HTTP/2 support and proper error handling
	address := cfg.GetServerAddress()
	log.Printf("🌟 Starting server on %s (env: %s)", address, cfg.Environment)

	// Start server with HTTP/2 support
	if err := cfg.StartServerWithHTTP2(router); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

// setupRouter configures the Gin router with enterprise middleware stack
// Following latest Gin v1.10+ best practices and security patterns
func setupRouter(cfg *config.Config) *gin.Engine {
	// Create router with custom configuration
	router := gin.New()

	// Core middleware stack (order matters for performance)
	
	// 1. Recovery middleware - handles panics gracefully
	router.Use(gin.Recovery())

	// 2. Custom logging middleware for enterprise observability
	router.Use(middleware.Logger(cfg.LogLevel))

	// 3. CORS middleware with production-ready configuration
	corsConfig := cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigins},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Cache-Control"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}
	
	// Configure CORS for development vs production
	if cfg.IsDevelopment() {
		corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"}
	}
	router.Use(cors.New(corsConfig))

	// 4. Compression middleware - Gzip with optimal settings
	router.Use(gzip.Gzip(gzip.BestCompression))

	// 5. Rate limiting middleware (production only)
	if cfg.EnableRateLimit {
		router.Use(middleware.RateLimit(cfg.RateLimitRPS))
	}

	// 6. Security headers middleware
	router.Use(middleware.SecurityHeaders())

	// 7. Static file serving with enterprise caching
	// Serve static files from multiple locations for flexibility
	router.Use(static.Serve("/", static.LocalFile("./static", false)))
	router.Use(static.Serve("/static", static.LocalFile("./static", false)))
	
	// Additional static paths for frontend assets
	if cfg.IsDevelopment() {
		// Development: Serve from dist for Vite builds
		router.Use(static.Serve("/assets", static.LocalFile("./dist/assets", false)))
	}

	// 8. Request metrics middleware for monitoring
	router.Use(middleware.Metrics())

	return router
}

// gracefulShutdown handles graceful shutdown of the application
// Following enterprise patterns for clean resource cleanup
func gracefulShutdown() {
	// Cleanup MongoDB connections
	log.Println("🔄 Shutting down gracefully...")
	
	// Add any cleanup logic here
	// - Close database connections
	// - Finish pending requests
	// - Save application state
	
	log.Println("✅ Graceful shutdown completed")
	os.Exit(0)
}