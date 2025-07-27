# Deployment Session Summary - July 27, 2025

## What We Accomplished Tonight 🎉

### 1. Fixed CircleCI Deployment Pipeline
- Fixed `docker/save-image` command error by using standard Docker commands
- Updated Docker orb usage to avoid deprecated commands
- Fixed Cargo.lock v4 compatibility by upgrading Rust to 1.83
- Fixed WASM build issues by using pre-built files instead of building in Docker
- Fixed Docker health checks and network configuration

### 2. Server Infrastructure
- **Old server**: 129.153.229.28 (had iptables issues, abandoned)
- **New server**: 129.80.170.232 (Ubuntu Server, working!)
- SSH fingerprint: `SHA256:ge50UMA30q/hgTEUuAKltaEcXJO3WXliuqFvNnpTdlw`

### 3. Key Fixes Applied
- **Docker build fix**: Removed `static/wasm/` from `.dockerignore`
- **Memory optimization**: Reduced Tokio threads from 2 to 1 for 1GB RAM
- **Static assets fix**: Added missing files (images, manifest.json, sw.js) to Dockerfile
- **OCI firewall**: Opened all protocols (can tighten later to just port 80/443)
- **UFW disabled**: To avoid conflicts (can re-enable with proper rules later)

### 4. Automated Server Management
```bash
# Auto-updates enabled
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Weekly reboot (Sunday 4 AM)
sudo crontab -e
# Added: 0 4 * * 0 /sbin/reboot

# Docker cleanup (Sunday 3 AM)  
# Added: 0 3 * * 0 docker system prune -af
```

### 5. Domain Configuration
- Domain: dav88.dev
- Cloudflare setup:
  - A record pointing to 129.80.170.232
  - SSL/TLS set to "Flexible"
  - Proxy enabled (orange cloud)
  - Site accessible at https://dav88.dev

## Current Status
- ✅ Site is live and accessible
- ✅ HTTPS working through Cloudflare
- ✅ Container auto-restarts on failure
- ✅ Server auto-updates security patches
- ⚠️ Some static assets (logo, favicons) showing 404 - fix deployed, waiting for CircleCI

## Useful Commands

### Check deployment status
```bash
# SSH to server
ssh -i ssh-key-real.key ubuntu@129.80.170.232

# Check container
docker ps
docker logs portfolio

# Test locally
curl http://localhost/health
```

### Manual deployment (if needed)
```bash
# Pull latest image
docker pull portfolio:latest

# Restart container
docker stop portfolio
docker rm portfolio
docker run -d \
  --name portfolio \
  --restart always \
  -p 80:8000 \
  -e RUST_LOG=info \
  portfolio:latest
```

## Configuration Files Updated
1. `.circleci/config.yml` - New server IP and SSH key
2. `Dockerfile` - Memory optimization and static files fix
3. `.dockerignore` - Removed static/wasm exclusion
4. `setup-new-server.sh` - Quick server setup script

## Lessons Learned
- OCI minimal images lack basic tools (netstat, ufw)
- OCI iptables rules can be tricky - order matters!
- Cloudflare "Flexible" SSL is easiest for HTTP-only servers
- Docker health checks need proper timeout configuration
- Always test external access, not just localhost

## Tomorrow's Optional Tasks
- [ ] Tighten OCI security rules (just allow 80/443)
- [ ] Re-enable UFW with proper rules
- [ ] Add `full-wasm-skills.js` to Vite build pipeline
- [ ] Set up proper SSL certificate on server (Let's Encrypt)
- [ ] Consider GitHub Actions instead of CircleCI (more free minutes)

## Total Time: ~10 hours overnight
## Result: Site successfully deployed! 🚀

Get some sleep - you've earned it! The server will take care of itself.