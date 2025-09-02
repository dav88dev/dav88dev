#!/bin/bash

# Simple direct deployment script - NO GITHUB ACTIONS NEEDED
# This deploys directly from your local machine to production

echo "🚀 Starting direct deployment to production..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build Go server for Linux
echo "🔨 Building Go server..."
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o portfolio-server main.go

# Create deployment package (including ALL static files and WASM)
echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz portfolio-server static/ templates/

# Deploy to server
echo "🚀 Deploying to server 129.80.244.212..."
scp -i ssh.key deploy.tar.gz ubuntu@129.80.244.212:/tmp/

# Setup on server
ssh -i ssh.key ubuntu@129.80.244.212 << 'EOF'
  # Stop old service
  sudo systemctl stop personal_website || true
  
  # Clean and setup directory
  sudo rm -rf /opt/personal_website
  sudo mkdir -p /opt/personal_website
  sudo chown ubuntu:ubuntu /opt/personal_website
  
  # Extract files
  cd /opt/personal_website
  tar -xzf /tmp/deploy.tar.gz
  rm /tmp/deploy.tar.gz
  
  # Fix permissions (CRITICAL for Cloudflare)
  chmod +x portfolio-server
  chmod -R 755 static/
  chmod -R 755 templates/
  find static/ -type f -exec chmod 644 {} \;
  
  # Start service
  sudo systemctl start personal_website
  
  echo "✅ Deployment complete!"
  
  # Check status
  sleep 2
  sudo systemctl status personal_website --no-pager
EOF

# Test the deployment
echo "🧪 Testing deployment..."
sleep 3
curl -I http://129.80.244.212:8000/

echo "✅ Deployment finished!"