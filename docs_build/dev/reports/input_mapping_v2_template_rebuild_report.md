# Input Mapping V2 Template Rebuild Report

Task: PR_26140_087-rebuild-input-mapping-v2-from-template

## Summary
- Removed the prior hand-built Input Mapping V2 app structure and rebuilt the tool shell from the current `toolbox/templates-v2/` template.
- Kept the template header, menus, accordion, panel, and status conventions with external JS/CSS only.
- Added the Input Mapping V2 feature layer on top of the copied template instead of hand-rolling the shell.
- Preserved Workspace Manager V2 launch behavior and workspace header return behavior.

## Engine Input Alignment
- `EngineInputSourceService` imports existing engine sources from `/src/engine/input/`:
  - `InputService`
  - `GamepadInputAdapter`
- `InputMappingState` imports the existing engine `InputMap` model.
- Surfaced supported source groups represented by engine input code:
  - Keyboard via `InputService` / `KeyboardState`
  - Mouse via `InputService` / `MouseState`
  - Gamepad buttons via `InputService` / `GamepadState` / `GamepadInputAdapter`
  - Gamepad axes via `GamepadInputAdapter`
- No duplicate standalone input model was introduced.

## Behavior Updates
- Expanded default actions to generic engine-style actions for movement, confirm/cancel, menu, interaction, jump/fire/thrust, and rotation.
- Removed `Pause` from the default action list.
- Keyboard capture records labels such as `Keyboard KeyA`.
- Captured input chips are buttons; clicking a chip removes that captured input.
- Gamepad capture uses the engine gamepad adapter when live browser gamepad data is available.
- If the browser cannot provide a live gamepad value, the tool logs an actionable WARN explaining the unavailable capture reason.
- Mapping JSON export/import uses the current template command/status flow.

## State/Storage Inspector Audit
- Storage Inspector V2 and State Inspector references were not changed by this PR.
- This PR is limited to rebuilding Input Mapping V2 from the template and validating its launch and capture behavior.

## Scope Guardrails
- No schema files were changed.
- No sample JSON files were changed.
- Full samples smoke test was not run, per request.

## Validation
- Targeted syntax/import validation for changed Input Mapping V2 files: PASS.
- Focused Playwright validation for Input Mapping V2 launch/capture/delete/gamepad-WARN behavior: PASS.
- `npm run test:workspace-v2`: PASS, 60 tests.
