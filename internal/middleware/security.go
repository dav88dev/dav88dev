package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeaders adds enterprise security headers to all responses
// Following OWASP security best practices for web applications
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// X-Content-Type-Options: Prevents MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")
		
		// X-Frame-Options: Prevents clickjacking attacks
		c.Header("X-Frame-Options", "DENY")
		
		// X-XSS-Protection: Enables XSS filtering (legacy browsers)
		c.Header("X-XSS-Protection", "1; mode=block")
		
		// Referrer-Policy: Controls referrer information
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Content-Security-Policy: Prevents various attacks
		csp := "default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
			"font-src 'self' https://fonts.gstatic.com; " +
			"img-src 'self' data: https:; " +
			"connect-src 'self' https://api.openai.com; " +
			"frame-ancestors 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self'"
		c.Header("Content-Security-Policy", csp)
		
		// Strict-Transport-Security: Enforces HTTPS
		// Only add if served over HTTPS
		if c.Request.TLS != nil {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}
		
		// Permissions-Policy: Controls browser features
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		
		c.Next()
	}
}