package middleware

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	
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
		// Using nonce-based CSP for inline scripts instead of unsafe-inline
		csp := fmt.Sprintf(
			"default-src 'self'; "+
				"script-src 'self' 'nonce-%s' https://cdn.jsdelivr.net; "+
				"style-src 'self' 'nonce-%s' https://fonts.googleapis.com; "+
				"font-src 'self' https://fonts.gstatic.com data:; "+
				"img-src 'self' data: https:; "+
				"connect-src 'self' https://api.openai.com; "+
				"frame-ancestors 'none'; "+
				"base-uri 'self'; "+
				"form-action 'self'; "+
				"upgrade-insecure-requests",
			nonce, nonce)
		c.Header("Content-Security-Policy", csp)
		
		// Strict-Transport-Security: Enforces HTTPS
		// Only add if served over HTTPS
		if c.Request.TLS != nil {
			c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		}
		
		// Permissions-Policy: Controls browser features
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
		
		// Additional security headers
		c.Header("X-Permitted-Cross-Domain-Policies", "none")
		c.Header("Cross-Origin-Embedder-Policy", "require-corp")
		c.Header("Cross-Origin-Opener-Policy", "same-origin")
		c.Header("Cross-Origin-Resource-Policy", "same-origin")
		
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