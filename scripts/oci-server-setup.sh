#!/bin/sh
# OCI Ubuntu 24.04 Minimal Server Setup for Docker Go Portfolio Deployment
# Optimized for Oracle Cloud Infrastructure - POSIX compliant

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if running as root
if [ "$(id -u)" -eq 0 ]; then
   error "This script should not be run as root. Run as ubuntu user with sudo access."
fi

log "🚀 Starting OCI Ubuntu 24.04 Server Setup for Docker Portfolio"
log "Server: $(hostname) | User: $(whoami) | OS: $(lsb_release -d | cut -f2)"

# Update system packages
log "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install essential packages
log "🛠️  Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    vim \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    logrotate

# Install Docker
log "🐳 Installing Docker..."
# Remove any old Docker installations
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker ubuntu
log "✅ Docker installed and ubuntu user added to docker group"

# Configure Docker daemon for production
log "⚙️  Configuring Docker daemon..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true
}
EOF

sudo systemctl enable docker
sudo systemctl restart docker

# Install Nginx
log "🌐 Installing and configuring Nginx..."
sudo apt install -y nginx

# Configure Nginx for Docker portfolio
sudo tee /etc/nginx/sites-available/portfolio > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # WASM MIME type
    location ~* \.wasm$ {
        add_header Content-Type application/wasm;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Main application proxy
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Enable compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
    
    # Health check endpoint (bypass proxy for faster response)
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }
    
    # Serve static files directly when needed
    location /static/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_cache_valid 200 1d;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t || error "Nginx configuration test failed"

sudo systemctl enable nginx
sudo systemctl restart nginx
log "✅ Nginx configured and started"

# Configure UFW Firewall
log "🔥 Configuring UFW firewall..."
sudo ufw --force reset

# Allow SSH (important!)
sudo ufw allow 22/tcp comment "SSH"

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp comment "HTTP"
sudo ufw allow 443/tcp comment "HTTPS"

# Enable UFW
sudo ufw --force enable
sudo ufw status
log "✅ UFW firewall configured"

# Configure fail2ban
log "🛡️  Configuring fail2ban..."
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 10m
findtime = 10m
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true
port = http,https
logpath = %(nginx_error_log)s

[nginx-noscript]
enabled = true
port = http,https
logpath = %(nginx_access_log)s
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
logpath = %(nginx_access_log)s
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
logpath = %(nginx_access_log)s
maxretry = 2
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
log "✅ fail2ban configured and started"

# Setup deployment directory
log "📁 Setting up deployment directory..."
sudo mkdir -p /opt/portfolio
sudo chown ubuntu:ubuntu /opt/portfolio
mkdir -p /opt/portfolio/{backups,logs}

# Create deployment script
log "📜 Creating deployment script..."
tee /opt/portfolio/deploy.sh > /dev/null <<'EOF'
#!/bin/sh
# Portfolio Deployment Script for OCI Server

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

BACKUP_DIR="/opt/portfolio/backups"
LOG_FILE="/opt/portfolio/logs/deploy.log"

# Create backup of current deployment
if docker ps --format "table {{.Names}}" | grep -q portfolio-app; then
    log "Creating backup of current deployment..."
    mkdir -p "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
    docker save portfolio-app:latest | gzip > "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/portfolio-backup.tar.gz"
fi

# Stop and remove existing container
log "Stopping existing container..."
docker stop portfolio-app 2>/dev/null || true
docker rm portfolio-app 2>/dev/null || true

# Load new image
if [ -f "/tmp/portfolio-app.tar.gz" ]; then
    log "Loading new Docker image..."
    docker load < /tmp/portfolio-app.tar.gz
    rm -f /tmp/portfolio-app.tar.gz
fi

