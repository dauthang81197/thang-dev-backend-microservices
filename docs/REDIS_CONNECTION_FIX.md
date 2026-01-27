# Redis Connection Fix Guide

## Vấn đề
Course Microservice bị mất kết nối Redis và không tự động reconnect:
```
ERROR [Server] Redis connection closed and retry attempts not specified
ERROR [Server] Disconnected from Redis. No further reconnection attempts will be made.
```

## Giải pháp đã triển khai

### 1. Cập nhật Course Microservice (apps/course/src/main.ts)
Đã thêm Redis retry logic và reconnection strategy:
- `retryAttempts: 5` - Retry 5 lần khi mất kết nối
- `retryDelay: 3000` - Delay 3 giây giữa các retry
- `connectTimeout: 10000` - Timeout 10 giây cho connection
- `keepAlive: 30000` - Keep-alive 30 giây
- `enableOfflineQueue: true` - Queue commands khi offline
- `maxRetriesPerRequest: 3` - Max 3 retries per request

### 2. Cập nhật Identity Microservice (apps/identity/src/main.ts)
Áp dụng cùng cấu hình retry logic như Course service

### 3. Cập nhật API Gateway (apps/api-gateway/src/api-gateway.module.ts)
Thêm retry logic cho cả IDENTITY_SERVICE và COURSE_SERVICE clients

## Kiểm tra Redis đang chạy

### Windows:
```powershell
# Check if Redis is running
Get-Process redis-server -ErrorAction SilentlyContinue

# Check Redis port
Test-NetConnection -ComputerName 192.168.50.22 -Port 6379

# Test Redis connection
redis-cli -h 192.168.50.22 -p 6379 ping
```

### Linux/Mac:
```bash
# Check if Redis is running
redis-cli -h 192.168.50.22 -p 6379 ping

# Should return: PONG
```

## Start Redis (nếu chưa chạy)

### Docker:
```bash
# Start Redis container
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes

# Check logs
docker logs -f redis
```

### Windows Service:
```powershell
# Start Redis service
net start Redis

# Check status
sc query Redis
```

### Linux:
```bash
# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Check status
sudo systemctl status redis
```

## Test lại Microservices

### 1. Stop tất cả services:
```bash
# Ctrl+C to stop all running services
```

### 2. Start Redis (nếu chưa chạy):
```bash
docker start redis
# hoặc
redis-server
```

### 3. Start lại các services theo thứ tự:
```bash
# Terminal 1: Identity Service
npm run start:dev:identity

# Terminal 2: Course Service
npm run start:dev:course

# Terminal 3: API Gateway
npm run start:dev:gateway
```

## Kiểm tra logs

Services nên hiển thị:
```
Identity Microservice is running...
Redis connected at: 192.168.50.22:6379

Course Microservice is running...
Redis connected at: 192.168.50.22:6379
```

## Troubleshooting

### Lỗi: Cannot connect to Redis
1. Kiểm tra Redis có đang chạy không
2. Kiểm tra firewall/network connection
3. Verify Redis host/port trong environment.ts

### Lỗi: Redis connection timeout
1. Tăng `connectTimeout` trong cấu hình
2. Kiểm tra network latency
3. Verify Redis không bị overload

### Lỗi: Redis keeps disconnecting
1. Kiểm tra Redis maxclients setting
2. Tăng `keepAlive` timeout
3. Monitor Redis memory usage

## Redis Configuration (Optional)

Để production, nên cấu hình Redis với:
- Password authentication
- Max memory policy
- Persistence (AOF/RDB)
- Max clients limit

Ví dụ redis.conf:
```conf
# Security
requirepass your_secure_password
bind 0.0.0.0
protected-mode yes

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
appendonly yes
appendfsync everysec

# Performance
maxclients 10000
timeout 300
tcp-keepalive 300
```

## Monitoring

### Check Redis stats:
```bash
redis-cli -h 192.168.50.22 -p 6379 INFO stats
```

### Monitor real-time commands:
```bash
redis-cli -h 192.168.50.22 -p 6379 MONITOR
```

### Check connected clients:
```bash
redis-cli -h 192.168.50.22 -p 6379 CLIENT LIST
```

## Cấu hình hiện tại

Host: `192.168.50.22`
Port: `6379`

Nếu cần thay đổi, cập nhật trong:
- `apps/course/src/env/environment.ts`
- `apps/identity/src/env/environment.ts`
- `apps/api-gateway/env/environment.ts`
