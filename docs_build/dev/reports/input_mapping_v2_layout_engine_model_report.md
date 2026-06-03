# Input Mapping V2 Layout Engine Model Report

## Scope
- PR: `PR_26140_097-rework-input-mapping-v2-layout-and-engine-input-model`
- Source of truth: user PR request. `docs_build/pr/BUILD_PR.md` was checked and is still the unrelated Level 18 overlay runtime hardening note.
- Required setup: read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.

## Implementation
- Reworked Input Mapping V2 into the requested left, center, and right column model.
- Left column now contains Actions, Devices, Gestures, and Capture accordions.
- Devices are rendered from engine-owned capability descriptors for Keyboard, Mouse, Game Controller, Touch, Pen, Wheel, Flight Stick, and VR Controller.
- Gestures are rendered from engine-owned gesture descriptors and filtered by enabled devices.
- Capture is limited to live capture controls: Capture Keyboard, Capture Mouse, and one button per connected game controller.
- Center workspace keeps selected mapping tiles, token deletion, combo display, and now uses 225px by 225px tiles.
- Right column now contains Diagnostics, Status / Log, and Export accordions.
- Export and Copy JSON moved into the Export accordion and remain wired.
- Added engine-level reusable capability descriptors plus wheel and pointer-drag gesture descriptors under `src/engine/input/**`.
- Preserved pointer drag state support for down, move, up, drag, drag release, and drag rectangle/bounds.
- Replaced visible Primary/Secondary mouse wording with human-friendly labels such as `Mouse Left Button`, `Mouse Middle Button`, and `Mouse Drag Rectangle`.
- Added wheel input capture for combos such as `Shift + Mouse Wheel Up`.
- Preserved game controller button naming, device-specific capture, title/hover detail, auto-polling, capture highlight/cancel/timeout, selected tile indication, and rumble WARN behavior.

## Files Changed
- `src/engine/input/InputCapabilityDescriptors.js`
- `src/engine/input/InputService.js`
- `src/engine/input/PointerDragState.js`
- `tests/input/InputService.test.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `toolbox/input-mapping-v2/how_to_use.html`
- `toolbox/input-mapping-v2/index.html`
- `toolbox/input-mapping-v2/js/ToolStarterApp.js`
- `toolbox/input-mapping-v2/js/bootstrap.js`
- `toolbox/input-mapping-v2/js/controls/ActionNavControl.js`
- `toolbox/input-mapping-v2/js/controls/ActionSelectionControl.js`
- `toolbox/input-mapping-v2/js/controls/CaptureControl.js`
- `toolbox/input-mapping-v2/js/controls/DeviceListControl.js`
- `toolbox/input-mapping-v2/js/controls/ExportControl.js`
- `toolbox/input-mapping-v2/js/controls/GamepadDiagnosticsControl.js`
- `toolbox/input-mapping-v2/js/controls/GestureListControl.js`
- `toolbox/input-mapping-v2/js/services/EngineInputSourceService.js`
- `toolbox/input-mapping-v2/styles/inputMappingV2.css`

## Validation
- Playwright impacted: Yes.
- Targeted JS syntax validation for changed engine input, Input Mapping V2, and Playwright files: PASS.
- Targeted engine input import/test run: PASS.
- Targeted Input Mapping V2 browser import/page-load validation: PASS.
- Focused Input Mapping V2 Playwright coverage: PASS, 2 tests.
- `npm run test:workspace-v2`: PASS, 61 tests.
- `git diff --check`: PASS, with repository line-ending warnings only.
- Full samples smoke test: not run, per request and because sample JSON was out of scope.

## Playwright Coverage
- Validates left/center/right accordion layout.
- Validates Actions button order and created-action duplicate prevention.
- Validates device list and gesture filtering by enabled devices.
- Validates gamepad auto-polling and one capture button per detected controller.
- Validates capture highlight, cancel, and timeout behavior.
- Validates mouse drag rectangle gesture visibility and mapping.
- Validates `Ctrl + R` and `Shift + Mouse Wheel Up` combo capture.
- Validates 225px by 225px mapping tiles, tile selection, and token deletion.
- Validates diagnostics cards fill the diagnostics scrollport width.
- Validates mapping messages route to Status / Log, not Capture.
- Validates Export and Copy JSON wiring.
- Validates rumble checkbox and unsupported WARN.

## Manual Validation
1. Open `toolbox/input-mapping-v2/index.html`.
2. Confirm the left column accordions are Actions, Devices, Gestures, and Capture.
3. Confirm the center column shows Captured Mappings tiles at 225px by 225px after adding an action.
4. Confirm the right column accordions are Diagnostics, Status / Log, and Export.
5. In Devices, toggle Wheel off and confirm wheel gestures disappear; toggle it back on and confirm they return.
6. Select an action, click the Keyboard `Combo` gesture, press `Ctrl` then `R`.
7. Expected: the selected mapping tile shows `Combo Ctrl + R` and the inspector contains `Combo:ControlLeft+KeyR`.
8. Click the Mouse `Combo` gesture, press `Shift`, then scroll up.
9. Expected: the selected mapping tile shows `Combo Shift + Mouse Wheel Up`.
10. Connect or mock a controller and confirm one capture button appears for each detected game controller.
11. Check `Gamepad rumble/haptic feedback` without a haptics-capable controller.
12. Expected: Status / Log shows an actionable WARN and no fake rumble is attempted.
13. Click Export and Copy JSON.
14. Expected: Export shows toolState JSON in the Export accordion and Copy JSON logs success when clipboard is available.
15. Out of scope: sample JSON edits and full samples smoke validation.

## Schema And Samples
- No schema changes.
- No sample JSON changes.

## Packaging
- Delta ZIP: `tmp/PR_26140_097-rework-input-mapping-v2-layout-and-engine-input-model_delta.zip`
- ZIP verification: PASS, 25 files, nonzero size.