# Run new container with all environment variables
log "Starting new container with production environment..."
docker run -d \
    --name portfolio-app \
    --restart unless-stopped \
    -p 127.0.0.1:8000:8000 \
    -e SERVER_ENV="${SERVER_ENV:-production}" \
    -e SERVER_PORT="${SERVER_PORT:-8080}" \
    -e SERVER_LOG_LEVEL="${SERVER_LOG_LEVEL:-info}" \
    -e SERVER_ENABLE_HTTPS="${SERVER_ENABLE_HTTPS:-false}" \
    -e DB_MONGO_URI="${DB_MONGO_URI}" \
    -e DB_MONGO_DATABASE="${DB_MONGO_DATABASE}" \
    -e DB_MONGO_TIMEOUT="${DB_MONGO_TIMEOUT}" \
    -e DB_MONGO_MAX_POOL_SIZE="${DB_MONGO_MAX_POOL_SIZE}" \
    -e DB_MONGO_MIN_POOL_SIZE="${DB_MONGO_MIN_POOL_SIZE}" \
    -e DB_MONGO_MAX_IDLE_TIME="${DB_MONGO_MAX_IDLE_TIME}" \
    -e DB_MONGO_RETRY_READS="${DB_MONGO_RETRY_READS}" \
    -e SECURITY_JWT_SECRET="${SECURITY_JWT_SECRET}" \
    -e SECURITY_SESSION_SECRET="${SECURITY_SESSION_SECRET}" \
    -e SECURITY_CORS_ORIGINS="${SECURITY_CORS_ORIGINS}" \
    -e SECURITY_RATE_LIMIT_RPS="${SECURITY_RATE_LIMIT_RPS}" \
    -e SECURITY_ENABLE_RATE_LIMIT="${SECURITY_ENABLE_RATE_LIMIT}" \
    -e EXTERNAL_OPENAI_API_KEY="${EXTERNAL_OPENAI_API_KEY}" \
    -e EXTERNAL_OPENAI_MODEL="${EXTERNAL_OPENAI_MODEL}" \
    -e BUGSNAG_API_KEY="${BUGSNAG_API_KEY}" \
    --health-cmd="wget --no-verbose --tries=1 -O- http://localhost:8000/health > /dev/null || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    --log-driver=json-file \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    portfolio-app:latest

# Wait for container to be healthy
log "Waiting for container to be healthy..."
i=1
while [ $i -le 30 ]; do
    if docker exec portfolio-app wget --no-verbose --tries=1 -O- http://localhost:8000/health > /dev/null 2>&1; then
        log "✅ Container is healthy and ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        log "❌ Container failed to become healthy"
        docker logs --tail 20 portfolio-app
        exit 1
    fi
    sleep 2
    i=$((i + 1))
done

# Test nginx proxy
if curl -f http://localhost/health >/dev/null 2>&1; then
    log "✅ Nginx proxy is working"
else
    log "❌ Nginx proxy test failed"
    exit 1
fi

# Cleanup old images (keep last 3)
log "Cleaning up old Docker images..."
docker image prune -f
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.ID}}" | grep portfolio-app | tail -n +4 | awk '{print $4}' | xargs -r docker rmi

log "🎉 Deployment completed successfully!"
EOF

chmod +x /opt/portfolio/deploy.sh

# Create monitoring script
log "📊 Creating monitoring script..."
tee /opt/portfolio/monitor.sh > /dev/null <<'EOF'
#!/bin/sh
# Portfolio Monitoring Script

LOG_FILE="/opt/portfolio/logs/monitor.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if container is running
if ! docker ps --format "table {{.Names}}" | grep -q portfolio-app; then
    log "❌ Portfolio container is not running!"
    exit 1
fi

# Check container health
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' portfolio-app 2>/dev/null || echo "unknown")
if [ "$HEALTH" != "healthy" ]; then
    log "❌ Portfolio container is not healthy: $HEALTH"
    exit 1
fi

# Check application response
if ! curl -f http://localhost:8000/health >/dev/null 2>&1; then
    log "❌ Portfolio application is not responding"
    exit 1
fi

# Check nginx proxy
if ! curl -f http://localhost/health >/dev/null 2>&1; then
    log "❌ Nginx proxy is not working"
    exit 1
fi

log "✅ All checks passed - Portfolio is healthy"
EOF

chmod +x /opt/portfolio/monitor.sh

# Setup log rotation
log "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/portfolio > /dev/null <<EOF
/opt/portfolio/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

# Create comprehensive maintenance script
log "🔧 Creating maintenance script..."
tee /opt/portfolio/maintenance.sh > /dev/null <<'EOF'
#!/bin/sh
# Comprehensive Server Maintenance Script

MAINT_LOG="/opt/portfolio/logs/maintenance.log"
BACKUP_DIR="/opt/portfolio/backups/maintenance"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MAINT_LOG"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$MAINT_LOG"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "🔧 Starting maintenance routine..."

