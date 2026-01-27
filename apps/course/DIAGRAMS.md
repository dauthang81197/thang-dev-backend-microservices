# Course Microservice - Visual Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
│  - JWT Validation                                                │
│  - Rate Limiting                                                 │
│  - CORS                                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Course Microservice                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CourseController                            │   │
│  │  - GET /courses                                          │   │
│  │  - GET /courses/:id                                      │   │
│  │  - GET /courses/enrolled                                 │   │
│  │  - POST /courses/:id/enroll                              │   │
│  │  - GET /courses/:id/progress                             │   │
│  └───────┬─────────────────┬─────────────────┬──────────────┘   │
│          │                 │                 │                   │
│          ▼                 ▼                 ▼                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │CourseService │ │EnrollmentSvc │ │ProgressSvc   │           │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘           │
│         │                │                │                     │
│         └────────────────┴────────────────┘                     │
│                          │                                       │
│                          ▼                                       │
│         ┌────────────────────────────────┐                     │
│         │    TypeORM Repository Layer     │                     │
│         └────────────────┬────────────────┘                     │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                            │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ courses  │  │ sections │  │ lessons  │  │ enrollments   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘   │
│       │             │              │                             │
│       └─────────────┴──────────────┘                            │
│                     │                                             │
│         ┌───────────────────────┐                               │
│         │  lesson_progress       │                               │
│         └───────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘

                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Redis (Message Queue)                         │
│  - Microservice Communication                                    │
│  - Event Publishing                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         COURSE                                  │
│  - id (PK)                                                      │
│  - title                                                        │
│  - description                                                  │
│  - category                                                     │
│  - level                                                        │
│  - price                                                        │
│  - status                                                       │
│  - instructorId (UUID, NO FK)                                  │
│  - instructorName (denormalized)                               │
│  - enrollmentCount (cached)                                    │
│  - rating                                                       │
└─────┬──────────────────────────────────────────────┬───────────┘
      │ 1                                             │ 1
      │                                               │
      │ N                                             │ N
┌─────▼───────────────┐                    ┌─────────▼──────────┐
│     SECTION         │                    │    ENROLLMENT      │
│  - id (PK)          │                    │  - id (PK)         │
│  - title            │                    │  - userId (UUID)   │
│  - orderIndex       │                    │  - courseId (FK)   │
│  - courseId (FK)    │                    │  - status          │
└─────┬───────────────┘                    │  - progress (%)    │
      │ 1                                   │  - lastAccessedAt  │
      │                                     └────────────────────┘
      │ N                                     UNIQUE(userId, courseId)
┌─────▼───────────────┐
│      LESSON         │
│  - id (PK)          │
│  - title            │──────────────┐
│  - type             │              │ 1
│  - content          │              │
│  - duration         │              │ N
│  - orderIndex       │      ┌───────▼────────────────┐
│  - isFree           │      │  LESSON_PROGRESS       │
│  - sectionId (FK)   │      │  - id (PK)             │
└─────────────────────┘      │  - userId (UUID)       │
                              │  - lessonId (FK)       │
                              │  - completed           │
                              │  - watchedDuration     │
                              │  - completedAt         │
                              └────────────────────────┘
                                UNIQUE(userId, lessonId)
```

## Request Flow Diagram

### 1. Public Endpoint (GET /courses)

```
Client
  │
  ├─► API Gateway
  │      │
  │      ├─► CourseController.getCourses()
  │      │      │
  │      │      ├─► CourseService.findAll()
  │      │      │      │
  │      │      │      ├─► TypeORM QueryBuilder
  │      │      │      │      │
  │      │      │      │      └─► PostgreSQL
  │      │      │      │             │
  │      │      │      │◄────────────┘
  │      │      │      │
  │      │      │◄─────┘
  │      │      │
  │      │◄─────┘
  │      │
  │◄─────┘
  │
  └─► Response: { courses, total, page, limit }
```

### 2. Authenticated Endpoint (POST /courses/:id/enroll)

```
Client (with JWT)
  │
  ├─► API Gateway
  │      │ (validates JWT)
  │      ├─► JwtAuthGuard
  │      │      │ (checks req.user exists)
  │      │      ├─► CourseController.enrollInCourse()
  │      │      │      │ @CurrentUser() extracts userId
  │      │      │      │
  │      │      │      ├─► EnrollmentService.enrollUser()
  │      │      │      │      │
  │      │      │      │      ├─► CourseService.exists()
  │      │      │      │      │      │
  │      │      │      │      │      └─► Check if course exists
  │      │      │      │      │             │
  │      │      │      │      │◄────────────┘
  │      │      │      │      │
  │      │      │      │      ├─► Check existing enrollment
  │      │      │      │      │      │
  │      │      │      │      │      └─► Find by userId + courseId
  │      │      │      │      │             │
  │      │      │      │      │◄────────────┘
  │      │      │      │      │
  │      │      │      │      ├─► Create enrollment record
  │      │      │      │      │      │
  │      │      │      │      │      └─► INSERT INTO enrollments
  │      │      │      │      │             │
  │      │      │      │      │◄────────────┘
  │      │      │      │      │
  │      │      │      │      └─► Increment enrollmentCount
  │      │      │      │             │
  │      │      │      │             └─► UPDATE courses SET ...
  │      │      │      │                    │
  │      │      │      │◄───────────────────┘
  │      │      │      │
  │      │      │◄─────┘
  │      │      │
  │      │◄─────┘
  │      │
  │◄─────┘
  │
  └─► Response: { success, message, enrollmentId }
