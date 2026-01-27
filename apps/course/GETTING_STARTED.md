# 🎓 Course Microservice - Complete Implementation

## 📦 What You Got

A **production-ready NestJS Course Microservice** for your online learning platform with:

✅ **5 Entities** - Course, Section, Lesson, Enrollment, LessonProgress  
✅ **3 Services** - CourseService, EnrollmentService, ProgressService  
✅ **5 API Endpoints** - All requirements met  
✅ **JWT Authentication** - With guard and decorator  
✅ **PostgreSQL Optimization** - Strategic indexes  
✅ **TypeORM Migration** - Database schema ready  
✅ **Sample Data** - Seed script with 3 courses  
✅ **Unit Tests** - Test examples included  
✅ **Documentation** - Architecture, API, diagrams  
✅ **Docker & K8s** - Deployment manifests

---

## 🚀 Quick Start (5 Steps)

### 1️⃣ Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE course;

# Enable UUID extension
\c course
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### 2️⃣ Configure Environment

```bash
cd apps/course
cp .env.example .env

# Edit .env with your credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=Admin@123
# DB_NAME=course
```

### 3️⃣ Run Migration

```bash
# From project root
npm run typeorm:course:migration:run
```

### 4️⃣ Seed Sample Data (Optional)

```bash
npm run seed:course
```

This creates:

- 3 sample courses (JavaScript, Python, React)
- Sections and lessons for each course
- Ready for testing

### 5️⃣ Start Service

```bash
# Development mode
npm run start:dev:course

# You should see:
# Loaded entities: [...]
# Course Microservice is running...
```

---

## 🧪 Test the API

### Using REST Client (VS Code Extension)

1. Install REST Client extension
2. Open `apps/course/test/api-tests.http`
3. Click "Send Request" above each endpoint

### Using cURL

```bash
# 1. List all courses
curl http://localhost:3000/courses

# 2. Filter by category
curl "http://localhost:3000/courses?category=programming&level=beginner"

# 3. Get course details
curl http://localhost:3000/courses/{courseId}

# 4. Enroll in course (requires JWT)
curl -X POST http://localhost:3000/courses/{courseId}/enroll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Get progress (requires JWT)
curl http://localhost:3000/courses/{courseId}/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Database Schema

```sql
-- 5 Tables Created:

courses
  - id (UUID PK)
  - title, description, category, level
  - instructorId (UUID, NO FK)
  - instructorName (denormalized)
  - enrollmentCount (cached)
  - status (draft/published/archived)

sections
  - id (UUID PK)
  - courseId (FK → courses)
  - orderIndex (for ordering)

lessons
  - id (UUID PK)
  - sectionId (FK → sections)
  - type (video/article/quiz/etc)
  - duration, content
  - orderIndex

enrollments
  - id (UUID PK)
  - userId (UUID, NO FK)
  - courseId (FK → courses)
  - status, progress
  - UNIQUE(userId, courseId)

lesson_progress
  - id (UUID PK)
  - userId (UUID, NO FK)
  - lessonId (FK → lessons)
  - completed, watchedDuration
  - UNIQUE(userId, lessonId)
```

---

## 🎯 API Endpoints Overview

| Method | Endpoint                | Auth   | Description               |
| ------ | ----------------------- | ------ | ------------------------- |
| GET    | `/courses`              | ❌ No  | List courses with filters |
| GET    | `/courses/enrolled`     | ✅ Yes | User's enrolled courses   |
| GET    | `/courses/:id`          | ❌ No  | Course details            |
| POST   | `/courses/:id/enroll`   | ✅ Yes | Enroll in course          |
| GET    | `/courses/:id/progress` | ✅ Yes | Course progress           |

### Request/Response Examples

**GET /courses?category=programming&level=beginner**

```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Complete JavaScript Course",
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

**POST /courses/:id/enroll** (with JWT)

```json
{
  "success": true,
  "message": "Successfully enrolled in the course",
  "enrollmentId": "uuid"
}
```

