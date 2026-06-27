# PR_26167_181-supabase-postgres-single-product-data-path

## Summary
- Removed active Local DB product-data fallback branches from Toolbox vote snapshot, vote write, vote ordering, metadata update, metadata reorder, registry snapshot, and DB snapshot server API paths.
- Routed the touched product-data API paths through the existing server API/service contract to Supabase Postgres only.
- Updated the Project Workspace Playwright harness to use a fake configured Supabase/Postgres service instead of forcing `local-db`, keeping validation hermetic and avoiding real Supabase writes.
- Added targeted regression coverage proving Local DB-selected Toolbox vote routes now fail visibly instead of serving local product data.

## Branch Validation
- PASS - Current branch was `main`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before PR work.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - Product data for the touched Toolbox vote, registry, snapshot, and repository API paths now routes through the server API/service contract to Supabase Postgres only.
- PASS - Configured connection values are used; no site behavior branching by DEV/UAT/PROD label was added.
- PASS - Users, roles, and user_roles continue to resolve through the Supabase/Postgres-backed service path via `currentSessionForRoute()` and the Supabase provider contract tests.
- PASS - Removed active Local DB product-data fallback branches from the touched product-data API paths; remaining Local DB helper code is legacy/admin/testing support and is not an active product-data provider path.
- PASS - No browser-owned product data, page-local product arrays, hidden defaults, or silent fallback were introduced.
- PASS - No secrets or `.env.local` files were changed or committed.

## Validation Lane Report
- PASS - `node --check scripts\start-local-api-server.mjs`
- PASS - `node --check src\dev-runtime\auth\provider-contract-stubs.mjs`
- PASS - `node --check src\dev-runtime\server\local-api-router.mjs`
- PASS - `node --check tests\dev-runtime\SupabaseProductDataCutover.test.mjs`
- PASS - `node --check tests\playwright\tools\RootToolsFutureState.spec.mjs`
- PASS - Targeted product-data/API test: `node --test tests\dev-runtime\SupabaseProductDataCutover.test.mjs` (4 passed).
- PASS - Targeted provider/API contract test: `node --test tests\dev-runtime\ProductDataProviderContractHardening.test.mjs` (3 passed).
- PASS - Targeted auth/session/provider test: `node --test tests\dev-runtime\SupabaseProviderContractStub.test.mjs` (32 passed).
- INFO - Initial bare `node .\scripts\validate-supabase-dev.mjs` reached validation but failed local Node TLS trust before app-level checks (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `SELF_SIGNED_CERT_IN_CHAIN`).
- PASS - Required Supabase DEV validation using Windows system CA trust: `$env:NODE_OPTIONS='--use-system-ca'; node .\scripts\validate-supabase-dev.mjs` (overall PASS; direct PostgreSQL TLS remained WARN while REST/API identity readiness passed).
- FAIL then PASS - `npm run test:workspace-v2` initially failed because the Project Workspace Playwright harness forced `GAMEFOUNDRY_DB_PROVIDER=local-db`; after changing the harness to fake configured Supabase/Postgres, the rerun passed (5 passed). The command name is legacy; user-facing language is Project Workspace.
- PASS - Static scan found no remaining `return this.toolboxVoteSnapshot()` or `Persisting Toolbox` Local DB vote write fallback in `src/dev-runtime/server/local-api-router.mjs`.
- PASS - Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`; server-side changed runtime JS is reported as advisory WARN because browser V8 coverage cannot collect Node server modules.
- PASS - `git diff --check`
- SKIPPED - Full samples smoke per request and because samples are not in scope.

## Manual Validation Notes
- `/api/toolbox/registry/snapshot` and Toolbox page rendering validated through the Project Workspace Playwright lane using the server API and fake Supabase/Postgres REST endpoints.
- `/api/toolbox/votes/snapshot` with `GAMEFOUNDRY_DB_PROVIDER=local-db` now returns a visible failure requiring Supabase Postgres instead of serving Local DB product data.
- Toolbox vote writes in targeted tests use server-owned keys and POST to Supabase-style `toolbox_votes`.
- Toolbox repository creation/persistence in targeted tests writes through Supabase-style product tables.

## Test Data Cleanup
- PASS - No persistent Supabase validation data was created.
- INFO - The Project Workspace Playwright lane used an in-memory fake Supabase/Postgres service and closed it after the run.
- INFO - Targeted product-data tests used in-memory fake Supabase/Postgres services and closed them after each test.

## Remaining Follow-Up Blockers
- None for this PR scope.
