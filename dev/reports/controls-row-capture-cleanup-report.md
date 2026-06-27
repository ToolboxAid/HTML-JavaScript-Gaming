# PR_26161_020 Controls Row Capture Cleanup Report

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary
- Removed the separate Controls/Input Mapping Capture accordion.
- Moved selected Action/Object context into the right side of the mappings table footer next to Add Mapping and Reset Mappings.
- Replaced the row Input free-text editor with row-level capture buttons:
  - Capture Keyboard
  - Capture Mouse
  - Capture Gamepad
- Kept Input display clickable without deleting mappings.
- Kept deletion scoped to the row Trash action.
- Preserved table-first add/edit/cancel, Mapping JSON, Devices, Status, controller profiles, workspace return, and shared DB/mock-adapter persistence.

## Impacted Lane
- runtime
- recovery/UAT

## Playwright Impacted
- Yes

## Testing Performed
- `node --check toolbox/input-mapping-v2/input-mapping-v2.js` - PASS
- `node --check tests/playwright/tools/InputMappingV2Tool.spec.mjs` - PASS
- `rg --pcre2 -n "<style|style=|<script(?![^>]*\\bsrc=)|on(click|change|input|submit|keydown|keyup|pointerdown|mousedown|mouseup)=" toolbox/input-mapping-v2/index.html toolbox/controls/index.html` - PASS, no inline CSS/JS/event handlers found
- `git diff --check` - PASS
- `npx playwright test tests/playwright/tools/InputMappingV2Tool.spec.mjs --workers=1 --reporter=line` - PASS, 5 passed

## Playwright Behavior Covered
- Selected Action/Object display appears in the mappings table footer and updates from the Actions panel.
- Capture accordion is absent.
- Row-level Capture Keyboard, Capture Mouse, and Capture Gamepad buttons appear during row add/edit.
- Keyboard capture updates the active row input and persists after Save/reload.
- Gamepad capture shows actionable WARN when no live gamepad value is available.
- Gamepad capture can populate a row when a live gamepad value is supplied by the test harness.
- Clicking the displayed Input token does not delete the row.
- Trash is the only covered row deletion path.
- Mapping JSON, Devices, Status, controller profiles, and compatibility route continue to render.

## V8 Coverage
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Changed runtime JS covered: `toolbox/input-mapping-v2/input-mapping-v2.js`
- Coverage result: 92% function coverage, 105/114 functions

## Manual Validation Steps
1. Open `/toolbox/input-mapping-v2/index.html`.
2. Confirm the left column shows Actions and Controller Profiles, with no Capture accordion.
3. Confirm Add Mapping and Reset Mappings are on the left side of the table footer.
4. Confirm Selected Action and Selected Object appear on the right side of the table footer.
5. Click Add Mapping and confirm Add Mapping disables while the edit row is active.
6. Click Capture Keyboard, press a key, save the row, reload, and confirm the mapping remains.
7. Click the Input token and confirm the row remains.
8. Click Trash and confirm the row is deleted.

## Skipped Lanes
- Full samples validation was skipped as required by the PR instructions; this change is limited to the Controls/Input Mapping toolbox UI and test coverage.
- Full workspace contract lane was skipped because no Workspace V2 contract/runtime files changed; workspace return visibility is covered in the targeted Controls Playwright test.

## Runtime Scope Confirmation
- Controls remains Wireframe.
- No production controller runtime was added.
- No sample JSON alignment, auth behavior, production DB behavior, engine runtime behavior, or unrelated rewrites were added.
- Controls mapping data remains persisted through the shared DB/mock adapter.
