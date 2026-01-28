# API Endpoints Summary - Learning Flow

## ✅ Completed Implementation

### User Learning APIs

#### 1. Get Lesson Detail

```
GET /api/lessons/:lessonId
Auth: Required (JWT Bearer Token)
```

**Use Case:** User views a lesson (video, article, etc.)

**Access Rules:**

- Preview lessons (`isFree: true`) → Everyone can access
- Paid lessons (`isFree: false`) → Must be enrolled

**Response:**

```json
{
  "id": "uuid",
  "title": "Lesson Title",
  "description": "...",
  "type": "video",
  "duration": 1200,
  "videoUrl": "https://r2.cloudflare.com/presigned-url",
  "completed": false,
  "watchedDuration": 0,
  "canAccess": true
}
```

---

#### 2. Complete Lesson

```
POST /api/lessons/:lessonId/complete
Auth: Required (JWT Bearer Token)
Body: { "watchedDuration": 1200 } (optional)
```

**Use Case:** Mark lesson as completed after watching

**Side Effects:**

- ✅ Creates/updates `lesson_progress` record
- ✅ Auto-calculates course progress percentage
- ✅ Updates `completed_lessons_count` in enrollment
- ✅ All in transaction (rollback on error)

**Response:**

```json
{
  "success": true,
  "message": "Lesson marked as completed"
}
```

---

#### 3. Uncomplete Lesson

```
POST /api/lessons/:lessonId/uncomplete
Auth: Required (JWT Bearer Token)
```

**Use Case:** Remove completion status (optional feature)

**Response:**

```json
{
  "success": true,
  "message": "Lesson marked as uncompleted"
}
```

---

#### 4. Get Detailed Course Progress

```
GET /api/courses/:courseId/progress
Auth: Required (JWT Bearer Token)
```

**Use Case:** View learning progress with section/lesson breakdown

**Response:**

```json
{
  "courseId": "uuid",
  "courseName": "Course Title",
  "progressPercent": 33.33,
  "completedLessonsCount": 2,
  "totalLessonsCount": 6,
  "sections": [
    {
      "sectionId": "uuid",
      "sectionName": "Section 1",
      "sectionOrder": 0,
      "lessons": [
        {
          "lessonId": "uuid",
          "lessonName": "Lesson 1",
          "lessonOrder": 0,
          "lessonType": "video",
          "duration": 600,
          "completed": true,
          "completedAt": "2026-01-28T10:00:00Z",
          "watchedDuration": 600
        },
        {
          "lessonId": "uuid",
          "lessonName": "Lesson 2",
          "lessonOrder": 1,
          "lessonType": "video",
          "duration": 900,
          "completed": false,
          "completedAt": null,
          "watchedDuration": 450
        }
      ]
    }
  ]
}
```

---

## Architecture

### Microservices Communication

```
API Gateway (REST)
    ↓ (MessagePattern)
Course Service (Business Logic)
    ↓ (Database)
PostgreSQL (lesson_progress, enrollments)
```

### Message Patterns

| Pattern             | Purpose                             |
| ------------------- | ----------------------------------- |
| `lesson.get`        | Get lesson detail with access check |
| `lesson.complete`   | Mark lesson completed               |
| `lesson.uncomplete` | Mark lesson uncompleted             |
| `course.progress`   | Get detailed progress               |

---

## Database Schema

### lesson_progress

```sql
id                UUID PRIMARY KEY
userId            UUID NOT NULL
lessonId          UUID NOT NULL
completed         BOOLEAN DEFAULT FALSE
watchedDuration   INTEGER DEFAULT 0
completedAt       TIMESTAMP
startedAt         TIMESTAMP
updatedAt         TIMESTAMP

UNIQUE(userId, lessonId)
INDEX(userId, completed)
```

### enrollments (updated)

```sql
-- New fields added:
completed_lessons_count   INTEGER DEFAULT 0
total_lessons_count       INTEGER DEFAULT 0
```

---

## Progress Calculation

```typescript
progress = (completed_lessons_count / total_lessons_count) * 100;
```

**Updated On:**

- User completes a lesson
- User uncompletes a lesson
- Admin adds/removes lessons (future)

---

## Error Codes

| Code | Scenario                             |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 401  | Unauthorized (no JWT)                |
| 403  | Forbidden (not enrolled / no access) |
| 404  | Lesson/Course not found              |
| 500  | Server error                         |

---

## Complete API List

### Public APIs

- `GET /api/courses` - Browse courses
- `GET /api/courses/:id` - Get course detail
- `GET /api/courses/:id/sections` - Get course structure

### Authenticated User APIs

- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/enrolled` - My enrolled courses
- `GET /api/lessons/:id` - Get lesson (with access control)
- `POST /api/lessons/:id/complete` - ✨ NEW
- `POST /api/lessons/:id/uncomplete` - ✨ NEW
- `GET /api/courses/:id/progress` - ✨ UPDATED (detailed)

### Admin APIs

- `GET /api/admin/courses` - List all courses
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `POST /api/admin/courses/sections` - Create section
- `POST /api/admin/courses/lessons` - Create lesson
- `GET /api/admin/courses/sections/:sectionId/lessons/tree` - Get lesson tree
- `POST /api/admin/courses/lessons/:lessonId/video` - Upload video

---

## Testing Flow

### 1. Setup

```bash
# Start services
npm run start:dev:identity    # Port: Redis
npm run start:dev:course      # Port: Redis
npm run start:dev:api-gateway # Port: 8000
```

### 2. Test Sequence

```bash
# 1. Register/Login
POST http://localhost:8000/api/auth/login
→ Get JWT token

# 2. Enroll in course
POST http://localhost:8000/api/courses/{courseId}/enroll
Authorization: Bearer {token}

# 3. Get lesson
GET http://localhost:8000/api/lessons/{lessonId}
Authorization: Bearer {token}

# 4. Complete lesson
POST http://localhost:8000/api/lessons/{lessonId}/complete
Authorization: Bearer {token}
Body: { "watchedDuration": 600 }

# 5. Check progress
GET http://localhost:8000/api/courses/{courseId}/progress
Authorization: Bearer {token}
```

---

## Swagger Documentation

Access at: **http://localhost:8000/docs**

All new endpoints are documented with:

- ✅ Request/Response schemas
- ✅ Authentication requirements
- ✅ Error responses
- ✅ Examples

---

## Next Steps (Optional Enhancements)

### Phase 2

- [ ] Video seek position tracking
- [ ] Quiz progress tracking
- [ ] Assignment submissions
- [ ] Certificate generation on 100% completion

### Phase 3

- [ ] Learning analytics dashboard
- [ ] Recommended next lesson
- [ ] Watch time reports
- [ ] Completion rate by section

---

## Status: ✅ PRODUCTION READY

All core learning features implemented with:

- Transaction safety
- Access control
- Progress tracking
- Error handling
- Type safety
- Documentation
