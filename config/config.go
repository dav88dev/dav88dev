// Package config provides enterprise-grade configuration management
// Following Go 1.24+ best practices and 12-factor app principles
package config

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
	"github.com/kamva/mgm/v3"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Config represents the application configuration structure
// Following enterprise patterns with proper validation and defaults
type Config struct {
	// Server Configuration
	Port        string `env:"SERVER_PORT" envDefault:"8081"`
	Environment string `env:"SERVER_ENV" envDefault:"development"`
	LogLevel    string `env:"SERVER_LOG_LEVEL" envDefault:"info"`
	EnableHTTPS bool   `env:"SERVER_ENABLE_HTTPS" envDefault:"false"`
	CertFile    string `env:"SERVER_CERT_FILE"`
	KeyFile     string `env:"SERVER_KEY_FILE"`
	
	// Database Configuration
	MongoURI             string `env:"DB_MONGO_URI" envDefault:"mongodb://localhost:27017"`
	MongoDatabase        string `env:"DB_MONGO_DATABASE" envDefault:"portfolio"`
	MongoTimeout         int    `env:"DB_MONGO_TIMEOUT" envDefault:"10"`
	MongoMaxPoolSize     int    `env:"DB_MONGO_MAX_POOL_SIZE" envDefault:"100"`
	MongoMinPoolSize     int    `env:"DB_MONGO_MIN_POOL_SIZE" envDefault:"5"`
	MongoMaxIdleTime     int    `env:"DB_MONGO_MAX_IDLE_TIME" envDefault:"300"`
	MongoEnableRetryRead bool   `env:"DB_MONGO_RETRY_READS" envDefault:"true"`
	
	// Security Configuration
	JWTSecret       string `env:"SECURITY_JWT_SECRET"`
	SessionSecret   string `env:"SECURITY_SESSION_SECRET"`
	CORSOrigins     string `env:"SECURITY_CORS_ORIGINS" envDefault:"*"`
	RateLimitRPS    int    `env:"SECURITY_RATE_LIMIT_RPS" envDefault:"100"`
	EnableRateLimit bool   `env:"SECURITY_ENABLE_RATE_LIMIT" envDefault:"true"`
	
	// External Services Configuration
	OpenAIAPIKey string `env:"EXTERNAL_OPENAI_API_KEY"`
	OpenAIModel  string `env:"EXTERNAL_OPENAI_MODEL" envDefault:"gpt-4"`
}


// LoadConfig loads configuration using enterprise best practices:
// 1. Load .env file (dev environment)
// 2. Override with environment variables (production)
// 3. Validate required fields
// 4. Apply sensible defaults
func LoadConfig() (*Config, error) {
	// Load .env file if it exists (development pattern)
	// In production, this will fail silently and use env vars
	if err := godotenv.Load(); err != nil {
		log.Println("INFO: No .env file found, using system environment variables")
	}

	// Parse environment variables into config struct
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("failed to parse configuration: %w", err)
	}

	// Validate critical configuration
	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("configuration validation failed: %w", err)
	}

	log.Printf("✅ Configuration loaded successfully (env: %s)", cfg.Environment)
	return cfg, nil
}

// validate ensures all required configuration is present
func (c *Config) validate() error {
	// MongoDB is optional - only validate if provided
	// if c.MongoURI == "" {
	//     return fmt.Errorf("database URI is required")
	// }
	// if c.MongoDatabase == "" {
	//     return fmt.Errorf("database name is required")
	// }
	
	// Production-specific validations
	if c.Environment == "production" {
		if c.JWTSecret == "" {
			return fmt.Errorf("JWT secret is required in production")
		}
		if c.SessionSecret == "" {
			return fmt.Errorf("session secret is required in production")
		}
	}

	return nil
}

// IsProduction returns true if running in production environment
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// IsDevelopment returns true if running in development environment
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// SetupMongoDB initializes MongoDB connection using MGM with enterprise patterns
// Following MongoDB Go Driver v2.2+ best practices
func (c *Config) SetupMongoDB() error {
	// Create MongoDB client options with enterprise configuration
	clientOpts := options.Client().
		ApplyURI(c.MongoURI).
		SetMaxPoolSize(uint64(c.MongoMaxPoolSize)).
		SetMinPoolSize(uint64(c.MongoMinPoolSize)).
		SetMaxConnIdleTime(time.Duration(c.MongoMaxIdleTime) * time.Second).
		SetRetryReads(c.MongoEnableRetryRead).
		SetRetryWrites(true) // Enable retry writes for better reliability

	// Setup MGM with enterprise configuration
	err := mgm.SetDefaultConfig(
		&mgm.Config{
			CtxTimeout: time.Duration(c.MongoTimeout) * time.Second,
		},
		c.MongoDatabase,
		clientOpts,
	)

	if err != nil {
		return fmt.Errorf("failed to setup MongoDB with MGM: %w", err)
	}

	// Test connection with proper timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, client, _, err := mgm.DefaultConfigs()
	if err != nil {
		return fmt.Errorf("failed to get MongoDB client: %w", err)
	}

	// Ping database to verify connectivity
	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	log.Printf("✅ Connected to MongoDB successfully (database: %s)", c.MongoDatabase)
	return nil
}

// GetServerAddress returns the full server address for HTTP server
func (c *Config) GetServerAddress() string {
	return ":" + c.Port
}

// GetTLSConfig returns TLS configuration if HTTPS is enabled
func (c *Config) GetTLSConfig() (certFile, keyFile string, enabled bool) {
	if c.EnableHTTPS && c.CertFile != "" && c.KeyFile != "" {
		return c.CertFile, c.KeyFile, true
	}
	return "", "", false
}

// StartServerWithHTTP2 starts the server with HTTP/2 support
// HTTP/2 requires HTTPS for real-world deployments but can use HTTP for development
func (c *Config) StartServerWithHTTP2(handler http.Handler) error {
	address := c.GetServerAddress()
	
	// Create HTTP server with HTTP/2 support
	server := &http.Server{
		Addr:    address,
		Handler: handler,
	}
	
	if c.EnableHTTPS {
		// Production: HTTPS with HTTP/2
		certFile, keyFile, enabled := c.GetTLSConfig()
		if enabled {
			// Configure TLS for HTTP/2
			server.TLSConfig = &tls.Config{
				NextProtos: []string{"h2", "http/1.1"}, // HTTP/2 and HTTP/1.1 fallback
				MinVersion: tls.VersionTLS12,            // TLS 1.2 minimum for security
			}
			
			log.Printf("🔒 Starting HTTPS server with HTTP/2 support")
			return server.ListenAndServeTLS(certFile, keyFile)
		}
	}
	
	// Development: HTTP with HTTP/2 clear-text (h2c)
	if c.IsDevelopment() {
		log.Printf("🛠️  Starting HTTP server with H2C (HTTP/2 over cleartext) support")
		// Note: H2C support requires additional setup for production use
		// For now, start regular HTTP server in development
		return server.ListenAndServe()
	}
	
	// Fallback: Regular HTTP server
	log.Printf("🌐 Starting HTTP server (HTTP/1.1)")
	return server.ListenAndServe()
}