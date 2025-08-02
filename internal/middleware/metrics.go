package middleware

import (
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
)

// requestMetrics stores basic metrics for monitoring
type requestMetrics struct {
	totalRequests    atomic.Int64
	totalErrors      atomic.Int64
	totalLatency     atomic.Int64 // Store as nanoseconds
	slowRequests     atomic.Int64
	statusCodeCounts sync.Map // Thread-safe map
}

var metrics = &requestMetrics{}

// Metrics creates a middleware for collecting basic application metrics
// In production, consider using Prometheus or similar monitoring systems
func Metrics() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		// Calculate metrics
		latency := time.Since(start)
		statusCode := c.Writer.Status()

		// Update metrics using atomic operations
		requestNum := metrics.totalRequests.Add(1)
		metrics.totalLatency.Add(latency.Nanoseconds())

		// Track error rates
		if statusCode >= 400 {
			metrics.totalErrors.Add(1)
		}

		// Track slow requests (>1 second)
		if latency > time.Second {
			metrics.slowRequests.Add(1)
		}

		// Track status code distribution (thread-safe)
		countInterface, _ := metrics.statusCodeCounts.LoadOrStore(statusCode, new(atomic.Int64))
		count := countInterface.(*atomic.Int64)
		count.Add(1)

		// Add response headers for debugging
		c.Header("X-Response-Time", latency.String())
		c.Header("X-Request-ID", strconv.FormatInt(requestNum, 10))
	}
}

// GetMetrics returns current application metrics
// Useful for health check endpoints
func GetMetrics() map[string]interface{} {
	totalRequests := metrics.totalRequests.Load()
	totalErrors := metrics.totalErrors.Load()
	totalLatency := metrics.totalLatency.Load()
	slowRequests := metrics.slowRequests.Load()

	avgLatency := time.Duration(0)
	if totalRequests > 0 {
		avgLatency = time.Duration(totalLatency / totalRequests)
	}

	errorRate := float64(0)
	if totalRequests > 0 {
		errorRate = float64(totalErrors) / float64(totalRequests) * 100
	}

	// Collect status code counts
	statusCodes := make(map[int]int64)
	metrics.statusCodeCounts.Range(func(key, value interface{}) bool {
		statusCode := key.(int)
		count := value.(*atomic.Int64)
		statusCodes[statusCode] = count.Load()
		return true
	})

	return map[string]interface{}{
		"total_requests":     totalRequests,
		"total_errors":       totalErrors,
		"error_rate_percent": errorRate,
		"average_latency":    avgLatency.String(),
		"slow_requests":      slowRequests,
		"status_codes":       statusCodes,
	}
}
