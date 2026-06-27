# PR_26164_107-guest-seed-data-migration

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Scope
- Guest seed data ownership and guest read-only behavior only.
- No Supabase introduced.
- No MEM DB reintroduced.
- No guest write behavior added.
- No hidden fallback seed data added.

## Requirement Checklist
- PASS: Grouped guest seed data exists under `docs_build/database/seed/guest/`.
- PASS: Guest seed data exists for all 33 active tools from the active tool registry.
- PASS: Existing DB group files for Asset and Palette were preserved as group files while their guest package tool keys now align with active `assets` and `colors` tools.
- PASS: Every guest package is marked `readOnly: true`.
- PASS: Every guest package is marked `writableByGuest: false`.
- PASS: Every guest package carries `signInRedirect: account/sign-in.html`.
- PASS: Guest sample packages use `sampleKind: toolSeed`, not `toolState`.
- PASS: Server seed tables contain zero guest rows in `tool_state_samples`.
- PASS: DB Viewer no longer classifies guest seed packages as active runtime Tool State Samples.
- PASS: Guest write actions in Game Journey redirect to `account/sign-in.html` instead of writing or silently doing nothing.
- PASS: Guest users can view allowed Toolbox pages without persistence access.

## Guest Seed Ownership Audit
- Active tool registry count: 33.
- Guest seed package count: 33.
- Missing active guest packages: none.
- Guest seed source: `docs_build/database/seed/guest/`.
- Server route: `/api/guest/seed`.
- Guest package loader path: `src/dev-runtime/server/mock-api-router.mjs` reads `docs_build/database/seed/guest/*.json`.

## Tool State Samples Cleanup Audit
- `createServerSeedTables()` produced 4 user-owned `tool_state_samples` rows.
- Guest `tool_state_samples` count: 0.
- Admin DB Viewer Playwright verifies Tool State Samples does not contain `Guest Game Journey starter`.
- Guest packages are exposed separately through `/api/guest/seed`.

## Guest Save Redirect Audit
- `toolbox/game-journey/game-journey.js` now guards write handlers for guest sessions and redirects to `../../account/sign-in.html`.
- Covered handlers: Add Item, form save/update, Move Up, Move Down, Indent, Outdent, Add Note, Add Note Type.
- Playwright validates the guest Add Item action routes to `/account/sign-in.html`.

## Impacted Lane
- runtime: dev-runtime guest seed package routing and seed integrity.
- integration: Admin DB Viewer guest package classification.
- tool runtime: Game Journey guest write redirect behavior.
- account/session: Login Session guest/access validation.

## Skipped Lanes
- samples: SKIP. Samples were not changed and full samples smoke was not requested.
- engine: SKIP. Engine runtime behavior was not changed.
- legacy `npm run test:workspace-v2`: SKIP for PR107 because targeted guest/tool validation was available and passed; the PR request only required the legacy command when targeted validation was unavailable.

## Validation Performed
- PASS: `node --check tests/dev-runtime/DbSeedIntegrity.test.mjs`
- PASS: `node --check tests/playwright/tools/AdminDbViewer.spec.mjs`
- PASS: `node --check tests/playwright/tools/LoginSessionMode.spec.mjs`
- PASS: `node --check toolbox/game-journey/game-journey.js`
- PASS: JSON parse check for all files under `docs_build/database/seed/guest/`.
- PASS: `git diff --check` completed with line-ending warnings only.
- PASS: `node --test tests/dev-runtime/DbSeedIntegrity.test.mjs` (2/2).
- PASS: `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs` (3/3).
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=line` (7/7 on isolated rerun; an earlier parallel wrapper timed out before the isolated rerun passed).
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs -g "Guest can explore allowed Toolbox pages without persistence access" --reporter=line` (1/1).
- PASS: `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --reporter=line` (9/9).

## Playwright Result
- PASS: Admin DB Viewer targeted lane passed 7/7.
- PASS: Login Session targeted lane passed 9/9.

## V8 Coverage
- WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced. Some changed server-side Node modules are listed as WARN because browser V8 coverage does not collect Node server modules; this is advisory per project instructions.

## Manual Validation Steps
1. Open `admin/db-viewer.html` through the dev server.
2. Confirm `/api/guest/seed` reports read-only guest packages.
3. Confirm Tool State Samples does not show guest package rows.
4. Open `toolbox/game-journey/index.html?game=demo-game` as a guest.
5. Confirm the page renders for public browsing.
6. Click Add Item and confirm navigation to `account/sign-in.html`.

## Changed Files
See `docs_build/dev/reports/codex_changed_files.txt` for the full stacked working-tree file list. PR107-specific changes include:
- `docs_build/database/seed/guest/*.json`
- `toolbox/game-journey/game-journey.js`
- `tests/dev-runtime/DbSeedIntegrity.test.mjs`
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`

## Samples Decision
- SKIP: Full samples smoke was not run because PR107 does not change samples and targeted guest/tool validation covered the requested behavior.

## Completion
- PASS: Every requested PR107 item is implemented, validated, and explicitly marked PASS or SKIP with rationale.
