# PR_26128_008 Game Workspace Boundary Contract

## Summary
- Clarified the `game.manifest.json` boundary in `tools/schemas/game.manifest.schema.json`.
- `game.gameData` is the runtime contract.
- `game.workspace` is the editor/tool contract.
- Runtime must ignore `game.workspace`.
- Tools may read `game.gameData`.
- Tools may write `game.workspace`.
- Tools may update `game.gameData` only through explicit validated apply/build/export actions.

## Validation Alignment
- Workspace Manager V2 Active Game discovery still validates discovered `game.manifest.json` files with the dedicated game manifest schema.
- `game.gameData.workspace` is rejected with an actionable validation reason because runtime data must not depend on editor/tool workspace state.
- `game.gameData.tools` is rejected because editor/tool state belongs in `game.workspace`.
- The existing Workspace Manager V2 launch/session payload remains workspace-shaped and is derived from `game.workspace`; session/toolState behavior was not changed.
- Workspace Manager V2 now reports the boundary contract in the status log when a valid game manifest is selected or imported.

## Scope Notes
- No separate `workspace.manifest.json` was introduced.
- No sample JSON was modified.
- No roadmap content was modified.
- No cross-tool communication was added.
- Full samples smoke test was skipped because this BUILD explicitly requested targeted Workspace Manager V2 validation and to skip full samples smoke.

## Validation
- PASS: `node --check tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- PASS: `node --check tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- PASS: `node --check tests/playwright/tools/WorkspaceManagerV2.spec.mjs`
- PASS: JSON parse for `tools/schemas/game.manifest.schema.json`, `games/Asteroids/game.manifest.json`, `games/GravityWell/game.manifest.json`, and `games/Pong/game.manifest.json`
- PASS: `npm run test:workspace-v2` - 11 passed
