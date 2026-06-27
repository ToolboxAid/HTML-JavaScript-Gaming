# PR_26166_160-supabase-auth-dev-uat-closeout

## Branch Validation

- Current branch: main
- Expected branch: main
- Branch validation: PASS

## Purpose

Close out DEV Supabase Auth UAT readiness for the stacked sign-in work.

## Requirement Checklist

- PASS - DEV Supabase Auth readiness validated with `npm run validate:supabase-dev`.
- PASS - Sign In is usable through backend API contracts.
- PASS - Create Account provisions Supabase Auth plus app identity rows.
- PASS - Password Reset is usable and production-safe.
- PASS - Product data remains Local DB with `GAMEFOUNDRY_DB_PROVIDER=local-db`.
- PASS - No secrets or `.env.local` files were changed or committed.
- PASS - No product-table migration was added.
- PASS - No silent fallback to Local DB auth was added.
- PASS - Playwright impacted: Yes; targeted auth/session coverage passed.
- PASS - V8 coverage report was produced.

## Validation Summary

- PASS - `npm run validate:supabase-dev`
  - Supabase URL configured.
  - Publishable key configured.
  - Service role key configured.
  - Auth endpoint reachable.
  - Service role authentication PASS.
  - `users`, `roles`, and `user_roles` table checks PASS.
  - Direct DB connection WARN due to `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed.
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
  - 26 passed, 0 failed.
- PASS - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions|Account auth actions show actionable identity setup|Account logout clears|Guest can explore" --reporter=list`
  - 5 passed, 0 failed.
- PASS - Changed-file syntax checks.
- PASS - `git diff --check`

## Coverage

- Coverage artifact: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Coverage result: WARN advisory for some changed runtime JS entries not collected by the current Chromium V8 reporter, while the targeted Playwright behavior passed.

## Changed Files

- `account/create-account.html`
- `account/password-reset.html`
- `assets/theme-v2/js/account-auth-actions.js`
- `assets/theme-v2/js/login-session.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26166_157-first-real-sign-in-validation.md`
- `docs_build/dev/reports/PR_26166_158-account-flow-error-polish.md`
- `docs_build/dev/reports/PR_26166_159-account-session-ui-state.md`
- `docs_build/dev/reports/PR_26166_160-supabase-auth-dev-uat-closeout.md`

## Skipped Lanes

- samples: SKIP - full samples smoke was explicitly out of scope.
- product database migration: SKIP - product data must remain Local DB.
- full workspace Playwright suite: SKIP - targeted auth/session Playwright validation was requested.

## Manual Closeout Notes

1. Keep `GAMEFOUNDRY_DB_PROVIDER=local-db`.
2. Configure Supabase Auth env values locally.
3. Run `npm run validate:supabase-dev`.
4. Create a new account, sign in, confirm session/role, sign out, and request password reset.
5. Confirm no browser UI exposes secrets or provider-specific DEV diagnostics.
