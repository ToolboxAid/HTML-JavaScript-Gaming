# PR_26166_135-site-setup-warning-cleanup

## Branch Validation

PASS - Current branch is `main`.

## Scope

PASS - Scoped to Site Setup warning cleanup. Supabase was not activated, no secrets were added, and no password tables were added.

## Site Setup Warning Cleanup Audit

| Item | Before PR135 | After PR135 | Evidence |
| --- | --- | --- | --- |
| Default role slugs | WARN: `creator` and `guest` missing | PASS | Local API fresh seed returned `roles=4`; Site Setup status returned `counts={"PASS":5}`. |
| Starter Platform Settings | SKIP: no active table | PASS | Added `platform_settings` schema/seed; Local API fresh seed returned `platform=1`. |
| Support Categories | SKIP: no active table | PASS | Added `support_categories` schema/seed; Local API fresh seed returned `support=1`. |
| Site Setup visible statuses | WARN/SKIP remained for implemented areas | PASS | Targeted Playwright validates refreshed Site Setup status is `PASS: Site Setup status checked 5 setup areas.` |

## Files Updated

- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/seed/server-seed-loader.mjs`
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `docs_build/database/ddl/admin.sql`
- `docs_build/database/ddl/support-tickets.sql`
- `docs_build/database/ddl/sqlite/local-db-schema-map.sql`
- `docs_build/database/dml/account.sql`
- `docs_build/database/dml/admin.sql`
- `docs_build/database/dml/support-tickets.sql`
- `docs_build/database/dml/DML_INDEX.md`
- `docs_build/database/seed/account.json`
- `docs_build/database/seed/admin.json`
- `docs_build/database/seed/support-tickets.json`

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS - Verified current branch is `main`.
- PASS - Started from `docs_build/dev/reports/pr134-db-migration-finish-line-audit.md`.
- PASS - Added default role slugs `creator` and `guest`.
- PASS - Added starter `platform_settings` table/setup ownership.
- PASS - Added `support_categories` table/setup ownership.
- PASS - Updated grouped DDL/DML/seed files under `docs_build/database/`.
- PASS - Site Setup reports PASS/WARN/SKIP/FAIL visibly; implemented areas now report PASS.
- PASS - No fallback behavior was added.
- PASS - No Supabase activation, secrets, or password tables were added.

## Validation Lane Report

- PASS - `node --check src/dev-runtime/persistence/mock-db-store.js`
- PASS - `node --check src/dev-runtime/seed/server-seed-loader.mjs`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - `git diff --check`
- PASS - Fresh Local API route smoke using disposable SQLite path:
  - `setup=PASS counts={"PASS":5} roles=4 platform=1 support=1`
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 13/13 tests.
- PASS - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs -g "Admin Site Setup"` passed 3/3 tests.
- PASS/WARN - Playwright V8 coverage report refreshed:
  - PASS `(92%) assets/theme-v2/js/admin-setup-actions.js`
  - PASS `(75%) src/engine/api/admin-setup-api-client.js`
  - WARN Node-side dev-runtime files are not collected by browser V8 coverage and are covered by Node/API tests.
- SKIP - Full samples smoke: samples are outside this Site Setup cleanup scope.

## Manual Validation Notes

- `docs_build/database/dml/account.sql` now expects all four default role slugs before static DEV user-role setup.
- `docs_build/database/seed/account.json` documents the same default role set.
- `platform_settings` and `support_categories` use server/API-generated non-user keys in active runtime seeding.
- Temporary disposable SQLite files created for validation were removed.
