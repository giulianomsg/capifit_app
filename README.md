# 🏋️‍♀️ CapiFit Platform

CapiFit is a full-stack platform that empowers personal trainers to manage clients, training programs, nutrition plans and communication in a single place. The current iteration focuses on delivering a production-grade authentication and authorization flow with a hardened backend, React frontend, and modern deployment tooling.

## ✨ Highlights

- **Real authentication** with JWT access/refresh tokens, secure cookie rotation and role-based access control (admin/trainer/client).
- **PostgreSQL + Prisma** data layer with migrations, seeds, hashed refresh tokens and audit trail primitives.
- **React 18 + Vite** frontend, React Query powered session management, guarded routes and axios interceptors with automatic refresh.
- **Production-ready tooling**: Docker Compose stack (PostgreSQL, Redis, API, Web), PM2 ecosystem file, structured logging, rate limiting, Helmet and CORS hardening.
- **Testing foundation**: Vitest + Supertest API tests validating authentication flows and error handling.

## 🧱 Project Structure

```
.
├── apps/
│   ├── api/        # Express 5 + TypeScript + Prisma backend
│   └── web/        # React (Vite) frontend
├── docker-compose.yml
├── ecosystem.config.cjs
└── README.md
```

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Node.js 20, Express 5, TypeScript, Prisma ORM |
| Database   | PostgreSQL (Redis reserved for future queues) |
| Frontend   | React 18, Vite, React Query, React Hook Form, Zod |
| Auth       | JWT (access + refresh), bcrypt password hashing |
| Deployment | Docker Compose, PM2, Nginx, npm workspaces |
| Testing    | Vitest, Supertest |

## ✅ Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (optional, for containerized setup)
- PostgreSQL 14+ (if not using Docker)

## 🚀 Quick Start (local development)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Copy environment files**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Generate Prisma client & run migrations**
   ```bash
   npm run generate --workspace apps/api
   npm run migrate:dev --workspace apps/api
   npm run seed --workspace apps/api
   ```

4. **Start both applications in watch mode**
   ```bash
   npm run dev
   ```
   - API available on `http://localhost:3001` (health check at `/health`).
   - Web available on `http://localhost:5173`.

5. **Individual services**
   ```bash
   npm run dev:api   # API only
   npm run dev:web   # Web only
   ```

## 🧪 Testing & Linting

```bash
npm run test:api      # Vitest + Supertest authentication coverage
npm run test:web      # Vitest placeholder (extend with UI tests)
npm run lint          # Lint API + Web
npm run lint:api
npm run lint:web
```

> **Note:** API tests mock the service layer to exercise Express validation and error handling without a live database. Extend with integration tests once infrastructure (Redis, email, etc.) is introduced.

## 🏗️ Build & Production Commands

```bash
npm run build:api     # tsup build → apps/api/dist
npm run build:web     # Vite production build → apps/web/build
npm run build         # Build both workspaces
```

### PM2 deployment

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 status
```

`ecosystem.config.cjs` manages two apps:
- `capifit-api` → `node dist/server.js` (Express API)
- `capifit-web` → `vite preview` serving the built SPA (port 4173)

### Docker Compose deployment

```bash
docker-compose up --build
```

Services:
- `postgres`: persistent PostgreSQL 16 database
- `redis`: Redis 7 (reserved for job queues / rate limiting)
- `api`: Express API container (`apps/api/Dockerfile`)
- `web`: Nginx static host + proxy for `/api` (`apps/web/Dockerfile`)

Frontend reachable at `http://localhost:8080`, API proxied under `/api`.

## 🔐 Security & Observability

- Helmet, CORS (frontend origin whitelist), rate limiting (RateLimiterMemory).
- JWT access tokens in Authorization header, refresh tokens stored as HTTP-only cookies with server-side hashing and rotation.
- Prisma models for `users`, `roles`, `refresh_tokens`, `audit_logs` ready for expansion.
- Structured logging via Pino, request correlation through `pino-http`.
- Centralized error handler that differentiates developer vs user messages and returns 422 validation payloads.

## 🗄️ Database & Seeding

