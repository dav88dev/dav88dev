#!/bin/bash
# Make server fully autonomous

# 1. Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure to auto-reboot if needed
echo 'Unattended-Upgrade::Automatic-Reboot "true";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot-Time "03:00";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades

# 2. Set up Docker container health monitoring and auto-restart
sudo tee /etc/systemd/system/portfolio-health.service << 'EOF'
[Unit]
Description=Portfolio Health Monitor
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=60
ExecStart=/bin/bash -c 'while true; do if ! curl -f http://localhost/health > /dev/null 2>&1; then docker restart portfolio; fi; sleep 30; done'

[Install]
WantedBy=multi-user.target
EOF

# Enable the health monitor
sudo systemctl enable portfolio-health.service
sudo systemctl start portfolio-health.service

# 3. Weekly server reboot (Sunday 4 AM)
(sudo crontab -l 2>/dev/null; echo "0 4 * * 0 /sbin/reboot") | sudo crontab -

# 4. Docker cleanup weekly
(sudo crontab -l 2>/dev/null; echo "0 3 * * 0 docker system prune -af") | sudo crontab -

echo "✅ Server is now on autopilot!"
echo "- Auto security updates: Enabled"
echo "- Container health monitoring: Every 30 seconds"
echo "- Weekly reboot: Sunday 4 AM"
echo "- Docker cleanup: Sunday 3 AM"