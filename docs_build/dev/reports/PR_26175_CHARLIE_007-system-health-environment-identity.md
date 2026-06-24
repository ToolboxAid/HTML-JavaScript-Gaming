# PR_26175_CHARLIE_007 System Health Environment Identity

## Scope

Team: Charlie

Purpose: Add current deployment environment identity to Admin System Health and keep the all-environment map as static reference only.

## Changes

- Added a server-owned current environment identity model for Local, DEV, IST, UAT, and PRD.
- Added current deployment fields for environment name, hosting model, site URL, API URL, database model, storage folder, and last health check.
- Replaced the active multi-environment summary table with a current deployment identity table.
- Added a static Environment Map for Local, DEV, IST, UAT, and PRD without health status fields.
- Updated focused API and Playwright tests.

## Architecture Constraint

PASS. System Health displays the current deployment environment only. The Environment Map is static reference content and does not actively health-check other environments.

## Validation

- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check assets/theme-v2/js/admin-system-health.js`
- PASS: `git diff --check`
- PASS: `node --test tests/dev-runtime/AdminHealthOperations.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs --workers=1 --reporter=line`

## Notes

GitHub CLI is unavailable in this workspace. Branch push uses local `git`; draft PR creation uses the GitHub connector when available, otherwise the manual compare URL is reported.
