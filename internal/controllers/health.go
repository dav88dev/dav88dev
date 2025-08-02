// Package controllers contains all HTTP request handlers
// Following enterprise patterns with proper error handling and response structures
package controllers

import (
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/dav88dev/myWebsite-go/config"
	"github.com/dav88dev/myWebsite-go/internal/middleware"
	"github.com/gin-gonic/gin"
)

// HealthController handles health check endpoints
type HealthController struct {
	config    *config.Config
	startTime time.Time
}

// NewHealthController creates a new health controller instance
func NewHealthController(cfg *config.Config) *HealthController {
	return &HealthController{
		config:    cfg,
		startTime: time.Now(),
	}
}

// HealthResponse represents the structure of health check responses
type HealthResponse struct {
	Status      string                 `json:"status"`
	Timestamp   time.Time              `json:"timestamp"`
	Environment string                 `json:"environment"`
	Uptime      string                 `json:"uptime"`
	Version     string                 `json:"version,omitempty"`
	Details     map[string]interface{} `json:"details,omitempty"`
}

// GetHealth returns basic health status
// GET /health
func (h *HealthController) GetHealth(c *gin.Context) {
	uptime := time.Since(h.startTime)

	response := HealthResponse{
		Status:      "healthy",
		Timestamp:   time.Now(),
		Environment: h.config.Environment,
		Uptime:      uptime.String(),
		Version:     "1.0.0", // TODO: Get from build info
	}

	c.JSON(http.StatusOK, response)
}

// GetDetailedHealth returns detailed health information including system metrics
// GET /health/detailed
func (h *HealthController) GetDetailedHealth(c *gin.Context) {
	uptime := time.Since(h.startTime)

	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	// Get application metrics
	appMetrics := middleware.GetMetrics()

	response := HealthResponse{
		Status:      "healthy",
		Timestamp:   time.Now(),
		Environment: h.config.Environment,
		Uptime:      uptime.String(),
		Version:     "1.0.0",
		Details: map[string]interface{}{
			"system": map[string]interface{}{
				"go_version":   runtime.Version(),
				"goroutines":   runtime.NumGoroutine(),
				"memory_alloc": formatBytes(memStats.Alloc),
				"memory_total": formatBytes(memStats.TotalAlloc),
				"memory_sys":   formatBytes(memStats.Sys),
				"gc_runs":      memStats.NumGC,
				"cpu_count":    runtime.NumCPU(),
			},
			"application": appMetrics,
			"database": map[string]interface{}{
				"status":   "connected", // TODO: Actual DB health check
				"database": h.config.MongoDatabase,
				"timeout":  h.config.MongoTimeout,
			},
			"configuration": map[string]interface{}{
				"port":          h.config.Port,
				"log_level":     h.config.LogLevel,
				"rate_limiting": h.config.EnableRateLimit,
				"cors_enabled":  h.config.CORSOrigins != "",
			},
		},
	}

	c.JSON(http.StatusOK, response)
}

// formatBytes converts bytes to human readable format
func formatBytes(bytes uint64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := uint64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %sB", float64(bytes)/float64(div), "KMGTPE"[exp:exp+1])
}
