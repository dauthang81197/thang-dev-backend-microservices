# Course Microservice - Architecture Documentation

## Overview

This is a production-ready NestJS microservice for managing courses, enrollments, and progress tracking in an online learning platform (Udemy-like). It's designed to work independently from the identity service while maintaining data integrity through strategic denormalization.

## Architecture Decisions

### 1. **No Foreign Keys to User Database**

- **Decision**: Store `userId` as UUID string without database-level foreign keys
- **Rationale**:
  - Maintains microservice independence
  - Allows user and course services to scale independently
  - Prevents distributed transaction complexity
  - Each service owns its own database
- **Trade-off**: Must handle referential integrity at application level

### 2. **Denormalization Strategy**

- **Decision**: Store `instructorName` in Course entity
- **Rationale**:
  - Reduces cross-service calls for common queries
  - Improves read performance for course listings
  - Acceptable staleness (instructor names rarely change)
- **Synchronization**: Should be updated via events/message queue when user name changes

### 3. **Enrollment Count Caching**

- **Decision**: Maintain `enrollmentCount` counter in Course entity
- **Rationale**:
  - Critical for sorting/ranking courses
  - Expensive to calculate on-the-fly
  - Atomic updates via raw SQL prevent race conditions
- **Implementation**: Incremented directly when enrollment created

### 4. **Progress Calculation**

- **Decision**: Calculate progress on-demand rather than caching
- **Rationale**:
  - Progress changes frequently
  - Calculation is relatively cheap (one query)
  - Ensures data accuracy
  - No stale data issues

### 5. **Composite Indexes**

- **Key Indexes**:
  ```typescript
  @Index(['userId', 'courseId']) // Fast enrollment lookups
  @Index(['status', 'createdAt']) // Course filtering
  @Index(['category']) // Category filtering
  @Index(['courseId', 'orderIndex']) // Ordered section/lesson retrieval
  ```
- **Rationale**: Optimized for common query patterns

### 6. **Unique Constraints**

- **Decision**: Unique constraint on `(userId, courseId)` for enrollments
- **Rationale**:
  - Prevents duplicate enrollments
  - Database-level guarantee
  - Better than application-level checks

## Database Schema

### Entities & Relationships

```
Course (1) ──── (N) Section (1) ──── (N) Lesson
   │                                      │
   │                                      │
   └──── (N) Enrollment                   └──── (N) LessonProgress
              │                                      │
              └──── userId (UUID)                    └──── userId (UUID)
```

### Key Fields

**Course**:

- `id`: UUID primary key
- `instructorId`: UUID (stored, no FK)
- `instructorName`: Denormalized for performance
- `status`: Enum (draft/published/archived)
- `enrollmentCount`: Cached counter
- `rating`, `reviewCount`: Aggregated metrics

**Enrollment**:

- Unique(`userId`, `courseId`)
- `status`: Enum (active/completed/suspended)
- `progress`: Percentage (0-100)
- `lastAccessedAt`: For "Continue Learning" feature

**LessonProgress**:

- Unique(`userId`, `lessonId`)
- `completed`: Boolean flag
- `watchedDuration`: For video resume
- `completedAt`: Timestamp

## API Endpoints

### 1. GET /courses

**Purpose**: List all published courses with filtering
**Auth**: None (public)
**Query Params**:

- `category`: Filter by category
- `level`: Filter by difficulty
- `search`: Full-text search (title, description, tags)
- `page`, `limit`: Pagination

**Response**:

