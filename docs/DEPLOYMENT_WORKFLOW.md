# Complete Deployment Workflow

**Date**: January 31, 2025  
**From**: Development Machine → GitHub → CircleCI → VPS

## 🚀 Deployment Flow Overview

```
1. Local Development (You)
   ↓ git push
2. GitHub (Repository)
   ↓ webhook
3. CircleCI (Build & Test)
   ↓ SSH deploy
4. VPS (Production)
```

## 📋 Step-by-Step Deployment Process

### Phase 1: Initial VPS Setup (One-Time Only)

**On your VPS:**
```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Download and run migration script (removes Rust app)
wget https://raw.githubusercontent.com/dav88dev/myWebsite/main/scripts/migrate-rust-to-go.sh
chmod +x migrate-rust-to-go.sh
./migrate-rust-to-go.sh

# 3. Download and run server setup script
wget https://raw.githubusercontent.com/dav88dev/myWebsite/main/scripts/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh

# 4. Create CircleCI deployment user
sudo useradd -m -s /bin/bash circleci
sudo usermod -aG portfolio circleci
sudo mkdir -p /home/circleci/.ssh
sudo chmod 700 /home/circleci/.ssh

# 5. Generate SSH key for CircleCI
sudo -u circleci ssh-keygen -t ed25519 -f /home/circleci/.ssh/id_ed25519 -N ""

# 6. Add CircleCI public key to authorized_keys
sudo cp /home/circleci/.ssh/id_ed25519.pub /home/circleci/.ssh/authorized_keys
sudo chmod 600 /home/circleci/.ssh/authorized_keys
sudo chown -R circleci:circleci /home/circleci/.ssh

# 7. Allow circleci to deploy
sudo bash -c 'echo "circleci ALL=(portfolio) NOPASSWD: /var/www/portfolio/deploy.sh" >> /etc/sudoers.d/circleci'

# 8. Show the private key (you'll need this for CircleCI)
sudo cat /home/circleci/.ssh/id_ed25519
```

### Phase 2: CircleCI Setup (One-Time Only)

**In CircleCI Dashboard:**
1. Go to Project Settings → SSH Keys
2. Add the private key from step 8 above
3. Add environment variables:
   - `VPS_HOST`: Your VPS IP address
   - `VPS_USER`: circleci

### Phase 3: Update CircleCI Config (In Your Repo)

Create/Update `.circleci/config.yml`:

```yaml
version: 2.1

executors:
  go-executor:
    docker:
      - image: cimg/go:1.21-node
    working_directory: ~/project

jobs:
  test:
    executor: go-executor
    steps:
      - checkout
      
      - restore_cache:
          keys:
            - go-mod-v1-{{ checksum "go.sum" }}
            - go-mod-v1-
      
      - run:
          name: Install dependencies
          command: go mod download
      
      - save_cache:
          key: go-mod-v1-{{ checksum "go.sum" }}
          paths:
            - "/go/pkg/mod"
      
      - run:
          name: Run tests
          command: go test -v ./...
      
      - run:
          name: Run linting
          command: |
            go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
            golangci-lint run --timeout 5m

  build:
    executor: go-executor
    steps:
      - checkout
      
      - restore_cache:
          keys:
            - go-mod-v1-{{ checksum "go.sum" }}
            - go-mod-v1-
      
      - restore_cache:
          keys:
            - node-deps-v1-{{ checksum "frontend/package-lock.json" }}
            - node-deps-v1-
      
      - run:
          name: Install frontend dependencies
          command: |
            cd frontend
            npm ci
      
      - save_cache:
          key: node-deps-v1-{{ checksum "frontend/package-lock.json" }}
          paths:
            - frontend/node_modules
      
      - run:
          name: Build frontend
          command: |
            cd frontend
            npm run build
      
      - run:
          name: Build Go binary
          command: |
            GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o portfolio-server .
      
      - run:
          name: Prepare deployment package
          command: |
            mkdir -p deploy
            cp portfolio-server deploy/
            cp -r static deploy/
            cp .env.example deploy/.env.example
            tar -czf deployment.tar.gz -C deploy .
      
      - persist_to_workspace:
          root: .
          paths:
            - deployment.tar.gz

  deploy:
    docker:
      - image: cimg/base:stable
    steps:
      - attach_workspace:
          at: .
      
      - add_ssh_keys:
          fingerprints:
            - "${VPS_SSH_FINGERPRINT}"
      
      - run:
          name: Deploy to VPS
          command: |
            # Configure SSH
            ssh-keyscan -H ${VPS_HOST} >> ~/.ssh/known_hosts
            
            # Upload deployment package
            scp deployment.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/
            
            # Deploy on server
            ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
              cd /var/www/portfolio
              
              # Extract new files
              tar -xzf /tmp/deployment.tar.gz -C /tmp/deploy/
              
              # Copy files with correct names for deployment script
              sudo -u portfolio cp /tmp/deploy/portfolio-server portfolio-server.new
              sudo -u portfolio cp -r /tmp/deploy/static static.new
              
              # Run deployment script
              sudo -u portfolio ./deploy.sh
              
              # Cleanup
              rm -rf /tmp/deploy /tmp/deployment.tar.gz
            ENDSSH

workflows:
  version: 2
  test-build-deploy:
    jobs:
      - test
      - build:
          requires:
            - test
      - deploy:
          requires:
            - build
          filters:
            branches:
              only:
                - main
                - master
```

