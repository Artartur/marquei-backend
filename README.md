# Marquei — Backend

REST API for service scheduling, built with NestJS and Prisma.

---

## Stack and rationale

| Technology | Rationale |
|---|---|
| **NestJS** | Opinionated framework with built-in support for modules, guards, DI, and decorators — reduces architectural decisions and speeds up development |
| **Prisma** | Type-safe ORM with manageable migrations and an auto-generated client from the schema |
| **PostgreSQL (Supabase)** | Robust relational database; Supabase provides a managed instance with a visual dashboard, useful for early-stage projects |
| **JWT + Refresh Token** | Stateless authentication with a short-lived access token and a refresh token stored in an HttpOnly cookie |
| **@nestjs/schedule** | Internal job scheduling (e.g. notification dispatch) without relying on an external service |

---

## Running locally

### Prerequisites

- Node.js 20+
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Artartur/marquei-backend
cd marquei-backend

# 2. Install dependencies (Prisma Client is generated automatically via postinstall)
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your credentials in .env

# 4. Start the development server
npm run start:dev
```

The API will be available at `http://localhost:3000`.

---

## Environment variables

Create a `.env` file at the project root based on `.env.example`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
FRONTEND_URL=http://localhost:4200
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=
NODE_ENV=development
```

> In production, set `NODE_ENV=production` in your deployment platform. This enables `SameSite=None; Secure` on the refresh token cookie, which is required when the frontend and backend run on different domains.

---

## Test credentials

| Role | Email | Password |
|---|---|---|
| `MANAGER` | maria@email.com | test123 |
| `PROFESSIONAL` | artur@email.com | test123 |
| `CLIENT` | bob@email.com | test123 |

> After authenticating via `POST /auth/login`, use the returned access token in the `Authorization: Bearer <token>` header.

---

## Architecture decisions

The project follows NestJS's modular architecture with an explicit **Repository** layer in each module (e.g. `appointments.repository.ts`), separating database access logic from business logic in Services. This makes unit testing easier and allows swapping the ORM without touching business rules.

Authentication uses two tokens: a short-lived **JWT access token** (15 min) sent in the `Authorization` header, and a **refresh token** stored in an `HttpOnly` cookie scoped to the `/auth/refresh` path. This separation reduces the attack surface — the refresh token is not accessible via JavaScript and is only sent on the specific renewal route. Global guards (`JwtAuthGuard` and `RolesGuard`) protect all routes by default, with opt-out via the `@Public()` decorator.

---

## What was left out and what I would do differently

**Not implemented due to time constraints:**

- Unit and integration tests (Jest is configured but has no coverage)
- OpenAPI/Swagger documentation
- Rate limiting on authentication routes
- Pagination for list endpoints
- Additional search and filtering routes

**What I would do differently:**

- Move the Prisma Client output inside `src/` (`src/generated/prisma`) to prevent TypeScript from expanding `rootDir` to the project root, which causes the build to emit `dist/src/main.js` instead of `dist/main.js`
- Add environment variable validation with `joi` or `zod` at startup to catch missing or malformed config early, avoiding silent failures in production
