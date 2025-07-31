// Package middleware provides enterprise-grade middleware for Gin
// Following Go 1.24+ best practices and production patterns
package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger creates a custom logging middleware with enterprise features
// Supports different log levels and structured logging patterns
func Logger(logLevel string) gin.HandlerFunc {
	// Configure log output format based on environment
	// gin.DefaultWriter is already configured by default
	
	return gin.HandlerFunc(func(c *gin.Context) {
		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Calculate request processing time
		latency := time.Since(start)
		
		// Get response details
		statusCode := c.Writer.Status()
		method := c.Request.Method
		clientIP := c.ClientIP()
		
		// Construct full path with query string
		if raw != "" {
			path = path + "?" + raw
		}

		// Log based on status code and log level
		switch logLevel {
		case "debug":
			log.Printf("[GIN] %3d | %13v | %15s | %-7s %s",
				statusCode,
				latency,
				clientIP,
				method,
				path,
			)
		case "info":
			// Only log non-2xx responses in info level
			if statusCode >= 400 {
				log.Printf("[GIN] %3d | %13v | %15s | %-7s %s",
					statusCode,
					latency,
					clientIP,
					method,
					path,
				)
			}
		case "warn":
			// Only log 4xx and 5xx responses
			if statusCode >= 400 {
				log.Printf("[GIN-WARN] %3d | %13v | %15s | %-7s %s",
					statusCode,
					latency,
					clientIP,
					method,
					path,
				)
			}
		case "error":
			// Only log 5xx responses
			if statusCode >= 500 {
				log.Printf("[GIN-ERROR] %3d | %13v | %15s | %-7s %s",
					statusCode,
					latency,
					clientIP,
					method,
					path,
				)
			}
		}

		// Log slow requests (>1 second) regardless of log level
		if latency > time.Second {
			log.Printf("[GIN-SLOW] %3d | %13v | %15s | %-7s %s (SLOW REQUEST)",
				statusCode,
				latency,
				clientIP,
				method,
				path,
			)
		}
	})
}