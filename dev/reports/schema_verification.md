# PR_26128_010 Schema Verification

## Scope
- Verified `toolbox/schemas/game.manifest.schema.json`.
- Verified `toolbox/schemas/workspace.manifest.schema.json`.
- Verified Workspace Manager V2 launchable tool schema references used for session hydration.

## Findings
- `game.manifest.schema.json` remains the SSoT schema for `games/**/game.manifest.json`.
- `game.gameData` remains runtime-owned and requires `launch`.
- `game.gameData` continues to reject `workspace` and `tools` branches.
- `game.workspace` remains editor/tool-owned workspace state.
- `workspace.manifest.schema.json` remains the workspace/toolState container schema.
- Workspace tool payload refs remain schema references, not inlined schemas.
- Required workspace tool payloads remain `palette-manager-v2` and `asset-manager-v2`.
- All 17 workspace tool schema references resolve to existing files.

## Workspace Manager V2 Launchable Tool Schema Basis
- `asset-manager-v2`: `./tools/asset-manager-v2.schema.json`, hydrated as `toolbox/schemas/tools/asset-manager-v2.schema.json`.
- `palette-manager-v2`: `./tools/palette-manager-v2.schema.json`, hydrated as `toolbox/schemas/tools/palette-manager-v2.schema.json`.
- `preview-generator-v2`: workspace launch context only; hydrated against `toolbox/schemas/workspace.manifest.schema.json`.
- `templates-v2`: workspace launch context only; hydrated against `toolbox/schemas/workspace.manifest.schema.json`.

## Verification
- Parsed game manifest schema and workspace manifest schema with Node.
- Confirmed game manifest schema id: `toolbox/schemas/game.manifest.schema.json`.
- Confirmed workspace manifest schema id: `toolbox/schemas/workspace.manifest.schema.json`.
- Confirmed unresolved workspace tool schema refs: `[]`.
- Confirmed launchable tool schema mapping matches current Workspace Manager V2 usage.

Result: PASS.
