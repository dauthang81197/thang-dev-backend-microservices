# Course Microservice Architecture Update

## 🔄 Architecture Change: API Gateway Pattern

### Overview

The Course microservice has been refactored to follow a **pure microservice architecture** where:

- **API Gateway** handles all HTTP REST requests
- **Course Service** only handles message patterns (Redis transport)
- Authentication/Authorization happens at the gateway level

---

## 🏗️ New Architecture

```
┌─────────────────┐
│   Frontend/     │
│   Mobile App    │
└────────┬────────┘
         │ HTTP REST
         ▼
┌─────────────────┐
│   API Gateway   │◄─── JWT Authentication
│   (Port 3000)   │◄─── Rate Limiting
└────────┬────────┘◄─── CORS
         │ Redis (Message Pattern)
         ▼
┌─────────────────┐
│ Course Service  │
│  (Microservice) │◄─── PostgreSQL
└─────────────────┘
```

### Before (Old Architecture)

```typescript
// Course Service had REST endpoints
@Controller('courses')
export class CourseController {
  @Get()  // ❌ HTTP endpoint in microservice
  async getCourses() { ... }
}
```

### After (New Architecture)

```typescript
// API Gateway handles REST
@Controller('courses')
export class CourseGatewayController {
  @Get()  // ✅ HTTP endpoint in gateway
  async getCourses() {
    return this.courseClient.send('courses.findAll', query);
  }
}

// Course Service only handles messages
@Controller()
export class CourseController {
  @MessagePattern('courses.findAll')  // ✅ Message pattern
  async getCourses(@Payload() query) { ... }
}
```

---

## 📍 API Gateway Endpoints

All HTTP endpoints are now handled by API Gateway:

| Method | Endpoint                | Description               | Auth |
| ------ | ----------------------- | ------------------------- | ---- |
| GET    | `/courses`              | List courses with filters | ❌   |
| GET    | `/courses/enrolled`     | User's enrolled courses   | ✅   |
| GET    | `/courses/:id`          | Course details            | ❌   |
| POST   | `/courses/:id/enroll`   | Enroll in course          | ✅   |
| GET    | `/courses/:id/progress` | Course progress           | ✅   |

**Base URL**: `http://localhost:3000` (API Gateway)

---

## 🔐 Authentication Flow

### Old Flow (Direct)

```
Client → Course Service (JWT validation here)
```

### New Flow (Gateway)

```
Client → API Gateway (JWT validation) → Course Service (userId from payload)
```

**Benefits:**

- Centralized authentication
- Single point of JWT validation
- Microservice doesn't need JWT logic
- Better security (service is internal only)

---

## 📨 Message Patterns

Course Service now only responds to these message patterns:

```typescript
// 1. Get all courses
'courses.findAll'
Payload: { category?, level?, search?, page?, limit? }

// 2. Get enrolled courses
'courses.findEnrolled'
Payload: { userId: string }

// 3. Get course details
'courses.findOne'
Payload: { id: string }

// 4. Enroll in course
'courses.enroll'
Payload: { courseId: string, userId: string }

// 5. Get course progress
'courses.getProgress'
Payload: { courseId: string, userId: string }
```

---

## 🚀 How to Run

### 1. Start Course Microservice

```bash
npm run start:dev:course
```

**Listens on**: Redis (message patterns only)
**No HTTP endpoint exposed**

### 2. Start API Gateway

```bash
npm run start:dev:api-gateway
```

**Listens on**: `http://localhost:3000`
**Exposes**: REST API endpoints

### 3. Test via API Gateway