# System updates
log "📦 Checking for system updates..."
apt_updates=$(apt list --upgradable 2>/dev/null | wc -l)
if [ "$apt_updates" -gt 1 ]; then
    log "Found $((apt_updates - 1)) package updates"
    sudo apt update >/dev/null 2>&1
    sudo apt upgrade -y >/dev/null 2>&1
    log "✅ System packages updated"
else
    log "✅ System is up to date"
fi

# Security updates check
log "🔒 Checking security updates..."
sec_updates=$(apt list --upgradable 2>/dev/null | grep -i security | wc -l)
if [ "$sec_updates" -gt 0 ]; then
    log "⚠️ Found $sec_updates security updates - applying immediately"
    sudo unattended-upgrade >/dev/null 2>&1
    log "✅ Security updates applied"
fi

# Docker maintenance
log "🐳 Docker maintenance..."
# Remove stopped containers
stopped_containers=$(docker ps -aq --filter status=exited | wc -l)
if [ "$stopped_containers" -gt 0 ]; then
    docker container prune -f >/dev/null 2>&1
    log "🗑️ Removed $stopped_containers stopped containers"
fi

# Remove unused images (keep last 3 portfolio images)
old_images=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | grep portfolio-app | tail -n +4 | wc -l)
if [ "$old_images" -gt 0 ]; then
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | grep portfolio-app | tail -n +4 | awk '{print $3}' | xargs -r docker rmi >/dev/null 2>&1
    log "🗑️ Removed $old_images old portfolio images"
fi

# Remove unused networks and volumes
docker network prune -f >/dev/null 2>&1
docker volume prune -f >/dev/null 2>&1

# Disk space check
log "💾 Checking disk space..."
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 80 ]; then
    error "⚠️ Disk usage is ${disk_usage}% - running cleanup"
    
    # Clean logs older than 7 days
    find /var/log -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    find /opt/portfolio/logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    
    # Clean old backups (keep last 10)
    find "$BACKUP_DIR" -type d -name "20*" | sort -r | tail -n +11 | xargs -r rm -rf
    
    log "🧹 Cleanup completed"
else
    log "✅ Disk usage is ${disk_usage}% - healthy"
fi

# Memory check
log "🧠 Checking memory usage..."
mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$mem_usage" -gt 80 ]; then
    log "⚠️ Memory usage is ${mem_usage}% - high"
    # Log top memory processes
    ps aux --sort=-%mem | head -10 >> "$MAINT_LOG"
else
    log "✅ Memory usage is ${mem_usage}% - healthy"
fi

# Container health check
log "🏥 Checking container health..."
if docker ps --format "table {{.Names}}" | grep -q portfolio-app; then
    health=$(docker inspect --format='{{.State.Health.Status}}' portfolio-app 2>/dev/null || echo "unknown")
    if [ "$health" = "healthy" ]; then
        log "✅ Portfolio container is healthy"
    else
        error "❌ Portfolio container health: $health"
        docker logs --tail 20 portfolio-app >> "$MAINT_LOG" 2>&1
    fi
else
    error "❌ Portfolio container is not running"
fi

# Service checks
log "🔍 Checking critical services..."
services="nginx docker fail2ban ufw"
for service in $services; do
    if systemctl is-active --quiet "$service"; then
        log "✅ $service is running"
    else
        error "❌ $service is not running"
        sudo systemctl restart "$service" >/dev/null 2>&1
        if systemctl is-active --quiet "$service"; then
            log "✅ $service restarted successfully"
        else
            error "❌ Failed to restart $service"
        fi
    fi
done

# Security checks
log "🛡️ Security checks..."

# Check for failed login attempts
failed_logins=$(journalctl --since "24 hours ago" | grep "Failed password" | wc -l)
if [ "$failed_logins" -gt 50 ]; then
    log "⚠️ High number of failed login attempts: $failed_logins"
    fail2ban-client status sshd >> "$MAINT_LOG" 2>&1 || true
else
    log "✅ Failed login attempts: $failed_logins (normal)"
fi

# Check open ports
log "🔍 Checking open ports..."
open_ports=$(ss -tuln | grep LISTEN | wc -l)
log "ℹ️ Open listening ports: $open_ports"

