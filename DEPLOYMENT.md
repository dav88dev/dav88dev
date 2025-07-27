# 🚀 CircleCI Deployment Guide

This project uses CircleCI for automated CI/CD deployment to production.

## 🔧 Setup Requirements

### CircleCI Environment Variables

Set these environment variables in your CircleCI project settings:

#### Production Server Access
```bash
PRODUCTION_HOST=your-server-ip-or-domain
PRODUCTION_USER=your-ssh-username
PRODUCTION_SSH_KEY=base64-encoded-private-ssh-key
PRODUCTION_HOST_KEY=your-server-ssh-host-key
```

### 🔑 SSH Key Setup

1. **Generate SSH key pair:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "circleci-deploy"
   ```

2. **Add public key to your server:**
   ```bash
   # Copy public key to server
   ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server.com
   ```

3. **Base64 encode private key for CircleCI:**
   ```bash
   cat ~/.ssh/id_rsa | base64 -w 0
   ```

4. **Get server host key:**
   ```bash
   ssh-keyscan your-server.com
   ```

## 🏗️ Pipeline Overview

### Workflow Stages

1. **Setup Phase** (Parallel)
   - `setup-rust` - Cache Rust dependencies
   - `setup-frontend` - Cache Node.js dependencies

2. **Quality Assurance** (Parallel)
   - `code-quality` - Rustfmt, Clippy, Security audit
   - `test` - Unit and integration tests

3. **Build Phase** (Parallel)
   - `build-frontend` - Vite asset compilation
   - `build-wasm` - WebAssembly compilation
   - `build-rust` - Release binary (static linking)

4. **Integration Testing**
   - `integration-test` - End-to-end functionality

5. **Docker & Security**
   - `build-docker` - Multi-stage Docker build
   - Security scanning with Trivy

6. **Production Deployment** (master only)
   - `deploy-production` - Zero-downtime deployment

### 🎯 Deployment Strategy

#### Fresh Build Every Time
- Complete rebuild from source on every master push
- No incremental builds - ensures consistency
- WASM compilation included in pipeline
- Static asset generation with cache busting

#### Zero-Downtime Deployment
```bash
# Pipeline automatically:
1. Builds fresh Docker image with SHA tag
2. Transfers image to production server
3. Stops old container gracefully
4. Starts new container with health checks
5. Cleans up old images
```

## 🛡️ Security Features

### Build Security
- **Dependency Scanning**: Cargo audit on every build
- **Container Scanning**: Trivy security scan
- **Static Linking**: No runtime dependencies
- **Multi-stage Build**: Minimal attack surface

### Deployment Security
- **SSH Key Authentication**: No password-based access
- **Known Hosts Verification**: Prevents MITM attacks
- **Base64 Encoded Keys**: Secure secret storage
- **Container Isolation**: App runs as non-root user

## 📊 Performance Optimizations

### Build Performance
- **Parallel Jobs**: Maximum concurrency
- **Dependency Caching**: Rust and Node.js deps cached
- **Docker Layer Caching**: Optimized Dockerfile
- **Incremental Compilation**: Where possible

### Production Performance
- **Static Linking**: Single binary deployment
- **WASM Optimization**: Size and speed optimized
- **Asset Minification**: Vite production build
- **gzip Compression**: Reduced transfer size

## 🔍 Quality Gates

### Code Quality
```yaml
✅ Rust formatting (rustfmt)
✅ Linting (clippy) - zero warnings
✅ Security audit (cargo audit)
✅ Unit tests passing
✅ Integration tests passing
```

### Build Quality
```yaml
✅ Frontend build successful
✅ WASM compilation successful  
✅ Rust release build successful
✅ Docker image builds
✅ Security scan passes
```

### Deployment Quality
```yaml
✅ Health check passes
✅ Application responds correctly
✅ All endpoints accessible
✅ WASM assets loading
```

## 🚦 Branch Strategy

### Master Branch (Production)
- **Triggers**: Every push to master
- **Actions**: Full pipeline + deployment
- **Requirements**: All quality gates must pass

### Feature Branches
- **Triggers**: Every push to any branch
- **Actions**: Build and test only
- **Skip**: Production deployment

### Pull Requests
- **Triggers**: PR creation/updates
- **Actions**: Full validation pipeline
- **Requirements**: All checks must pass for merge

## 📱 Monitoring & Alerts

### Build Notifications
- **Slack/Email**: Configure in CircleCI project settings
- **GitHub Status**: Automatic PR status updates
- **Deployment Status**: Success/failure notifications

### Health Checks
```bash
# Automated health verification
curl -f http://localhost/health
curl -f http://localhost/  # Main page
curl -f http://localhost/static/wasm/wasm_frontend.js
```

## 🔧 Manual Deployment

If you need to deploy manually:

```bash
# 1. Build locally
./build.sh
cargo build --release

# 2. Build Docker image
docker build -t portfolio:manual .

# 3. Deploy to server
docker save portfolio:manual | gzip > portfolio.tar.gz
scp portfolio.tar.gz user@server:/tmp/
ssh user@server "cd /tmp && docker load < portfolio.tar.gz && docker stop portfolio && docker rm portfolio && docker run -d --name portfolio -p 80:8000 portfolio:manual"
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Rust version compatibility
rustc --version  # Should be 1.75+

# Clear caches
cargo clean
rm -rf frontend/node_modules

# Rebuild
./build.sh
```

#### WASM Compilation Issues
```bash
# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Check target support
rustup target list | grep wasm32
rustup target add wasm32-unknown-unknown
```

#### Deployment Issues
```bash
# Verify SSH access
ssh -i ~/.ssh/deploy_key user@server

# Check Docker on server
ssh user@server "docker --version && docker ps"

# Verify port availability
ssh user@server "netstat -tulpn | grep :80"
```

### Pipeline Debugging

#### View Detailed Logs
1. Go to CircleCI dashboard
2. Select failed job
3. Expand failing step
4. Download artifacts if available

#### Local Testing
```bash
# Test Docker build locally
docker build -t portfolio:test .
docker run -p 8000:8000 portfolio:test

# Test health endpoints
curl http://localhost:8000/health
curl http://localhost:8000/
```

## 📈 Metrics & Analytics

### Build Metrics
- **Build Time**: Typically 8-12 minutes
- **Success Rate**: Target >98%
- **Cache Hit Rate**: Monitor dependency caching

### Deployment Metrics
- **Deployment Time**: Typically 2-3 minutes
- **Downtime**: <30 seconds during container swap
- **Rollback Time**: <60 seconds if needed

## 🔮 Future Enhancements

### Planned Improvements
- [ ] Blue-green deployment strategy
- [ ] Automated rollback on health check failure
- [ ] Database migration support
- [ ] Multi-environment support (staging/prod)
- [ ] Container orchestration (Docker Swarm/K8s)

### Potential Optimizations
- [ ] Docker image registry caching
- [ ] Parallel test execution
- [ ] Cross-platform builds
- [ ] Performance regression testing

---

## 🆘 Support

For deployment issues:
1. Check CircleCI build logs
2. Verify environment variables
3. Test SSH connectivity
4. Check server resources
5. Review application logs: `docker logs portfolio`

**Emergency Rollback:**
```bash
# If deployment fails, rollback to previous image
ssh user@server "docker stop portfolio && docker rm portfolio && docker run -d --name portfolio -p 80:8000 portfolio:previous"
```