# Course Microservice - Quick Reference

## File Structure

```
apps/course/
├── src/
│   ├── main.ts                          # Microservice bootstrap
│   ├── course.module.ts                 # Root module
│   ├── env/
│   │   └── environment.ts               # Environment configuration
│   ├── database/
│   │   ├── ormconfig.ts                 # TypeORM configuration
│   │   ├── typeorm.repository.ts        # Base repository
│   │   └── migrations/
│   │       └── 1738048000000-InitialSchema.ts
│   ├── shareds/
│   │   └── entities/
│   │       ├── course.entity.ts         # Course entity
│   │       ├── section.entity.ts        # Section entity
│   │       ├── lesson.entity.ts         # Lesson entity
│   │       ├── enrollment.entity.ts     # Enrollment entity
│   │       └── lesson-progress.entity.ts # Progress tracking
│   └── modules/
│       ├── base-platform.module.ts      # Platform module
│       └── course/
│           ├── course.module.ts         # Course module
│           ├── course.controller.ts     # REST controller
│           ├── course.service.ts        # Course service
│           ├── enrollment.service.ts    # Enrollment service
│           ├── progress.service.ts      # Progress service
│           ├── dto/
│           │   ├── get-courses-query.dto.ts
│           │   ├── course-list-response.dto.ts
│           │   ├── course-progress-response.dto.ts
│           │   └── enrollment-response.dto.ts
│           ├── guards/
│           │   └── jwt-auth.guard.ts    # JWT authentication guard
│           ├── decorators/
│           │   └── current-user.decorator.ts
│           └── interfaces/
│               └── auth.interface.ts
├── Dockerfile
├── .env.example
└── ARCHITECTURE.md
```

## Setup Instructions

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE course;

# Enable UUID extension
\c course
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Configure Environment

```bash
cd apps/course
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Migrations

```bash
# From project root
npm run typeorm migration:run -- -d apps/course/src/database/ormconfig.ts
```

### 4. Start Service

```bash
# Development mode
nest start --watch course

# Production mode
nest build course
node dist/apps/course/main.js
```

## API Endpoints Summary

| Method | Endpoint                | Auth | Description                             |
| ------ | ----------------------- | ---- | --------------------------------------- |
| GET    | `/courses`              | No   | List all published courses with filters |
| GET    | `/courses/enrolled`     | Yes  | Get user's enrolled courses             |
| GET    | `/courses/:id`          | No   | Get course details                      |
| POST   | `/courses/:id/enroll`   | Yes  | Enroll in a course                      |
| GET    | `/courses/:id/progress` | Yes  | Get course progress                     |

## Example Requests

### 1. List Courses

```bash
curl "http://localhost:3000/courses?category=programming&level=beginner&page=1&limit=10"
```

**Response:**

```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Introduction to Python",
      "description": "Learn Python from scratch",
      "category": "programming",
      "level": "beginner",
      "price": 29.99,
      "instructorName": "John Doe",
      "enrollmentCount": 1500,
      "rating": 4.8,
      "totalLessons": 45,
      "totalDuration": 14400
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### 2. Get Course Detail

```bash
curl "http://localhost:3000/courses/{courseId}"
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Introduction to Python",
  "description": "Learn Python from scratch",
  "sections": [
    {
      "id": "uuid",
      "title": "Getting Started",
      "orderIndex": 0,
      "lessons": [
        {
          "id": "uuid",
          "title": "Introduction",
          "type": "video",
          "duration": 600,
          "isFree": true
        }
      ]
    }
  ]
}
```

### 3. Enroll in Course

```bash
curl -X POST "http://localhost:3000/courses/{courseId}/enroll" \
  -H "Authorization: Bearer {jwt_token}"
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully enrolled in the course",
  "enrollmentId": "uuid"
}
```

### 4. Get Enrolled Courses

```bash
curl "http://localhost:3000/courses/enrolled" \
  -H "Authorization: Bearer {jwt_token}"
```

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Introduction to Python",
    "progress": 26.67,
    "lastAccessedAt": "2026-01-27T10:00:00Z"
  }
]
```

### 5. Get Course Progress

```bash
curl "http://localhost:3000/courses/{courseId}/progress" \
  -H "Authorization: Bearer {jwt_token}"
