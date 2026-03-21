# 📋 CONTEXT PROMPT CHO NEXUSFLOW PROJECT (Updated: Week 10)

## 🎯 Tổng quan
- **Project**: NexusFlow - Nền tảng Quản trị Dự án & Vận hành Doanh nghiệp (SaaS)
- **Tech Stack**: NestJS, PostgreSQL (Prisma), TypeScript, Redis
- **Architecture**: Clean Architecture (DDD) với 4 layers:
  - Domain: Entities, Repository Interfaces
  - Application: Use Cases
  - Infrastructure: Prisma Repositories, Mappers, Cache
  - Presentation: Controllers, DTOs

## 📁 Project Structure
```
src/
├── modules/
│   ├── users/           # Auth (register, login)
│   ├── workspaces/      # Workspace management
│   ├── members/         # Workspace membership
│   ├── projects/        # Project CRUD + filtering
│   ├── tasks/           # Task management (most complete)
│   ├── comments/        # Task comments
│   ├── labels/          # Labels + task assignment
│   ├── activity-logs/   # Audit logging (service ready)
│   └── dashboard/       # Statistics với caching
│
├── infrastructure/
│   ├── authorization/   # Guards, Decorators, Services cho RBAC
│   ├── cache/           # Redis + in-memory fallback
│   ├── common/          # Filters, Interceptors, Middleware, Pagination
│   ├── config/          # Environment config
│   ├── email/           # Email service (nodemailer/SendGrid)
│   ├── queue/           # BullMQ background jobs
│   ├── realtime/        # Socket.io WebSocket gateway
│   └── prisma/          # Database service
│
└── main.ts
```

## ✅ Đã hoàn thành (Tuần 1-8)

### Modules (9 modules):
| Module | Features | Status |
|--------|----------|--------|
| Users | Register, Login (JWT + bcrypt) | ✓ |
| Workspaces | CRUD + Transaction (create + owner member) | ✓ |
| Members | Add, Remove, UpdateRole, List with User info | ✓ |
| Projects | CRUD + Pagination + Filtering (search, status, owner) | ✓ |
| Tasks | CRUD, Assign, Subtasks, 8+ filters, Sorting | ✓ |
| Comments | CRUD với author info | ✓ |
| Labels | CRUD, AddToTask, RemoveFromTask | ✓ |
| Activity Logs | Service + ListActivities + Auto-log all CRUD operations | ✓ |
| Dashboard | WorkspaceStatistics với Redis cache | ✓ |

### Infrastructure:
- **Authorization**: WorkspaceMemberGuard, RolesGuard, ResourceOwnerGuard
- **Caching**: Redis (ioredis) + MemoryCache fallback, TTL 300s
- **Pagination**: Offset + Cursor support, max 100 items
- **Global Pipes**: ValidationPipe, TransformInterceptor, HttpExceptionFilter
- **Middleware**: RequestTracker (UUID), Context (AsyncLocalStorage), Logger
- **Soft Delete**: `prisma.softDelete(model, id)` helper
- **Config**: Multi-env support (.env.local, .env)

### Entity Pattern (DB generates ID/timestamps):
```typescript
export class Entity {
  private constructor(private readonly props: Props) {}

  public static reconstitute(props: Props): Entity {
    return new Entity(props);
  }
  // Business methods...
}

// Repository tạo và trả về entity với DB-generated ID
export interface CreateData { name: string; ... }
export abstract class IRepository {
  abstract create(data: CreateData): Promise<Entity>;
  abstract save(entity: Entity): Promise<void>;
}
```

### Permission Matrix

| Action | OWNER | ADMIN | MEMBER |
|--------|:-----:|:-----:|:------:|
| View workspace/members | ✓ | ✓ | ✓ |
| Update workspace | ✓ | ✓ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ |
| Add/Remove member | ✓ | ✓ | ✗ |
| Update member role | ✓ | ✓* | ✗ |
| Create project | ✓ | ✓ | ✓ |
| Update/Delete ANY project | ✓ | ✓ | ✗ |
| Update/Delete OWN project | ✓ | ✓ | ✓ |
| Create task | ✓ | ✓ | ✓ |
| Update/Delete ANY task | ✓ | ✓ | ✗ |
| Update/Delete OWN task | ✓ | ✓ | ✓ |
| Create/Update/Delete label | ✓ | ✓ | ✗ |
| Attach/Detach label to task | ✓ | ✓ | ✓ |
| Create comment | ✓ | ✓ | ✓ |
| Update/Delete OWN comment | ✓ | ✓ | ✓ |
| View dashboard | ✓ | ✓ | ✓ |

