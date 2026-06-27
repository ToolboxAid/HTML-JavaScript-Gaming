# PR_26161_022 Controls Action Descriptions Report

## Branch Validation
- Current branch: `main`
- Expected branch: `main`
- Result: PASS

## Summary
- Removed the visible Inspector > Mapping JSON accordion from Controls.
- Preserved internal mapping payload generation for tool output/status logic, without displaying it as an accordion.
- Added creator-facing descriptions next to every default action in Controls > Actions.
- Preserved alphabetical action ordering.
- Preserved device-specific input capture, Controller Profile center placement, State explanation, table editing, Add Mapping, Cancel, Edit, Trash, DB reload persistence, and Wireframe status.

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
- Mapping JSON accordion no longer appears.
- Mapping JSON DOM output is not visible.
- All listed actions display descriptions.
- Action labels remain alphabetically sorted.
- Device-specific capture still swaps Keyboard, Mouse, and Gamepad capture controls by selected Input Device.
- Captured mappings persist after reload.
- Devices, Status, controller profiles, table editing, Add Mapping, Cancel, Edit, and Trash continue to work.

## V8 Coverage
- Report: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- Changed runtime JS covered: `toolbox/input-mapping-v2/input-mapping-v2.js`
- Coverage result: 91% function coverage, 105/116 functions

## Manual Validation Steps
1. Open `/toolbox/input-mapping-v2/index.html`.
2. Confirm the Inspector column shows Devices and Status, with no Mapping JSON accordion.
3. Confirm Controls > Actions lists Cancel through Thrust alphabetically.
4. Confirm each action has a short creator-facing description beside it.
5. Add a mapping, capture a keyboard input, save, reload, and confirm the mapping remains.
6. Edit the mapping and confirm device-specific capture controls still appear for the selected device.

## Skipped Lanes
- Full samples validation was skipped as required by the PR instructions; this change is scoped to Controls/Input Mapping UI and targeted behavior tests.
- Full workspace contract lane was skipped because no Workspace V2 contract/runtime files changed; workspace return remains covered by targeted Controls Playwright.

## Runtime Scope Confirmation
- Controls remains Wireframe.
- Controls mapping and controller profile data remain persisted through the shared DB/mock adapter.
- No sample JSON alignment, auth behavior, production DB behavior, engine runtime behavior, or unrelated rewrites were added.