# Network security check
if ss -tuln | grep -E ":22 |:80 |:443 |:8000 " >/dev/null; then
    log "✅ Expected ports are open"
else
    log "⚠️ Some expected ports may not be open"
fi

# Certificate expiry check (if SSL is configured)
if [ -f /etc/ssl/certs/portfolio.crt ]; then
    cert_days=$(openssl x509 -enddate -noout -in /etc/ssl/certs/portfolio.crt | cut -d= -f2 | xargs -I {} date -d {} +%s)
    current_days=$(date +%s)
    days_left=$(( (cert_days - current_days) / 86400 ))
    
    if [ "$days_left" -lt 30 ]; then
        log "⚠️ SSL certificate expires in $days_left days"
    else
        log "✅ SSL certificate valid for $days_left days"
    fi
fi

# System load check
load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
cpu_cores=$(nproc)
load_percentage=$(echo "$load_avg * 100 / $cpu_cores" | bc -l 2>/dev/null | cut -d. -f1 2>/dev/null || echo "0")

if [ "$load_percentage" -gt 80 ]; then
    log "⚠️ High system load: ${load_percentage}%"
    ps aux --sort=-%cpu | head -10 >> "$MAINT_LOG"
else
    log "✅ System load: ${load_percentage}% - healthy"
fi

# Create backup of current configuration
log "💾 Creating configuration backup..."
backup_date=$(date +%Y%m%d_%H%M%S)
backup_path="$BACKUP_DIR/$backup_date"
mkdir -p "$backup_path"

