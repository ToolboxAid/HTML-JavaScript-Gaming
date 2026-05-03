# BUILD_PR_11_312

## Implementation
- Added strict `toolId` checks for all V2 tool entry points.
- Enforced `payloadJson` contract across tools.
- Updated `palette-manager-v2` to consume only `payloadJson.paletteDocument` and reject legacy `paletteJson` payloads.
- Removed palette auto-correction/fallback parsing logic and required strict swatch object shape.
- Updated palette fixture to strict payloadJson contract for targeted validation.

## Validation
- `node --check tools/asset-browser-v2/index.js`
- `node --check tools/palette-manager-v2/index.js`
- `node --check tools/svg-asset-studio-v2/index.js`
- `node --check tools/tilemap-studio-v2/index.js`
- `node --check tools/vector-map-editor-v2/index.js`
