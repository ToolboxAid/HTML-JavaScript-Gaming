# PR_26164_099-site-setup-foundation

## Branch Validation
- PASS: current branch is `main`.
- Expected branch: `main`.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Scoped implementation to Admin Site Setup foundation, route/menu wiring, and targeted Admin Playwright coverage.
- PASS: Created `admin/site-setup.html` as a Theme V2 foundation/planning UI only.
- PASS: Admin top route now resolves to `admin/site-setup.html`.
- PASS: Admin menu API includes `Site Setup` with route `admin-site-setup`.
- PASS: Site Setup names future controlled setup ownership for default roles, first admin, tool metadata bootstrap, starter platform settings, and ticket/support categories.
- PASS: No Supabase implementation was introduced.
- PASS: No UAT/PROD setup execution was added.
- PASS: No MEM DB, `local-mem`, fake-login, `/login.html`, or `login.html` references were introduced in PR099 touched files.
- PASS: No custom password storage tables were added.
- PASS: DDL/DML review artifacts were preserved.
- PASS: No unrelated DB consumer migration was added.
- PASS: Runtime setup actions were not added, so there is no silent setup fallback and no hidden setup defaults.

## Site Setup Ownership Report
- `admin/site-setup.html` is the future owner page for controlled setup/seed behavior.
- Current PR state is foundation only: the page shows disabled preview controls and a visible status: `Wireframe only. Site setup actions are not read, written, or executed.`
- Future setup areas represented on the page:
  - Default Roles
  - First Admin
  - Tool Metadata Bootstrap
  - Starter Platform Settings
  - Ticket/Support Categories
- No Local DB write contract for setup execution was introduced in this PR.

## DDL/DML Location Audit
- PASS: `rg --files docs src | rg "\.sql$"` returned no active SQL files under `docs/` or `src/`.
- PASS: DDL remains under `docs_build/database/ddl/dev-app-identity-schema.sql`.
- PASS: temporary DEV/review setup DML remains under `docs_build/database/dml/dev-app-identity-temporary-setup-review.sql`.
- PASS: DML file retains DEV/review-only language, including `DEV review only. Codex may execute DEV database setup only.`

## MEM DB Reintroduction Audit
- PASS: `rg -n "MEM DB|local-mem|fake-login|/login\.html|login\.html" admin\site-setup.html assets\theme-v2\js\gamefoundry-partials.js src\dev-runtime\server\mock-api-router.mjs tests\playwright\tools\AdminPlatformToolsWireframes.spec.mjs` returned no matches.

## Sign-In Route Audit
- PASS: PR099 did not add `/login.html` or `login.html`.
- PASS: Existing protected-page session guard continues to use the current sign-in route through `routeHref("sign-in")`.

## Changed Files
- `admin/site-setup.html`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `src/dev-runtime/server/mock-api-router.mjs`
- `tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- `docs_build/dev/reports/pr099-site-setup-foundation.md`
- Required review artifacts are regenerated separately:
  - `docs_build/dev/reports/codex_review.diff`
  - `docs_build/dev/reports/codex_changed_files.txt`

## Impacted Lanes
- Admin Site Setup page/render lane.
- Admin navigation route/menu lane.
- Shared header route resolution lane.

## Skipped Lanes
- Samples: SKIP. Samples are not in scope and no sample JSON/runtime behavior changed.
- Engine: SKIP. No engine files changed.
- Account/Admin Local DB migration lanes from PR097: SKIP except where stacked tests already use current Admin Users status.
- Toolbox DB migration lanes from PR098: SKIP except workspace-v2 shared navigation guardrail.

## Validation Lane Report
- PASS: `node --check assets\theme-v2\js\gamefoundry-partials.js`
- PASS: `node --check src\dev-runtime\server\mock-api-router.mjs`
- PASS: `node --check tests\playwright\tools\AdminPlatformToolsWireframes.spec.mjs`
- PASS: HTML restriction scan on `admin/site-setup.html` found no `<style>`, inline styles, inline handlers, or inline script blocks.
- PASS: Targeted Site Setup Playwright: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --workers=1 --reporter=list --grep "Site Setup"` -> 1 passed.
- PASS: Full affected Admin platform spec after stacked expectation alignment: `npx playwright test tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs --workers=1 --reporter=list` -> 6 passed.
- PASS: `npm run test:workspace-v2` -> 5 passed. Command name is legacy; active stacked product language uses Game Workspace.

## Playwright / Coverage
- Playwright impacted: Yes, because shared route/menu JavaScript changed.
- PASS: Admin Site Setup route renders and preserves Theme V2 wireframe structure.
- PASS: Admin header route resolves to `admin/site-setup.html`.
- PASS: Admin submenu exposes `Site Setup`.
- V8 coverage report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- Coverage PASS/WARN:
  - `(76%) assets/theme-v2/js/gamefoundry-partials.js`
  - `(0%) src/dev-runtime/server/mock-api-router.mjs` WARN: server-side runtime JS is not collected by browser V8 coverage; advisory only.

## Manual Validation Steps
1. Start the local API-backed server.
2. Sign in as a Local DB Admin user.
3. Open Admin from the header and confirm it lands on Site Setup.
4. Confirm the page shows the setup ownership table and disabled foundation-only controls.
5. Confirm DDL/DML review notes point to `docs_build/database/ddl/` and `docs_build/database/dml/`.

## Packaging
- Required repo-structured ZIP will be written to `tmp/PR_26164_099-site-setup-foundation_delta.zip`.
