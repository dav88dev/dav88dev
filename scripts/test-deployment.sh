#!/bin/bash
# Test deployment locally before CircleCI
# Run this from your local machine

set -e

SERVER_IP="129.153.229.28"
SERVER_USER="ubuntu"  # Change if different

echo "🧪 Testing deployment to $SERVER_IP"

# Build Docker image locally
echo "🔨 Building Docker image..."
docker build -t portfolio:test .

# Save and compress image
echo "💾 Saving Docker image..."
docker save portfolio:test | gzip > portfolio-test.tar.gz

# Transfer to server
echo "📤 Transferring to server..."
scp portfolio-test.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Deploy on server
echo "🚀 Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
  cd /tmp
  
  # Load image
  docker load < portfolio-test.tar.gz
  
  # Stop existing container if any
  docker stop portfolio || true
  docker rm portfolio || true
  
  # Run new container
  docker run -d \
    --name portfolio \
    --restart unless-stopped \
    -p 80:8000 \
    -e RUST_LOG=info \
    portfolio:test
  
  # Wait for startup
  sleep 5
  
  # Health check
  if curl -f http://localhost/health; then
    echo "✅ Deployment successful!"
  else
    echo "❌ Health check failed"
    docker logs portfolio
    exit 1
  fi
  
  # Cleanup
  rm portfolio-test.tar.gz
EOF

# Cleanup local file
rm portfolio-test.tar.gz

echo "🎉 Test deployment complete!"
echo "🌐 Visit http://$SERVER_IP to see your site"