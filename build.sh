#!/bin/bash

# Build script for Rust Website with Vite frontend and dynamic asset loading

echo "🔧 Building frontend assets with Vite..."
cd frontend && npm run build && cd ..

echo "📦 Vite manifest generated at static/.vite/manifest.json"
echo "✅ Assets will be dynamically loaded by Rust backend"

echo "🚀 Building Rust application..."
cargo build --release

echo "✨ Build complete! Run with: cargo run --release"
echo "🌟 Assets are dynamically loaded - no need to update templates manually!"