# PR_26167_180-remove-sqlite-runtime-provider

## Summary
- Removed Local DB/SQLite from the supported product-data provider selection list.
- Forced `npm run dev:local-api` startup to use `supabase-postgres` for product data, even when an old `GAMEFOUNDRY_DB_PROVIDER=local-db` value is present.
- Removed Local DB product-data branches from server product-data assertions, persistence, Toolbox registry snapshots, and DB snapshot routing.
- Lazy-loaded the SQLite adapter only when legacy local adapter endpoints are invoked, so startup no longer imports or opens SQLite.

## Branch Validation
- PASS - Current branch was `main`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before PR work.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - Removed SQLite/local-db from active product-data provider selection; `SUPPORTED_DATABASE_PROVIDERS` now contains only `supabase-postgres`.
- PASS - Removed active product-data fallback paths that previously allowed Local DB to satisfy product-data reads/writes.
- PASS - `npm run dev:local-api` startup now reports `Local API product data provider: supabase-postgres` and explicitly ignores an old `local-db` product-data value.
- PASS - SQLite is no longer imported or opened during server startup; the legacy adapter loads only if legacy local adapter endpoints are invoked.
- PASS - Browser pages were not changed to branch by DEV/UAT/PROD.
- PASS - No silent fallback to SQLite/local-db remains for product-data routes.
- PASS - Historical Local DB route/adapter strings remain as deprecated technical debt for legacy admin/testing endpoints only; they no longer participate in active product-data provider selection.
- PASS - No secrets or `.env.local` files were changed or committed.

## Validation Lane Report
- PASS - `node --check scripts/start-local-api-server.mjs`
- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - Targeted provider/runtime test: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` (32 passed).
- INFO - Initial bare `node .\scripts\validate-supabase-dev.mjs` reached Supabase validation but failed local TLS trust before app-level checks (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `SELF_SIGNED_CERT_IN_CHAIN`).
- PASS - Required Supabase DEV validation using Windows system CA trust: `$env:NODE_OPTIONS='--use-system-ca'; node .\scripts\validate-supabase-dev.mjs` (overall PASS; direct PostgreSQL TLS remained WARN while REST/API identity readiness passed).
- PASS - `npm run dev:local-api` started on temporary port `5580` long enough to confirm startup selected `supabase-postgres`, ignored `local-db`, and emitted no SQLite startup warning.
- PASS - Static sanity scan confirmed removed Local DB product-data branch patterns no longer appear in the touched runtime/provider contract paths.
- PASS - `git diff --check`
- SKIPPED - Full samples smoke per request and because samples are not in scope.

## Manual Validation Notes
- Startup output included:
  - `Local API auth provider: supabase-auth.`
  - `Local API product data provider: supabase-postgres.`
  - `Local API ignored unsupported product data provider local-db; Supabase Postgres is required.`
- Startup stderr was empty after lazy-loading SQLite, confirming the server no longer imports SQLite during startup.
- Provider contract diagnostics now mark `GAMEFOUNDRY_DB_PROVIDER=local-db` as unsupported for product data rather than activating a Local DB product-data path.
- `/api/local-db/snapshot` remains a historical route name, but product-data snapshot routing now requires Supabase Postgres and fails visibly for unsupported database selections.

## Test Data Cleanup
- N/A - This PR did not create persistent validation records.

## Remaining Follow-Up Blockers
- None for this PR scope.
- Deprecated Local DB route names and legacy local adapter code remain for admin/testing compatibility and should be removed or quarantined by later cleanup PRs when those surfaces have replacement contracts.