```

## Data Flow - Progress Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│                    User watches lesson                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│         Frontend tracks watch progress                           │
│         Periodically sends progress updates                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│    POST /courses/:courseId/lessons/:lessonId/progress           │
│    Body: { watchedDuration: 120, completed: false }             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│         ProgressService.updateLessonProgress()                   │
│  - Upsert lesson_progress record                                │
│  - Update watchedDuration                                        │
│  - Set completed flag if threshold reached                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│           Calculate course progress                              │
│  - Count total lessons in course                                 │
│  - Count completed lessons for user                              │
│  - Calculate percentage                                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│         Update enrollment.progress                               │
│         Set enrollment.lastAccessedAt                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│      If progress = 100%, mark enrollment as completed            │
│      Set enrollment.completedAt                                  │
│      Trigger certificate generation event                        │
└─────────────────────────────────────────────────────────────────┘
```

## Database Index Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                      Index Optimization                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  COURSES                                                          │
│  ├─ PRIMARY KEY (id)                                             │
│  ├─ INDEX (status, createdAt)  ← List published courses          │
│  ├─ INDEX (category)            ← Filter by category             │
│  ├─ INDEX (level)               ← Filter by level                │
│  ├─ INDEX (instructorId)        ← Instructor's courses           │
│  └─ INDEX (title)               ← Search by title                │
│                                                                   │
│  SECTIONS                                                         │
│  ├─ PRIMARY KEY (id)                                             │
│  └─ INDEX (courseId, orderIndex) ← Ordered retrieval             │
│                                                                   │
│  LESSONS                                                          │
│  ├─ PRIMARY KEY (id)                                             │
│  └─ INDEX (sectionId, orderIndex) ← Ordered retrieval            │
│                                                                   │
│  ENROLLMENTS                                                      │
│  ├─ PRIMARY KEY (id)                                             │
│  ├─ UNIQUE (userId, courseId)   ← Prevent duplicates             │
│  ├─ INDEX (userId, status)      ← User's active courses          │
│  └─ INDEX (courseId)            ← Course enrollment count        │
│                                                                   │
│  LESSON_PROGRESS                                                  │
│  ├─ PRIMARY KEY (id)                                             │
│  ├─ UNIQUE (userId, lessonId)   ← One progress per user/lesson   │
│  ├─ INDEX (userId, lessonId)    ← Fast lookup                    │
│  └─ INDEX (completed)           ← Count completed lessons        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Microservice Communication Pattern

```
┌─────────────────┐         ┌─────────────────┐
│                 │  Redis  │                 │
│  API Gateway    │◄───────►│ Course Service  │
│                 │  TCP    │                 │
└────────┬────────┘         └────────┬────────┘
         │                            │
         │                            │
         │  HTTP/REST                 │  TypeORM
         │                            │
         ▼                            ▼
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Frontend App   │         │   PostgreSQL    │
│                 │         │                 │
└─────────────────┘         └─────────────────┘

Communication Patterns:
- Frontend ←→ API Gateway: HTTP/REST
- API Gateway ←→ Course Service: Redis (MessagePattern)
- Course Service ←→ PostgreSQL: TypeORM
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                         │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                      Ingress                            │ │
│  │              (Load Balancer + SSL)                      │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │              API Gateway Service                        │ │
│  │              (replicas: 3)                              │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │            Course Microservice                          │ │
│  │            (replicas: 2)                                │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  Pod 1                  │  Pod 2                  │ │ │
│  │  │  - course-service       │  - course-service       │ │ │
│  │  │  - health checks        │  - health checks        │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────┴───────────────────────────────────┐ │
│  │                                                         │ │
│  │  ┌─────────────────────┐    ┌─────────────────────┐  │ │
│  │  │  PostgreSQL         │    │  Redis              │  │ │
│  │  │  (StatefulSet)      │    │  (StatefulSet)      │  │ │
│  │  │  - PVC mounted      │    │  - PVC mounted      │  │ │
│  │  └─────────────────────┘    └─────────────────────┘  │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

These diagrams provide a comprehensive visual overview of the Course Microservice architecture, data flow, and deployment strategy.
