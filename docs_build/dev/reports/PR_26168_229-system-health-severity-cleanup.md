# PR_26168_229-system-health-severity-cleanup

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`
- Local branches found: `main`

## Summary

Fixed Admin System Health limit severity so configured limits are PASS, `NOT AVAILABLE` usage does not automatically produce WARN, and WARN is reserved for missing or invalid limit configuration.

## Requirement Checklist

- PASS - Environment Limits can be PASS when all required limit variables are configured with valid positive integer values.
- PASS - `NOT AVAILABLE` usage values no longer automatically generate WARN.
- PASS - Missing required limit variables report WARN.
- PASS - Invalid limit values report WARN.
- PASS - Failed limit configuration validation reports WARN.
- PASS - Pressure labels remain exactly `OK`, `WATCH`, `UPGRADE SOON`, and `RISK`.
- PASS - `RISK` remains the highest severity label.
- PASS - Forbidden alternate pressure wording was scanned and is absent.
- PASS - PR222-228 behavior remains intact.

## Validation Lane Report

PASS

- `node --check src/dev-runtime/server/local-api-router.mjs`
- `node --check assets/theme-v2/js/admin-system-health.js`
- `node --check src/engine/api/admin-system-health-api-client.js`
- `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- Static System Health contract validation for severity, exact pressure labels, no forbidden pressure wording, and no inline HTML script/style/event handlers.
- Targeted Playwright:
  - `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs tests/playwright/tools/AssetToolMockRepository.spec.mjs -g "System Health|Tool Votes side menu includes Admin platform wireframes|Infrastructure storage connectivity actions call Local API and hide secrets|Infrastructure storage path status reports missing env path as ERROR|Infrastructure storage path status reports invalid env path as ERROR|Infrastructure storage path status reports DEV match only|Infrastructure storage path status reports IST match only|Assets DEV storage upload list read and delete use configured projects prefix"`
- `rg -n "LIMIT RISK" . --glob '!node_modules/**' --glob '!tmp/**' --glob '!docs_build/dev/reports/codex_review.diff'`

## Manual Validation Notes

PASS

- Confirmed limit status now derives from configured limit validation, not usage availability.
- Confirmed usage may remain `NOT AVAILABLE` without lowering Environment Limits severity.
- Confirmed no secrets or full connection strings are exposed.

## Full Samples Decision

SKIP

Full samples smoke was not run because this PR only changes Admin System Health limit severity and targeted tests. Sample JSON, game samples, and `start_of_day` folders were not touched.

## Artifact Output

PASS

- Repo-structured delta ZIP: `tmp/PR_26168_229-system-health-severity-cleanup_delta.zip`
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
