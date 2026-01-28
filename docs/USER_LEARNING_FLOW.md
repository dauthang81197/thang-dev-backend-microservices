# User Course Learning Flow - Architecture Update

## Overview

This document describes the complete user learning flow implementation for the course platform, following Udemy-like patterns.

## Database Schema

### 1. Enrollments Table

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id),
  status VARCHAR CHECK (status IN ('active', 'completed', 'suspended')),
  progress DECIMAL(5,2) DEFAULT 0, -- 0-100%
  completed_lessons_count INTEGER DEFAULT 0,
  total_lessons_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_userId ON enrollments(user_id);
CREATE INDEX idx_enrollments_courseId ON enrollments(course_id);
CREATE INDEX idx_enrollments_userId_status ON enrollments(user_id, status);
```

### 2. Lesson Progress Table

```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  watched_duration INTEGER DEFAULT 0, -- seconds
  completed_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_userId_lessonId ON lesson_progress(user_id, lesson_id);
CREATE INDEX idx_lesson_progress_lessonId ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed);
CREATE INDEX idx_lesson_progress_userId_completed ON lesson_progress(user_id, completed);
```

## API Endpoints

### User Learning APIs

#### 1. Get Lesson Detail

```http
GET /api/lessons/:lessonId
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Introduction to TypeScript",
  "description": "Learn the basics...",
  "type": "video",
  "duration": 1200,
  "order": 1,
  "isPreview": false,
  "videoUrl": "https://r2.cloudflare.com/...",
  "content": null,
  "sectionId": "uuid",
  "sectionName": "Getting Started",
  "courseId": "uuid",
  "courseName": "TypeScript Masterclass",
  "completed": false,
  "watchedDuration": 0,
  "canAccess": true
}
```

**Access Control:**

- Preview lessons (`isFree: true`): Accessible to everyone
- Non-preview lessons: Requires enrollment

#### 2. Mark Lesson as Completed

```http
POST /api/lessons/:lessonId/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "watchedDuration": 1200
}
```

**Response:**

```json
{
  "success": true,
  "message": "Lesson marked as completed"
}
```

**Side Effects:**

- Creates/updates `lesson_progress` record
- Updates enrollment `progress` percentage
- Updates `completed_lessons_count`
- All operations in transaction

#### 3. Mark Lesson as Uncompleted

```http
POST /api/lessons/:lessonId/uncomplete
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Lesson marked as uncompleted"
}
```

#### 4. Get Detailed Course Progress

```http
GET /api/courses/:courseId/progress
Authorization: Bearer {token}
```

**Response:**

```json
{
  "courseId": "uuid",
  "courseName": "TypeScript Masterclass",
  "progressPercent": 33.33,
  "completedLessonsCount": 2,
  "totalLessonsCount": 6,
  "sections": [
    {
      "sectionId": "uuid",
      "sectionName": "Getting Started",
      "sectionOrder": 0,
      "lessons": [
        {
          "lessonId": "uuid",
          "lessonName": "Introduction",
          "lessonOrder": 0,
          "lessonType": "video",
          "duration": 600,
          "completed": true,
          "completedAt": "2026-01-28T10:00:00Z",
          "watchedDuration": 600
        },
        {
          "lessonId": "uuid",
          "lessonName": "Setup Environment",
          "lessonOrder": 1,
          "lessonType": "video",
          "duration": 900,
          "completed": false,
          "completedAt": null,
          "watchedDuration": 0
        }
      ]
    }
  ]
}
```

## Service Architecture

### Course Microservice

**New Components:**

1. **CourseLearningService**
   - `getLessonDetail()`: Get lesson with access control
   - `completeLesson()`: Mark lesson complete with transaction
   - `uncompleteLesson()`: Remove completion status
   - `getCourseProgress()`: Get detailed progress with sections/lessons
   - `updateEnrollmentProgress()`: Recalculate course progress

2. **CourseLearningController** (MessagePattern handlers)
   - `lesson.get`
   - `lesson.complete`
   - `lesson.uncomplete`
   - `course.progress`

### API Gateway

**New Components:**

1. **LessonGatewayController**
   - REST endpoints for lesson learning
   - JWT authentication required
   - Forwards to Course microservice

## Progress Calculation Logic

### Formula

```typescript
progress = (completedLessonsCount / totalLessonsCount) * 100;
```

### Update Triggers

1. User completes a lesson
2. User uncompletes a lesson
3. Admin adds/removes lessons from course

### Transaction Safety

All progress updates wrapped in database transactions:

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();
try {
  // Update lesson_progress
  // Recalculate enrollment progress
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
}
```

