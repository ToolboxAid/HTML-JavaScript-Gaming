# BUILD_PR — PR_26124_007

## Scope
- Exactly two related tools:
  - `toolbox/asset-manager-v2/index.js`
  - `toolbox/palette-manager-v2/index.js`
- No schema changes
- No sample JSON changes
- No other tool changes

## Implemented
1. Asset Manager V2 (`asset-manager-v2`)
   - Added invalid payload guard:
     - reject root `paletteJson`
     - clear error:
       - `paletteJson is not supported; use payloadJson.assetCatalog.`

2. Palette Manager V2 (`palette-manager-v2`)
   - Added invalid payload guard:
     - reject `payloadJson.assetCatalog`
     - clear error:
       - `payloadJson.assetCatalog is not supported; use payloadJson.paletteDocument.`

## Why
- Prevent cross-tool payload mixing before render.
- Keep strict tool-owned `payloadJson` contracts.
- Preserve deterministic workspace launch behavior without fallback/default injection.

## Validation
- `node --check toolbox/asset-manager-v2/index.js` -> PASS
- `node --check toolbox/palette-manager-v2/index.js` -> PASS
- `npm run test:workspace-v2` -> PASS (`1 passed`, `failed=0`)
