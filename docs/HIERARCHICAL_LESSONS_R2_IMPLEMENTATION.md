# Hierarchical Lesson Structure & R2 Video Storage Implementation

## Overview

This document describes the implementation of a hierarchical lesson structure with Cloudflare R2 video storage for the Course microservice.

## Features Implemented

### 1. Cloudflare R2 Integration

#### Configuration (`apps/course/src/env/environment.ts`)

Added R2 configuration section:

```typescript
r2: {
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.R2_BUCKET_NAME || 'course-videos',
  publicUrl: process.env.R2_PUBLIC_URL || '',
}
```

#### R2 Storage Service (`apps/course/src/shareds/services/r2-storage.service.ts`)

Comprehensive S3-compatible storage service with:

- **uploadFile()**: Upload video files to R2 bucket
- **deleteFile()**: Delete files from R2
- **getPresignedUrl()**: Generate temporary signed URLs (1 hour expiration)
- **getPublicUrl()**: Get public URLs for files
- **fileExists()**: Check if file exists in bucket

### 2. Hierarchical Lesson Structure

#### Updated Lesson Entity (`apps/course/src/shareds/entities/lesson.entity.ts`)

Added tree structure fields:

```typescript
parentId: string | null; // Parent lesson ID
path: string | null; // Materialized path (e.g., "uuid1.uuid2.uuid3")
level: number; // Depth level in tree (0 = root)
childrenCount: number; // Number of direct children (denormalized)

// R2 video storage fields
videoKey: string; // R2 object key
videoSize: number; // File size in bytes
videoFormat: string; // Video format (mp4, webm, etc.)
```

Self-referencing relationships:

```typescript
@ManyToOne(() => Lesson, (lesson) => lesson.children)
parent: Lesson;

@OneToMany(() => Lesson, (lesson) => lesson.parent)
children: Lesson[];
```

### 3. Admin APIs for CRUD Operations

#### CourseAdminService (`apps/course/src/modules/course/course-admin.service.ts`)

Complete service for managing courses, sections, and lessons:

**Course Operations:**

- `createCourse()` - Create new course with instructor
- `updateCourse()` - Update course details
- `deleteCourse()` - Delete course and associated thumbnail

**Section Operations:**

- `createSection()` - Create section within a course
- `updateSection()` - Update section details
- `deleteSection()` - Delete section (cascades to lessons)

**Lesson Operations:**

- `createLesson()` - Create lesson with optional parent (builds tree structure)
- `updateLesson()` - Update lesson, handle parent changes
- `deleteLesson()` - Delete lesson, update parent's childrenCount
- `getLessonTree()` - Get hierarchical lesson structure for a section
- `uploadLessonVideo()` - Upload video file to R2
- `getLessonVideoUrl()` - Get presigned URL for video access

**Tree Management:**

- Automatic path calculation using materialized path pattern
- Level tracking for depth
- Children count maintenance
- Parent update handling with tree restructuring

#### CourseAdminController (`apps/course/src/modules/course/course-admin.controller.ts`)

Message patterns for microservice communication:

- `course.admin.create` - Create course
- `course.admin.update` - Update course
- `course.admin.delete` - Delete course
- `course.admin.section.create` - Create section
- `course.admin.section.update` - Update section
- `course.admin.section.delete` - Delete section
- `course.admin.lesson.create` - Create lesson
- `course.admin.lesson.update` - Update lesson
- `course.admin.lesson.delete` - Delete lesson
- `course.admin.lesson.tree` - Get lesson tree
- `course.admin.lesson.video-url` - Get video URL

### 4. API Gateway Integration

#### CourseAdminGatewayController (`apps/api-gateway/src/controllers/course/course-admin-gateway.controller.ts`)

RESTful HTTP endpoints:

**Courses:**

- `POST /admin/courses` - Create course
- `PUT /admin/courses/:courseId` - Update course
- `DELETE /admin/courses/:courseId` - Delete course

**Sections:**

- `POST /admin/courses/sections` - Create section
- `PUT /admin/courses/sections/:sectionId` - Update section
- `DELETE /admin/courses/sections/:sectionId` - Delete section

**Lessons:**

- `POST /admin/courses/lessons` - Create lesson
- `PUT /admin/courses/lessons/:lessonId` - Update lesson
- `DELETE /admin/courses/lessons/:lessonId` - Delete lesson
- `GET /admin/courses/sections/:sectionId/lessons/tree` - Get lesson tree

**Video Management:**

- `POST /admin/courses/lessons/:lessonId/video` - Upload video (multipart/form-data, max 500MB)
- `GET /admin/courses/lessons/:lessonId/video-url` - Get presigned video URL

All endpoints are protected by `JwtAuthGuard`.

### 5. DTOs Created

**Course DTOs** (`dto/create-course.dto.ts`):

- `CreateCourseDto` - Validation for course creation
- `UpdateCourseDto` - Validation for course updates

**Section DTOs** (`dto/create-section.dto.ts`):

- `CreateSectionDto` - Validation for section creation
- `UpdateSectionDto` - Validation for section updates

**Lesson DTOs** (`dto/create-lesson.dto.ts`):

- `CreateLessonDto` - Validation for lesson creation (includes parentId for hierarchy)
- `UpdateLessonDto` - Validation for lesson updates
- `UploadVideoDto` - Validation for video upload

