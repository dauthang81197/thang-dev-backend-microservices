# 🚀 Quick Start Guide - Backend Deployment

## ⚡ Fastest Way to Deploy

### 1️⃣ Setup EC2 Server (One-time)

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run setup script
curl -fsSL https://raw.githubusercontent.com/your-org/repo/main/scripts/setup-ec2.sh | bash

# Log out and log back in
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2️⃣ Configure GitHub Secrets

Go to: `Settings > Secrets and variables > Actions`

Add these secrets:

```
EC2_HOST_BACKEND=your-ec2-ip
EC2_USER=ubuntu
EC2_SSH_KEY=<paste your private key>
DB_USER=postgres
DB_PASSWORD=your_strong_password
DB_NAME=course_db
JWT_SECRET=your_jwt_secret_at_least_32_chars
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
CORS_ORIGIN=https://yourdomain.com
```

### 3️⃣ Deploy

```bash
# Push to develop branch
git add .
git commit -m "Deploy backend"
git push origin develop
```

**That's it!** 🎉 GitHub Actions will automatically:

- ✅ Run lint checks
- ✅ Build 3 Docker images
- ✅ Copy to EC2
- ✅ Start all services
- ✅ Run health checks

---

## 📊 Check Deployment Status

### On GitHub

1. Go to `Actions` tab
2. Click latest workflow run
3. Watch real-time logs

### On EC2

```bash
ssh ubuntu@your-ec2-ip
cd ~/course-backend

# Check status
docker compose ps

# View logs
docker compose logs -f api-gateway

# Health check
./scripts/health-check.sh
```

---

## 🌐 Access Your API

```bash
# Health check
curl http://your-ec2-ip:8000/health

# Swagger docs
http://your-ec2-ip:8000/api/docs

# Test endpoint
curl http://your-ec2-ip:8000/api/courses
```

---

## 🛠️ Useful Commands

```bash
# Restart services
docker compose restart

# View logs
docker compose logs -f

# Update deployment
git pull && docker compose up -d --build

# Backup database
./scripts/backup-db.sh

# Health check
./scripts/health-check.sh
```

---

## 📖 Full Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[API_LEARNING_ENDPOINTS.md](./API_LEARNING_ENDPOINTS.md)** - API documentation
- **[API_THUMBNAIL_UPLOAD.md](./docs/API_THUMBNAIL_UPLOAD.md)** - Thumbnail upload API

---

## 🆘 Troubleshooting

### Deployment Failed?

```bash
# Check logs
docker compose logs --tail=100

# Restart
docker compose down && docker compose up -d
```

### Can't Access API?

```bash
# Check firewall
sudo ufw status

# Allow port 8000
sudo ufw allow 3001/tcp
```

### Database Issues?

```bash
# Check PostgreSQL
docker compose exec postgres psql -U postgres -c "SELECT version();"

# Run migrations
docker compose exec course-service npm run typeorm:course:migration:run
```

---

## 📞 Support

- Create GitHub Issue
- Check logs: `docker compose logs`
- Read full docs: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 Architecture

```
GitHub Actions → Build Images → Copy to EC2 → Deploy
                                                 ↓
                                    ┌──────────────────┐
                                    │   API Gateway    │ :8000
                                    │  (Public Access) │
                                    └────────┬─────────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        ↓                    ↓                    ↓
                ┌───────────────┐   ┌───────────────┐   ┌──────────────┐
                │   Identity    │   │    Course     │   │    Redis     │
                │   Service     │   │   Service     │   │  (Message)   │
                └───────┬───────┘   └───────┬───────┘   └──────────────┘
                        │                   │
                        └─────────┬─────────┘
                                  ↓
                          ┌──────────────┐
                          │  PostgreSQL  │
                          │  (Database)  │
                          └──────────────┘
```

---

Made with ❤️ for Course Platform
