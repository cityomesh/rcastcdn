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

2. Install NVM (Node Version Manager):

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc  # or source ~/.zshrc if using zsh
   ```

3. Install Node.js using NVM (the project requires Node.js 18.17 or later):

   ```bash
   nvm install --lts
   nvm alias default lts/*
   ```

4. Verify the installation:

   ```bash
   node -v
   npm -v
   ```

5. Install PM2 globally for process management:

   ```bash
   npm install -g pm2
   ```

6. Create a directory for the application:

   ```bash
   mkdir -p /var/www/ulka-cdn
   ```

7. Set temporary permissions
   ```bash
   ssh username@103.189.178.94
   sudo mkdir -p /var/www/ulka-cdn
   sudo chmod 777 /var/www/ulka-cdn  # Temporarily set permissions
   exit
   ```

### 2. File Transfer

From your local machine, transfer files to the server:

```bash
scp -r /Users/ujjwal.tiwari/Desktop/carZozo/ulka-cdn/* username@103.189.178.94:/var/www/ulka-cdn/
```

after it completes, SSH back in and reset permissions:

```bash
ssh username@103.189.178.94
sudo chmod 755 /var/www/ulka-cdn
```

### 3. Application Setup

1. SSH back into the server and navigate to your project directory:

   ```bash
   ssh username@103.189.178.94
   cd /var/www/ulka-cdn
   ```

2. Install dependencies:

   ```bash
   npm install
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
   NEXT_PUBLIC_API_URL=http://103.189.178.94:3000  # or your domain
   ```

4. Build the application:

   ```bash
   npm run build
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

### 4. Setting up Nginx (Recommended)

1. Install Nginx:

   ```bash
   sudo apt update
   sudo apt install nginx
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
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site and test the configuration:

   ```bash
   sudo ln -s /etc/nginx/sites-available/ulka-cdn /etc/nginx/sites-enabled/
   sudo nginx -t
   ```

5. If the test is successful, restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### 5. SSL with Let's Encrypt (Optional)

If you have a domain name pointing to your server:

1. Install Certbot:

   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain an SSL certificate:

   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. Follow the prompts to complete the installation.

### 6. Monitoring and Maintenance

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
   cd ~/ulka-cdn  # or /var/www/ulka-cdn
   git pull  # if using git
   npm install  # if dependencies changed
   npm run build
   pm2 restart ulka-cdn
   ```

## Troubleshooting

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

### Node.js Version Issues

If you need to switch Node.js versions:

```bash
nvm use <version>  # or your preferred version
```
