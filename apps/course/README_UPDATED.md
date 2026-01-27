# 🎓 Course Microservice - Updated Quick Start

## ⚠️ Architecture Change

**The Course microservice now uses API Gateway pattern!**

- ✅ All HTTP requests go through **API Gateway** (port 3000)
- ✅ Course Service only handles **message patterns** (Redis)
- ✅ No direct HTTP access to Course Service

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Start Course Microservice

```bash
npm run start:dev:course
```

**Output:**

```
Course Microservice is running...
Connected to Redis...
```

### 2️⃣ Start API Gateway

```bash
npm run start:dev:api-gateway
```

**Output:**

```
API Gateway is running on: http://localhost:3000
```

### 3️⃣ Test via API Gateway

```bash
# List courses
curl http://localhost:3000/courses

# Get course details
curl http://localhost:3000/courses/{id}

# Enroll (with JWT)
curl -X POST http://localhost:3000/courses/{id}/enroll \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## 📍 API Endpoints

**Base URL**: `http://localhost:3000` ← API Gateway

| Method | Endpoint                | Auth | Description               |
| ------ | ----------------------- | ---- | ------------------------- |
| GET    | `/courses`              | ❌   | List courses with filters |
| GET    | `/courses/enrolled`     | ✅   | User's enrolled courses   |
| GET    | `/courses/:id`          | ❌   | Course details            |
| POST   | `/courses/:id/enroll`   | ✅   | Enroll in course          |
| GET    | `/courses/:id/progress` | ✅   | Course progress           |

---

## 🔄 Request Flow

```
Frontend → API Gateway → Course Service → Database
          (Port 3000)    (Redis Message)
```

**Old way (❌ No longer works):**

```bash
curl http://localhost:8001/courses  # Course service port
```

**New way (✅ Correct):**

```bash
curl http://localhost:3000/courses  # API Gateway port
```

---

## 📚 Documentation

- **[ARCHITECTURE_UPDATE.md](./ARCHITECTURE_UPDATE.md)** - Why and how architecture changed
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Full architecture details
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup guide

---

## 🧪 Testing

### Option 1: REST Client (Recommended)

1. Open `apps/course/test/api-tests.http`
2. **Update base URL:**
   ```
   @baseUrl = http://localhost:3000
   ```
3. Click "Send Request"

### Option 2: cURL

```bash
# Get all courses
curl http://localhost:3000/courses

# Filter courses
curl "http://localhost:3000/courses?category=programming&level=beginner"

# Get JWT token first (from identity service)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token to enroll
curl -X POST http://localhost:3000/courses/{courseId}/enroll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🏗️ Architecture Diagram

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ HTTP REST
       ▼
┌──────────────┐
│ API Gateway  │ ← JWT Auth, Rate Limit, CORS
│ Port 3000    │
└──────┬───────┘
       │ Redis Message Pattern
       ▼
┌──────────────┐
│ Course       │
│ Microservice │ ← Business Logic, Database
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │
└──────────────┘
```

---

## ⚡ What Changed?

### Removed from Course Service

- ❌ REST endpoints (`@Get`, `@Post`)
- ❌ HTTP controllers
- ❌ JWT guards
- ❌ Authentication decorators

### Added to API Gateway

- ✅ `CourseGatewayController`
- ✅ REST endpoints with Swagger
- ✅ JWT authentication
- ✅ Course service client

### Course Service Now Only Has

- ✅ `@MessagePattern()` handlers
- ✅ Business logic (services)
- ✅ Database entities
- ✅ TypeORM configuration

---

## 🔐 Authentication

Authentication is now handled at **API Gateway level**.

```typescript
// API Gateway validates JWT
@UseGuards(JwtAuthGuard)
async enrollInCourse(@Request() req) {
  // Extract userId from validated JWT
  return this.courseClient.send('courses.enroll', {
    courseId: '...',
    userId: req.user.id  // From JWT
  });
}

// Course Service receives validated userId
@MessagePattern('courses.enroll')
async enrollInCourse(@Payload() payload: { userId, courseId }) {
  // userId is already validated
  // No need to check JWT again
}
```

---

## 📦 NPM Scripts

```bash
# Start services
npm run start:dev:course         # Start course microservice
npm run start:dev:api-gateway    # Start API gateway
npm run start:dev:identity       # Start identity service

# Database
npm run typeorm:course:migration:run    # Run migrations
npm run seed:course                      # Seed sample data

# Build
npm run build:course             # Build course service
```

---

## 🚨 Common Issues

### Issue 1: "Cannot connect to course service"

**Problem:** Trying to access course service directly  
**Solution:** Use API Gateway at `http://localhost:3000`

### Issue 2: "Connection refused"

**Problem:** Services not running  
**Solution:**

```bash
# Terminal 1: Start course service
npm run start:dev:course

# Terminal 2: Start API gateway
npm run start:dev:api-gateway
```

### Issue 3: "401 Unauthorized"

**Problem:** Missing or invalid JWT token  
**Solution:**

1. Login first to get token: `POST /auth/login`
2. Use token in header: `Authorization: Bearer {token}`

---

## 📊 Example Requests & Responses

### 1. List Courses

```bash
GET http://localhost:3000/courses?category=programming&page=1&limit=10
```

**Response:**

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
      "rating": 4.8
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### 2. Enroll in Course

```bash
POST http://localhost:3000/courses/{courseId}/enroll
Authorization: Bearer {jwt_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully enrolled in the course",
  "enrollmentId": "uuid"
}
```

### 3. Get Progress

```bash
GET http://localhost:3000/courses/{courseId}/progress
Authorization: Bearer {jwt_token}
```

**Response:**

```json
{
  "totalLessons": 45,
  "completedLessons": 12,
  "progressPercent": 26.67
}
```

---

## 🎯 For Frontend Developers

### Update Your API Base URL

**Before:**

```typescript
const API_URL = 'http://localhost:8001'; // ❌ Wrong
```

**After:**

```typescript
const API_URL = 'http://localhost:3000'; // ✅ Correct (API Gateway)
```

### All Routes Stay the Same

```typescript
// These routes work the same, just change base URL
GET  /courses
GET  /courses/enrolled
GET  /courses/:id
POST /courses/:id/enroll
GET  /courses/:id/progress
```

### Authentication

```typescript
// Get token from login
const { token } = await login(email, password);

// Use token in all authenticated requests
fetch('http://localhost:3000/courses/enrolled', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 🔗 Integration Example

```typescript
// Course Service (Frontend)
class CourseService {
  private readonly API_URL = 'http://localhost:3000';

  async getCourses(filters) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.API_URL}/courses?${params}`);
    return response.json();
  }

  async enrollInCourse(courseId, token) {
    const response = await fetch(`${this.API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  async getProgress(courseId, token) {
    const response = await fetch(
      `${this.API_URL}/courses/${courseId}/progress`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.json();
  }
}
```

---

## 📈 Benefits of This Architecture

1. **Single Entry Point** - All requests through API Gateway
2. **Centralized Auth** - JWT validation in one place
3. **Better Security** - Microservices not exposed to internet
4. **Easy Scaling** - Scale gateway and services independently
5. **Service Discovery** - Gateway routes to correct service

---

## 🆘 Need Help?

1. Check [ARCHITECTURE_UPDATE.md](./ARCHITECTURE_UPDATE.md) for migration guide
2. Review [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup
3. See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions

---

**Status**: ✅ Updated to API Gateway Pattern  
**Last Updated**: January 27, 2026  
**Version**: 2.0.0
