# PLAN_PR_11_312

## Purpose
Enforce strict Workspace V2 tool contract validation so tools only consume validated `payloadJson` and reject invalid session JSON visibly.

## Scope
- `tools/asset-manager-v2/index.js`
- `tools/palette-manager-v2/index.js`
- `tools/svg-asset-studio-v2/index.js`
- `tools/tilemap-studio-v2/index.js`
- `tools/vector-map-editor-v2/index.js`
- `tests/fixtures/v2-tools/palette-manager-v2.json`

## Steps
1. Tighten per-tool contract checks at session load boundaries.
2. Enforce strict `toolId` match per tool.
3. Enforce strict `payloadJson` path and reject legacy palette root fields.
4. Remove palette auto-correction behavior and require explicit valid swatch shape.
5. Run targeted syntax validation on changed tool entry files.
6. Write tool validation report JSON and package artifacts.
