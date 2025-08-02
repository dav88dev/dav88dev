package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// rateLimiter implements a simple in-memory rate limiter
// For production use, consider Redis-based rate limiting
type rateLimiter struct {
	mu      sync.RWMutex
	clients map[string]*clientInfo
	rate    int
	window  time.Duration
}

type clientInfo struct {
	count     int
	resetTime time.Time
}

var (
	limiter     *rateLimiter
	limiterOnce sync.Once
)

// RateLimit creates a rate limiting middleware
// rps: requests per second allowed per IP
func RateLimit(rps int) gin.HandlerFunc {
	// Initialize rate limiter (singleton pattern)
	limiterOnce.Do(func() {
		limiter = &rateLimiter{
			clients: make(map[string]*clientInfo),
			rate:    rps,
			window:  time.Second,
		}

		// Start cleanup goroutine for expired entries (only once)
		go limiter.cleanup()
	})

	// Update rate if different
	limiter.mu.Lock()
	if limiter.rate != rps {
		limiter.rate = rps
	}
	limiter.mu.Unlock()

	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		if !limiter.allow(clientIP) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"message": "Too many requests, please try again later",
				"code":    http.StatusTooManyRequests,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// allow checks if the client is allowed to make a request
func (rl *rateLimiter) allow(clientIP string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	client, exists := rl.clients[clientIP]

	if !exists {
		// New client
		rl.clients[clientIP] = &clientInfo{
			count:     1,
			resetTime: now.Add(rl.window),
		}
		return true
	}

	// Check if window has reset
	if now.After(client.resetTime) {
		client.count = 1
		client.resetTime = now.Add(rl.window)
		return true
	}

	// Check if under rate limit
	if client.count < rl.rate {
		client.count++
		return true
	}

	return false
}

// cleanup removes expired client entries to prevent memory leaks
func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()

		for ip, client := range rl.clients {
			if now.After(client.resetTime.Add(time.Minute)) {
				delete(rl.clients, ip)
			}
		}

		rl.mu.Unlock()
	}
}
