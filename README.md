# 🏋️‍♀️ CapiFit Platform

CapiFit is a full-stack platform that empowers personal trainers to manage clients, training programs, nutrition plans and communication in a single place. The current iteration focuses on delivering a production-grade authentication and authorization flow with a hardened backend, React frontend, and modern deployment tooling.

## ✨ Highlights

- **Real authentication** with JWT access/refresh tokens, secure cookie rotation and role-based access control (admin/trainer/client).
- **PostgreSQL + Prisma** data layer with migrations, seeds, hashed refresh tokens and audit trail primitives.
- **React 18 + Vite** frontend, React Query powered session management, guarded routes and axios interceptors with automatic refresh.
- **Production-ready tooling**: Docker Compose stack (PostgreSQL, Redis, API, Web), PM2 ecosystem file, structured logging, rate limiting, Helmet and CORS hardening.
- **Express 5 ready**: Erro assíncrono tratado nativamente (sem `express-async-errors`), middleware 404/500 padronizado e overrides globais para evitar regressões.
- **User management suite**: Admin REST endpoints and React screens for inviting, editing and deactivating accounts with role-aware RBAC and secure avatar uploads.
- **Testing foundation**: Vitest + Supertest API tests validating authentication flows and error handling.
- **Realtime ops**: Socket.IO driven notifications center, live chat hub and Redis-backed e-mail queue to keep trainers and clientes sincronizados em tempo real.

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
| Database   | PostgreSQL + Redis (fila BullMQ para notificações/e-mails) |
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

1. **Clone e prepare o diretório de trabalho**
   ```bash
   git clone https://github.com/giulianomsg/capifit_app.git
   cd capifit_app
   ```

2. **Limpe instalações anteriores (recomendado quando atualizando a stack)**
   ```bash
   rm -rf node_modules apps/api/node_modules apps/web/node_modules package-lock.json apps/api/package-lock.json apps/web/package-lock.json
   npm cache clean --force
   ```

3. **Instale as dependências usando os workspaces**
   ```bash
   npm install
   ```
   - O `package.json` raiz define `overrides` que fixam `express@5.1.0`, `eslint@8.57.0` e padronizam `rate-limiter-flexible@8.1.0`, evitando conflitos com versões antigas ou inexistentes.
   - Se o ambiente corporativo bloquear pacotes (ex.: `@prisma/client`), configure um espelho autorizado ou libere o acesso ao registry oficial (`https://registry.npmjs.org`).

4. **Configure as variáveis de ambiente de desenvolvimento**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
   Ajuste as URLs, segredos JWT e credenciais de banco/conexões conforme necessário.

   Caso esteja inicializando um PostgreSQL do zero, execute o script de bootstrap para criar o usuário/banco esperados:

   ```bash
   psql -U postgres -h localhost -f apps/api/prisma/bootstrap.sql
   ```

   O comando é idempotente e garante a existência do usuário `capifit_user` com acesso total ao banco `capifit_db`.

5. **Gere o client Prisma, rode migrações e seeds**
   ```bash
   npm run generate --workspace apps/api
   npm run migrate:dev --workspace apps/api
   npm run seed --workspace apps/api
   ```

6. **Execute checagens de lint e testes opcionais**
   ```bash
   npm run lint
   npm run test
   ```
   Esses comandos utilizam `eslint@8` e Vitest. Caso esteja em ambiente restrito, certifique-se de instalar as dependências antes de rodá-los.

7. **Inicie os serviços em modo desenvolvimento**
   ```bash
   npm run dev
   ```
   - API disponível em `http://localhost:3001` (verifique `/health`).
   - Web disponível em `http://localhost:5173`.

   Use os atalhos `npm run dev:api` ou `npm run dev:web` para executar apenas um workspace.

## 🧪 Testing & Linting

```bash
npm run test:api      # Vitest + Supertest (auth, usuários, notificações, chat)
npm run test:web      # Vitest + Testing Library (UI realtime)
npm run lint          # Lint API + Web com ESLint 8
npm run lint:api
npm run lint:web
```

> **Note:** API tests boot an in-memory PostgreSQL instance (pg-mem) to exercise authentication and user management flows end-to-end without requiring Docker or an external database. O lint utiliza `eslint@8.57.0` alinhado ao `eslint-config-react-app@7.0.1`; se um plugin pedir versão superior, verifique se o `package.json` raiz está respeitando a seção `overrides`.

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
- `redis`: Redis 7 (fila BullMQ para envio assíncrono de e-mails/notificações)
- `api`: Express API container (`apps/api/Dockerfile`)
- `web`: Nginx static host + proxy for `/api` (`apps/web/Dockerfile`)
- `api_storage`: named volume with uploaded assets mounted at `/app/storage`

Frontend reachable at `http://localhost:8080`, API proxied under `/api`.

## 🔔 Realtime notifications & chat

