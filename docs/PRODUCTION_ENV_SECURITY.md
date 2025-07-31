# Production Environment Security Guide

## Critical Security Requirements

### 1. .env File Security Setup

**IMMEDIATE ACTIONS REQUIRED ON SERVER:**

```bash
# 1. Create .env file with secure permissions
sudo -u portfolio tee /home/portfolio/.env > /dev/null << 'EOF'
# Production Environment Configuration
# NEVER commit this file to version control

# Server Configuration
SERVER_PORT=8080
SERVER_ENV=production
SERVER_LOG_LEVEL=info
SERVER_ENABLE_HTTPS=false
SERVER_CERT_FILE=
SERVER_KEY_FILE=

# MongoDB Configuration (REPLACE WITH REAL VALUES)
DB_MONGO_URI=mongodb+srv://production_user:production_password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_MONGO_DATABASE=portfolio_prod
DB_MONGO_TIMEOUT=10
DB_MONGO_MAX_POOL_SIZE=100
DB_MONGO_MIN_POOL_SIZE=5
DB_MONGO_MAX_IDLE_TIME=300
DB_MONGO_RETRY_READS=true

# Security Configuration (REPLACE WITH REAL VALUES)
SECURITY_JWT_SECRET=your_production_jwt_secret_min_32_characters_here_change_this
SECURITY_SESSION_SECRET=your_production_session_secret_min_32_characters_here_change_this
SECURITY_CORS_ORIGINS=https://yourdomain.com
SECURITY_RATE_LIMIT_RPS=100
SECURITY_ENABLE_RATE_LIMIT=true

# External Services (REPLACE WITH REAL VALUES)
EXTERNAL_OPENAI_API_KEY=your_openai_api_key_here
EXTERNAL_OPENAI_MODEL=gpt-4

# Error Monitoring (REPLACE WITH REAL VALUE)
BUGSNAG_API_KEY=your_bugsnag_api_key_here
EOF

# 2. Set ultra-secure permissions (owner read/write only)
sudo chmod 600 /home/portfolio/.env
sudo chown portfolio:portfolio /home/portfolio/.env

# 3. Verify security
ls -la /home/portfolio/.env
# Should show: -rw------- 1 portfolio portfolio
```

### 2. Nginx Security Configuration

**Add to /etc/nginx/sites-available/portfolio:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/portfolio/static;
    index index.html;

    # CRITICAL: Block all dot files (.env, .git, etc.)
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
        return 404;
    }

    # CRITICAL: Block sensitive files by extension
    location ~* \.(env|git|svn|htaccess|htpasswd|ini|log|sh|sql|conf)$ {
        deny all;
        access_log off;
        log_not_found off;
        return 404;
    }

    # CRITICAL: Block backup and temporary files
    location ~* \.(bak|backup|old|orig|save|swo|swp|tmp|temp)$ {
        deny all;
        access_log off;
        log_not_found off;
        return 404;
    }

    # Block common sensitive directories
    location ~* /(\.git|\.svn|\.hg|CVS|\.bzr) {
        deny all;
        access_log off;
        log_not_found off;
        return 404;
    }

    # Static files
    location / {
        try_files $uri $uri/ =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Go application
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Additional Security Measures

```bash
# 1. Test nginx configuration
sudo nginx -t

# 2. Reload nginx
sudo systemctl reload nginx

# 3. Test .env security from outside
curl -I http://yourdomain.com/.env
# Should return: HTTP/1.1 404 Not Found

curl -I http://yourdomain.com/.env.example  
# Should return: HTTP/1.1 404 Not Found

curl -I http://yourdomain.com/.git/config
# Should return: HTTP/1.1 404 Not Found

# 4. Set up log monitoring for .env access attempts
sudo tail -f /var/log/nginx/access.log | grep -E '\.(env|git)'
```

### 4. Environment Variable Validation

**Update your Go application to validate critical env vars:**

```go
// In config/config.go - add validation
func (c *Config) validate() error {
    // ... existing validation ...
    
    // Security: Ensure production secrets are not defaults
    if c.Environment == "production" {
        if strings.Contains(c.JWTSecret, "change_this") {
            return fmt.Errorf("production JWT secret must be changed from default")
        }
        if strings.Contains(c.SessionSecret, "change_this") {
            return fmt.Errorf("production session secret must be changed from default") 
        }
        if strings.Contains(c.MongoURI, "production_password") {
            return fmt.Errorf("production MongoDB URI must use real credentials")
        }
    }
    
    return nil
}
```

### 5. Security Testing Checklist

**Test all these URLs return 404:**
- `http://yourdomain.com/.env`
- `http://yourdomain.com/.env.example`
- `http://yourdomain.com/.git/config`
- `http://yourdomain.com/config/.env`
- `http://yourdomain.com/../.env`
- `http://yourdomain.com/.htaccess`
- `http://yourdomain.com/backup.sql`

**File permissions check:**
```bash
# .env should be 600 (owner read/write only)
ls -la /home/portfolio/.env

# Portfolio directory should not be web-accessible
ls -la /home/portfolio/

# Only static directory should be served by nginx
ls -la /home/portfolio/static/
```

## CRITICAL SECURITY REMINDERS

1. **NEVER commit .env to git repository**
2. **Always use 600 permissions on .env files**
3. **Test all dot-file blocking rules after nginx changes**
4. **Replace ALL placeholder values with real production values**
5. **Monitor nginx logs for .env access attempts**
6. **Use different secrets for development and production**

## Emergency Response

If .env is ever exposed:
1. **Immediately rotate all secrets (JWT, Session, API keys)**
2. **Change MongoDB credentials**
3. **Check logs for unauthorized access**
4. **Update application with new credentials**
5. **Restart all services**