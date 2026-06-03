# Input Mapping V2 Capture Device Gesture Flow Report

PR: `PR_26140_114-reorder-input-mapping-v2-capture-device-and-gesture-flow`

## Summary

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Moved the Capture accordion above Gestures in Input Mapping V2.
- Reworked capture flow so users can select a Capture device first; the selected capture source enables only matching gesture buttons.
- Removed the visible Game Controller `Button` gesture because it duplicated `Btn Press`.
- Preserved `Btn Press`, `Btn Hold`, `Btn Release`, selected tile/action behavior, combo capture, and sample JSON untouched.
- Kept game controller release behavior engine-backed through `GamepadState.buttonsReleased`, `GamepadInputAdapter.buttonsReleased/isReleased`, and Input Mapping V2 consumption through `EngineInputSourceService.captureGamepad()`.

## Files Changed

- `src/engine/input/InputCapabilityDescriptors.js`
- `tools/input-mapping-v2/index.html`
- `tools/input-mapping-v2/js/ToolStarterApp.js`
- `tools/input-mapping-v2/js/controls/CaptureControl.js`
- `tools/input-mapping-v2/js/controls/GestureListControl.js`
- `tools/input-mapping-v2/styles/inputMappingV2.css`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`
- `docs_build/dev/reports/input_mapping_v2_capture_device_gesture_flow_report.md`

## Validation

Targeted syntax/import validation:

- PASS `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
- PASS `node --check tools/input-mapping-v2/js/controls/CaptureControl.js`
- PASS `node --check tools/input-mapping-v2/js/controls/GestureListControl.js`
- PASS `node --check src/engine/input/InputCapabilityDescriptors.js`
- PASS `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`

Focused Playwright:

- PASS `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "Input Mapping V2"`
- Result: 11 passed.

Workspace V2:

- PASS `npm run test:workspace-v2`
- Result: 70 passed.

Full samples smoke test:

- SKIPPED per PR instructions. This change is scoped to Input Mapping V2 and engine input descriptors, and sample JSON is explicitly out of scope.

## Delta ZIP

- Created: `tmp/PR_26140_114-reorder-input-mapping-v2-capture-device-and-gesture-flow_delta.zip`
- Verified size is greater than 0 bytes.
- Verified contents are repo-structured and limited to changed implementation/test files plus required reports.

## Playwright Coverage

Playwright impacted: Yes.

Validated behavior:

- Capture appears above Gestures.
- Selecting a Capture device filters enabled gestures by device source.
- Game Controller `Button` is absent from visible gesture controls.
- Game Controller `Btn Press` captures press input.
- Game Controller `Btn Hold` captures held button input.
- Game Controller `Btn Release` waits for release and captures release only.
- Combo and selected tile/action behavior remain intact.

Expected pass behavior:

- Matching gestures remain enabled after selecting a capture device, and non-matching gestures are disabled.
- `Btn Release` creates `GameControllerButtonRelease` mappings only after the button is released.

Expected fail behavior:

- A duplicated `GameControllerButton` visible gesture, mismatched gesture capture, or press-time release capture would fail the focused assertions.

## V8 Coverage

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` was refreshed by the Workspace V2 Playwright run.
- Changed runtime JS files are present in the coverage guardrail:
  - `(94%) tools/input-mapping-v2/js/ToolStarterApp.js`
  - `(89%) tools/input-mapping-v2/js/controls/CaptureControl.js`
  - `(93%) tools/input-mapping-v2/js/controls/GestureListControl.js`
  - `(95%) src/engine/input/InputCapabilityDescriptors.js`

## Manual Validation

1. Open Input Mapping V2.
2. Confirm the center column order is Capture, Gestures, Captured Mappings.
3. Add/select an action tile.
4. Click Capture Keyboard and confirm Mouse/Game Controller gestures are disabled.
5. Click Capture Mouse and confirm Keyboard/Game Controller gestures are disabled.
6. With a mocked or real game controller exposed, click that game controller capture button and confirm Keyboard/Mouse gestures are disabled.
7. Confirm Game Controller shows `Btn Press`, `Btn Hold`, and `Btn Release`, and does not show `Button`.
8. Capture a controller release by holding a button, selecting `Btn Release`, then releasing; the tile should show `Btn Release`.

## Out Of Scope

- Sample JSON changes.
- Full samples smoke test.
