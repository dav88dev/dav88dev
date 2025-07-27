#!/bin/bash
# Quick setup for Oracle Cloud Ubuntu 24.04 Minimal
# Run as ubuntu user

set -e

echo "🚀 Setting up OCI Ubuntu 24.04 Minimal for Docker"

# Update and install basic requirements first
echo "📦 Installing basic requirements..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl

# Install Docker using the convenience script
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com | sudo sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Configure OCI firewall rules (iptables)
echo "🔥 Configuring firewall for OCI..."
# OCI uses iptables, not ufw
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Save iptables rules
sudo apt-get install -y netfilter-persistent
sudo netfilter-persistent save

echo "✅ Basic setup complete!"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Log out and back in for docker group to take effect"
echo "2. Make sure OCI Security List allows port 80:"
echo "   - Go to OCI Console > Networking > VCN > Security Lists"
echo "   - Add Ingress Rule: Source 0.0.0.0/0, Protocol TCP, Port 80"
echo ""
echo "Test Docker with: docker run hello-world"