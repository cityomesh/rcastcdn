# Next.js Deployment Guide for Ulka CDN

This guide outlines the steps to deploy the Ulka CDN Next.js application to a remote server.

## Prerequisites

- SSH access to the server (username and password)
- Node.js and npm on your local machine

## Deployment Steps

### 1. Server Preparation

1. SSH into your server:

   ```bash
   ssh username@103.189.178.94
   ```

2. Update system packages:

   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y build-essential
   ```

3. Install NVM (Node Version Manager):

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc  # or source ~/.zshrc if using zsh
   ```

4. Install Node.js using NVM (the project requires Node.js 18.17 or later):

   ```bash
   nvm install --lts
   nvm alias default lts/*
   ```

5. Verify the installation:

   ```bash
   node -v
   npm -v
   ```

6. Install PM2 globally for process management:

   ```bash
   npm install -g pm2
   ```

7. Create a directory for the application:

   ```bash
   sudo mkdir -p /var/www/ulka-cdn
   ```

8. Set proper permissions:
   ```bash
   sudo chown -R $USER:$USER /var/www/ulka-cdn
   ```

### 2. File Transfer (Option 1: SCP)

From your local machine, transfer files to the server:

```bash
scp -r /path/to/ulka-cdn/* username@103.189.178.94:/var/www/ulka-cdn/
```

### 2. File Transfer (Option 2: Git Clone)

If your code is in a git repository, you can clone it directly:

```bash
git clone https://github.com/your-org/ulka-cdn.git /var/www/ulka-cdn
```

### 3. Application Setup

1. Navigate to your project directory:

   ```bash
   cd /var/www/ulka-cdn
   ```

2. Install dependencies (use npm ci for more reliable builds):

   ```bash
   npm ci
   ```

3. Create or update the `.env` file with production values:

   ```bash
   nano .env
   ```

   Add/update the following values:

   ```
   SSH_HOST=your_ssh_host
   SSH_PORT=your_ssh_port
   SSH_USERNAME=your_ssh_username
   SSH_PASSWORD=your_ssh_password
   NEXT_PUBLIC_API_URL=http://103.189.178.94:3001  # Update with your API URL
   ```

   Save and exit nano:

   1. Press `Ctrl + O` to write out (save) the file
   2. Press `Enter` to confirm the filename
   3. Press `Ctrl + X` to exit nano

4. Build the application:

   ```bash
   NODE_ENV=production npm run build
   ```

5. Start the application with PM2:

   ```bash
   pm2 start npm --name "ulka-cdn" -- start
   ```

6. Set up PM2 to start on system boot:

   ```bash
   pm2 startup
   # Run the command that PM2 outputs
   pm2 save
   ```

7. Verify the application is running:
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

### 4. Setting up Nginx as a Reverse Proxy

1. Install Nginx:

   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. Create a new Nginx site configuration:

   ```bash
   sudo nano /etc/nginx/sites-available/ulka-cdn
   ```

3. Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name 103.189.178.94;  # Replace with your domain if available

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site and test the configuration:

   ```bash
   sudo ln -s /etc/nginx/sites-available/ulka-cdn /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site if needed
   sudo nginx -t
   ```

5. If the test is successful, restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### 5. Configure Firewall

Set up a basic firewall to allow only necessary traffic:

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 6. SSL Setup (Two Options)

#### Option 1: Self-signed Certificate (for IP addresses or testing)

```bash
# Create directory for certificate
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/ulka-cdn.key -out /etc/nginx/ssl/ulka-cdn.crt

# Edit Nginx config
sudo nano /etc/nginx/sites-available/ulka-cdn
```

Update the Nginx configuration:

```nginx
server {
    listen 80;
    server_name 103.189.178.94;  # Replace with your server IP
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name 103.189.178.94;  # Replace with your server IP

    ssl_certificate /etc/nginx/ssl/ulka-cdn.crt;
    ssl_certificate_key /etc/nginx/ssl/ulka-cdn.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

Note: Browsers will show a security warning with self-signed certificates.

#### Option 2: Let's Encrypt (for domain names only)

If you have a domain name pointing to your server:

1. Install Certbot:

   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. Obtain an SSL certificate:

   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. Follow the prompts to complete the installation.

### 7. Monitoring and Maintenance

1. Monitor the application logs:

   ```bash
   pm2 logs ulka-cdn
   ```

2. Restart the application if needed:

   ```bash
   pm2 restart ulka-cdn
   ```

3. Update the application (when you have new changes):
   ```bash
   cd /var/www/ulka-cdn
   git pull  # if using git
   npm ci    # more reliable than npm install
   NODE_ENV=production npm run build
   pm2 restart ulka-cdn
   ```

## Troubleshooting

### Next.js Build Issues

If you encounter build errors, try clearing the cache:

```bash
rm -rf .next
rm -rf node_modules/.cache
npm ci
NODE_ENV=production npm run build
```

### SSH2 Module Issues

If you encounter issues with the SSH2 module during build, ensure the `next.config.ts` file contains:

```typescript
const nextConfig: NextConfig = {
  serverComponentsExternalPackages: ["ssh2"],
  // other config options...
};
```

### Permission Issues

If you encounter permission issues:

```bash
sudo chown -R $USER:$USER /path/to/directory
```

### Nginx Issues

Check Nginx logs for errors:

```bash
sudo tail -f /var/log/nginx/error.log
```

### PM2 Issues

If the process doesn't start after server reboot:

```bash
pm2 resurrect
```

### Node.js Version Issues

If you need to switch Node.js versions:

```bash
nvm use <VERSION>  # or your preferred version
```
