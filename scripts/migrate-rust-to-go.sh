#!/bin/bash
#####################################################################
# Rust to Go Migration Script
# Safely migrates from Rust app to Go app on production server
# For: Ubuntu 22.04+ on 1GB VPS
# Author: David Aghayan
# Date: January 2025
#####################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RUST_SERVICE="rocket-app"  # Adjust to your Rust service name
RUST_DIR="/var/www/rust-portfolio"  # Adjust to your Rust app location
BACKUP_DIR="/var/backups/rust-migration-$(date +%Y%m%d_%H%M%S)"
NGINX_RUST_CONFIG="portfolio-rust"  # Nginx config name for Rust app

echo -e "${BLUE}=== Rust to Go Migration Script ===${NC}"
echo -e "${YELLOW}This script will safely migrate from Rust to Go application${NC}"
echo ""

# Create backup directory
echo -e "${YELLOW}1. Creating backup directory...${NC}"
sudo mkdir -p "$BACKUP_DIR"

# Check current Rust service status
echo -e "${YELLOW}2. Checking current Rust application status...${NC}"
if systemctl is-active --quiet $RUST_SERVICE; then
    echo -e "${GREEN}✓ Rust service '$RUST_SERVICE' is running${NC}"
    RUST_RUNNING=true
else
    echo -e "${RED}✗ Rust service '$RUST_SERVICE' is not running${NC}"
    RUST_RUNNING=false
fi

# Backup current Rust application
echo -e "${YELLOW}3. Backing up Rust application...${NC}"
if [ -d "$RUST_DIR" ]; then
    sudo cp -r "$RUST_DIR" "$BACKUP_DIR/"
    echo -e "${GREEN}✓ Rust application backed up to $BACKUP_DIR${NC}"
fi

# Backup Nginx configuration
echo -e "${YELLOW}4. Backing up Nginx configuration...${NC}"
if [ -f "/etc/nginx/sites-available/$NGINX_RUST_CONFIG" ]; then
    sudo cp "/etc/nginx/sites-available/$NGINX_RUST_CONFIG" "$BACKUP_DIR/"
    echo -e "${GREEN}✓ Nginx config backed up${NC}"
fi

# Backup systemd service
echo -e "${YELLOW}5. Backing up systemd service...${NC}"
if [ -f "/etc/systemd/system/$RUST_SERVICE.service" ]; then
    sudo cp "/etc/systemd/system/$RUST_SERVICE.service" "$BACKUP_DIR/"
    echo -e "${GREEN}✓ Systemd service backed up${NC}"
fi

# Stop Rust application gracefully
if [ "$RUST_RUNNING" = true ]; then
    echo -e "${YELLOW}6. Stopping Rust application gracefully...${NC}"
    sudo systemctl stop $RUST_SERVICE
    sleep 5  # Give it time to shutdown cleanly
    echo -e "${GREEN}✓ Rust application stopped${NC}"
else
    echo -e "${YELLOW}6. Rust application already stopped${NC}"
fi

# Disable Rust service
echo -e "${YELLOW}7. Disabling Rust service...${NC}"
sudo systemctl disable $RUST_SERVICE 2>/dev/null || true

# Remove Rust service
echo -e "${YELLOW}8. Removing Rust service...${NC}"
sudo rm -f /etc/systemd/system/$RUST_SERVICE.service
sudo systemctl daemon-reload

# Disable Rust Nginx configuration
echo -e "${YELLOW}9. Disabling Rust Nginx configuration...${NC}"
sudo rm -f /etc/nginx/sites-enabled/$NGINX_RUST_CONFIG

# Free up memory used by Rust
echo -e "${YELLOW}10. Cleaning up memory...${NC}"
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null
echo -e "${GREEN}✓ Memory caches cleared${NC}"

# Show memory status
echo -e "${YELLOW}11. Current memory status:${NC}"
free -h

# Clean old logs
echo -e "${YELLOW}12. Cleaning old Rust logs...${NC}"
if [ -d "/var/log/rust-app" ]; then
    sudo tar -czf "$BACKUP_DIR/rust-logs.tar.gz" /var/log/rust-app/
    sudo rm -rf /var/log/rust-app/
    echo -e "${GREEN}✓ Logs archived and cleaned${NC}"
fi

# Run the Go setup script
echo -e "${BLUE}13. Ready to setup Go application${NC}"
echo -e "${YELLOW}Run the following command to setup Go application:${NC}"
echo -e "${GREEN}./server-setup.sh${NC}"

# Create restoration script
echo -e "${YELLOW}14. Creating restoration script...${NC}"
cat << EOF > "$BACKUP_DIR/restore-rust.sh"
#!/bin/bash
# Emergency Rust restoration script
echo "Restoring Rust application..."

# Restore systemd service
sudo cp "$BACKUP_DIR/$RUST_SERVICE.service" /etc/systemd/system/
sudo systemctl daemon-reload

# Restore Nginx config
sudo cp "$BACKUP_DIR/$NGINX_RUST_CONFIG" /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/$NGINX_RUST_CONFIG /etc/nginx/sites-enabled/

# Restore application
sudo cp -r "$BACKUP_DIR/$(basename $RUST_DIR)" "$RUST_DIR"

# Start services
sudo systemctl start $RUST_SERVICE
sudo systemctl enable $RUST_SERVICE
sudo nginx -t && sudo systemctl reload nginx

echo "Rust application restored!"
EOF
chmod +x "$BACKUP_DIR/restore-rust.sh"

# Summary
echo -e "${GREEN}=== Migration Preparation Complete ===${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo "✓ Rust application stopped and disabled"
echo "✓ Full backup created at: $BACKUP_DIR"
echo "✓ Memory freed up"
echo "✓ Emergency restore script created"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run: ${GREEN}./server-setup.sh${NC} to install Go application"
echo "2. Deploy your Go binary and static files"
echo "3. Test thoroughly before removing backups"
echo ""
echo -e "${RED}Emergency rollback:${NC}"
echo "Run: ${GREEN}$BACKUP_DIR/restore-rust.sh${NC}"
echo ""
echo -e "${BLUE}After 30 days of stable operation, remove backups:${NC}"
echo "sudo rm -rf $BACKUP_DIR"

# Optional: Show what will be freed
echo -e "${YELLOW}Space that will be freed after backup removal:${NC}"
du -sh "$RUST_DIR" 2>/dev/null || echo "Rust directory not found"
du -sh "$BACKUP_DIR"