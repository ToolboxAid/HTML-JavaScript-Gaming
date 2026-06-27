# PR_26167_175-runtime-environment-branch-audit

## Summary
- Audited browser, account, API, auth, data, storage, and dev-runtime surfaces for DEV/UAT/PROD/provider branching.
- Classified findings as `BLOCKER`, `OK`, or `TEMP`.
- Made no runtime behavior changes in this PR.

## Branch Validation
- PASS - Current branch was `main`.

## Requirement Checklist
- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before audit work.
- PASS - Hard-stopped branch check passed on `main`.
- PASS - Audited account/browser surfaces, API/service clients, auth/provider config, data/storage viewer helpers, and dev-runtime server/provider code.
- PASS - Searched requested terms: `dev`, `uat`, `prod`, `local`, `Local API`, `SQLite`, `Supabase`, `postgres`, `provider`, and `unavailable`.
- PASS - Classified findings as `BLOCKER`, `OK`, or `TEMP`.
- PASS - Did not change runtime behavior.
- PASS - Ran static/doc validation only.
- PASS - Did not run Playwright because this audit changed no runtime code or audit tooling.

## Audit Scope
- Account pages: `account/sign-in.html`, `account/create-account.html`, `account/password-reset.html`, `account/lost-password.html`, `account/index.html`, `account/profile.html`, `account/preferences.html`, `account/security.html`.
- Browser account/auth modules: `assets/theme-v2/js/login-session.js`, `assets/theme-v2/js/account-auth-actions.js`, `assets/theme-v2/js/gamefoundry-partials.js`, `assets/theme-v2/js/local-db-page-data.js`.
- API/data/storage modules: `src/engine/api/server-api-client.js`, `src/engine/api/local-db-viewer-ui.js`, `src/engine/api/local-db-api-client.js`, `src/engine/api/session-api-client.js`, `src/engine/persistence/*`.
- Dev-runtime code: `src/dev-runtime/server/local-api-router.mjs`, `src/dev-runtime/auth/provider-contract-stubs.mjs`, `src/dev-runtime/persistence/*`, `src/dev-runtime/testing/*`, `src/dev-runtime/admin/*`, `src/dev-runtime/seed/*`.

## Findings

### BLOCKER
- `assets/theme-v2/js/gamefoundry-partials.js:5` changes browser behavior by localhost/port and redirects local browser traffic to the local API port. This is page behavior based on local deployment shape, not only connection config.
- `assets/theme-v2/js/gamefoundry-partials.js:181` and `assets/theme-v2/js/gamefoundry-partials.js:313` change Admin navigation by session mode prefix (`local-*`) and show/hide Local Admin My Stuff items.
- `assets/theme-v2/js/gamefoundry-partials.js:346` and `assets/theme-v2/js/gamefoundry-partials.js:401` special-case static local entrypoints for account/session behavior.
- `account/index.html:26`, `account/profile.html:26`, `account/preferences.html:26`, and `account/security.html:26` render account pages as Local DB pages through `data-local-db-page`.
- `assets/theme-v2/js/local-db-page-data.js:1` and `assets/theme-v2/js/local-db-page-data.js:47` make account/admin page data explicitly Local DB-owned in browser code.
- `src/engine/api/local-db-viewer-ui.js:43` through `src/engine/api/local-db-viewer-ui.js:61` changes Admin DB Viewer page labels and source text based on `local-db` versus `supabase-postgres` provider metadata.

### TEMP
- `assets/theme-v2/js/login-session.js:57` and `assets/theme-v2/js/login-session.js:100` special-case static localhost sign-in page loading, but currently use the documented production-safe placeholder `Sign In is not available in this preview. You can continue browsing.`
- `assets/theme-v2/js/account-auth-actions.js:20` and `assets/theme-v2/js/account-auth-actions.js:70` special-case static localhost Create Account and Password Reset loading, but currently use documented production-safe placeholders for account creation and password reset.
- `assets/theme-v2/js/account-auth-actions.js:8` and `assets/theme-v2/js/login-session.js:8` retain the generic unavailable message for action/provider failure paths. Follow-up PRs should normalize user-facing text without removing actionable server diagnostics.

### OK
- `src/dev-runtime/auth/provider-contract-stubs.mjs:106`, `src/dev-runtime/auth/provider-contract-stubs.mjs:117`, and `src/dev-runtime/auth/provider-contract-stubs.mjs:121` are server/dev-runtime connection selectors for auth and database providers.
- `src/dev-runtime/server/local-api-router.mjs:185` through `src/dev-runtime/server/local-api-router.mjs:210` documents server-side adapter metadata for Local DB/UAT/Prod deployment labels.
- `src/dev-runtime/server/local-api-router.mjs:1200`, `src/dev-runtime/server/local-api-router.mjs:1208`, `src/dev-runtime/server/local-api-router.mjs:1216`, and `src/dev-runtime/server/local-api-router.mjs:1242` fail visibly when a server route requires a selected provider.
- `src/dev-runtime/server/local-api-router.mjs:1704` through `src/dev-runtime/server/local-api-router.mjs:1906` is server-side Supabase readiness/preflight diagnostics.
- `src/engine/api/server-api-client.js:16` and `src/engine/api/server-api-client.js:121` are connection diagnostics for missing API routes, not browser-owned provider selection.
- `src/dev-runtime/testing/supabase-dev-auth-test-user-cleanup.mjs` is DEV-only cleanup tooling and refuses non-DEV modes.
- `src/dev-runtime/admin/*` is explicitly dev-runtime-only admin notes tooling.

## Validation Lane Report
- PASS - Scoped `rg` search across account, Theme V2 browser JS, engine API/persistence, and dev-runtime code for requested environment/provider terms.
- PASS - Reviewed target files and classified findings without runtime edits.
- PASS - `git diff --check`
- SKIPPED - Playwright: no runtime code or audit tooling changed.
- SKIPPED - Full samples smoke: not in scope.

## Manual Validation Notes
- Manual UI validation was not run because this PR is an audit-only report with no behavior changes.
- The audit identified follow-up implementation work for PR_26167_176 through PR_26167_179.