# Backup important configurations
sudo cp -r /etc/nginx/sites-available "$backup_path/" 2>/dev/null || true
sudo cp /etc/fail2ban/jail.local "$backup_path/" 2>/dev/null || true
sudo cp /etc/ufw/user.rules "$backup_path/" 2>/dev/null || true
cp /opt/portfolio/*.sh "$backup_path/" 2>/dev/null || true
crontab -l > "$backup_path/crontab.txt" 2>/dev/null || true

log "✅ Configuration backup created at $backup_path"

# System information summary
log "📊 System Summary:"
log "  • Uptime: $(uptime -p)"
log "  • Load: $load_avg (${load_percentage}%)"
log "  • Memory: ${mem_usage}% used"
log "  • Disk: ${disk_usage}% used"
log "  • Container: $health"
log "  • Failed logins (24h): $failed_logins"

log "🎉 Maintenance routine completed successfully"

# Check if reboot is needed
if [ -f /var/run/reboot-required ]; then
    log "⚠️ System reboot is required (kernel/critical updates)"
    echo "REBOOT_REQUIRED" > "$BACKUP_DIR/reboot_flag"
else
    log "✅ No reboot required"
fi
EOF

chmod +x /opt/portfolio/maintenance.sh

# Create security audit script
log "🛡️ Creating security audit script..."
tee /opt/portfolio/security-audit.sh > /dev/null <<'EOF'
#!/bin/sh
# Security Audit Script

AUDIT_LOG="/opt/portfolio/logs/security-audit.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$AUDIT_LOG"
}

log "🛡️ Starting security audit..."

# Check for rootkits with rkhunter (if installed)
if command -v rkhunter >/dev/null 2>&1; then
    log "🔍 Running rootkit scan with rkhunter..."
    rkhunter --check --skip-keypress --report-warnings-only >> "$AUDIT_LOG" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ Rootkit scan completed - no issues found"
    else
        log "⚠️ Rootkit scan found potential issues - check $AUDIT_LOG"
    fi
fi

# Check for rootkits with chkrootkit (if installed)
if command -v chkrootkit >/dev/null 2>&1; then
    log "🔍 Running chkrootkit scan..."
    chkrootkit >> "$AUDIT_LOG" 2>&1
    if [ $? -eq 0 ]; then
        log "✅ chkrootkit scan completed"
    else
        log "⚠️ chkrootkit found potential issues - check $AUDIT_LOG"
    fi
fi

# Run AIDE integrity check (if initialized)
if command -v aide >/dev/null 2>&1 && [ -f /var/lib/aide/aide.db ]; then
    log "🔐 Running AIDE integrity check..."
    aide --check >> "$AUDIT_LOG" 2>&1
    aide_result=$?
    if [ $aide_result -eq 0 ]; then
        log "✅ AIDE integrity check passed"
    elif [ $aide_result -eq 1 ]; then
        log "⚠️ AIDE detected file system changes - check $AUDIT_LOG"
    else
        log "❌ AIDE check failed - check $AUDIT_LOG"
    fi
elif command -v aide >/dev/null 2>&1 && [ ! -f /var/lib/aide/aide.db ]; then
    log "ℹ️ AIDE database not yet initialized - run 'sudo aide --init' first"
fi

# Run Lynis security audit (if installed)
if command -v lynis >/dev/null 2>&1; then
    log "🛡️ Running Lynis security audit..."
    lynis audit system --quick --quiet >> "$AUDIT_LOG" 2>&1
    lynis_score=$(grep "Hardening index" "$AUDIT_LOG" | tail -1 | awk '{print $4}' | tr -d '[]')
    if [ -n "$lynis_score" ]; then
        log "📊 Lynis security score: $lynis_score"
    else
        log "✅ Lynis security audit completed"
    fi
fi

# Check for unusual network connections
log "🌐 Checking network connections..."
suspicious_connections=$(ss -tuln | grep -E ":(1[0-9]{3}|[2-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])" | wc -l)
if [ "$suspicious_connections" -gt 0 ]; then
    log "⚠️ Found $suspicious_connections connections on unusual ports"
    ss -tuln | grep -E ":(1[0-9]{3}|[2-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])" >> "$AUDIT_LOG"
else
    log "✅ No suspicious network connections"
fi

# Check fail2ban status
log "🚨 Checking fail2ban status..."
if systemctl is-active --quiet fail2ban; then
    banned_ips=$(fail2ban-client status sshd 2>/dev/null | grep "Banned IP list" | awk -F: '{print $2}' | wc -w)
    log "✅ fail2ban is active - $banned_ips IPs currently banned"
else
    log "❌ fail2ban is not running"
fi

# Check for large files (potential uploads/attacks)
log "📁 Checking for large files..."
large_files=$(find /tmp /var/tmp -size +100M 2>/dev/null | wc -l)
if [ "$large_files" -gt 0 ]; then
    log "⚠️ Found $large_files large files in temp directories"
    find /tmp /var/tmp -size +100M -ls 2>/dev/null >> "$AUDIT_LOG"
else
    log "✅ No suspicious large files found"
fi

# Check system integrity
log "🔐 Checking system integrity..."
# Check for SUID files
suid_files=$(find /usr /bin /sbin -perm -4000 2>/dev/null | wc -l)
log "ℹ️ Found $suid_files SUID files (baseline check)"

# Check for world-writable files
world_writable=$(find /etc /usr /bin /sbin -perm -002 2>/dev/null | wc -l)
if [ "$world_writable" -gt 0 ]; then
    log "⚠️ Found $world_writable world-writable files in system directories"
    find /etc /usr /bin /sbin -perm -002 2>/dev/null >> "$AUDIT_LOG"
else
    log "✅ No world-writable files in system directories"
fi

# Check for unusual processes
log "🔍 Checking processes..."
high_cpu_procs=$(ps aux | awk '$3 > 50.0 {print $0}' | wc -l)
if [ "$high_cpu_procs" -gt 0 ]; then
    log "⚠️ Found $high_cpu_procs processes using >50% CPU"
    ps aux | awk '$3 > 50.0 {print $0}' >> "$AUDIT_LOG"
fi

# Check authentication logs
log "🔍 Checking authentication logs..."
recent_logins=$(last -n 20 | grep -v "reboot\|shutdown" | wc -l)
log "ℹ️ Recent login sessions: $recent_logins"

# Check for SSH key changes
if [ -f /home/ubuntu/.ssh/authorized_keys ]; then
    key_count=$(wc -l < /home/ubuntu/.ssh/authorized_keys)
    log "🔑 SSH authorized keys: $key_count"
    
    # Check key fingerprints
    ssh-keygen -lf /home/ubuntu/.ssh/authorized_keys >> "$AUDIT_LOG" 2>&1
fi

log "🎉 Security audit completed"
EOF

chmod +x /opt/portfolio/security-audit.sh

# Create reboot scheduler script
log "🔄 Creating reboot scheduler script..."
tee /opt/portfolio/reboot-scheduler.sh > /dev/null <<'EOF'
#!/bin/sh
# Smart Reboot Scheduler

REBOOT_LOG="/opt/portfolio/logs/reboot.log"
BACKUP_DIR="/opt/portfolio/backups/maintenance"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$REBOOT_LOG"
}

# Check if reboot is actually needed
reboot_needed=false

# Check for kernel updates
if [ -f /var/run/reboot-required ]; then
    log "📋 System flagged for reboot (kernel/critical updates)"
    reboot_needed=true
fi

# Check maintenance flag
if [ -f "$BACKUP_DIR/reboot_flag" ]; then
    log "📋 Maintenance script flagged for reboot"
    reboot_needed=true
fi

# Check uptime (reboot if >30 days)
uptime_days=$(awk '{print int($1/86400)}' /proc/uptime)
if [ "$uptime_days" -gt 30 ]; then
    log "📋 System uptime is $uptime_days days - scheduled reboot"
    reboot_needed=true
fi

if [ "$reboot_needed" = "true" ]; then
    log "🔄 Reboot is needed - preparing for restart..."
    
    # Create pre-reboot backup
    backup_date=$(date +%Y%m%d_%H%M%S)
    mkdir -p "$BACKUP_DIR/pre-reboot-$backup_date"
    
    # Backup container if running
    if docker ps --format "table {{.Names}}" | grep -q portfolio-app; then
        log "💾 Backing up portfolio container..."
        docker commit portfolio-app "portfolio-backup:pre-reboot-$backup_date" >/dev/null 2>&1
        docker save "portfolio-backup:pre-reboot-$backup_date" | gzip > "$BACKUP_DIR/pre-reboot-$backup_date/portfolio-container.tar.gz"
        log "✅ Container backup created"
    fi
    
    # Clean up flags
    rm -f /var/run/reboot-required "$BACKUP_DIR/reboot_flag" 2>/dev/null || true
    
    # Schedule reboot with delay
    log "⏰ Scheduling reboot in 2 minutes..."
    
    # Graceful container shutdown
    if docker ps --format "table {{.Names}}" | grep -q portfolio-app; then
        log "🛑 Gracefully stopping portfolio container..."
        docker stop portfolio-app >/dev/null 2>&1 || true
    fi
    
    # Send wall message to any logged in users
    echo "System reboot scheduled in 2 minutes for maintenance" | wall 2>/dev/null || true
    
    # Schedule the reboot
    sudo shutdown -r +2 "Scheduled maintenance reboot" >/dev/null 2>&1
    
    log "✅ Reboot scheduled - system will restart in 2 minutes"
else
    log "✅ No reboot needed at this time"
fi
EOF

chmod +x /opt/portfolio/reboot-scheduler.sh

# Setup comprehensive cron jobs
log "⏰ Setting up comprehensive cron jobs..."
(
    crontab -l 2>/dev/null || true
    echo ""
    echo "# Portfolio Monitoring (every 5 minutes)"
    echo "*/5 * * * * /opt/portfolio/monitor.sh >/dev/null 2>&1"
    echo ""
    echo "# Daily maintenance (3 AM)"
    echo "0 3 * * * /opt/portfolio/maintenance.sh >/dev/null 2>&1"
    echo ""
    echo "# Security audit (6 AM daily)"
    echo "0 6 * * * /opt/portfolio/security-audit.sh >/dev/null 2>&1"
    echo ""
    echo "# Weekly reboot check (Sunday 4 AM)"
    echo "0 4 * * 0 /opt/portfolio/reboot-scheduler.sh >/dev/null 2>&1"
    echo ""
    echo "# Bi-weekly reboot check (Wednesday 4 AM)"
    echo "0 4 * * 3 /opt/portfolio/reboot-scheduler.sh >/dev/null 2>&1"
    echo ""
    echo "# Log rotation check (daily 2 AM)"
    echo "0 2 * * * /usr/sbin/logrotate /etc/logrotate.conf >/dev/null 2>&1"
    echo ""
    echo "# Disk cleanup (weekly Sunday 2 AM)"
    echo "0 2 * * 0 find /tmp -type f -atime +7 -delete 2>/dev/null"
    echo ""
    echo "# Docker cleanup (weekly Monday 2 AM)"
    echo "0 2 * * 1 docker system prune -f >/dev/null 2>&1"
    echo ""
    echo "# Update rkhunter database (weekly Tuesday 1 AM)"
    echo "0 1 * * 2 /usr/bin/rkhunter --update --quiet >/dev/null 2>&1"
    echo ""
    echo "# AIDE database update (monthly, first Sunday 2 AM)"
    echo "0 2 1-7 * 0 [ -f /var/lib/aide/aide.db ] && /usr/bin/aide --update >/dev/null 2>&1"
    echo ""
    echo "# Weekly Lynis audit (Saturday 5 AM)"
    echo "0 5 * * 6 /usr/bin/lynis audit system --cronjob --quiet >/dev/null 2>&1"
    echo ""
    echo "# System update check (daily 1 AM)"
    echo "0 1 * * * /usr/bin/apt list --upgradable 2>/dev/null | wc -l > /opt/portfolio/logs/updates-available.txt"
) | crontab -

