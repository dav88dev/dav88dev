#!/bin/bash
# Server setup script for Ubuntu 24.04 minimal
# Run this on your production server at 129.153.229.28

set -e

echo "🚀 Setting up production server for Rust portfolio deployment"

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
# Remove old versions if any
sudo apt remove -y docker docker-engine docker.io containerd runc || true

# Install prerequisites
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (avoid using sudo for docker commands)
sudo usermod -aG docker $USER

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS (for future)
sudo ufw --force enable

# Install additional utilities
echo "🛠️  Installing utilities..."
sudo apt install -y \
    htop \
    vim \
    net-tools \
    ufw \
    fail2ban

# Configure fail2ban for SSH protection
echo "🔒 Setting up fail2ban..."
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p ~/deploy

# Setup Docker log rotation
echo "📊 Configuring Docker log rotation..."
sudo tee /etc/docker/daemon.json > /dev/null <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker

# Create health check script
echo "❤️  Creating health check script..."
cat > ~/health-check.sh << 'EOF'
#!/bin/bash
# Health check script
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed"
    exit 1
fi
EOF
chmod +x ~/health-check.sh

# Setup automatic security updates
echo "🔐 Configuring automatic security updates..."
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Create systemd service for auto-restart (optional)
echo "🔄 Creating systemd service for container management..."
sudo tee /etc/systemd/system/portfolio.service > /dev/null <<'EOF'
[Unit]
Description=Portfolio Website Container
Requires=docker.service
After=docker.service

[Service]
Restart=always
ExecStart=/usr/bin/docker start -a portfolio
ExecStop=/usr/bin/docker stop -t 10 portfolio

[Install]
WantedBy=multi-user.target
EOF

# Don't enable the service yet - GitHub Actions will manage the container

echo "✅ Server setup complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Log out and back in for docker group membership to take effect"
echo "2. Generate SSH key for GitHub Actions deployment:"
echo "   ssh-keygen -t rsa -b 4096 -C 'github-actions-deploy' -f ~/.ssh/github_deploy"
echo "3. Add the public key to authorized_keys:"
echo "   cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys"
echo "4. Get the private key for GitHub Actions:"
echo "   cat ~/.ssh/github_deploy"
echo "5. Add server IP to GitHub Actions workflow:"
echo "   ssh-keyscan 129.153.229.28"
echo ""
echo "🎉 Your server is ready for GitHub Actions deployments!"