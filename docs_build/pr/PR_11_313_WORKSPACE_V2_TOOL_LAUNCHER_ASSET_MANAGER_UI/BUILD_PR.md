# BUILD_PR_11_313

## Implementation
- Added explicit Workspace V2 tools menu section with direct `Open Asset Manager V2` action.
- Wired direct Asset Manager launch in Workspace V2:
  - Reads active Workspace session.
  - Requires active `payloadJson`.
  - Launches `tools/asset-manager-v2/index.html?hostContextId=<id>&fromTool=workspace-v2`.
  - Preserves `asset-manager-v2` tool/session contract and lets Asset Manager V2 show existing empty/invalid states when `assetCatalog` is not valid.
- Renamed user-facing labels from Asset Browser V2 to Asset Manager V2 in:
  - Workspace V2 producer/tools labels
  - Asset Browser V2 page title/text
  - Tools index menu label
- Kept contract identifiers unchanged (`asset-manager-v2`).

## Validation
- `node --check tools/workspace-v2/index.js`
- `node --check tools/asset-manager-v2/index.js`
- `node --check tests/runtime/V2WorkspaceAssetManagerLaunch.test.mjs`
- `node tests/runtime/V2WorkspaceAssetManagerLaunch.test.mjs`
