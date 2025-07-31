# Production Deployment Guide

**Date**: January 31, 2025  
**Target**: 1GB VPS (Ubuntu 22.04+)  
**Architecture**: Nginx + Go Binary (Bare Metal)

## 🎯 Why This Architecture?

### Bare Metal over Docker
- **25% better performance** than containerized
- **Saves 100-200MB RAM** (no Docker daemon)
- Go binaries are already self-contained
- Perfect for resource-constrained VPS

### Nginx over OpenResty
- **Lighter memory footprint** (crucial for 1GB VPS)
- **Simpler configuration** (no Lua complexity)
- **Battle-tested** with Go applications
- All features we need without overhead

## 📋 Pre-Deployment Checklist

1. **Local Build**
   ```bash
   # Build for Linux AMD64
   GOOS=linux GOARCH=amd64 go build -o portfolio-server .
   
   # Build static files
   cd frontend && npm run build && cd ..
   ```

2. **Prepare Files**
   - `portfolio-server` - Compiled Go binary
   - `static/` - All static files from frontend build
   - `.env` - Production environment variables

3. **Domain Setup**
   - Point A record to VPS IP
   - Add www CNAME record

## 🚀 Deployment Steps

### 1. Initial Server Setup
```bash
# Run on fresh VPS
wget https://raw.githubusercontent.com/dav88dev/myWebsite/main/scripts/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 2. Upload Application
```bash
# From local machine
scp portfolio-server root@YOUR_VPS_IP:/var/www/portfolio/portfolio-server.new
scp -r static root@YOUR_VPS_IP:/var/www/portfolio/static.new
scp .env root@YOUR_VPS_IP:/var/www/portfolio/.env
```

### 3. Set Permissions
```bash
# On VPS
cd /var/www/portfolio
sudo chown -R portfolio:portfolio .
sudo chmod 600 .env
```

### 4. Deploy
```bash
sudo -u portfolio ./deploy.sh
```

### 5. Setup SSL
```bash
sudo certbot --nginx -d dav88.dev -d www.dav88.dev
```

## 🔧 Production Optimizations

### Go Application
1. **Environment Variables**
   ```bash
   SERVER_ENV=production
   GIN_MODE=release
   GOGC=50  # More aggressive GC for low memory
   GOMEMLIMIT=750MiB  # Leave room for system
   ```

2. **Binary Optimizations**
   ```bash
   # Build with optimizations
   go build -ldflags="-s -w" -o portfolio-server .
   # Reduces binary size by ~30%
   ```

### Nginx Optimizations
- HTTP/2 enabled
- Gzip compression
- Static file caching (1 year)
- Rate limiting configured
- Connection keepalive

### System Optimizations
- Swap set to 10 (prefer RAM)
- Increased file descriptors
- TCP optimizations for web traffic
- VFS cache pressure reduced

## 📊 Resource Usage Expectations

### Memory Breakdown (1GB VPS)
- **System + Services**: ~200MB
- **Nginx**: ~50MB
- **Go Application**: ~100-200MB
- **MongoDB Connection Pool**: ~50MB
- **Buffer/Cache**: ~400MB
- **Free**: ~200MB headroom

### Performance Targets
- **Response Time**: <50ms (API)
- **Static Files**: <10ms (cached)
- **Concurrent Users**: 500-1000
- **Requests/sec**: 1000+ (cached)

## 🛡️ Security Features

1. **Network Security**
   - UFW firewall (only 22, 80, 443)
   - Fail2ban for brute force protection
   - Rate limiting at Nginx level

2. **Application Security**
   - No Docker attack surface
   - Runs as non-root user
   - Supervisor for process isolation
   - Secure headers from Nginx

3. **SSL/TLS**
   - Let's Encrypt auto-renewal
   - TLS 1.2+ only
   - Strong cipher suites
   - HSTS enabled

## 🔍 Monitoring

### Health Checks
```bash
# External
curl https://dav88.dev/health

# Internal
curl http://localhost:8080/health/detailed
```

### Logs
- Application: `/var/log/portfolio/`
- Nginx: `/var/log/nginx/`
- System: `journalctl -u nginx`

### Resource Monitoring
```bash
# Real-time monitoring
htop

# Check memory
free -h

# Check disk
df -h

# Check Go app
sudo supervisorctl status portfolio
```

## 🚨 Troubleshooting

### High Memory Usage
1. Check for memory leaks: `/health/detailed`
2. Restart app: `sudo supervisorctl restart portfolio`
3. Reduce GOMEMLIMIT if needed

### High CPU
1. Check access logs for abuse
2. Verify rate limiting is working
3. Check for infinite loops in logs

### App Won't Start
1. Check logs: `tail -f /var/log/portfolio/error.log`
2. Verify .env file exists and readable
3. Check MongoDB connection

## 🔄 Rollback Procedure

Automatic rollback on failed health check:
```bash
# Manual rollback if needed
cd /var/www/portfolio/backups
cp portfolio-server_TIMESTAMP ../portfolio-server
sudo supervisorctl restart portfolio
```

## 📈 Scaling Options

When you outgrow 1GB VPS:
1. **Vertical**: Upgrade to 2GB VPS
2. **Horizontal**: Add Nginx load balancing
3. **CDN**: CloudFlare for static assets
4. **Database**: MongoDB Atlas autoscaling

## 🎯 Performance Tips

1. **Enable HTTP/2 Push** for critical assets
2. **Use Brotli compression** (better than gzip)
3. **Implement Redis** for session/cache
4. **CDN for images** to reduce bandwidth

## 📝 Maintenance

### Weekly
- Check logs for errors
- Monitor disk space
- Review Bugsnag errors

### Monthly
- Update system packages
- Review resource usage trends
- Backup database

### Quarterly
- Update Go dependencies
- Security audit
- Performance review

## 🚀 Quick Commands

```bash
# Deploy new version
sudo -u portfolio ./deploy.sh

# View logs
tail -f /var/log/portfolio/access.log

# Restart app
sudo supervisorctl restart portfolio

# Check status
sudo supervisorctl status
sudo systemctl status nginx

# Monitor resources
htop
```

## ✅ Success Metrics

- [ ] Site loads in <2s globally
- [ ] 99.9% uptime
- [ ] <100ms API response time
- [ ] Memory usage <80%
- [ ] Zero security incidents

---

This guide provides everything needed for a successful production deployment on a 1GB VPS with optimal performance and security.