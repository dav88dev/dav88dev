# Portfolio Website

A modern, high-performance portfolio website built with Go, featuring real-time error monitoring, 3D animations, and enterprise-grade security.

## Features

- **High-Performance Backend**: Built with Go and Gin framework for blazing-fast response times
- **Real-Time Error Monitoring**: Integrated Bugsnag for production error tracking and performance monitoring
- **Interactive 3D Animations**: Three.js powered visual effects
- **Enterprise Security**: Comprehensive security headers, CSP with nonces, rate limiting
- **MongoDB Integration**: Scalable data storage with MongoDB Atlas
- **Modern Frontend**: Vite-powered build system with optimal bundling
- **PWA Support**: Progressive Web App capabilities
- **Custom Error Pages**: Beautiful 404 and 500 error pages

## Tech Stack

- **Backend**: Go 1.21+, Gin Framework v1.10.1
- **Database**: MongoDB Atlas with MGM ODM
- **Error Monitoring**: Bugsnag (backend + frontend performance)
- **Frontend Build**: Vite 5.x
- **3D Graphics**: Three.js
- **Deployment**: Production-ready with graceful shutdown

## Prerequisites

- Go 1.21 or higher
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/dav88dev/myWebsite.git
cd myWebsite
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- MongoDB connection string
- Bugsnag API key (for production)
- Other environment-specific settings

### 3. Install Dependencies

```bash
# Backend dependencies
go mod download

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Build Frontend Assets

```bash
cd frontend
npm run build
cd ..
```

### 5. Run the Application

#### Development Mode
```bash
go run main.go
```

#### Production Mode
```bash
# Build the binary
go build -o portfolio-server .

# Set production environment
export SERVER_ENV=production
export GIN_MODE=release

# Run the server
./portfolio-server
```

The application will be available at `http://localhost:8080`

## API Endpoints

### Health Monitoring
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system metrics

### CV/Resume API
- `GET /api/cv` - Complete CV data
- `GET /api/cv/:section` - Specific sections (personal, experience, education, skills, projects)

### Development Tools (dev mode only)
- `GET /dev/config` - Configuration info
- `GET /dev/request-info` - Request debugging
- `GET /dev/test-error` - Test error handling

## Security Features

- **Content Security Policy (CSP)** with per-request nonces
- **Rate Limiting** (configurable, production-enabled)
- **CORS Protection** with whitelist
- **Input Validation** on all endpoints
- **Path Traversal Protection**
- **Security Headers** (HSTS, X-Frame-Options, etc.)
- **Graceful Error Handling** with custom pages

## Error Monitoring

### Backend (Bugsnag)
- Automatic error capture in production
- Performance tracking
- Release tracking
- Local logging in development

### Frontend (Bugsnag Performance)
- Web vitals monitoring
- Resource timing
- User interaction tracking
- Automatic in production

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Server port | `8080` |
| `SERVER_ENV` | Environment (development/production) | `development` |
| `DB_MONGO_URI` | MongoDB connection string | Required |
| `DB_MONGO_DATABASE` | Database name | `portfolio_dev` |
| `BUGSNAG_API_KEY` | Bugsnag API key | Required for production |
| `SECURITY_CORS_ORIGINS` | Allowed CORS origins | `*` |
| `SECURITY_RATE_LIMIT_RPS` | Rate limit (requests/second) | `100` |

See `.env.example` for complete configuration options.

## Development

### Running Tests
```bash
go test ./...
```

### Code Quality
```bash
# Format code
go fmt ./...

# Lint
golangci-lint run

# Security scan
gosec ./...
```

### Frontend Development
```bash
cd frontend
npm run dev  # Start Vite dev server
npm run build  # Production build
npm run preview  # Preview production build
```

## Deployment

### Using Systemd (Linux)

1. Build the binary:
```bash
go build -o portfolio-server .
```

2. Create systemd service file `/etc/systemd/system/portfolio.service`:
```ini
[Unit]
Description=Portfolio Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/portfolio
ExecStart=/var/www/portfolio/portfolio-server
Restart=on-failure
Environment="SERVER_ENV=production"
Environment="GIN_MODE=release"

[Install]
WantedBy=multi-user.target
```

3. Start the service:
```bash
sudo systemctl enable portfolio
sudo systemctl start portfolio
```

### Using Docker (Coming Soon)

```bash
docker build -t portfolio .
docker run -p 8080:8080 --env-file .env portfolio
```

## Monitoring

### Application Metrics
Access detailed metrics at `/health/detailed`:
- Request counts and latency
- Memory usage
- Goroutine counts
- Database connection status

### Error Tracking
View errors in Bugsnag dashboard:
- Real-time error notifications
- Error grouping and trends
- Performance metrics
- User impact analysis

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**David Aghayan**
- Email: info@dav88.dev
- GitHub: [@dav88dev](https://github.com/dav88dev)
- Website: [dav88.dev](https://dav88.dev)

## Acknowledgments

- Built with love using Go and modern web technologies
- Special thanks to the open-source community