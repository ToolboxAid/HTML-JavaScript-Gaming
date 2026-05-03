# BUILD_PR_11_326

## Implementation
- Updated `tools/asset-manager-v2/index.js` only.
- Scoped session persistence to explicit mutation paths:
  - `addAssetEntry` -> `loadContract(nextSessionContext, true)`
  - `removeAssetEntryById` -> `loadContract(nextSessionContext, true)`
- Updated passive load path to avoid implicit persistence:
  - `readSession` -> `loadContract(parsedSession, false)`
- Updated contract/render pipeline:
  - `loadContract(sessionContext, persistToWorkspace = false)`
  - `renderCatalog(assetCatalog, sessionContext, persistToWorkspace = false)`
  - persistence readout now reflects passive load vs explicit mutation persistence.

## Validation
- `node --check tools/asset-manager-v2/index.js`
- `node tests/runtime/V2AssetManagerWorkspacePersistence.test.mjs`
- `npm run test:workspace-v2`
