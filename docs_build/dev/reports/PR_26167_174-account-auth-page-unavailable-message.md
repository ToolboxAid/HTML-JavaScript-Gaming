# PR_26167_174-account-auth-page-unavailable-message

## Summary
- Replaced the page-load/static-preview account auth status copy with scoped production-safe placeholders for Sign In, Create Account, and Password Reset.
- Preserved the generic unavailable message for real account action provider/network failures.
- Kept account auth owned by the existing server API paths with no fake login, browser-owned provider selection, hidden defaults, or silent fallback.
- Updated focused Playwright expectations for the account auth pages and preserved provider-failure coverage.

## Branch Validation
- PASS - Current branch was `main` before edits and before packaging validation.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - Investigated Sign In, Create Account, Password Reset, and legacy Lost Password page flow.
- PASS - Fixed visible page-load copy for `The site is currently unavailable. Please try again later.` on the affected account pages.
- PASS - Kept production-safe placeholders for Create Account and Password Reset/Lost Password recovery paths.
- PASS - Did not add inline script, inline style, style blocks, or inline event handlers.
- PASS - Did not introduce fake login, browser-owned auth/provider logic, silent fallback, or hidden defaults.
- PASS - No secrets or `.env.local` changes.
- PASS - No password tables added.

## Validation Lane Report
- PASS - `node --check assets/theme-v2/js/login-session.js`
- PASS - `node --check assets/theme-v2/js/account-auth-actions.js`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
- PASS - HTML restriction scan for `account/sign-in.html`, `account/create-account.html`, `account/password-reset.html`, and `account/lost-password.html`.
- PASS - Targeted Playwright: `npx playwright test --config=playwright.config.cjs --project=playwright tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs -g "static sign-in page renders|Sign-in page uses|Configured account auth actions|Create Account shows generic provider failure|Password Reset maps upstream rate limit"`
- PASS - Manual browser page-load validation script for `/account/sign-in.html`, `/account/create-account.html`, and `/account/password-reset.html`.
- PASS - `npm run test:workspace-v2`
- PASS - `git diff --check`
- PASS - `npm run codex:review-artifacts`
- SKIPPED - Full samples smoke per request.

## Manual Validation Notes
- `/account/sign-in.html` loaded with `Sign In is not available in this preview. You can continue browsing.`
- `/account/create-account.html` loaded with `Create Account is not available in this preview. Please try again later.`
- `/account/password-reset.html` loaded with `Password Reset is not available in this preview. Please try again later.`
- The generic unavailable text did not appear in the `main` content on those page-load checks.
- `account/lost-password.html` was inspected; it remains a safe legacy navigation page to the current password reset flow and has no auth provider logic.

## Test Data Cleanup
- N/A - This PR did not create or write validation records.

## Reports
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`

## Packaging
- PASS - Created repo-structured delta ZIP at `tmp/PR_26167_174-account-auth-page-unavailable-message_delta.zip`.
- PASS - Delta ZIP contains no `tmp/` entries and no `.env.local` entries.
