# Pearl Travel - Deployment Guide

## Overview
This guide walks you through deploying the Pearl Travel application to a Hostinger VPS using Docker and GitHub Actions CI/CD.

**Prerequisites:**
- Hostinger VPS with Ubuntu 22.04 LTS
- Git repository set up on GitHub
- Domain name (pointing to your VPS)
- SSH access to your VPS
- Basic Linux knowledge

---

## Phase 1: VPS Setup (Do this once)

### 1. Connect to Your VPS via SSH

```bash
ssh root@your_server_ip
```

### 2. Create a Deploy User (Security Best Practice)

```bash
# Create dedicated deploy user
adduser deploy

# Add to sudo group for Docker commands
usermod -aG sudo deploy
usermod -aG docker deploy

# Switch to deploy user
su - deploy
```

### 3. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add deploy user to docker group
sudo usermod -aG docker deploy

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 4. Configure Firewall

```bash
sudo ufw enable
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 5000/tcp    # Backend (optional, for debugging)
sudo ufw status
```

### 5. Set Up Deployment Directory

```bash
# Create deployment directory
sudo mkdir -p /home/deploy/pearl-travel
sudo chown deploy:deploy /home/deploy/pearl-travel

# Change to deploy user
su - deploy
cd /home/deploy/pearl-travel
```

### 6. Clone Repository

```bash
git clone https://github.com/your-username/pearl-travel.git .
# Or if already cloned:
git pull origin main
```

---

## Phase 2: Environment Configuration

### 1. Create Environment Files

```bash
# Navigate to project
cd /home/deploy/pearl-travel

# Create .env for backend (Docker will use these)
cat > .env << EOF
PORT=5000
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
MONGO_URI=mongodb://admin:$(grep MONGO_ROOT_PASSWORD .env | cut -d= -f2)@mongodb:27017/pearl-travel-project?authSource=admin
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=https://your-domain.com
NODE_ENV=production
EOF

# Create client environment (optional, can use defaults)
cat > client/.env.production << EOF
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NEXT_PUBLIC_AUTH_USER_KEY=auth_user
EOF
```

**⚠️ IMPORTANT:** Replace `your-domain.com` with your actual domain!

### 2. Secure Your Secrets

```bash
# Make env files readable only by owner
chmod 600 .env
chmod 600 server/.env

# Never commit .env files (they should be in .gitignore)
# Already included: ✅ .env
#                  ✅ .env.*
```

### 3. Verify Environment Variables

```bash
# Check MongoDB password is set
grep MONGO_ROOT_PASSWORD .env

# Check JWT secret is set
grep JWT_SECRET .env
```

---

## Phase 3: First-Time Deployment

### 1. Build and Start Services

```bash
cd /home/deploy/pearl-travel

# Pull latest code
git pull origin main

# Build Docker images
docker-compose build

# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d
```

### 2. Monitor Startup (takes 30-60 seconds)

```bash
# Watch containers start
watch -n 2 docker-compose ps

# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs -f backend
```

### 3. Verify All Services Are Running

```bash
# Check all containers are healthy
docker ps --format "table {{.Names}}\t{{.Status}}"

# Test backend API
curl http://localhost:5000/stats

# Test MongoDB connection
docker-compose exec mongodb mongosh admin -u admin -p your_password --eval "db.adminCommand('ping')"
```

### 4. Database Initialization (First-Time Only)

```bash
# Create database indexes (if your app has initialization scripts)
docker-compose exec backend node scripts/init-db.js

# Verify database created
docker-compose exec mongodb mongosh admin -u admin -p your_password
# Inside mongosh:
# > use 'pearl-travel-project'
# > show collections
# > exit()
```

---

## Phase 4: Domain & HTTPS Setup

### 1. Point Domain to VPS

In your domain registrar (GoDaddy, Namecheap, etc.):
- Create A record pointing to your VPS IP address
- Wait for DNS propagation (5-30 minutes)

```bash
# Verify DNS is working
nslookup your-domain.com
dig your-domain.com
```

### 2. Install Nginx as Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo tee /etc/nginx/sites-available/pearl-travel << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (we'll set these up next with Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Upload directory
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
    }
}
EOF

# Test Nginx config
sudo nginx -t

# Enable site
sudo ln -sf /etc/nginx/sites-available/pearl-travel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Start Nginx
sudo systemctl restart nginx
```

### 3. Set Up HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Verify certificate
sudo certbot certificates

# Auto-renewal is usually set up automatically
sudo systemctl status certbot.timer
```

### 4. Test HTTPS Access

```bash
# Test from local machine
curl https://your-domain.com

# Or visit in browser
# https://your-domain.com
```

---

## Phase 5: GitHub Actions Setup

### 1. Generate SSH Key for Deployment

```bash
# On your VPS (as deploy user)
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# Get private key (for GitHub secrets)
cat ~/.ssh/deploy_key

# Add public key to authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2. Add GitHub Secrets

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret Name | Value |
|------------|-------|
| `DEPLOY_SSH_KEY` | Content of `~/.ssh/deploy_key` (private key) |
| `SERVER_IP` | Your VPS IP address |
| `SERVER_USER` | `deploy` |
| `DEPLOY_PATH` | `/home/deploy/pearl-travel` |

### 3. Verify GitHub Actions Workflow

```bash
# Push a test commit
git add .
git commit -m "chore: add deployment files"
git push origin main

