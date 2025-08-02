#!/bin/bash

# Complete development setup and start script

echo "🚀 Setting up development environment..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "main.go" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

# Install Go dependencies
echo "📦 Installing Go dependencies..."
go mod download

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Build frontend assets
echo "🔨 Building frontend assets..."
npm run build
cd ..

# Function to kill background processes on exit
cleanup() {
    echo "🧹 Stopping development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap exit signals to cleanup
trap cleanup SIGINT SIGTERM EXIT

# Start file watcher for frontend changes (if available)
if command -v inotifywait &> /dev/null; then
    echo "🔍 Starting file watcher for frontend changes..."
    while inotifywait -r -e modify,create,delete frontend/src/; do
        echo "🔄 Frontend files changed, rebuilding..."
        cd frontend && npm run build && cd ..
    done &
else
    echo "ℹ️  Install inotify-tools for automatic frontend rebuilding:"
    echo "   sudo apt-get install inotify-tools"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
SERVER_PORT=8081
SERVER_ENV=development
DB_MONGO_URI=mongodb://localhost:27017
DB_MONGO_DATABASE=portfolio_dev
SECURITY_CORS_ORIGINS=http://localhost:3000,http://localhost:8081
SECURITY_RATE_LIMIT_RPS=100
EOF
fi

# Start Go application
echo "🚀 Starting Go application on http://localhost:8081"
echo "📝 Visit http://localhost:8081 to see your site"
echo "🛠️  Press Ctrl+C to stop all services"
echo ""

go run main.go