All DTOs use `class-validator` decorators for validation.

### 6. Module Configuration

Updated `CourseModule` to include:

- `CourseAdminService` - Admin business logic
- `CourseAdminController` - Message pattern handler
- `R2StorageService` - Cloud storage integration

## Architecture Patterns

### 1. Materialized Path Pattern

Lessons use materialized path for efficient tree queries:

- Root lesson: `path = ''`, `level = 0`
- Child lesson: `path = 'parent-uuid'`, `level = 1`
- Grandchild: `path = 'parent-uuid.child-uuid'`, `level = 2`

### 2. Denormalization

- `childrenCount` on each lesson for quick child counting
- No database joins required for count queries

### 3. Tree Building Algorithm

The `buildLessonTree()` method:

1. Creates a map of all lessons
2. Builds parent-child relationships
3. Returns only root-level nodes with nested children

### 4. Video Storage Strategy

- Videos stored in Cloudflare R2 (S3-compatible)
- Presigned URLs for temporary access (1 hour)
- Automatic cleanup on lesson deletion
- Support for multiple video formats (mp4, webm, ogg, quicktime)

## Dependencies Installed

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid multer @nestjs/platform-express
```

## Environment Variables Required

Add to `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=course-videos
R2_PUBLIC_URL=https://your-domain.r2.dev  # Optional, for public access
```

## Example Usage

### Create a Hierarchical Lesson Structure

```typescript
// 1. Create root lesson
POST /admin/courses/lessons
{
  "title": "Introduction to React",
  "type": "video",
  "sectionId": "section-uuid",
  "orderIndex": 0
}

// 2. Create child lesson
POST /admin/courses/lessons
{
  "title": "React Hooks Deep Dive",
  "type": "video",
  "sectionId": "section-uuid",
  "parentId": "root-lesson-uuid",
  "orderIndex": 0
}

// 3. Create grandchild lesson
POST /admin/courses/lessons
{
  "title": "useState Hook",
  "type": "video",
  "sectionId": "section-uuid",
  "parentId": "child-lesson-uuid",
  "orderIndex": 0
}

// 4. Get tree structure
GET /admin/courses/sections/:sectionId/lessons/tree
```

### Upload Video

```bash
curl -X POST \
  http://localhost:3000/admin/courses/lessons/:lessonId/video \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/video.mp4'
```

### Get Video URL (Presigned)

```bash
GET /admin/courses/lessons/:lessonId/video-url
```

Returns:

```json
{
  "url": "https://account-id.r2.cloudflarestorage.com/course-videos/video-uuid.mp4?signature=..."
}
```

## Database Migration

Generate migration for new fields:

```bash
cd apps/course
npm run typeorm:generate-migration -- AddHierarchicalLessonStructure
npm run typeorm:run-migrations
```

## Security Considerations

1. **Authentication**: All admin endpoints protected by JWT
2. **File Validation**:
   - Max file size: 500MB
   - Allowed types: video/\* only
3. **Presigned URLs**: Expire after 1 hour
4. **R2 Credentials**: Stored in environment variables, never committed

## Performance Optimizations

1. **Indexes**: Added on `parentId` for fast tree queries
2. **Denormalized Counts**: `childrenCount` avoids COUNT queries
3. **Materialized Path**: Enables efficient ancestor/descendant queries
4. **CDN Integration**: R2 can be fronted with Cloudflare CDN for global distribution

## Future Enhancements

1. **Direct Upload**: Implement presigned POST URLs for client-side uploads
2. **Video Transcoding**: Add automatic transcoding to multiple formats/qualities
3. **Streaming**: Implement HLS/DASH for adaptive bitrate streaming
4. **Subtitles**: Add support for VTT subtitle files
5. **Progress Tracking**: Track video watch progress at specific timestamps
6. **Bulk Operations**: Add APIs for bulk lesson creation/reordering

## Testing

Example test cases needed:

- Create lesson with/without parent
- Update lesson parent (tree restructuring)
- Delete lesson with children (cascade behavior)
- Upload video and verify R2 storage
- Get presigned URL and verify access
- Build lesson tree with multiple levels

## Troubleshooting

**R2 Connection Issues:**

- Verify R2 credentials in environment variables
- Check bucket exists and has correct permissions
- Ensure endpoint format: `https://{accountId}.r2.cloudflarestorage.com`

**Tree Structure Issues:**

- Verify parentId references exist before creating child
- Check path calculation logic for nested levels
- Ensure childrenCount is updated on parent changes

**Video Upload Issues:**

- Check file size limits (500MB default)
- Verify allowed MIME types
- Ensure multer is properly configured in gateway

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [API_GATEWAY_MIGRATION.md](./API_GATEWAY_MIGRATION.md) - Gateway pattern explanation
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) - Database schema details

## Summary

This implementation provides:
✅ Complete CRUD APIs for courses, sections, and lessons
✅ Hierarchical lesson structure with parent-child relationships
✅ Cloudflare R2 integration for video storage
✅ Presigned URLs for secure video access
✅ API Gateway pattern with JWT authentication
✅ Comprehensive validation with DTOs
✅ Efficient tree queries with materialized path
✅ Auto-cleanup on deletion
✅ Production-ready error handling

The system is ready for admin users to create courses with complex, nested lesson structures and upload videos to cloud storage.
