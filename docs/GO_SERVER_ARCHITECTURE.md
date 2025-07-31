# Go Server Architecture Documentation

## 📊 **Complete Migration Status**

**✅ PHASE 1 COMPLETED: Server Foundation**
- Enterprise Go server with HTTP/2 support  
- MongoDB Atlas integration
- Configuration management with .env
- Security middleware stack
- Health monitoring and metrics

**🚧 PHASE 2 IN PROGRESS: Frontend Integration**
- Frontend build system (Vite) ✅
- Template conversion (Tera → Go) ✅  
- CV data loading system ✅
- Complete website serving 🔄

---

## 🏗️ **Application Architecture**

### **Directory Structure**
```
myWebsite/
├── main.go                           # HTTP/2 server entry point
├── go.mod, go.sum                    # Go dependencies
├── .env, .env.production             # Environment configuration
├── config/
│   └── config.go                     # Enterprise configuration management
├── internal/
│   ├── controllers/                  # HTTP request handlers
│   │   ├── health.go                 # Health checks & system metrics
│   │   └── cv.go                     # CV API endpoints
│   ├── middleware/                   # HTTP middleware stack
│   │   ├── logger.go                 # Request logging
│   │   ├── ratelimit.go              # Rate limiting
│   │   ├── security.go               # Security headers
│   │   └── metrics.go                # Application metrics
│   ├── models/                       # Data structures
│   │   └── cv.go                     # CV data models & loading
│   └── routes/
│       └── api.go                    # Route definitions
├── templates/
│   ├── index.html                    # Go template (converted from Tera)
│   └── index.html.tera               # Original Tera template
├── frontend/                         # Vite frontend build system
│   ├── package.json                  # Node.js dependencies
│   ├── vite.config.js                # Vite configuration
│   └── src/                          # Frontend source files
└── static/                           # Built assets & static files
    ├── css/, js/                     # Vite build output
    ├── images/, fonts/               # Static assets
    └── .vite/manifest.json           # Asset manifest
```

---

## 🔧 **Core Components**

### **1. Main Server (main.go)**
```go
// HTTP/2 server with enterprise middleware stack
func main() {
    cfg := config.LoadConfig()           // Load .env configuration
    cfg.SetupMongoDB()                   // Connect to MongoDB Atlas
    router := setupRouter(cfg)           // Setup Gin with middleware
    cfg.StartServerWithHTTP2(router)     // Start HTTP/2 server
}
```

**Features:**
- HTTP/2 with H2C support for development
- HTTPS with TLS 1.2+ for production
- Graceful shutdown handling
- Environment-based configuration

### **2. Configuration System (config/config.go)**
```go
type Config struct {
    // Server
    Port        string `env:"SERVER_PORT" envDefault:"8080"`
    Environment string `env:"SERVER_ENV" envDefault:"development"`
    LogLevel    string `env:"SERVER_LOG_LEVEL" envDefault:"info"`
    
    // MongoDB Atlas
    MongoURI      string `env:"DB_MONGO_URI"`
    MongoDatabase string `env:"DB_MONGO_DATABASE"`
    
    // Security
    JWTSecret       string `env:"SECURITY_JWT_SECRET"`
    CORSOrigins     string `env:"SECURITY_CORS_ORIGINS"`
    RateLimitRPS    int    `env:"SECURITY_RATE_LIMIT_RPS"`
    
    // External Services
    OpenAIAPIKey string `env:"EXTERNAL_OPENAI_API_KEY"`
}
```

**Features:**
- Enterprise .env management
- Production/development configurations
- MongoDB Atlas integration
- Validation and defaults

### **3. Middleware Stack**
```go
// Applied in order for optimal performance
router.Use(gin.Recovery())                    // Panic recovery
router.Use(middleware.Logger(cfg.LogLevel))   // Request logging
router.Use(cors.New(corsConfig))              // CORS handling
router.Use(gzip.Gzip(gzip.BestCompression))  // Compression
router.Use(middleware.RateLimit(cfg.RPS))     // Rate limiting
router.Use(middleware.SecurityHeaders())      // Security headers
router.Use(middleware.Metrics())              // Performance metrics
```

