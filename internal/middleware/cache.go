package middleware

import (
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// CacheHeaders adds optimized cache headers for static assets
// Following web performance best practices
func CacheHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// Get file extension
		ext := strings.ToLower(filepath.Ext(path))

		// Set cache headers based on asset type
		switch ext {
		case ".js", ".css":
			// JavaScript and CSS - long cache with hash-based versioning
			if strings.Contains(path, "-") && len(strings.Split(filepath.Base(path), "-")) > 1 {
				// Hashed files (e.g., main-abc123.js) - cache for 1 year
				c.Header("Cache-Control", "public, max-age=31536000, immutable")
			} else {
				// Non-hashed files - cache for 1 day
				c.Header("Cache-Control", "public, max-age=86400")
			}

		case ".woff", ".woff2", ".ttf", ".eot":
			// Fonts - cache for 1 year (rarely change)
			c.Header("Cache-Control", "public, max-age=31536000, immutable")

		case ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".avif":
			// Images - cache for 1 month
			c.Header("Cache-Control", "public, max-age=2592000")

		case ".wasm":
			// WASM files - cache for 1 week (can change during development)
			c.Header("Cache-Control", "public, max-age=604800")

		case ".json":
			// JSON files (manifests, etc.) - cache for 1 hour
			c.Header("Cache-Control", "public, max-age=3600")

		case ".html", ".htm":
			// HTML files - no cache for main pages, short cache for others
			if path == "/" || path == "/index.html" {
				c.Header("Cache-Control", "public, max-age=300") // 5 minutes
			} else {
				c.Header("Cache-Control", "public, max-age=3600") // 1 hour
			}

		default:
			// Default for other files - cache for 1 hour
			c.Header("Cache-Control", "public, max-age=3600")
		}

		// Add ETag support for efficient caching
		c.Header("ETag", `W/"`+generateETag(path)+`"`)

		// Add Vary header for better CDN behavior
		c.Header("Vary", "Accept-Encoding")

		// Continue to next middleware
		c.Next()
	}
}

// generateETag creates a simple ETag based on path and current time
func generateETag(path string) string {
	// Simple hash based on path - in production, use file modification time
	hash := 0
	for _, char := range path {
		hash = hash*31 + int(char)
	}

	// Use current hour for cache busting (simple approach)
	hourly := time.Now().Hour()

	// Simple ETag generation
	pathParts := strings.Split(path, "/")
	filename := pathParts[len(pathParts)-1]
	cleanName := strings.ReplaceAll(filename, ".", "-")

	return cleanName + "-" + string(rune(hourly+'0'))
}
