# PR_26166_171-admin-db-viewer-provider-sources

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before PR_171 execution.

## Scope Summary

PASS

- Updated Admin DB Viewer to allow authenticated admin sessions under the selected DEV provider path instead of blocking non-Local-DB sessions.
- Added provider/source status labels to the DB Viewer diagnostics panel.
- Made the DB Viewer chrome, status text, empty-table messaging, filters, and table rendering reflect `supabase-postgres` snapshots when Supabase owns product data.
- Updated the Admin DB status panel to report the selected auth provider from `/api/providers/contract` while still verifying `/api/session/current`.
- Preserved existing Local DB visibility and Local DB tests during the transition.
- Kept required DB Viewer grouping order.
- Did not create UAT/PROD resources, `.env.local` changes, secrets, password tables, browser-owned provider logic, or silent fallback behavior.

## Requirement Checklist

- PASS - Treat PR_171 as one separate BUILD unit.
- PASS - Main branch only; current branch was `main`.
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before work.
- PASS - Admin DB Viewer shows provider/source labels.
- PASS - Admin DB Viewer shows Supabase-backed identity and product tables when `GAMEFOUNDRY_DB_PROVIDER=supabase-postgres`.
- PASS - DEV visibility is preserved during transition; Local DB viewer behavior still passes existing coverage.
- PASS - Required grouping order is preserved: All, Asset, Controls, Game Configuration, Game Design, Game Journey, Game Workspace, Objects, Palette, Tags, Tool Metadata, Tool Planning, Tool State Samples, Toolbox Votes, User Roles, Platform Settings, Support Categories.
- PASS - `/api/session/current` remains the authenticated session probe and provider selection is read through the server provider contract.
- PASS - Supabase validation data for DB Viewer was in-process fake Supabase data and was discarded when the fake server closed.
- PASS - Live DEV auth-test-user cleanup found zero candidate/deleted test records.
- PASS - `npm run validate:supabase-dev` ran and passed with one advisory DEV TLS warning.
- PASS - Targeted Admin DB Viewer Playwright validation ran.
- PASS - Targeted auth/session validation ran.
- PASS - `npm run test:workspace-v2` ran and passed because shared runtime/session API behavior changed; command name is legacy and user-facing language is Project Workspace.
- PASS - Full samples smoke was not run.

## Runtime/UI Changes

- `admin/db-viewer.html`
  - Added Data provider and Data source diagnostics fields.
- `admin/db-viewer.js`
  - Changed DB Viewer access from Local-DB-mode-only to authenticated-admin-session access so Supabase-backed DEV admins can inspect the viewer.
- `assets/theme-v2/js/admin-db-status-panel.js`
  - Keeps `/api/session/current` as the API health check.
  - Reads `/api/providers/contract` to label the selected auth provider, showing `supabase-auth (Supabase Auth)` under Supabase and preserving `local-db (Local DB)` locally.
- `src/engine/api/local-db-viewer-ui.js`
  - Reads snapshot provider/source metadata and updates page title, heading, filter/table aria labels, status text, and empty-table messaging.
  - Displays `supabase-postgres (Supabase Postgres)` and `Supabase product DB` for Supabase snapshots.
- `src/dev-runtime/server/local-api-router.mjs`
  - Ensures current session reads respect selected Local DB vs Supabase Auth provider paths.
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
  - Adds fake Supabase Auth/PostgREST validation for provider/source labels, Supabase-backed tables, grouping order, and no page failures.

## Validation Lane Report

Executed lanes:

- branch/instructions:
  - `git branch --show-current`
  - read `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- static/runtime syntax:
  - `node --check assets/theme-v2/js/admin-db-status-panel.js`
  - `node --check admin/db-viewer.js`
  - `node --check src/engine/api/local-db-viewer-ui.js`
  - `node --check src/dev-runtime/server/local-api-router.mjs`
  - `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- Admin DB Viewer Playwright:
  - `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --project=playwright --workers=1 --reporter=list -g "Admin DB Viewer shows current read-only Local DB tables, filters|Admin DB Viewer labels Supabase provider/source"`
- Supabase DEV readiness:
  - `npm run validate:supabase-dev`
- targeted auth/session:
  - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list`
  - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- Project Workspace legacy lane:
  - `npm run test:workspace-v2`
- cleanup:
  - `npm run cleanup:supabase-dev-auth-test-users`

Skipped lanes:

- Full samples smoke: SKIP by request and because samples were not in scope.
- Broad product-area Playwright suite: SKIP because PR_171 only changes Admin DB Viewer labeling/visibility and shared session/provider diagnostics; product data cutover behavior was validated in PR_170.
- UAT/PROD validation: SKIP by request; no UAT/PROD resources were created.

## Validation Results

- PASS - Syntax checks listed above.
- PASS - Full Admin DB Viewer Playwright file: 8 tests passed.
- PASS - Final Admin DB Viewer coverage subset: 2 tests passed.
- PASS - `npm run validate:supabase-dev`.
- WARN - `npm run validate:supabase-dev` direct PostgreSQL TLS check reported `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed, so this remains advisory for DEV.
- PASS - `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs --project=playwright --workers=1 --reporter=list` (1 test passed).
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` (30 tests passed).
- PASS - `npm run test:workspace-v2` (5 Project Workspace legacy-lane tests passed).
- PASS - `npm run cleanup:supabase-dev-auth-test-users`: 0 candidate test records, 0 deleted records, 12 non-test identity records skipped.

## Manual Validation Notes

- Admin DB Viewer Local DB path still shows:
  - heading `Local DB`
  - server/provider labels `local-db (Local DB)`
  - source label `Local DB`
  - current users, roles, user_roles, product tables, filters, and diagnostics.
- Admin DB Viewer Supabase path was manually validated through the targeted Playwright fake Supabase flow:
  - signed in through `/api/auth/sign-in` with Supabase Auth selected
  - loaded `/admin/db-viewer.html`
  - saw heading `Supabase Postgres`
  - saw auth provider `supabase-auth (Supabase Auth)`
  - saw data provider `supabase-postgres (Supabase Postgres)`
  - saw data source `Supabase product DB`
  - saw Supabase-backed `users`, `roles`, `user_roles`, `toolbox_tool_metadata`, `toolbox_tool_planning`, and `toolbox_votes` table behavior.
- The required grouping order was validated in the browser.
- The User Roles filter was validated to show `users`, `user_roles`, and `roles` in that order.
- No DB Viewer validation records were written to live Supabase; fake validation records were discarded with the test server.
- `.env.local` was read by validation scripts only and was not modified or committed.

## Playwright V8 Coverage

- Updated coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Covered changed browser runtime JS:
  - `(67%) admin/db-viewer.js`
  - `(86%) src/engine/api/local-db-viewer-ui.js`
  - `(100%) assets/theme-v2/js/admin-db-status-panel.js`
- Server-side runtime JS is listed as advisory WARN because browser V8 coverage does not collect Node/server modules:
  - `(0%) src/dev-runtime/server/local-api-router.mjs`

## Required Artifacts

- `docs_build/dev/reports/PR_26166_171-admin-db-viewer-provider-sources_report.md`
- `docs_build/dev/reports/PR_26166_171-admin-db-viewer-provider-sources_cleanup_report.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26166_171-admin-db-viewer-provider-sources_delta.zip`
