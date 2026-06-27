# PR_26167_189-owner-role-branding-and-footer-banner

## Summary
- Extended the platform banner renderer so one active platform-settings banner renders under the header and another renders directly above the footer.
- Added the `owner` role to DEV identity seeds and synced DavidQ as owner, admin, and creator while keeping User 1, User 2, and User 3 creator-only.
- Moved the former Admin My Stuff navigation items into a role-gated top-level Owner menu.
- Replaced user-facing compact company/legal text in active page HTML from `GameFoundryStudio` to `Game Foundry Studio LLC`.

## Branch Validation
- PASS: current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Hard stop branch guard satisfied on `main`.
- PASS: Active banner renders directly under `header.site-header`.
- PASS: Active banner renders directly above `footer.footer`.
- PASS: Platform banner data remains API/service-backed from `/api/platform-settings/banner`; no browser-owned banner data was added.
- PASS: User-facing company/legal page text now uses `Game Foundry Studio LLC` in changed active HTML surfaces.
- PASS: Technical identifiers, filenames, package names, and routes were not renamed except the required internal Admin My Stuff to Owner navigation data contract.
- PASS: Added `owner` role slug to DEV identity role definitions and seed manifests.
- PASS: DavidQ has owner, admin, and creator roles.
- PASS: User 1, User 2, and User 3 remain creator-only.
- PASS: Admin > My Stuff items now render under top-level Owner menu.
- PASS: Owner menu displays only when `/api/session/current` resolves a signed-in user with `owner`.
- PASS: Admin menu still displays for signed-in users with `admin`.
- PASS: Changed HTML files contain no inline scripts, style blocks, or inline event handlers.
- PASS: No DEV/UAT/PROD browser branching was added.
- PASS: No local-db/mock-db/SQLite fallback was added.
- PASS: No secrets or `.env.local` changes are included.

## DavidQ Role Evidence
- PASS: DEV identity sync result status `PASS`.
- PASS: before/after Auth user count: 4 -> 4.
- PASS: before/after public.users count: 4 -> 4.
- PASS: identity initialization wrote roles: 5, user_roles: 6, users: 4.
- PASS: required roles active: admin=true, creator=true, guest=true, owner=true.
- PASS: role evidence from sync:
  - User 1 creator: true.
  - User 2 creator: true.
  - User 3 creator: true.
  - DavidQ creator: true.
  - DavidQ admin: true.
  - DavidQ owner: true.
- PASS: no non-DavidQ admin assignments.
- PASS: no non-DavidQ owner assignments.
- PASS: live API sign-in for `qbytes.dq@gmail.com` returned HTTP 200.
- PASS: live `/api/session/current` returned authenticated DavidQ with roleSlugs `admin`, `creator`, and `owner`.

## Footer Banner Render Evidence
- PASS: Targeted Playwright asserted `[data-platform-banner]` count is 2 for an active banner.
- PASS: Targeted Playwright asserted `[data-platform-banner-placement='header']` contains the active message and is directly after the header/before main.
- PASS: Targeted Playwright asserted `[data-platform-banner-placement='footer']` contains the active message and is directly above the footer.
- PASS: Targeted Playwright asserted both rendered banner placements are full document width.
- PASS: Targeted Playwright asserted disabling the banner removes all `[data-platform-banner]` elements.

## Owner Menu Evidence
- PASS: API navigation response now exposes `ownerMenuItems` for DB Viewer, Design System, Grouping Colors, and Notes.
- PASS: Browser partial renders a top-level Owner menu from `ownerMenuItems`.
- PASS: Admin submenu no longer nests Owner/My Stuff items.
- PASS: Targeted Playwright role-gating evidence:
  - unauthenticated with owner/admin/creator roleSlugs in mocked payload: Owner hidden, Admin hidden.
  - `admin`, `creator`: Admin visible, Owner hidden.
  - `owner`, `creator`: Owner visible, Admin hidden.
  - `owner`, `admin`, `creator`: Owner visible, Admin visible.

## Brand Text Replacement Evidence
- PASS: Changed active HTML surfaces replaced compact `GameFoundryStudio` page/legal display text with `Game Foundry Studio LLC`.
- PASS: `rg -n "GameFoundryStudio|LLC LLC" index.html account admin assets/theme-v2/partials src/dev-runtime/admin -g "*.html"` returned no matches.
- PASS: UTF-8 BOM cleanup check returned no changed files starting with a BOM.

## Validation Lane Report
- contract lane:
  - PASS: `node --check` for changed JS/MJS files.
  - PASS: `node --test tests/dev-runtime/SupabaseDevCreatorIdentitySeedSync.test.mjs`.
  - PASS: changed HTML inline script/style/event-handler guard.
  - PASS: `git diff --check`.
- runtime lane:
  - PASS: `npm run validate:supabase-dev`.
  - WARN: direct PostgreSQL TLS check reported `SELF_SIGNED_CERT_IN_CHAIN`; REST/API identity readiness passed and the command overall result was PASS.
  - PASS: `node --use-system-ca .\scripts\sync-supabase-dev-creator-identities.mjs --json`.
  - PASS: live API sign-in and `/api/session/current` role resolution for DavidQ.
- integration lane:
  - PASS: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --grep "Platform banner renders|Platform Settings Admin controls|Owner menu is role-gated" --workers=1`.
  - PASS: `npm run validate:browser-env-agnostic`.
- skipped lanes:
  - SKIP: full samples smoke, per request.
  - SKIP: `npm run test:workspace-v2`; no Project Workspace runtime, API/session toolState behavior, or workspace contract behavior changed. The command name remains legacy and user-facing language is Project Workspace.

## Manual Validation Notes
- Live DavidQ sign-in was validated through `POST /api/auth/sign-in` using the configured DEV account connection. The password was not printed, logged in the report, or committed.
- Live `/api/session/current` returned HTTP 200 with authenticated DavidQ and roleSlugs `admin`, `creator`, and `owner`.
- No UAT or PROD resources were touched.
- No validation-only Supabase test records were created. DEV identity sync reported `testDataCreated: 0`, `testDataDeleted: 0`, and `deletedRecords: []`.

## Playwright V8 Coverage
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` generated.
- PASS: `(78%) assets/theme-v2/js/gamefoundry-partials.js - executed lines 734/734; executed functions 51/65`.
- PASS: `(100%) assets/theme-v2/js/admin-platform-settings.js - executed lines 90/90; executed functions 15/15`.
- WARN: server-side dev-runtime JS files are listed as advisory missing browser V8 coverage because Playwright/Chromium does not collect Node-side modules.
