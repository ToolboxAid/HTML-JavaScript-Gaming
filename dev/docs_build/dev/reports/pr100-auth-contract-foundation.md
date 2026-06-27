# PR_26164_100-auth-contract-foundation

## Branch Validation
- PASS: current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Scoped changes to auth provider contract foundation, directly associated sign-in/session consumers, tests, and reports.
- PASS: Did not implement Supabase.
- PASS: Did not reintroduce MEM DB.
- PASS: Did not recreate `login.html`.
- PASS: Did not add fake-login behavior.
- PASS: Did not add custom password storage tables.
- PASS: Did not change UAT/PROD behavior.
- PASS: Added a small provider contract supporting the current Local DB-backed DEV session path and future external providers.
- PASS: Kept sign-in routing aligned to `account/sign-in.html`, not `/login.html`.
- PASS: Exposed clear operations: `getCurrentUser`, `signIn`, `signOut`, and `requireRole`.
- PASS: Missing API/provider configuration fails visibly with actionable diagnostics through the existing protected-page blocker and sign-in diagnostics.
- PASS: No silent fallback to fake login.
- PASS: No hidden default user.
- PASS: No new `localStorage` or `sessionStorage` product-data source of truth was added.
- PASS: No password persistence was added.

## Auth Contract Report
- `src/engine/api/session-api-client.js` now exports:
  - `AUTH_PROVIDER_CONTRACT_OPERATIONS`
  - `getCurrentUser`
  - `signIn`
  - `signOut`
  - `requireRole`
- `assets/theme-v2/js/gamefoundry-partials.js` creates and exposes `window.GameFoundryAuthProvider` with provider id `server-session-api`.
- The shared header/protected-page guard now reads current user, signs out, and checks roles through the provider contract.
- `assets/theme-v2/js/login-session.js` now signs users in through `signIn` and reads users through `getCurrentUser`.
- `admin/db-viewer.js` now reads current session through `window.GameFoundryAuthProvider` instead of directly owning `/api/session/current`.
- The default provider remains the current server session API path for DEV Local DB. It does not create users, roles, passwords, or fake login data.

## Future Supabase Provider Notes
- Supabase is not implemented in this PR.
- Future Supabase Auth can satisfy the same operation names:
  - `getCurrentUser`
  - `signIn`
  - `signOut`
  - `requireRole`
- A future provider must return users/roles through the shared server/API contract and must fail visibly when provider/config is missing.
- No page should store credentials or use browser storage as the auth source of truth.

## MEM DB Reintroduction Audit
- PASS: PR100 diff adds no `MEM DB`, `local-mem`, or `fake-login` references.
- PASS: Active-source scan for `MEM DB|fake-login|fake login|local-mem` found only existing negative/retired-mode tests:
  - `tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
  - `tests/playwright/tools/LoginSessionMode.spec.mjs`
  - `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`

## Sign-In Route Audit
- PASS: Active-source scan for `/login.html|login.html` under `account`, `admin`, `assets`, `src`, and `tests` returned no matches.
- WARN: historical report files under `docs_build/dev/reports/` still mention `login.html`; those are preserved historical artifacts, not active routes.
- PASS: current sign-in page remains `account/sign-in.html`.

## Browser Storage / Password Audit
- PASS: PR100 diff adds no `localStorage` or `sessionStorage` references.
- PASS: PR100 diff adds no password storage.
- WARN: `admin/controls.html` has a pre-existing password input control demo; this is not password persistence and was not changed.

## Changed Files
- `admin/db-viewer.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/js/login-session.js`
- `src/engine/api/session-api-client.js`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `docs_build/dev/reports/pr100-auth-contract-foundation.md`
- Required review artifacts are regenerated separately:
  - `docs_build/dev/reports/codex_review.diff`
  - `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lanes
- Auth/sign-in runtime lane.
- Protected Account/Admin page access lane.
- Static-only local API diagnostics lane.
- DB Viewer session access lane.

## Skipped Lanes
- Samples: SKIP. Samples are not in scope and no sample JSON/runtime behavior changed.
- Engine gameplay/runtime: SKIP. No gameplay engine code changed.
- Toolbox tool behavior: SKIP except guest/protected-page coverage already exercised by auth tests.
- Supabase/UAT/PROD auth: SKIP. PR explicitly excludes implementation and UAT/PROD behavior changes.

## Validation Lane Report
- PASS: `node --check src\engine\api\session-api-client.js`
- PASS: `node --check assets\theme-v2\js\login-session.js`
- PASS: `node --check assets\theme-v2\js\gamefoundry-partials.js`
- PASS: `node --check admin\db-viewer.js`
- PASS: `node --check tests\playwright\tools\LoginSessionMode.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --workers=1 --reporter=list` -> 8 passed.
- PASS: `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs --workers=1 --reporter=list` -> 1 passed.

## Playwright / Coverage
- Playwright impacted: Yes.
- PASS: Sign-in page resolves at `account/sign-in.html`.
- PASS: Provider contract exists in browser with `getCurrentUser`, `signIn`, `signOut`, and `requireRole`.
- PASS: `requireRole("user")` blocks Guest and allows a signed-in Local DB user.
- PASS: Account logout uses the provider sign-out path and protected pages block afterward.
- PASS: Static-only local entrypoint shows actionable API-backed server diagnostics.
- V8 coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Coverage PASS/WARN:
  - `(67%) admin/db-viewer.js`
  - `(67%) src/engine/api/session-api-client.js`
  - `(83%) assets/theme-v2/js/gamefoundry-partials.js`
  - `(93%) assets/theme-v2/js/login-session.js`
  - Server-side changed JS files from the stacked PR remain advisory WARN because browser V8 does not collect server runtime modules.

## Manual Validation Steps
1. Start the local API-backed server.
2. Open `account/sign-in.html`.
3. Confirm Local DB mode loads users and no Guest user is stored.
4. Select a Local DB user and confirm Account pages open.
5. Select Admin and confirm Admin pages open.
6. Use Logout and confirm Account/Admin protected pages show the visible access blocker.
7. Open static `127.0.0.1:5500/account/sign-in.html` and confirm it directs the user to the API-backed local server.

## Packaging
- Required repo-structured ZIP will be written to `tmp/PR_26164_100-auth-contract-foundation_delta.zip`.
