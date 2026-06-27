# PR_26166_170-dev-product-data-cutover

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before PR_170 execution.

## Scope Summary

PASS

- Cut DEV product data selection to `supabase-postgres` by default while keeping explicit Local DB compatibility for targeted tests and legacy local lanes.
- Added server-side Supabase product table read/upsert contracts and routed product snapshots, Toolbox registry metadata/planning, Toolbox votes, and toolbox repository opening through the selected product provider.
- Kept browser product data behind API/service contracts; browser code does not own product metadata or silently synthesize product datasets.
- Added DEV-only DDL apply helper for already-reviewed DDL files so the live DEV Supabase schema can be prepared without printing secrets.
- Preserved Supabase Auth as the default auth provider and Supabase Postgres as the default DEV product database provider.
- Did not touch UAT/PROD resources, `.env.local`, secrets, password tables, or browser-owned auth/provider logic.

## Requirement Checklist

- PASS - Treat PR_170 as one separate BUILD unit.
- PASS - Main branch only; current branch was `main`.
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before work.
- PASS - DEV product data defaults now select `GAMEFOUNDRY_DB_PROVIDER=supabase-postgres`.
- PASS - Supabase-backed provider contracts serve product table reads and writes.
- PASS - Server/API owns product key generation through `SupabasePostgresProviderAdapter.createRecordKey()` and `upsertProductTable(s)`.
- PASS - No browser-owned product data path was introduced; the Toolbox registry browser client still fails visibly when the API snapshot is missing.
- PASS - No silent fallback to Local DB occurs when Supabase Postgres is selected but not configured.
- PASS - Runtime-generated product keys use ULIDs; static ULID exceptions remain limited to approved DEV users and user-role references.
- PASS - Product DDL was applied to the DEV Supabase database only.
- PASS - Codex-created validation records were cleaned before packaging; cleanup found zero candidate DEV test records.
- PASS - `npm run validate:supabase-dev` ran and passed with one advisory DEV TLS warning.
- PASS - Targeted provider/API validation ran.
- PASS - Targeted auth/session Playwright validation ran because the default provider pairing changed.
- PASS - `npm run test:workspace-v2` ran and passed; command name is legacy and user-facing language is Project Workspace.
- PASS - Full samples smoke was not run.

## Runtime/API Changes

- `src/dev-runtime/auth/provider-contract-stubs.mjs`
  - Default database provider changed to `supabase-postgres`.
  - Added Supabase product table allowlist and adapter operations for `getProductTableRows`, `getProductTables`, `upsertProductTable`, and `upsertProductTables`.
  - Made identity initialization idempotent for existing `roles.roleSlug` and existing `user_roles(userKey, roleKey)` rows.
- `src/dev-runtime/server/local-api-router.mjs`
  - Added provider-aware Supabase product table snapshot/read/write helpers.
  - Routed Toolbox metadata/planning/vote snapshots and writes through Supabase Postgres when selected.
  - Allowed toolbox repositories to open under the selected product provider instead of asserting the Local DB adapter.
  - Kept `/api/local-db/snapshot` as a compatibility route while returning `source: supabase-postgres` when Supabase Postgres owns data.
- `scripts/start-local-api-server.mjs`
  - Defaults DEV local API product data to `supabase-postgres` when no database provider is explicitly selected.
- `scripts/apply-supabase-dev-ddl.mjs`
  - Applies grouped DEV Supabase DDL files and service-role REST grants without printing secrets.

## Validation Lane Report

Executed lanes:

- static/runtime syntax:
  - `node --check src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check scripts/start-local-api-server.mjs`
  - `node --check scripts/apply-supabase-dev-ddl.mjs`
  - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - `node --check tests/dev-runtime/SupabaseProductDataCutover.test.mjs`
  - `node --check tests/helpers/playwrightRepoServer.mjs`
  - `node --check tests/playwright/account/SupabaseSignInSession.spec.mjs`
  - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- contract/provider API:
  - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs tests/dev-runtime/SupabaseProductDataCutover.test.mjs tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- Supabase DEV readiness:
  - `npm run validate:supabase-dev`
- DEV schema setup:
  - `node --use-system-ca ./scripts/apply-supabase-dev-ddl.mjs`
- live DEV local API:
  - `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth GAMEFOUNDRY_DB_PROVIDER=supabase-postgres npm run dev:local-api`
  - Probed `/api/providers/contract`, `/api/auth/status`, `/api/toolbox/registry/snapshot`, `/api/local-db/snapshot`, and `POST /api/toolbox/game-workspace/repositories`.
