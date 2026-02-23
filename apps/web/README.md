# @cbnc/web

Next.js frontend for CBNC.

## Setup
1. Copy env file
```bash
cp apps/web/.env.example apps/web/.env
```
2. Install dependencies from repo root
```bash
npm install
```
3. Run frontend
```bash
npm --workspace @cbnc/web run dev
```

## Notes
- Frontend calls backend through rewrite prefix: `/backend/*`
- Configure backend target with `BACKEND_ORIGIN` (default `http://localhost:3001`)