## Access Control Rules

### Lesson Access

| Lesson Type              | User Not Enrolled | User Enrolled |
| ------------------------ | ----------------- | ------------- |
| Preview (`isFree: true`) | ✅ Can view       | ✅ Can view   |
| Paid (`isFree: false`)   | ❌ 403 Forbidden  | ✅ Can view   |

### Lesson Completion

- ❌ Not enrolled → 403 Forbidden
- ✅ Enrolled → Can mark complete/uncomplete

### Progress View

- ❌ Not enrolled → 403 Forbidden
- ✅ Enrolled → Full progress details

## Error Handling

### HTTP Status Codes

- `200` - Success
- `403` - Forbidden (not enrolled or no access)
- `404` - Resource not found (lesson/course)
- `400` - Bad request (invalid data)
- `401` - Unauthorized (invalid/missing JWT)

### Example Error Responses

```json
{
  "statusCode": 403,
  "message": "You must enroll in this course to access this lesson",
  "error": "Forbidden"
}
```

## Performance Optimizations

### Database Indexes

```sql
-- Lesson progress queries
CREATE INDEX idx_lesson_progress_userId_completed
  ON lesson_progress(user_id, completed);

-- Enrollment lookups
CREATE INDEX idx_enrollments_userId_courseId
  ON enrollments(user_id, course_id);
```

### Query Optimization

1. Use `relations` in TypeORM to avoid N+1 queries
2. Batch progress calculations
3. Denormalize counts in enrollment table

### Caching Strategy (Future)

- Cache video URLs (presigned URLs expire in 1 hour)
- Cache course structure (sections/lessons)
- Invalidate on admin updates

## Migration Instructions

### 1. Run Migration

```bash
npm run typeorm:course:migration:run
```

### 2. Verify Tables

```sql
\d enrollments
\d lesson_progress
```

### 3. Test Endpoints

```bash
# Get lesson (preview)
curl -X GET http://localhost:8000/api/lessons/{lessonId} \
  -H "Authorization: Bearer {token}"

# Complete lesson
curl -X POST http://localhost:8000/api/lessons/{lessonId}/complete \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"watchedDuration": 600}'

# Get course progress
curl -X GET http://localhost:8000/api/courses/{courseId}/progress \
  -H "Authorization: Bearer {token}"
```

## Testing Checklist

### Access Control Tests

- [ ] Preview lesson accessible without enrollment
- [ ] Paid lesson requires enrollment
- [ ] Cannot complete lesson without enrollment
- [ ] Cannot view progress without enrollment

### Progress Calculation Tests

- [ ] Progress updates on lesson completion
- [ ] Progress updates on lesson un-completion
- [ ] Progress accurate with multiple lessons
- [ ] Progress resets correctly

### Transaction Tests

- [ ] Rollback on error during completion
- [ ] No partial updates on failure
- [ ] Concurrent completion handling

### Edge Cases

- [ ] Complete already completed lesson (idempotent)
- [ ] Uncomplete non-existent progress
- [ ] Course with no lessons
- [ ] All lessons completed (100% progress)

## Future Enhancements

### Phase 2

- [ ] Video playback progress tracking (seek position)
- [ ] Quiz completion tracking
- [ ] Assignment submissions
- [ ] Certificates on course completion

### Phase 3

- [ ] Watch time analytics
- [ ] Learning streak tracking
- [ ] Recommended next lesson
- [ ] Adaptive learning paths

## API Summary

| Endpoint                      | Method | Auth     | Purpose               |
| ----------------------------- | ------ | -------- | --------------------- |
| `/api/lessons/:id`            | GET    | Required | Get lesson detail     |
| `/api/lessons/:id/complete`   | POST   | Required | Mark completed        |
| `/api/lessons/:id/uncomplete` | POST   | Required | Mark uncompleted      |
| `/api/courses/:id/progress`   | GET    | Required | Get detailed progress |
| `/api/courses`                | GET    | Optional | Browse courses        |
| `/api/courses/:id`            | GET    | Optional | Get course detail     |
| `/api/courses/:id/enroll`     | POST   | Required | Enroll in course      |
| `/api/courses/enrolled`       | GET    | Required | Get enrolled courses  |
| `/api/courses/:id/sections`   | GET    | Optional | Get course structure  |

## Conclusion

This implementation provides a complete, production-ready learning flow with:

- ✅ Proper access control
- ✅ Transaction safety
- ✅ Detailed progress tracking
- ✅ Performance optimizations
- ✅ Comprehensive error handling
- ✅ Udemy-like user experience