*ADMIN cannot change OWNER role

### Usage in Controllers
```typescript
// Chỉ cho phép members của workspace
@Controller('workspaces/:workspaceId/projects')
@UseGuards(WorkspaceMemberGuard)
export class ProjectsController {

  // Tất cả members đều tạo được project
  @Post()
  async create() { ... }

  // OWNER/ADMIN hoặc owner của project mới được sửa
  @Put(':id')
  @UseGuards(ResourceOwnerGuard)
  @CheckOwnership({ resourceType: ResourceType.PROJECT })
  async update() { ... }
}

// Chỉ cho phép OWNER/ADMIN
@Controller('workspaces/:workspaceId/members')
@UseGuards(WorkspaceMemberGuard, RolesGuard)
export class MemberController {

  @Post()
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  async addMember() { ... }
}
```

### Guard Flow
```
Request → JwtAuthGuard → WorkspaceMemberGuard → RolesGuard → ResourceOwnerGuard → Controller
              │                   │                  │                │
              │                   │                  │                └── Check ownership
              │                   │                  └── Check role requirements
              │                   └── Check membership, attach WorkspaceContext
              └── Verify JWT, attach user to request
```

## 📊 Database Schema (Prisma)

**16 Models:**
- User, RefreshToken, PasswordResetToken
- Workspace, Member, Invitation
- Project, Task, Comment
- Label, TaskLabel
- ActivityLog, Notification
- FileUpload

**Features:**
- Soft deletes (deletedAt)
- Timestamps (createdAt, updatedAt)
- CASCADE foreign keys
- Proper indexes

## 🔗 API Endpoints

```
# Auth
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/logout-all
POST   /auth/forgot-password
POST   /auth/reset-password

# Workspaces
GET    /workspaces
POST   /workspaces
GET    /workspaces/:id
PUT    /workspaces/:id
DELETE /workspaces/:id

# Members
GET    /workspaces/:workspaceId/members
POST   /workspaces/:workspaceId/members
PATCH  /workspaces/:workspaceId/members/:targetId/role
DELETE /workspaces/:workspaceId/members/:targetId

# Projects (with pagination)
GET    /workspaces/:workspaceId/projects?page=1&pageSize=10&search=&status=
POST   /workspaces/:workspaceId/projects
GET    /workspaces/:workspaceId/projects/:id
PUT    /workspaces/:workspaceId/projects/:id
DELETE /workspaces/:workspaceId/projects/:id

# Tasks (with filtering & sorting)
GET    /projects/:projectId/tasks?status=&priority=&assigneeId=&search=&sortBy=&sortOrder=
POST   /projects/:projectId/tasks
GET    /projects/:projectId/tasks/:id
PUT    /projects/:projectId/tasks/:id
PATCH  /projects/:projectId/tasks/:id/assign
DELETE /projects/:projectId/tasks/:id
GET    /projects/:projectId/tasks/:id/subtasks

# Comments
GET    /tasks/:taskId/comments
POST   /tasks/:taskId/comments
PUT    /tasks/:taskId/comments/:id
DELETE /tasks/:taskId/comments/:id

# Labels
GET    /workspaces/:workspaceId/labels
POST   /workspaces/:workspaceId/labels
PUT    /workspaces/:workspaceId/labels/:id
DELETE /workspaces/:workspaceId/labels/:id

# Task Labels
POST   /tasks/:taskId/labels/:labelId
DELETE /tasks/:taskId/labels/:labelId
GET    /tasks/:taskId/labels

# Activity Logs
GET    /workspaces/:workspaceId/activities

# Dashboard
GET    /workspaces/:workspaceId/dashboard

# File Upload (pre-signed URL flow)
POST   /files/register              # Step 1: Get upload URL and file ID
POST   /files/upload                # Local dev only: upload endpoint
GET    /files/download              # Local dev only: download endpoint
GET    /files/:fileId/download      # Get pre-signed download URL
DELETE /files/:fileId               # Delete a file

# Task Attachments
POST   /tasks/:taskId/attachments   # Step 2: Attach uploaded file to task
GET    /tasks/:taskId/attachments   # List task attachments
```

