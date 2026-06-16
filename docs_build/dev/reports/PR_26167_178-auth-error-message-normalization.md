# PR_26167_178-auth-error-message-normalization

## Summary
- Normalized visible account/auth failure copy so account pages and protected-page blocks do not expose Local DB, Supabase, provider, or implementation details.
- Kept raw session/navigation diagnostics out of page UI and sent them to operator console warnings instead.
- Updated Account Home, Profile, Preferences, and Security visible status/follow-up copy to account service language.
- Updated Admin DB Viewer session gating to read the existing `/api/session/current` service contract instead of the removed browser auth provider global, and replaced the provider-contract error with a safe sign-in message.
- Normalized an unknown account action failure to the shared account action failure message.

## Branch Validation
- PASS - Current branch was `main`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before PR work.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - User-facing auth/account errors no longer mention DEV, UAT, PROD, Local API, Local DB, SQLite, Supabase, provider names, or implementation details in the changed account/auth UI surfaces.
- PASS - Messages use creator-safe service/action language.
- PASS - Operator diagnostics remain actionable through console warnings and validation reports without being rendered in page UI.
- PASS - No intended behavior change beyond error normalization; protected pages still require the same roles, account pages still use the same data contract, and DB Viewer still requires an authenticated admin session.
- PASS - No inline script/style/event handlers were added.
- PASS - No fake login, browser-owned auth provider logic, browser-owned product data, silent fallback, secrets, or `.env.local` changes were added.

## Validation Lane Report
- PASS - `node --check admin/db-viewer.js`
- PASS - `node --check assets/theme-v2/js/gamefoundry-partials.js`
- PASS - `node --check assets/theme-v2/js/local-db-page-data.js`
- PASS - `node --check assets/theme-v2/js/account-auth-actions.js`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - HTML restriction scan for changed account HTML files found no inline script/style/event handlers.
- PASS - Static forbidden-term scan for changed account/auth UI surfaces found no visible DEV/UAT/PROD/Local API/Local DB/SQLite/Supabase/provider/implementation leak.
- PASS - Targeted account/auth Playwright: `npx playwright test --config=playwright.config.cjs --project=playwright tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs -g "static sign-in page renders|Sign-in page uses|Create Account shows action-safe|Password Reset maps upstream|Protected pages block|Admin and Account Local DB pages"`
- PASS - `npm run test:workspace-v2` because shared Theme V2/session UI behavior changed. The command name is legacy; user-facing language is Project Workspace.
- PASS - Targeted account/auth Playwright was rerun after the Project Workspace lane to refresh Playwright V8 coverage for the changed runtime JS.
- PASS - Manual browser spot check loaded `/account/index.html`, `/account/profile.html`, `/account/preferences.html`, and `/account/security.html` with an authenticated account and confirmed no forbidden provider/environment wording in `main`.
- PASS - `git diff --check`
- SKIPPED - Full samples smoke per request and because samples are not in scope.

## Validation Note
- An initial targeted Playwright run exposed `admin/db-viewer.js` still rendering the removed browser auth provider contract error. The PR fixed that auth/session error surface by using `/api/session/current`; the final targeted rerun passed.

## Manual Validation Notes
- `/account/index.html` status: `Loaded account summary from the account service.`
- `/account/profile.html` status: `Loaded profile identity from the account service.`
- `/account/preferences.html` status: `Loaded current account. Preferences storage is not available yet.`
- `/account/security.html` status: `Loaded current account. Security settings are not available yet.`
- Protected Admin/Account page blocks now show required-access guidance without raw session diagnostics.
- Admin DB Viewer loads through the session API contract and no longer shows the provider-contract unavailable message.

## Playwright V8 Coverage
- PASS - `docs_build/dev/reports/playwright_v8_coverage_report.txt` includes changed browser runtime JS:
  - `admin/db-viewer.js`
  - `assets/theme-v2/js/gamefoundry-partials.js`
  - `assets/theme-v2/js/local-db-page-data.js`
  - `assets/theme-v2/js/account-auth-actions.js`
  - `assets/theme-v2/js/account-auth-service.js`
  - `assets/theme-v2/js/login-session.js`
  - `src/engine/api/server-api-client.js`
- WARN - `src/dev-runtime/server/local-api-router.mjs` is server-side runtime and is not collected by browser V8 coverage; node/API validation from earlier stacked PR work covers this server-side surface.

## Test Data Cleanup
- N/A - This PR did not create persistent validation records. Manual validation used temporary Local DB test storage that the Playwright helper removed.
