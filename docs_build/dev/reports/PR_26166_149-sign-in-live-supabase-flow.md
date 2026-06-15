# PR_26166_149-sign-in-live-supabase-flow

## Branch Validation
- PASS: current branch `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: `/account/sign-in.html` remains Theme V2, external JS only, no inline CSS/JS/events.
- PASS: Sign-in uses backend `/api/auth/sign-in` only.
- PASS: Browser code contains no Supabase provider logic or token handling.
- PASS: Unavailable/failure paths show `The site is currently unavailable. Please try again later.`
- PASS: Successful configured sign-in resolves a backend app session and redirects to the return target.
- PASS: No Local DB auth fallback, password table, secret, or `.env.local` change was added.

## Validation Lane Report
- PASS: `node --check assets/theme-v2/js/login-session.js`
- PASS: `node --check account/sign-in.html` is not applicable; HTML was validated through Playwright page load and structure assertions.
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Sign-in page uses|Configured account auth actions" --reporter=list`
- PASS: `npx playwright test tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs --reporter=list`
- PASS: `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs --reporter=list`
- PASS: `npm run test:workspace-v2`

## Manual Notes
- Sign-in label is now `Email` for Supabase Auth.
- Submit disables when the backend account service is not ready.
- Successful fake Supabase sign-in sanitized tokens and resolved `User 1` through provider-owned identity tables.

## Playwright V8 Coverage
- See `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Skipped Lanes
- Full samples smoke: SKIP. Sign-in account flow does not modify sample runtime.
