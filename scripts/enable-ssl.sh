#!/bin/bash
#####################################################################
# Enable SSL Configuration Script
# Run this after certbot has generated certificates
# For: Ubuntu 22.04+ with Nginx
# Author: David Aghayan
# Date: January 2025
#####################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="dav88.dev"

echo -e "${GREEN}=== Enabling SSL Configuration ===${NC}"

# Check if certificates exist
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}SSL certificates not found!${NC}"
    echo -e "${YELLOW}Please run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Creating SSL-enabled Nginx configuration...${NC}"

# Create new SSL-enabled configuration
cat << 'EOF' | sudo tee /etc/nginx/sites-available/${DOMAIN}-ssl
# Nginx configuration for portfolio website with SSL
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
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dav88.dev www.dav88.dev;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/dav88.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dav88.dev/privkey.pem;
    
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

echo -e "${YELLOW}2. Testing new configuration...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Configuration test passed${NC}"
    
    echo -e "${YELLOW}3. Switching to SSL configuration...${NC}"
    # Disable old config
    sudo rm -f /etc/nginx/sites-enabled/$DOMAIN
    # Enable new SSL config
    sudo ln -sf /etc/nginx/sites-available/${DOMAIN}-ssl /etc/nginx/sites-enabled/
    
    echo -e "${YELLOW}4. Reloading Nginx...${NC}"
    sudo systemctl reload nginx
    
    echo -e "${GREEN}✅ SSL configuration enabled successfully!${NC}"
    echo -e "${GREEN}Your site is now available at: https://$DOMAIN${NC}"
else
    echo -e "${RED}❌ Configuration test failed! Please check the error above.${NC}"
    exit 1
fi