# PR_26167_187-live-db-cleanup-and-platform-banner

## Branch Validation

PASS - current branch is `main`.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Instructions read before implementation. |
| Hard stop unless current branch is `main` | PASS | `git branch --show-current` returned `main`. |
| Fix DavidQ sign-in failure by syncing `user_roles` to existing role keys | PASS | DEV identity sync deleted stale role references and recreated expected assignments. |
| User 1, User 2, User 3 are creator only | PASS | Live sync role evidence reported creator PASS for all three canonical test users and no unexpected assignments. |
| DavidQ is admin and creator | PASS | Live sync role evidence and live sign-in/session validation returned `creator` and `admin`. |
| Remove stale/missing role key references including `01KV6FVP0ASR2RRR9WXCBKTV6C` | PASS | Live sync deleted 4 stale `user_roles` rows for that role key; stale key verification PASS. |
| Remove `mock-db-store.js` if no active live path requires it | PASS | File retained only because active legacy tool repository helpers still import it for seed/schema compatibility; no active SQLite/open/fallback route uses it. |
| Rename `MOCK_DB_KEYS` to `SEED_DB_KEYS` in server seed/runtime work | PASS | New `src/dev-runtime/seed/seed-db-keys.mjs`; server seed loader, identity sync, cleanup tooling, and touched tests use `SEED_DB_KEYS`. |
| Remove mock-db/local-db wording from active startup/routes | PASS | Startup output has configured connection wording only; `/api/local-db` and `/api/mock-db` are inactive service routes. |
| Review `local-api-router.mjs` as the single service contract router | PASS | Router kept as legacy filename/export for `dev:local-api`, with implementation comments and runtime wording updated to configured server API contract. |
| Add platform-settings banner support using platform-settings as SSoT | PASS | Public `/api/platform-settings/banner` and admin `/api/admin/platform-settings/banner` routes read/write `platform_settings`. |
| Render centered 100%-width banner under header when active | PASS | `gamefoundry-partials.js` renders `.platform-banner` under the header from active platform settings. |
| Support temporary data notices and outage notices through data only | PASS | Banner `kind` supports `temporary-data` and `outage`; browser logic does not branch on deployment names. |
| Add Admin Preferences controls through API/service contract | PASS | `admin/platform-settings.html` and `assets/theme-v2/js/admin-platform-settings.js` view/update banner data through API client. |
| No SQLite/local-db/mock-db fallback | PASS | No active route fallback; startup scan found no SQLite/local-db/mock-db/provider-selection wording. |
| No browser-owned product data | PASS | Banner and account/session changes use server API clients only. |
| No DEV/UAT/PROD branching in browser logic | PASS | `npm run validate:browser-env-agnostic` PASS. |
| No inline script/style/event handlers | PASS | Targeted HTML scan for `admin/platform-settings.html` found none. |

## DavidQ Role Repair Evidence

- Live DEV identity sync status: PASS.
- Before counts: Auth users 4, `public.users` 4, canonical Auth users 4, canonical public users 4, extra managed identities 0.
- After counts: Auth users 4, `public.users` 4, canonical Auth users 4, canonical public users 4, extra managed identities 0.
- Deleted stale role rows: 4 rows with role key `01KV6FVP0ASR2RRR9WXCBKTV6C`.
- Verification failures: none.
- Role evidence: User 1 creator PASS, User 2 creator PASS, User 3 creator PASS, DavidQ creator PASS, DavidQ admin PASS.
- Live sign-in/session evidence: `POST /api/auth/sign-in` returned HTTP 200, `sessionResolved: true`; `/api/session/current` returned HTTP 200, authenticated true, roles `creator` and `admin`.
- Password value was not printed, logged, written to reports, or committed.

## Mock/Local DB Removal Evidence

- `npm run dev:local-api` startup output:
  - `GameFoundry API runtime server running at http://127.0.0.1:5501/account/sign-in.html`
  - `Configured account connection: configured.`
  - `Configured product data connection: configured.`
- Startup scan PASS for absence of `SQLite`, `local-db`, `mock-db`, `provider selection`, `auth provider`, `product data provider`, `GAMEFOUNDRY_AUTH_PROVIDER`, and `GAMEFOUNDRY_DB_PROVIDER`.
- Targeted node test PASS: legacy `/api/local-db` and `/api/mock-db` endpoints are not active service routes.
- `mock-db-store.js` remains as a compatibility seed/schema module required by existing tool repository helpers; this PR removed active startup/route fallback ambiguity rather than renaming the broader legacy file graph.

## Platform Banner Validation Evidence

- Live admin banner contract probe PASS:
  - Admin sign-in HTTP 200.
  - `GET /api/admin/platform-settings/banner` HTTP 200.
  - `POST /api/admin/platform-settings/banner` HTTP 200.
  - `GET /api/platform-settings/banner` HTTP 200.
  - Public banner became active with `kind: temporary-data` and `tone: warning`.
  - Original banner settings restored successfully; after-read matched original settings.
- Playwright PASS: banner renders under the header at document width from active platform settings.
- Playwright PASS: Admin Preferences controls update banner data through the service route.

## Validation Lane Report

| Lane | Result | Notes |
| --- | --- | --- |
| `node --check` for changed JS/MJS files | PASS | Runtime, API client, admin controller, scripts, and changed tests parsed. |
| `npm run validate:supabase-dev` | PASS | Supabase reachable; Auth/service role/users/roles/user_roles PASS. Direct DB TLS warning is existing advisory. |
| DEV identity sync live | PASS | Canonical users synced; stale role key removed; DavidQ creator/admin evidence PASS. |
| `npm run dev:local-api` startup | PASS | Clean configured connection wording; no SQLite/local-db/mock-db/provider-selection startup wording. |
| Targeted auth/session validation | PASS | Live DavidQ sign-in and `/api/session/current` returned authenticated user with creator/admin roles. |
| Targeted provider/API validation | PASS | `node --test tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs tests/dev-runtime/SupabaseProductDataCutover.test.mjs` passed 7/7. |
| Targeted provider contract auth subset | PASS | 5/5 selected provider-contract auth tests passed. |
| Targeted Admin Preferences/platform-settings validation | PASS | Live banner route probe restored original settings; scoped Playwright checks passed. |
| `npm run validate:browser-env-agnostic` | PASS | Report written to `docs_build/dev/reports/environment_agnostic_browser_gate_report.md`. |
| Targeted Playwright | PASS | `npx playwright test tests/playwright/account/SupabaseSignInSession.spec.mjs tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --grep "account sign in resolves|Platform banner renders|Platform Settings Admin controls" --workers=1` passed 3/3. |
| Playwright V8 coverage | PASS | Report written to `docs_build/dev/reports/playwright_v8_coverage_report.txt`; changed browser runtime files were covered. |
| Full samples smoke | NOT RUN | Explicitly excluded by request. |

## Manual Validation Notes

- Confirmed `main` branch before work and before packaging.
- Confirmed no `.env.local` or secret files are included.
- Confirmed no `.log` files were created in repo `tmp`.
- The live banner validation temporarily wrote a validation banner through the admin API and restored the original `platform_settings` rows before packaging.
- Full-tree `git diff --check` is blocked by pre-existing unrelated trailing whitespace in `docs_build/dev/admin-notes/index.txt`; scoped PR-owned diff check passed and the unrelated file was not modified by this PR.

