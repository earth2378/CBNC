# CLAUDE.md — apps/api

## Project Overview

**CBNC API** is the Fastify backend for a multilingual employee digital name card system. It handles authentication, user profile management (Thai/English/Chinese), photo uploads, admin user management, and public profile serving.

## Tech Stack

- **Framework**: Fastify 5.2
- **Language**: TypeScript 5.7 (ESM modules)
- **ORM**: Drizzle ORM + PostgreSQL 16
- **Validation**: Zod 3
- **Auth**: Signed HTTP-only session cookies
- **Storage**: Local filesystem (S3 skeleton, not implemented)
- **Port**: 3001

## Commands

```bash
npm run dev           # Start dev server with hot reload (tsx watch)
npm run build         # Compile TypeScript to dist/
npm run start         # Run compiled production server
npm run typecheck     # Type-check without emitting

npm run db:generate   # Generate Drizzle migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Drizzle Studio (DB GUI)
npm run db:seed       # Seed database with initial data
npm run db:setup      # push + seed (initial setup)
```

## Directory Structure

```
src/
  server.ts                 # Entry point — creates app, starts server
  app.ts                    # Fastify app factory, plugin registration
  db/
    schema.ts               # Drizzle ORM table/enum definitions
    seed.ts                 # Seed: locations + system settings
  routes/
    index.ts                # Registers all route modules
    health.ts               # GET /health
    auth.ts                 # POST /auth/register|login|logout|reset-password
    me.ts                   # GET|PUT /me/profile, POST|DELETE /me/profile/photo
    public.ts               # GET /public/profiles/:id, /public/locations
    admin.ts                # GET|PATCH /admin/users, POST .../reset-password
    export.ts               # PDF/JPG export (not implemented)
  services/
    auth.service.ts         # register, login, resetPassword
    me.service.ts           # getProfile, updateProfile, uploadPhoto, deletePhoto
    public.service.ts       # getPublicProfile, listLocations
    admin.service.ts        # listUsers, setUserActive, resetUserPassword
  repositories/
    auth.repository.ts      # User CRUD for auth flows
    users.repository.ts     # General user queries
    profiles.repository.ts  # Profile + localization queries
    locations.repository.ts # Location queries
    system-settings.repository.ts
  lib/
    db.ts                   # Database connection pool (singleton)
    errors.ts               # AppError class
    http.ts                 # HTTP response helpers
    auth/
      session.ts            # Cookie session: sign/verify/set/clear
      guard.ts              # requireAuth(), requireAdmin() middleware
      password.ts           # hashPassword(), verifyPassword()
    storage/
      provider.ts           # StorageProvider: local (implemented) + S3 (skeleton)
  plugins/
    env.ts                  # Environment variable validation via Zod
  types/
    env.ts                  # AppEnv type
  fastify.d.ts              # Fastify module augmentation
```

## Architecture: 3-Layer Pattern

```
Route handler  →  Service (business logic)  →  Repository (DB queries)
```

- **Routes**: Parse/validate request with Zod, call service, return response
- **Services**: Business rules, data transformation, error throwing
- **Repositories**: Raw Drizzle ORM queries, no business logic

## Database Schema (`src/db/schema.ts`)

### Tables

**users**
```
id            uuid PK
email         varchar(320) UNIQUE
passwordHash  text
role          enum('employee','admin')  default 'employee'
isActive      boolean                  default false
createdAt, updatedAt, lastLoginAt
```

**profiles** (1:1 with users)
```
userId        uuid PK FK→users
publicId      uuid UNIQUE  (used in /p/[publicId] URLs)
photoObjectKey text        (storage key → URL via STORAGE_PUBLIC_BASE_URL)
emailPublic   varchar(320)
phoneNumber   varchar(50)  default '-'
prefEnableTh, prefEnableEn, prefEnableZh  boolean
locationId    uuid FK→locations
createdAt, updatedAt
```

**profileLocalizations** (up to 3 per user: th/en/zh)
```
id          uuid PK
userId      uuid FK→users
lang        enum('th','en','zh')
fullName    varchar(200) default '-'
position    varchar(200) default '-'
department  varchar(200) default '-'
UNIQUE(userId, lang)
```

**locations**
```
id          uuid PK
code        varchar(50) UNIQUE
nameTh, nameEn, nameZh        varchar(200)
addressTh, addressEn, addressZh  varchar(500)
isActive    boolean  default true
sortOrder   integer  default 0
```

**systemSettings** (single-row table, id always = 1)
```
id          integer PK check(id=1)
enableTh, enableEn, enableZh  boolean  default true
updatedAt
```

## Authentication