**GET /courses/:id/progress** (with JWT)

```json
{
  "totalLessons": 45,
  "completedLessons": 12,
  "progressPercent": 26.67
}
```

---

## 🏗️ Architecture Highlights

### 1. **Microservice Independence**

- ✅ No foreign keys to user database
- ✅ Stores userId as UUID string only
- ✅ Can scale independently

### 2. **Performance Optimizations**

- ✅ Strategic database indexes
- ✅ Denormalized fields (instructorName)
- ✅ Cached enrollment count
- ✅ Query builder for efficient queries

### 3. **Data Integrity**

- ✅ Unique constraints (userId + courseId)
- ✅ Cascade deletes
- ✅ Atomic counter updates

### 4. **Security**

- ✅ JWT authentication
- ✅ Input validation (DTOs)
- ✅ SQL injection prevention
- ✅ Authorization checks

---

## 📁 Project Structure

```
apps/course/
├── src/
│   ├── main.ts                      # Entry point
│   ├── course.module.ts             # Root module
│   ├── env/
│   │   └── environment.ts           # Config
│   ├── database/
│   │   ├── ormconfig.ts             # TypeORM config
│   │   ├── migrations/              # DB migrations
│   │   │   └── 1738048000000-InitialSchema.ts
│   │   └── seed.ts                  # Sample data
│   ├── shareds/
│   │   └── entities/                # All entities
│   │       ├── course.entity.ts
│   │       ├── section.entity.ts
│   │       ├── lesson.entity.ts
│   │       ├── enrollment.entity.ts
│   │       └── lesson-progress.entity.ts
│   └── modules/
│       ├── base-platform.module.ts
│       └── course/
│           ├── course.module.ts
│           ├── course.controller.ts
│           ├── course.service.ts
│           ├── enrollment.service.ts
│           ├── progress.service.ts
│           ├── dto/                 # Data transfer objects
│           ├── guards/              # Auth guards
│           ├── decorators/          # Custom decorators
│           └── interfaces/          # Type definitions
├── test/
│   ├── api-tests.http               # API test file
│   └── app.e2e-spec.ts
├── Dockerfile
├── .env.example
├── ARCHITECTURE.md                  # Full architecture docs
├── README.md                        # Quick reference
├── IMPLEMENTATION_SUMMARY.md        # What was built
└── DIAGRAMS.md                      # Visual diagrams
```

---

## 🛠️ NPM Scripts

```bash
# Development
npm run start:dev:course        # Start in watch mode

# Build
npm run build:course            # Build for production

# Database
npm run typeorm:course:migration:run      # Run migrations
npm run typeorm:course:migration:revert   # Rollback migration
npm run typeorm:course:migration:generate # Generate migration
npm run seed:course                       # Seed sample data

# Testing
npm test -- apps/course         # Run unit tests
npm run test:watch              # Watch mode
npm run test:cov                # Coverage report
```

---

## 🔍 Key Features Explained

### 1. No Foreign Keys to User DB

```typescript
// ❌ Don't do this
@ManyToOne(() => User)
userId: User;

// ✅ Do this instead
@Column({ type: 'uuid' })
userId: string;  // Just store the UUID
```

**Why?** Maintains microservice independence. Services can scale separately.

### 2. Denormalized Instructor Name

```typescript
@Column({ type: 'uuid' })
instructorId: string;

@Column({ type: 'text', nullable: true })
instructorName: string;  // ← Cached for performance
```

**Why?** Avoids cross-service calls when listing courses. Update via events when name changes.

### 3. Cached Enrollment Count

```typescript
@Column({ type: 'int', default: 0 })
enrollmentCount: number;  // ← Updated atomically
```

**Why?** Critical for sorting popular courses. Expensive to count on-the-fly.

### 4. Progress Calculation

```typescript
async getCourseProgress(userId: string, courseId: string) {
  // Calculate on-demand for accuracy
  const totalLessons = await this.countLessons(courseId);
  const completedLessons = await this.countCompleted(userId, courseId);
  return { totalLessons, completedLessons, progressPercent };
}
```

