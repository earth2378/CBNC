# CBNC Functional Specification (Phase 1)

## 1. Scope
Prototype web system for employee digital name cards with public sharing and exports.

In scope:
- Account registration, login, logout, reset password (prototype-simple)
- Employee profile editing
- Public profile viewing via stable public link
- QR code generation for public link
- Card export to PDF and JPG
- Admin user list and activate/deactivate
- Multilingual content (`th`, `en`, `zh`)
- Responsive web support (desktop + mobile)

Out of scope:
- HCM prefill integration
- SSO / enterprise IAM
- Advanced privacy controls per field
- Custom card template designer
- Audit log platform

## 2. Roles
- `employee`: manage own profile, view/download own exports
- `admin`: manage user activation, list users

## 3. Core Data Model
- `users`: auth identity, role, active flag
- `profiles`: public identity + non-localized profile fields + language preference flags
- `profile_localizations`: localized text fields for `th`, `en`, `zh`
- `system_settings`: global language enable flags

Source schema: `init-db.sql`

## 4. Functional Requirements
1. Registration creates:
- `users` row
- `profiles` row (with stable `public_id`)
- three `profile_localizations` rows (`th`, `en`, `zh`) with default `"-"`

2. Authentication:
- Session cookie auth for private routes
- Deactivated users cannot log in

3. Profile management:
- Employee can update non-localized and localized fields
- Public page is read-only

4. Public access:
- Public URL uses `public_id`
- Public response includes only public card data (no internal role/account state)

5. QR behavior:
- One stable QR per user
- QR points to public profile URL
- QR does not change when profile content changes

6. Export behavior:
- Export source is HTML card rendering
- Support PDF and JPG
- Public profile page can download public PDF/JPG
- Exported layout should match on-screen card

7. Language behavior:
- Supported language codes: `th`, `en`, `zh`
- UI labels are localized
- User-entered profile values are manually edited per language (no auto-translation)
- Effective enabled language set = global setting AND per-user preference

8. Placeholder behavior:
- For missing fields, render `"-"` consistently

## 5. API Contract
Source API: `api-spec.yaml`

Required endpoints:
- Auth: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/reset-password`
- Me: `/me/profile` (GET/PUT), `/me/photo`
- Public: `/public/profiles/{public_id}`
- Admin: `/admin/users`, `/admin/users/{user_id}`
- Export (private): `/me/qr.png`, `/me/card.pdf`, `/me/card.jpg`
- Export (public): `/public/profiles/{public_id}/card.pdf`, `/public/profiles/{public_id}/card.jpg`

## 6. Non-Functional (Prototype)
- TypeScript for all app/backend code
- Mobile-first public card page
- Basic error handling (4xx/5xx)
- Basic logging for auth/admin actions

## 7. Architecture Decision
Use a TypeScript monorepo:
- `apps/web` for frontend
- `apps/api` for backend
- `packages/*` for shared types/config/utilities

Rationale:
- Single source for shared types and validation schemas
- Faster coordinated changes across API + UI
- Better consistency for small-to-medium team prototype delivery
