# PR_26167_176-account-pages-single-auth-contract

## Summary
- Added one shared account auth browser API helper at `assets/theme-v2/js/account-auth-service.js`.
- Updated Sign In, Create Account, and Password Reset modules to use the shared account auth service contract.
- Removed localhost/port/static-local branching from the account auth page modules.
- Replaced the generic unavailable browser fallback with action-safe account service messages.

## Branch Validation
- PASS - Current branch was `main`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before PR work.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - Sign In, Create Account, and Password Reset now use one account auth service/API helper.
- PASS - Account auth page modules no longer branch on DEV/UAT/PROD, Local API, SQLite, Supabase, provider names, localhost, or port.
- PASS - Create Account and Lost Password recovery paths remain production-safe when external auth is not fully active.
- PASS - Generic unavailable browser behavior was replaced by action-safe service messages for sign-in/create/reset failure paths.
- PASS - No inline script/style/event handlers added.
- PASS - No fake login, browser-owned auth, browser-owned product data, or silent fallback added.
- PASS - No secrets or `.env.local` changes.

## Validation Lane Report
- PASS - `node --check assets/theme-v2/js/account-auth-service.js`
- PASS - `node --check assets/theme-v2/js/login-session.js`
- PASS - `node --check assets/theme-v2/js/account-auth-actions.js`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
- PASS - HTML restriction scan for `account/sign-in.html`, `account/create-account.html`, `account/password-reset.html`, and `account/lost-password.html`.
- PASS - Browser/page wording scan for changed account auth pages/modules: no actual DEV/UAT/PROD, Local API, SQLite, Supabase, provider, localhost, or port wording remained in the account auth page code. The raw scan only matched `viewport` substrings in HTML metadata.
- PASS - Targeted Playwright: `npx playwright test --config=playwright.config.cjs --project=playwright tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs -g "static sign-in page renders|Sign-in page uses|Configured account auth actions|Create Account shows action-safe|Password Reset maps upstream"`
- PASS - Manual browser page-load validation script for `/account/sign-in.html`, `/account/create-account.html`, and `/account/password-reset.html`.
- PASS - `git diff --check`
- SKIPPED - `npm run test:workspace-v2` because targeted account/auth Playwright coverage exists and passed.
- SKIPPED - Full samples smoke per request and because samples are not in scope.

## Manual Validation Notes
- `/account/sign-in.html` loaded with `Sign In is not available in this preview. You can continue browsing.`
- `/account/create-account.html` loaded with `Create Account is not available in this preview. Please try again later.`
- `/account/password-reset.html` loaded with `Password Reset is not available in this preview. Please try again later.`
- The affected page `main` content did not contain the generic unavailable message, Local API, SQLite, Supabase, or provider wording.
- `account/lost-password.html` remains a safe navigation page to Password Reset and has no auth provider logic.

## Playwright V8 Coverage
- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes changed runtime JS:
  - `assets/theme-v2/js/login-session.js`
  - `assets/theme-v2/js/account-auth-actions.js`
  - `assets/theme-v2/js/account-auth-service.js`
- PASS - `docs_build/dev/reports/coverage_changed_js_guardrail.txt` reports no changed-runtime-JS coverage warnings.

## Test Data Cleanup
- N/A - This PR did not create validation records.
