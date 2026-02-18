# @cbnc/api

Backend API service for CBNC.

## Quick Start
1. Copy env file:
```bash
cp apps/api/.env.example apps/api/.env
```
2. Install deps from repo root:
```bash
npm install
```
3. Run dev server:
```bash
npm run dev:api
```

Server defaults to `http://0.0.0.0:3001` and includes `GET /health`.

## Database (Postgres + Drizzle)
Generate migration from schema:
```bash
npm run db:generate
```

Push schema directly to DB (prototype/dev):
```bash
npm run db:push
```

Open Drizzle Studio:
```bash
npm run db:studio
```

## Current Status
- All Phase 1 routes are scaffolded.
- Business logic and DB integration are not implemented yet.
- Non-health endpoints currently return `501 NOT_IMPLEMENTED`.