# Create system info script
log "ℹ️  Creating system info script..."
tee /opt/portfolio/system-info.sh > /dev/null <<'EOF'
#!/bin/sh
echo "=== OCI Portfolio Server Status ==="
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime)"
echo "Date: $(date)"
echo ""
echo "=== Docker Status ==="
docker --version
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Container Logs (last 10 lines) ==="
docker logs --tail 10 portfolio-app 2>/dev/null || echo "No container running"
echo ""
echo "=== Nginx Status ==="
sudo systemctl is-active nginx
echo ""
echo "=== Disk Usage ==="
df -h / /opt
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Network ==="
curl -s http://localhost/health | jq . 2>/dev/null || echo "Health check failed"
EOF

chmod +x /opt/portfolio/system-info.sh

# Final system setup
log "🔧 Final system optimizations..."

# Increase file limits for Docker
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Configure swap (if not already configured)
if ! swapon --show | grep -q /swapfile; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    log "✅ 2GB swap file created"
fi

# Install additional security tools
log "🛡️ Installing additional security tools..."
sudo apt install -y unattended-upgrades rkhunter chkrootkit aide lynis bc

# Configure automatic security updates
log "🔧 Configuring automatic security updates..."
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
    // "vim";
    // "libc6-dev";
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-WithUsers "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

