# 🔐 GitHub Secrets Configuration Guide (CI/CD)

## Overview

Workflow này deploy microservices lên EC2 sử dụng Docker. **Tất cả biến môi trường production (database, JWT, R2, etc.) sẽ được cấu hình trực tiếp trên EC2**, không cần lưu trong GitHub Secrets.

GitHub Secrets chỉ cần cho việc kết nối SSH đến EC2 mà thôi.

## Required Secrets (CHỈ 3 CÁI)

### 1. EC2_HOST
IP address hoặc domain của EC2 instance.

```
EC2_HOST=54.123.456.789
```
hoặc
```
EC2_HOST=api.yourdomain.com
```

### 2. EC2_USER
Username để SSH vào EC2 (thường là `ubuntu` hoặc `ec2-user`).

```
EC2_USER=ubuntu
```

### 3. EC2_SSH_KEY
Private key để SSH vào EC2.

```
⚠️ IMPORTANT: Paste TOÀN BỘ nội dung private key bao gồm:
-----BEGIN RSA PRIVATE KEY-----
... (your key content) ...
-----END RSA PRIVATE KEY-----
```

---

## 📝 How to Add Secrets in GitHub

### 1. Navigate to Repository Settings

```
GitHub Repository → Settings → Secrets and variables → Actions
```

### 2. Click "New repository secret"

### 3. Add each secret with:

- **Name**: Exact name from above (case-sensitive)
- **Value**: Corresponding value

### 4. Save each secret

---

## 🔍 How to Get EC2_SSH_KEY

### Option 1: From existing PEM file

```bash
cat your-key.pem
# Copy the entire output including BEGIN/END lines
```

### Option 2: Generate new key pair

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -f ec2-deploy-key

# Copy public key to EC2
ssh-copy-id -i ec2-deploy-key.pub ubuntu@your-ec2-ip

# Use private key as secret
cat ec2-deploy-key
```

---

## ✅ Verification Checklist

After adding secrets, verify:

- [ ] All required secrets are added
- [ ] EC2_SSH_KEY includes BEGIN/END lines
- [ ] No extra spaces or newlines in secrets
- [ ] EC2_HOST is correct IP or domain
- [ ] DB_PASSWORD is strong and secure
- [ ] JWT_SECRET is at least 32 characters
- [ ] R2 credentials are correct
- [ ] CORS_ORIGIN matches your frontend domain

---

## 🐛 Troubleshooting

---

## 📝 How to Add Secrets in GitHub

### Step 1: Navigate to Repository Settings

```
Your GitHub Repository → Settings → Secrets and variables → Actions
```

### Step 2: Click "New repository secret"

### Step 3: Add the 3 required secrets:

| Name | Value |
|------|-------|
| EC2_HOST | Your EC2 IP or domain |
| EC2_USER | ubuntu (or ec2-user) |
| EC2_SSH_KEY | Your complete private key |

### Step 4: Save each secret

---

## 🔍 How to Get EC2_SSH_KEY

### Option 1: From existing PEM file

```bash
cat your-key.pem
# Copy the entire output including BEGIN/END lines
```

### Option 2: From ~/.ssh

```bash
cat ~/.ssh/id_rsa
# Or whatever your key file is named
```

### ⚠️ IMPORTANT: Copy the FULL key including headers

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(many lines of key content)
...xyz123
-----END RSA PRIVATE KEY-----
```

---

## 🔧 Setup Biến Môi Trường trên EC2

### Các biến môi trường production được cấu hình TRỰC TIẾP trên EC2, KHÔNG qua GitHub Secrets.

### Step 1: SSH vào EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Tạo thư mục project

```bash
mkdir -p ~/course-backend
cd ~/course-backend
```

### Step 3: Tạo file .env.production

```bash
nano .env.production
```

### Step 4: Điền nội dung (tham khảo .env.production.example)

```env
# NODE ENVIRONMENT
NODE_ENV=production

# DATABASE (PostgreSQL đã cài trên EC2)
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=course_db

# REDIS (Redis đã cài trên EC2)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT CONFIGURATION
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_characters
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

### Step 5: Bảo mật file

```bash
chmod 600 .env.production
```

---

## 🔄 CI/CD Workflow

### Khi bạn push code lên branch `main` hoặc `master`:

1. ✅ GitHub Actions tự động build Docker images
2. ✅ Copy images lên EC2 qua SSH
3. ✅ EC2 load images và chạy với `docker-compose.prod.yml`
4. ✅ Đọc biến môi trường từ file `.env.production` trên EC2
5. ✅ Services kết nối đến PostgreSQL và Redis đã cài sẵn trên EC2

### Manual Trigger

Bạn cũng có thể chạy workflow manually:

```
GitHub Repository → Actions → Deploy Backend → Run workflow
```

---

## 🧪 Testing

### Test SSH connection từ local

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip "echo 'SSH works!'"
```