## 🔌 WebSocket Events (Socket.io)

### Connection
```typescript
// Client connects with JWT token
const socket = io('http://localhost:3000', {
  auth: { token: 'jwt_access_token' }
});

// Auto-joins user's personal room on connect
```

### Client Events (emit từ client)
| Event | Payload | Description |
|-------|---------|-------------|
| `workspace:join` | `{ workspaceId }` | Join workspace room (validates membership) |
| `workspace:leave` | `{ workspaceId }` | Leave workspace room |
| `project:join` | `{ projectId }` | Join project room (validates membership) |
| `project:leave` | `{ projectId }` | Leave project room |
| `task:join` | `{ taskId, projectId }` | Join task room (validates membership) |
| `task:leave` | `{ taskId }` | Leave task room |
| `typing:start` | `{ taskId }` | Broadcast typing indicator |
| `typing:stop` | `{ taskId }` | Stop typing indicator |

### Server Events (listen từ client)

**Task Events** (emits to project room):
| Event | Payload | Trigger |
|-------|---------|---------|
| `task:created` | `{ task: {...} }` | Task created |
| `task:updated` | `{ task: {...}, changes, updatedBy }` | Task updated |
| `task:deleted` | `{ taskId, deletedBy }` | Task deleted |
| `task:assigned` | `{ taskId, assigneeId, previousAssigneeId, assignedBy }` | Task assigned |

**Comment Events** (emits to task room):
| Event | Payload | Trigger |
|-------|---------|---------|
| `comment:created` | `{ comment: {...} }` | Comment created |
| `comment:updated` | `{ comment: {...}, updatedBy }` | Comment updated |
| `comment:deleted` | `{ commentId, deletedBy }` | Comment deleted |

**Project Events** (emits to workspace room):
| Event | Payload | Trigger |
|-------|---------|---------|
| `project:created` | `{ project: {...} }` | Project created |
| `project:updated` | `{ project: {...}, changes, updatedBy }` | Project updated |
| `project:deleted` | `{ projectId, deletedBy }` | Project deleted |

**Member Events** (emits to workspace room + affected user):
| Event | Payload | Trigger |
|-------|---------|---------|
| `member:added` | `{ member: {...}, addedBy }` | Member added |
| `member:removed` | `{ memberId, userId, removedBy }` | Member removed |
| `member:role_changed` | `{ memberId, userId, oldRole, newRole, changedBy }` | Role changed |

**Invitation Events**:
| Event | Payload | Emits To | Trigger |
|-------|---------|----------|---------|
| `invitation:received` | `{ invitation: {...} }` | User room | Invitation created |
| `invitation:accepted` | `{ invitation, member }` | Workspace room | Invitation accepted |
| `invitation:rejected` | `{ invitation }` | Workspace room | Invitation rejected |

**Typing Events** (emits to task room):
| Event | Payload |
|-------|---------|
| `user:typing` | `{ taskId, userId }` |
| `user:stop_typing` | `{ taskId, userId }` |

### Room Structure
```
user:{userId}           - Personal notifications
workspace:{workspaceId} - Workspace-wide events (projects, members)
project:{projectId}     - Project events (tasks)
task:{taskId}           - Task events (comments, typing)
```

### Example Client Usage
```typescript
// Connect
const socket = io('http://localhost:3000', {
  auth: { token: accessToken }
});

// Join workspace
socket.emit('workspace:join', { workspaceId: '...' }, (response) => {
  console.log('Joined:', response.room);
});

// Listen for events
socket.on('task:created', (data) => {
  console.log('New task:', data.task);
});

socket.on('member:added', (data) => {
  console.log('New member:', data.member);
});

// Typing indicator
socket.emit('typing:start', { taskId: '...' });
```

## 📊 SO SÁNH VỚI SAAS CHUẨN

