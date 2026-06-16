# PR_26166_167-product-data-provider-contract-hardening

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before PR_167 execution.

## Scope Summary

PASS

- Hardened the browser Toolbox registry client so product metadata must resolve through `/api/toolbox/registry/snapshot`.
- Removed the silent empty browser-owned registry fallback from `toolbox/tool-registry-api-client.js`.
- Kept the static missing-image path as display fallback only; it no longer carries product registry data.
- Added contract coverage for API-backed browser product-data entrypoints.
- No product table cutover was introduced.
- No Supabase product tables, UAT resources, PROD resources, `.env.local`, secrets, password tables, or browser-owned auth/provider logic were changed.

## Requirement Checklist

- PASS - Treat PR_167 as one separate BUILD unit.
- PASS - Main branch only; current branch was `main`.
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before work.
- PASS - Harden product-data provider contracts before cutover.
- PASS - Ensure browser pages use API/service contracts only.
- PASS - Identify and fix browser-owned product data paths: fixed the Toolbox registry API client's synthesized empty registry fallback.
- PASS - No product table cutover was introduced.
- PASS - Product data remains Local DB for this PR.
- PASS - No silent fallback remains in the Toolbox registry client when the API contract is unavailable.
- PASS - `npm run validate:supabase-dev` was skipped because PR_167 does not touch Supabase setup or Supabase data.
- PASS - Targeted provider/API validation ran.
- PASS - Targeted Playwright validation ran.
- PASS - `npm run test:workspace-v2` ran because runtime/tool registry behavior changed. The command name is legacy; user-facing language remains Project Workspace.
- PASS - No Supabase validation data was written, so no Supabase cleanup report is required.
- PASS - Playwright impacted: yes.
- PASS - Full samples smoke was not run.

## Product-Data Contract Findings

PASS

- Finding fixed: `toolbox/tool-registry-api-client.js` previously caught registry API failures and synthesized `{ activeTools: [], tools: [] }` in the browser. That made the browser own product metadata fallback state and could hide a broken API contract.
- Fix: registry reads now fail visibly with the server API diagnostic until `/api/toolbox/registry/snapshot` succeeds.
- Fix: a failed read is retryable, so transient route timing does not permanently freeze the diagnostic.
- Preserved behavior: `getToolImageSource()` may still return `/assets/theme-v2/images/image-missing.svg` when a tool lacks an image field; that is a display asset fallback, not a product-data registry fallback.

## Validation Lane Report

Executed lanes:

- contract/runtime: `node --check toolbox/tool-registry-api-client.js`
- contract/runtime: `node --check tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- contract/runtime: `node --test tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- provider contract regression: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- targeted Playwright provider/API: `GAMEFOUNDRY_AUTH_PROVIDER=local-db GAMEFOUNDRY_DB_PROVIDER=local-db npx playwright test tests/playwright/tools/ToolImageRegistry.spec.mjs tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs --project=playwright --workers=1 --reporter=list`
- Project Workspace legacy lane: `GAMEFOUNDRY_AUTH_PROVIDER=local-db GAMEFOUNDRY_DB_PROVIDER=local-db npm run test:workspace-v2`

Skipped lanes:

- `npm run validate:supabase-dev`: SKIP because this PR does not touch Supabase configuration, Supabase Auth, Supabase DDL, or Supabase data.
- Full samples smoke: SKIP by request and because samples were not in scope.
- Admin DB Viewer validation: SKIP because Admin DB Viewer behavior is not changed in PR_167.
- Product cutover validation: SKIP because no product table cutover occurs until PR_170.

## Validation Results

- PASS - `node --check toolbox/tool-registry-api-client.js`
- PASS - `node --check tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- PASS - `node --test tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` (3 tests passed)
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` (29 tests passed)
- PASS - Targeted Playwright provider/API lane (9 tests passed)
- PASS - `npm run test:workspace-v2` (5 tests passed)

## Manual Validation Notes

- Captured Admin Tool Votes diagnostics during the first targeted run and confirmed the zero-row page state was caused by an auth-provider selector mismatch, not product metadata rendering.
- Reran the impacted browser lane with explicit `GAMEFOUNDRY_AUTH_PROVIDER=local-db` and `GAMEFOUNDRY_DB_PROVIDER=local-db`, matching PR_167's pre-cutover Local DB product-data scope.
- Verified Admin Tool Votes and Toolbox index render from API snapshots and do not request the retired browser registry module.
- Validation wrote no Supabase records. Playwright-created local DB state used per-run temp SQLite files and was cleaned up when each test server closed.

## Playwright V8 Coverage

- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Guardrail: `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- PR_167 changed runtime JS: `toolbox/tool-registry-api-client.js`
- Coverage evidence: `(90%) toolbox/tool-registry-api-client.js - executed lines 155/155; executed functions 26/29`
- Advisory note: because the PR stack is still uncommitted locally, the coverage report also lists changed runtime JS from earlier stacked PRs as warnings.

## Required Artifacts

- `docs_build/dev/reports/PR_26166_167-product-data-provider-contract-hardening_report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `tmp/PR_26166_167-product-data-provider-contract-hardening_delta.zip`
