# BUILD_PR_11_314

## Implementation
- Added Asset Manager V2 write-back method `persistValidSessionForWorkspace(sessionContext, assetCatalog)`:
  - Writes only valid `asset-manager-v2` session payloads to `sessionStorage` using current `hostContextId`.
  - Preserves strict `payloadJson.assetCatalog` contract and blocks invalid writes.
  - Keeps session size guard enforcement.
- Updated valid-state workspace readout in Asset Manager V2:
  - Removed deferred wording.
  - Reports persisted status for Workspace V2 export.
- Added Workspace V2 URL-host restore path:
  - `restoreActiveSessionFromHostContextIdUrl()`
  - Restores `activeSession` from `?hostContextId=` when payload validates and `toolId === "asset-manager-v2"`.
  - Syncs manifest textarea so exports include restored `activeSession.payloadJson.assetCatalog`.
- Added targeted runtime test:
  - `tests/runtime/V2AssetManagerWorkspacePersistence.test.mjs`

## Validation
- `node --check tools/asset-manager-v2/index.js`
- `node --check tools/workspace-v2/index.js`
- `node --check tests/runtime/V2AssetManagerWorkspacePersistence.test.mjs`
- `node tests/runtime/V2AssetManagerWorkspacePersistence.test.mjs`
- `rg -n "asset-browser-v2" .`
- `rg --files | rg "asset-browser-v2"`
