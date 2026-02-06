# MinIO Configuration Guide

## Overview

Đã chuyển từ Cloudflare R2 sang MinIO để quản lý file storage (videos, thumbnails).

## Các thay đổi

### 1. Services

- ✅ Đã tạo `MinioService` trong `apps/api-gateway/src/services/minio.service.ts`
- ✅ Đã tạo `MinioStorageService` trong `apps/course/src/shareds/services/minio-storage.service.ts`
- ❌ **Xóa hoặc không dùng**: `R2StorageService` (đã được thay thế)

### 2. Controllers

- ✅ `CourseAdminGatewayController` - đã update để dùng `MinioService`
- ✅ `CourseLearningService` - đã update để dùng `MinioStorageService`

### 3. Modules

- ✅ `ApiGatewayModule` - providers chỉ có `MinioService`
- ✅ `CourseModule` - providers chỉ có `MinioStorageService`

## Environment Variables

### API Gateway (.env)

```bash
MINIO_ENDPOINT=http://192.168.50.22:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=Admin@123
MINIO_BUCKET_NAME=courses
MINIO_PUBLIC_URL=http://192.168.50.22:9000/courses
```

### Course Service (.env)

```bash
MINIO_ENDPOINT=http://192.168.50.22:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=Admin@123
MINIO_BUCKET_NAME=courses
MINIO_PUBLIC_URL=http://192.168.50.22:9000/courses
```

## Setup MinIO

### 1. Chạy MinIO với Docker

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=Admin@123 \
  -v /data/minio:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

### 2. Tạo Bucket

1. Truy cập MinIO Console: http://192.168.50.22:9001
2. Login với credentials:
   - Username: `admin`
   - Password: `Admin@123`
3. Create bucket tên `courses`
4. Set bucket policy là **public** hoặc **private** tùy nhu cầu

### 3. Bucket Policy (Optional - nếu muốn public)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::courses/*"]
    }
  ]
}
```

## API Endpoints

### Upload Thumbnail

```bash
POST /admin/courses/:courseId/thumbnail
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <image file>
```

### Upload Video

```bash
POST /admin/courses/lessons/:lessonId/video
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <video file>
```

### Get Video URL

```bash
GET /lessons/:lessonId/video-url
Authorization: Bearer <token>

Response:
{
  "url": "http://192.168.50.22:9000/courses/videos/uuid.mp4?signature=..."
}
```

## Features

### MinioService/MinioStorageService

- ✅ `uploadFile()` - Upload file to MinIO
- ✅ `deleteFile()` - Delete file from MinIO
- ✅ `getPresignedUrl()` - Get signed URL (expires in 1 hour)
- ✅ `getPublicUrl()` - Get public URL (if bucket is public)
- ✅ `fileExists()` - Check if file exists

## Security

### Presigned URLs

- Default expiration: 3600 seconds (1 hour)
- Videos được serve qua presigned URLs để bảo mật
- Mỗi lần request video, tạo URL mới

### Access Control

- Chỉ enrolled students mới xem được video
- Admin upload qua authenticated endpoints
- JwtAuthGuard protect tất cả admin routes

## Troubleshooting

### Connection Issues

```bash
# Check MinIO is running
curl http://192.168.50.22:9000/minio/health/live

# Check from container
docker exec -it minio mc ls local/courses
```

### Presigned URL 403 Error

- Kiểm tra credentials trong .env
- Verify bucket exists
- Check file key có tồn tại không

### Upload Fails

- Kiểm tra bucket permissions
- Verify file size limits
- Check network connectivity

## Migration từ R2

### Files cần xóa (sau khi verify MinIO works)

- `apps/api-gateway/src/services/r2-storage.service.ts`
- `apps/course/src/shareds/services/r2-storage.service.ts`
- `apps/api-gateway/env/environment.ts` (phần R2 config)

### Database

- Không cần migration
- `videoKey` và `thumbnail` vẫn dùng như cũ
- Chỉ đổi storage backend

## Testing

### 1. Upload Thumbnail

```bash
curl -X POST http://localhost:3000/admin/courses/<courseId>/thumbnail \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

### 2. Upload Video

```bash
curl -X POST http://localhost:3000/admin/courses/lessons/<lessonId>/video \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/video.mp4"
```

### 3. Get Video URL

```bash
curl -X GET http://localhost:3000/lessons/<lessonId>/video-url \
  -H "Authorization: Bearer <token>"
```

## Performance

- MinIO local = faster upload/download vs R2
- Presigned URLs cache được
- Nên dùng CDN phía trước MinIO cho production

## Next Steps

1. ✅ Verify tất cả endpoints work với MinIO
2. ✅ Test upload/download flow
3. ✅ Migrate existing R2 files sang MinIO (nếu có)
4. ✅ Remove R2 service files
5. ⚠️ Setup CDN cho production (optional)
6. ⚠️ Setup backup strategy cho MinIO data
