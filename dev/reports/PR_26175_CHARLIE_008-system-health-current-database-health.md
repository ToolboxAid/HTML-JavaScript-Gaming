# PR_26175_CHARLIE_008 System Health Current Database Health

## Scope

Team: Charlie

Purpose: Add current-environment database health only to Admin System Health.

## Changes

- Replaced the Database Health table body with current-environment fields:
  - database type
  - connectivity
  - response time
  - version
  - last checked
- Added safe server-owned database status fields to the Admin System Health API payload.
- Database type follows the current environment identity:
  - Local, DEV, and IST: Local Docker PostgreSQL
  - UAT and PRD: Supabase PostgreSQL
- Updated focused API and Playwright tests.

## Architecture Constraint

PASS. Database health reads only the currently configured deployment database. No database checks are made for peer environments.

## Validation

- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check assets/theme-v2/js/admin-system-health.js`
- PASS: `git diff --check`
- PASS: `node --test tests/dev-runtime/AdminHealthOperations.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs --workers=1 --reporter=line`

## Artifact

- `tmp/PR_26175_CHARLIE_008-system-health-current-database-health_delta.zip`
