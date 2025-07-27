#!/bin/bash
# Setup script for new Ubuntu server (not minimal)
# Run this on the server as ubuntu user

set -e

echo "🚀 Starting server setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Install essential tools
echo "🔧 Installing essential tools..."
sudo apt install -y ufw curl wget net-tools htop

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

echo "✅ Server setup complete!"
echo "⚠️  Please log out and back in for Docker permissions to take effect"
echo "Or run: newgrp docker"