# Quick Start Guide

## Issues Fixed

✅ **Navigation jumping after page load** - Fixed CSS layout shifts by removing negative margins and improving viewport calculations  
✅ **Local development setup** - Updated dev scripts to use Go instead of Rust and fixed port configuration  
✅ **Port conflicts** - Changed default port to 8081 to avoid Jenkins conflict on 8080  
✅ **Build system** - Updated Vite configuration and fixed proxy settings  

## Running the Website Locally

### Option 1: Quick Start (Recommended)
```bash
./start-dev.sh
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
go mod download
cd frontend && npm install && cd ..

# 2. Build frontend
cd frontend && npm run build && cd ..

# 3. Start server
SERVER_PORT=8081 go run main.go
```

### Option 3: Use existing dev script
```bash
./dev.sh
```

## URLs

- **Local Development**: http://localhost:8081
- **Frontend Dev Server**: http://localhost:3000 (if running Vite separately)

## Key Changes Made

### CSS Fixes (navigation jumping):
- Removed `margin-top: -70px` from `.hero` section
- Changed to proper `padding-top: 70px` 
- Updated viewport heights from `103vh` to `100vh`
- Added `scroll-padding-top: 70px` to html
- Fixed mobile responsive behavior

### Development Setup:
- Updated `dev.sh` to use Go instead of Rust
- Fixed port from 8080 to 8081 in all configs
- Updated Vite proxy configuration
- Fixed default port in `config.go`

### Scripts:
- Created `start-dev.sh` for complete setup
- Made all scripts executable
- Added environment file creation

## Environment Variables

The application will create a `.env` file automatically with these defaults:
```
SERVER_PORT=8081
SERVER_ENV=development
DB_MONGO_URI=mongodb://localhost:27017
DB_MONGO_DATABASE=portfolio_dev
SECURITY_CORS_ORIGINS=http://localhost:3000,http://localhost:8081
SECURITY_RATE_LIMIT_RPS=100
```

## Troubleshooting

- **Port 8081 busy**: Change `SERVER_PORT` in `.env` file
- **MongoDB errors**: The site works without MongoDB (warnings are normal)
- **Frontend build fails**: Run `cd frontend && npm install` again
- **Permission denied**: Run `chmod +x *.sh` to make scripts executable

The navigation should now remain stable and the site should run perfectly on localhost:8081!