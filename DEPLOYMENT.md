# 🚀 Backend Microservices Deployment Guide

## 📋 Architecture Overview

Hệ thống backend bao gồm 5 services chính:

1. **PostgreSQL** - Database chính
2. **Redis** - Message broker cho microservices communication
3. **Identity Service** (Port 3002) - Authentication & User Management
4. **Course Service** (Port 3003) - Course, Section, Lesson Management + R2 Storage
5. **API Gateway** (Port 8000) - REST API endpoints, routing, JWT validation

## 🔧 Prerequisites

### EC2 Server Requirements

- Ubuntu 20.04/22.04 LTS
- Docker & Docker Compose installed
- Minimum 2GB RAM, 2 vCPU
- Security Group: Allow inbound ports 3001, 5432 (optional), 6379 (optional)

### GitHub Secrets Configuration

Cần configure các secrets sau trong GitHub Repository:

#### EC2 Connection

```
EC2_HOST_BACKEND=your-ec2-ip-or-domain
EC2_USER=ubuntu
EC2_SSH_KEY=<your-private-key-content>
```

#### Database

```
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=course_db
```

#### JWT Authentication

```
JWT_SECRET=your_jwt_secret_minimum_32_chars
```

#### Cloudflare R2 Storage

```
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

#### CORS (Optional)

```
CORS_ORIGIN=https://yourdomain.com
```

#### Docker Hub (Optional)

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password
```

---

## 🏗️ Manual Deployment (Local/Testing)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/thang-dev-backend-microservices.git
cd thang-dev-backend-microservices
```

### 2. Create .env file

```bash
cp .env.production.example .env
# Edit .env with your values
nano .env
```

### 3. Build and Start Services

```bash
# Build all images
docker compose build

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Verify Services

```bash
# Check API Gateway
curl http://localhost:8000/health

# Check all containers
docker compose ps
```

---

## 🤖 Automated Deployment with GitHub Actions

### Workflow Trigger

Workflow tự động chạy khi:

- **Push** to `develop` or `main` branch → Build + Deploy
- **Pull Request** to `develop` or `main` → Build + Lint only
- **Manual trigger** via GitHub Actions UI

### Deployment Steps

1. **Lint Check** - Kiểm tra code quality
2. **Build Images** - Build 3 Docker images:
   - `course-api-gateway:latest`
   - `course-identity:latest`
   - `course-service:latest`
3. **Copy to EC2** - SCP images và docker-compose.yml
4. **Deploy** - Load images, tạo .env, start containers
5. **Verify** - Health check và kiểm tra logs

### Monitoring Deployment

Xem logs trong GitHub Actions:

- ✅ Green = Success
- ❌ Red = Failed
- 🟡 Yellow = In progress

---

## 📦 Docker Images

### Built Images

- `course-api-gateway:latest` (~200MB)
- `course-identity:latest` (~200MB)
- `course-service:latest` (~200MB)

### Base Images

- `node:22-alpine` - Lightweight Node.js
- `postgres:16-alpine` - PostgreSQL database
- `redis:7-alpine` - Redis cache

---

## 🔍 Troubleshooting

### Check Container Status

```bash
cd ~/course-backend
docker compose ps
```

### View Logs

```bash
# All services
docker compose logs --tail=100

# Specific service
docker compose logs -f api-gateway
docker compose logs -f identity-service
docker compose logs -f course-service
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart api-gateway
```

### Database Migration

```bash
# Run migration in course service
docker compose exec course-service npm run typeorm:course:migration:run
```

### Clean Up

```bash
# Stop all
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Remove images
docker image prune -a -f
```

---

## 🌐 API Endpoints

### Base URL

```
http://your-ec2-ip:8000
```

### Health Check

```bash
curl http://your-ec2-ip:8000/health
```

### Swagger Documentation

```
http://your-ec2-ip:8000/api/docs
```

### Main Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/courses` - Get all courses
- `POST /api/admin/courses` - Create course (Admin)
- `POST /api/admin/courses/:courseId/thumbnail` - Upload thumbnail

---

## 🔒 Security Best Practices

1. **Change Default Passwords** - Đổi DB_PASSWORD, JWT_SECRET
2. **Use HTTPS** - Setup Nginx reverse proxy với SSL
3. **Firewall Rules** - Chỉ allow ports cần thiết
4. **Environment Variables** - Không commit .env vào Git
5. **Regular Updates** - Update Docker images thường xuyên

---

## 📊 Service Ports

| Service     | Port | Description    |
| ----------- | ---- | -------------- |
| API Gateway | 3001 | Main REST API  |
| Identity    | 3002 | Internal only  |
| Course      | 3003 | Internal only  |
| PostgreSQL  | 5432 | Database       |
| Redis       | 6379 | Message broker |

---

## 🔄 Update Deployment

### From GitHub

```bash
# Just push to develop/main branch
git add .
git commit -m "Update backend"
git push origin develop
```

### Manual Update on EC2

```bash
cd ~/course-backend
git pull origin develop
docker compose down
docker compose build
docker compose up -d
```

---

## 📞 Support

For issues or questions:

- Check logs: `docker compose logs`
- GitHub Issues: [Create Issue](https://github.com/your-org/repo/issues)
- Documentation: `/docs` folder

---

## 📝 Notes

- **First Deploy**: Có thể mất 3-5 phút để pull images
- **Health Checks**: Services cần ~30s để ready
- **Data Persistence**: PostgreSQL và Redis data được lưu trong Docker volumes
- **Hot Reload**: Không có hot reload trong production, cần rebuild để update code