```bash
# List courses
curl http://localhost:3000/courses

# Enroll in course (with JWT)
curl -X POST http://localhost:3000/courses/{id}/enroll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔄 What Changed

### Removed from Course Service

- ❌ REST decorators (`@Get`, `@Post`)
- ❌ HTTP route definitions (`@Controller('courses')`)
- ❌ `JwtAuthGuard` (authentication at gateway)
- ❌ `@CurrentUser()` decorator
- ❌ HTTP status codes (`@HttpCode`)
- ❌ Guards/decorators/interfaces folders

### Added to API Gateway

- ✅ `CourseGatewayController`
- ✅ REST endpoints with Swagger docs
- ✅ JWT authentication (using existing `JwtAuthGuard`)
- ✅ Course service client (Redis transport)

### What Stayed in Course Service

- ✅ `@MessagePattern()` handlers
- ✅ Business logic (services)
- ✅ Database entities and repositories
- ✅ DTOs for validation
- ✅ TypeORM configuration

---

## 📦 Updated Files

### API Gateway

```
apps/api-gateway/
├── src/
│   ├── api-gateway.module.ts         # Added COURSE_SERVICE client
│   └── controllers/
│       └── course/
│           └── course-gateway.controller.ts  # NEW: REST endpoints
```

### Course Service

```
apps/course/
└── src/
    └── modules/
        └── course/
            ├── course.controller.ts   # Updated: Only @MessagePattern
            ├── guards/                # REMOVED
            ├── decorators/            # REMOVED
            └── interfaces/            # REMOVED
```

---

## 🧪 Testing

### Test via API Gateway (Recommended)

```bash
# Use the HTTP file
# apps/course/test/api-tests.http

# Update base URL to API Gateway
@baseUrl = http://localhost:3000

GET {{baseUrl}}/courses
GET {{baseUrl}}/courses/enrolled
```

### Test Microservice Directly (Not Recommended)

Course service no longer has HTTP endpoints, only message patterns.
Direct testing requires Redis client.

---

## 🔒 Security Improvements

1. **Centralized Authentication**
   - JWT validation happens once at gateway
   - Microservice trusts gateway (internal network)

2. **Service Isolation**
   - Course service not exposed to internet
   - Only accessible via Redis (internal)

3. **Single Entry Point**
   - All requests go through gateway
   - Easier to implement rate limiting, logging, etc.

---

## 🎯 Benefits of This Architecture

### 1. **Separation of Concerns**

- Gateway handles HTTP/REST/Authentication
- Microservice handles business logic only

### 2. **Scalability**

- Scale gateway and service independently
- Add multiple microservices behind same gateway

### 3. **Security**

- Microservices not exposed to internet
- Authentication logic in one place

### 4. **Maintainability**

- Clear boundaries between layers
- Easier to test (no HTTP mocking in service tests)

### 5. **Flexibility**

- Easy to add new microservices
- Easy to change authentication strategy

---

## 📊 Request Flow Example

### Enrolling in a Course

```
1. Client sends HTTP POST
   ↓
   POST http://localhost:3000/courses/123/enroll
   Authorization: Bearer eyJhbGc...

2. API Gateway receives request
   ↓
   - Validates JWT token
   - Extracts userId from token
   - Prepares message payload

3. Gateway sends message to Course Service
   ↓
   courseClient.send('courses.enroll', {
     courseId: '123',
     userId: 'user-uuid-from-jwt'
   })

4. Course Service handles message
   ↓
   @MessagePattern('courses.enroll')
   enrollInCourse(payload) {
     // Business logic
     // No authentication needed
   }

5. Response flows back
   ↓
   Course Service → Gateway → Client
```

---

## 🚨 Important Notes

### For Frontend Developers

- **Change base URL** from `course-service:port` to `api-gateway:3000`
- All endpoints remain the same (routes unchanged)
- Authentication still via JWT Bearer token

### For Backend Developers

- Course service now **internal only**
- Don't add HTTP decorators to course controller
- Use `@MessagePattern()` for all new endpoints
- Add corresponding gateway controller for REST

### For DevOps

- Only API Gateway needs to be publicly accessible
- Course service can be on internal network only
- Use service mesh or internal DNS for Redis

---

## 🔄 Migration Checklist

- [x] Create `CourseGatewayController` in API Gateway
- [x] Add `COURSE_SERVICE` client to API Gateway
- [x] Remove REST decorators from Course Service
- [x] Keep only `@MessagePattern()` handlers
- [x] Remove guards/decorators/interfaces from Course Service
- [x] Update documentation
- [ ] Update frontend API base URL
- [ ] Update deployment configs
- [ ] Update API documentation/Swagger

---

## 📚 Related Documentation

- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Message Patterns in NestJS](https://docs.nestjs.com/microservices/basics)
- [Redis Transport](https://docs.nestjs.com/microservices/redis)

---

**Updated**: January 27, 2026  
**Status**: ✅ Migration Complete