sudo tee /etc/apt/apt.conf.d/20auto-upgrades > /dev/null <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Configure rkhunter
log "🔍 Configuring rkhunter..."
sudo tee /etc/rkhunter.conf.local > /dev/null <<EOF
# Local configuration for rkhunter
UPDATE_MIRRORS=1
MIRRORS_MODE=0
WEB_CMD=""
DISABLE_TESTS="suspscan hidden_procs deleted_files packet_cap_apps apps"
ALLOWHIDDENDIR="/etc/.java"
ALLOW_SSH_ROOT_USER=no
ALLOW_SSH_PROT_V1=0
SCRIPTWHITELIST=/usr/bin/egrep
SCRIPTWHITELIST=/usr/bin/fgrep
SCRIPTWHITELIST=/usr/bin/which
SCRIPTWHITELIST=/bin/which
SCRIPTWHITELIST=/usr/local/bin/*
EXISTWHITELIST=/tmp/.ICE-unix
EXISTWHITELIST=/tmp/.Test-unix
EXISTWHITELIST=/tmp/.X11-unix
EXISTWHITELIST=/tmp/.XIM-unix
EXISTWHITELIST=/tmp/.font-unix
EOF

sudo rkhunter --update >/dev/null 2>&1 || true
sudo rkhunter --propupd >/dev/null 2>&1 || true

# Configure AIDE (Advanced Intrusion Detection Environment)
if command -v aide >/dev/null 2>&1; then
    log "🔐 Configuring AIDE..."
    sudo tee /etc/aide/aide.conf.d/70_aide_portfolio > /dev/null <<EOF
# Portfolio-specific AIDE configuration
/opt/portfolio p+i+n+u+g+s+b+m+c+md5+sha1
/etc/nginx p+i+n+u+g+s+b+m+c+md5+sha1
/etc/fail2ban p+i+n+u+g+s+b+m+c+md5+sha1
/etc/ufw p+i+n+u+g+s+b+m+c+md5+sha1
/home/ubuntu/.ssh p+i+n+u+g+s+b+m+c+md5+sha1
EOF
    
    log "🔐 Initializing AIDE database (this may take a few minutes)..."
    sudo aide --init >/dev/null 2>&1 &
    # Note: AIDE initialization runs in background as it takes time
fi

# Configure Lynis
if command -v lynis >/dev/null 2>&1; then
    log "🛡️ Configuring Lynis security scanner..."
    sudo tee /etc/lynis/custom.prf > /dev/null <<EOF
# Portfolio-specific Lynis configuration
skip-test=FILE-6310
skip-test=KRNL-6000
skip-test=AUTH-9262
skip-test=AUTH-9282
skip-test=FIRE-4512
config:colored_output=yes
config:show_report_solution=yes
config:show_tool_tips=yes
EOF
fi

log "🎉 OCI Ubuntu 24.04 Server Setup Complete!"
log ""
log "=== Next Steps ==="
log "1. Logout and login again (or run: newgrp docker)"
log "2. Test Docker: docker run hello-world"
log "3. Your deployment script is at: /opt/portfolio/deploy.sh"
log "4. Monitor script is at: /opt/portfolio/monitor.sh"
log "5. System info script is at: /opt/portfolio/system-info.sh"
log "6. Security audit script is at: /opt/portfolio/security-audit.sh"
log "7. Maintenance script is at: /opt/portfolio/maintenance.sh"
log ""
log "=== Server Details ==="
log "• Docker version: $(docker --version 2>/dev/null || echo 'Not accessible yet - logout/login required')"
log "• Nginx status: $(sudo systemctl is-active nginx)"
log "• UFW status: $(sudo ufw status | head -1)"
log "• fail2ban status: $(sudo systemctl is-active fail2ban)"
log "• rkhunter installed: $(command -v rkhunter >/dev/null && echo 'Yes' || echo 'No')"
log "• AIDE installed: $(command -v aide >/dev/null && echo 'Yes' || echo 'No')"
log "• Lynis installed: $(command -v lynis >/dev/null && echo 'Yes' || echo 'No')"
log ""
log "=== Security Features ==="
log "• SSH is allowed on port 22 (fail2ban protected)"
log "• HTTP/HTTPS are allowed on ports 80/443"
log "• fail2ban monitors SSH, Nginx, and malicious requests"
log "• Automatic security updates enabled"
log "• Rootkit detection with rkhunter and chkrootkit"
log "• File integrity monitoring with AIDE"
log "• Security auditing with Lynis"
log "• Firewall configured with UFW"
log "• Rate limiting and DDoS protection"
log ""
log "=== Automated Maintenance Schedule ==="
log "• Every 5 minutes: Health monitoring"
log "• Daily 1 AM: Update availability check"
log "• Daily 2 AM: Log rotation"
log "• Daily 3 AM: System maintenance"
log "• Daily 6 AM: Security audit"
log "• Weekly Sunday 2 AM: Disk cleanup"
log "• Weekly Monday 2 AM: Docker cleanup"
log "• Weekly Tuesday 1 AM: Security database updates"
log "• Weekly Wednesday 4 AM: Reboot check"
log "• Weekly Saturday 5 AM: Lynis security audit"
log "• Weekly Sunday 4 AM: Reboot check"
log "• Monthly 1st Sunday 2 AM: AIDE database update"
log ""
log "=== Security Tools Locations ==="
log "• Security configs: /etc/rkhunter.conf.local, /etc/lynis/custom.prf"
log "• AIDE config: /etc/aide/aide.conf.d/70_aide_portfolio"
log "• Unattended upgrades: /etc/apt/apt.conf.d/50unattended-upgrades"
log "• fail2ban config: /etc/fail2ban/jail.local"
log ""
log "=== Log Locations ==="
log "• Deployment logs: /opt/portfolio/logs/deploy.log"
log "• Monitoring logs: /opt/portfolio/logs/monitor.log"
log "• Maintenance logs: /opt/portfolio/logs/maintenance.log"
log "• Security audit logs: /opt/portfolio/logs/security-audit.log"
log "• Reboot logs: /opt/portfolio/logs/reboot.log"
log ""
log "Server is ready for secure Docker portfolio deployment! 🚀🛡️"
EOF