# Check GitHub Actions tab → Deploy workflow
# Should see green ✅ checkmark when complete
```

---

## Phase 6: Ongoing Deployments

### Option A: Automatic (GitHub Actions)

1. Make code changes
2. Commit and push to `main` branch
3. GitHub Actions automatically:
   - Builds Docker images
   - Pushes to VPS via SSH
   - Restarts containers
4. Your changes go live!

### Option B: Manual Command

```bash
# Use deployment script
cd /path/to/local/repo
SERVER_IP=your.server.ip SERVER_USER=deploy DEPLOY_PATH=/home/deploy/pearl-travel ./scripts/deploy.sh main
```

### Option C: Manual SSH

```bash
# SSH into VPS
ssh deploy@your_server_ip

# Navigate to project
cd /home/deploy/pearl-travel

# Pull changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

---

## Monitoring & Troubleshooting

### View Live Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100
```

### Common Issues

#### 1. Backend can't connect to MongoDB

```bash
# Check MongoDB is running
docker-compose ps

# Check MongoDB credentials
docker-compose exec mongodb mongosh admin -u admin -p your_password --eval "db.adminCommand('ping')"

# Check backend logs
docker-compose logs backend
```

**Solution:**
- Verify `MONGO_URI` in `.env` matches container name
- Ensure MongoDB password is correct
- Wait 30 seconds for MongoDB to be ready

#### 2. Frontend can't connect to Backend

```bash
# Check backend is running
docker-compose logs backend | grep "listening"

# Test backend from inside frontend container
docker-compose exec frontend curl http://backend:5000/stats

# Check NEXT_PUBLIC_API_URL environment variable
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL
```

**Solution:**
- Make sure backend is fully started (check logs)
- Verify firewall allows port 5000
- Check `NEXT_PUBLIC_API_URL` is set correctly

#### 3. HTTPS certificate issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. Restart Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (⚠️ WARNING: This deletes data!)
docker-compose down -v

# Rebuild and start fresh
docker-compose build
docker-compose up -d
```

### Health Check Commands

```bash
# API status
curl https://your-domain.com/api/stats

# Database size
docker-compose exec mongodb mongosh admin -u admin -p password --eval "db.stats()"

# Disk usage
docker system df

# Clean up unused images/containers
docker system prune -a
```

---

## Backup Strategy

### Backup MongoDB Data

```bash
# Create backups directory
mkdir ~/backups

# Backup database
docker-compose exec -T mongodb mongodump --username admin --password your_password --authenticationDatabase admin --uri="mongodb://admin:your_password@localhost:27017" --archive=/tmp/backup.archive

# Copy to local machine
docker-compose cp mongodb:/tmp/backup.archive ~/backups/mongodb_$(date +%Y%m%d_%H%M%S).archive
```

### Restore MongoDB Data

```bash
# Copy backup to container
docker cp ~/backups/mongodb_20240301_120000.archive $(docker-compose ps -q mongodb):/tmp/backup.archive

# Restore
docker-compose exec -T mongodb mongorestore --username admin --password your_password --authenticationDatabase admin --archive=/tmp/backup.archive
```

---

## Performance Optimization

### Enable Docker layer caching

Edit `.github/workflows/deploy.yml` to use BuildKit:

```yaml
- name: Build with cache
  run: |
    DOCKER_BUILDKIT=1 docker-compose build
```

### Monitor Resource Usage

```bash
# Real-time monitoring
docker stats

# View resource limits
docker-compose ps --format "table={{.Names}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## Rollback Procedure

If a deployment goes wrong:

```bash
# SSH to VPS
ssh deploy@your_server_ip

# Go to project
cd /home/deploy/pearl-travel

# View git history
git log --oneline -10

# Rollback to previous version
git reset --hard HEAD~1

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
```

---

## Useful Commands Reference

```bash
# Start/Stop services
docker-compose up -d          # Start in background
docker-compose down           # Stop all services
docker-compose restart        # Restart services

# View status
docker-compose ps             # Show running containers
docker-compose ps -a          # Show all containers

# Logs
docker-compose logs           # View logs
docker-compose logs -f        # Follow logs (live)
docker-compose logs backend   # Specific service

# Rebuild
docker-compose build          # Rebuild images
docker-compose build --no-cache  # Rebuild without cache

# Shell access
docker-compose exec backend sh     # Access backend container
docker-compose exec frontend sh    # Access frontend container
docker-compose exec mongodb mongosh # Access MongoDB

# Database management
docker-compose exec mongodb mongosh admin -u admin
# Inside MongoDB shell:
# > use 'pearl-travel-project'
# > db.users.find().limit(5)
# > db.programs.countDocuments()

# Clean up
docker system prune            # Remove unused images/containers
docker volume prune            # Remove unused volumes
```

---

## Support & Questions

If you encounter issues:

1. Check logs: `docker-compose logs`
2. Check this guide's troubleshooting section
3. Check Docker documentation: https://docs.docker.com
4. Check Next.js deployment: https://nextjs.org/docs/deployment
5. Check Express.js docs: https://expressjs.com

---

**Last Updated:** March 1, 2024
**Next.js Version:** 16.1.3
**Node.js Version:** 20-alpine
**Docker Version:** 20+
