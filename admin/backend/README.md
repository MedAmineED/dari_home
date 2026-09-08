# Darihome Admin — Backend

NestJS + Prisma + MySQL REST API for the Darihome administration platform.

This phase implements the **foundation** (full future-ready database schema) and
**authentication + RBAC**. Catalog, commerce, dashboard and settings modules are
migrated at the schema level and will be implemented in later phases.

## Stack

- **NestJS 10** (modular, DI, guards/interceptors/filters)
- **Prisma 6** ORM against **MySQL 8**
- **JWT** access tokens + **httpOnly cookie** refresh tokens (rotated & revocable)
- **class-validator** DTOs, **zod**-validated environment
- **Swagger** API docs

## Requirements

- Node.js 20+ (developed on 22)
- A running MySQL 8 instance

## Setup

```bash
cp .env.example .env          # then edit DATABASE_URL, JWT secrets, seed admin
npm install
npm run prisma:generate
npm run prisma:migrate        # creates the database + tables
npx prisma db seed            # roles, permissions, SUPER_ADMIN, example categories
npm run start:dev
```

API runs at `http://localhost:4000/api/v1`. Swagger UI at
`http://localhost:4000/api/v1/docs`.

## Environment

See [`.env.example`](.env.example). Never commit a real `.env`. Key variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets (min 16 chars) |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (`15m`, `7d`) |
| `REFRESH_COOKIE_NAME`, `COOKIE_SECURE`, `COOKIE_SAME_SITE` | Refresh cookie config |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `SEED_ADMIN_*` | Initial SUPER_ADMIN credentials (seed only) |

## Auth flow

1. `POST /auth/login` → returns `{ accessToken, user }` and sets an httpOnly
   refresh cookie scoped to `/api/v1/auth`.
2. Send `Authorization: Bearer <accessToken>` on protected requests.
3. On expiry, `POST /auth/refresh` (cookie sent automatically) rotates the
   refresh token and returns a new access token.
4. `POST /auth/logout` revokes the refresh token and clears the cookie.

## Authorization

- Roles are data (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, + custom).
- Permissions are `resource:action` strings, seeded and assigned to roles.
- Protect routes with `@RequirePermissions('product:create')` (+ `PermissionsGuard`)
  or `@Roles('ADMIN')` (+ `RolesGuard`). `SUPER_ADMIN` bypasses permission checks.
- Roles/permissions are resolved per request, so revocation is immediate.

## Project structure

```
src/
├── config/       zod env validation + typed AppConfigService
├── common/       exception filter, response interceptor, guards, decorators, dto
├── prisma/       global PrismaModule + PrismaService
└── modules/
    ├── auth/         login/refresh/logout/me/change-password, JWT strategy
    ├── users/        CRUD + role assignment (controller/service/repository)
    ├── roles/        CRUD + permission assignment
    ├── permissions/  read-only catalog (grouped)
    └── audit/        audit log service + read endpoint
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run start:dev` | Watch-mode dev server |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | ESLint (`--fix`) |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:studio` | Prisma Studio |
| `npx prisma db seed` | Seed roles/permissions/admin/categories |
