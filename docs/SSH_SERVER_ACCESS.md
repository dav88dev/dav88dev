# SSH Server Access Configuration

## Server Details
- **IP**: 129.80.170.232
- **Username**: ubuntu
- **SSH Key**: `/media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key`

## Connect to Server

```bash
# Set correct permissions for SSH key (first time only)
chmod 600 "/media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key"

# Connect to server
ssh -i "/media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key" ubuntu@129.80.170.232
```

## For Easier Access (Optional)

Add this to your `~/.ssh/config`:

```
Host portfolio-vps
    HostName 129.80.170.232
    User ubuntu
    IdentityFile /media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key
    StrictHostKeyChecking no
```

Then you can simply connect with:
```bash
ssh portfolio-vps
```

## Run Server Setup

Once connected:
```bash
# 1. Download and run migration script (removes Rust app)
wget https://raw.githubusercontent.com/dav88dev/myWebsite/feature/go-migration/scripts/migrate-rust-to-go.sh
chmod +x migrate-rust-to-go.sh
./migrate-rust-to-go.sh

# 2. Download and run server setup script
wget https://raw.githubusercontent.com/dav88dev/myWebsite/feature/go-migration/scripts/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh

# 3. After setup completes and domain is pointing to server:
sudo certbot --nginx -d dav88.dev -d www.dav88.dev

# 4. Enable SSL configuration
wget https://raw.githubusercontent.com/dav88dev/myWebsite/feature/go-migration/scripts/enable-ssl.sh
chmod +x enable-ssl.sh
./enable-ssl.sh
```

## Manual Deployment (if needed)

From your local machine:
```bash
# Build
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o portfolio-server .
cd frontend && npm run build && cd ..

# Upload
scp -i "/media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key" portfolio-server ubuntu@129.80.170.232:/tmp/portfolio-server.new
scp -i "/media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key" -r static ubuntu@129.80.170.232:/tmp/static.new

# Deploy
ssh -i "/media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key" ubuntu@129.80.170.232 "sudo mv /tmp/portfolio-server.new /var/www/portfolio/ && sudo mv /tmp/static.new /var/www/portfolio/ && cd /var/www/portfolio && sudo -u portfolio ./deploy.sh"
```

## CircleCI Configuration

For CircleCI to work with this server:

1. Convert the key to base64 (run locally):
```bash
base64 -w 0 "/media/dav88dev/ReserveDisk1/SITE SERVERS KEY IMPORTENT/ssh-site.key" > ssh-key-base64.txt
```

2. In CircleCI Project Settings:
   - Go to Environment Variables
   - Add: `VPS_SSH_KEY_BASE64` with the content from ssh-key-base64.txt
   - Add: `VPS_HOST` = `129.80.170.232`
   - Add: `VPS_USER` = `ubuntu`

3. Delete the base64 file:
```bash
rm ssh-key-base64.txt
```