**Security Features:**
- CORS protection
- Security headers (CSP, HSTS, XSS protection)
- Rate limiting (configurable per environment)
- Request logging and metrics

### **4. API Endpoints**

#### **Health Monitoring**
- `GET /health` - Basic health status
- `GET /health/detailed` - System metrics, memory usage, database status

#### **CV Data API**
- `GET /api/cv` - Complete CV data
- `GET /api/cv/:section` - Specific CV sections (personal, experience, skills, etc.)
- `GET /api/v1/cv` - Versioned API endpoint

#### **Development Tools**
- `GET /dev/config` - Configuration debugging
- `GET /dev/request-info` - Request analysis

---

## 📋 **Data Models**

### **CV Data Structure**
```go
type CVData struct {
    PersonalInfo PersonalInfo `json:"personal_info"`
    Experience   []Experience `json:"experience"`
    Education    []Education  `json:"education"`
    Skills       []Skill      `json:"skills"`
    Projects     []Project    `json:"projects"`
}

type PersonalInfo struct {
    Name     string `json:"name"`
    Title    string `json:"title"`
    Email    string `json:"email"`
    Location string `json:"location"`
    Summary  string `json:"summary"`
    AboutMe  string `json:"about_me"`
}
```

### **Asset Management**
```go
type Assets struct {
    CSSMain      string `json:"css_main"`       // /static/css/style-xyz.css
    JSMain       string `json:"js_main"`        // /static/js/main-xyz.js
    JSThreeScene string `json:"js_three_scene"` // /static/js/threeScene-xyz.js
}
```

---

## 🎨 **Frontend Integration**

### **Build System (Vite)**
```bash
# Development
cd frontend && npm run dev

# Production build
cd frontend && npm run build
# Outputs to: ../static/css/ and ../static/js/
```

### **Template System**
- **Original**: Tera templates (`templates/index.html.tera`)
- **Converted**: Go templates (`templates/index.html`)
- **Conversion**: `{{ cv_data.name }}` → `{{.CVData.PersonalInfo.Name}}`

### **Asset Loading**
```go
// Loads Vite manifest.json to get correct asset paths
assets := LoadAssets()  // Gets /static/js/main-BIC1Mt9F.js etc.

// Template receives both CV data and asset paths
templateData := TemplateData{
    CVData: cvData,
    Assets: assets,
}
```

---

## 🔒 **Security Features**

### **HTTP Security Headers**
```go
// Applied to all responses
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000 (HTTPS only)
```

### **CORS Configuration**
```go
// Development
AllowOrigins: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]

// Production  
AllowOrigins: ["https://dav88.dev"]
```

### **Rate Limiting**
- Development: 1000 RPS (disabled)
- Production: 100 RPS (enabled)
- Per-IP tracking with cleanup

---

## 📊 **Performance Features**

### **HTTP/2 Support**
```go
// Production: HTTPS + HTTP/2
server.TLSConfig = &tls.Config{
    NextProtos: []string{"h2", "http/1.1"},
    MinVersion: tls.VersionTLS12,
}

// Development: HTTP/2 Clear Text (H2C)
```

### **Compression**
- Gzip with best compression
- Automatic content-type detection
- Asset optimization through Vite

### **Caching Strategy**
- Static assets: Vite hash-based filenames
- CV data: In-memory caching
- Health metrics: Real-time computation

---

## 🗄️ **Database Integration**

### **MongoDB Atlas Connection**
```go
// Production connection string (configured in .env.production)
MONGO_URI=mongodb+srv://user:pass@dav88dev.vefolf9.mongodb.net/...

// Connection pooling
MaxPoolSize: 100
MinPoolSize: 5
Timeout: 10s
```

