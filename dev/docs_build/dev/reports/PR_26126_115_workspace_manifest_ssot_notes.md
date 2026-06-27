# PR_26126_115 Workspace Manifest SSoT Notes

## Manifest Schema
- `toolbox/schemas/workspace.manifest.schema.json` is now the source of truth for Workspace Manager V2 generated launch data.
- The schema now requires active game context directly on the workspace manifest:
  - `gameId`
  - `gameRoot`
  - `assetsPath`
- The schema now requires the Asset Manager V2 payload at `tools.asset-manager-v2`.
- `tools.palette-browser` remains the required palette key because the current schema still defines the palette contract there.

## Generated Manifest
- Workspace Manager V2 now generates and stores only the workspace manifest JSON.
- The old wrapper shape is no longer generated:
  - no root `toolId`
  - no root `activePalette`
  - no nested `workspaceManifest`
- Generated manifests use `tools.asset-manager-v2.assets`.
- Generated manifests do not include `tools.asset-browser`.

## Launch Handoff
- Workspace Manager V2 validates the generated manifest against `workspace.manifest.schema.json` before enabling launch/use.
- Asset Manager V2 reads the `hostContextId` value as the schema-valid workspace manifest itself.
- Asset Manager V2 rejects old wrapper context JSON and manifests that still use `tools.asset-browser`.
- Asset Manager V2 writes validated assets back to `tools.asset-manager-v2.assets`.

## Scope
- Deprecated `toolbox/workspace-v2/` was not modified.
- Sample JSON was not modified.
- Temporary `?workspace=UAT` remains isolated and unchanged.