```json
{
  "courses": [Course],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

**Optimizations**:

- Uses query builder with LEFT JOIN
- Indexes on status, category, level
- ILIKE for case-insensitive search
- Ordered by popularity (enrollmentCount, rating)

### 2. GET /courses/:id

**Purpose**: Get detailed course information
**Auth**: None (public)
**Response**: Full course with sections and lessons

**Features**:

- Eager loads sections and lessons
- Sorts by orderIndex
- Calculates virtual fields (totalLessons, totalDuration)

### 3. GET /courses/enrolled

**Purpose**: Get user's enrolled courses
**Auth**: Required (JWT)
**User Context**: From `req.user.id`

**Optimizations**:

- INNER JOIN with enrollments
- Filters by userId and active status
- Orders by lastAccessedAt (most recent first)

### 4. POST /courses/:id/enroll

**Purpose**: Enroll user in course
**Auth**: Required (JWT)
**User Context**: From `req.user.id`

**Business Logic**:

1. Verify course exists and is published
2. Check for existing enrollment
3. If exists and suspended → reactivate
4. If exists and active → return conflict
5. Create new enrollment
6. Increment course enrollmentCount

**Idempotency**: Handles re-enrollment gracefully

### 5. GET /courses/:id/progress

**Purpose**: Get user's progress in a course
**Auth**: Required (JWT)
**User Context**: From `req.user.id`

**Response**:

```json
{
  "totalLessons": 45,
  "completedLessons": 12,
  "progressPercent": 26.67
}
```

**Logic**:

- Verifies enrollment first
- Counts total lessons in course
- Counts completed lessons for user
- Calculates percentage

## Service Layer Architecture

### CourseService

**Responsibilities**:

- Course CRUD operations
- Filtering and search
- Course listing with pagination
- Virtual field calculations

**Key Methods**:

- `findAll()`: Filtered course listing
- `findOne()`: Single course detail
- `findEnrolledCourses()`: User's courses
- `exists()`: Course existence check

### EnrollmentService

**Responsibilities**:

- Enrollment creation
- Enrollment status management
- Duplicate prevention
- Enrollment verification

**Key Methods**:

- `enrollUser()`: Create/reactivate enrollment
- `isUserEnrolled()`: Check enrollment status
- `updateEnrollmentCount()`: Atomic counter increment

### ProgressService

**Responsibilities**:

- Progress tracking
- Lesson completion
- Progress calculation

**Key Methods**:

- `getCourseProgress()`: Calculate user progress
- `markLessonComplete()`: Mark lesson done

## Authentication Integration

### JWT Strategy

```typescript
// req.user structure (from identity service)
{
  id: string,      // User UUID
  email: string,
  // ... other claims
}
```

### Guards & Decorators

- **JwtAuthGuard**: Verifies req.user exists
- **@CurrentUser()**: Extracts user from request
- **@CurrentUser('id')**: Extracts specific field

**Note**: Actual JWT validation happens at API Gateway level. This service assumes valid JWT was already verified.

## Performance Optimizations

### Database Level

1. **Strategic Indexes**: Cover common query patterns
2. **Partial Indexes**: On status fields
3. **Composite Indexes**: For multi-column filters
4. **Eager Loading**: Use LEFT JOIN for related data

### Application Level

1. **Query Builder**: Type-safe, optimized queries
2. **Denormalization**: Reduce cross-service calls
3. **Atomic Updates**: Raw SQL for counters
4. **Virtual Fields**: Computed on-demand

### Future Optimizations

- [ ] Redis caching for popular courses
- [ ] Search engine (Elasticsearch) integration
- [ ] CDN for course thumbnails
- [ ] Read replicas for heavy queries

## Error Handling

### Custom Exceptions

- `NotFoundException`: Course not found
- `ConflictException`: Duplicate enrollment
- `ForbiddenException`: Not enrolled (progress access)
- `UnauthorizedException`: Missing authentication

### HTTP Status Codes

- `200`: Success (GET)
- `201`: Created (POST enroll)
- `400`: Bad Request (validation)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict

## Testing Strategy

### Unit Tests

- Service methods with mocked repositories
- Business logic validation
- Edge cases (duplicate enrollment, etc.)

### Integration Tests

- Full request/response cycle
- Database interactions
- Authentication flow

### E2E Tests

- Complete user journeys
- Enrollment → Progress → Completion flow

## Deployment Considerations

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Admin@123
DB_NAME=course
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=supersecret
```

### Database Migrations

- Use TypeORM migrations for schema changes
- Run migrations before deployment
- Rollback strategy for failed deployments

### Scalability

- Stateless design (horizontal scaling)
- Database connection pooling
- Redis transport for microservice communication
- Load balancer compatible

## Security Considerations

1. **Input Validation**: DTOs with class-validator
2. **SQL Injection**: TypeORM parameterized queries
3. **Authorization**: Guard-based access control
4. **Rate Limiting**: Should be implemented at gateway
5. **CORS**: Configure at gateway level

## Monitoring & Observability

### Metrics to Track

- Enrollment rate
- Course completion rate
- Average progress per user
- Popular courses (by enrollment)
- Query performance

### Logging

- Course access patterns
- Enrollment events
- Error rates
- Slow query log

## Future Enhancements

### Phase 2 Features

- [ ] Course reviews and ratings
- [ ] Course certificates on completion
- [ ] Course recommendations
- [ ] Lesson comments/discussions
- [ ] Quiz and assignment support
- [ ] Course content versioning

### Technical Improvements

- [ ] Event-driven enrollment (publish events)
- [ ] CQRS pattern for read-heavy operations
- [ ] GraphQL endpoint for flexible queries
- [ ] Real-time progress updates (WebSocket)
- [ ] Course content CDN integration

---

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Setup Database

```bash
createdb course
```

### 3. Run Migrations

```bash
yarn typeorm migration:run
```

### 4. Start Service

```bash
yarn start:dev course
```

### 5. Test Endpoints

```bash
# List courses
curl http://localhost:3000/courses

# Get course detail
curl http://localhost:3000/courses/{id}

# Enroll (requires auth)
curl -X POST http://localhost:3000/courses/{id}/enroll \
  -H "Authorization: Bearer {token}"
```

## Contact & Support

For questions or issues, please refer to the main project documentation or contact the development team.
