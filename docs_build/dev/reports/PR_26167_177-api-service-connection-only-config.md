# PR_26167_177-api-service-connection-only-config

## Summary
- Removed the browser-owned auth provider override from `assets/theme-v2/js/gamefoundry-partials.js`.
- Removed browser local-port redirect/static-local session branching from shared partial loading.
- Kept account/header/session behavior on the server API path: `/api/session/current`, `/api/session/logout`, `/api/auth/*`, and server-owned navigation menu data.
- Moved Local Admin My Stuff menu gating to the server navigation response so browser code renders returned service data instead of branching by local mode.
- Reworded route diagnostics from Local API wording to neutral server API wording.

## Branch Validation
- PASS - Current branch was `main`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before PR work.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - Centralized account/header session behavior on server API calls instead of browser-owned provider selection.
- PASS - Kept one API/service path for auth/session, product/API clients, and storage/API diagnostics.
- PASS - DEV/UAT/PROD remain server/dev-runtime deployment labels and are not used by the changed browser page code to select account behavior.
- PASS - Removed browser/page provider switching through `window.GameFoundryAuthProvider`.
- PASS - Documented remaining server-side provider/database selection as connection config in this report.
- PASS - No silent fallback or hidden defaults added; missing session/API data still fails visibly through status/diagnostic paths.
- PASS - No secrets or `.env.local` changes.

## Remaining Server-Side Connection Selection
- `src/dev-runtime/auth/provider-contract-stubs.mjs` still owns server-side provider selection from `GAMEFOUNDRY_AUTH_PROVIDER` and `GAMEFOUNDRY_DB_PROVIDER`. This is classified as connection config, not browser/page behavior branching.
- `src/dev-runtime/server/local-api-router.mjs` still checks selected server providers before opening auth, product, or database routes. These checks fail visibly and do not fall back automatically.
- `src/dev-runtime/server/local-api-router.mjs` now owns whether Local Admin My Stuff navigation items are included in the server navigation response.

## Validation Lane Report
- PASS - `node --check assets/theme-v2/js/gamefoundry-partials.js`
- PASS - `node --check src/engine/api/server-api-client.js`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
- PASS - Static scan confirmed no `window.GameFoundryAuthProvider`, local-port redirect, static-local session branch, or Local API route diagnostic remains in `gamefoundry-partials.js` or `server-api-client.js`.
- PASS - Targeted API/service tests: `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs tests/dev-runtime/SupabaseProductDataCutover.test.mjs tests/dev-runtime/ProductDataProviderContractHardening.test.mjs`
- PASS - Targeted account/session Playwright: `npx playwright test --config=playwright.config.cjs --project=playwright tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs -g "static sign-in page renders|Sign-in page uses|Configured account auth actions|Account logout clears|Local users unlock|API-backed 5501"`
- PASS - `npm run test:workspace-v2` because shared Theme V2/session partial behavior changed. The command name is legacy; user-facing language is Project Workspace.
- PASS - `git diff --check`
- SKIPPED - Full samples smoke per request and because samples are not in scope.

## Manual Validation Notes
- Browser validation confirmed static sign-in uses the same session/account API contract and keeps production-safe account page messages.
- Browser validation confirmed `window.GameFoundryAuthProvider` is no longer installed by the sign-in page.
- Browser validation confirmed Admin navigation still shows Local Admin My Stuff entries for an admin when the server connection config returns those menu items.
- Browser validation confirmed logout still clears only the current session and protected pages block access afterward.

## Playwright V8 Coverage
- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes changed browser runtime JS:
  - `assets/theme-v2/js/gamefoundry-partials.js`
  - `assets/theme-v2/js/account-auth-actions.js`
  - `assets/theme-v2/js/account-auth-service.js`
  - `assets/theme-v2/js/login-session.js`
  - `src/engine/api/server-api-client.js`
- WARN - `src/dev-runtime/server/local-api-router.mjs` is server-side runtime and is not collected by browser V8 coverage; node/API tests covered this change.

## Test Data Cleanup
- N/A - This PR did not create validation records.
