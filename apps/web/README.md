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

## Docker (Monorepo Compose)
Run full stack from repo root:
```bash
docker compose --profile full up -d --build
```

Run backend only (recommended while developing Next.js locally with hot reload):
```bash
docker compose up -d --build api postgres
```

## Notes
- Frontend calls backend through rewrite prefix: `/backend/*`
- Configure backend target with `BACKEND_ORIGIN` (default `http://localhost:3001`)
- Optional: set `NEXT_PUBLIC_APP_ORIGIN` for public links/QR generation (default uses browser origin)
- Public page export is currently frontend-rendered:
  - `Share JPG` captures the visible card and uses Web Share when available.
  - `Save PDF` captures the visible card and downloads a PDF.
- `Share JPG` file-share support depends on browser + secure context (HTTPS). If unsupported, behavior falls back.
