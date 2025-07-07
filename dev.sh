#!/bin/bash

# Development script for Rust Website

echo "🔥 Starting development mode..."

# Function to kill background processes on exit
cleanup() {
    echo "🧹 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap exit signals to cleanup
trap cleanup SIGINT SIGTERM EXIT

# Build frontend assets first
echo "📦 Initial frontend build..."
cd frontend && npm run build && cd ..

# Check if we have file watchers available
if command -v inotifywait &> /dev/null; then
    echo "🔍 Starting file watcher for frontend changes..."
    # Watch for changes in frontend/src and rebuild
    while inotifywait -r -e modify,create,delete frontend/src/; do
        echo "🔄 Frontend files changed, rebuilding..."
        cd frontend && npm run build && cd ..
    done &
elif command -v fswatch &> /dev/null; then
    echo "🔍 Starting file watcher for frontend changes..."
    fswatch -o frontend/src/ | while read f; do
        echo "🔄 Frontend files changed, rebuilding..."
        cd frontend && npm run build && cd ..
    done &
else
    echo "⚠️  No file watcher found. Install inotify-tools for auto-rebuild:"
    echo "   sudo apt-get install inotify-tools"
fi

# Start Rust application
echo "🦀 Starting Rust application on http://localhost:8000"
echo "📝 Visit http://localhost:8000 to see your site"
cargo run