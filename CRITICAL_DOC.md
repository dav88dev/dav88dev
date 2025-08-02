# 🚨 CRITICAL SECURITY RECOVERY GUIDE

## ⚠️ SECURITY BREACH REMEDIATION COMPLETE - IMMEDIATE ACTIONS REQUIRED

**Status**: All sensitive files have been successfully removed from the repository and git history. However, the compromised credentials must be rotated immediately.

---

## 🔑 STEP 1: Generate New SSH Keys (URGENT)

### 1.1 Generate New SSH Key Pair
```bash
# Generate new ED25519 SSH key (recommended)
ssh-keygen -t ed25519 -C "dav88dev-github-actions" -f ~/.ssh/id_ed25519_github_new

# OR generate RSA key if ED25519 not supported
ssh-keygen -t rsa -b 4096 -C "dav88dev-github-actions" -f ~/.ssh/id_rsa_github_new

# Set secure permissions
chmod 600 ~/.ssh/id_ed25519_github_new
chmod 644 ~/.ssh/id_ed25519_github_new.pub
```

### 1.2 Add to SSH Agent (Local Testing)
```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add new key
ssh-add ~/.ssh/id_ed25519_github_new

# Verify key is loaded
ssh-add -l
```

### 1.3 Update Production Server
```bash
# Copy new public key to production server
ssh-copy-id -i ~/.ssh/id_ed25519_github_new.pub ubuntu@129.80.244.212

# OR manually copy public key
cat ~/.ssh/id_ed25519_github_new.pub
# Then SSH to server and add to ~/.ssh/authorized_keys
```

### 1.4 Test New SSH Connection
```bash
# Test SSH connection with new key
ssh -i ~/.ssh/id_ed25519_github_new ubuntu@129.80.244.212 "echo 'SSH connection successful'"
```

### 1.5 Get Private Key for GitHub Secrets
```bash
# Display private key (copy this entire output)
cat ~/.ssh/id_ed25519_github_new
```

---

## 🔐 STEP 2: Generate New Secrets

### 2.1 Generate JWT Secret
```bash
# Generate 64-character random string for JWT
openssl rand -hex 32
# Example output: 7f9c8e6d4b2a1f8e3d7c9b5a4e8f2d6c1a9b8e7f4d3c2b5a9e8f7d6c4b3a2e1f
```

### 2.2 Generate Session Secret
```bash
# Generate another 64-character random string for sessions
openssl rand -hex 32
# Example output: 2b8f7e6c4d9a3b1e8f7c5d9a6e3b2f8c1d7a4b9e6f3c8d2a5b7e9f4c6d1a3b8e
```

### 2.3 Generate New Database Password (if needed)
```bash
# Generate strong database password
openssl rand -base64 32
# Example output: 8K7mN3qP9rS2tU5vW8xY1zA4bC6dE9fG2hI5jL8mN1oP4qR7sT0uV3wX6yZ9aB2c
```

---

## 🌐 STEP 3: Update GitHub Secrets & Variables

### 3.1 Navigate to GitHub Settings
1. Go to: `https://github.com/dav88dev/dav88dev`
2. Click: `Settings` (top menu)
3. Click: `Secrets and variables` (left sidebar)  
4. Click: `Actions` (submenu)

### 3.2 Add Repository Secrets (SENSITIVE DATA)
**Click the `Secrets` tab, then `New repository secret` for each:**

```bash
# Name: SSH_PRIVATE_KEY
# Value: <paste entire content from: cat ~/.ssh/id_ed25519_github_new>

# Name: DB_MONGO_URI  
# Value: mongodb+srv://username:NEW_PASSWORD@cluster.mongodb.net/portfolio_production

# Name: SECURITY_JWT_SECRET
# Value: <paste output from: openssl rand -hex 32>

# Name: SECURITY_SESSION_SECRET  
# Value: <paste output from: openssl rand -hex 32>

# Name: BUGSNAG_API_KEY
# Value: <your-bugsnag-api-key-if-using>
```

### 3.3 Add Repository Variables (NON-SENSITIVE CONFIG)
**Click the `Variables` tab, then `New repository variable` for each:**

