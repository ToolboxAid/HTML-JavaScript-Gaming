# PR_26140_090 Input Mapping V2 Combo and Device Capture Report

## Scope
- Updated Input Mapping V2 only, plus focused Workspace V2 Playwright coverage.
- Preserved external JS/CSS, fullscreen layout, stacked full-width capture buttons, and 175px by 175px mapping tiles.
- Did not change schemas or sample JSON.

## Changes
- Removed the active Reset Default Actions control and its app/control wiring.
- Mapping tiles now keep the selected action fixed at creation time and no longer render an action dropdown after creation.
- Tiles display captured mappings directly as removable tokens.
- Existing `InputMappingState` multi-input arrays now support combo-style mappings on one action tile, including keyboard + keyboard and keyboard + gamepad combinations.
- Gamepad capture now renders one capture button per detected gamepad, using labels from the browser Game Controller API when available.
- Gamepad capture remains on the existing engine input path: `InputService` + `GamepadState` + `GamepadInputAdapter`.
- Device-specific capture is recorded through the binding and label while preserving the existing schema source enum:
  - `source`: `gamepad`
  - `binding`: `Pad<index>:Button<n>` or `Pad<index>:Axis<n><direction>`
  - `label`: `<device name> (Gamepad <index>) Button <n>` or Axis equivalent.
- Added selected-device WARN logging when the detected gamepad has no active button or axis at capture time.

## Sample 0104 Alignment
Sample 0104 reads gamepads through `engine.input.getGamepad(0)` and `engine.input.getGamepads()`, which come from the shared engine `InputService`. Input Mapping V2 now refreshes and reads the same `InputService` gamepad snapshot path, then uses `GamepadInputAdapter` for button/axis interpretation.

## Playwright Impact
Yes. This PR changes Input Mapping V2 UI controls, capture flow, gamepad device rendering, and generated mapping output.

Playwright now validates:
- Reset Default Actions is absent.
- Add Action creates a fixed-action tile.
- Mapping tiles show captured mapping text and no tile action dropdown.
- One tile can hold multiple captured inputs for combo mappings.
- Multiple detected gamepads produce one capture button per device.
- Selected gamepad capture records the selected device name/index in the label and binding.
- Captured inputs can still be deleted from the tile.

## Validation
- PASS: targeted syntax/import validation for changed Input Mapping V2 files and focused Playwright file.
- PASS: focused Playwright validation:
  `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "launches Input Mapping V2 and captures keyboard mappings"`
- PASS: `npm run test:workspace-v2` (`60 passed`).
- PASS: no schema JSON changes.
- PASS: no sample JSON changes.
- PASS: coverage changed JS guardrail reported no warnings.

Full samples smoke test was not run, per PR scope.

## Manual Validation
1. Launch Input Mapping V2.
2. Confirm Reset Default Actions is absent.
3. Select an action and click Add Action; confirm a 175px by 175px tile appears with that fixed action label and no action dropdown.
4. Capture two keyboard inputs for the same action and confirm both tokens display on the same tile.
5. Connect or expose multiple gamepads to the browser; confirm one full-width capture button appears for each detected device and includes the device name when available.
6. Capture a button or axis from a chosen gamepad; confirm the tile token includes the device name/index and the JSON binding includes the selected pad index.
7. Click captured tokens and confirm they are removed without deleting the tile.
