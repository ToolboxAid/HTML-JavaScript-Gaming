# PR_26161_021 Controls Device Specific Input Report

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary
- Changed mapping edit rows so the Input column shows only the capture button for the selected Input Device.
- Keyboard rows show Capture Keyboard only.
- Mouse rows show Capture Mouse only.
- Gamepad rows show Capture Gamepad only.
- Captured values replace the capture button in the Input column.
- Clicking a captured value opens the row for editing and focuses the Input Device dropdown so the creator can choose another capture path.
- Added creator-facing State guidance:
  - Active means the mapping is available to the game.
  - Disabled means the mapping is saved but ignored by the game until re-enabled.
- Moved Controller Profiles from the left rail into the center Table Input area.

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
- Only the matching capture button appears for the selected Input Device.
- Keyboard, Mouse, and Gamepad device selection swaps the visible row capture button.
- Captured input value replaces the capture button.
- Clicking a captured input value focuses the Input Device dropdown.
- Saved captured input values reopen the row for device selection instead of deleting the row.
- State explanation appears with Active and Disabled creator-facing wording.
- Controller Profile appears in the center column under Table Input Mapping.
- Captured mappings persist after reload.
- Mapping JSON, Devices, Status, controller profiles, table add/edit/cancel, and compatibility route still update.

## V8 Coverage
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Changed runtime JS covered: `toolbox/input-mapping-v2/input-mapping-v2.js`
- Coverage result: 93% function coverage, 111/120 functions

## Manual Validation Steps
1. Open `/toolbox/input-mapping-v2/index.html`.
2. Confirm Controller Profiles appears in the center card under Mappings.
3. Confirm the State explanation mentions Active and Disabled exactly as creator-facing mapping states.
4. Click Add Mapping and confirm only Capture Keyboard appears by default.
5. Change Input Device to Mouse and confirm only Capture Mouse appears.
6. Change Input Device to Gamepad and confirm only Capture Gamepad appears.
7. Capture a keyboard input, confirm the captured value replaces the capture button, save, reload, and confirm the value persists.
8. Click the captured value and confirm the row opens/focuses the Input Device dropdown.

## Skipped Lanes
- Full samples validation was skipped as required by the PR instructions; this change is limited to the Controls/Input Mapping toolbox UI and behavior tests.
- Full workspace contract lane was skipped because no Workspace V2 contract/runtime files changed; workspace return remains covered by targeted Controls Playwright.

## Runtime Scope Confirmation
- Controls remains Wireframe.
- Controls mapping and controller profile data remain persisted through the shared DB/mock adapter.
- No page-local persisted storage was added.
- No production controller runtime was added.
- No sample JSON alignment, auth behavior, production DB behavior, engine runtime behavior, or unrelated rewrites were added.
