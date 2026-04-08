# CLAUDE.md — apps/web

## Project Overview

**CBNC Web** is the Next.js frontend for a multilingual employee digital name card system. Employees can manage multilingual (Thai/English/Chinese) profiles, generate shareable public cards, and export them as QR codes, PDFs, or JPGs.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Plain CSS via `app/globals.css` (no Tailwind, no CSS-in-JS)
- **Port**: 3000

## Commands

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run start        # Start production server
npm run typecheck    # Type-check without emitting
```

## Directory Structure

```
app/                        # Next.js App Router
  page.tsx                  # Home/landing page
  layout.tsx                # Root layout (includes SiteHeader)
  globals.css               # All CSS styles (~29KB, theme-aware)
  login/page.tsx            # Login form
  register/page.tsx         # Registration form
  reset-password/page.tsx   # Password reset
  me/profile/page.tsx       # Authenticated profile editor
  admin/users/page.tsx      # Admin user management
  p/[publicId]/page.tsx     # Public shareable name card

src/
  components/
    site-header.tsx         # Nav header, auth-aware, theme toggle
  lib/
    api.ts                  # apiFetch() — central API client
```

## Key Patterns

### API Client (`src/lib/api.ts`)

All backend calls go through `apiFetch<T>()`:

```typescript
const data = await apiFetch<ProfileResponse>("/me/profile");
await apiFetch("/auth/logout", { method: "POST" });
await apiFetch("/me/profile", { method: "PUT", body: JSON.stringify(payload) });
```

- Automatically includes credentials (cookies)
- Requests go to `/backend/*` which Next.js rewrites to the backend server
- Returns `undefined` for 204 No Content
- Throws `ApiError` (with `status` field) on non-2xx responses

### Authentication

- Session is a **signed HTTP-only cookie** managed by the backend
- Auth state is determined by calling `GET /me/profile` — 401/403 = unauthenticated
- No client-side token storage; cookies are browser-handled automatically
- Role-based UI: checks `user.role === "admin"` for admin-only nav items

### Styling

- All styles are in `app/globals.css` using CSS custom properties
- Dark mode via `[data-theme="dark"]` attribute on `<html>`
- Theme persisted in `localStorage`, restored with an anti-FOUC inline script
- Use existing CSS classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.field`, `.card`, `.hero`, etc.
- **Do not add Tailwind** — the project intentionally uses plain CSS

### State Management

- No global state library (no Redux, no Zustand, no Context for app state)
- Each page manages its own state with `useState` / `useEffect`
- Profile forms use controlled components with local state

## Environment Variables

```bash
# .env.local
BACKEND_ORIGIN=http://localhost:3001         # Backend API origin (server-side only)
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000 # Public app URL (used in QR/share links)
```

## Routing

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/reset-password` | Reset password | No |
| `/me/profile` | Profile editor | Yes |
| `/admin/users` | User management | Yes + Admin |
| `/p/[publicId]` | Public name card | No |

## Backend API Reference

All requests are made to `/backend/*` (proxied). Key endpoints:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Sign out |
| POST | `/auth/reset-password` | Reset password |
| GET | `/me/profile` | Get current user profile |
| PUT | `/me/profile` | Update profile |
| POST | `/me/profile/photo` | Upload photo (multipart) |
| DELETE | `/me/profile/photo` | Delete photo |
| GET | `/public/profiles/:publicId` | Public profile |
| GET | `/public/locations` | Office locations |
| GET | `/admin/users` | List all users (admin) |
| PATCH | `/admin/users/:id` | Activate/deactivate (admin) |
| POST | `/admin/users/:id/reset-password` | Reset user password (admin) |

## Profile Data Shape

```typescript
// Profile response from GET /me/profile
{
  user: { id, email, role, isActive, createdAt, lastLoginAt },
  profile: { publicId, emailPublic, phoneNumber, photoUrl,
              prefEnableTh, prefEnableEn, prefEnableZh, locationId },
  localizations: [
    { lang: "th", fullName, position, department },
    { lang: "en", fullName, position, department },
    { lang: "zh", fullName, position, department },
  ]
}
```

## Common Gotchas

- **No Tailwind**: Use existing CSS classes from `globals.css`, not utility classes
- **API proxy**: Never call the backend directly from client — always use `apiFetch` which routes through `/backend/*`
- **Cookie credentials**: `apiFetch` already sets `credentials: "include"` — don't add it manually
- **Dark mode**: Use `var(--color-*)` CSS variables, not hardcoded colors
- **Photo upload**: Must use `FormData` with multipart, not JSON
- **Language support**: UI must handle all three languages (th/en/zh) — check `prefEnable*` flags
