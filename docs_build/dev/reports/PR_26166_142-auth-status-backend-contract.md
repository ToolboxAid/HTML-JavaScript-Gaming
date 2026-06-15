# PR_26166_142-auth-status-backend-contract

## Branch Validation

- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary

Fixed the auth status/check flow so Sign In, Create Account, and Password Reset use the shared backend contract:

- `GET /api/auth/status`
- `POST /api/auth/sign-in`
- `POST /api/auth/create-account`
- `POST /api/auth/password-reset`

The browser no longer calls environment-specific auth routes. The Local API router decides the configured auth adapter and returns production-safe availability text to the UI when auth is missing or unavailable.

Delta ZIP: `tmp/PR_26166_142-auth-status-backend-contract_delta.zip`

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Use `main` only | PASS | `git branch --show-current` returned `main`. |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` | PASS | Read before edits. |
| Browser pages must not call environment-specific/missing API routes | PASS | `assets/theme-v2/js/login-session.js` and `assets/theme-v2/js/account-auth-actions.js` call `/api/auth/...`. |
| Password Reset/Create Account must not show `Unknown API route` | PASS | Both pages now use `/api/auth/status`; Playwright validates the generic unavailable state. |
| All environments call the same backend API contract | PASS | Browser calls only `/api/auth/status`, `/api/auth/sign-in`, `/api/auth/create-account`, `/api/auth/password-reset`. |
| Backend/API decides auth/db adapter | PASS | `src/dev-runtime/server/local-api-router.mjs` resolves provider status in `authStatus()` and action adapters in `authAdapterForAction()`. |
| Add/correct backend route handling for auth status/config availability | PASS | Added generic `/api/auth/*` route handling. |
| Missing/unreachable backend shows production-safe message | PASS | UI and backend use `The site is currently unavailable. Please try again later.` |
| Remove user-facing DEV wording | PASS | Account pages/auth scripts no longer contain user-facing DEV/Supabase/env wording. |
| Do not activate product-table migration | PASS | No product-table migration changes. |
| Do not add secrets or `.env` files | PASS | No secrets or `.env` files changed. |
| No silent fallback | PASS | Missing/unavailable auth reports unavailable; no fallback auth path is triggered. |
| No browser-owned auth/product data | PASS | Browser invokes backend API only; no browser-owned auth/product persistence added. |

## Search Evidence

- `rg -n "/api/auth/dev/supabase" account assets/theme-v2/js src/dev-runtime/server` returned no active page/script/server matches.
- `rg -n "DEV|Supabase|GAMEFOUNDRY_|Unknown API route" account assets/theme-v2/js/login-session.js assets/theme-v2/js/account-auth-actions.js` returned no auth UI/script matches; the only output was unrelated `DEVICE_POLL_INTERVAL_MS` in `account/user-controls-page.js`.
- `rg -n "authStatus\\(|authSignIn\\(|authCreateAccount\\(|authPasswordReset\\(" src/dev-runtime/server/local-api-router.mjs` shows generic backend auth handlers.
- The generic `Unknown API route` server fallback remains for unrelated unknown API paths, but Create Account and Password Reset no longer call missing routes.

## Changed Files

- `account/sign-in.html`
- `account/create-account.html`
- `account/password-reset.html`
- `assets/theme-v2/js/login-session.js`
- `assets/theme-v2/js/account-auth-actions.js`
- `src/dev-runtime/server/local-api-router.mjs`
- `tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
- `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- Workspace validation reports refreshed by `npm run test:workspace-v2`.

## Impacted Lanes

- runtime: auth/session browser and Local API route behavior.
- integration: Sign In, Create Account, Password Reset unavailable/configured states.
- contract: Supabase provider adapter contract stub route checks.

## Skipped Lanes

- samples: SKIP. The PR only changes account auth status/API contract wiring and does not touch samples or sample runtime behavior.
- full samples smoke: SKIP per request.

## Validation Performed

- PASS: `node --check assets/theme-v2/js/login-session.js`
- PASS: `node --check assets/theme-v2/js/account-auth-actions.js`
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
- PASS: `npm run test:workspace-v2`
- PASS: final targeted Playwright rerun for focused V8 coverage.
- PASS: `git diff --check` with line-ending warnings only.

## Playwright Result

- PASS: 13 targeted auth/session Playwright tests passed.
- PASS: `npm run test:workspace-v2` passed 5 workspace-contract tests.

## V8 Coverage

- PASS/WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` generated.
- `assets/theme-v2/js/account-auth-actions.js`: 92% advisory coverage.
- `assets/theme-v2/js/login-session.js`: 93% advisory coverage.
- `src/dev-runtime/server/local-api-router.mjs`: WARN because browser V8 does not collect server-side Node modules; covered by Node contract test and Playwright route checks.

## Manual Validation Notes

1. Open `account/sign-in.html`.
2. With auth unavailable, click `Sign In`; status should show `The site is currently unavailable. Please try again later.`
3. Open `account/create-account.html`; status should resolve through `/api/auth/status` and must not show `Unknown API route`.
4. Open `account/password-reset.html`; status should resolve through `/api/auth/status` and must not show `Unknown API route`.
5. With Supabase auth env configured, Sign In/Create Account/Password Reset use the external auth adapter while product data remains Local DB.
