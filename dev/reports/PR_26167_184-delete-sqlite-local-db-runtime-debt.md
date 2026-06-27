# PR_26167_184-delete-sqlite-local-db-runtime-debt

## Summary

Removed active SQLite/Local DB runtime debt from the local API startup/router path. The local API no longer imports or opens `node:sqlite`, no longer sets or reads provider-selection environment variables, and now reports configured account/product-data connections at startup.

Legacy `/api/local-db`, `/api/mock-db`, `/api/admin/setup/reseed`, and `/api/dev/testing/mock-db-state` paths now fail visibly with `410` deprecated endpoint responses. Product data snapshots use `/api/product-data/snapshot`.

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before execution.

## Requirement Checklist

- PASS - Removed active SQLite runtime code from `src/dev-runtime/server/local-api-router.mjs`; no `node:sqlite`, `DatabaseSync`, `createRequire`, or `LocalDbAdapter` remains there.
- PASS - `/api/local-db` and `/api/mock-db` no longer serve active data routes; they return visible `410` deprecated endpoint responses.
- PASS - `/api/admin/setup/reseed` and `/api/dev/testing/mock-db-state` no longer mutate Local DB/mock DB state; they return visible `410` deprecated endpoint responses.
- PASS - Product data snapshot access moved to `/api/product-data/snapshot`.
- PASS - `scripts/start-local-api-server.mjs` no longer sets `GAMEFOUNDRY_AUTH_PROVIDER` or `GAMEFOUNDRY_DB_PROVIDER`.
- PASS - Runtime contract creation no longer reads provider selector environment variables.
- PASS - Startup output uses account/product-data connection wording.
- PASS - `.env.example` describes configured connections, not DEV providers.
- PASS - Account browser/page scan found no DEV/UAT/PROD/Local/SQLite/Supabase/provider implementation wording in affected account files.
- PASS - No silent fallback was added; missing configuration and deprecated endpoints fail visibly.
- PASS - No UAT/PROD resources were touched.
- PASS - No secrets or `.env.local` content were committed.

## Validation Lane Report

- PASS - `node --check scripts/start-local-api-server.mjs`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
- PASS - `node --check scripts/validate-browser-env-agnostic.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProductDataCutover.test.mjs`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --check tests/helpers/playwrightRepoServer.mjs`
- PASS - `node --check tests/playwright/account/SupabaseSignInSession.spec.mjs`
- PASS - `node --test tests/dev-runtime/SupabaseProductDataCutover.test.mjs`
- PASS - `node --test --test-name-pattern "provider contract does not require|Supabase stubs fail visibly|Fixed Supabase providers keep diagnostics|Missing Supabase config fails safely|selected path reads users|Unsupported provider selector" tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- WARN - Initial full-file `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` attempt timed out; reran the PR-impacted auth/API subset above and it passed.
- PASS - `npm run validate:supabase-dev`; direct PostgreSQL TLS remains an advisory DEV warning while REST/API identity checks passed.
- PASS - `npm run dev:local-api` startup capture confirmed no SQLite warning, no Local DB provider selection, no selector env output, and connection status lines were present.
- PASS - `npm run validate:browser-env-agnostic`
- PASS - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --config=playwright.config.cjs`
- PASS - `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs --config=playwright.config.cjs`
- PASS - `npm run test:workspace-v2` passed, 5 tests. Command name is legacy; user-facing language is Project Workspace.
- SKIP - Full samples smoke was not run because samples were not in scope.

## Manual Validation Notes

- Confirmed `npm run dev:local-api` printed only connection status:
  - `Local API account connection: configured.`
  - `Local API product data connection: configured.`
- Confirmed startup output did not contain `SQLite`, `GAMEFOUNDRY_AUTH_PROVIDER`, `GAMEFOUNDRY_DB_PROVIDER`, `auth provider`, or `product data provider`.
- Confirmed static route audit found no selector env variables or SQLite startup/opening symbols in the local API router, startup script, auth contract stub, or `.env.example`.
- Confirmed `/api/local-db` and `/api/mock-db` are present only as deprecated endpoint guards returning `410`.

## Test Data Cleanup

No persistent Supabase validation records were created for this PR. Playwright auth validation used an in-memory fake Supabase server and closed it after validation.

## Playwright V8 Coverage

Generated `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.

- WARN - Changed server-side runtime JS files are not collected by browser V8 coverage; advisory only.
- WARN - Coverage guardrail lists missing changed runtime JS coverage as advisory WARN, not FAIL.