### **ODM Integration (MGM)**
- GORM-like experience for MongoDB
- Automatic model management
- Built-in validation hooks
- Transaction support

---

## 🚀 **Deployment Configuration**

### **Environment Variables**

#### **Development (.env)**
```bash
SERVER_PORT=8080
SERVER_ENV=development
DB_MONGO_URI=mongodb+srv://...atlas.connection...
SECURITY_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
SECURITY_ENABLE_RATE_LIMIT=false
```

#### **Production (.env.production)**
```bash
SERVER_PORT=8080
SERVER_ENV=production
SERVER_ENABLE_HTTPS=true
DB_MONGO_URI=mongodb+srv://...production.connection...
SECURITY_CORS_ORIGINS=https://dav88.dev
SECURITY_ENABLE_RATE_LIMIT=true
```

### **Build Commands**
```bash
# 1. Build frontend assets
cd frontend && npm run build

# 2. Build Go server
go build -o portfolio-server .

# 3. Run server
./portfolio-server

# Or with custom port
SERVER_PORT=8081 ./portfolio-server
```

---

## 🔧 **Development Workflow**

### **Local Development**
1. Start with `.env` file configured
2. MongoDB Atlas connection for database
3. Frontend build system ready
4. Hot reload not yet implemented (future enhancement)

### **Production Deployment**
1. Build frontend: `npm run build`
2. Build server: `go build -o portfolio-server .`
3. Configure `.env.production`
4. Run with HTTPS certificates
5. Monitor with `/health/detailed`

---

## 📈 **Monitoring & Observability**

### **Health Checks**
```json
GET /health/detailed
{
  "status": "healthy",
  "system": {
    "go_version": "go1.24.4",
    "memory_alloc": "2 MB",
    "goroutines": 22
  },
  "application": {
    "total_requests": 156,
    "average_latency": "54.485µs",
    "error_rate": 0
  },
  "database": {
    "status": "connected",
    "database": "portfolio_dev"
  }
}
```

### **Request Metrics**
- Total requests counter
- Response times
- Error rates
- Slow request tracking (>1s)
- Status code distribution

---

## ✅ **Testing Status**

### **Completed Tests (10/10 Passed)**
1. ✅ Health endpoint: `{"status":"healthy"}`
2. ✅ CV API: Returns complete portfolio data  
3. ✅ Dev config: Environment debugging
4. ✅ CV sections: Personal, skills, projects accessible
5. ✅ Detailed health: System metrics working
6. ✅ API versioning: v1 endpoints functional
7. ✅ Error handling: Proper 404 responses
8. ✅ Request info: Debug information
9. ✅ CORS: Development environment configured
10. ✅ MongoDB: Atlas connection successful

### **Performance Metrics**
- Response time: ~54µs average
- Memory usage: 2MB allocation  
- Goroutines: 22 active
- Error rate: 0%

---

## 🚧 **Next Implementation Steps**

### **Template Service Integration**
```go
// Need to complete in routes/api.go
router.LoadHTMLGlob("templates/*")

router.GET("/", func(c *gin.Context) {
    cvData := models.LoadCVData()
    assets := models.LoadAssets()
    
    c.HTML(200, "index.html", models.TemplateData{
        CVData: cvData,
        Assets: assets,
    })
})
```

### **Remaining Tasks**
1. ✅ Frontend build integration
2. ✅ Template conversion 
3. 🔄 Complete HTML serving with real data
4. 🔄 Test full website functionality
5. 🔄 Production optimization

---

## 📚 **Key Documentation References**

- **Gin Framework**: v1.10.1 with HTTP/2 support
- **MongoDB Driver**: MGM v3.5.0 + Official Driver v2.2.2
- **Configuration**: caarlos0/env v11.2.2 + godotenv v1.5.1
- **Frontend**: Vite 5.x with legacy browser support
- **Security**: OWASP recommended headers and CORS policies

This architecture provides a solid, enterprise-grade foundation that's ready for production deployment and future feature expansion.