**Why?** Ensures data accuracy. Progress changes frequently.

---

## 🎓 How to Use @CurrentUser Decorator

```typescript
@Get('enrolled')
@UseGuards(JwtAuthGuard)  // ← Require authentication
async getEnrolledCourses(
  @CurrentUser('id') userId: string,  // ← Extract user ID from JWT
) {
  return this.courseService.findEnrolledCourses(userId);
}
```

**JWT Structure Expected:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com"
  // ... other claims
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Migration fails

```
Error: relation "courses" already exists
```

**Solution:** Database already has tables. Either drop them or revert migration:

```bash
npm run typeorm:course:migration:revert
```

### Issue 2: Cannot connect to database

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

1. Check PostgreSQL is running: `psql -U postgres`
2. Verify credentials in `.env`
3. Ensure database exists: `createdb course`

### Issue 3: Duplicate enrollment error

```
409 Conflict: You are already enrolled in this course
```

**Solution:** This is expected! User is already enrolled. Use the existing enrollment.

### Issue 4: Authentication required error

```
401 Unauthorized: Authentication required
```

**Solution:** Endpoint requires JWT. Add Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📈 Performance Tips

1. **Use Pagination Always**

   ```
   GET /courses?page=1&limit=10
   ```

2. **Combine Filters**

   ```
   GET /courses?category=programming&level=beginner
   ```

3. **Monitor Slow Queries**
   - Check TypeORM logs for queries > 500ms
   - Add indexes if needed

4. **Consider Caching** (Future)
   - Redis for popular courses
   - Cache course listings

---

## 🔐 Security Checklist

- [x] Input validation (DTOs with class-validator)
- [x] SQL injection prevention (TypeORM parameterized)
- [x] Authentication guard
- [x] Authorization checks
- [ ] Rate limiting (API Gateway)
- [ ] Request size limits
- [ ] CORS configuration

---

## 📚 Documentation Files

1. **ARCHITECTURE.md** - Complete architecture decisions
2. **README.md** - Quick reference guide
3. **IMPLEMENTATION_SUMMARY.md** - What was built
4. **DIAGRAMS.md** - Visual architecture diagrams
5. **api-tests.http** - API test examples

---

## 🎯 Next Steps

### Immediate

1. ✅ Test all endpoints
2. ✅ Review database schema
3. ✅ Customize for your needs

### Short Term

- [ ] Integrate with API Gateway
- [ ] Connect to Identity Service
- [ ] Add more business logic
- [ ] Write integration tests

### Long Term

- [ ] Add reviews/ratings
- [ ] Implement certificates
- [ ] Add course recommendations
- [ ] Real-time progress updates

---

## 💡 Pro Tips

1. **JWT Validation**: Happens at API Gateway, not here
2. **User Data**: Never store sensitive user data here
3. **Events**: Publish enrollment events for other services
4. **Monitoring**: Track enrollment rates and completion
5. **Caching**: Consider Redis for popular courses

---

## 🤝 Need Help?

1. Check **ARCHITECTURE.md** for design decisions
2. See **DIAGRAMS.md** for visual explanations
3. Review test files for usage examples
4. Check TypeORM docs for advanced queries

---

## ✨ What Makes This Production-Ready?

✅ **Type Safety** - TypeScript throughout  
✅ **Validation** - DTOs with class-validator  
✅ **Error Handling** - Proper HTTP exceptions  
✅ **Database** - Migrations & indexes  
✅ **Testing** - Unit test examples  
✅ **Documentation** - Comprehensive docs  
✅ **Docker** - Containerization ready  
✅ **K8s** - Kubernetes manifests  
✅ **Security** - Auth guards & validation  
✅ **Performance** - Optimized queries

---

**🎉 You're ready to build an amazing online learning platform!**

**Status**: ✅ Complete  
**Version**: 1.0.0  
**Date**: January 27, 2026
