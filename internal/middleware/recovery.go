package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"
	"strings"
	"time"

	"github.com/dav88dev/myWebsite-go/internal/models"
	"github.com/gin-gonic/gin"
)

// Recovery returns a middleware that recovers from panics and displays 500 error page
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error and stack trace
				fmt.Printf("Panic recovered: %v\n", err)
				fmt.Printf("Stack trace:\n%s\n", debug.Stack())

				// Check if connection is still open
				if c.IsAborted() {
					return
				}

				// Check if it's an API request
				if strings.HasPrefix(c.Request.URL.Path, "/api") {
					c.JSON(http.StatusInternalServerError, gin.H{
						"error":   "Internal Server Error",
						"message": "An unexpected error occurred",
						"code":    http.StatusInternalServerError,
					})
					c.Abort()
					return
				}

				// Load CV data for the template
				cvData, _ := models.LoadCVData()

				// Get request ID from header if available
				requestID := c.GetHeader("X-Request-ID")
				if requestID == "" {
					requestID = fmt.Sprintf("%d", time.Now().Unix())
				}

				// Render 500 error page
				c.HTML(http.StatusInternalServerError, "500.html", gin.H{
					"CVData":    cvData,
					"Error":     true,
					"RequestID": requestID,
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
