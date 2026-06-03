# Input Mapping V2 Device/Gesture Wiring Report

PR: PR_26140_115-fix-input-mapping-v2-device-gesture-wiring

## Summary
- Renamed the center-column Capture accordion to `Input Device(s)` and Gestures to `Capture Gestures`, with no braces in either visible label.
- Renamed the center-column mapping workspace from `Captured Mappings` to `Action Mappings`, including related aria labels and mapping-deletion status text.
- Disabled and grayed `Input Device(s)` until the selected action has an existing tile, and disabled `Capture Gestures` until an input device is selected.
- Enforced device-first capture flow: selecting an input device enables only that device's gesture group, and stale selected gestures no longer auto-arm when a device is clicked after capture completion.
- Removed visible Mouse Wheel Left/Right gesture descriptors because PR_115 only requires visible/wired Wheel Up and Wheel Down; underlying wheel input support remains available through the engine where used by existing capture/combo paths.
- Preserved selected action/tile behavior, token deletion, mapping scroll behavior, Export/Copy JSON, engine-backed combo capture, and game controller release capture through engine input services.

## Gesture Wiring
- Keyboard: Press, Release, Hold, Combo are visible when Keyboard is selected and are covered by focused Playwright capture paths.
- Mouse: Click, Double Click, Drag, Drag Release, Wheel Up, Wheel Down, Combo are visible when Mouse is selected and are covered by focused Playwright capture paths.
- Game Controller: Btn Press, Btn Hold, Btn Release, Trigger, Stick, DPad, Combo are visible when a Game Controller input device is selected and are covered by focused Playwright capture paths.
- Btn Release continues to capture on release, not press, via `src/engine/input/**` state consumed by Input Mapping V2.
- Combo capture continues to use the engine-backed combo state path rather than a tool-local-only model.

## Validation
- PASS: targeted syntax validation with `node --check` for changed engine/input, Input Mapping V2, and Playwright files.
- PASS: targeted module import validation for changed engine/input and Input Mapping V2 JS modules.
- PASS: focused Input Mapping V2 Playwright coverage: 11 passed.
- PASS: `npm run test:workspace-v2`: 70 passed.
- PASS: additional label follow-up targeted syntax validation with `node --check toolbox/input-mapping-v2/js/services/InputMappingState.js` and `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`.
- PASS: additional label follow-up focused Playwright validation with `npx playwright test tests/playwright/tools/WorkspaceManagerV2.spec.mjs --project=playwright --workers=1 --reporter=list --grep "launches Input Mapping V2"`: 1 passed.
- PASS: additional label follow-up full Workspace V2 validation with `npm run test:workspace-v2`: 70 passed.
- SKIPPED as requested: full samples smoke test.

## Schema/Samples
- No schemas changed.
- No sample JSON touched.
