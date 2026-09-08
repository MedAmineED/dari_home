# Darihome Admin — Frontend

Next.js (App Router) + TypeScript administration dashboard for Darihome.

This phase delivers the **authentication shell**: login, session bootstrap via
the httpOnly refresh cookie, a protected RTL dashboard layout (sidebar, header,
breadcrumbs) and a placeholder overview. Catalog/commerce/dashboard pages arrive
in later phases; the nav already lists them (badged "قريباً").

## Stack

- **Next.js 15** App Router, **React 19**, strict **TypeScript**
- **Tailwind CSS** themed from `library/admin_ref` (wood/umber palette,
  IBM Plex Sans Arabic + Inter), **RTL / Arabic** by default
- **TanStack Query** for server state, **react-hook-form + zod** for forms
- **axios** client with an access-token-in-memory + transparent 401→refresh
  interceptor; refresh cookie sent via `withCredentials`
- **sonner** toasts, **lucide-react** icons

## Requirements

- Node.js 20+ (developed on 22)
- The backend API running (see `../backend`)

## Setup

```bash
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL
npm install
npm run dev                    # http://localhost:3000
```

Sign in with the seeded SUPER_ADMIN credentials from the backend
(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL incl. prefix, e.g. `http://localhost:4000/api/v1` |

## How auth works on the client

1. On load, `AuthProvider` calls `POST /auth/refresh`; if the cookie is valid it
   stores the returned access token **in memory** and marks the session active.
2. `(dashboard)` routes are guarded — unauthenticated users are sent to `/login`.
3. The axios response interceptor refreshes once on a `401` and retries; if the
   refresh fails the session is cleared and the user returns to `/login`.
4. Nav items are filtered by the user's permissions (`SUPER_ADMIN` sees all).

## Project structure

```
src/
├── app/
│   ├── (auth)/login/         login screen
│   ├── (dashboard)/          protected layout + dashboard page
│   ├── layout.tsx            RTL root layout, fonts, providers
│   └── globals.css
├── components/{ui,layout}/   reusable UI kit + shell (sidebar/header/breadcrumbs)
├── config/                   nav items + Arabic UI strings
├── lib/api/                  typed axios client, auth calls, token store, types
└── providers/                AuthProvider + QueryProvider
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
