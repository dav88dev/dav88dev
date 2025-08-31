// Package routes defines all application routes and handlers
// Following enterprise patterns with clean separation of concerns
package routes

import (
	"net/http"
	"strings"

	"github.com/dav88dev/myWebsite-go/config"
	"github.com/dav88dev/myWebsite-go/internal/controllers"
	"github.com/dav88dev/myWebsite-go/internal/models"
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all application routes
// Following RESTful API design patterns and enterprise routing structure
func SetupRoutes(router *gin.Engine, cfg *config.Config) {
	// Load HTML templates including partials
	// First load all templates including partials
	router.LoadHTMLFiles(
		"templates/index.html",
		"templates/404.html",
		"templates/500.html",
		"templates/partials/navigation.html",
		"templates/partials/footer.html",
		"templates/partials/threejs-setup.html",
	)

	// Initialize controllers
	healthController := controllers.NewHealthController(cfg)
	cvController := controllers.NewCVController()

	// Health check endpoints (no auth required)
	router.GET("/health", healthController.GetHealth)
	router.GET("/health/detailed", healthController.GetDetailedHealth)

	// API routes group
	api := router.Group("/api")
	{
		// Version 1 API
		v1 := api.Group("/v1")
		{
			// CV endpoints
			v1.GET("/cv", cvController.GetCV)
			v1.GET("/cv/:section", cvController.GetCVSection)
		}

		// Legacy API compatibility (no version)
		api.GET("/cv", cvController.GetCV)
		api.GET("/cv/:section", cvController.GetCVSection)
	}

	// Static routes for templates and assets
	setupStaticRoutes(router, cfg)

	// Development-specific routes
	if cfg.IsDevelopment() {
		setupDevRoutes(router, cfg)
	}
}

// setupStaticRoutes configures static file serving and template routes
func setupStaticRoutes(router *gin.Engine, cfg *config.Config) {
	// Serve index template at root with real CV data
	router.GET("/", func(c *gin.Context) {
		// Load CV data
		cvData, err := models.LoadCVData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to load CV data: " + err.Error(),
			})
			return
		}

		// Load frontend assets
		assets, err := models.LoadAssets()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to load assets: " + err.Error(),
			})
			return
		}

		// Get CSP nonce from context
		cspNonce, exists := c.Get("CSPNonce")
		if !exists {
			cspNonce = ""
		}

		// Render template with complete data
		templateData := models.TemplateData{
			CVData:   *cvData,
			Assets:   *assets,
			CSPNonce: cspNonce.(string),
		}

		c.HTML(http.StatusOK, "index.html", templateData)
	})

	// Serve favicon
	router.GET("/favicon.ico", func(c *gin.Context) {
		c.File("./static/favicon.ico")
	})

	// Handle 404 errors
	router.NoRoute(func(c *gin.Context) {
		// Check if it's an API request
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": "API endpoint not found",
				"path":    c.Request.URL.Path,
			})
			return
		}

		// Check if it's a static file request
		if strings.HasPrefix(c.Request.URL.Path, "/static") {
			c.Status(http.StatusNotFound)
			return
		}

		// Load CV data for the template
		cvData, _ := models.LoadCVData()
		
		// Load frontend assets
		assets, _ := models.LoadAssets()
		
		// Get CSP nonce from context
		cspNonce, exists := c.Get("CSPNonce")
		if !exists {
			cspNonce = ""
		}

		// For non-API requests, serve the 404 page with complete data
		templateData := models.TemplateData{
			CVData:   *cvData,
			Assets:   *assets,
			CSPNonce: cspNonce.(string),
		}
		
		c.HTML(http.StatusNotFound, "404.html", templateData)
	})
}

// setupDevRoutes adds development-specific routes for debugging
func setupDevRoutes(router *gin.Engine, cfg *config.Config) {
	dev := router.Group("/dev")
	{
		// Configuration endpoint for debugging
		dev.GET("/config", func(c *gin.Context) {
			// Return safe config info (no secrets)
			c.JSON(http.StatusOK, gin.H{
				"server": gin.H{
					"port":        cfg.Port,
					"environment": cfg.Environment,
					"log_level":   cfg.LogLevel,
				},
				"database": gin.H{
					"database": cfg.MongoDatabase,
					"timeout":  cfg.MongoTimeout,
				},
				"security": gin.H{
					"cors_origins":      cfg.CORSOrigins,
					"rate_limit_rps":    cfg.RateLimitRPS,
					"enable_rate_limit": cfg.EnableRateLimit,
				},
			})
		})

		// Request info endpoint for debugging
		dev.GET("/request-info", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"method":       c.Request.Method,
				"url":          c.Request.URL.String(),
				"headers":      c.Request.Header,
				"client_ip":    c.ClientIP(),
				"user_agent":   c.GetHeader("User-Agent"),
				"query_params": c.Request.URL.Query(),
			})
		})

		// Test endpoint for Bugsnag error reporting
		dev.GET("/test-error", func(c *gin.Context) {
			// This will trigger a panic that Bugsnag should catch
			panic("Test error for Bugsnag integration!")
		})
	}
}
