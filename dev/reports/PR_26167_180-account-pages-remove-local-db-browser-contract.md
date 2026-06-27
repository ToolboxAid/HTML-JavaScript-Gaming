# PR_26167_180-account-pages-remove-local-db-browser-contract

## Summary
- Moved Account Home, Profile, Preferences, and Security pages off the Local DB page data contract.
- Added `assets/theme-v2/js/account-page-data.js` so Account pages render through account service/API contract naming only.
- Removed Account renderers and session resolution from `assets/theme-v2/js/local-db-page-data.js`; Admin DB Viewer pages keep their existing helper.
- Extended `scripts/validate-browser-env-agnostic.mjs` to fail when Account page/browser code contains forbidden environment/provider dependency terms.

## Branch Validation
- PASS - Current branch was `main`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before PR work.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - Removed Account page dependency on `data-local-db-page`, `data-local-db-status`, `data-local-db-content`, and `local-db-page-data.js`.
- PASS - Replaced Account page data loading with `data-account-*` hooks and `account-page-data.js`, backed by the existing account service API contract.
- PASS - Account page UI and Account browser code scan clean for Local, Local DB, SQLite, Supabase, provider, localhost, DEV, UAT, and PROD terms.
- PASS - Updated `validate-browser-env-agnostic.mjs` to include Account page dependency findings for forbidden terms and legacy Account Local DB hooks.
- PASS - Kept Admin DB Viewer dev/runtime behavior out of Account page scope; existing Admin Local DB page assertions still pass.
- PASS - Did not change auth provider selection, secrets, `.env.local`, browser-owned auth/provider logic, hidden defaults, or silent fallback behavior.
- PASS - Did not run full samples smoke.

## Validation Lane Report
- PASS - `node --check assets/theme-v2/js/account-page-data.js`
- PASS - `node --check assets/theme-v2/js/local-db-page-data.js`
- PASS - `node --check scripts/validate-browser-env-agnostic.mjs`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - Forbidden Account term scan returned no matches across `account/` and Account browser modules.
- PASS - Removed Account renderer scan returned no matches in `assets/theme-v2/js/local-db-page-data.js`.
- PASS - `npm run validate:browser-env-agnostic`
- PASS - Targeted account/auth Playwright: `npx playwright test --config=playwright.config.cjs --project=playwright tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs -g "static account auth pages render|Sign-in page uses|Configured account auth actions|Create Account shows action-safe|Password Reset maps upstream|Protected pages block|Admin Local DB pages and Account service pages"`
- NOTE - A first Playwright attempt using Windows-style test path separators produced `No tests found`; the same targeted selection was rerun with repo-relative forward-slash paths and passed.
- PASS - `git diff --check`
- SKIPPED - `npm run test:workspace-v2`; PR180 changed Account page-specific runtime and validation gates, not shared runtime/session UI behavior. The command name is legacy and user-facing language is Project Workspace.
- SKIPPED - Full samples smoke per request and because samples are not in scope.

## Manual Validation Notes
- Account Home, Profile, Preferences, and Security now declare `data-account-page`, `data-account-status`, and `data-account-content` instead of the removed Local DB page hooks.
- Account Home and Profile render the signed-in account table through `[data-account-table="current-account"]`.
- Account Preferences and Security render account service follow-up callouts through `[data-account-follow-up]`.
- Targeted browser validation confirmed Account pages no longer expose the removed Account Local DB hooks, while Admin Local DB pages continue to render through their existing dev/runtime helper.
- `docs_build/dev/reports/environment_agnostic_browser_gate_report.md` reports PASS, 439 active browser/page files scanned, and zero Account page dependency findings.

## Playwright V8 Coverage
- Runtime JS changed, so `docs_build/dev/reports/playwright_v8_coverage_report.txt` was refreshed by targeted Account/Auth Playwright.
- `(100%) assets/theme-v2/js/account-page-data.js - executed lines 150/150; executed functions 21/21`
- `(97%) assets/theme-v2/js/local-db-page-data.js - executed lines 237/237; executed functions 35/36`
- Account/Auth supporting modules also remained covered in the refreshed report.
- Advisory warnings for non-browser changed JS from earlier stacked work remain coverage warnings, not PR180 failures.

## Test Data Cleanup
- N/A - PR180 did not create persistent validation records. Playwright used temporary test storage cleaned by the existing test helpers.

## Remaining Follow-Up Blockers
- None.
