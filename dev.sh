#!/bin/bash

# Development script for Rust Website

echo "🔥 Starting development servers..."

# Function to kill background processes on exit
cleanup() {
    echo "🧹 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap exit signals to cleanup
trap cleanup SIGINT SIGTERM EXIT

# Start Vite dev server in background
echo "🌟 Starting Vite dev server..."
cd frontend && npm run dev &
cd ..

# Start Rust application
echo "🦀 Starting Rust application..."
cargo run