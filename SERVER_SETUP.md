# OCI Server Setup Guide

This guide helps you set up a fresh Ubuntu 24.04 minimal server on Oracle Cloud Infrastructure (OCI) for Docker portfolio deployment.

## 🚀 Quick Setup

### 1. Run the Setup Script

SSH into your new OCI server and run:

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/yourrepo/main/scripts/oci-server-setup.sh | bash

# Or if you have the repo cloned:
chmod +x scripts/oci-server-setup.sh
./scripts/oci-server-setup.sh
```

### 2. Logout and Login

After the script completes, logout and login again to apply Docker group permissions:

```bash
logout
# SSH back in
ssh ubuntu@your-server-ip
```

### 3. Test Docker

```bash
docker run hello-world
```

## 📋 What the Script Does

### System Updates & Packages
- Updates Ubuntu 24.04 to latest packages
- Installs essential tools (curl, wget, git, htop, etc.)
- Configures automatic security updates

### Docker Installation
- Installs latest Docker CE with BuildKit support
- Adds ubuntu user to docker group
- Configures Docker daemon for production use
- Enables Docker service auto-start

### Nginx Setup
- Installs and configures Nginx as reverse proxy
- Sets up portfolio-specific configuration
- Enables gzip compression
- Configures security headers
- Sets up WASM MIME type support

### Security Configuration
- Configures UFW firewall (allows SSH, HTTP, HTTPS)
- Sets up fail2ban for intrusion prevention
- Monitors SSH and Nginx logs
- Blocks malicious IPs automatically

### Deployment Infrastructure
- Creates `/opt/portfolio/` deployment directory
- Sets up deployment script (`/opt/portfolio/deploy.sh`)
- Creates monitoring script (`/opt/portfolio/monitor.sh`)
- Configures log rotation
- Sets up automated health checks (cron)

### System Optimization
- Increases file limits for Docker
- Creates 2GB swap file if needed
- Optimizes for container workloads

## 🛠️ Server Management Commands

### Check Portfolio Status
```bash
/opt/portfolio/system-info.sh
```

### Manual Deployment
```bash
# If you have a Docker image file
docker load < /tmp/portfolio-app.tar.gz
/opt/portfolio/deploy.sh
```

### View Logs
```bash
# Container logs
docker logs portfolio-app

# Deployment logs
tail -f /opt/portfolio/logs/deploy.log

# Monitoring logs
tail -f /opt/portfolio/logs/monitor.log
```

### Check Services
```bash
# Docker status
docker ps
docker images

# Nginx status
sudo systemctl status nginx

# Firewall status
sudo ufw status

# fail2ban status
sudo fail2ban-client status
```

## 🔧 Manual Configuration

### Update Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/portfolio
sudo nginx -t
sudo systemctl reload nginx
```

### Update Firewall Rules
```bash
# Allow new port
sudo ufw allow 3000/tcp

# Remove rule
sudo ufw delete allow 3000/tcp

# Check status
sudo ufw status numbered
```

### Docker Maintenance
```bash
# Clean up old images
docker image prune -f

# Clean up containers
docker container prune -f

# Full cleanup
docker system prune -af
```

## 🌐 Network Configuration

The setup configures:
- **Port 22**: SSH (secured with fail2ban)
- **Port 80**: HTTP (Nginx proxy to Docker container)
- **Port 443**: HTTPS (ready for SSL certificates)
- **Port 8000**: Docker container (localhost only)

## 📊 Monitoring

### Automated Monitoring
- Health checks run every 5 minutes via cron
- Logs are rotated daily (kept for 7 days)
- Docker container has built-in health checks
- fail2ban monitors for intrusion attempts

### Manual Health Check
```bash
# Quick health check
curl http://localhost/health

# Full system check
/opt/portfolio/system-info.sh

# Monitor in real-time
/opt/portfolio/monitor.sh
```

## 🔒 Security Features

### Firewall (UFW)
- Default deny incoming
- Allow SSH, HTTP, HTTPS only
- Rate limiting enabled

### fail2ban
- Monitors SSH brute force attempts
- Blocks malicious Nginx requests
- Configurable ban times and thresholds

### Docker Security
- Non-root user in containers
- Resource limits configured
- Log rotation to prevent disk filling
- Health checks for automatic recovery

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check Docker logs
docker logs portfolio-app

# Check system resources
df -h
free -h

# Restart Docker service
sudo systemctl restart docker
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Port Issues
```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000

# Check UFW rules
sudo ufw status numbered
```

### SSH Access Issues
```bash
# Check fail2ban
sudo fail2ban-client status sshd

# Unban IP if needed
sudo fail2ban-client set sshd unbanip YOUR_IP
```

## 📝 File Locations

- **Deployment**: `/opt/portfolio/`
- **Scripts**: `/opt/portfolio/*.sh`
- **Logs**: `/opt/portfolio/logs/`
- **Backups**: `/opt/portfolio/backups/`
- **Nginx Config**: `/etc/nginx/sites-available/portfolio`
- **Docker Config**: `/etc/docker/daemon.json`
- **UFW Rules**: `/etc/ufw/`
- **fail2ban Config**: `/etc/fail2ban/jail.local`

## 🎯 Next Steps

After server setup:

1. **Test the setup**: Verify all services are running
2. **Configure CircleCI**: Update deployment keys and server IP
3. **Set up SSL**: Add Let's Encrypt certificates (optional)
4. **Configure monitoring**: Set up external monitoring if needed
5. **Create backups**: Set up automated backups (optional)

Your server is now ready for automated Docker portfolio deployment via CircleCI! 🚀