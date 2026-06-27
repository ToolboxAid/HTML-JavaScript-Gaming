# PR_26164_101-db-auth-foundation-fixes

## Branch

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Uploaded PR Review Summary

- `database.zip`: WARN. Searched `C:\Users\davidq\.codex\attachments` and the repo tree; no `database.zip` was available in the current workspace/attachments.
- Reviewed current PR reports:
  - `docs_build/dev/reports/pr097-admin-account-local-db-migration.md`
  - `docs_build/dev/reports/pr098-toolbox-local-db-migration.md`
  - `docs_build/dev/reports/pr099-site-setup-foundation.md`
  - `docs_build/dev/reports/pr100-auth-contract-foundation.md`

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read project instructions before execution | PASS | `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before edits. |
| Verify branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Scope to PR097-PR100 cleanup/fixes | PASS | Changes are limited to DB artifacts, sign-in reseed removal, admin reseed ownership, guest seed cleanup, DB Viewer order, and targeted tests/reports. |
| Do not introduce Supabase, MEM DB, `login.html`, fake-login, password storage, UAT/PROD behavior | PASS | Search found no Supabase/fake-login/MEM DB/login.html additions. `admin/controls.html` has a UI password textbox only, not a password storage table. |
| DDL under `docs_build/database/ddl/` grouped by product/tool | PASS | Required 15 grouped `.sql` files exist. Old `dev-app-identity-schema.sql` removed. |
| DML under `docs_build/database/dml/` grouped by product/tool | PASS | Required 15 grouped `.sql` files exist. Old `dev-app-identity-temporary-setup-review.sql` removed. |
| Seed under `docs_build/database/seed/` grouped by product/tool | PASS | Required 15 grouped `.json` files exist. |
| Guest seed under `docs_build/database/seed/guest/` | PASS | Required 9 grouped guest seed JSON files exist and include read-only sample package metadata. |
| Account tables in account files | PASS | `account.sql` contains `users`, `roles`, `user_roles`; `account.json` groups account seed rows. |
| Tool metadata/planning/votes separate | PASS | `tool-metadata`, `tool-planning`, and `toolbox-votes` files exist separately under DDL/DML/seed. |
| Runtime setup calls server-side APIs | PASS | Sign-in reseed removed. Admin surfaces call `/api/admin/setup/reseed` through `src/engine/api/admin-setup-api-client.js`. |
| Admin reseed is admin-gated | PASS | `LocalDevMockDataSource.adminReseed()` rejects non-admin sessions. |
| Reseed status is visible PASS/FAIL/WARN/SKIP | PASS | `assets/theme-v2/js/admin-setup-actions.js` renders `WARN` while running and `PASS`/`FAIL`; initial page status is `SKIP`. |
| Guest seed not stored in `tool_state_samples` active runtime data | PASS | Fresh and legacy-loaded Local DB snapshots filter guest rows; evidence probe showed `guestRuntimeCount: 0`. |
| Guest seed path visible/read-only | PASS | `/api/guest/seed` returns `readOnly: true`, `source: docs_build/database/seed/guest/`, and 9 packages. |
| Guest users never save into guest seed data | PASS | Guest seed endpoint is read-only; scoped guest write controls remain disabled/no active save action in affected PR097-PR100 surfaces. Guest seed package metadata includes `signInRedirect: account/sign-in.html`. |
| Move reseed out of sign-in | PASS | `account/sign-in.html` no longer contains `data-login-reseed-*`; `login-session.js` no longer imports or calls `seedMockDb`. |
| Add admin reseed entry points to Site Setup and DB Viewer | PASS | `admin/site-setup.html` and `admin/db-viewer.html` include `data-admin-setup-reseed`. |
| My Stuff setup entry | PASS/WARN | Not added. Existing My Stuff surface does not currently own user/account maintenance setup; documented as follow-up instead of inventing a page. |
| DB Viewer button order | PASS | Evidence: `All`, `Asset`, `Controls`, `Game Configuration`, `Game Design`, `Game Journey`, `Game Workspace`, `Objects`, `Palette`, `Tags`, `Tool Metadata`, `Tool Planning`, `Tool State Samples`, `Toolbox Votes`, `User Roles`. |
| No browser storage as product-data source of truth | PASS | No new browser storage product-data source added. Existing Local DB/server adapter remains the source. |
| Auth contract still uses current sign-in route | PASS | Tests verify current sign-in route and no `/login.html` route reintroduction. |

## Search Evidence

- `database.zip`: no results under attachments or repo.
- Sign-in reseed implementation search: no results for `data-login-reseed`, `login-reseed`, `Reseed Active DB`, `Confirm Reseed`, or `Reseed target` in `account/` and `assets/theme-v2/js/login-session.js`.
- Forbidden auth/MEM terms: no active additions for Supabase, fake-login, MEM DB, or `login.html`; `local-mem` appears only in a negative assertion; password appears only as an existing Admin Controls UI demo field.
- Guest runtime cleanup probe:
  - `guestPackageCount: 9`
  - `guestRuntimeCount: 0`
  - `guestReadOnly: true`
  - `guestSource: docs_build/database/seed/guest/`

## DDL/DML/Seed Location Audit

- PASS: required DDL/DML/seed artifact layout exists.
- PASS: no DDL/DML/seed database artifacts were found under `docs/` or `src/`.
- PASS: `docs_build/database/README.md` now documents grouped ownership and the server API seed boundary.

## Server-Side Seed API Audit

- PASS: User-facing/admin reseed calls `/api/admin/setup/reseed`.
- PASS: `/api/admin/setup/reseed` is admin-gated and returns visible status data.
- PASS: Existing `/api/mock-db/seed` remains as the dev/testing API used by targeted tests. It is not exposed from sign-in UI.
- FOLLOW-UP: Full promotion of every seed JSON group into executable server-side seed loaders remains a later migration. Current Local DB runtime seed tables are still produced by the dev-runtime adapter for DEV validation only.

## Guest Seed Ownership Audit

- PASS: Guest seed JSON lives under `docs_build/database/seed/guest/`.
- PASS: `/api/guest/seed` reads the docs_build guest seed JSON files and returns read-only package metadata.
- PASS: `tool_state_samples` no longer creates guest rows, and legacy-loaded guest rows are filtered out of active runtime snapshots.

## Validation Lane Report

- Syntax/static:
  - `node --check assets/theme-v2/js/login-session.js`
  - `node --check assets/theme-v2/js/admin-setup-actions.js`
  - `node --check src/engine/api/admin-setup-api-client.js`
  - `node --check src/dev-runtime/server/mock-api-router.mjs`
  - `node --check src/dev-runtime/guest-seeds/tool-state-samples.js`
- Dev runtime:
  - `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs tests/dev-runtime/DevRuntimeBoundary.test.mjs` PASS, 5/5.
- Targeted Playwright:
  - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs` PASS, 22/22.
