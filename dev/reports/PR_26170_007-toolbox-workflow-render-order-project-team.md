# PR_26170_007-toolbox-workflow-render-order-project-team

## Branch Validation

PASS - Current branch verified as `main`.

## Requirement Checklist

- PASS - Toolbox grouped rendering no longer alphabetizes cards inside groups. `toolbox/tools-page-accordions.js` uses `compareByWorkflowOrder` for grouped card ordering.
- PASS - Toolbox groups render by declared Game Journey order from source order. The targeted Playwright grouped-view check asserted `GAME_JOURNEY_GROUP_ORDER`.
- PASS - Create group renders in required workflow order: `Game Workspace`, `Project Team`, `Game Configuration`, `Tags`. Covered by source validation and Playwright.
- PASS - Existing `users` tool was moved into Create as `Project Team` without changing its route (`toolbox/users/index.html`) or planned status.
- PASS - `Users` is no longer exposed as a Toolbox tile under Share, Account, Platform, or any non-Create group. API snapshot validation confirms `id: users` displays as `Project Team` with `group/category/toolboxGroup: Create`.
- PASS - User-facing Toolbox copy uses `Project Team` for project-specific team assignment. `Studio Team` remains documented as the account-level roster distinction.
- PASS - No database source contract was replaced. A one-tool source-controlled metadata sync keeps the configured DB-backed Toolbox metadata aligned for the governed `users` -> `Project Team` move while leaving other tool metadata rows owner-editable.

## Validation Lane Report

- PASS - `node --check toolbox/tools-page-accordions.js`
- PASS - `node --check src/shared/toolbox/tool-metadata-inventory.js`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- PASS - `node --check tests/playwright/tools/RootToolsFutureState.spec.mjs`
- PASS - `node --check tests/playwright/tools/ToolboxAdminMetadataSsot.spec.mjs`
- PASS - HTML inline guard: `rg -n "<style|\\sstyle=|\\son[a-z]+=" toolbox/users/index.html` returned no matches.
- PASS - Targeted source/API validation confirmed shared inventory, API registry snapshot, grouped renderer mapping, Create workflow order, and Project Team page copy.
- PASS - `git diff --check` completed with no whitespace errors; only existing Windows line-ending warnings were reported.

## Playwright Result

- PASS - `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --grep "toolbox grouped view renders Game Journey order" --workers=1 --reporter=list`
- PASS - `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --grep "toolbox index shows wireframe and beta tools" --workers=1 --reporter=list`

## Coverage Notes

- Generated advisory Playwright V8 reports:
  - `docs_build/dev/reports/playwright_v8_coverage_report.txt`
  - `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- Browser coverage exercised `toolbox/tools-page-accordions.js`.
- Server-side `src/dev-runtime/server/local-api-router.mjs` and shared metadata inventory are not browser-collected by V8 coverage; targeted Node/API validation covered those paths.

## Skipped Lanes

- SKIP - Full samples smoke was not run per request.
- SKIP - Broad workspace suite was not run because targeted Toolbox Playwright validation covered the impacted UI/rendering behavior.
- SKIP - Database behavior, runtime behavior, Workspace behavior, routes, and status-value lanes were not broadened beyond the directly required Toolbox metadata/API validation.

## Manual Validation Notes

- Confirmed `/toolbox/index.html?view=group` renders all Game Journey groups in declared order.
- Confirmed Create group tile order is `Game Workspace`, `Project Team`, `Game Configuration`, `Tags`.
- Confirmed `Project Team` uses the existing `toolbox/users/index.html` route and remains planned.
- Confirmed `Users` does not remain as a visible Toolbox tile label in the API-backed active registry.
