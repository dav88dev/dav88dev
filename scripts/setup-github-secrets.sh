#!/bin/bash

# 🔐 GitHub Secrets Setup Script
# This script sets up all required secrets for the portfolio project

set -e

echo "🚀 Setting up GitHub secrets for portfolio project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI is not installed. Please install it first:"
    echo -e "${BLUE}https://cli.github.com/${NC}"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub. Please run: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is ready${NC}"

# Function to set secret with validation
set_secret() {
    local name=$1
    local description=$2
    local required=${3:-true}
    
    echo -e "${BLUE}Setting up: $name${NC}"
    echo -e "${YELLOW}Description: $description${NC}"
    
    if [ "$required" = true ]; then
        echo -e "${RED}⚠️  This secret is REQUIRED for deployment${NC}"
    fi
    
    read -p "Enter value (or press Enter to skip): " -s value
    echo
    
    if [ -n "$value" ]; then
        if gh secret set "$name" --body "$value"; then
            echo -e "${GREEN}✅ $name set successfully${NC}"
        else
            echo -e "${RED}❌ Failed to set $name${NC}"
        fi
    else
        if [ "$required" = true ]; then
            echo -e "${RED}⚠️  Warning: Required secret $name was skipped${NC}"
        else
            echo -e "${YELLOW}⏭️  Skipped optional secret $name${NC}"
        fi
    fi
    echo
}

# Function to set SSH key
set_ssh_key() {
    echo -e "${BLUE}🔑 Setting up SSH Private Key${NC}"
    echo -e "${YELLOW}This is required for server deployment${NC}"
    
    # Default path suggestion
    default_key_path="$HOME/.ssh/id_rsa"
    if [ -f "/home/dav88dev/Documents/ssh-key-2025-07-31.key" ]; then
        default_key_path="/home/dav88dev/Documents/ssh-key-2025-07-31.key"
    fi
    
    read -p "Enter path to SSH private key [$default_key_path]: " key_path
    key_path=${key_path:-$default_key_path}
    
    if [ -f "$key_path" ]; then
        if gh secret set SSH_PRIVATE_KEY < "$key_path"; then
            echo -e "${GREEN}✅ SSH_PRIVATE_KEY set successfully${NC}"
        else
            echo -e "${RED}❌ Failed to set SSH_PRIVATE_KEY${NC}"
        fi
    else
        echo -e "${RED}❌ SSH key file not found: $key_path${NC}"
        echo -e "${YELLOW}💡 You can set this manually later in GitHub Settings${NC}"
    fi
    echo
}

# Function to generate strong secret
generate_secret() {
    local name=$1
    local description=$2
    
    echo -e "${BLUE}Generating: $name${NC}"
    echo -e "${YELLOW}Description: $description${NC}"
    
    read -p "Generate random 32-character secret? (y/N): " generate
    
    if [[ $generate =~ ^[Yy]$ ]]; then
        local secret=$(openssl rand -base64 32)
        if gh secret set "$name" --body "$secret"; then
            echo -e "${GREEN}✅ $name generated and set successfully${NC}"
        else
            echo -e "${RED}❌ Failed to set $name${NC}"
        fi
    else
        set_secret "$name" "$description" true
    fi
}

echo -e "${BLUE}🔐 Starting GitHub Secrets Configuration${NC}"
echo "======================================"

# 1. SSH Configuration
echo -e "${BLUE}📡 SSH Configuration${NC}"
set_ssh_key

# 2. Server Configuration
echo -e "${BLUE}🖥️  Server Configuration${NC}"
set_secret "SERVER_ENV" "Environment (production/staging/development)" true
set_secret "SERVER_PORT" "Server port (default: 8000)" false
set_secret "SERVER_LOG_LEVEL" "Logging level (debug/info/warn/error)" false

# 3. Security Configuration (Auto-generate)
echo -e "${BLUE}🛡️  Security Configuration${NC}"
generate_secret "SECURITY_JWT_SECRET" "JWT signing secret (auto-generated)"
generate_secret "SECURITY_SESSION_SECRET" "Session secret key (auto-generated)"
set_secret "SECURITY_RATE_LIMIT_RPS" "Rate limit requests per second (default: 10)" false

# 4. Database Configuration
echo -e "${BLUE}🗄️  Database Configuration${NC}"
set_secret "DB_MONGO_URI" "MongoDB connection string" false
set_secret "DB_MONGO_DATABASE" "Database name (default: portfolio)" false

# 5. External Services
echo -e "${BLUE}🔌 External Services (Optional)${NC}"
set_secret "EXTERNAL_OPENAI_API_KEY" "OpenAI API key (optional)" false
set_secret "BUGSNAG_API_KEY" "Bugsnag error tracking key (optional)" false

echo
echo -e "${GREEN}🎉 GitHub Secrets Setup Complete!${NC}"
echo "======================================"

# Verify critical secrets
echo -e "${BLUE}🔍 Verifying critical secrets...${NC}"

missing_secrets=()

if ! gh secret list | grep -q "SSH_PRIVATE_KEY"; then
    missing_secrets+=("SSH_PRIVATE_KEY")
fi

if ! gh secret list | grep -q "SECURITY_JWT_SECRET"; then
    missing_secrets+=("SECURITY_JWT_SECRET")
fi

if ! gh secret list | grep -q "SECURITY_SESSION_SECRET"; then
    missing_secrets+=("SECURITY_SESSION_SECRET")
fi

if [ ${#missing_secrets[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All critical secrets are configured!${NC}"
else
    echo -e "${RED}⚠️  Missing critical secrets:${NC}"
    for secret in "${missing_secrets[@]}"; do
        echo -e "${RED}  - $secret${NC}"
    done
    echo
    echo -e "${YELLOW}💡 You can set these manually in GitHub:${NC}"
    echo -e "${BLUE}   Repository → Settings → Secrets and variables → Actions${NC}"
fi

echo
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Verify all secrets in GitHub UI"
echo "2. Test deployment workflow" 
echo "3. Monitor first deployment"
echo
echo -e "${GREEN}🚀 Your GitHub Actions workflows are ready to deploy!${NC}"