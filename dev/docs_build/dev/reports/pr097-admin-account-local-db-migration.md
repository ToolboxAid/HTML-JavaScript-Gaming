# PR_26164_097-admin-account-local-db-migration

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.

## Scope

- PASS: Scope was limited to Admin and Account Local DB migration targets plus directly associated runtime/test/report files.
- PASS: Toolbox tool runtime behavior was not changed.
- PASS: Supabase was not introduced.
- PASS: MEM DB was not reintroduced.
- PASS: `/login.html` was not used.
- PASS: Fake-login behavior was not added.
- PASS: Custom password storage tables were not added.

## Requirement Checklist

- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Read `docs_build/dev/reports/db-consumer-audit.md` and `docs_build/dev/reports/db-consumer-audit.csv` before implementation.
- PASS: `admin/users.html` now renders users from the Local DB snapshot.
- PASS: `admin/roles.html` now renders roles and user-role assignments from the Local DB snapshot.
- PASS: `admin/site-settings.html` now reads Local DB identity state and fails visibly with a Site Settings table follow-up because no `site_settings` contract exists yet.
- PASS: `account/index.html` now renders the current account summary from Local DB `users`, `roles`, and `user_roles`.
- PASS: `account/profile.html` now renders the current profile identity from Local DB `users` and `user_roles`.
- PASS: `account/preferences.html` now reads current Local DB user identity and fails visibly with an `account_preferences` table follow-up.
- PASS: `account/security.html` now reads current Local DB user identity and fails visibly with an `account_security_settings` provider/table follow-up.
- PASS: Local DB missing/configuration failures show actionable diagnostics through the page status/follow-up panel.
- PASS: Key-based identity records are used from existing `users.key`, `roles.key`, `user_roles.userKey`, and `user_roles.roleKey` fields.
- PASS: Shared record audit checks verify `key`, `createdAt`, `updatedAt`, `createdBy`, and `updatedBy` fields and ownership references to `users.key`.
- PASS: No browser storage was added as product-data source of truth.
- PASS: Unresolved migration items are documented below as FOLLOW-UP REQUIRED with reason.

## Admin/Account Migration Audit

### Migrated To Local DB Read Path

- PASS: `admin/users.html` uses `assets/theme-v2/js/local-db-page-data.js` to load `users`, `roles`, and `user_roles`.
- PASS: `admin/roles.html` uses the same Local DB module to load `roles`, `users`, and `user_roles`.
- PASS: `account/index.html` uses the current session and Local DB identity tables to render account summary.
- PASS: `account/profile.html` uses the current session and Local DB identity tables to render profile identity.

### FOLLOW-UP REQUIRED

- FOLLOW-UP REQUIRED: `admin/site-settings.html` has no `site_settings` Local DB schema/table. The page now fails visibly with that exact diagnostic instead of showing hidden defaults.
- FOLLOW-UP REQUIRED: `account/preferences.html` has no `account_preferences` Local DB schema/table. The page now fails visibly and shows the current Local DB user context.
- FOLLOW-UP REQUIRED: `account/security.html` has no `account_security_settings` Local DB schema/table or external auth-provider security contract. The page now fails visibly and shows the current Local DB user context.

## MEM DB Reintroduction Audit

- PASS: No new MEM DB runtime reference was introduced.
- PASS: Search of changed Admin/Account runtime files found no `MEM DB`, `fake-login`, `fake login`, or `/login.html` references.
- PASS with note: `tests/playwright/tools/LoginSessionMode.spec.mjs` still contains the existing assertion that `[data-login-mode='local-mem']` is absent. This is a validation guard, not a runtime reintroduction.

## Sign-In Route Audit

- PASS: Current sign-in flow remains `account/sign-in.html`.
- PASS: No `/login.html` reference was introduced in changed Admin/Account files.
- PASS: Protected Admin and Account routes still use the existing session guard.

## Browser Storage Audit

- PASS: `assets/theme-v2/js/local-db-page-data.js` does not read or write `localStorage` or `sessionStorage`.
- PASS: Product-data rendering uses the server-backed Local DB snapshot through the existing API client.

## Validation Lane Report

- Impacted lane: Admin/Account Local DB runtime page lane.
- Playwright impacted: Yes.
- Runtime JavaScript changed: Yes.
- Targeted Playwright: `tests/playwright/tools/LoginSessionMode.spec.mjs`.
- Workspace command: `npm run test:workspace-v2`. The command name is legacy; user-facing product language remains Project Workspace per project instructions.
- Samples smoke: SKIP. No samples or sample JSON were changed, and the request did not ask for full samples validation.

## Validation Performed

- PASS: `git branch --show-current` -> `main`.
- PASS: `node --check assets/theme-v2/js/local-db-page-data.js`.
- PASS: `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`.
- PASS: `git diff --check -- .` with only CRLF normalization warnings for touched files.
- PASS: Targeted grep for `<style>`, inline handlers, `/login.html`, fake-login, and MEM DB reintroduction in changed runtime/page files.
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --workers=1 --reporter=list --grep "Admin and Account Local DB pages render"` -> 1 passed.
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --workers=1 --reporter=list` -> 8 passed.
- PASS: `npm run test:workspace-v2` -> 5 passed.

## Playwright Result

- PASS: Admin Users, Roles, Site Settings, Account Home, Profile, Preferences, and Security pages render under allowed Local DB sessions.
- PASS: Users/Roles/Profile/Home render Local DB-backed identity state.
- PASS: Site Settings/Preferences/Security show visible follow-up diagnostics instead of hidden defaults.
- PASS: Protected page access still blocks missing/incorrect roles.

## V8 Coverage

- PASS: `assets/theme-v2/js/local-db-page-data.js` collected by browser V8 coverage at 95%.
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Manual Validation Notes

1. Start the API-backed local server.
2. Open `account/sign-in.html`, select Local DB, and choose `DavidQ`.
3. Open `admin/users.html`; confirm Local DB Users shows DavidQ and users.key values.
4. Open `admin/roles.html`; confirm Local DB Roles shows assigned users.
5. Open `admin/site-settings.html`; confirm the page shows a visible `site_settings` FOLLOW-UP REQUIRED diagnostic.
6. Select `User 1` and open `account/index.html` and `account/profile.html`; confirm user identity is rendered from Local DB.
7. Open `account/preferences.html` and `account/security.html`; confirm visible follow-up diagnostics are shown for missing account-specific contracts.

## Changed Files

- `account/index.html`
- `account/preferences.html`
- `account/profile.html`
- `account/security.html`
- `admin/roles.html`
- `admin/site-settings.html`
- `admin/users.html`
- `assets/theme-v2/js/local-db-page-data.js`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- Required validation/report artifacts under `docs_build/dev/reports/`
