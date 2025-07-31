# Personal Portfolio Website

A modern, enterprise-grade portfolio website built with Go (Gin framework), featuring interactive Three.js animations, MongoDB integration, and a responsive design.

## 🚀 Tech Stack

### Backend
- **Go 1.21+** with Gin Framework v1.10.1
- **MongoDB Atlas** with MGM ODM
- **HTTP/2** support with H2C for development
- **Enterprise middleware stack** (CORS, rate limiting, security headers, compression)

### Frontend  
- **Vite 5.x** build system with legacy browser support
- **Three.js** for interactive 3D background animations
- **Modern CSS** with responsive design
- **Progressive Web App** capabilities

## 📋 Prerequisites

- Go 1.21 or higher
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dav88dev/myWebsite.git
   cd myWebsite
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB credentials and other settings
   ```

3. **Install Go dependencies**
   ```bash
   go mod download
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Build frontend assets**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

6. **Build the Go server**
   ```bash
   go build -o portfolio-server .
   ```

## 🚦 Running the Application

### Development Mode
```bash
# Start the server (default port 8080)
./portfolio-server

# Or with custom port
SERVER_PORT=8081 ./portfolio-server
```

### Production Mode
```bash
# Set production environment
export SERVER_ENV=production
export GIN_MODE=release

# Run with production config
./portfolio-server
```

## 📁 Project Structure

```
myWebsite/
├── main.go                     # Application entry point
├── config/                     # Configuration management
│   └── config.go              # Environment config loader
├── internal/                   # Private application code
│   ├── controllers/           # HTTP request handlers
│   │   ├── health.go         # Health check endpoints
│   │   └── cv.go            # CV/Resume API endpoints
│   ├── middleware/           # HTTP middleware
│   │   ├── logger.go        # Request logging
│   │   ├── metrics.go       # Application metrics
│   │   ├── ratelimit.go     # Rate limiting
│   │   ├── recovery.go      # Panic recovery
│   │   └── security.go      # Security headers
│   ├── models/              # Data models
│   │   └── cv.go           # CV data structures
│   └── routes/             # Route definitions
│       └── api.go          # API route setup
├── templates/              # HTML templates
│   ├── index.html         # Main page
│   ├── 404.html          # 404 error page
│   └── 500.html          # 500 error page
├── frontend/              # Frontend build system
│   ├── src/              # Source files
│   └── vite.config.js    # Vite configuration
└── static/               # Static assets (built by Vite)
    ├── css/             # Compiled CSS
    ├── js/              # Compiled JavaScript
    └── images/          # Images and icons
```

## 🔗 API Endpoints

### Health Checks
- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed system metrics

### CV/Resume API
- `GET /api/cv` - Get complete CV data
- `GET /api/cv/:section` - Get specific CV section
  - Valid sections: `personal`, `experience`, `education`, `skills`, `projects`

### Development Tools
- `GET /dev/config` - View configuration (dev only)
- `GET /dev/request-info` - Request debugging (dev only)

## 🔒 Security Features

- **CSP Headers** with nonce-based script/style policies
- **Rate Limiting** (configurable per environment)
- **CORS Protection** with origin whitelisting
- **Input Validation** on all API endpoints
- **Path Traversal Protection** for file operations
- **Security Headers** (X-Frame-Options, X-Content-Type-Options, etc.)

## 🧪 Testing

```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...

# Test specific endpoint
curl http://localhost:8080/health
```

## 📊 Monitoring

The application includes built-in metrics accessible via:
```bash
curl http://localhost:8080/health/detailed
```

Metrics include:
- Request counts and latency
- Error rates
- Memory usage
- Goroutine counts
- Status code distribution

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Server port | `8080` |
| `SERVER_ENV` | Environment (development/production) | `development` |
| `DB_MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_MONGO_DATABASE` | Database name | `portfolio_dev` |
| `SECURITY_CORS_ORIGINS` | Allowed CORS origins | `*` |
| `SECURITY_RATE_LIMIT_RPS` | Requests per second limit | `100` |

See `.env.example` for complete list.

## 🚀 Deployment

### Docker (Coming Soon)
```bash
docker build -t portfolio-server .
docker run -p 8080:8080 portfolio-server
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Build server: `go build -o portfolio-server .`
3. Copy binary and static files to server
4. Set environment variables
5. Run with process manager (systemd, supervisor, etc.)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**David Aghayan**
- Email: info@dav88.dev
- GitHub: [@dav88dev](https://github.com/dav88dev)
- Website: [dav88.dev](https://dav88.dev)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

Please use the [GitHub Issues](https://github.com/dav88dev/myWebsite/issues) to report bugs.