| Feature | NexusFlow | SaaS Chuẩn | Priority |
|---------|-----------|------------|----------|
| **AUTHENTICATION** ||||
| JWT Login | ✓ | ✓ | - |
| Refresh Token | ✓ | ✓ | - |
| Password Reset | ✓ | ✓ | - |
| Email Verification | ❌ | ✓ | 🟡 Medium |
| OAuth/SSO | ❌ | ✓ | 🟢 Low |
| 2FA/MFA | ❌ | ✓ | 🟢 Low |
| **AUTHORIZATION** ||||
| Auth Guard | ✓ | ✓ | - |
| Role-based (RBAC) | ✓ | ✓ | - |
| Resource Access Control | ✓ | ✓ | - |
| **CORE FEATURES** ||||
| Multi-tenancy | ✓ Workspace | ✓ | - |
| Project Management | ✓ | ✓ | - |
| Task Management | ✓ | ✓ | - |
| Comments | ✓ | ✓ | - |
| Labels/Tags | ✓ | ✓ | - |
| Subtasks | ✓ | ✓ | - |
| File Attachments | ❌ | ✓ | 🟡 Medium |
| **DATA & QUERY** ||||
| Pagination | ✓ | ✓ | - |
| Filtering | ✓ | ✓ | - |
| Sorting | ✓ | ✓ | - |
| Full-text Search | ⚠️ Basic LIKE | ✓ | 🟢 Low |
| **CACHING & PERFORMANCE** ||||
| Redis Cache | ✓ | ✓ | - |
| Cache Invalidation | ✓ | ✓ | - |
| Rate Limiting | ✓ | ✓ | - |
| **AUDIT & LOGGING** ||||
| Activity Logging | ✓ | ✓ | - |
| Request Logging | ✓ | ✓ | - |
| Error Tracking | ⚠️ Basic | ✓ Sentry | 🟢 Low |
| **NOTIFICATIONS** ||||
| Email Notifications | ✓ | ✓ | - |
| In-app Notifications | ❌ | ✓ | 🟡 Medium |
| Real-time (WebSocket) | ✓ | ✓ | - |
| Webhooks | ❌ | ✓ | 🟢 Low |
| **INVITATION & TEAM** ||||
| Invite by Email | ✓ | ✓ | - |
| Accept/Reject Invite | ✓ | ✓ | - |
| **BILLING** ||||
| Subscription Plans | ❌ | ✓ | 🟢 Later |
| Usage Limits | ❌ | ✓ | 🟢 Later |
| Payment Integration | ❌ | ✓ Stripe | 🟢 Later |
| **DEVOPS & QUALITY** ||||
| API Documentation | ❌ | ✓ Swagger | 🟡 Medium |
| Unit Tests | ❌ | ✓ | 🟡 Medium |
| E2E Tests | ❌ | ✓ | 🟡 Medium |
| Docker | ⚠️ Basic | ✓ Full stack | 🟡 Medium |
| CI/CD | ❌ | ✓ | 🟡 Medium |

### Legend:
- ✓ = Implemented
- ⚠️ = Partial/Model only
- ❌ = Not implemented
- 🔴 = Critical (blocking production)
- 🟡 = Medium (should have)
- 🟢 = Low (nice to have)

## 🔄 ROADMAP CẬP NHẬT

### Tuần 7: Authentication & Security (CRITICAL) ✅
```
[x] JwtAuthGuard + apply globally
[x] @CurrentUser() decorator
[x] Refresh Token mechanism (issue, refresh, revoke)
[x] Argon2 password hashing (replace bcrypt)
[x] Rate limiting (@nestjs/throttler) - 60 requests/minute default
```

### Tuần 8: Authorization (CRITICAL) ✅
```
[x] WorkspaceMemberGuard (check membership)
[x] @Roles() decorator + RolesGuard
[x] ResourceOwnerGuard (ownership validation)
[x] @CheckOwnership() decorator
[x] ResourceResolverService (resolve workspaceId from projectId/taskId)
[x] Project/Task/Comment access control
```