- Workspace contract:
  - `npm run test:workspace-v2` PASS, 5/5. Command name is legacy; user-facing language remains Game terminology.
- Diff:
  - `git diff --check` PASS with Windows line-ending warnings only.

## Playwright / Coverage

- Playwright impacted: Yes.
- Final targeted Playwright result: PASS, 22/22.
- `docs_build/dev/reports/playwright_v8_coverage_report.txt` produced.
- Coverage status: WARN advisory only. Browser-collected V8 coverage exercised `assets/theme-v2/js/admin-setup-actions.js`, `src/engine/api/admin-setup-api-client.js`, and `admin/db-viewer.js`; server-side `.mjs` files are validated by Node tests rather than browser V8.

## Samples

- Full samples smoke: SKIP.
- Reason: Request scoped validation to Admin DB Viewer, Admin Site Setup, sign-in, guest seed path, and workspace-v2 lane. No sample game/runtime smoke lane changed.

## Manual Validation Notes

1. Open `account/sign-in.html`; confirm no reseed section/action exists.
2. Sign in as Admin and open `admin/site-setup.html`; click `Reseed Local DB`; confirm visible `PASS`.
3. Open `admin/db-viewer.html`; confirm filter order matches the required list.
4. Fetch `/api/guest/seed`; confirm `readOnly: true` and grouped docs_build source.
5. Fetch `/api/mock-db/snapshot`; confirm `tool_state_samples` contains no guest audience rows.

