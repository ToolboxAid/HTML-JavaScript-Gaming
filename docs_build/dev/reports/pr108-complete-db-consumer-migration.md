# PR_26164_108-complete-db-consumer-migration

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Scope
- Migrated/verified remaining active DB consumers from the PR096 audit where they represented active runtime/product data.
- No Supabase introduced.
- No MEM DB reintroduced.
- No browser storage product-data SSoT introduced.
- No custom password tables introduced.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before execution.
- PASS: Verified branch `main` before PR108 work.
- PASS: Started from `docs_build/dev/reports/db-consumer-audit.md` and `docs_build/dev/reports/db-consumer-audit.csv`.
- PASS: Active account/admin pages marked Needs migration in PR096 now use `assets/theme-v2/js/local-db-page-data.js` and server/Local DB API-backed session data instead of page-local product records.
- PASS: Active Toolbox pages in the PR096 audit that represent product data are on Local DB/server API paths: Assets, Controls, Objects, Colors, Game Workspace, Game Design, Game Configuration, Game Journey, and Tags.
- PASS: Game Journey guest write behavior now redirects to sign-in and does not write guest records.
- PASS: DB Viewer reflects Local DB/server API-backed state and shows live seed/reseed output.
- PASS: No active MEM/local-mem runtime mode was introduced.
- PASS: No active fake-login behavior exists.
- PASS: No active `/login.html` references exist.
- PASS: No browser page directly seeds authoritative records.
- PASS: No custom password storage exists.
- PASS: Remaining `mock-db` names are compatibility route/module names for Local DB tooling and are documented as naming cleanup, not MEM DB behavior.
- PASS: Remaining static arrays found in active source are non-product UI/editor state, engine algorithms, registry compatibility, or dev-runtime setup inputs, not product-data SSoT.
- PASS: Missing server registry data fails visibly through the Toolbox registry diagnostic instead of silently falling back.

## Remaining DB Consumer Migration Audit

### Now Local DB / Server API
- Account sign-in/session: `assets/theme-v2/js/login-session.js`, `src/engine/api/session-api-client.js`.
- Account pages: `account/index.html`, `account/profile.html`, `account/preferences.html`, `account/security.html` render through `assets/theme-v2/js/local-db-page-data.js`.
- Admin pages: `admin/users.html`, `admin/roles.html`, and related admin Local DB diagnostics render through `assets/theme-v2/js/local-db-page-data.js` or DB Viewer APIs.
- Toolbox registry UI: `toolbox/tools-page-accordions.js` imports `toolbox/tool-registry-api-client.js`, which calls `/toolbox/registry/snapshot`.
- Tool data: active tool clients use server API modules under `src/engine/api` or tool API clients backed by dev-runtime Local DB repositories.

### Needs Review, Not PR108 Migration
- `toolbox/toolRegistry.js`: compatibility wrapper around dev-runtime registry definitions; no active HTML importer found. Recommended follow-up remains tool registry source reduction/naming cleanup.
- `src/dev-runtime/guest-seeds/tool-metadata-inventory.js`: dev-runtime setup source used by server seed/API route; not browser product-data ownership.
- `src/dev-runtime/guest-seeds/tool-state-samples.js`: compatibility re-export to `src/dev-runtime/seed/server-seed-loader.mjs`; no static authoritative non-user seed data remains there.
- Engine browser storage utilities: general engine services remain for future runtime/storage contracts; no active product-data Local DB migration target in this PR.
- Public showcase pages such as `marketplace/index.html`, `games/index.html`, and `index.html`: current content is static marketing/showcase copy, not editable product-data SSoT. Dynamic marketplace/game directory data remains a future product feature.

## Static/Page-Local Product Data Audit
- PASS: Active account/admin identity pages use Local DB page data instead of embedded users/roles product records.
- PASS: Active Toolbox data pages use DB-backed API clients for mutable tool records.
- PASS: Object templates, palette editor arrays, Controls working arrays, and Game Journey view arrays are editor/runtime view state or template/configuration state, not competing persisted product-data SSoT.
- PASS: Static public copy remains allowed as non-product UI text.

