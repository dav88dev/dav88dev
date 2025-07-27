#!/bin/bash

# Production Build Script for Rust Website
# This script builds the application for production deployment

set -euo pipefail

echo "🏗️  Building for production..."

# Set production environment
export ENVIRONMENT=production
export RUST_LOG=personal_website=info,tower_http=warn

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cargo clean

# Build frontend for production
echo "📦 Building frontend for production..."
cd frontend
npm run build
cd ..

# Build Rust application with maximum optimization
echo "🦀 Building Rust application with production optimizations..."
RUSTFLAGS="-C target-cpu=native -C opt-level=3" cargo build --release

# Strip binary for minimal size (if not done by profile)
echo "🪶 Optimizing binary size..."
strip target/release/personal_website || true

# Show binary size
echo "📊 Final binary size:"
ls -lh target/release/personal_website

echo "✅ Production build complete!"
echo "🚀 Run with: ENVIRONMENT=production ./target/release/personal_website"