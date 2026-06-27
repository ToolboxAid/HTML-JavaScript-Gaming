# PR_26140_091 Input Mapping V2 Gamepad Detection Source Report

## Scope
- Fixed Input Mapping V2 gamepad discovery so the tool does not depend on a running sample/game engine loop.
- Preserved PR_26140_090 combo input behavior, fixed-action tile display, per-device capture buttons, and captured-input deletion.
- Did not change schemas or sample JSON.

## Sample 0104 Comparison
Sample 0104 reads gamepad state from the shared engine `InputService` boundary:
- `engine.input.getGamepad(0)`
- `engine.input.getGamepads()`

Input Mapping V2 now uses the same browser-to-engine path for tool detection:
- polls `navigator.getGamepads()` through the configured `InputService` gamepad source,
- calls `InputService.update()` from the tool because there is no scene update loop,
- reads normalized `GamepadState` snapshots through `InputService.getGamepads()`,
- uses `GamepadInputAdapter` to interpret selected-device button/axis capture.

## Changes
- Added a `Refresh Gamepads` action in the Capture accordion.
- Added tool-owned gamepad polling so browser-exposed devices appear without Sample 0104 or a game scene loop.
- Logs detected gamepad count and device names on initial refresh, manual refresh, connection events, and device-list changes.
- Keeps one capture button per detected gamepad/device.
- Keeps selected-device WARN logging when the device is visible but no active button/axis is pressed.
- Updated Playwright coverage to mock `navigator.getGamepads()` directly, without dispatching Sample 0104 or relying on an engine frame.

## Playwright Impact
Yes. This PR changes Input Mapping V2 capture UI, gamepad detection timing, and status logging.

Playwright now validates:
- mocked `navigator.getGamepads()` detection without a Sample 0104 engine loop,
- Refresh Gamepads logs detected count and device names,
- per-device capture buttons remain one button per device,
- combo/tile behavior from PR_26140_090 remains intact.

## Validation
- PASS: targeted syntax/import validation for changed Input Mapping V2 files, focused Playwright file, and Sample 0104 files.
- PASS: focused Input Mapping V2 Playwright validation:
  `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "launches Input Mapping V2 and captures keyboard mappings"`
- PASS: targeted Sample 0104 launch validation with mocked `navigator.getGamepads()`; the sample page loaded, canvas appeared, and no page errors were raised.
- PASS: no schema JSON changes.
- PASS: no sample JSON changes.
- PASS with extended timeout: the unrelated Object Vector Studio V2 test that timed out under the default suite passed with `--timeout=240000` in 2.7 minutes.
- FAIL, classified unrelated timeout: `npm run test:workspace-v2` was run twice exactly as requested. Both runs completed 59 tests and timed out on `shows Object Vector Studio V2 layout shell and schema-only palette gate`, which is outside the PR_091 changed files. The same test passes with a larger timeout, indicating validation timeout debt rather than an Input Mapping V2 behavior regression.

Full samples smoke test was not run, per PR scope.

## Manual Validation
1. Launch Input Mapping V2.
2. Connect or expose a controller to the browser, then click Refresh Gamepads.
3. Confirm the Status log reports the detected gamepad count and device names.
4. Confirm one full-width capture button appears for each detected gamepad.
5. Capture a selected device button or axis and confirm the token uses that device name/index.
6. Confirm combo mappings and fixed-action tile display from PR_26140_090 still work.
