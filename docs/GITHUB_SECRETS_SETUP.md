# 🔐 GitHub Secrets Configuration Guide

## Required Repository Secrets

Navigate to: **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**

### 🔑 SSH Configuration
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SSH_PRIVATE_KEY` | Your SSH private key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |

### 🌐 Server Configuration  
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SERVER_ENV` | Environment (production/staging) | `production` |
| `SERVER_PORT` | Server port | `8000` |
| `SERVER_LOG_LEVEL` | Logging level | `info` |
| `SERVER_ENABLE_HTTPS` | Enable HTTPS | `false` |

### 🗄️ Database Configuration
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DB_MONGO_URI` | MongoDB connection string | `mongodb://user:pass@host:port/db` |
| `DB_MONGO_DATABASE` | Database name | `portfolio` |
| `DB_MONGO_TIMEOUT` | Connection timeout | `10s` |
| `DB_MONGO_MAX_POOL_SIZE` | Max pool size | `100` |
| `DB_MONGO_MIN_POOL_SIZE` | Min pool size | `5` |
| `DB_MONGO_MAX_IDLE_TIME` | Max idle time | `30s` |
| `DB_MONGO_RETRY_READS` | Retry reads | `true` |

### 🛡️ Security Configuration
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SECURITY_JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-min-32-chars` |
| `SECURITY_SESSION_SECRET` | Session secret | `your-session-secret-key-min-32-chars` |
| `SECURITY_RATE_LIMIT_RPS` | Rate limit requests/sec | `10` |
| `SECURITY_ENABLE_RATE_LIMIT` | Enable rate limiting | `true` |

### 🔌 External Services
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `EXTERNAL_OPENAI_API_KEY` | OpenAI API key (if used) | `sk-...` |
| `EXTERNAL_OPENAI_MODEL` | OpenAI model | `gpt-3.5-turbo` |
| `BUGSNAG_API_KEY` | Bugsnag API key | `your-bugsnag-key` |

## 🚀 How to Add Secrets

### Method 1: GitHub Web Interface
1. Go to your repository on GitHub
2. Click **Settings** tab
3. In sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the name and value
6. Click **Add secret**

### Method 2: GitHub CLI (Recommended for bulk setup)
```bash
# Install GitHub CLI if not already installed
gh auth login

# Add secrets one by one
gh secret set SSH_PRIVATE_KEY < /path/to/your/ssh/key
gh secret set SERVER_ENV --body "production"
gh secret set SERVER_PORT --body "8000"
gh secret set SECURITY_JWT_SECRET --body "your-jwt-secret-here"
# ... continue for all secrets
```

### Method 3: Bulk Secret Setup Script
```bash
#!/bin/bash
# save as setup-secrets.sh

# Server Configuration
gh secret set SERVER_ENV --body "production"
gh secret set SERVER_PORT --body "8000" 
gh secret set SERVER_LOG_LEVEL --body "info"
gh secret set SERVER_ENABLE_HTTPS --body "false"

# Database Configuration (update with your values)
gh secret set DB_MONGO_URI --body "mongodb://localhost:27017"
gh secret set DB_MONGO_DATABASE --body "portfolio"
gh secret set DB_MONGO_TIMEOUT --body "10s"
gh secret set DB_MONGO_MAX_POOL_SIZE --body "100"
gh secret set DB_MONGO_MIN_POOL_SIZE --body "5"
gh secret set DB_MONGO_MAX_IDLE_TIME --body "30s"
gh secret set DB_MONGO_RETRY_READS --body "true"

# Security Configuration (GENERATE STRONG SECRETS!)
gh secret set SECURITY_JWT_SECRET --body "$(openssl rand -base64 32)"
gh secret set SECURITY_SESSION_SECRET --body "$(openssl rand -base64 32)"
gh secret set SECURITY_RATE_LIMIT_RPS --body "10"
gh secret set SECURITY_ENABLE_RATE_LIMIT --body "true"

# SSH Key (update path to your key)
gh secret set SSH_PRIVATE_KEY < ~/.ssh/your-private-key

echo "✅ All secrets configured!"
```

## 🔒 Security Best Practices

### 1. **Secret Generation**
```bash
# Generate strong JWT secret
openssl rand -base64 32

# Generate session secret  
openssl rand -base64 32

# Generate API key
openssl rand -hex 32
```

### 2. **SSH Key Security**
- Use Ed25519 keys for better security: `ssh-keygen -t ed25519`
- Never commit private keys to git
- Use separate deployment keys for CI/CD
- Rotate keys regularly

### 3. **Environment-Specific Secrets**
```yaml
# Use environment-specific secrets
production:
  secrets:
    - DB_MONGO_URI_PROD
    - JWT_SECRET_PROD
    
staging:
  secrets:
    - DB_MONGO_URI_STAGING
    - JWT_SECRET_STAGING
```

### 4. **Least Privilege Access**
- Only grant secrets to workflows that need them
- Use environment protection rules
- Implement approval workflows for production

## 🌍 Environment Management

### GitHub Environments Setup
1. Go to **Settings** → **Environments**
2. Create environments: `production`, `staging`
3. Add environment-specific secrets
4. Configure protection rules

### Environment Protection Rules
```yaml
environment:
  name: production
  url: http://129.80.244.212
  protection_rules:
    - type: required_reviewers
      reviewers: ["dav88dev"]
    - type: wait_timer
      minutes: 5
```

## 🔍 Secret Validation

### Test Secret Access
```yaml
# Add to workflow for testing
- name: 🧪 Test Secrets
  run: |
    echo "Testing secret access..."
    if [ -z "${{ secrets.SSH_PRIVATE_KEY }}" ]; then
      echo "❌ SSH_PRIVATE_KEY not set"
      exit 1
    fi
    if [ -z "${{ secrets.SERVER_ENV }}" ]; then
      echo "❌ SERVER_ENV not set" 
      exit 1
    fi
    echo "✅ All critical secrets available"
```

### Monitor Secret Usage
- Check workflow logs for missing secrets
- Use dependabot for secret scanning
- Implement secret rotation schedules

## 🚨 What NOT to Do

❌ **Never do this:**
```yaml
# DON'T hardcode secrets
- name: Deploy
  env:
    API_KEY: "hardcoded-key-here"  # NEVER!

# DON'T expose secrets in logs
- name: Debug
  run: echo ${{ secrets.API_KEY }}  # NEVER!

# DON'T use secrets in public repos for private data
```

✅ **Do this instead:**
```yaml
# Use secrets properly
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}

# Test without exposing
- name: Debug
  run: |
    if [ -n "${{ secrets.API_KEY }}" ]; then
      echo "✅ API key is available"
    else
      echo "❌ API key missing"
    fi
```

## 📋 Quick Setup Checklist

- [ ] SSH private key added to secrets
- [ ] All environment variables configured
- [ ] Strong secrets generated (JWT, session)
- [ ] Database connection string set
- [ ] External service API keys added
- [ ] Environment protection rules configured
- [ ] Secret access tested in workflow
- [ ] No hardcoded values in code
- [ ] Secret rotation schedule planned

## 🔄 Secret Rotation

### Quarterly Rotation (Recommended)
1. Generate new secrets
2. Update GitHub secrets
3. Deploy with new secrets
4. Verify functionality
5. Revoke old secrets

### Emergency Rotation
1. Immediately revoke compromised secret
2. Generate replacement
3. Update GitHub secret
4. Emergency deployment
5. Monitor for issues

---

**🔐 Security Note**: Never share these secrets outside of GitHub Actions. All secrets are encrypted and only accessible during workflow execution.