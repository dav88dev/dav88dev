#!/bin/bash
#####################################################################
# Portfolio Website Server Setup Script
# For: Ubuntu 22.04+ on 1GB VPS
# Architecture: Nginx + Go Binary (Bare Metal)
# Author: David Aghayan
# Date: January 2025
#####################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dav88.dev"
APP_USER="portfolio"
APP_DIR="/var/www/portfolio"
GO_PORT="8080"
BINARY_NAME="portfolio-server"

echo -e "${GREEN}=== Portfolio Website Server Setup ===${NC}"

# Update system
echo -e "${YELLOW}1. Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo -e "${YELLOW}2. Installing essential packages...${NC}"
sudo apt install -y \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    wget \
    htop \
    ufw \
    fail2ban \
    supervisor

# Setup firewall
echo -e "${YELLOW}3. Configuring firewall...${NC}"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create application user
echo -e "${YELLOW}4. Creating application user...${NC}"
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $APP_USER
    echo -e "${GREEN}User $APP_USER created${NC}"
else
    echo -e "${GREEN}User $APP_USER already exists${NC}"
fi

# Create application directory
echo -e "${YELLOW}5. Setting up application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Setup Nginx
echo -e "${YELLOW}6. Configuring Nginx...${NC}"
cat << 'EOF' | sudo tee /etc/nginx/sites-available/$DOMAIN
# Nginx configuration for portfolio website
# Optimized for 1GB VPS with Go backend

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

