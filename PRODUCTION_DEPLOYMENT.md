# Production Deployment Guide (EC2)

## Overview
Hướng dẫn deploy microservices lên EC2 với cấu hình production. Database và Redis sẽ được cài đặt trực tiếp trên EC2, không chạy trong Docker.

## Kiến trúc

### Trên EC2:
- **PostgreSQL**: Cài trực tiếp trên EC2 (không Docker)
- **Redis**: Cài trực tiếp trên EC2 (không Docker)
- **Docker Containers**: Chỉ chạy các microservices (identity-service, course-service, api-gateway)

## Prerequisites

### 1. Cài đặt PostgreSQL trên EC2

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo database và user
sudo -u postgres psql

# Trong PostgreSQL prompt:
CREATE DATABASE course_db;
CREATE USER your_db_user WITH ENCRYPTED PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE course_db TO your_db_user;
\q
```

### 2. Cài đặt Redis trên EC2

```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis (optional - bind to all interfaces for Docker containers)
sudo nano /etc/redis/redis.conf
# Tìm và sửa: bind 127.0.0.1 ::1 → bind 0.0.0.0

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Kết quả: PONG
```

### 3. Cài đặt Docker và Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Deployment Steps

### 1. Clone repository trên EC2

```bash
cd /home/ubuntu
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend
```

### 2. Tạo file .env.production

```bash
# Copy từ template
cp .env.production.example .env.production

# Chỉnh sửa với thông tin thực tế
nano .env.production
```

Nội dung file `.env.production`:

```env
# NODE ENVIRONMENT
NODE_ENV=production

# DATABASE (localhost vì PostgreSQL chạy trên cùng EC2)
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=course_db

# REDIS (localhost vì Redis chạy trên cùng EC2)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT CONFIGURATION
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CLOUDFLARE R2
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### 3. Build và chạy containers

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 4. Chạy migrations (nếu cần)

```bash
# Identity service migration
docker exec -it course-identity npm run migration:run

# Course service migration
docker exec -it course-service npm run migration:run
```

## Network Configuration

### Security Group trên AWS EC2

Mở các ports sau:

| Port | Service | Source |
|------|---------|--------|
| 22 | SSH | Your IP |
| 80 | HTTP | 0.0.0.0/0 |
| 443 | HTTPS | 0.0.0.0/0 |
| 8000 | API Gateway | 0.0.0.0/0 hoặc Load Balancer |
| 3002 | Identity Service | Internal (optional) |
| 3003 | Course Service | Internal (optional) |

### Nginx Reverse Proxy (Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Tạo config
sudo nano /etc/nginx/sites-available/api
```

Nội dung Nginx config:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
```

## Useful Commands

### Docker Management

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart a specific service
docker-compose -f docker-compose.prod.yml restart identity-service

# View logs
docker-compose -f docker-compose.prod.yml logs -f api-gateway

# Remove all containers and volumes
docker-compose -f docker-compose.prod.yml down -v

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Management

```bash
# Backup database
pg_dump -U your_db_user course_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U your_db_user course_db < backup_20240131.sql

# Access PostgreSQL
psql -U your_db_user -d course_db
```

### Redis Management

```bash
# Check Redis status
redis-cli ping

# Monitor Redis
redis-cli monitor

# Get info
redis-cli info
```

## Monitoring

### Health Checks

```bash
# API Gateway
curl http://localhost:8000/health

# Identity Service
curl http://localhost:3002/health

# Course Service
curl http://localhost:3003/health
```

### Container Stats

```bash
# View resource usage
docker stats

# View specific container
docker stats course-api-gateway
```

## Troubleshooting

### Container không connect được đến database

```bash
# Check PostgreSQL đang chạy
sudo systemctl status postgresql

# Test connection từ trong container
docker exec -it course-identity psql -h localhost -U your_db_user -d course_db

# Kiểm tra pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Thêm dòng: host all all 172.17.0.0/16 md5
sudo systemctl restart postgresql
```

### Container không connect được đến Redis

```bash
# Check Redis đang chạy
sudo systemctl status redis-server

# Test connection
redis-cli -h localhost -p 6379 ping

# Kiểm tra bind address trong redis.conf
sudo nano /etc/redis/redis.conf
# Đảm bảo: bind 0.0.0.0 (hoặc bind 127.0.0.1 172.17.0.1)
sudo systemctl restart redis-server
```

### Check container logs

```bash
# Identity service logs
docker logs course-identity --tail 100 -f

# Course service logs
docker logs course-service --tail 100 -f

# API Gateway logs
docker logs course-api-gateway --tail 100 -f
```

## Update & Redeploy

### Cập nhật code mới

```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml build

# Restart với zero-downtime (nếu có load balancer)
docker-compose -f docker-compose.prod.yml up -d --no-deps --build identity-service
docker-compose -f docker-compose.prod.yml up -d --no-deps --build course-service
docker-compose -f docker-compose.prod.yml up -d --no-deps --build api-gateway
```

## Security Best Practices

1. **Không commit file .env.production** vào Git
2. **Sử dụng strong passwords** cho database
3. **Thay đổi JWT_SECRET** trong production
4. **Setup firewall** (UFW):
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
5. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
6. **Backup database** thường xuyên
7. **Monitor logs** và set up alerts

## CI/CD Integration (Optional)

Có thể setup GitHub Actions để tự động deploy khi push code lên branch main. Tham khảo file `.github/workflows/deploy-production.yml`.
