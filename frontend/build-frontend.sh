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

echo "✅ Frontend build complete!"
echo "📁 Built assets are in ../static/"