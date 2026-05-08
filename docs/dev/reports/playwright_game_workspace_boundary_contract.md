# Playwright Game Workspace Boundary Contract

## Command
`npm run test:workspace-v2`

## Result
PASS: 11 passed

## Targeted Coverage
- Verified Workspace Manager V2 still launches from the tools index.
- Verified Active Game starts empty and disabled before repo selection.
- Verified Active Game still discovers schema-valid `game.manifest.json` files.
- Verified `game.manifest.json` remains the only required game project manifest for Active Game discovery.
- Verified `game.gameData` is present as the runtime lane.
- Verified `game.workspace` is present as the editor/tool lane and remains nested under the game manifest.
- Verified root game manifests do not expose root `documentKind` or root `tools` as runtime-required data.
- Verified `game.gameData.workspace` is rejected with an actionable boundary validation message.
- Verified the nested `game.workspace` payload still validates as the existing Workspace Manager V2 launch/session context.
- Verified Workspace Manager V2 status reporting includes the boundary contract when a game manifest is selected or imported.

## Skipped
- Full samples smoke test was skipped as requested. The targeted Workspace Manager V2 Playwright suite covers the changed schema boundary, Active Game discovery, invalid-manifest logging, and affected launch/session paths.
