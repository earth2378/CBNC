# CBNC Agent Guide

## Project Intent
CBNC is a digital employee name-card system with:
- Auth + role-based access (`employee`, `admin`)
- Editable multilingual profile (`th`, `en`, `zh`)
- Public profile link + QR code
- Card export (`pdf`, `jpg`)

## Stack Decision
- Language: **TypeScript** only (frontend + backend + shared packages)
- Architecture: **Monorepo** (recommended)

## Monorepo Layout
```
CBNC/
  apps/
    web/            # frontend app (public page + employee/admin UI)
    api/            # backend API (REST + auth + export)
  packages/
    shared-types/   # DTOs, zod schemas, OpenAPI-generated types
    config/         # tsconfig/eslint/prettier shared config
  docs/
    functional-spec.md
    chat.md
  api-spec.yaml
  init-db.sql
```

## Implementation Rules
- Keep API contract aligned with `api-spec.yaml`.
- Keep DB schema aligned with `init-db.sql`.
- Public endpoints must never expose admin/internal user attributes.
- Use `zh` as the Chinese language code (not `ch`).
- Missing profile values should be stored/rendered as `"-"` for prototype behavior.
- Private endpoints require session auth; admin endpoints require admin role.

## Phase 1 Endpoints (Source of Truth)
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/reset-password`
- Me: `GET /me/profile`, `PUT /me/profile`, `POST /me/photo`
- Public: `GET /public/profiles/{public_id}`
- Admin: `GET /admin/users`, `PATCH /admin/users/{user_id}`
- Export (private): `GET /me/qr.png`, `GET /me/card.pdf`, `GET /me/card.jpg`
- Export (public): `GET /public/profiles/{public_id}/card.pdf`, `GET /public/profiles/{public_id}/card.jpg`

## Definition of Done (Feature-Level)
- Request validation + clear error responses.
- Auth/role guard applied correctly.
- DB writes/reads verified.
- One happy-path and one failure-path test per endpoint.
- UI behavior matches core rules in `docs/functional-spec.md`.
