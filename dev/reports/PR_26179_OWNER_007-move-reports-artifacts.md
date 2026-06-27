# PR_26179_OWNER_007-move-reports-artifacts

Generated: 2026-06-27T19:33:15.325Z
Branch: PR_26179_OWNER_007-move-reports-artifacts
Base stack head before PR_007: 119fa8816
ZIP: dev/workspace/artifacts/tmp/PR_26179_OWNER_007-move-reports-artifacts_delta.zip

## Purpose

Move generated report and artifact ownership to the new dev workspace locations while keeping runtime/product code untouched.

## Changes

- Moved tracked generated reports from `dev/docs_build/dev/reports/` to flat `dev/reports/`.
- Added `dev/workspace/artifacts/` ownership documentation for non-report generated artifacts.
- Updated Codex/PR/reporting governance to require flat `dev/reports/` and ZIPs under `dev/workspace/artifacts/tmp/`.
- Updated dev script defaults, Playwright output, report writers, and report-related tests to the new paths.

## Report Inventory

- Old tracked report path count: 0
- New tracked flat report count: 3578
- Nested tracked paths under `dev/reports/`: 0

## Validation Summary

| Status | Item | Notes |
| --- | --- | --- |
| PASS | Current branch is PR_26179_OWNER_007-move-reports-artifacts | confirmed |
| PASS | No product/runtime/API/database files changed | git diff against production/runtime scopes returned no files |
| PASS | Tracked reports moved out of dev/docs_build/dev/reports | 0 tracked files remain in old report tree |
| PASS | Tracked reports are flat under dev/reports | 3578 tracked report files, 0 nested report paths |
| PASS | Generated ZIP/report/artifact expectations updated | active instructions and helper defaults use dev/reports and dev/workspace/artifacts |
| PASS | git diff --check | passed |
| PASS | node --check on changed JS/MJS files | passed |
| PASS | npm run test:audit:locations | passed |
| PASS | npm run validate:canonical-structure | passed |
| PASS | Playwright config list | npx playwright test --config=dev/config/playwright.config.cjs --list passed |
| WARN | Legacy workspace migration validation | ProjectWorkspaceMigrationGovernanceCloseoutValidation.test.mjs cannot load a pre-existing missing toolbox/workspace-manager-v2 module; not expanded in this reports/artifacts PR |
