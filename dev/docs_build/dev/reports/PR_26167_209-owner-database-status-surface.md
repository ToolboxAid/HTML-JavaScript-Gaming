# PR_26167_209-owner-database-status-surface

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`
- Result: PASS

## Scope
- Impacted lane: runtime Owner Operations page/API.
- Full samples smoke: SKIP. This PR only changes Owner Operations status rendering and targeted server API payload behavior.
- Destructive operations: SKIP. The browser does not execute destructive database operations.

## Implementation Summary
- Added a safe Owner-only database status payload from the local server API.
- Updated Owner Operations to render only:
  - connection configured
  - database host
  - database port
  - database name
  - SSL mode
  - migration counts by type
  - last migration name/date
- Replaced the previous database operations command/status table with a status-only database table.
- Kept `.env` editing and destructive operation execution out of the browser surface.

## Validation Evidence
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS - `node --check assets/theme-v2/js/owner-operations.js`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- PASS - `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs -g "Owner Operations"`
  - 2 tests passed.
  - DavidQ owner fixture saw the Owner Operations DB status table.
  - Signed-in non-owner fixture was blocked by `main[data-session-access-blocked='owner']`.
- PASS - Playwright safe status assertions confirmed the DB status table shows:
  - `Connection Configured`
  - `Database Host`
  - `192.168.2.5`
  - `Database Port`
  - `55431`
  - `Database Name`
  - `gamefoundry_dev`
  - `SSL Mode`
  - `disable`
  - `Migration Counts`
  - `DDL=15; DML=15`
  - `Last Migration`
  - `DML support-tickets.sql at 2026-06-17 01:07:30.540517+00`
- PASS - Playwright safe status assertions confirmed the DB status table does not show:
  - `postgres://`
  - `password`
  - `SERVICE_ROLE`
- WARN - Advisory V8 coverage:
  - `(100%) assets/theme-v2/js/owner-operations.js - executed lines 121/121; executed functions 19/19`
  - `(0%) src/dev-runtime/server/local-api-router.mjs - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only`

## Owner Access Evidence
- PASS - DavidQ owner session fixture used `displayName: "DavidQ"` and `roleSlugs: ["owner", "admin", "creator"]`.
- PASS - DavidQ owner session saw the DB status table and safe database values.
- PASS - Non-owner session fixture used `displayName: "User 1"` and `roleSlugs: ["creator"]`.
- PASS - Non-owner session rendered `Owner role required` and removed `[data-owner-operations]`.

## Safe Status Evidence
- PASS - The server API returns `databaseStatus`, not a full connection string.
- PASS - The browser renderer displays only safe fields from `databaseStatus`.
- PASS - Passwords, keys, and full connection strings are not rendered.
- PASS - `.env` editing is not exposed by the Owner Operations page.
- PASS - Destructive operations are not executed from the browser.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- PASS - HARD STOP guard passed because current branch is `main`.
- PASS - Added Owner-only database status surface.
- PASS - Showed safe DB status only.
- PASS - Did not show passwords, keys, or full connection strings.
- PASS - Did not allow `.env` editing.
- PASS - Did not execute destructive operations from UI.
- PASS - Owner Operations remains status-first.
- PASS - Ran `node --check` for changed JS/MJS files.
- PASS - Ran targeted Owner Operations Playwright.
- PASS - Confirmed DavidQ can see DB status.
- PASS - Confirmed non-owner users cannot see Owner DB status.
- PASS - Did not run full samples smoke.

## Required Reports
- PASS - `docs_build/dev/reports/codex_review.diff`
- PASS - `docs_build/dev/reports/codex_changed_files.txt`
- PASS - `docs_build/dev/reports/PR_26167_209-owner-database-status-surface.md`

