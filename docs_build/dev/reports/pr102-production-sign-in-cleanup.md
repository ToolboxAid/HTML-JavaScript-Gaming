# PR_26164_102-production-sign-in-cleanup

## Branch

- Current branch: `main`
- Expected branch: `main`
- Branch validation: PASS

## Uploaded PR_101 Review Summary

- Requested artifact: `tmp/PR_26164_101-db-auth-foundation-fixes_delta.zip`
- Result: WARN, the ZIP was not present in `tmp/`.
- Fallback review source: `docs_build/dev/reports/pr101-db-auth-foundation-fixes.md`.
- PR101 finding carried forward: sign-in reseed was already removed, Admin Site Setup/DB Viewer owned server-side reseed entry points, and the current auth contract still uses `account/sign-in.html`.

## DB User/Password Readiness

- Status: NOT READY.
- Evidence: `src/engine/api/session-api-client.js` exposes `signIn(options)` as `setSessionUser(options.userKey || "")`.
- The current contract supports server session user-key switching for Local DB validation, not DB-backed email/username + password verification.
- This PR does not add password tables, password storage, reset tokens, fake auth, Supabase, MEM DB, or `/login.html`.
- Required follow-up: add a production auth provider contract that supports credential verification, account creation, and password reset without storing passwords in app tables.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read project instructions | PASS | `docs_build/dev/PROJECT_INSTRUCTIONS.md` read before edits. |
| Verify branch `main` | PASS | `git branch --show-current` returned `main`. |
| Review PR101 delta | WARN | Delta ZIP missing; PR101 report reviewed instead. |
| Scope to sign-in cleanup, DB Viewer relocation, grouping color copy | PASS | Changed active pages/JS/tests only in those areas plus required reports. |
| Remove sign-in `Session mode` aside | PASS | `account/sign-in.html` has no `aside[aria-label='Session mode']`. |
| Move Local DB/status/setup card out of sign-in | PASS | Sign-in has no `login-local-status-title`; DB Viewer has `data-admin-db-local-status-card`. |
| Make sign-in production-like | PASS | Sign-in now shows Email or username, Password, Sign In, Create Account, Lost Password, Continue Browsing. |
| Remove quick-login buttons | PASS | Sign-in has no Guest/User/DavidQ buttons or `data-login-user` controls. |
| Do not fake real auth | PASS | Submit shows secure sign-in unavailable; no session user is changed. |
| Create Account route resolves safely | PASS | `account/create-account.html` added and public route registered. |
| Lost Password route resolves safely | PASS | `account/lost-password.html` added and public route registered. |
| Admin DB Viewer owns status/setup controls | PASS | Local DB Status accordion includes API status and `Reseed Local DB`; reseed still calls server admin API. |
| Admin setup status shows PASS/FAIL/WARN/SKIP | PASS | Existing `admin-setup-actions.js` renders WARN during reseed and PASS/FAIL/SKIP statuses. |
| Grouping colors copy cleanup | PASS | `/admin/grouping-colors.html` now says `Group Color Model`. |
| No MEM DB reintroduction | PASS | No runtime MEM/local-mem selector added; remaining `local-mem` references are negative tests/retired-mode guards. |
| No `/login.html` reintroduction | PASS | Active sign-in routes use `account/sign-in.html`; new routes are account pages. |

## Sign-In Production Cleanup Audit

- Removed public Local DB/session picker UI.
- Removed public Local DB status/setup diagnostics from sign-in.
- Replaced quick-login controls with a credential-form shell.
- Submit is intentionally non-authenticating until the production auth provider exists.
- Guest browsing remains available through public navigation (`Continue Browsing`), not through a fake guest login button.

## Demo Login Removal Audit

- Public sign-in removed `data-login-mode`, `data-login-user`, `data-login-user-controls`, `Session mode`, Local DB status fields, and reseed/setup controls.
- Targeted Playwright validates no Guest/User/DavidQ quick-login buttons are present.

## Admin DB Viewer Relocation Audit

- Added `Local DB Status` accordion to Admin DB Viewer inspector.
- Added current URL, detected server mode, local API availability, session endpoint, setup endpoint, reseed button, and setup status.
- `assets/theme-v2/js/admin-db-status-panel.js` reads `/api/session/current` and renders PASS/FAIL status.
- Reseed remains server-owned through `/api/admin/setup/reseed`.

## Grouping Colors Copy Audit

- `Restored Group Color Model` was replaced with `Group Color Model`.
- Playwright validates the new heading and absence of the old heading.

## Sign-In Route Audit

- Added route registrations for `account/create-account.html` and `account/lost-password.html`.
- Updated shared account guard so those pages are public like `account/sign-in.html`.
- No `/login.html` route/file was introduced.

## Guest Save Redirect Note

- No active guest save action exists in the PR102-touched surfaces.
- Existing Game Journey guest validation still shows persistence controls disabled for unauthenticated users.
- Protected Account pages continue to render a sign-in-required screen with a link to `account/sign-in.html?returnTo=...`.

## Search Evidence

- Public sign-in old controls: scoped `rg` for `Session mode|login-local-status-title|data-login-local-status|data-login-mode|data-login-user|data-admin-setup-reseed|data-admin-setup-status|/login\.html|fake-login|local-mem|MEM DB|reseed|setup` in `account/sign-in.html`, `login-session.js`, `create-account.html`, and `lost-password.html` returned no matches.
- DB Viewer relocation: scoped `rg` found `Local DB Status`, `data-admin-db-local-status-card`, `data-admin-setup-reseed`, and status endpoint fields in Admin DB Viewer assets.
- Grouping colors: scoped `rg` found `Group Color Model` and no `Restored Group Color Model` in `admin/grouping-colors.html`.

## Validation Lane Report

- Syntax/static: PASS.
  - `node --check assets/theme-v2/js/gamefoundry-partials.js`
  - `node --check assets/theme-v2/js/login-session.js`
  - `node --check assets/theme-v2/js/admin-db-status-panel.js`
  - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
  - `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`
  - `node --check tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`
  - `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
  - `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- Diff check: PASS, `git diff --check` returned only Windows line-ending warnings.
- Targeted Playwright full set: PASS, 25/25.
  - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- Workspace lane: PASS, 5/5.
  - `npm run test:workspace-v2`
  - Command name is legacy; user-facing language remains current.
- Final coverage-producing targeted run: PASS, 17/17.
  - `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs`

## Playwright / V8 Coverage

- Playwright impacted: Yes.
- V8 report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Coverage status: WARN advisory. `admin-db-status-panel.js` reached 100%, `gamefoundry-partials.js` reached 75%, and existing Admin setup API modules were exercised. The coverage helper also includes previous `HEAD` changed JS files in the advisory list; that is helper behavior, not new PR102 scope.

## Samples

- Full samples smoke: SKIP.
- Reason: Request scoped validation to sign-in, Admin DB Viewer, grouping colors, and workspace-v2. No sample game/runtime smoke lane changed.

## Manual Validation Notes

1. Open `account/sign-in.html`; confirm no Session mode side menu, quick-login buttons, Local DB diagnostics, or reseed/setup controls render.
2. Confirm sign-in fields/actions render: Email or username, Password, Sign In, Create Account, Lost Password.
3. Open `account/create-account.html` and `account/lost-password.html`; confirm both pages resolve and do not implement fake auth.
4. Sign in as Admin through the existing test session API and open `admin/db-viewer.html`; confirm Local DB Status appears in the inspector and reseed status starts at SKIP.
5. Open `/admin/grouping-colors.html`; confirm heading says `Group Color Model`.