- Socket.IO server montado em `/socket.io` reutiliza o token JWT do usuário; o frontend cria/desfaz conexões automaticamente através de `RealtimeProvider`.
- A central de notificações (`/v1/notifications`) oferece filtros (categoria, apenas não lidas), marcação em massa, exclusão e atualização de preferências (`/preferences`). Eventos `notification:new` disparam invalidation da React Query e fallback de e-mail via BullMQ + Nodemailer.
- O hub de mensagens (`/v1/messaging`) lista threads com últimos recados, permite enviar mensagens texto, sinaliza não lidas e registra recibos (`message:new`, `messaging:mark-read`).
- Eventos de domínio mantêm treinos e planos nutricionais sincronizados em tempo real: `workout:created|updated|deleted|session-logged` e `nutrition:plan-created|plan-updated` disparam invalidações automáticas no frontend e notificações direcionadas.
- Redis é obrigatório em produção para operar a fila `notifications:email`; em desenvolvimento, o serviço executa fallback síncrono quando `REDIS_URL` não está configurada e registra avisos nos logs. Administradores podem consultar a saúde da fila em tempo real via `GET /api/v1/notifications/health` (requer bearer token admin).

## 🔐 Security & Observability

- Helmet, CORS (frontend origin whitelist), rate limiting (RateLimiterMemory).
- JWT access tokens in Authorization header, refresh tokens stored as HTTP-only cookies with server-side hashing and rotation.
- Prisma models for `users`, `roles`, `refresh_tokens`, `audit_logs` ready for expansion.
- Structured logging via Pino, request correlation through `pino-http`.
- Centralized error handler that differentiates developer vs user messages and returns 422 validation payloads.
- Multer-based avatar upload pipeline with MIME validation, extension filtering and 5MB size cap (local disk driver included).

## 🗄️ Database & Seeding

| Prisma Model | Purpose |
|--------------|---------|
| `User`       | Core user entity with status, soft-delete column and relations |
| `Role` / `UserRole` | RBAC assignments (admin, trainer, client) |
| `RefreshToken` | Hashed refresh tokens with revocation / expiry tracking |
| `AuditLog` | Future auditing trail for sensitive actions |
| `ClientProfile` | Extended metrics for clients (subscription, goals, assessments) |
| `TrainerClient` | Links trainers to their clients with status & metadata |
| `Exercise` / `Workout*` / `SessionLog` | Exercise catalogue, workout builder blocks and execution logs |
| `Notification` / `NotificationPreference` | Centro de notificações e preferências por usuário |
| `MessageThread` / `Message` / `MessageReceipt` | Conversas, mensagens e recibos de leitura |

Initial migration `202501010001_init` builds the schema and triggers. Seeding (`npm run seed --workspace apps/api`) creates:
- Roles: admin, trainer, client
- Bootstrap admin user `admin@capifit.com` (password `ChangeMe123!` — change in production via `ADMIN_DEFAULT_PASSWORD` env)
- Demo trainer with three connected clients, populated `ClientProfile` stats, workouts and exercise library entries.

## 👥 User & Role Management

- **API endpoints** under `/api/v1/users` implement pagination, search, role/status filters, creation, update, soft delete and avatar upload. Mutations require `admin`; `/me` and profile updates support self-service.
- **React admin page** `/user-management` (visible only to admins) consumes the API with React Query, offering modals for create/edit, avatar uploader and pagination controls.
- **Trainer profile** (`/perfil-do-personal`) now persists avatar changes and personal details, automatically refreshing the authenticated session.

## 📸 File Storage

- Default driver: `local`, writing to `apps/api/storage` (mounted as `api_storage` volume in Docker Compose).
- Static URLs are exposed under `/uploads/*` with a one-day cache policy.
- Driver hooks are centralized in `apps/api/src/lib/storage.ts`; implement the `s3` branch to integrate Amazon S3 or compatible services.

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
| `REDIS_URL` | Redis connection (fila de notificações/e-mails + rate limiting) |
| `SMTP_*` | Configuração SMTP para envios transacionais |
| `ENABLE_EMAIL_NOTIFICATIONS` | Ativa fila BullMQ + SMTP (`true`/`false`) |
| `NOTIFICATION_WORKER_CONCURRENCY` | Número de jobs processados em paralelo pelo worker BullMQ |
| `WEBSOCKET_PATH` | Caminho Socket.IO (default `/socket.io`) |
| `WEBSOCKET_ALLOWED_ORIGINS` | Lista de origens permitidas, separadas por vírgula |
| `FILE_STORAGE_DRIVER` | `local` ou `s3` |
| `FILE_STORAGE_LOCAL_PATH` | Relative/absolute path for local storage (default `./storage`) |
| `LOG_LEVEL` | Pino log level |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Rate limiting window + quota |

### Web (`apps/web/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base API URL (e.g. `http://localhost:3001/api`) |
| `VITE_WS_URL` | Base do Socket.IO (ex.: `http://localhost:3001`) |
| `VITE_WS_PATH` | Caminho Socket.IO (default `/socket.io`) |
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
| Peer dependency exige `express@4` | Atualize o pacote para uma versão compatível ou remova-o; o monorepo utiliza Express 5.1.0 e bloqueia `express-async-errors` via `overrides`. |
| Prisma migration errors | Verify `DATABASE_URL`, ensure Postgres is reachable, rerun `npm run migrate:dev`. |
| Cookies not persisting during local dev | Confirm frontend uses `http://localhost` (not 127.0.0.1) so `SameSite=Strict` cookies are considered same-site. |
| Docker build failures | Clean previous images (`docker compose down -v`), ensure buildx supports `node:20-alpine`. |

## 🧾 License

This project is proprietary to the original stakeholders. All rights reserved.
