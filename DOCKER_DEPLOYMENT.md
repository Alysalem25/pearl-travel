# Pearl Travel - Docker Deployment Guide

## Prerequisites
- Hostinger VPS with Docker and Docker Compose installed
- Git installed
- Your repository URL (public access)

## Deployment Steps for Hostinger Docker Manager

### 1. **Prepare Your Environment**

First, update the `.env.production` file with your actual values:

```bash
# .env.production
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password_here
MONGO_DATABASE=pearl_travel
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://your-hostinger-domain.com:5000
PORT=5000
```

Replace:
- `your_secure_password_here` with a strong password
- `your-hostinger-domain.com` with your actual domain

### 2. **Using Hostinger Docker Manager**

1. Open your Hostinger VPS Dashboard
2. Navigate to **Docker Manager** (or your container management interface)
3. Click **Create New Application** or **Add Container**
4. Select **Docker Compose**
5. Paste your repository URL in the Git URL field
6. The system will detect the `docker-compose.yml` file
7. Add environment variables from your `.env.production` file
8. Click **Deploy**

### 3. **Manual Deployment (Alternative)**

If Hostinger Docker Manager requires manual setup:

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Clone the repository
git clone your-repository-url
cd pearl-travel

# Create .env file
cp .env.production .env

# Edit .env with your settings
nano .env

# Start the containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Configuration Details

### Services in docker-compose.yml:
- **Nginx** (Ports 80, 443): Reverse proxy, routing, and SSL termination
  - Routes `/api/*` to backend server
  - Routes all other traffic to frontend client
- **MongoDB** (Port 27017): Database service (internal only)
- **Server** (Port 5000): Node.js/Express API (internal only)
- **Client** (Port 3000): Next.js Frontend (internal only)

### Nginx Architecture:
```
User Request (Port 80/443)
        ↓
    Nginx (Reverse Proxy)
      ↙    ↘
  /api/*    /* (frontend)
    ↓         ↓
 Server    Client
    ↓
MongoDB
```

## Environment Variables to Configure:

```env
# Database Credentials
MONGO_USERNAME=admin
MONGO_PASSWORD=strong_password
MONGO_DATABASE=pearl_travel

# API Configuration
NEXT_PUBLIC_API_URL=http://your-domain.com

# Optional: Add JWT token or other backend secrets
# JWT_SECRET=your_jwt_secret
```

## Nginx Configuration & SSL Setup

### Enable HTTPS (SSL/TLS):

1. **Obtain SSL Certificate** (using Let's Encrypt):
   ```bash
   # On your Hostinger VPS
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
   ```

2. **Update nginx.conf** - Uncomment the HTTPS section in `nginx.conf`:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
   }
   ```

3. **Mount SSL Certificates** - Update `docker-compose.yml`:
   ```yaml
   volumes:
     - ./certs/cert.pem:/etc/nginx/ssl/cert.pem:ro
     - ./certs/key.pem:/etc/nginx/ssl/key.pem:ro
   ```

4. **HTTP to HTTPS Redirect** - Uncomment in `nginx.conf`:
   ```nginx
   return 301 https://$host$request_uri;
   ```

### Update NEXT_PUBLIC_API_URL for HTTPS:
```env
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Troubleshooting

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs server
docker-compose logs client
docker-compose logs mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart server
```

### Check Network Connectivity
```bash
# Access MongoDB directly
docker exec -it pearl_travel_mongodb mongosh -u admin -p your_password

# Test API
curl http://localhost:5000/api/your-endpoint
```

## Security Recommendations

1. **Change Default Credentials**: Update MongoDB username/password
2. **Use HTTPS**: Configure SSL/TLS on your domain (see Nginx Configuration section)
3. **Environment Variables**: Keep sensitive data in `.env` file (not in git)
4. **Firewall**: Only expose ports 80 and 443 (HTTP/HTTPS)
5. **API Rate Limiting**: Implement rate limiting on your backend
6. **CORS Configuration**: With Nginx as reverse proxy:
   - Update `NEXT_PUBLIC_API_URL` in `.env` to `http://your-domain.com` (without port)
   - Backend CORS should allow `http://your-domain.com` and `https://your-domain.com`
   - All requests go through Nginx (same domain/origin), eliminating CORS issues

## Ports

- **80**: HTTP traffic (Nginx public)
- **443**: HTTPS/SSL traffic (Nginx public) - configure after obtaining SSL certificate
- **5000**: Backend API (internal - routed through Nginx)
- **3000**: Frontend (internal - routed through Nginx)
- **27017**: MongoDB (internal only, never expose)

## File Uploads

Uploaded files are stored at:
- `/app/server/uploads/categories/`
- `/app/server/uploads/countries/`
- `/app/server/uploads/programs/`
- `/app/server/uploads/users/`
- `/app/server/uploads/Cruisies/`

These are mapped to a Docker volume for persistence.

## Using Hostinger Email or Other Services

If you're using Hostinger's additional services (email, cdn, etc.), configure the API URLs in your `.env.production` file accordingly.

## Updates & Redeployment

To update your app:

```bash
git pull origin main
docker-compose up -d --build
```

## Nginx File Structure

You now have three additional files for Nginx:

- **nginx.conf**: Nginx configuration with routing rules
- **Dockerfile.nginx**: Nginx Docker image builder
- **docker-compose.yml**: Updated to include Nginx service

### Key Nginx Features:

✅ **Reverse Proxy**: Routes requests to correct service
✅ **SSL/TLS Support**: Ready for HTTPS configuration
✅ **Gzip Compression**: Reduces bandwidth usage
✅ **Load Balancing**: Can be extended for multiple backend instances
✅ **Health Checks**: Built-in health check endpoint at `/health`
✅ **Large File Upload Support**: Configured for up to 50MB uploads

## Need More Help?

Check the original `.env.example` file for all available configuration options.
