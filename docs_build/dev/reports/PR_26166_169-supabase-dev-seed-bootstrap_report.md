# PR_26166_169-supabase-dev-seed-bootstrap

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before PR_169 execution.

## Scope Summary

PASS

- Validated the DEV seed/bootstrap contract that is already server-owned in this stack.
- Confirmed setup and reseed actions flow through server APIs, not browser-owned seed logic.
- Confirmed guest seed packages are read-only and not written into authoritative Local DB seed rows.
- Confirmed default roles, first admin, tool metadata bootstrap, platform settings, and support categories are covered by server-owned setup diagnostics.
- No product database cutover was introduced.
- No UAT or PROD resources were created.
- No `.env.local`, secrets, password tables, or browser-owned auth/provider logic were changed.

## Requirement Checklist

- PASS - Treat PR_169 as one separate BUILD unit.
- PASS - Main branch only; current branch was `main`.
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before work.
- PASS - DEV seed/bootstrap is routed through server-side APIs only.
- PASS - Guest read-only seed handling is present through `/api/guest/seed`.
- PASS - Default roles are included in server seed/status checks.
- PASS - First admin is included in server seed/status checks.
- PASS - Tool metadata bootstrap ownership is included in server seed/status checks.
- PASS - Starter platform settings and support category bootstrap are included in server setup diagnostics.
- PASS - Validation-only seed/test records were cleaned up before packaging.
- PASS - `npm run validate:supabase-dev` ran.
- PASS - Targeted seed/bootstrap Node validation ran.
- PASS - Targeted Admin Site Setup Playwright validation ran.
- PASS - `npm run test:workspace-v2` was skipped because no Project Workspace, toolState, runtime/API/session, or toolState behavior changed in PR_169. The command name is legacy; user-facing language remains Project Workspace.
- PASS - Full samples smoke was not run.

## Server API Seed/Bootstrap Coverage

- PASS - `/api/local-db/seed`: server-owned DEV Local DB reseed path.
- PASS - `/api/admin/setup/reseed`: admin-gated setup reseed path.
- PASS - `/api/admin/setup/status`: server-owned setup diagnostics.
- PASS - `/api/guest/seed`: read-only guest seed package path.
- PASS - `docs_build/database/seed/account.json`: default roles and DEV static user exception documented as server-side seed.
- PASS - `docs_build/database/seed/tool-metadata.json`: tool metadata bootstrap documented as server-side seed owned.
- PASS - `docs_build/database/seed/admin.json`: Admin Site Setup platform settings bootstrap documented as server-side seed owned.
- PASS - `docs_build/database/seed/support-tickets.json`: support categories documented as server-side seed owned.

## Validation Lane Report

Executed lanes:

- contract/static: `node --check src/dev-runtime/seed/server-seed-loader.mjs`
- contract/static: `node --check assets/theme-v2/js/admin-setup-actions.js`
- contract/static: `node --check src/engine/api/admin-setup-api-client.js`
- seed/runtime: `GAMEFOUNDRY_AUTH_PROVIDER=local-db GAMEFOUNDRY_DB_PROVIDER=local-db node --test tests/dev-runtime/DbSeedIntegrity.test.mjs`
- provider contract regression: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- Supabase DEV readiness: `npm run validate:supabase-dev`
- targeted Playwright Admin Site Setup: `GAMEFOUNDRY_AUTH_PROVIDER=local-db GAMEFOUNDRY_DB_PROVIDER=local-db npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --workers=1 --reporter=list -g "Admin Site Setup"`

Skipped lanes:

- Full samples smoke: SKIP by request and because samples were not in scope.
- Admin DB Viewer validation: SKIP for PR_169 because Admin DB Viewer behavior changes are reserved for PR_171.
- Product cutover validation: SKIP because no product table cutover occurs until PR_170.
- `npm run test:workspace-v2`: SKIP because no Project Workspace, toolState, runtime/API/session, or toolState behavior changed in PR_169.

## Validation Results

- PASS - `node --check src/dev-runtime/seed/server-seed-loader.mjs`
- PASS - `node --check assets/theme-v2/js/admin-setup-actions.js`
- PASS - `node --check src/engine/api/admin-setup-api-client.js`
- PASS - `GAMEFOUNDRY_AUTH_PROVIDER=local-db GAMEFOUNDRY_DB_PROVIDER=local-db node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` (2 tests passed)
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` (29 tests passed)
- PASS - `npm run validate:supabase-dev` overall PASS.
- WARN - Direct PostgreSQL TLS check reported `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed, so this remains advisory for DEV.
- PASS - Targeted Admin Site Setup Playwright lane (3 tests passed)

## Manual Validation Notes

- The seed integrity lane was intentionally run with explicit `GAMEFOUNDRY_AUTH_PROVIDER=local-db` and `GAMEFOUNDRY_DB_PROVIDER=local-db` because PR_169 validates Local DB seed/reseed while product cutover is still pending.
- A preliminary seed integrity run without explicit auth-provider selection failed because the default auth selector is Supabase Auth. The acceptance run used the required Local DB seed context and passed.
- Confirmed guest packages are read-only, have `writableByGuest=false`, and are exposed through `/api/guest/seed`.
- Confirmed authoritative guest seed records are not inserted into `tool_state_samples`; user-owned seed samples remain distinct and use runtime-generated keys.
- Confirmed no real Supabase validation records were written.

## Playwright V8 Coverage

- No PR_169 runtime JavaScript source changed.
- Existing coverage artifacts remain available at `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `docs_build/dev/reports/coverage_changed_js_guardrail.txt`.

## Required Artifacts

- `docs_build/dev/reports/PR_26166_169-supabase-dev-seed-bootstrap_report.md`
- `docs_build/dev/reports/PR_26166_169-supabase-dev-seed-bootstrap_cleanup_report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26166_169-supabase-dev-seed-bootstrap_delta.zip`
