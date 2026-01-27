# R2 Cloud Storage Integration - Course Service

## Tổng quan
Hệ thống đã được tích hợp với Cloudflare R2 Cloud Storage để lưu trữ video bài học. R2 cung cấp lưu trữ object storage tương thích S3 với chi phí thấp và không có phí egress.

## Cấu hình

### 1. Biến môi trường (.env)
```env
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=course
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 2. Lấy thông tin R2 từ Cloudflare
1. Đăng nhập Cloudflare Dashboard
2. Vào **R2 Object Storage**
3. Tạo bucket mới (ví dụ: `course`)
4. Vào **Settings** > **API Tokens** để lấy:
   - Account ID
   - Access Key ID
   - Secret Access Key
5. Cấu hình Public Access nếu cần (không bắt buộc)

## API Endpoints

### 1. Upload Video (POST)
```
POST /api/admin/courses/lessons/:lessonId/video
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body:**
- `file`: Video file (mp4, webm, ogg, mov)
- Max size: 500MB

**Response:**
```json
{
  "id": "lesson-uuid",
  "title": "Lesson Title",
  "videoKey": "videos/uuid.mp4",
  "videoSize": 12345678,
  "videoFormat": "mp4",
  "message": "Video uploaded successfully to R2 Cloud Storage"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/admin/courses/lessons/LESSON_ID/video \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/video.mp4"
```

### 2. Get Video URL (GET)
```
GET /api/admin/courses/lessons/:lessonId/video-url
Authorization: Bearer <token>
```

**Response:**
```json
{
  "url": "https://presigned-url-from-r2.com/...",
  "lessonId": "lesson-uuid",
  "expiresIn": 3600
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/admin/courses/lessons/LESSON_ID/video-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Kiến trúc

```
API Gateway → Course Microservice → R2 Storage Service → Cloudflare R2
```

### Flow Upload Video:
1. Client gửi file qua API Gateway (`/api/admin/courses/lessons/:id/video`)
2. API Gateway forward file buffer đến Course Microservice
3. Course Microservice xử lý:
   - Validate file type và size
   - Upload lên R2 qua `R2StorageService`
   - Lưu metadata vào database (videoKey, videoSize, videoFormat)
4. Trả về thông tin lesson đã cập nhật

### Flow Get Video URL:
1. Client request video URL từ API Gateway
2. API Gateway forward request đến Course Microservice
3. Course Microservice:
   - Lấy thông tin lesson từ database
   - Generate presigned URL từ R2 (expires trong 1 giờ)
4. Trả về presigned URL cho client

## R2StorageService Methods

### `uploadFile(buffer, filename, mimetype, folder)`
Upload file lên R2 storage
- Tự động generate UUID cho tên file
- Trả về R2 object key

### `deleteFile(key)`
Xóa file từ R2 storage

### `getPresignedUrl(key, expiresIn)`
Generate presigned URL cho temporary access
- Default: 3600 seconds (1 giờ)

### `getPublicUrl(key)`
Lấy public URL (nếu bucket được config public)

### `fileExists(key)`
Kiểm tra file có tồn tại không

## Định dạng video được hỗ trợ
- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- QuickTime/MOV (video/quicktime)

## Giới hạn
- **Max file size**: 500MB
- **Presigned URL expiration**: 1 giờ (3600 giây)
- Tự động xóa video cũ khi upload video mới cho cùng lesson

## Database Schema

### Lesson Entity
```typescript
{
  videoKey: string,        // R2 object key (e.g., "videos/uuid.mp4")
  videoSize: bigint,       // File size in bytes
  videoFormat: string,     // Video format (mp4, webm, etc.)
  content: string          // Also stores videoKey for backward compatibility
}
```

## Troubleshooting

### Lỗi "Failed to upload file"
- Kiểm tra R2 credentials trong .env
- Verify bucket name đúng
- Kiểm tra network connection đến Cloudflare

### Lỗi "Invalid file type"
- Chỉ chấp nhận: mp4, webm, ogg, quicktime
- Kiểm tra MIME type của file

### Lỗi "File size exceeded"
- Max size: 500MB
- Nén video hoặc giảm quality trước khi upload

## Testing với Postman

### 1. Upload Video
```
Method: POST
URL: http://localhost:8000/api/admin/courses/lessons/LESSON_ID/video
Headers:
  - Authorization: Bearer YOUR_TOKEN
Body:
  - Type: form-data
  - Key: file
  - Value: [Select video file]
```

### 2. Get Video URL
```
Method: GET
URL: http://localhost:8000/api/admin/courses/lessons/LESSON_ID/video-url
Headers:
  - Authorization: Bearer YOUR_TOKEN
```

## Bảo mật
- Video URLs sử dụng presigned URLs (expires sau 1 giờ)
- Chỉ admin có quyền upload (JwtAuthGuard)
- Validate file type và size trước khi upload
- Tự động clean up videos khi delete lesson

## Chi phí R2
- **Storage**: $0.015/GB/tháng
- **Class A operations** (write): $4.50/million
- **Class B operations** (read): $0.36/million
- **No egress fees** (khác với S3)

## Notes
- R2 tương thích với S3 API, nên có thể migrate dễ dàng
- Presigned URLs cho phép client download trực tiếp từ R2
- Video không được cache, mỗi lần xem cần generate URL mới
