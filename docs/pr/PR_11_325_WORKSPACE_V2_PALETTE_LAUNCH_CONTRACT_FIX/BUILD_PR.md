# BUILD_PR_11_325

## Implementation
- Updated `tools/workspace-v2/index.js` only.
- Restored palette manager availability in Workspace V2 producer path:
  - removed palette option removal behavior
  - removed palette-specific launch/load/apply blocking guards
  - removed palette-specific producer button disabling
- Aligned Workspace V2 palette payload contract to current tool shape:
  - switched internal palette-session detection from `paletteJson.swatches` to `payloadJson.paletteDocument.swatches`
  - updated fixture normalization for palette sessions to require `payloadJson.paletteDocument`
  - updated session validation for `palette-manager-v2` to require:
    - `payloadJson.paletteDocument.name`
    - `payloadJson.paletteDocument.swatches`
  - kept explicit rejection of legacy `paletteJson`
- Kept scope limited to `workspace-v2` interaction only (no schema/other tool changes).

## Validation
- `node --check tools/workspace-v2/index.js`
- `node tests/runtime/V2WorkspaceDefaultToolInitialization.test.mjs`
- `npm run test:workspace-v2`
