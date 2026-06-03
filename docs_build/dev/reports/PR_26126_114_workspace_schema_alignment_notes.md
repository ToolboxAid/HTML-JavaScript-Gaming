# PR_26126_114 Workspace Schema Alignment Notes

## Schema Sources
- `tools/schemas/workspace.manifest.schema.json`
- `tools/schemas/tools/palette-browser.schema.json`
- `tools/schemas/tools/asset-browser.schema.json`

## Workspace Manifest Shape
- Workspace Manager V2 generated `workspaceManifest` now uses only schema-supported root fields:
  - `documentKind`
  - `schema`
  - `version`
  - `id`
  - `name`
  - `tools`
- Removed generated root `gameId` from `workspaceManifest` because the workspace manifest schema does not allow it.
- Removed generated root `workspaceMetadata` from `workspaceManifest` because the workspace manifest schema does not allow it.
- Active launch context still owns `gameId`, `gameRoot`, and `assetsPath` outside the manifest as Workspace Manager V2 session context.

## Tool Keys
- The current workspace manifest schema does not define a `tools.asset-manager-v2` key.
- The schema-supported asset payload key remains `tools.asset-browser`.
- Workspace Manager V2 therefore keeps the canonical `tools.asset-browser` key and stores Asset Manager V2 assets at `tools.asset-browser.assets`.
- The generated `tools.asset-browser` payload no longer includes unsupported wrapper fields such as `schema`, `version`, `name`, or `source`.
- The generated `tools.asset-browser` payload now contains only `assets: {}` until Asset Manager V2 inserts validated entries.

## Palette Contract
- The current workspace manifest schema requires `tools.palette-browser`.
- Workspace Manager V2 keeps `tools.palette-browser` and emits a direct palette payload matching `palette-browser.schema.json`.
- No `tools.palette-manager-v2` key was added because the current workspace manifest schema does not support that key.

## Asset Records
- Asset records continue to be keyed by asset ID under `tools.asset-browser.assets`.
- The current asset schema does not require an `id` field inside each asset object.
- The current asset schema requires per-asset `source`, so Asset Manager V2 keeps `source: "asset-manager-v2"` in inserted asset records.

## Naming Cleanup
- Visible Workspace V2 wording in the Asset Manager V2 launch/palette path was updated to Workspace Manager V2 language.
- Asset Browser display/wrapper naming was removed from generated Workspace Manager V2 manifest JSON.
- `tools.asset-browser` remains only as the canonical schema key required by the repo schema.