- targeted auth/session Playwright:
  - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --workers=1 --reporter=list -g "Configured account auth actions|Account auth actions show actionable identity setup failures|Create Account shows generic provider failure"`
- Project Workspace legacy lane:
  - `npm run test:workspace-v2`
- cleanup:
  - `npm run cleanup:supabase-dev-auth-test-users`

Skipped lanes:

- Full samples smoke: SKIP by request and because samples were not in scope.
- Admin DB Viewer validation: SKIP for PR_170 because Admin DB Viewer provider-source UI changes are reserved for PR_171.
- Broad product-area Playwright suite: SKIP because product cutover was validated through targeted provider/API tests and live API probes; no tool UI implementation changed beyond API-backed data behavior.

## Validation Results

- PASS - Syntax checks listed above.
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs tests/dev-runtime/SupabaseProductDataCutover.test.mjs tests/dev-runtime/ProductDataProviderContractHardening.test.mjs` (36 tests passed).
- PASS - `npm run validate:supabase-dev`.
- WARN - `npm run validate:supabase-dev` direct PostgreSQL TLS check reported `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed, so this remains advisory for DEV.
- PASS - `node --use-system-ca ./scripts/apply-supabase-dev-ddl.mjs` applied 15 grouped DDL files, service-role REST grants, and PostgREST schema reload.
- PASS - Live `/api/providers/contract`: `authProviderId=supabase-auth`, `databaseProviderId=supabase-postgres`.
- PASS - Live `/api/auth/status`: ready, Supabase Auth selected, Supabase Postgres selected.
- PASS - Live `/api/toolbox/registry/snapshot`: `providerId=supabase-postgres`, `source=supabase-postgres`, 45 active tools.
- PASS - Live `/api/local-db/snapshot`: compatibility route returned `source=supabase-postgres`; `toolbox_tool_metadata=45`, `toolbox_tool_planning=45`, product tables readable.
- PASS - Live `POST /api/toolbox/game-workspace/repositories`: returned `game-workspace-1` without requiring Local DB.
- PASS - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list` (1 test passed).
- PASS - Targeted `LoginSessionMode` Supabase Auth subset (3 tests passed).
- PASS - `npm run test:workspace-v2` (5 Project Workspace legacy-lane tests passed).
- PASS - `npm run cleanup:supabase-dev-auth-test-users`: 0 candidate test records, 0 deleted records, 12 non-test identity records skipped.

## Manual Validation Notes

- The DEV local API was run with explicit `GAMEFOUNDRY_AUTH_PROVIDER=supabase-auth` and `GAMEFOUNDRY_DB_PROVIDER=supabase-postgres`.
- `.env.local` was loaded by the local API and DDL/validation scripts, but `.env.local` was not modified or committed and secrets were not printed.
- The first live DEV identity seed attempt failed with a duplicate `roles.roleSlug` conflict. The adapter was fixed to reuse existing role and user-role keys before upsert; the retry passed.
- The successful DEV identity setup wrote/upserted the four approved static DEV users, four default roles, and five user-role assignments. Those rows are required DEV seed/bootstrap records, not validation-only records.
- The live Toolbox registry probe bootstrapped/confirmed 45 `toolbox_tool_metadata` rows and 45 `toolbox_tool_planning` rows in Supabase Postgres. These rows are required DEV product bootstrap records, not validation-only records.
- The live game-workspace repository probe only opened a server repository and returned an in-memory repository id; it did not call a repository method that persists new product records.
- `tool_state_samples` remains visible as an empty compatibility schema row in the snapshot response, but it is not part of the Supabase product table allowlist and was not queried from Supabase.

## Playwright V8 Coverage

- Updated coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Covered changed browser runtime JS:
  - `(90%) toolbox/tool-registry-api-client.js`
- Server-side runtime JS is listed as advisory WARN because browser V8 coverage does not collect Node/server modules:
  - `(0%) src/dev-runtime/auth/provider-contract-stubs.mjs`
  - `(0%) src/dev-runtime/server/local-api-router.mjs`

## Required Artifacts

- `docs_build/dev/reports/PR_26166_170-dev-product-data-cutover_report.md`
- `docs_build/dev/reports/PR_26166_170-dev-product-data-cutover_cleanup_report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26166_170-dev-product-data-cutover_delta.zip`