```

**Response:**

```json
{
  "totalLessons": 45,
  "completedLessons": 12,
  "progressPercent": 26.67
}
```

## Database Schema Quick Reference

### Entities Overview

- **Course**: Main course information
- **Section**: Course sections/modules
- **Lesson**: Individual lessons within sections
- **Enrollment**: User course enrollment records
- **LessonProgress**: User progress per lesson

### Key Relationships

```
Course 1──N Section 1──N Lesson
Course 1──N Enrollment
Lesson 1──N LessonProgress
```

### Important Indexes

- `courses`: (status, createdAt), (category), (instructorId)
- `enrollments`: (userId, courseId) UNIQUE, (userId, status)
- `lesson_progress`: (userId, lessonId) UNIQUE
- `sections`: (courseId, orderIndex)
- `lessons`: (sectionId, orderIndex)

## Common Tasks

### Add New Course (Example)

```typescript
// Through TypeORM repository
const course = courseRepository.create({
  title: 'Advanced JavaScript',
  description: 'Master JavaScript',
  category: 'programming',
  level: CourseLevel.ADVANCED,
  price: 49.99,
  instructorId: 'user-uuid',
  instructorName: 'Jane Smith',
  status: CourseStatus.PUBLISHED,
  publishedAt: new Date(),
});
await courseRepository.save(course);
```

### Add Sections and Lessons

```typescript
const section = sectionRepository.create({
  title: 'Getting Started',
  courseId: course.id,
  orderIndex: 0,
});
await sectionRepository.save(section);

const lesson = lessonRepository.create({
  title: 'Introduction',
  sectionId: section.id,
  type: LessonType.VIDEO,
  content: 'https://video-url.com',
  duration: 600,
  orderIndex: 0,
  isFree: true,
});
await lessonRepository.save(lesson);
```

## Testing

### Unit Tests

```bash
npm test -- apps/course
```

### E2E Tests

```bash
npm run test:e2e -- apps/course
```

## Monitoring

### Key Metrics

- Total enrollments per day
- Popular courses (by enrollment count)
- Average course completion rate
- User engagement (lastAccessedAt)

### Health Check

```bash
curl http://localhost:3000/health
```

## Troubleshooting

### Issue: Cannot connect to database

**Solution**: Check database credentials in `.env` and ensure PostgreSQL is running

### Issue: Migrations fail

**Solution**: Ensure database exists and UUID extension is enabled

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: Duplicate enrollment error

**Solution**: This is expected behavior. Check if user is already enrolled before calling enroll endpoint

### Issue: Progress returns 0

**Solution**: Ensure user has completed at least one lesson and lesson progress records exist

## Performance Tips

1. **Use pagination**: Always use `page` and `limit` parameters
2. **Filter wisely**: Combine filters (category + level) for better performance
3. **Cache popular courses**: Consider Redis for frequently accessed courses
4. **Index optimization**: Monitor slow queries and add indexes as needed

## Security Checklist

- [x] Input validation (DTOs with class-validator)
- [x] SQL injection prevention (TypeORM parameterized queries)
- [x] Authentication guard for protected endpoints
- [x] No foreign keys to user database (service isolation)
- [ ] Rate limiting (implement at API Gateway)
- [ ] Request size limits
- [ ] CORS configuration

## Production Deployment

### Docker Build

```bash
docker build -t course-service -f apps/course/Dockerfile .
```

### Kubernetes Deploy

```bash
kubectl apply -f apps/course/k8s/
```

### Environment Variables (Production)

```env
DB_HOST=postgres-service.default.svc.cluster.local
DB_PORT=5432
DB_USERNAME=course_user
DB_PASSWORD=<secure-password>
DB_NAME=course
REDIS_HOST=redis-service.default.svc.cluster.local
REDIS_PORT=6379
JWT_SECRET=<secure-secret>
ENV=production
```

## Additional Resources

- [Full Architecture Documentation](./ARCHITECTURE.md)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- Main Project README

---

**Version**: 1.0.0  
**Last Updated**: January 27, 2026  
**Maintainer**: Backend Team
