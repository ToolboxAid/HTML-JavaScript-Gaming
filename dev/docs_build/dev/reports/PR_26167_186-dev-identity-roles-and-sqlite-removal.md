# PR_26167_186-dev-identity-roles-and-sqlite-removal

## Branch Validation
- PASS - Current branch is `main`.
- PASS - `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before changes.

## Requirement Checklist
- PASS - User 1 has `creator` only.
- PASS - User 2 has `creator` only.
- PASS - User 3 has `creator` only.
- PASS - DavidQ has `admin` and `creator`.
- PASS - No other seeded DEV user has `admin`; final sync reported `nonDavidqAdminAssignments: []`.
- PASS - DavidQ email is `qbytes.dq@gmail.com`; password was updated through the server-side Supabase admin path. Password value omitted from reports.
- PASS - User 1-3 passwords were updated to Supabase-valid values preserving the requested pattern as closely as allowed. Password values omitted from reports.
- PASS - `codex-*` and `qbytes.dq1` through `qbytes.dq4` DEV accounts were deleted from Supabase Auth/public users during the first live PR186 sync.
- PASS - Auth users and `public.users` are synced by `authProviderUserId`; final evidence shows all four canonical identities synced.
- PASS - `docs_build/database/ddl/sqlite/local-db-schema-map.sql` was removed.
- PASS - Obsolete active SQLite/local-db/mock-db browser wrappers and active API routes were removed or neutralized.
- PASS - Active `node:sqlite` usage remains absent.
- PASS - Browser/page UI now uses configured connection/service-contract wording; account/admin active pages no longer expose Local DB/SQLite/provider/deployment labels.
- PASS - No DEV/UAT/PROD branching was introduced.
- PASS - No silent fallback was added.
- PASS - No `.env.local` or secrets were changed or committed.

## Identity Counts
Initial live PR186 sync:
- Auth users: 12 before, 4 after.
- `public.users`: 12 before, 4 after.
- Canonical Auth users: 2 before, 4 after.
- Canonical `public.users`: 3 before, 4 after.
- Managed extra Auth users: 10 before, 0 after.
- Managed extra `public.users`: 8 before, 0 after.

Final verification sync:
- Auth users: 4 before, 4 after.
- `public.users`: 4 before, 4 after.
- Canonical Auth users: 4 before, 4 after.
- Canonical `public.users`: 4 before, 4 after.
- Managed extra Auth users: 0 before, 0 after.
- Managed extra `public.users`: 0 before, 0 after.

## Role Evidence
- PASS - User 1 creator.
- PASS - User 2 creator.
- PASS - User 3 creator.
- PASS - DavidQ creator.
- PASS - DavidQ admin.
- PASS - Required roles active: `admin`, `creator`, `guest`.
- PASS - Legacy `user` role remains deprecated/inactive.

## Deleted DEV Accounts
Deleted during the first live PR186 sync:
- `codex-pr162-1781561056924-35f5412b0f339@example.com`
- `codex-pr162-1781561106580-fe3f2462707fc@example.com`
- `codex-pr163-repeat-1781562780241-ccbc9d07d9f97@example.com`
- `codex-pr163-success-1781562780241-ccbc9d07d9f97@example.com`
- `qbytes.dq1@gmail.com`
- `qbytes.dq2@gmail.com`
- `qbytes.dq3@gmail.com`
- `qbytes.dq4@gmail.com`
- `codex-pr156-missing-identity-1781555713293-c32794@example.test`
- `codex-pr156-admin-probe-1781554902135-23gra6@example.com`

Final verification sync deleted records: none.

## Auth/Public Sync Evidence
Final live sync evidence:
- `user1@example.invalid` - Auth present, `public.users` key `01K2GFSJ0Y0000000000000051`, synced PASS.
- `user2@example.invalid` - Auth present, `public.users` key `01K2GFSJ0Y0000000000000052`, synced PASS.
- `user3@example.invalid` - Auth present, `public.users` key `01K2GFSJ0Y0000000000000053`, synced PASS.
- `qbytes.dq@gmail.com` - Auth present, `public.users` key `01K2GFSJ0Y0000000000000054`, synced PASS.

## SQLite/Mock-DB Removal Evidence
- PASS - `docs_build/database/ddl/sqlite/local-db-schema-map.sql` no longer exists.
- PASS - Runtime-only search found no active `node:sqlite`, `DatabaseSync`, `sqlite3`, or `better-sqlite` usage in `src`/`scripts`.
- PASS - `src/dev-runtime/server/local-api-router.mjs` no longer contains active `/api/local-db`, `/api/mock-db`, or `/api/dev/testing/mock-db-state` branches.
- PASS - Browser DB Viewer now reads `/api/product-data/snapshot` through `src/engine/api/db-viewer-api-client.js`.
- PASS - Deleted obsolete browser wrappers: `src/engine/api/local-db-api-client.js`, `src/engine/api/local-db-viewer-ui.js`, `src/engine/api/mock-db-api-client.js`, and `src/engine/api/mock-db-viewer-ui.js`.
- PASS - Admin identity page data moved from `assets/theme-v2/js/local-db-page-data.js` to `assets/theme-v2/js/admin-service-page-data.js`.
- PASS - `npm run validate:browser-env-agnostic` reports no deprecated SQLite/Local DB technical debt.

## Validation Lane Report
- PASS - `node --check` for 20 changed JS/MJS files.
- PASS - `npm run validate:supabase-dev`; advisory warning only for direct PostgreSQL TLS chain, with REST/API identity readiness passing.
- PASS - Live DEV identity sync: `node --use-system-ca .\scripts\sync-supabase-dev-creator-identities.mjs --json`.
- PASS - `npm run dev:local-api` startup check via `/api/auth/status` HTTP 200; stdout showed configured account/product-data connections and no SQLite/local-db/mock-db/provider-selection wording.
- PASS - `npm run validate:browser-env-agnostic`.
- PASS - Focused Node runtime/product tests: `SupabaseDevCreatorIdentitySeedSync`, `SupabaseProductDataCutover`, `DevRuntimeBoundary`.
- PASS - Targeted auth/provider Node cases in `SupabaseProviderContractStub.test.mjs`.
- PASS - Targeted account/auth Playwright: `tests/playwright/account/SupabaseSignInSession.spec.mjs`.
- PASS - Project Workspace legacy command: `npm run test:workspace-v2`.
- NOT RUN - Full samples smoke, per instruction.

## Manual Validation Notes
- Local API startup was manually checked on `http://127.0.0.1:55186/account/sign-in.html` with `/api/auth/status` returning HTTP 200.
- Startup stdout used configured connection wording only.
- Final live identity sync left exactly the four intended DEV identities.
- No `.env.local` changes were made.
- No `tmp/*.log` files remain.

## Coverage
- Playwright V8 coverage report was regenerated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
