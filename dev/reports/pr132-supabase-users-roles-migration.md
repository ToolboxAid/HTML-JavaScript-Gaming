# PR_26166_132-supabase-users-roles-migration

## Branch Validation

PASS - Current branch is `main`.

## Scope

PASS - Stayed in the DB/Auth migration lane. This PR adds the Supabase users/roles/user_roles migration path only. Supabase remains opt-in by provider selector and is not activated automatically.

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS - Started from PR126-PR131 provider/runtime outputs.
- PASS - Did not activate Supabase automatically.
- PASS - Did not add secrets or dependencies.
- PASS - Did not add password storage or custom password tables.
- PASS - Did not introduce MEM DB, fake-login, or `login.html`.
- PASS - Preserved Browser -> API/Service Contract -> Database.
- PASS - Added Supabase Postgres identity initialization for `users`, `roles`, and `user_roles`.
- PASS - Identity records use `users.key`, `roles.key`, `user_roles.userKey`, and `user_roles.roleKey`.
- PASS - Audit fields are normalized for identity setup: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- PASS - Server/API owns generated keys for roles and user_roles when missing.
- PASS - Static DEV user ULID exception is tracked for User 1, User 2, User 3, and DavidQ admin.
- PASS - Admin setup exposes server-side `/api/admin/setup/identity` for Supabase identity initialization.
- PASS - DB Viewer Supabase readiness path can read `users`, `roles`, and `user_roles` through `getDbViewerSnapshot()`.
- PASS - Missing Supabase config fails visibly through the adapter and Admin setup route.

## Supabase Identity Migration Evidence

- Added `initializeIdentity` to the Supabase Postgres provider contract operations.
- Added `SupabasePostgresProviderAdapter.initializeIdentity()`:
  - upserts `users` first
  - upserts `roles` second
  - upserts `user_roles` third
  - uses PostgREST `on_conflict=key`
  - uses `Prefer: resolution=merge-duplicates,return=representation`
- Added provider snapshot `supabasePostgres.identityMigration`:
  - supported tables: `users`, `roles`, `user_roles`
  - key generation owner: server/API
  - audit fields listed
  - static DEV user exception documented
- Added Local API route:
  - `POST /api/admin/setup/identity`
  - server-side only
  - requires selected database provider `supabase-postgres`
  - delegates to the Supabase Postgres adapter

## Secrets Audit

- PASS - `.env.example` still contains placeholders only.
- PASS - Secret-pattern scan found no real Supabase URL, service key, JWT, or `sbp_` token.
- PASS - Test placeholder service-role strings remain test-only and are asserted not to appear in provider API responses.
- PASS - Browser diagnostics expose no service-role values or server-only secret names.

## Local DB Default Audit

- PASS - `npm run dev:local-api` started on port `5532` with explicit local selectors.
- PASS - `/api/providers/contract` returned `local-db/local-db` with status `ready`.
- PASS - `/api/local-db/snapshot` returned identity table counts:
  - `users=5`
  - `roles=4`
  - `user_roles=7`

## Validation Lane Report

- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 13/13 tests.
- PASS - `npm run dev:local-api` route smoke with explicit Local DB selectors.
- PASS - `git diff --check`
- SKIP - Playwright: no browser UI behavior changed; changed behavior is covered by targeted Node/runtime API tests.
- SKIP - Full samples smoke: samples are outside this DB/Auth identity migration scope.

## Manual Validation Notes

- Existing `local-mem` reference remains only in `tests/dev-runtime/DbSeedIntegrity.test.mjs`, where it proves the retired mode is rejected.
- Password mentions are limited to Supabase Auth REST adapter parameters and DDL/DML comments proving no password tables exist.
- The Admin identity route is the DEV bridge for server-side setup. PR133 should productionize Site Setup reporting/authorization behavior before any real Supabase DEV execution.
