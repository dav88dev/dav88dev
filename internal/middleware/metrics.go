package middleware

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// requestMetrics stores basic metrics for monitoring
type requestMetrics struct {
	totalRequests    int64
	totalErrors      int64
	totalLatency     time.Duration
	slowRequests     int64
	statusCodeCounts map[int]int64
}

var metrics = &requestMetrics{
	statusCodeCounts: make(map[int]int64),
}

// Metrics creates a middleware for collecting basic application metrics
// In production, consider using Prometheus or similar monitoring systems
func Metrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		c.Next()
		
		// Calculate metrics
		latency := time.Since(start)
		statusCode := c.Writer.Status()
		
		// Update metrics (in production, use atomic operations)
		metrics.totalRequests++
		metrics.totalLatency += latency
		
		// Track error rates
		if statusCode >= 400 {
			metrics.totalErrors++
		}
		
		// Track slow requests (>1 second)
		if latency > time.Second {
			metrics.slowRequests++
		}
		
		// Track status code distribution
		metrics.statusCodeCounts[statusCode]++
		
		// Add response headers for debugging
		c.Header("X-Response-Time", latency.String())
		c.Header("X-Request-ID", strconv.FormatInt(metrics.totalRequests, 10))
	}
}

// GetMetrics returns current application metrics
// Useful for health check endpoints
func GetMetrics() map[string]interface{} {
	avgLatency := time.Duration(0)
	if metrics.totalRequests > 0 {
		avgLatency = time.Duration(int64(metrics.totalLatency) / metrics.totalRequests)
	}
	
	errorRate := float64(0)
	if metrics.totalRequests > 0 {
		errorRate = float64(metrics.totalErrors) / float64(metrics.totalRequests) * 100
	}
	
	return map[string]interface{}{
		"total_requests":     metrics.totalRequests,
		"total_errors":       metrics.totalErrors,
		"error_rate_percent": errorRate,
		"average_latency":    avgLatency.String(),
		"slow_requests":      metrics.slowRequests,
		"status_codes":       metrics.statusCodeCounts,
	}
}