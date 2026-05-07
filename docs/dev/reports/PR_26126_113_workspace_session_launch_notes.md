# PR_26126_113 Workspace Session Launch Notes

## Session Ownership
- Workspace Manager V2 now writes the production Asset Manager V2 launch context as a Workspace Manager-owned session payload.
- The session context owns:
  - `gameId`
  - `gameRoot`
  - `assetsPath`
  - `activePalette`
  - `workspaceManifest`
- `activePalette` is persisted as a top-level context value with `source: "workspace-manager-v2"` and the active palette swatches.
- `assetsPath` is derived from the active game root as `games/<game>/assets`.

## Production Launch Contract
- Asset Manager V2 production launch requires:
  - `launch=workspace`
  - `fromTool=workspace-manager-v2`
  - a valid `hostContextId`
  - a session payload with `version: "workspace-manager-v2"`
  - `toolId: "asset-manager-v2"`
  - games-only `gameRoot` and `assetsPath`
  - non-empty active palette swatches
- Direct launch without valid Workspace Manager V2 session/context continues to show the launch guard overlay.
- `?workspace=prod` remains unsupported and is treated as an invalid direct-launch state.
- `?workspace=UAT` remains the only temporary URL-based UAT path.

## Games-Only Guard
- Context validation rejects workspace roots outside `games/`.
- Context validation rejects paths containing `samples/` or `tools/`.
- `assetsPath` must match the active game root plus `/assets`.

