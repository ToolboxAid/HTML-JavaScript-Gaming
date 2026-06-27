# PR_26175_CHARLIE_009 System Health Current R2 Health

## Scope

Team: Charlie

Purpose: Add current-environment Cloudflare R2 folder health only to Admin System Health.

## Changes

- Replaced the System Health Storage Health rows with current-environment R2 checks:
  - bucket connectivity
  - list
  - upload
  - read
  - delete
  - last checked
- System Health storage diagnostics run against the current environment folder only:
  - Local: `/local`
  - DEV: `/dev`
  - IST: `/ist`
  - UAT: `/uat`
  - PRD: `/prd`
- Preserved the separate Admin Infrastructure storage diagnostic path that uses the configured project prefix.
- Updated focused API and Playwright tests.

## Architecture Constraint

PASS. R2 health checks target only the current deployment environment folder. No peer environment R2 folders are actively checked by System Health.

## Validation

- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check assets/theme-v2/js/admin-system-health.js`
- PASS: `git diff --check`
- PASS: `node --test tests/dev-runtime/AdminHealthOperations.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/AdminHealthOperationsPage.spec.mjs --workers=1 --reporter=line`

## Artifact

- `tmp/PR_26175_CHARLIE_009-system-health-current-r2-health_delta.zip`
