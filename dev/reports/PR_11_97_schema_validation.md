# PR 11.97 Schema Validation

## Scope
Implemented `BUILD_PR_LEVEL_11_97_FIX_ASSET_BROWSER_SCHEMA_PROPERLY` with targeted schema + sample 1902 data updates only.

## Files Changed
- `toolbox/schemas/tools/asset-browser.schema.json`
- `samples/phase-19/1902/sample.1902.workspace-all-tools.json`

## Contract Fixes Applied
1. `asset-browser.assets` remains a flat map (no nested `media`).
2. Asset id format enforced as `<kind>.<domain>.<name>` using strict key patterns.
3. Asset entry now requires:
   - `path`
   - `kind`
   - `source`
4. `stretchOverride.uniformEdgeStretchPx` remains allowed only for `image.*.bezel` entries.
5. Compatibility payload properties preserved:
   - `assetBrowserPreset`
   - `approvedAssets`
   - `importHubPreset`
6. Sample 1902 preview asset id updated:
   - `sample-1902-preview` -> `image.sample1902.preview`
7. Sample 1902 asset-browser workspace preset id normalized to schema pattern:
   - `sample-1902-workspace-preset` -> `other.sample1902.workspace-preset`

## Search/Fix Evidence
- Search for stale preview id:
  - Command: `rg -n -F "sample-1902-preview" samples tools games tests`
  - Result: no matches
- Generic asset-browser id `preview` scan:
  - Command: custom JSON scan over repo JSON files for `tools["asset-browser"].assets.preview`
  - Result: `NO_GENERIC_PREVIEW_ASSET_ID_FOUND`

## Targeted Validation Commands
1. Strict schema + sample contract validation:
   - `node -e "import('./tests/tools/ToolSchemaStrictModeValidation.test.mjs').then(async (m)=>{await m.run(); console.log('ToolSchemaStrictModeValidation: PASS');})"`
   - Result: `ToolSchemaStrictModeValidation: PASS`
2. Sample 1902 targeted launch smoke:
   - `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools`
   - Result: PASS (`19/19`)
3. Sample 1902 asset id pattern check:
   - Command: custom JSON check script
   - Result:
     - `assetKeys=["other.sample1902.workspace-preset","image.sample1902.preview"]`
     - `allKeysValid=true`
     - `previewEntryExists=true`

## Full Suite
Skipped by design (targeted schema/sample scope only).