# PR_26166_173-password-reset-rate-limit-message Report

## Scope
- Purpose: handle Supabase password reset upstream HTTP 429 safely.
- Branch validation: PASS. Current branch was `main`.
- Instructions validation: PASS. `docs_build/dev/PROJECT_INSTRUCTIONS.md` was read before BUILD work.
- Playwright impacted: Yes.
- Full samples smoke: SKIP by request; password reset auth/UI behavior does not affect samples.

## Changes
- Added server-side handling for Supabase password reset upstream HTTP 429 in `POST /api/auth/password-reset`.
- Added safe browser message pass-through for the production-safe rate-limit message only.
- Added operator diagnostics for password reset start, upstream 429, upstream provider failures, and failed route handling.
- Added focused Node and Playwright validation for HTTP 429 and non-429 provider failures.

## Requirement Checklist
- PASS - Main branch only; verified current branch is `main`.
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- PASS - Did not change auth provider selection.
- PASS - Did not change Supabase settings.
- PASS - Did not commit secrets or `.env.local`.
- PASS - Upstream HTTP 429 maps to browser-safe message: `Too many reset requests. Please wait and try again later.`
- PASS - Operator diagnostics include HTTP 429 and safe upstream context: phase `upstream-rate-limited`, `upstreamStatusCode=429`, and safe upstream code `over_email_send_rate_limit`.
- PASS - Generic unavailable message is preserved for non-429 provider failures.
- PASS - No password tables added.
- PASS - No browser-owned auth/provider logic added; browser only displays the safe message returned by the server contract.
- PASS - No silent fallback added; 429 and provider failures resolve through explicit error paths.

## Validation Lane Report
- Lane: targeted auth/password-reset runtime and browser validation.
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check assets/theme-v2/js/account-auth-actions.js`
- PASS - `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - `node --test --test-name-pattern "Password reset" tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `node --test --test-name-pattern "Default Supabase Auth routes sign in create account and password reset|Password reset" tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --workers=1 --reporter=list -g "Password Reset maps upstream rate limit"`
- PASS - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --workers=1 --reporter=list -g "Configured account auth actions|Password Reset maps upstream rate limit"`
- PASS - `git diff --check`
- PASS - `.env.local` tracking check produced no tracked or modified `.env.local` output.
- SKIP - Full samples smoke by request.

## Manual Validation Notes
- Browser page validated through `/account/password-reset.html` using the targeted Playwright lane and local API.
- Fake Supabase Auth `/auth/v1/recover` returned HTTP 429 with upstream message and email context; browser showed only `Too many reset requests. Please wait and try again later.`
- Fake Supabase Auth `/auth/v1/recover` returned HTTP 500 with upstream outage context; browser showed only `The site is currently unavailable. Please try again later.`
- The UI did not expose upstream provider text or test email addresses in either failure path.
- Operator diagnostic output included HTTP 429 safe context for the rate-limit path and HTTP 500 safe context for the generic provider-failure path.

## Test Data Cleanup
- PASS - No live Supabase records were created for PR_26166_173.
- PASS - Validation used in-process fake Supabase servers only; no cleanup script was required for this PR.

## Playwright V8 Coverage
- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` was generated for changed runtime JavaScript.
- `(92%) assets/theme-v2/js/account-auth-actions.js - executed lines 119/119; executed functions 12/13`
- `(0%) src/dev-runtime/server/local-api-router.mjs - WARNING: server-side Node runtime file was not collected by browser V8 coverage; advisory only. Targeted Node tests covered the password reset route behavior.`

## Review Notes
- No auth provider selection changes were introduced for this PR.
- No Supabase configuration or settings were changed.
- No `.env.local` or secret values were added.
- No password tables were added.
