#!/bin/bash

# Production Startup Script for Rust Website
# This script starts the application in production mode

set -euo pipefail

echo "🚀 Starting in production mode..."

# Production environment variables
export ENVIRONMENT=production
export RUST_LOG=personal_website=info,tower_http=warn
export HOST=0.0.0.0
export PORT=8000

# Security and performance settings
export RUST_BACKTRACE=0  # Disable backtraces in production
export MALLOC_CONF="dirty_decay_ms:1000,muzzy_decay_ms:1000"  # Optimize memory usage

echo "📊 Production configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Log Level: $RUST_LOG"
echo "  Host: $HOST"
echo "  Port: $PORT"

# Start the application
echo "🏃 Starting server..."
exec ./target/release/personal_website