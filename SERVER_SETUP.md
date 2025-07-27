# 🖥️ Production Server Setup Guide

This guide covers setting up an Ubuntu 24.04 minimal server for hosting the Rust portfolio website.

## 📋 Prerequisites

- Ubuntu 24.04 LTS (minimal installation)
- Root or sudo access
- Server IP: 129.153.229.28
- Open ports: 22 (SSH), 80 (HTTP)

## 🚀 Quick Setup

1. **SSH into your server:**
   ```bash
   ssh ubuntu@129.153.229.28
   ```

2. **Download and run the setup script:**
   ```bash
   # Download setup script
   curl -O https://raw.githubusercontent.com/dav88dev/dav88dev/master/scripts/setup-server.sh
   
   # Make executable
   chmod +x setup-server.sh
   
   # Run setup
   ./setup-server.sh
   ```

## 🔧 Manual Setup Steps

If you prefer manual setup or need to customize:

### 1. System Update
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker
```bash
# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER
```

### 3. Configure Firewall
```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS (future)
sudo ufw enable
```

### 4. Install Security Tools
```bash
# Fail2ban for SSH protection
sudo apt install -y fail2ban
sudo systemctl enable fail2ban

# Automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🔑 SSH Key Setup for CircleCI

1. **Generate deployment key on server:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "circleci-deploy" -f ~/.ssh/circleci_deploy
   ```

2. **Add public key to authorized_keys:**
   ```bash
   cat ~/.ssh/circleci_deploy.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Get private key for CircleCI (base64 encoded):**
   ```bash
   cat ~/.ssh/circleci_deploy | base64 -w 0
   ```
   Copy this output for `PRODUCTION_SSH_KEY` in CircleCI

4. **Get host key for CircleCI:**
   ```bash
   ssh-keyscan 129.153.229.28
   ```
   Copy the output for `PRODUCTION_HOST_KEY` in CircleCI

## ⚙️ CircleCI Environment Variables

Set these in your CircleCI project settings:

| Variable | Value |
|----------|-------|
| `PRODUCTION_HOST` | `129.153.229.28` |
| `PRODUCTION_USER` | `ubuntu` (or your username) |
| `PRODUCTION_SSH_KEY` | Base64 encoded private key from step 3 |
| `PRODUCTION_HOST_KEY` | Host key from step 4 |

## 🧪 Testing Deployment

Before relying on CircleCI, test manual deployment:

```bash
# From your local machine
./scripts/test-deployment.sh
```

## 📊 Monitoring

### Check container status:
```bash
docker ps
docker logs portfolio
```

### Health check:
```bash
curl http://localhost/health
```

### System resources:
```bash
htop
docker stats
```

## 🔄 Maintenance

### Update Docker images:
```bash
docker image prune -a
```

### View logs:
```bash
docker logs -f portfolio
```

### Restart container:
```bash
docker restart portfolio
```

## 🚨 Troubleshooting

### Container won't start:
```bash
# Check logs
docker logs portfolio

# Check port availability
sudo netstat -tulpn | grep :80

# Check disk space
df -h
```

### Can't connect:
```bash
# Check firewall
sudo ufw status

# Check Docker
sudo systemctl status docker

# Test locally
curl http://localhost
```

### OCI-specific issues:
- Ensure security list allows inbound traffic on port 80
- Check if instance has public IP assigned
- Verify route table has internet gateway

## 🛡️ Security Best Practices

1. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Monitor auth logs:**
   ```bash
   sudo tail -f /var/log/auth.log
   ```

3. **Check fail2ban status:**
   ```bash
   sudo fail2ban-client status sshd
   ```

4. **Backup important data:**
   ```bash
   # Create backup script
   docker exec portfolio tar -czf - /app > backup-$(date +%Y%m%d).tar.gz
   ```

## 📝 Notes

- The server runs Docker containers on port 80
- Logs are automatically rotated (10MB max, 3 files)
- Container auto-restarts on failure
- Security updates install automatically
- fail2ban protects against brute force SSH attacks

---

For issues or questions, check the [main deployment guide](DEPLOYMENT.md) or CircleCI build logs.