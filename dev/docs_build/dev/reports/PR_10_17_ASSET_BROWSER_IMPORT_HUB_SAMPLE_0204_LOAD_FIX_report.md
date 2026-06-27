# PR 10.17 Asset Browser / Import Hub Sample 0204 Load Fix Report

PASS

## Files Changed
- toolbox/Asset Browser/main.js
- docs_build/dev/reports/PR_10_17_ASSET_BROWSER_IMPORT_HUB_SAMPLE_0204_LOAD_FIX_report.md
- tmp/PR_10_17_ASSET_BROWSER_IMPORT_HUB_SAMPLE_0204_LOAD_FIX_validation.json

## Root Cause
Asset Browser / Import Hub only hydrated approved assets from:
- explicit `assetCatalogPath` query/context candidates, or
- `active-project-manifest.tools.asset-browser.assets`

For sample `0204`, the explicit asset payload lives in the companion roundtrip preset `sample.0204.3d-asset-viewer.json`, but the loader never inspected sample roundtrip companion presets. Result: list remained empty (`No assets loaded`) even though explicit sample data existed.

## Source JSON Path Used
- `/samples/phase-02/0204/sample.0204.3d-asset-viewer.json`
- payload key resolved: `config.asset3d`
- asset id resolved: `sample-0204-registry-node`

## Implementation Summary (Smallest Scoped)
- Added sample metadata lookup in Asset Browser loader (`/samples/metadata/samples.index.metadata.json`).
- Added companion roundtrip resolution for sample launches:
  - current tool mapping: `asset-browser`
  - companion mapping: `3d-asset-viewer`
- Added companion preset payload extraction (`3d-asset-viewer` / `asset3d` / related keys).
- Mapped explicit companion payload to one approved asset entry (no fabricated fallback data):
  - `id`: companion `assetId`
  - `path`: companion preset JSON path
  - `category`: `Workflow JSON`
- Inserted companion resolution in `loadCatalogEntriesFromContext()` only after existing catalog candidates, preserving existing architecture and precedence.

## Before / After Behavior
- Before:
  - Sample `0204` Asset Browser launch used `sample.0204.asset-browser.json` UI preset only.
  - No `assetCatalogPath` or manifest assets existed.
  - Companion `sample.0204.3d-asset-viewer.json` data was ignored.
  - UI showed empty asset state.
- After:
  - Same launch now resolves sample `0204` companion roundtrip preset for `3d-asset-viewer`.
  - Explicit payload from `sample.0204.3d-asset-viewer.json` is mapped into the asset list.
  - First-item auto-selection and control gating remain unchanged (existing shared selection logic).

## Validation Steps
1. Syntax check:
   - `node --check toolbox/Asset Browser/main.js` (PASS)
2. Data-path verification for sample `0204`:
   - Read `samples/metadata/samples.index.metadata.json`
   - Confirm `roundtripToolPresets` contains:
     - `/samples/phase-02/0204/sample.0204.asset-browser.json`
     - `/samples/phase-02/0204/sample.0204.3d-asset-viewer.json`
   - Read companion preset and confirm `config.asset3d` with `assetId` and vertices (PASS)
3. Loader wiring verification:
   - Confirm `loadCatalogEntriesFromContext()` calls `loadCompanionSampleEntries(sampleId, samplePresetPath)`
   - Confirm companion success updates `catalogLoadInfo` and returns mapped entries (PASS)

Evidence file:
- `tmp/PR_10_17_ASSET_BROWSER_IMPORT_HUB_SAMPLE_0204_LOAD_FIX_validation.json`

## Empty State Validation (No Explicit Data)
Empty-state behavior is preserved:
- Companion load path requires valid `sampleId` + matching roundtrip mapping.
- If mapping is absent, loader returns `null` and falls through to existing source-missing / source-empty handling.
- No fallback/demo/default asset entries were added.

## Scope / Constraints Confirmation
- No sample asset data files modified.
- No schema files modified.
- No manifest files modified.
- No `start_of_day` folders modified.
- No hardcoded hidden sample paths added.
- Change scope stayed within Asset Browser / Import Hub load/mapping path.
