# 🚀 Quick Secrets Setup Guide

## ⚡ Super Fast Setup (3 minutes)

### 1. **Run the Setup Script**
```bash
# Make sure you're in the project directory
cd /home/dav88dev/DAV88DEV/myWebsite

# Run the interactive setup script
./scripts/setup-github-secrets.sh
```

### 2. **Manual Setup via GitHub CLI** (Alternative)
```bash
# Authenticate with GitHub (if not already)
gh auth login

# Set SSH key (update path to your key)
gh secret set SSH_PRIVATE_KEY < /home/dav88dev/Documents/ssh-key-2025-07-31.key

# Set critical environment variables
gh secret set SERVER_ENV --body "production"
gh secret set SERVER_PORT --body "8000"

# Generate and set security secrets
gh secret set SECURITY_JWT_SECRET --body "$(openssl rand -base64 32)"
gh secret set SECURITY_SESSION_SECRET --body "$(openssl rand -base64 32)"

# Set database (if using MongoDB)
gh secret set DB_MONGO_URI --body "your-mongodb-connection-string"
gh secret set DB_MONGO_DATABASE --body "portfolio"

# Optional: Set external service keys
gh secret set BUGSNAG_API_KEY --body "your-bugsnag-key"
```

### 3. **Verify Setup**
```bash
# List all secrets
gh secret list

# Should show at least:
# SSH_PRIVATE_KEY
# SERVER_ENV  
# SECURITY_JWT_SECRET
# SECURITY_SESSION_SECRET
```

## 🔐 Required Secrets for Deployment

| Secret | Required | Description |
|--------|----------|-------------|
| `SSH_PRIVATE_KEY` | ✅ **YES** | Your SSH key for server access |
| `SERVER_ENV` | ✅ **YES** | Set to "production" |
| `SECURITY_JWT_SECRET` | ✅ **YES** | JWT signing secret (32+ chars) |
| `SECURITY_SESSION_SECRET` | ✅ **YES** | Session secret (32+ chars) |

## 🌍 Optional Environment Variables

| Secret | Default | Description |
|--------|---------|-------------|
| `SERVER_PORT` | `8000` | Server port |
| `SERVER_LOG_LEVEL` | `info` | Log level |
| `DB_MONGO_URI` | - | MongoDB connection |
| `DB_MONGO_DATABASE` | `portfolio` | Database name |
| `SECURITY_RATE_LIMIT_RPS` | `10` | Rate limit |
| `BUGSNAG_API_KEY` | - | Error tracking |

## 🚨 Critical Notes

- **SSH Key**: Use the key at `/home/dav88dev/Documents/ssh-key-2025-07-31.key`
- **Server IP**: `129.80.244.212` (already configured in workflow)
- **Security**: All secrets are encrypted and only available during deployment
- **CORS**: Already set to `https://dav88.dev` in workflow

## ✅ Quick Test

After setting up secrets, push any commit to trigger deployment:

```bash
git commit --allow-empty -m "test: trigger deployment"
git push origin master
```

Watch the deployment in: **GitHub** → **Actions** → **🐳 Docker Build & Deploy**

---

**🎯 That's it! Your GitHub Actions deployment is ready to go!**