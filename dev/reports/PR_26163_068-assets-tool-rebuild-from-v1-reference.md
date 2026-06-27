# PR_26163_068-assets-tool-rebuild-from-v1-reference

## Branch Validation
- PASS: Current branch is `main`.
- Expected branch: `main`.

## Summary
- Rebuilt the active `toolbox/assets` workflow around current Theme V2 shell patterns and the shared DB/mock adapter.
- Used `archive/v1-v2/tools/old_asset-manager-v2` only as workflow reference for list/detail/update/status concepts.
- Added row-level View, Edit, and Delete actions for user-owned asset records.
- Enforced active-user ownership in the Assets mock repository for list/view/edit/delete/reset operations.
- Preserved external JavaScript, external Theme V2 CSS, and no inline script/style/event handlers.

## Requirement Checklist
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- PASS: Created `PR_26163_068-assets-tool-rebuild-from-v1-reference` report and artifacts.
- PASS: Rebuilt `toolbox/assets` using the old asset manager only as workflow/UX reference.
- PASS: Did not copy V1/legacy CSS, inline scripts, inline styles, or old architecture.
- PASS: Omitted legacy asset-manager runtime dependencies from the active tool.
- PASS: Preserved external JavaScript only.
- PASS: Preserved external Theme V2 CSS only.
- PASS: Preserved no HTML `<script>` or `<style>` blocks.
- PASS: Preserved no inline event handlers.
- PASS: Preserved no `toolbox/shared` dependency.
- PASS: Did not introduce new classes, so no one-class-per-file split was required.
- PASS: App/root behavior remains in the current external Assets runtime module and coordinates current controls without new tool-local CSS.
- PASS: Uses existing Theme V2 shell, left/center/right columns, accordion stack, cards, tables, buttons, status, and action-group patterns.
- PASS: Asset data flow remains aligned to the current API/service-backed DB/mock adapter.
- PASS: User-owned asset records can be added/viewed/edited/deleted only by the owning active user.
- PASS: Scope stayed limited to `toolbox/assets`, required dev-runtime/API adapter touchpoint, targeted tests, and reports.
- PASS: Did not modify `start_of_day` folders.

## Search Evidence
- PASS: `rg -n "<style| on[a-z]+=" toolbox/assets/index.html toolbox/assets/assets.js toolbox/assets/assets-api-client.js src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js src/dev-runtime/server/mock-api-router.mjs tests/playwright/tools/AssetToolMockRepository.spec.mjs` returned no matches.
- PASS: `rg -n "archive/v1-v2|old_asset-manager-v2|assetManagerV2|asset-manager-v2__|toolbox/shared|src/engine/theme/main.css|hubCommon.css|accordionV2.css|styles/assetManager.css" toolbox/assets src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js src/dev-runtime/server/mock-api-router.mjs` returned no matches.

## Changed Files
- `toolbox/assets/index.html`
- `toolbox/assets/assets.js`
- `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `src/dev-runtime/server/mock-api-router.mjs`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/PR_26163_068-assets-tool-rebuild-from-v1-reference.md`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/codex_review.diff`

## Impacted Lane
- Assets tool runtime lane.
- Shared dev-runtime API repository construction for Assets session-user ownership.
- Targeted Assets Playwright behavior lane.

## Validation Performed
- PASS: `node --check toolbox/assets/assets.js`
- PASS: `node --check toolbox/assets/assets-api-client.js`
- PASS: `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS: `node --check src/dev-runtime/server/mock-api-router.mjs`
- PASS: `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS: HTML restriction search returned no matches.
- PASS: Legacy/archive dependency search returned no active matches.
- PASS: `git diff --check -- toolbox/assets/index.html toolbox/assets/assets.js toolbox/assets/assets-api-client.js src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js src/dev-runtime/server/mock-api-router.mjs tests/playwright/tools/AssetToolMockRepository.spec.mjs docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs --reporter=line`
  - Result: 7 passed.
- PASS: `npm run test:workspace-v2`
  - Result: 5 passed in the `workspace-contract` lane.
  - Note: command name is legacy; this PR changes the Assets tool and does not introduce user-facing Workspace V2 wording.

## Playwright Result
- PASS: Assets tool launches.
- PASS: Left/center/right shell renders.
- PASS: Theme V2 accordions expand/collapse.
- PASS: Asset list renders from the current DB/mock adapter data source.
- PASS: Add/view/edit/delete behavior is owner-scoped.
- PASS: Invalid/missing asset data fails visibly with actionable status.
- PASS: No archive/V1 runtime dependency is used.

## V8 Coverage
- PASS: `toolbox/assets/assets.js` collected browser V8 coverage at 96%.
- WARN: `src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js` is server/dev-runtime code and is not collected by Chromium browser V8 coverage.
- WARN: `src/dev-runtime/server/mock-api-router.mjs` is server/dev-runtime code and is not collected by Chromium browser V8 coverage.
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

## Manual Validation Steps
1. Open `toolbox/assets/index.html` as User 1.
2. Confirm the Assets tool renders left setup, center library, and right inspector/status columns.
3. Toggle the Import Asset accordion closed and open.
4. Add an Image asset and confirm it appears in the Library Records table.
5. Click View and confirm preview/metadata update.
6. Click Edit, rename the asset, Save, and confirm the row updates.
7. Switch to User 2 and confirm User 1's asset is not visible.
8. Add a User 2 asset, switch back to User 1, and confirm User 2's asset is not visible.
9. Delete User 1's asset and confirm only User 1's library is affected.
10. Attempt an invalid image upload and confirm the actionable validation panel appears.

## Skipped Lanes
- SKIP: Full samples smoke test. Safe to skip because samples are explicitly out of scope and this PR only changes Assets tool UI/runtime plus required dev-runtime adapter ownership.
- SKIP: Full repo Playwright suite. Safe to skip because targeted Assets Playwright plus the required workspace-contract command cover the affected tool and launch surface.
- SKIP: Engine runtime validation. Safe to skip because no engine runtime behavior changed.

## Samples Validation
- SKIP: Full samples smoke test was not run by request.

## Packaging
- PASS: Repo-structured delta ZIP produced under `tmp/PR_26163_068-assets-tool-rebuild-from-v1-reference_delta.zip`.
