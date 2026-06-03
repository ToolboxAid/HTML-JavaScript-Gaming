# Input Mapping V2 Device Usage And Tile Actions Report

## Scope
- PR: PR_26140_101-polish-input-mapping-v2-device-usage-and-tile-actions
- Source of truth: user PR_101 request. `docs_build/pr/BUILD_PR.md` still points at an unrelated Level 18 overlay runtime hardening rebase, so this workflow used the explicit PR_101 request after reading `docs_build/dev/PROJECT_INSTRUCTIONS.md`.

## Changes Applied
- Moved the existing gamepad rumble/haptic checkbox into the `Game Controller` device card.
- Removed `Wheel` as a separate visible device and treats wheel directions as Mouse gestures.
- Kept `Mouse Wheel Up`, `Mouse Wheel Down`, `Mouse Wheel Left`, and `Mouse Wheel Right` visible when Mouse is enabled and browser wheel support or advanced input mode is available.
- Moved `inputMappingV2ClearActionButton` into the Captured Mappings area, renamed it to `Delete All`, and wired it to delete all visible captured mapping tiles/actions.
- Kept the Actions accordion to selected-action creation/deletion only: `Add`, `Delete`.
- Added idle selected-action source highlighting for already-used Keyboard, Mouse, and visible Game Controller controls.
- Added gesture text to captured mapping tile tokens while preserving concise labels and detailed title/hover metadata.
- Preserved combo display, selected tile indication, capture highlight/cancel behavior, gamepad auto-polling, and 225x225 tiles.

## Contracts And Constraints
- No schema changes.
- No sample JSON changes.
- No full samples smoke test; skipped per request because this is scoped to Input Mapping V2 and engine input descriptors.
- Rumble/haptic support remains UI-local because the existing Input Mapping V2 toolState contract has no options field.

## Validation
- `node --check src/engine/input/InputCapabilityDescriptors.js`: PASS
- `node --check tools/input-mapping-v2/js/bootstrap.js`: PASS
- `node --check tools/input-mapping-v2/js/ToolStarterApp.js`: PASS
- `node --check tools/input-mapping-v2/js/controls/ActionSelectionControl.js`: PASS
- `node --check tools/input-mapping-v2/js/controls/CaptureControl.js`: PASS
- `node --check tools/input-mapping-v2/js/controls/DeviceListControl.js`: PASS
- `node --check tools/input-mapping-v2/js/controls/PreviewPanelControl.js`: PASS
- `node --check tools/input-mapping-v2/js/services/EngineInputSourceService.js`: PASS
- `node --check tools/input-mapping-v2/js/services/InputMappingState.js`: PASS
- `node --check tests/input/InputService.test.mjs`: PASS
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`: PASS
- `node -e "const test = await import('./tests/input/InputService.test.mjs'); test.run();"`: PASS
- Focused Input Mapping V2 Playwright: PASS, 2 tests
- `npm run test:workspace-v2`: PASS, 61 tests
- `git diff --check`: PASS, line-ending warnings only
- HTML inline script/style/handler scan: PASS, no matches
- Sample/JSON diff scan: PASS, no changed sample or JSON files
- Playwright V8 coverage report: PASS, changed runtime JS listed in `docs_build/dev/reports/playwright_v8_coverage_report.txt` and `coverage_changed_js_guardrail.txt`
- Full samples smoke test: not run, per request
- Delta ZIP verification: PASS, 20 files, nonzero size

## Playwright Coverage
- Confirms rumble/haptics appears inside the Game Controller device card.
- Confirms Wheel is not a separate device.
- Confirms wheel gestures appear inside Mouse and hide when Mouse is disabled.
- Confirms `Delete All` appears at the bottom of Captured Mappings and clears captured mappings.
- Confirms selected-action used Keyboard, Mouse, and Game Controller controls are highlighted outside capture mode.
- Confirms mapping tiles display gesture text for keyboard, mouse, drag release, gamepad, and combo inputs.
- Confirms combo display, selected tile behavior, gamepad auto-polling, and capture highlight/cancel behavior remain intact.

## Manual Validation
1. Open `tools/input-mapping-v2/index.html`.
2. In Devices, confirm there is no separate Wheel card and `Gamepad rumble/haptic feedback` is inside Game Controller.
3. In Gestures, confirm wheel directions appear under Mouse.
4. Capture keyboard, mouse, drag release, and game controller inputs; confirm the selected action highlights the used source controls while capture is idle.
5. Confirm captured mapping tokens include gesture text such as `Press`, `Click`, `Drag Release`, or `Button`.
6. Click `Delete All` at the bottom of Captured Mappings and confirm all mapping tiles are removed.
