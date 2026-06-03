# PR_26128_007 Game Manifest SSoT

## Summary
- Added `toolbox/schemas/game.manifest.schema.json` as the dedicated schema for `games/**/game.manifest.json`.
- Reworked the Workspace Manager V2 discovery path to validate discovered `game.manifest.json` files against the dedicated game schema, not `workspace.manifest.schema.json`.
- Converted the current Workspace Manager V2 game project manifests for Asteroids, Gravity Well, and Pong into the game-manifest SSoT envelope.
- Preserved existing Workspace Manager V2 launch/session behavior by deriving the runtime workspace context from `game.workspace`.

## SSoT Shape
- `game.gameData` owns runtime-facing game data.
- `game.workspace` owns tool/editor/workspace state used to edit and build the game.
- No separate `games/**/workspace.manifest.json` file is required for Active Game discovery or launch.
- The root game manifest is `schema: html-js-gaming.game-manifest`; the nested `game.workspace` payload remains the runtime workspace container used by existing Workspace Manager V2 tool launches.

## Discovery Behavior
- Active Game starts empty and disabled.
- Repo load clears the current Active Game immediately.
- Successful repo discovery enables Active Game with schema-valid `game.manifest.json` entries only.
- Invalid manifests are skipped with visible status log entries that include the manifest path and validation reason.
- Missing manifests are skipped, not fatal.
- No default Active Game is auto-selected.

## Scope Notes
- No sample JSON was modified.
- No roadmap content was modified.
- No cross-tool communication was added.
- Session/toolState behavior was preserved; existing launches still receive the same workspace-shaped session context.
- Full samples smoke test was skipped because this BUILD explicitly requested targeted Workspace Manager V2 validation and to skip full samples smoke.

## Validation
- PASS: `node --check toolbox/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- PASS: `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS: JSON parse for `toolbox/schemas/game.manifest.schema.json`, `games/Asteroids/game.manifest.json`, `games/GravityWell/game.manifest.json`, and `games/Pong/game.manifest.json`
- PASS: `npm run test:workspace-v2` - 11 passed
