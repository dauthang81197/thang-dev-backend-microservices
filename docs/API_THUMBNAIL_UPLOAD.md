# Course Thumbnail Upload API

## Overview

API endpoint để upload thumbnail/ảnh đại diện cho course lên Cloudflare R2 Cloud Storage.

## Endpoint

### Upload Course Thumbnail

**URL:** `POST /api/admin/courses/:courseId/thumbnail`

**Authentication:** Required (JWT Bearer Token)

**Content-Type:** `multipart/form-data`

**Parameters:**

- `courseId` (path parameter): ID của course cần upload thumbnail

**Request Body:**

- `file`: File ảnh (jpg, jpeg, png, webp, gif)
- Max size: 5MB

---

## cURL Example

```bash
curl -X POST "http://localhost:3001/api/admin/courses/123e4567-e89b-12d3-a456-426614174000/thumbnail" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## Response Success (200)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Complete TypeScript Course",
  "thumbnail": "https://pub-xxxxx.r2.dev/thumbnails/550e8400-e29b-41d4-a716-446655440000.jpg",
  "thumbnailKey": "thumbnails/550e8400-e29b-41d4-a716-446655440000.jpg",
  "message": "Thumbnail uploaded successfully to R2 Cloud Storage"
}
```

---

## Error Responses

### 400 Bad Request - Invalid File Type

```json
{
  "statusCode": 400,
  "message": "Invalid file type: image/bmp. Allowed types: jpg, jpeg, png, webp, gif",
  "error": "Bad Request"
}
```

### 400 Bad Request - File Too Large

```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size (5MB)",
  "error": "Bad Request"
}
```

### 404 Not Found - Course Not Found

```json
{
  "statusCode": 404,
  "message": "Course not found",
  "error": "Not Found"
}
```

### 401 Unauthorized - Missing or Invalid Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Implementation Details

### Storage Configuration

- **Storage Provider:** Cloudflare R2 (S3-compatible)
- **Folder:** `thumbnails/`
- **File Naming:** UUID + original extension
- **URL Type:** Public URL (không cần presigned URL)

### File Validation

- **Allowed MIME Types:**
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/gif`
- **Max File Size:** 5MB (5 _ 1024 _ 1024 bytes)

### Auto-cleanup

- Khi upload thumbnail mới, **thumbnail cũ sẽ tự động bị xóa** khỏi R2
- Khi delete course, thumbnail cũng sẽ bị xóa

---

## Testing with Postman

1. **Create new request:**
   - Method: POST
   - URL: `http://localhost:3001/api/admin/courses/{courseId}/thumbnail`

2. **Set Authorization:**
   - Type: Bearer Token
   - Token: Your JWT token from login

3. **Set Body:**
   - Type: form-data
   - Key: `file`
   - Type: File
   - Value: Select your image file

4. **Send request** and check response

---

## Flow Diagram

```
User uploads image (max 5MB)
         ↓
API Gateway validates file type & size
         ↓
Upload to R2 (folder: thumbnails/)
         ↓
Get public URL from R2
         ↓
Send to Course Microservice
         ↓
Delete old thumbnail (if exists)
         ↓
Update course.thumbnail in database
         ↓
Return course with new thumbnail URL
```

---

## Related APIs

### Video Upload

- **Endpoint:** `POST /api/admin/courses/lessons/:lessonId/video`
- **Max Size:** 500MB
- **Folder:** `videos/`
- **URL Type:** Presigned URL (expires in 1 hour)

### Get Course Details

- **Endpoint:** `GET /api/admin/courses/:courseId`
- Response includes `thumbnail` field with R2 URL

---

## Notes

- Thumbnail được lưu dưới dạng **public URL**, có thể access trực tiếp
- Không cần presigned URL như video
- File sẽ có tên unique (UUID) để tránh conflict
- R2 storage tự động handle CDN và caching

---

## Swagger Documentation

API này được document đầy đủ trong Swagger UI:

**URL:** `http://localhost:3001/api/docs`

Navigate to: **Course Admin** → **Upload thumbnail image for course to R2**