# Upstream Go application
upstream go_backend {
    server 127.0.0.1:8080 fail_timeout=0;
    keepalive 32;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name dav88.dev www.dav88.dev;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dav88.dev www.dav88.dev;
    
    # SSL will be configured by certbot
    # ssl_certificate /etc/letsencrypt/live/dav88.dev/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/dav88.dev/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Root directory for static files
    root /var/www/portfolio/static;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # Client body size
    client_max_body_size 10M;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Static files with aggressive caching
    location /static/ {
        alias /var/www/portfolio/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Favicon
    location = /favicon.ico {
        alias /var/www/portfolio/static/favicon.ico;
        expires 1y;
        access_log off;
    }
    
    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        
        proxy_pass http://go_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
    
    # Health check endpoint (no rate limiting)
    location /health {
        proxy_pass http://go_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }
    
    # Main application with rate limiting
    location / {
        limit_req zone=general burst=20 nodelay;
        
        try_files $uri @go_backend;
    }
    
    # Go backend
    location @go_backend {
        proxy_pass http://go_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
    
    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${YELLOW}7. Testing Nginx configuration...${NC}"
sudo nginx -t

# Setup supervisor for Go app
echo -e "${YELLOW}8. Configuring Supervisor...${NC}"
cat << EOF | sudo tee /etc/supervisor/conf.d/portfolio.conf
[program:portfolio]
command=$APP_DIR/$BINARY_NAME
directory=$APP_DIR
autostart=true
autorestart=true
startretries=3
stderr_logfile=/var/log/portfolio/error.log
stdout_logfile=/var/log/portfolio/access.log
user=$APP_USER
environment=HOME="$APP_DIR",USER="$APP_USER",SERVER_ENV="production",GIN_MODE="release",SERVER_PORT="$GO_PORT"
EOF

# Create log directory
sudo mkdir -p /var/log/portfolio
sudo chown -R $APP_USER:$APP_USER /var/log/portfolio

# Setup log rotation
echo -e "${YELLOW}9. Configuring log rotation...${NC}"
cat << EOF | sudo tee /etc/logrotate.d/portfolio
/var/log/portfolio/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $APP_USER $APP_USER
    sharedscripts
    postrotate
        supervisorctl restart portfolio >/dev/null 2>&1 || true
    endscript
}
EOF

# Setup fail2ban for Go app
echo -e "${YELLOW}10. Configuring fail2ban...${NC}"
cat << 'EOF' | sudo tee /etc/fail2ban/filter.d/portfolio.conf
[Definition]
failregex = ^.*\[GIN\].*\s<HOST>\s.*\s(4\d{2}|5\d{2})\s.*$
ignoreregex =
EOF

cat << EOF | sudo tee /etc/fail2ban/jail.d/portfolio.conf
[portfolio]
enabled = true
port = http,https
filter = portfolio
logpath = /var/log/portfolio/access.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

# System optimization for 1GB VPS
echo -e "${YELLOW}11. Optimizing system for 1GB VPS...${NC}"
cat << EOF | sudo tee -a /etc/sysctl.conf

# Portfolio Website Optimizations
# Network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30

# Memory optimizations for 1GB VPS
vm.swappiness = 10
vm.vfs_cache_pressure = 50

# File descriptor limits
fs.file-max = 65535
EOF

# Apply sysctl changes
sudo sysctl -p

# Increase file descriptor limits
cat << EOF | sudo tee -a /etc/security/limits.conf
$APP_USER soft nofile 65535
$APP_USER hard nofile 65535
EOF

# Create deployment script
echo -e "${YELLOW}12. Creating deployment script...${NC}"
cat << 'EOF' | sudo tee $APP_DIR/deploy.sh
#!/bin/bash
# Deployment script for portfolio website

set -euo pipefail

BINARY_NAME="portfolio-server"
BACKUP_DIR="/var/www/portfolio/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup current binary if exists
if [ -f "$BINARY_NAME" ]; then
    echo "📦 Backing up current binary..."
    cp $BINARY_NAME "$BACKUP_DIR/${BINARY_NAME}_${TIMESTAMP}"
fi

# Copy new binary (assumed to be uploaded as portfolio-server.new)
if [ -f "${BINARY_NAME}.new" ]; then
    echo "📥 Installing new binary..."
    mv ${BINARY_NAME}.new $BINARY_NAME
    chmod +x $BINARY_NAME
else
    echo "❌ Error: ${BINARY_NAME}.new not found!"
    exit 1
fi

# Copy static files if directory exists
if [ -d "static.new" ]; then
    echo "📁 Updating static files..."
    rm -rf static.old
    [ -d "static" ] && mv static static.old
    mv static.new static
fi

# Restart application
echo "🔄 Restarting application..."
sudo supervisorctl restart portfolio

# Wait for app to start
sleep 5

# Health check
echo "🏥 Running health check..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    # Clean old backups (keep last 5)
    cd $BACKUP_DIR && ls -t | tail -n +6 | xargs -r rm
else
    echo "❌ Health check failed! Rolling back..."
    if [ -f "$BACKUP_DIR/${BINARY_NAME}_${TIMESTAMP}" ]; then
        cp "$BACKUP_DIR/${BINARY_NAME}_${TIMESTAMP}" $BINARY_NAME
        sudo supervisorctl restart portfolio
    fi
    exit 1
fi
EOF

sudo chmod +x $APP_DIR/deploy.sh
sudo chown $APP_USER:$APP_USER $APP_DIR/deploy.sh

# Create monitoring script
echo -e "${YELLOW}13. Creating monitoring script...${NC}"
cat << 'EOF' | sudo tee $APP_DIR/monitor.sh
#!/bin/bash
# Simple monitoring script for portfolio website

# Check if app is running
if ! curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "$(date): Health check failed, restarting..." >> /var/log/portfolio/monitor.log
    sudo supervisorctl restart portfolio
fi

# Check memory usage
MEMORY=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
if (( $(echo "$MEMORY > 90" | bc -l) )); then
    echo "$(date): High memory usage: ${MEMORY}%" >> /var/log/portfolio/monitor.log
fi
EOF

sudo chmod +x $APP_DIR/monitor.sh
sudo chown $APP_USER:$APP_USER $APP_DIR/monitor.sh

# Add monitoring to crontab
echo -e "${YELLOW}14. Setting up monitoring cron job...${NC}"
(crontab -u $APP_USER -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/monitor.sh") | crontab -u $APP_USER -

# SSL Certificate (if domain is pointing to server)
echo -e "${YELLOW}15. SSL Certificate Setup${NC}"
echo -e "${RED}Note: Make sure your domain is pointing to this server before running:${NC}"
echo -e "${GREEN}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"

# Final steps
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload your compiled Go binary as: $APP_DIR/$BINARY_NAME.new"
echo "2. Upload static files as: $APP_DIR/static.new/"
echo "3. Copy .env file to: $APP_DIR/.env"
echo "4. Run deployment: cd $APP_DIR && sudo -u $APP_USER ./deploy.sh"
echo "5. Setup SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo -e "${GREEN}Server optimized for 1GB VPS with:${NC}"
echo "- Nginx reverse proxy with HTTP/2"
echo "- Supervisor for process management"
echo "- Fail2ban for security"
echo "- Automated deployments with rollback"
echo "- Health monitoring every 5 minutes"
echo "- Log rotation to save disk space"
echo "- Memory-optimized settings"

# Restart services
echo -e "${YELLOW}Restarting services...${NC}"
sudo systemctl restart nginx
sudo systemctl restart supervisor
sudo systemctl restart fail2ban

echo -e "${GREEN}✅ All done!${NC}"
EOF

chmod +x /home/dav88dev/DAV88DEV/myWebsite/scripts/server-setup.sh