| Prisma Model | Purpose |
|--------------|---------|
| `User`       | Core user entity with status, soft-delete column and relations |
| `Role` / `UserRole` | RBAC assignments (admin, trainer, client) |
| `RefreshToken` | Hashed refresh tokens with revocation / expiry tracking |
| `AuditLog` | Future auditing trail for sensitive actions |

Initial migration `202501010001_init` builds the schema and triggers. Seeding (`npm run seed --workspace apps/api`) creates:
- Roles: admin, trainer, client
- Bootstrap admin user `admin@capifit.com` (password `ChangeMe123!` — change in production via `ADMIN_DEFAULT_PASSWORD` env)

## 🌐 Environment Variables

### API (`apps/api/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 3001) |
| `API_BASE_URL` | Public base URL of the API |
| `FRONTEND_URL` | Allowed CORS origin |
| `DATABASE_URL` | PostgreSQL connection string |
| `SHADOW_DATABASE_URL` | Shadow DB for Prisma migrations |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Strong secrets (≥32 chars) |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Token lifetimes (seconds) |
| `PASSWORD_SALT_ROUNDS` | Bcrypt salt cost (12 in production) |
| `REDIS_URL` | Redis connection (reserved for queues/rate limiters) |
| `SMTP_*` | Email provider configuration (future notifications) |
| `FILE_STORAGE_DRIVER` | `local` or `s3` (uploads roadmap) |
| `LOG_LEVEL` | Pino log level |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Rate limiting window + quota |

### Web (`apps/web/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base API URL (e.g. `http://localhost:3001/api`) |
| `VITE_WS_URL` | Realtime/WebSocket base URL (future use) |
| `VITE_DEV_SERVER_PORT` | Vite dev port (defaults 5173) |
| `VITE_PREVIEW_PORT` | `vite preview` port (defaults 4173) |
| `VITE_GOOGLE_ANALYTICS_ID` | Analytics integration (optional) |
| `VITE_SENTRY_DSN` | Error tracking DSN (optional) |

## 📡 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Creates user (admin/trainer/client) with immediate session |
| `POST` | `/api/v1/auth/login` | Authenticates and issues tokens |
| `POST` | `/api/v1/auth/refresh` | Rotates refresh token (HTTP-only cookie) |
| `POST` | `/api/v1/auth/logout` | Revokes refresh token & clears cookie |
| `GET`  | `/api/v1/auth/me` | Returns authenticated profile |
| `GET`  | `/api/v1/profile` | Authenticated profile shortcut |
| `GET`  | `/health` | Liveness probe |

All non-public endpoints require `Authorization: Bearer <access_token>` and will transparently refresh via the frontend axios interceptor when possible.

## 🧩 Frontend Notes

- `AuthContext` manages session state, persists minimal data (token + user) and listens to a `capifit:session-expired` custom event triggered by the axios interceptor when refresh fails.
- `AuthGuard` wraps all private routes, rendering a loader while validating the session and redirecting anonymous users to `/login`.
- Login & register forms share server-side validation schemas using Zod to provide consistent error messaging.
- Header and sidebar consume `useAuth()` context to show user info and handle logout. Notification/assessment/chat modules now rely on context (no localStorage fallbacks).

## 🚧 Roadmap

- Persist training plans, nutrition, assessments and messaging using the new Prisma foundation.
- Integrate Redis-backed queues for transactional emails and push notifications.
- Expand automated test coverage (service layer, React components, end-to-end scenarios).
- Introduce file storage abstraction (local/S3) for progress photos and attachments.
- Harden audit logging & observability (Prometheus/Grafana exporters).

## 🆘 Troubleshooting

| Issue | Resolution |
|-------|-----------|
| `npm install` fails due to registry policy | Ensure network access to `https://registry.npmjs.org/` or configure an allowed mirror. |
| Prisma migration errors | Verify `DATABASE_URL`, ensure Postgres is reachable, rerun `npm run migrate:dev`. |
| Cookies not persisting during local dev | Confirm frontend uses `http://localhost` (not 127.0.0.1) so `SameSite=Strict` cookies are considered same-site. |
| Docker build failures | Clean previous images (`docker compose down -v`), ensure buildx supports `node:20-alpine`. |

## 🧾 License

This project is proprietary to the original stakeholders. All rights reserved.
