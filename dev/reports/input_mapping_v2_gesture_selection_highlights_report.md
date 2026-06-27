# Input Mapping V2 Gesture Selection + Highlights Report

PR: PR_26140_105-fix-input-mapping-v2-gesture-selection-and-highlights

## Source of Truth

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Active `docs_build/pr/BUILD_PR.md` is an unrelated Level 18 rebase note, so this report follows the explicit PR105 user request as the current BUILD scope.
- One PR purpose: fix Input Mapping V2 gesture selection, selected-input highlighting, and remove the visible Cross-device gesture group while preserving cross-device combo capture internally.

## Changes

- Added selected gesture state to Input Mapping V2.
- Gesture buttons now stay visibly highlighted with `is-selected` and `aria-pressed="true"` after selection and after capture completion.
- Selected descriptor gestures are applied to the next matching live capture:
  - Keyboard Release/Hold/Press update captured keyboard mapping text and binding.
  - Mouse Click/Double Click update captured mouse mapping text and binding.
  - Game Controller Button/Trigger/Stick/DPad update captured gamepad mapping text and binding when selected.
- Keyboard Release now captures as visible tile text such as `Keyboard KeyP Release` instead of falling back to `Keyboard KeyP Press`.
- Non-default gesture bindings include the gesture id, for example `KeyP:KeyboardRelease`, so Press and Release for the same physical key remain distinct without schema changes.
- Preserved existing immediate behavior for pointer drag and wheel gesture buttons.
- Preserved combo capture behavior, including keyboard, mouse, wheel, game controller, and cross-device combinations.
- Removed `Cross-device` as a visible gesture group and removed the `CrossDeviceCombo` visible descriptor.
- Kept cross-device combo support available through the existing Combo gesture flow, including Game Controller Combo capturing a controller button plus keyboard Alt.
- Preserved haptics/rumble UI behavior, shortcut suppression, context suppression, selected tile indication, and gamepad auto-poll behavior.

## ToolState / Schema

- No schemas changed.
- No sample JSON changed.
- Input Mapping V2 continues to use the existing tool-local mapping/toolState contract.

## Playwright Impact

Playwright impacted: Yes.

Focused coverage now validates:

- selected gesture remains highlighted,
- Keyboard Release capture produces `Keyboard KeyP Release`,
- selected tile highlights corresponding keyboard input,
- selected tile highlights corresponding mouse input,
- selected tile highlights corresponding game controller input,
- Cross-device group and `CrossDeviceCombo` button are not visible,
- cross-device combo representation still works through Game Controller Combo without a Cross-device UI group.

Expected pass behavior: gesture selection is visible and affects the next matching capture; used inputs are highlighted for the selected tile; Cross-device is absent from visible gestures; cross-device combo still maps internally.

Expected fail behavior: selected gestures lose highlighting, Keyboard Release maps as Press, used controls do not highlight for the selected tile, Cross-device appears as a visible group, or cross-device combo cannot be represented without that group.

## Validation

Passed:

- `node --check src/engine/input/InputCapabilityDescriptors.js`
- `node --check toolbox/input-mapping-v2/js/ToolStarterApp.js`
- `node --check toolbox/input-mapping-v2/js/controls/GestureListControl.js`
- `node --check toolbox/input-mapping-v2/js/services/EngineInputSourceService.js`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2" --project=playwright --workers=1 --reporter=list` - 3 passed.
- `npm run test:workspace-v2` - 62 passed.
- `git diff --check` - passed; Git reported LF-to-CRLF working-copy warnings only.
- `git status --short -- samples games` - no sample/game JSON changes.
- `rg "imageDataUrl" toolbox/input-mapping-v2 src/engine/input tests/playwright/tools/WorkspaceManagerV2.spec.mjs` - no matches.

Coverage:

- Playwright V8 coverage was produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt` reports no changed runtime JS coverage warnings.

Skipped:

- Full samples smoke test was skipped by explicit PR instruction.

## Manual Validation

1. Open Input Mapping V2.
2. Add or select a `Pause` mapping tile.
3. Click `Keyboard > Release` and confirm the Release gesture remains highlighted.
4. Click `Capture Keyboard`, press `P`, and confirm the Pause tile shows `Keyboard KeyP Release`.
5. Select the Pause tile and confirm the Keyboard used-input display highlights `Keyboard KeyP Release`.
6. Add mouse and game controller mappings, select each tile, and confirm the matching Mouse/Game Controller used-input displays are highlighted.
7. Confirm no visible `Cross-device` gesture group appears.
8. Start a combo from an existing device Combo gesture and confirm a controller button + keyboard Alt can still map as a combo.
9. Confirm haptics/rumble controls and shortcut/context suppression still behave as before.

## Files Changed

- `src/engine/input/InputCapabilityDescriptors.js`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `toolbox/input-mapping-v2/js/ToolStarterApp.js`
- `toolbox/input-mapping-v2/js/controls/GestureListControl.js`
- `toolbox/input-mapping-v2/js/services/EngineInputSourceService.js`
- `toolbox/input-mapping-v2/styles/inputMappingV2.css`
