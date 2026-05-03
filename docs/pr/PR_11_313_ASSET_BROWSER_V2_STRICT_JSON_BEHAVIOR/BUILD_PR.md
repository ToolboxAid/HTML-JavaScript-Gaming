# BUILD_PR_11_313

## Implementation
- Updated `asset-browser-v2` session contract handling to reject legacy `payloadJson.importName` / `payloadJson.importDestination` fields.
- Preserved strict render path from validated `payloadJson.assetCatalog.entries` only.
- Added explicit valid-empty catalog message when catalog is valid but has zero entries.
- Added targeted runtime validation test:
  - `tests/runtime/V2AssetBrowserStrictJson.test.mjs`

## Validation
- `node --check tools/asset-browser-v2/index.js`
- `node --check tests/runtime/V2AssetBrowserStrictJson.test.mjs`
- `node tests/runtime/V2AssetBrowserStrictJson.test.mjs`
- `node tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1505-1505`
