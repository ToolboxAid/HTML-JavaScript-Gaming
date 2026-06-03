# PR_26140_089 Input Mapping V2 Gamepad and Capture Flow Report

## Scope
- Fixed Input Mapping V2 gamepad/joystick detection and capture through the existing engine input path (`InputService` + `GamepadInputAdapter`).
- Kept the tool generic and did not add duplicate input models or hardcoded game-specific behavior.
- Updated capture flow so Add Action creates an empty mapping tile immediately, independent of capture.
- Added per-tile action reassignment while preserving captured input deletion.
- Updated capture controls to stack vertically and fill the available container width.
- Preserved PR_26140_088 fullscreen layout, 175px by 175px mapping tiles, and external JS/CSS only.

## Implementation Notes
- `EngineInputSourceService` now refreshes gamepad state from the browser Game Controller API through the engine input service and records actionable WARN details when browser focus, permission, API availability, or timing prevents capture.
- `ToolStarterApp` listens for `gamepadconnected` and `gamepaddisconnected`, refreshes engine input state, logs connection state, and refreshes the UI.
- `InputMappingState` now supports empty visible mapping tiles and changing a tile's action after creation without requiring a captured input first.
- `PreviewPanelControl` renders empty tiles, exposes a `Captured Mappings Action` dropdown per tile, and keeps token-click deletion behavior intact.
- `inputMappingV2.css` makes the capture buttons a vertical full-width stack while preserving mapping tile dimensions.

## Playwright Impact
Yes. This PR changes Input Mapping V2 UI controls, gamepad detection/capture behavior, and toolState-facing mapping interactions.

Playwright coverage was updated to validate:
- connected gamepad detection state with a mocked browser Game Controller API gamepad,
- actionable WARN logging when gamepad capture is unavailable,
- stacked full-width capture buttons,
- Add Action creating a tile without capture,
- tile action reassignment after creation,
- captured input token deletion,
- preserved 175px by 175px mapping tiles and mapping list scroll behavior.

## Validation
- PASS: targeted syntax/import validation for changed Input Mapping V2 and Playwright files.
- PASS: external JS/CSS sanity check for Input Mapping V2 HTML.
- PASS: no legacy `gamepad-button` / `gamepad-axis` source values remain in Input Mapping V2 coverage paths.
- PASS: focused Playwright validation:
  `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "launches Input Mapping V2 and captures keyboard mappings|uses header lifecycle controls and launches tools from fixed Workspace Manager V2 tiles"`
- PASS: `npm run test:workspace-v2` (`60 passed`).
- PASS: no sample JSON changes.
- PASS: coverage changed JS guardrail reported no warnings.

Full samples smoke test was not run, per PR scope.

## Manual Validation
1. Launch Workspace Manager V2 and open Input Mapping V2.
2. Confirm Capture Keyboard, Capture Mouse, and Capture Gamepad are stacked vertically and fill the capture panel width.
3. Select an action and click Add Action; confirm an empty 175px by 175px mapping tile appears immediately.
4. Change the tile's Captured Mappings Action dropdown and confirm the tile/action selection updates.
5. Capture Keyboard `KeyA`, confirm the token appears, then click the token and confirm it is deleted.
6. Connect or enable a browser-visible gamepad, focus the page, and confirm Input Sources reports the connected controller; if unavailable, confirm the WARN explains browser focus/permission/API timing.

## Files Changed
- `tools/input-mapping-v2/js/services/InputMappingState.js`
- `tools/input-mapping-v2/js/controls/PreviewPanelControl.js`
- `tools/input-mapping-v2/js/ToolStarterApp.js`
- `tools/input-mapping-v2/js/services/EngineInputSourceService.js`
- `tools/input-mapping-v2/styles/inputMappingV2.css`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
