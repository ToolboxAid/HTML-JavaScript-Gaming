# PR_26166_133-site-setup-productionization

## Branch Validation

PASS - Current branch is `main`.

## Scope

PASS - Stayed in the DB/Auth migration lane. This PR productionizes Admin -> Site Setup status ownership without activating Supabase, adding secrets, or changing UAT/PROD behavior.

## Requirement Checklist

- PASS - Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS - Started from PR126-PR132 outputs.
- PASS - Did not activate Supabase automatically.
- PASS - Did not add secrets or dependencies.
- PASS - Did not add password storage or custom password tables.
- PASS - Did not introduce MEM DB, fake-login, or `login.html`.
- PASS - Preserved Browser -> API/Service Contract -> Database.
- PASS - Added server-owned Site Setup status diagnostics.
- PASS - Site Setup reports first admin, default roles, tool metadata bootstrap, starter platform settings, and support categories.
- PASS - Server-side APIs execute setup/status behavior:
  - `POST /api/admin/setup/reseed`
  - `GET /api/admin/setup/status`
  - `POST /api/admin/setup/identity`
- PASS - UI reports visible PASS/WARN/SKIP/FAIL states.
- PASS - No inline scripts, styles, or event handlers were added.

## Site Setup Ownership Evidence

- Added `GET /api/admin/setup/status` in the Local API.
- Added `readAdminSetupStatus()` to `src/engine/api/admin-setup-api-client.js`.
- Updated `admin/site-setup.html` with a Theme V2 button and status table placeholder.
- Updated `assets/theme-v2/js/admin-setup-actions.js` to render server-owned setup rows through DOM methods.
- The status endpoint currently reports:
  - PASS: First Admin
  - WARN: Default Roles missing future `creator`/`guest` role slugs in the current Local DB state
  - PASS: Tool Metadata Bootstrap
  - SKIP: Starter Platform Settings, no active table yet
  - SKIP: Support Categories, no active table yet

## Validation Lane Report

- PASS - `node --check assets/theme-v2/js/admin-setup-actions.js`
- PASS - `node --check src/engine/api/admin-setup-api-client.js`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS - `node --test tests/dev-runtime/SupabaseProviderContractStub.test.mjs` passed 13/13 tests.
- PASS - Direct Local API smoke: `/api/admin/setup/status` returned `200 true WARN areas=5 counts={"PASS":2,"WARN":1,"SKIP":2}`.
- PASS - Targeted Playwright: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs -g "Admin Site Setup"` passed 3/3 tests.
- PASS - `git diff --check`
- PASS - HTML static scan found no inline style blocks, inline script blocks, or inline event handlers in `admin/site-setup.html`; script tags are external.
- PASS/WARN - Playwright V8 coverage generated:
  - PASS `(92%) assets/theme-v2/js/admin-setup-actions.js`
  - PASS `(75%) src/engine/api/admin-setup-api-client.js`
  - WARN Node-side `src/dev-runtime/*` files are not collected by browser V8 coverage and are covered by Node tests.
- SKIP - Full samples smoke: samples are outside this Admin Site Setup scope.

## Manual Validation Notes

- Site Setup no longer presents setup ownership as only static table copy; the page can refresh server-owned status diagnostics.
- Raw DML remains a temporary DEV/review artifact. Runtime setup/status flows are owned by Admin -> Site Setup server APIs.
- Existing banned-term scans found only tests that prove retired `local-mem`/`login.html` paths are absent, plus no real Supabase secret patterns.
