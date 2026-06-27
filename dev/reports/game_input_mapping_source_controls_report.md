# PR_26140_122 - Populate Game Input Mappings From Source Controls

## Summary

- Replaced empty/default `tools.input-mapping-v2.actions` across game manifests with source-derived actions and real input bindings.
- Removed `input-mapping-v2` from `_template` because it has no confidently inferable playable controls; documented as SKIP rather than adding empty placeholders.
- Added `src/engine/input/InputMappingManifest.js` so runtime and tools can normalize manifest bindings through the engine input layer instead of local hidden fallback mappings.
- Wired Asteroids and Space Duel runtime entry points to consume manifest input mappings through existing engine input APIs while preserving their existing direct-launch behavior.
- Updated Input Mapping V2 launch loading so Workspace Manager game manifest data hydrates real action mappings and export/copy continues to omit empty actions.
- Added a minimal `_template` preview asset path so Workspace Manager V2 manifest validation can load the template manifest without asset-manager path errors.

## Source-Control Mapping Audit

- `games/Bouncing-ball`: `Start` = Space, Enter, Pad0 Button 0; `Pause` = KeyP, Pad0 Button 9; `Reset` = KeyR, Pad0 Button 1.
- `games/Breakout`: paddle movement from Arrow/A-D and Pad0 directions/axis; serve, pause, and exit from the source keyboard/gamepad controls.
- `games/Pong`: player/opponent movement, serve, pause, exit, and mode navigation from WASD, arrows, Tab/KeyM/KeyN, and Pad0/Pad1 controls.
- `games/AITargetDummy` and `games/Pacman`: movement, start, reset, and pause from source keyboard/gamepad controls.
- `games/SpaceInvaders`: movement, fire/held fire, start, pause/menu/debug, selection, and initials entry controls.
- `games/GravityWell`: rotate/thrust/brake plus start/record/playback controls.
- `games/SolarSystem`: pause, labels, reset clock, and time-scale hotkeys.
- `games/Asteroids` and `games/vector-arcade-sample`: Asteroids start/continue, ship controls, fire, pause, and initials entry controls.
- `games/SpaceDuel`: existing `ACTION_BINDINGS` plus initials entry controls.

## Validation

- `node --check` passed for changed engine input, Input Mapping V2, game runtime, and Workspace V2 test files.
- Empty action audit passed: every present `tools.input-mapping-v2` action has at least one input; Bouncing-ball has 3 actions, 7 inputs, and 0 empty actions.
- `node scripts/validate-json-contracts.mjs --games --no-samples --no-tools` reported `game_manifest_schema_validation: total=12 invalid=0`; the script still refreshes broader tool/sample inventories, so generated report churn was removed from this PR.
- Workspace Manager V2 `buildContextFromManifest` validation passed for every `games/**/game.manifest.json`, including active tool payload loading.
- Existing launch/control validators were run for AITargetDummy, Bouncing-ball, Breakout, GravityWell, Pacman, Pong, SolarSystem, SpaceDuel, and SpaceInvaders; the Asteroids boot path was separately verified to hydrate an engine `InputMap` from `game.manifest.json`.
- `npm run test:workspace-v2` passed: 71 tests passed.
- Playwright V8 coverage was regenerated. It is advisory only; `src/engine/input/ActionInputService.js` remains a warning because it was not collected by browser V8 coverage in this run.

## Notes

- No schemas were changed.
- No sample JSON was touched.
- No hidden fallback mappings were added.
- Required reports and packaging were generated under `docs_build/dev/` and `tmp/`.
