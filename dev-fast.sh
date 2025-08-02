#!/bin/bash

# Super-fast development script - no builds, just runs Go server

echo "⚡ Starting FAST development mode (no builds)..."

# Function to kill background processes on exit
cleanup() {
    echo "🧹 Stopping server..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap exit signals to cleanup
trap cleanup SIGINT SIGTERM EXIT

# Check prerequisites
if [ ! -f "static/.vite/manifest.json" ]; then
    echo "❌ Frontend assets not found. Run one of these first:"
    echo "   ./dev.sh --build    (full build)"
    echo "   ./start-dev.sh      (setup + build)"
    echo "   cd frontend && npm run build"
    exit 1
fi

if [ ! -f "static/wasm/wasm_frontend.js" ]; then
    echo "⚠️  WASM not found - skills visualization will show fallback"
    echo "   Run ./build.sh for full WASM build"
fi

# Start Go application immediately
echo "🚀 Starting Go server on http://localhost:8081 (FAST MODE)"
echo "🛠️  Press Ctrl+C to stop"
echo "📝 Frontend assets: static/.vite/manifest.json"
echo ""

SERVER_PORT=8081 go run main.go