## Browser Storage SSoT Audit
- PASS: No active page was found using browser storage as product-data SSoT.
- PASS: `localStorage` findings are limited to dev-runtime Local DB/session compatibility and engine storage utility classes.
- PASS: `src/tools/common/WorkspaceDirtyNotifier.js` remains transient UI coordination and is not product-data ownership.

## MEM Reintroduction Audit
- PASS: Search found no active MEM DB runtime route.
- PASS: `local-mem` references are tests asserting the retired mode is absent/rejected.
- PASS: No fake-login references were found in active source.
- PASS: No active `/login.html` route/link was found.

## Impacted Lane
- runtime: Local DB server/API seed and snapshot behavior inherited from PR106/PR107 stack.
- integration: Admin DB Viewer and account/session pages.
- toolbox: root Toolbox registry route and tool launch/navigation validation.
- reporting/audit: DB consumer migration classification.

## Skipped Lanes
- samples: SKIP. Samples were not changed and samples smoke was not requested.
- engine: SKIP. Engine runtime behavior was not changed for PR108; engine storage findings are documented for future boundary review.
- broad samples/UAT: SKIP. Targeted Admin/Account/Toolbox validation covered PR108 scope.
- legacy `npm run test:workspace-v2`: SKIP for PR108 because targeted affected validation was available and executed; PR106 already ran the legacy command in this stacked sequence.

## Validation Performed
- PASS: `git diff --check` completed with line-ending warnings only.
- PASS: `node --check tests/dev-runtime/DbSeedIntegrity.test.mjs`.
- PASS: `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`.
- PASS: `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`.
- PASS: `node --check toolbox/game-journey/game-journey.js`.
- PASS: `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` (2/2).
- PASS: `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs` (3/3).
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=line` (7/7).
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --reporter=line` (9/9).
- PASS: `npx playwright test tests/playwright/tools/RootToolsFutureState.spec.mjs --reporter=line` (5/5).
- PASS: Search audit for `MEM DB`, `local-mem`, `fake-login`, `fake login`, `/login.html`, and `login.html` found no active runtime regressions. Remaining `local-mem`/`login.html` matches are negative assertions in tests.

## Playwright Result
- PASS: Admin DB Viewer passed 7/7.
- PASS: Login Session passed 9/9.
- PASS: Root Tools Future State passed 5/5.

## V8 Coverage
- WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced. Server-side Node modules and test files are reported as WARN when browser V8 cannot collect them; this is advisory per project instructions.

## Manual Validation Steps
1. Open `account/sign-in.html` and confirm no public Local DB setup/reseed controls are present.
2. Open `admin/db-viewer.html` as admin and confirm Local DB tables render live data.
3. Trigger Admin Site Setup reseed and confirm users/roles/tool records refresh.
4. Open `toolbox/index.html` and confirm tools render from the registry API route.
5. Open `toolbox/game-journey/index.html?game=demo-game` as guest, click Add Item, and confirm sign-in redirect.

## Required Search Evidence
- `rg -n "MEM DB|local-mem|fake-login|fake login|/login\.html|login\.html" account admin assets toolbox src tests ...`: only negative test assertions remain for `local-mem` and `/login.html`.
- `rg -n "toolRegistry\.js|TOOL_REGISTRY|toolRegistry" toolbox src assets admin account ...`: active Toolbox UI uses API client; compatibility wrapper has no active HTML importer.
- `rg -n "localStorage|sessionStorage|indexedDB|document\.cookie" account admin assets toolbox src/engine src/dev-runtime ...`: findings are dev-runtime Local DB/session helpers or engine utility services, not browser page product-data SSoT.

## Changed Files
See `docs_build/dev/reports/codex_changed_files.txt` for the full stacked working-tree file list. PR108-specific output is this report plus validation/report artifact refreshes; product-data migration code had already landed in the stacked PR103-PR107 changes and was validated here.

## Samples Decision
- SKIP: Full samples smoke was not run because PR108 does not change samples and targeted Admin/Account/Toolbox DB validation covered the requested behavior.

## Completion
- PASS: Every requested PR108 item is implemented, validated, or classified as no active product-data migration needed, with follow-up ownership documented for naming/boundary review items.
