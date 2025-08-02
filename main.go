// Personal Portfolio Website - Go Migration  
// Enterprise-grade web application using Gin framework
// Following Go 1.24+ best practices and modern architecture patterns
// Version: Workflow fixes completed - All GitHub Actions now operational ✅
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/bugsnag/bugsnag-go-gin"
	"github.com/bugsnag/bugsnag-go/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/kamva/mgm/v3"

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

	// Setup MongoDB connection with enterprise patterns (optional)
	err = cfg.SetupMongoDB()
	if err != nil {
		log.Printf("⚠️  MongoDB setup failed: %v", err)
		log.Println("📝 Continuing without MongoDB - database features will be disabled")
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

	// Set maximum multipart memory (8 MB)
	router.MaxMultipartMemory = 8 << 20

	// Start server with HTTP/2 support and proper error handling
	address := cfg.GetServerAddress()
	log.Printf("🌟 Starting server on %s (env: %s)", address, cfg.Environment)

	// Setup graceful shutdown
	go handleGracefulShutdown()

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

	// 1. Recovery middleware - handles panics gracefully with custom 500 page
	router.Use(middleware.Recovery())

	// 2. Bugsnag error monitoring middleware (production only)
	if cfg.IsProduction() {
		bugsnagApiKey := os.Getenv("BUGSNAG_API_KEY")
		if bugsnagApiKey != "" {
			router.Use(bugsnaggin.AutoNotify(bugsnag.Configuration{
				APIKey:          bugsnagApiKey,
				ProjectPackages: []string{"main", "github.com/dav88dev/myWebsite-go"},
				ReleaseStage:    cfg.Environment,
				AppVersion:      "1.0.0",
			}))
			log.Println("📊 Bugsnag error monitoring enabled (production)")
		}
	} else {
		log.Println("📊 Bugsnag disabled in development mode (errors logged locally)")
	}

	// 3. Custom logging middleware for enterprise observability
	router.Use(middleware.Logger(cfg.LogLevel))

	// 4. CORS middleware with production-ready configuration
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "Cache-Control"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}

	// Configure CORS for development vs production
	if cfg.IsDevelopment() {
		corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"}
	} else {
		// Production: split comma-separated origins
		corsConfig.AllowOrigins = strings.Split(cfg.CORSOrigins, ",")
	}
	router.Use(cors.New(corsConfig))

	// 5. Compression middleware - Gzip with optimal settings
	router.Use(gzip.Gzip(gzip.BestCompression))

	// 6. Rate limiting middleware (production only)
	if cfg.EnableRateLimit {
		router.Use(middleware.RateLimit(cfg.RateLimitRPS))
	}

	// 7. Security headers middleware
	router.Use(middleware.SecurityHeaders())

	// 8. Cache headers for optimal performance
	router.Use(middleware.CacheHeaders())

	// 9. Static file serving with enterprise caching
	// Serve static files from multiple locations for flexibility
	router.Use(static.Serve("/", static.LocalFile("./static", false)))
	router.Use(static.Serve("/static", static.LocalFile("./static", false)))

	// Additional static paths for frontend assets
	if cfg.IsDevelopment() {
		// Development: Serve from dist for Vite builds
		router.Use(static.Serve("/assets", static.LocalFile("./dist/assets", false)))
	}

	// 10. Request metrics middleware for monitoring
	router.Use(middleware.Metrics())

	return router
}

// handleGracefulShutdown handles graceful shutdown of the application
// Following enterprise patterns for clean resource cleanup
func handleGracefulShutdown() {
	// Create channel to listen for interrupt signals
	quit := make(chan os.Signal, 1)
	// Register the channel to receive specific signals
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Block until signal is received
	<-quit
	log.Println("🔄 Shutting down gracefully...")

	// Disconnect from MongoDB (if connected)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if _, client, _, err := mgm.DefaultConfigs(); err == nil && client != nil {
		if err := client.Disconnect(ctx); err != nil {
			log.Printf("⚠️  Error disconnecting from MongoDB: %v", err)
		} else {
			log.Println("✅ MongoDB disconnected")
		}
	}

	log.Println("✅ Graceful shutdown completed")
	os.Exit(0)
}
