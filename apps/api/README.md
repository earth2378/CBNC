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
3. Optional: configure compose env overrides at repo root:
```bash
cp .env.example .env
```
4. Start PostgreSQL only (Docker, host port `5433`):
```bash
docker compose up -d postgres
```
5. Run dev server:
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

Seed mock data (admin + employee):
```bash
npm run db:seed
```

Push schema and seed in one command:
```bash
npm run db:setup
```

Open Drizzle Studio:
```bash
npm run db:studio
```

## Full Docker (Web + API + DB)
Run full stack (Web + API + PostgreSQL) in Docker:
```bash
docker compose --profile full up -d --build
```

Run backend only (API + PostgreSQL), then run web locally for hot reload:
```bash
docker compose up -d --build api postgres
```

For other devices on your LAN, set `STORAGE_PUBLIC_BASE_URL` in repo-root `.env` to your machine IP (example: `http://192.168.1.10:3001`).

## Current Status
- Implemented: auth, me profile (`GET/PUT`), me photo (`POST/DELETE`), public profile (`GET`), admin user list/activation.
- Public/profile photo storage uses local provider in Phase 1 (`s3` scaffold exists but is not implemented yet).
- Export endpoints remain deferred and currently return `501 NOT_IMPLEMENTED`:
  - `GET /me/qr.png`
  - `GET /me/card.pdf`
  - `GET /me/card.jpg`
  - `GET /public/profiles/{public_id}/card.pdf`
  - `GET /public/profiles/{public_id}/card.jpg`
