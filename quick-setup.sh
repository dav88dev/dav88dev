#!/bin/bash
# Quick setup - no upgrade!

set -e

echo "🚀 Quick server setup..."

# Update package list only
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

echo "✅ Done! Run: newgrp docker"