```bash
# Name: SERVER_ENV
# Value: production

# Name: SERVER_PORT
# Value: 8000

# Name: SERVER_LOG_LEVEL
# Value: info

# Name: DB_MONGO_DATABASE
# Value: portfolio_production

# Name: SECURITY_CORS_ORIGINS
# Value: https://dav88.dev

# Name: SECURITY_RATE_LIMIT_RPS
# Value: 50
```

---

## 🗄️ STEP 4: Update Database Credentials

### 4.1 MongoDB Atlas (if using)
```bash
# Log into MongoDB Atlas dashboard
# Navigate to: Database Access → Database Users
# Click on your user → Edit User
# Generate new password and update connection string
```

### 4.2 Update Connection String Format
```bash
# New format with updated password:
mongodb+srv://username:NEW_PASSWORD@cluster.mongodb.net/portfolio_production?retryWrites=true&w=majority
```

---

## 🧹 STEP 5: Clean Up Old Keys

### 5.1 Remove Old SSH Keys from Server
```bash
# SSH to production server
ssh ubuntu@129.80.244.212

# Edit authorized_keys file
sudo nano ~/.ssh/authorized_keys

# Remove any old key entries
# Keep only the new key you just added
# Save and exit (Ctrl+X, Y, Enter)
```

### 5.2 Remove Old Keys from Local Machine
```bash
# Remove old compromised keys (ONLY after confirming new ones work)
rm ~/.ssh/id_rsa_old ~/.ssh/id_rsa_old.pub
rm ~/.ssh/id_ed25519_old ~/.ssh/id_ed25519_old.pub

# Update SSH config if needed
nano ~/.ssh/config
```

---

## ✅ STEP 6: Test Everything

### 6.1 Test GitHub Actions
```bash
# Make a small change to trigger workflows
echo "# Security update complete" >> README.md
git add README.md
git commit -m "test: Verify new secrets work correctly"
git push origin master
```

### 6.2 Monitor Workflow Execution
1. Go to: `https://github.com/dav88dev/dav88dev/actions`
2. Watch the workflows run with new secrets
3. Verify deployment completes successfully

### 6.3 Test Production Deployment
```bash
# Test health endpoint
curl -f http://129.80.244.212:8000/health

# Test homepage
curl -f http://129.80.244.212:8000/

# Check application logs on server
ssh ubuntu@129.80.244.212 "docker logs portfolio-app"
```

---

## 🔒 STEP 7: Security Verification Checklist

### 7.1 Verify Repository Security
- [ ] No sensitive files in current repository
- [ ] No sensitive files in git history (verified via git log)
- [ ] .gitignore updated to prevent future exposure
- [ ] All old SSH keys removed from servers
- [ ] All secrets rotated and updated

### 7.2 Verify GitHub Configuration
- [ ] New SSH_PRIVATE_KEY secret added
- [ ] All database credentials updated
- [ ] All JWT/session secrets regenerated
- [ ] Environment variables properly configured
- [ ] GitHub Actions workflows passing

### 7.3 Verify Production Security
- [ ] New SSH key authentication working
- [ ] Old SSH keys removed from authorized_keys
- [ ] Database accessible with new credentials
- [ ] Application running with new secrets
- [ ] Health checks passing

---

## 📋 EMERGENCY ROLLBACK (if needed)

### If New Keys Don't Work:
```bash
# Temporarily re-add old key to server for emergency access
# (Only if you have server access via another method)
ssh ubuntu@129.80.244.212
echo "OLD_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys

# Fix the new key setup, then remove old key again
```

### If Database Issues:
```bash
# Revert to old database credentials temporarily
# Update GitHub secrets with old DB_MONGO_URI
# Fix database access, then update to new credentials
```

---

## 🚨 CRITICAL REMINDERS

1. **Never commit secrets again** - Always use GitHub Secrets/Variables
2. **Test each step** - Don't proceed if something fails
3. **Keep this document** - Reference for future security updates
4. **Monitor logs** - Watch for any authentication failures
5. **Document changes** - Keep track of what was updated when

---

## ✅ COMPLETION VERIFICATION

Once all steps are complete, you should have:
- ✅ New SSH keys generated and deployed
- ✅ All secrets rotated and updated in GitHub
- ✅ Production server accessible with new keys only
- ✅ GitHub Actions workflows passing with new secrets
- ✅ Application running successfully in production
- ✅ No trace of old compromised credentials anywhere

**After completing all steps, this security incident will be fully resolved.**