### Test Docker on EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip "docker --version"
```

### Test deployment manually

```bash
# On EC2
cd ~/course-backend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
docker compose -f docker-compose.prod.yml ps
```

---

## ❌ Troubleshooting

### SSH Authentication Failed

**Problem:** `ssh: handshake failed: unable to authenticate`

**Solutions:**
1. Check EC2_SSH_KEY includes full key with headers
2. Verify EC2_USER is correct (ubuntu vs ec2-user)
3. Ensure SSH key has correct permissions on EC2
4. Check Security Group allows SSH (port 22) from GitHub Actions IPs

### .env.production not found

**Problem:** Workflow fails with "WARNING: .env.production file not found!"

**Solutions:**
1. SSH vào EC2 và tạo file `.env.production`
2. Copy nội dung từ `.env.production.example`
3. Điền tất cả giá trị thực tế
4. Đảm bảo file ở đúng path: `~/course-backend/.env.production`

### Containers không start

**Problem:** Containers exit hoặc không start

**Solutions:**
1. Check logs: `docker compose -f docker-compose.prod.yml logs`
2. Verify database connection: kiểm tra DB_HOST, DB_PORT
3. Verify Redis connection: kiểm tra REDIS_HOST, REDIS_PORT
4. Đảm bảo PostgreSQL và Redis đang chạy trên EC2

### Database Connection Failed

**Problem:** Cannot connect to PostgreSQL

**Solutions:**
1. Check PostgreSQL đang chạy: `sudo systemctl status postgresql`
2. Verify credentials trong `.env.production`
3. Check `pg_hba.conf` allows connection from Docker network
4. Test connection: `psql -h localhost -U your_user -d course_db`

---

## 🔒 Security Best Practices

1. **Không commit .env.production vào Git**
   - File này chỉ tồn tại trên EC2
   - Thêm `.env.production` vào `.gitignore`

2. **Sử dụng strong passwords**
   - DB_PASSWORD: 20+ ký tự, mixed case, numbers, symbols
   - JWT_SECRET: 32+ ký tự minimum

3. **Rotate secrets thường xuyên**
   - Đổi DB password mỗi 90 ngày
   - Rotate JWT secret khi có nghi ngờ bị lộ

4. **Giới hạn quyền truy cập**
   - Chỉ admin mới có quyền SSH vào EC2
   - GitHub Secrets chỉ cho người có write access

5. **Backup .env.production**
   - Lưu copy an toàn ở nơi khác (password manager)
   - Không email hoặc share qua chat

6. **Monitor logs**
   - Check GitHub Actions logs thường xuyên
   - Alert khi deploy failed

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│  - Source code                                          │
│  - docker-compose.prod.yml                              │
│  - Dockerfile(s)                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Push to main/master
                 ▼
┌─────────────────────────────────────────────────────────┐
│               GitHub Actions (CI/CD)                     │
│  1. Lint code                                           │
│  2. Build Docker images                                 │
│  3. SSH to EC2                                          │
│  4. Copy images to EC2                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Deploy via SSH (uses EC2_SSH_KEY)
                 ▼
┌─────────────────────────────────────────────────────────┐
│                       EC2 Instance                       │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │  PostgreSQL (native)                 │              │
│  │  - Port 5432                         │              │
│  └──────────────────────────────────────┘              │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │  Redis (native)                      │              │
│  │  - Port 6379                         │              │
│  └──────────────────────────────────────┘              │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │  Docker Containers                   │              │
│  │  - identity-service:3002             │              │
│  │  - course-service:3003               │              │
│  │  - api-gateway:8000                  │              │
│  │                                      │              │
│  │  Uses: .env.production               │              │
│  └──────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 📞 Support & Contact

Nếu gặp vấn đề:

1. Check GitHub Actions logs
2. SSH vào EC2 và check Docker logs
3. Verify .env.production có đầy đủ biến
4. Test PostgreSQL và Redis đang chạy
5. Contact DevOps team nếu vẫn failed

---

**Last Updated:** January 31, 2026  
**Version:** 2.0 (Production Environment Variables on EC2)