### Phase 4: Regular Deployment Workflow

**After initial setup, your workflow is:**

1. **Make changes locally**
   ```bash
   # Edit code
   git add .
   git commit -m "feat: Add new feature"
   git push origin main
   ```

2. **CircleCI automatically:**
   - Runs tests
   - Builds Go binary
   - Builds frontend
   - Deploys to VPS

3. **Monitor deployment:**
   - Check CircleCI dashboard
   - Verify at https://dav88.dev

## 🔍 Manual Deployment (If Needed)

**From your local machine:**
```bash
# Build locally
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o portfolio-server .
cd frontend && npm run build && cd ..

# Upload to server
scp portfolio-server root@your-vps-ip:/var/www/portfolio/portfolio-server.new
scp -r static root@your-vps-ip:/var/www/portfolio/static.new

# Deploy
ssh root@your-vps-ip "cd /var/www/portfolio && sudo -u portfolio ./deploy.sh"
```

## ✅ Deployment Checklist

### Before First Deploy:
- [ ] VPS setup script run successfully
- [ ] CircleCI SSH key configured
- [ ] CircleCI environment variables set
- [ ] `.circleci/config.yml` updated in repo
- [ ] SSL certificate installed (run certbot command)

### For Each Deploy:
- [ ] Tests pass locally
- [ ] Commit and push to main branch
- [ ] CircleCI build succeeds
- [ ] Health check passes
- [ ] Site loads correctly

## 🚨 Troubleshooting

### If deployment fails:
1. Check CircleCI logs
2. SSH to VPS and check logs:
   ```bash
   sudo tail -f /var/log/portfolio/error.log
   sudo journalctl -u supervisor -f
   ```

### Rollback if needed:
```bash
ssh root@your-vps-ip
cd /var/www/portfolio
sudo -u portfolio cp backups/portfolio-server_TIMESTAMP portfolio-server
sudo supervisorctl restart portfolio
```

## 📊 Post-Deployment Verification

```bash
# Check health endpoint
curl https://dav88.dev/health

# Check detailed metrics
curl https://dav88.dev/health/detailed

# Monitor logs
ssh root@your-vps-ip "tail -f /var/log/portfolio/access.log"
```

## 🎯 Summary

1. **One-time setup**: Run scripts on VPS, configure CircleCI
2. **Regular deploys**: Just `git push` - CircleCI handles everything
3. **Monitoring**: Health checks ensure successful deployment
4. **Rollback**: Automatic on failure, manual option available

The entire deployment is automated after initial setup!