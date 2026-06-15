# PR_26166_155-supabase-identity-tables-bootstrap

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before implementation.
- PASS: `GAMEFOUNDRY_DB_PROVIDER=local-db` remains the required product-data posture.
- PASS: Product data remains on Local DB; no product-table migration was added.
- PASS: Direct PostgreSQL is not required for identity readiness. `validate:supabase-dev` uses Supabase REST/Auth checks for service-role and identity table readiness.
- PASS: Direct PostgreSQL TLS failure is retained as a diagnostic and can be downgraded to `WARN` when REST/API identity readiness passes.
- PASS: Added Supabase identity DDL under `docs_build/database/ddl/account/`.
- PASS: Added DEV/review bootstrap instructions under `docs_build/database/seed/account/`.
- PASS: Required identity tables are represented in DDL:
  - `users`
  - `roles`
  - `user_roles`
- PASS: Required ownership fields are represented:
  - `key`
  - `createdAt`
  - `updatedAt`
  - `createdBy`
  - `updatedBy`
- PASS: `users.key` remains the authoritative ownership reference.
- PASS: DEV static ULID exceptions are documented only for User 1, User 2, User 3, and DavidQ admin.
- PASS: No password tables were added.
- PASS: No browser-owned auth or identity data was added.
- PASS: No secrets or `.env.local` files were committed or modified.
- PASS: `validate:supabase-dev` now runs with Node system CA support while keeping TLS verification enabled.
- PASS: Service role authentication validates successfully through REST/Auth.
- FAIL: Live Supabase `users`, `roles`, and `user_roles` table checks do not pass yet because the tables are not present in the remote Supabase schema cache.
- FAIL: Live direct DB TLS failure remains a blocker in the current output because REST/API identity table readiness does not pass yet. Once the tables pass through REST/API, the direct DB TLS failure is downgraded to `WARN`.

## Validation Lane Report
- Impacted lane: targeted operator auth/provider database bootstrap validation.
- Playwright impacted: No. No browser runtime or auth/session page behavior changed.
- Samples validation: SKIP. No samples or sample manifests changed.

## Validation Performed
- PASS: `node --check scripts/validate-supabase-dev.mjs`
- PASS: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`
- PASS: `git diff --check`
- PASS: No TLS bypass patterns were added.
- PASS: No password table DDL was added.
- FAIL: `npm run validate:supabase-dev` because the remote Supabase identity tables still need the DDL applied.

## validate:supabase-dev Output

```text
> html-javascript-gaming@1.0.0 validate:supabase-dev
> node --use-system-ca ./scripts/validate-supabase-dev.mjs

PASS - .env.local loaded (6 key(s) loaded)
PASS - URL configured (GAMEFOUNDRY_SUPABASE_URL=https:...e.co)
PASS - Publishable key configured (GAMEFOUNDRY_SUPABASE_ANON_KEY=sb_pub...V2Zj)
PASS - Service role key configured (GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY=sb_sec...KRU6)
PASS - Database URL configured (GAMEFOUNDRY_SUPABASE_DATABASE_URL=postgr...gres)
PASS - Supabase reachable (HTTP 404)
PASS - TLS validation
PASS - Auth endpoint reachable (HTTP 200)
PASS - Service role authentication (HTTP 200)
FAIL - Database connection (SELF_SIGNED_CERT_IN_CHAIN)
FAIL - users table (HTTP 404: Could not find the table 'public.users' in the schema cache Run docs_build/database/ddl/account/supabase-identity-tables.sql through the approved Supabase SQL setup path.)
FAIL - roles table (HTTP 404: Could not find the table 'public.roles' in the schema cache Run docs_build/database/ddl/account/supabase-identity-tables.sql through the approved Supabase SQL setup path.)
FAIL - user_roles table (HTTP 404: Could not find the table 'public.user_roles' in the schema cache Run docs_build/database/ddl/account/supabase-identity-tables.sql through the approved Supabase SQL setup path.)

Overall Result: FAIL
Failed checks: Database connection, users table, roles table, user_roles table
```

## Manual Validation Notes
- The new DDL file is the approved SQL setup path for the missing Supabase identity tables.
- REST/Auth TLS now validates successfully under Node by using the system CA store; TLS verification remains enabled.
- Service-role authentication passes without printing secret values.
- The direct database URL still fails TLS trust, which matches the known DEV DB URL issue.
- The validator intentionally keeps the direct DB failure as `FAIL` until REST/API identity table readiness is green.
- After running the DDL in Supabase SQL editor or another approved operator SQL path, rerun `npm run validate:supabase-dev`; expected result is identity table PASS and direct DB TLS WARN if the DB URL still fails.

## Changed Files
- `package.json`
- `scripts/validate-supabase-dev.mjs`
- `docs_build/database/ddl/account/supabase-identity-tables.sql`
- `docs_build/database/seed/account/supabase-dev-identity-bootstrap.md`
- `docs_build/dev/reports/PR_26166_155-supabase-identity-tables-bootstrap.md`

## Review Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
