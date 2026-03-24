# Nexus Flow Backend

NestJS backend với Prisma ORM và PostgreSQL.

## Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- npm

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Configuration

| File | Mục đích |
|------|----------|
| `.env.local` | Development (local) |
| `.env.production` | Production |

## Scripts

### Development

| Script | Mô tả |
|--------|-------|
| `npm run start:dev` | Chạy app với hot-reload (sử dụng `.env.local`) |
| `npm run start:debug` | Chạy với debug mode |
| `npm run test` | Chạy unit tests |
| `npm run test:watch` | Chạy tests với watch mode |
| `npm run test:e2e` | Chạy end-to-end tests |

### Production

| Script | Mô tả |
|--------|-------|
| `npm run build` | Build app |
| `npm run start:prod` | Chạy production build (sử dụng `.env.prod`) |

### Database (Prisma)

| Script | Mô tả |
|--------|-------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate:dev` | Chạy migrations (development) |
| `npm run db:migrate:prod` | Chạy migrations (production) |
| `npm run db:push` | Push schema changes (không tạo migration) |
| `npm run db:studio` | Mở Prisma Studio GUI |

### Docker

| Script | Mô tả |
|--------|-------|
| `npm run docker:up` | Start PostgreSQL container |
| `npm run docker:down` | Stop containers |

## Quick Start Workflow

### Development

```bash
# 1. Start PostgreSQL database
npm run docker:up

# 2. Generate Prisma Client
npm run db:generate

# 3. Run database migrations
npm run db:migrate:dev

# 4. Start development server
npm run start:dev
```

App sẽ chạy tại `http://localhost:3000`

### Production

```bash
# 1. Build app
npm run build

# 2. Run migrations
npm run db:migrate:prod

# 3. Start production server
npm run start:prod
```

## Project Structure

```
src/
├── infrastructure/       # Cross-cutting concerns
│   ├── cache/           # Caching (Redis/Memory)
│   ├── common/          # Shared utilities
│   └── config/          # Configuration
├── modules/             # Feature modules
│   ├── activity-logs/
│   ├── comments/
│   ├── dashboard/
│   ├── projects/
│   └── tasks/
└── app.module.ts        # Root module
```