### Session Cookies
- Cookie name: `SESSION_COOKIE_NAME` env var (default: `session`)
- Payload: `{ sub: userId, role: "employee"|"admin" }` → Base64URL JSON + HMAC signature
- Flags: HttpOnly, SameSite=Lax, Secure=true in production

### Guards (`lib/auth/guard.ts`)
```typescript
const session = requireAuth(request);    // throws 401 if not authenticated
const session = requireAdmin(request);   // throws 403 if not admin
// session = { sub: string, role: UserRole }
```

### Password
```typescript
await hashPassword(plain: string): string
await verifyPassword(plain: string, hash: string): boolean
```

## Error Handling

Use `AppError` for all expected errors:
```typescript
import { AppError } from "../lib/errors.js";

throw new AppError(404, "NOT_FOUND", "User not found");
throw new AppError(401, "UNAUTHORIZED", "Invalid credentials");
throw new AppError(400, "VALIDATION_ERROR", "Email already in use");
```

Error response shape:
```json
{ "error": { "code": "NOT_FOUND", "message": "User not found" } }
```

## Storage (`lib/storage/provider.ts`)

```typescript
const storage = getStorageProvider();

// Upload file
const { objectKey, publicUrl } = await storage.upload({
  buffer: Buffer,
  mimeType: "image/jpeg",
  folder: "profile-photos",
  userId: string,
});

// Delete file
await storage.delete(objectKey);
```

- **Local**: Saves to `LOCAL_UPLOAD_DIR/profile-photos/{userId}/{timestamp}-{uuid}.{ext}`
- **S3**: Not implemented (returns 501)
- Photo size limit: 2MB; allowed types: JPEG, PNG, WebP

## Environment Variables

```bash
NODE_ENV=development|test|production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=postgres://postgres:postgres@localhost:5433/cbnc
SESSION_COOKIE_NAME=session
SESSION_SECRET=change-me-in-production    # HMAC signing secret
STORAGE_PROVIDER=local|s3
STORAGE_PUBLIC_BASE_URL=http://localhost:3001  # Base URL for serving files
LOCAL_UPLOAD_DIR=uploads                  # Relative dir for local storage
# S3 (optional, only if STORAGE_PROVIDER=s3)
S3_BUCKET=
S3_REGION=
S3_PUBLIC_BASE_URL=
```

## API Endpoints Reference

### Auth (public)
| Method | Path | Body |
|--------|------|------|
| POST | `/auth/register` | `{ email, password }` |
| POST | `/auth/login` | `{ email, password }` |
| POST | `/auth/logout` | — |
| POST | `/auth/reset-password` | `{ email, new_password, re_new_password }` |

### Me (requires auth cookie)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/me/profile` | Query: `?langs=th,en,zh` |
| PUT | `/me/profile` | Update profile + localizations |
| POST | `/me/profile/photo` | Multipart, max 2MB |
| DELETE | `/me/profile/photo` | — |

### Public (no auth)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/public/locations` | Active locations only |
| GET | `/public/profiles/:publicId` | Query: `?lang=th\|en\|zh` |

### Admin (requires auth + admin role)
| Method | Path | Body |
|--------|------|------|
| GET | `/admin/users` | List all users |
| PATCH | `/admin/users/:userId` | `{ is_active: boolean }` |
| POST | `/admin/users/:userId/reset-password` | — (generates temp password) |

### Static Files
- `GET /uploads/*` — Serves local upload directory

## Adding a New Route

1. Create handler in `routes/yourFeature.ts`
2. Create service in `services/yourFeature.service.ts`
3. Create repository in `repositories/yourFeature.repository.ts`
4. Register route in `routes/index.ts`

Typical route structure:
```typescript
import { requireAuth } from "../lib/auth/guard.js";
import { z } from "zod";

const bodySchema = z.object({ name: z.string() });

fastify.post("/your/endpoint", async (request, reply) => {
  const session = requireAuth(request);
  const body = bodySchema.parse(request.body);
  const result = await yourService.doSomething(session.sub, body);
  return reply.code(200).send(result);
});
```

## Common Gotchas

- **ESM imports**: Always use `.js` extension in imports (e.g., `import { db } from "../lib/db.js"`)
- **Drizzle queries**: Use `db.select().from(table).where(...)` — avoid raw SQL
- **Upsert localizations**: Profile localizations use INSERT ON CONFLICT DO UPDATE (check `profiles.repository.ts`)
- **Single-row systemSettings**: Always query with `where(eq(systemSettings.id, 1))`
- **Photo URL**: Stored as `photoObjectKey` in DB; prepend `STORAGE_PUBLIC_BASE_URL` to get full URL
- **New users**: Created with `isActive: false` — admin must activate them
- **Password reset**: The `/auth/reset-password` is self-service; `/admin/users/:id/reset-password` generates a temp password returned to admin
