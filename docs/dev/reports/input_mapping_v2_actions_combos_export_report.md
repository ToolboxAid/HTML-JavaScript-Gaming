# Input Mapping V2 Actions Combos Export Report

## Scope
- PR: `PR_26140_096-polish-input-mapping-v2-actions-combos-export`
- Source of truth: user PR request. `docs/pr/BUILD_PR.md` was checked and is for a different overlay runtime hardening task, so it was not used for implementation scope.
- Required setup: read `docs/dev/PROJECT_INSTRUCTIONS.md` first.

## Implementation
- Updated Input Mapping V2 diagnostics cards to render as one full-width card per row inside the diagnostics accordion scrollport.
- Reordered Actions controls exactly as `Add Action`, `Clear Actions`, `Delete Action`.
- Added `Capture Combo` for explicit two-input combo capture. `Ctrl + R` displays as `Combo Ctrl + R` and stores a schema-compatible binding such as `Combo:ControlLeft+KeyR`.
- Preserved existing multi-input behavior by continuing to allow additional captured inputs on the selected action tile.
- Added a gamepad rumble/haptic feedback checkbox that uses browser `GamepadHapticActuator` or `vibrationActuator` when available.
- Added actionable WARN status logging when rumble is requested but unsupported, unavailable, or rejected by the browser.
- Kept rumble UI-local because the current Input Mapping V2 `toolState` contract contains only `toolId`, `version`, and `payload`, with no mapping/action options field.
- Removed the duplicate `Export toolState` control, renamed the visible tool action to `Export`, and wired it to show the toolState export preview.
- Kept `Copy JSON` wired to copy the payload JSON.

## Files Changed
- `tools/input-mapping-v2/index.html`
- `tools/input-mapping-v2/how_to_use.html`
- `tools/input-mapping-v2/js/ToolStarterApp.js`
- `tools/input-mapping-v2/js/bootstrap.js`
- `tools/input-mapping-v2/js/controls/ActionNavControl.js`
- `tools/input-mapping-v2/js/controls/ActionSelectionControl.js`
- `tools/input-mapping-v2/js/controls/CaptureControl.js`
- `tools/input-mapping-v2/js/services/EngineInputSourceService.js`
- `tools/input-mapping-v2/styles/inputMappingV2.css`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

## Validation
- Playwright impacted: Yes.
- Targeted JS syntax validation: PASS.
- Targeted browser import/page-load validation for Input Mapping V2: PASS.
- Focused Playwright coverage for the updated Input Mapping V2 flow: PASS.
- `npm run test:workspace-v2`: PASS, 61 tests.
- `git diff --check`: PASS, with repository line-ending warnings only.
- Full samples smoke test: not run, per request.

## Coverage Added
- Diagnostics cards fill the available accordion scrollport width.
- Actions buttons appear in exact order.
- `Ctrl + R` combo can be captured and displayed.
- Rumble checkbox appears.
- Unsupported rumble logs an actionable WARN in the main status log.
- Export label is correct and the duplicate Export control is absent.
- Export writes the toolState preview.
- Copy JSON still writes payload JSON to the clipboard.

## Schema And Samples
- No schema changes.
- No sample JSON changes.

## Manual Validation
1. Open `tools/input-mapping-v2/index.html`.
2. Confirm the Actions buttons read `Add Action`, `Clear Actions`, `Delete Action` in that order.
3. Select an action, click `Add Action`, click `Capture Combo`, then press `Ctrl` and `R`.
4. Expected: the selected mapping tile shows `Combo Ctrl + R`, remains selectable, and Export shows a toolState preview containing the combo binding.
5. Check `Gamepad rumble/haptic feedback` without a haptics-capable controller.
6. Expected: the main Status log shows an actionable WARN and no fake rumble is attempted.
7. Click `Copy JSON`.
8. Expected: payload JSON is copied and the main Status log reports success.
9. Out of scope: full samples smoke test and sample JSON launch validation.

## Packaging
- Delta ZIP: `tmp/PR_26140_096-polish-input-mapping-v2-actions-combos-export_delta.zip`
- ZIP verification: PASS, 17 files, nonzero size.
