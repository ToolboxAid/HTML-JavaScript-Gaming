# Tool Data Contract

## Purpose
Define and enforce normalized tool-state data contracts used by project save/open integration.

This contract is enforced by:
- `tools/shared/projectToolIntegration.js`
- `tests/tools/ProjectToolDataContracts.test.mjs`

## Contract Metadata
- schema: `html-js-gaming.tool-data-contract`
- version: `1`

## Tool Contracts

### Tile Map Editor
- contractId: `tool-state.tile-map-editor/1`
- required state blocks:
  - `documentModel`
  - `documentModel.assetRefs`

### Parallax Editor
- contractId: `tool-state.parallax-editor/1`
- required state blocks:
  - `documentModel`
  - `documentModel.assetRefs`

### Sprite Editor
- contractId: `tool-state.sprite-editor/1`
- required state blocks:
  - `project`
  - `project.assetRefs`

### Vector Map Editor
- contractId: `tool-state.vector-map-editor/1`
- normalized as tool-local object state.

### Vector Asset Studio
- contractId: `tool-state.vector-asset-studio/1`
- normalized field:
  - `selectedPaletteId` (string id normalization when present)

### Asset Browser
- contractId: `tool-state.asset-browser/1`
- normalized field:
  - `selectedAssetId` (string id normalization when present)

### Palette Browser
- contractId: `tool-state.palette-browser/1`
- normalized field:
  - `selectedPaletteId` (string id normalization when present)

## Enforcement Outputs
`buildProjectToolIntegration(...)` publishes:
- per-tool contract status (`valid` / `invalid`)
- per-tool `contractIssues`
- aggregate `contractSummary` with:
  - schema/version
  - status
  - invalid tool ids
  - warnings by tool
