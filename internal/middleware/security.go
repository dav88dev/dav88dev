package middleware

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
)

// SecurityHeaders adds enterprise security headers to all responses
// Following OWASP security best practices for web applications
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate a random nonce for this request
		nonce := generateNonce()
		c.Set("CSPNonce", nonce)

		// X-Content-Type-Options: Prevents MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		// X-Frame-Options: Prevents clickjacking attacks
		c.Header("X-Frame-Options", "DENY")

		// X-XSS-Protection: Enables XSS filtering (legacy browsers)
		c.Header("X-XSS-Protection", "1; mode=block")

		// Referrer-Policy: Controls referrer information
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Content-Security-Policy: Prevents various attacks
		// Using nonce-based CSP for inline scripts and styles
		cspBase := fmt.Sprintf(
			"default-src 'self'; "+
				"script-src 'self' 'nonce-%s' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://d2wy8f7a9ursnm.cloudfront.net; "+
				"style-src 'self' 'nonce-%s' 'unsafe-inline' https://fonts.googleapis.com; "+
				"font-src 'self' https://fonts.gstatic.com data:; "+
				"img-src 'self' data: https:; "+
				"connect-src 'self' https://api.openai.com https://notify.bugsnag.com https://sessions.bugsnag.com https://otlp.bugsnag.com; "+
				"frame-ancestors 'none'; "+
				"base-uri 'self'; "+
				"form-action 'self';",
			nonce, nonce)

		// Only add upgrade-insecure-requests in production
		if os.Getenv("SERVER_ENV") == "production" {
			cspBase += " upgrade-insecure-requests"
		}

		c.Header("Content-Security-Policy", cspBase)

		// Strict-Transport-Security: Enforces HTTPS
		// Only add if served over HTTPS
		if c.Request.TLS != nil {
			c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		}

		// Permissions-Policy: Controls browser features
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")

		// Additional security headers
		c.Header("X-Permitted-Cross-Domain-Policies", "none")

		// Only add strict CORP/COEP/COOP in production
		if os.Getenv("SERVER_ENV") == "production" {
			c.Header("Cross-Origin-Embedder-Policy", "require-corp")
			c.Header("Cross-Origin-Opener-Policy", "same-origin")
			c.Header("Cross-Origin-Resource-Policy", "same-origin")
		}

		c.Next()
	}
}

// generateNonce creates a cryptographically secure random nonce for CSP
func generateNonce() string {
	nonce := make([]byte, 16)
	if _, err := rand.Read(nonce); err != nil {
		// Fallback to a less secure but functional nonce
		return "fallback-nonce"
	}
	return base64.StdEncoding.EncodeToString(nonce)
}
