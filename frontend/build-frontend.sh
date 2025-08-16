#!/bin/bash

# Simple frontend build script
echo "🔧 Building frontend assets..."

# Make sure we're in the frontend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🚀 Building with Vite..."
npm run build

# Copy the WASM skills file to the built static directory
echo "📋 Copying WASM skills file..."
if [ -f "../static/js/full-wasm-skills.js" ]; then
    cp "../static/js/full-wasm-skills.js" "../static/js/"
    echo "✅ full-wasm-skills.js copied"
else
    echo "⚠️ full-wasm-skills.js not found at ../static/js/"
fi

echo "✅ Frontend build complete!"
echo "📁 Built assets are in ../static/"