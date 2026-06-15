# PR_26166_150-create-account-live-supabase-flow

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `/account/create-account.html` posts through backend `/api/auth/create-account`.
- PASS: Backend uses the Supabase Auth provider adapter when readiness is proven.
- PASS: No password table or local password storage was added.
- PASS: No Local DB auth fallback was added.
- PASS: Missing readiness/failure path shows the generic production-safe unavailable message.
- PASS: Page remains production-safe Theme V2 with external JavaScript.

## Validation Lane Report
- PASS: `node --check assets/theme-v2/js/account-auth-actions.js`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions" --reporter=list`
- PASS: `npm run test:workspace-v2`

## Manual Notes
- The create-account action body sends email/password to the backend only.
- Supabase access and refresh tokens are never exposed in API responses or browser code.

## Playwright V8 Coverage
- See `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Skipped Lanes
- Full samples smoke: SKIP. Account creation does not touch samples.
