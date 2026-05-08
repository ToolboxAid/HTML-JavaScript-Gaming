# Playwright Game Manifest SSoT

## Command
`npm run test:workspace-v2`

## Result
PASS: 11 passed

## Targeted Coverage
- Verified Workspace Manager V2 launches from the tools index.
- Verified Active Game starts empty and disabled before repo selection.
- Verified Active Game enables only after successful repo discovery.
- Verified Active Game discovers schema-valid `game.manifest.json` files.
- Verified discovered game manifests validate through `validateGameManifest`.
- Verified Asteroids `game.manifest.json` has no root workspace/document payload and instead owns `game.gameData` plus `game.workspace`.
- Verified `game.workspace` still validates as the runtime workspace context used by existing tool launches.
- Verified invalid manifests are skipped and logged with path plus validation reason.
- Verified repo load failure clears and disables Active Game.
- Verified no default game is auto-selected.
- Verified Workspace Manager V2, Preview Generator V2, Asset Manager V2, Palette Manager V2, and Templates V2 launch paths still work from the derived workspace context.

## Skipped
- Full samples smoke test was skipped as requested. The targeted Workspace Manager V2 Playwright suite covers the schema ownership change, manifest discovery, invalid-manifest logging, and affected launch/session paths.
