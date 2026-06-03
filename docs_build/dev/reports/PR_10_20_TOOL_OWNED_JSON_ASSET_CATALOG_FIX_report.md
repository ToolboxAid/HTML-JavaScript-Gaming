# PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX Report

## Scope
Fix tool-owned JSON asset catalog behavior for samples `0204`, `1413`, and `1505` so Asset Browser / Import Hub keeps full JSON-backed entries loaded (no flash-then-blank/truncate), with preset fields treated as UI state only.

## Changed Files

### Tool
- `toolbox/Asset Browser/main.js`

### Sample 0204
- `samples/phase-02/0204/sample.0204.asset-browser.json`
- `samples/phase-02/0204/assetRegistry.js` (deleted)

### Sample 1413
- `samples/phase-14/1413/sample.1413.asset-browser.json`

### Sample 1505
- `samples/phase-15/1505/sample.1505.asset-browser.json`

## Root Cause (Flash-Then-Blank / Truncate)
Asset Browser loaded catalog entries from JSON correctly on first pass, then a later preset-apply pass (`assetBrowserPreset.selectedCategory` + `assetBrowserPreset.search`) filtered the visible set down to zero or one entry.

Observed failure pattern from prior evidence:
- `0204`: loaded entries then ended at empty (`No assets loaded`)
- `1413`: loaded entries then truncated to one visible asset
- `1505`: loaded entries then truncated to one visible asset

## Fix Applied
1. Normalized sample preset UI filters so they do not hide catalog content:
- Set `selectedCategory: "All"`
- Set `search: ""`
- Kept preset-only UI fields (selection/import defaults) as UI state only

2. Hardened `applyAssetBrowserPreset` in `toolbox/Asset Browser/main.js`:
- If JSON catalog is non-empty but preset filters produce zero visible results, revert UI filter state to unfiltered (`All` + empty search).
- Emit a diagnostics warning describing the preset filter reset.

3. Removed sample-local 0204 bridge file:
- Deleted `samples/phase-02/0204/assetRegistry.js`
- Tool catalog loading remains JSON-driven from sample/tool preset JSON only.

## Final JSON Source Files (Canonical for Tool Catalog)
- `0204`: `samples/phase-02/0204/sample.0204.asset-browser.json` -> `config.assetCatalog.entries`
- `1413`: `samples/phase-14/1413/sample.1413.asset-browser.json` -> `config.assetCatalog.entries`
- `1505`: `samples/phase-15/1505/sample.1505.asset-browser.json` -> `config.assetCatalog.entries`

## Asset Counts (Before/After)

### 0204
- Before (visible after second pass): `0`
- After (visible): `3`
- JSON declared entries: `3`

### 1413
- Before (visible after second pass): `1`
- After (visible): `3`
- JSON declared entries: `3`

### 1505
- Before (visible after second pass): `1`
- After (visible): `2`
- JSON declared entries: `2`

## 0204 Bridge Confirmation
- Asset Browser / Import Hub does not read tool data from `AssetRegistryScene.js` or `assetRegistry.js`.
- `samples/phase-02/0204/assetRegistry.js` has been removed.
- Tool catalog remains sourced from JSON via `samplePresetPath` and `config.assetCatalog.entries`.

## Validation

### Commands
1. `node --check toolbox/Asset Browser/main.js`
2. `node --check samples/phase-02/0204/main.js`
3. `node --check samples/phase-14/1413/main.js`
4. `node --check samples/phase-15/1505/main.js`
5. `node --check samples/phase-02/0204/AssetRegistryScene.js`
6. `node --check samples/phase-14/1413/AssetImportPipelineScene.js`
7. `node --check samples/phase-15/1505/AssetBrowserScene.js`
8. `npm run test:launch-smoke -- --tools`

### Results
- `node --check`: PASS
- `npm run test:launch-smoke -- --tools`: PASS (`PASS=286 FAIL=0 TOTAL=286`)

## Guardrails
- No fallback/default/hidden sample data added.
- No JS scraping used.
- No `start_of_day` folder modifications.
