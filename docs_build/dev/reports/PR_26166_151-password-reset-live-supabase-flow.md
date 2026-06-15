# PR_26166_151-password-reset-live-supabase-flow

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `/account/password-reset.html` posts through backend `/api/auth/password-reset`.
- PASS: Backend requests password reset through Supabase Auth adapter only when readiness is proven.
- PASS: User-facing success copy is production-safe: `If an account exists for that email, password reset instructions will be sent.`
- PASS: Failure path uses the generic unavailable message.
- PASS: No password table, local password storage, secret, or Local DB auth fallback was added.

## Validation Lane Report
- PASS: `node --check assets/theme-v2/js/account-auth-actions.js`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions" --reporter=list`
- PASS: `npm run test:workspace-v2`

## Manual Notes
- Password reset submits email only; no blank password field is sent for reset requests.

## Playwright V8 Coverage
- See `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Skipped Lanes
- Full samples smoke: SKIP. Password reset does not affect sample runtime.
