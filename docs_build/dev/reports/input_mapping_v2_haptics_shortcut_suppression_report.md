# Input Mapping V2 Haptics + Shortcut Suppression Report

PR: PR_26140_104-add-input-mapping-v2-haptics-and-shortcut-suppression

## Source of Truth

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Active `docs_build/pr/BUILD_PR.md` is an unrelated Level 18 rebase note, so this report follows the explicit PR104 user request as the current BUILD scope.
- One PR purpose: add engine-backed game controller haptics support and scoped Input Mapping V2 shortcut suppression.

## Changes

- Added `src/engine/input/GamepadHapticsService.js` as a reusable engine input service for game controller haptics.
- Uses browser Gamepad API haptics only when available:
  - `gamepad.vibrationActuator.playEffect("dual-rumble", ...)`.
  - `gamepad.hapticActuators[].pulse(...)`.
  - `gamepad.hapticActuators[].playEffect(...)` when present.
- Does not fake rumble when unsupported; unsupported, unavailable, or blocked haptics return actionable WARN messages.
- Wired Input Mapping V2 through `EngineInputSourceService` so the tool consumes the engine haptics service rather than owning local haptics runtime logic.
- Moved haptics UI into the Game Controller device section:
  - support state per detected controller,
  - selected-action `Enable Rumble` checkbox,
  - strength and duration controls,
  - `Test Rumble` button only for supported controllers.
- Added scoped `Suppress Shortcuts` checkbox in the Capture accordion header.
- Suppression is scoped to the Input Mapping V2 workspace root only:
  - Ctrl/Meta + Wheel is prevented inside the tool area when enabled,
  - Alt/Ctrl/Meta key browser/page shortcuts are suppressed inside the tool area when enabled where the browser permits,
  - shortcuts are not suppressed when the checkbox is disabled,
  - behavior outside the tool area is not suppressed.
- Preserved `Disable Context` behavior.
- Preserved capture, combo, gesture, tile selection, and selected-input highlighting behavior.
- Adjusted combo polling so held game controller input repeats do not overwrite the first captured combo prompt with a duplicate-input warning while waiting for the second input.

## ToolState / Schema

- No schemas changed.
- No sample JSON changed.
- Haptics settings are kept UI-local per selected action because the existing Input Mapping V2 tool-local mapping/toolState contract does not expose a compatible action-options field for persisting rumble settings without schema drift.

## Playwright Impact

Playwright impacted: Yes.

Focused Workspace V2 coverage now validates:

- haptics support state is displayed for mocked gamepads,
- `Test Rumble` calls a mocked supported actuator,
- unsupported haptics logs an actionable WARN,
- `Enable Rumble` can be toggled for the selected mapping/action,
- shortcut suppression checkbox appears,
- Ctrl + Wheel is prevented inside Input Mapping V2 when enabled,
- Alt key suppression is applied inside Input Mapping V2 when enabled,
- shortcuts are not suppressed when the checkbox is disabled,
- `Disable Context` still works.

## Validation

Passed:

- `node --check src/engine/input/GamepadHapticsService.js`
- `node --check tools/input-mapping-v2/js/services/EngineInputSourceService.js`
- `node --check tools/input-mapping-v2/js/ToolStarterApp.js`
- `node --check tools/input-mapping-v2/js/bootstrap.js`
- `node --check tools/input-mapping-v2/js/controls/CaptureControl.js`
- `node --check tools/input-mapping-v2/js/controls/DeviceListControl.js`
- `node --check tests/input/GamepadHapticsService.test.mjs`
- `node --check tests/run-tests.mjs`
- `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `node -e "const module = await import('./src/engine/input/GamepadHapticsService.js'); if (typeof module.default !== 'function') throw new Error('GamepadHapticsService default export missing');"`
- `node -e "const test = await import('./tests/input/GamepadHapticsService.test.mjs'); await test.run();"`
- `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs -g "Input Mapping V2" --project=playwright --workers=1 --reporter=list` - 2 passed.
- `npm run test:workspace-v2` - 61 passed.
- `git diff --check` - passed; Git reported LF-to-CRLF working-copy warnings only.
- `git status --short -- samples games` - no sample/game JSON changes.
- `rg "imageDataUrl" tools/input-mapping-v2 src/engine/input tests/input tests/playwright/tools/WorkspaceManagerV2.spec.mjs` - no matches.

Notes:

- An initial full `npm run test:workspace-v2` run reached 60/61 and exposed a duplicate held-gamepad combo polling issue in the updated Input Mapping V2 test path. The app was fixed to ignore silent duplicate gamepad repeats during combo polling, the focused Input Mapping V2 slice passed, and the full suite was rerun successfully with 61/61 passing.
- Full samples smoke test was skipped by explicit PR instruction.
- Playwright V8 coverage was produced at `docs_build/dev/reports/playwright_v8_coverage_report.txt`; `docs_build/dev/reports/coverage_changed_js_guardrail.txt` reports no changed runtime JS coverage warnings.

## Manual Validation

1. Open Input Mapping V2 in Workspace V2.
2. Connect or mock a game controller with haptics support.
3. Confirm the Game Controller device section shows haptics support state and a `Test Rumble` button for supported controllers only.
4. Select an action tile, enable `Enable Rumble`, adjust strength/duration, and click `Test Rumble`.
5. Confirm unsupported controllers log a WARN instead of faking rumble.
6. Enable `Suppress Shortcuts` and verify Ctrl + Wheel does not zoom the page while the pointer is inside Input Mapping V2.
7. Verify right-click context suppression still follows only the separate `Disable Context` checkbox.
8. Disable `Suppress Shortcuts` and confirm browser/page shortcuts behave normally again.

## Files Changed

- `src/engine/input/GamepadHapticsService.js`
- `tests/input/GamepadHapticsService.test.mjs`
- `tests/run-tests.mjs`
- `tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- `tools/input-mapping-v2/index.html`
- `tools/input-mapping-v2/js/ToolStarterApp.js`
- `tools/input-mapping-v2/js/bootstrap.js`
- `tools/input-mapping-v2/js/controls/CaptureControl.js`
- `tools/input-mapping-v2/js/controls/DeviceListControl.js`
- `tools/input-mapping-v2/js/services/EngineInputSourceService.js`
- `tools/input-mapping-v2/styles/inputMappingV2.css`
