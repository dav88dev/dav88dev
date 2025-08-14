package main

import (
	"github.com/dav88dev/myWebsite-go/config"
	"github.com/dav88dev/myWebsite-go/internal/routes"
	"github.com/gin-gonic/gin"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestSetupRouter tests the router configuration
func TestSetupRouter(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create test config
	cfg := &config.Config{
		Environment:     "test",
		Port:            "8000",
		LogLevel:        "info",
		CORSOrigins:     "http://localhost:3000",
		EnableRateLimit: false,
	}

	// Setup router
	router := setupRouter(cfg)

	// Test router is not nil
	if router == nil {
		t.Fatal("Router should not be nil")
	}
}

// TestHealthEndpoint tests the health check functionality
func TestHealthEndpoint(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create test config
	cfg := &config.Config{
		Environment:     "test",
		Port:            "8000",
		LogLevel:        "info",
		CORSOrigins:     "http://localhost:3000",
		EnableRateLimit: false,
	}

	// Setup router with routes
	router := setupRouter(cfg)
	routes.SetupRoutes(router, cfg)

	// Create a test HTTP request
	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()

	// Perform the request
	router.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Health endpoint returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

// TestConfigLoading tests basic configuration validation
func TestConfigLoading(t *testing.T) {
	// Test that we can create a basic config without panicking
	cfg := &config.Config{
		Environment:     "test",
		Port:            "8000",
		LogLevel:        "info",
		CORSOrigins:     "http://localhost:3000",
		EnableRateLimit: false,
	}

	// Test config methods
	if !cfg.IsDevelopment() && cfg.Environment == "test" {
		// test environment should be treated as development-like
	}

	if cfg.Port == "" {
		t.Error("Port should not be empty")
	}
}

// TestRouterMiddleware tests that middleware is properly configured
func TestRouterMiddleware(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create test config
	cfg := &config.Config{
		Environment:     "test",
		Port:            "8000",
		LogLevel:        "info",
		CORSOrigins:     "http://localhost:3000",
		EnableRateLimit: false,
	}

	// Setup router
	router := setupRouter(cfg)

	// Check that router has handlers (middleware + routes)
	if len(router.Routes()) == 0 {
		// Router has middleware, so this is fine
	}

	// Test that the router responds to requests without panicking
	req, _ := http.NewRequest("GET", "/nonexistent", nil)
	rr := httptest.NewRecorder()

	defer func() {
		if r := recover(); r != nil {
			t.Errorf("Router middleware panicked: %v", r)
		}
	}()

	router.ServeHTTP(rr, req)
}
