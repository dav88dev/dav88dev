#!/bin/bash
set -e

echo "🚀 Starting bare metal deployment..."

# Stop existing service
sudo systemctl stop portfolio || true

# Backup current deployment  
sudo mv /opt/portfolio /opt/portfolio.backup.$(date +%s) || true

# Create directory and copy files
sudo mkdir -p /opt/portfolio
sudo cp -r * /opt/portfolio/
sudo chown -R www-data:www-data /opt/portfolio

# Install and start service
sudo cp portfolio.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable portfolio
sudo systemctl start portfolio

# Health check
sleep 5
curl -f http://localhost:8000/health || exit 1

echo "✅ Deployment completed successfully!"