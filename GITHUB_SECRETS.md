# 🔐 GitHub Secrets Configuration Guide

## Required Secrets for Deployment

### Both Frontend & Backend (Shared Secrets)

#### EC2 Connection

```
EC2_HOST=<your-ec2-ip-or-domain>
Example: 54.123.456.789 or api.yourdomain.com

EC2_USER=ubuntu
(or ec2-user for Amazon Linux)

EC2_SSH_KEY=<your-private-key-content>
⚠️ IMPORTANT: Paste the ENTIRE private key including:
-----BEGIN RSA PRIVATE KEY-----
... (your key content) ...
-----END RSA PRIVATE KEY-----
```

### Backend-Specific Secrets

#### Database

```
DB_USER=postgres
DB_PASSWORD=<your-secure-password>
DB_NAME=course_db
```

#### JWT Authentication

```
JWT_SECRET=<your-jwt-secret-minimum-32-characters>
Example: your_super_secure_jwt_secret_key_at_least_32_chars_long
```

#### Cloudflare R2 Storage

```
R2_ACCOUNT_ID=<your-r2-account-id>
R2_ACCESS_KEY_ID=<your-r2-access-key-id>
R2_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
R2_BUCKET_NAME=<your-bucket-name>
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

#### CORS Configuration

```
CORS_ORIGIN=https://yourdomain.com
(or * for development)
```

### Frontend-Specific Secrets

#### API URL

```
NEXT_PUBLIC_API_URL=http://your-ec2-ip:8000
Example: http://54.123.456.789:8000
```

### Optional (Docker Hub)

```
DOCKER_USERNAME=<your-dockerhub-username>
DOCKER_PASSWORD=<your-dockerhub-password>
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

### SSH Authentication Failed

**Problem:** `ssh: handshake failed: unable to authenticate`

**Solutions:**

1. Check EC2_SSH_KEY includes full key with headers
2. Verify EC2_USER is correct (ubuntu vs ec2-user)
3. Ensure SSH key has correct permissions on EC2
4. Test SSH manually: `ssh -i key.pem ubuntu@ec2-ip`

### Database Connection Failed

**Problem:** Cannot connect to PostgreSQL

**Solutions:**

1. Verify DB_USER, DB_PASSWORD, DB_NAME
2. Check PostgreSQL is running: `docker compose ps`
3. Check logs: `docker compose logs postgres`

### R2 Upload Failed

**Problem:** Cannot upload to R2

**Solutions:**

1. Verify all R2\_\* secrets are correct
2. Check R2 bucket permissions
3. Test R2 credentials in local environment

---

## 🔒 Security Best Practices

1. **Never commit secrets to git**
   - Add .env to .gitignore
   - Use GitHub Secrets for CI/CD

2. **Use strong passwords**
   - DB_PASSWORD: 20+ characters, mixed case, numbers, symbols
   - JWT_SECRET: 32+ characters minimum

3. **Rotate secrets regularly**
   - Change passwords every 90 days
   - Rotate API keys quarterly

4. **Limit secret access**
   - Only add secrets needed for deployment
   - Use separate secrets for staging/production

5. **Monitor secret usage**
   - Check GitHub Actions logs
   - Alert on failed authentications

---

## 📊 Secrets Summary

| Secret Name          | Used By  | Required | Example                |
| -------------------- | -------- | -------- | ---------------------- |
| EC2_HOST             | Both     | ✅ Yes   | 54.123.456.789         |
| EC2_USER             | Both     | ✅ Yes   | ubuntu                 |
| EC2_SSH_KEY          | Both     | ✅ Yes   | (Private key)          |
| DB_USER              | Backend  | ✅ Yes   | postgres               |
| DB_PASSWORD          | Backend  | ✅ Yes   | SecurePass123!         |
| DB_NAME              | Backend  | ✅ Yes   | course_db              |
| JWT_SECRET           | Backend  | ✅ Yes   | (32+ chars)            |
| R2_ACCOUNT_ID        | Backend  | ✅ Yes   | (R2 ID)                |
| R2_ACCESS_KEY_ID     | Backend  | ✅ Yes   | (R2 Key)               |
| R2_SECRET_ACCESS_KEY | Backend  | ✅ Yes   | (R2 Secret)            |
| R2_BUCKET_NAME       | Backend  | ✅ Yes   | course                 |
| R2_PUBLIC_URL        | Backend  | ✅ Yes   | https://pub-xxx.r2.dev |
| CORS_ORIGIN          | Backend  | ✅ Yes   | https://domain.com     |
| NEXT_PUBLIC_API_URL  | Frontend | ✅ Yes   | http://ip:8000         |
| DOCKER_USERNAME      | Both     | ❌ No    | dockerhub-user         |
| DOCKER_PASSWORD      | Both     | ❌ No    | dockerhub-pass         |

---

## 🚀 Quick Setup Commands

### Check if secrets are set (in GitHub Actions)

```yaml
- name: Check secrets
  run: |
    echo "EC2_HOST is set: ${{ secrets.EC2_HOST != '' }}"
    echo "DB_PASSWORD is set: ${{ secrets.DB_PASSWORD != '' }}"
    echo "JWT_SECRET length: ${#JWT_SECRET}"
  env:
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

### Test SSH connection locally

```bash
ssh -i ~/.ssh/deploy_key ubuntu@$EC2_HOST "echo 'SSH works!'"
```

### Verify R2 credentials locally

```bash
npm run test:r2  # Add this script to package.json
```

---

## 📞 Support

If secrets are not working:

1. Double-check spelling (case-sensitive)
2. Verify no extra spaces/newlines
3. Test values locally first
4. Check GitHub Actions logs for errors
5. Re-create secret if still failing

---

**Last Updated:** January 30, 2026
**Maintained By:** DevOps Team