### Tuần 9: Activity & Notifications
```
[x] Integrate ActivityLogService vào tất cả use-cases
[x] Invitation accept/reject endpoints
[x] Email service (nodemailer/SendGrid)
[x] Basic email templates (invite, password reset)
```

### Tuần 10: Real-time & Files ✅
```
[x] Socket.io gateway (JWT auth, room-based, membership validation)
[x] WebSocket events integrated to use-cases
[x] In-app notifications (DB model + API)
[x] File upload (pre-signed URL + attach flow, S3/local)
[x] BullMQ background jobs
[x] File cleanup background job
```

### Tuần 11: Testing & Documentation
```
[ ] Swagger/OpenAPI decorators
[ ] Unit tests cho use-cases
[ ] E2E tests cho endpoints
[ ] Postman collection
```

### Tuần 12: DevOps & Production
```
[ ] Docker compose full stack
[ ] CI/CD pipeline (GitHub Actions)
[ ] Environment configs (staging, prod)
[ ] Error tracking (Sentry)
```

## 📝 Conventions

- Entity: `entity-name.entity.ts`
- Repository interface: `entity.repository.ts`
- Repository impl: `prisma-entity.repository.ts`
- Use case: `action-entity.use-case.ts`
- DTOs: `entity.request.dto.ts`, `entity.response.dto.ts`
- Soft delete: `prisma.softDelete(model, id)`
- Response DTO: static `fromEntity()` và `fromEntities()`
- Cache key pattern: `module:entity:id` hoặc `module:list:params`

## 🧪 Test Accounts (Local Development)

**Password Requirements:** Min 8 ký tự, phải có: 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt

| Email | Password | User ID | Notes |
|-------|----------|---------|-------|
| `test@example.com` | `Test@123456` | `c7b7649c-7390-4494-8fe7-c21df469fc09` | Test user |

### Test Data Created
- **Workspace:** `Test Workspace` (ID: `48a30c8b-53ca-4786-9d60-942bd1c2e241`)
- **Project:** `Test Project` (ID: `c6e39e84-a1b0-4a13-b268-a271295ee378`)
- **Task:** `Test Task` (ID: `98afcc31-ce1e-4573-a477-2ea2ce659515`)

### Quick Test Commands
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'

# Use token in requests
TOKEN="<access_token_from_login>"
curl -X GET http://localhost:3000/workspaces \
  -H "Authorization: Bearer $TOKEN"
```

## 🚀 NEXT STEPS (Priority Order)

### 1. In-app Notifications (Medium Priority)
```
[x] Notification entity & DB model (Prisma schema)
[x] NotificationRepository interface & implementation
[x] CreateNotificationUseCase
[x] MarkAsReadUseCase, MarkAllAsReadUseCase
[x] ListNotificationsUseCase (với pagination)
[x] NotificationsController endpoints
[x] Integrate với WebSocket (emit khi có notification mới)
[x] Notification types: task_assigned, comment_added, member_added, etc.
```

### 2. File Upload (Medium Priority) ✅
```
[x] FileUpload entity & DB model (Prisma schema)
[x] IStorageService interface (abstract)
[x] LocalStorageService implementation (pre-signed URL simulation)
[x] S3StorageService implementation (optional - requires @aws-sdk)
[x] RegisterUploadUseCase (get pre-signed URL)
[x] ConfirmUploadUseCase (validate file uploaded)
[x] AttachFileUseCase (attach to resource)
[x] DeleteFileUseCase
[x] FilesController endpoints
[x] Task attachments (POST/GET /tasks/:taskId/attachments)
[x] Background job for cleanup expired/orphaned files
```

### 3. Redis Adapter for WebSocket (Low - for scaling)
```
[x] @socket.io/redis-adapter
[x] Configure Redis pub/sub for horizontal scaling
[ ] Test với multiple server instances
```

### 4. Testing & Documentation
```
[x] Swagger/OpenAPI decorators cho tất cả endpoints
[ ] Unit tests cho critical use-cases
[ ] E2E tests cho auth & CRUD flows
[x] Postman collection export
```

### 5. DevOps
```
[ ] Docker compose với PostgreSQL, Redis, App
[ ] GitHub Actions CI/CD
[ ] Environment configs (staging, prod)
[ ] Error tracking (Sentry integration)
```