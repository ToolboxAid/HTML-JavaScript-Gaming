# PR 11.99 - Schema Failure Cleanup And Sample Contract Alignment

## Scope
- Strict schema failure cleanup only.
- No schema loosening, no fallback/media bucket restoration, no default payload invention.

## Execution Summary
- Read baseline invalid sample rows from PR 11.98 validation output.
- Applied mechanical cleanup on 38 invalid sample JSON files:
  - Removed top-level `$schema` keys rejected by strict tool schemas.
  - Migrated legacy `config` values into schema-accepted `payload` fields where unambiguous.
  - Removed config/payload fields with no accepted contract.
  - Converted legacy asset-browser samples to strict shell contract with explicit `assets` object and schema-accepted `payload.assetBrowserPreset`; removed rejected `payload.assetCatalog` pattern.
  - Kept sample 1902 untouched and strict-valid.

## Validation Commands Run
- `powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-tool-schemas.ps1`
- `powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-sample-json.ps1`
- `powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-game-manifests.ps1`
- `powershell -ExecutionPolicy Bypass -File .\scripts\PS\validate-all-json-contracts.ps1 -Details`
- `node tests/tools/ToolSchemaStrictModeValidation.test.mjs`
- `node tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools`

## Validation Results
- Tool schemas: `total=17 invalid=0`
- Game manifests: `total=12 invalid=0`
- Sample JSON: `total=66 invalid=28` (down from 38)
- Sample 1902 targeted smoke with tools: PASS (19/19)

## Error Pattern Reduction
- Removed all `unknown key "$schema"` failures from invalid rows.
- Removed all `unknown key "config"` failures from invalid rows.
- Removed all `missing required key "assets"` failures from invalid rows.
- Removed all `payload unknown key` failures for:
  - `assetCatalog`
  - `sampleImportInput`
  - `gameId`
  - `vectorAssetSvgPath`

## Remaining Blockers (Documented, Not Hidden)
Remaining invalid rows are strict oneOf failures at nested document nodes:
- 9x $.payload.spriteProject: value must satisfy exactly one oneOf branch
- 6x $.payload.tileMapDocument: value must satisfy exactly one oneOf branch
- 4x $.payload.parallaxDocument: value must satisfy exactly one oneOf branch
- 3x $.payload.vectorMapDocument: value must satisfy exactly one oneOf branch
- 2x $.payload.asset3d: value must satisfy exactly one oneOf branch
- 2x $.skin: value must satisfy exactly one oneOf branch
- 1x $.payload.tileMapDocument: value must satisfy exactly one oneOf branch | $.payload.parallaxDocument: value must satisfy exactly one oneOf branch
- 1x $.payload.pipelinePayload: value must satisfy exactly one oneOf branch

Remaining invalid files:
- samples/phase-02/0204/sample.0204.3d-asset-viewer.json: $.payload.asset3d: value must satisfy exactly one oneOf branch
- samples/phase-02/0207/sample.0207.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-02/0213/sample.0213.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-02/0214/sample.0214.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-02/0219/sample.0219.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-02/0221/sample.0221.tile-map-editor.json: $.payload.tileMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-02/0224/sample.0224.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-02/0224/sample.0224.tile-map-editor.json: $.payload.tileMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-02/0226/sample.0226.skin-editor.json: $.skin: value must satisfy exactly one oneOf branch
- samples/phase-02/0227/sample.0227.skin-editor.json: $.skin: value must satisfy exactly one oneOf branch
- samples/phase-03/0301/sample.0301.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-03/0302/sample.0302.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-03/0305/sample.0305.tile-map-editor.json: $.payload.tileMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-09/0905/sample.0905.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch
- samples/phase-12/1208/sample.1208.parallax-editor.json: $.payload.parallaxDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1208/sample.1208.tile-map-editor.json: $.payload.tileMapDocument: value must satisfy exactly one oneOf branch | $.payload.parallaxDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1209/sample.1209.tile-map-editor.json: $.payload.tileMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1210/sample.1210.tile-map-editor.json: $.payload.tileMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1211/sample.1211.tile-map-editor.json: $.payload.tileMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1212/sample-1212-vector-map-editor.json: $.payload.vectorMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1213/sample-1213-vector-map-editor.json: $.payload.vectorMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1214/sample-1214-vector-map-editor.json: $.payload.vectorMapDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1218/sample-1218-parallax-editor.json: $.payload.parallaxDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1219/sample-1219-parallax-editor.json: $.payload.parallaxDocument: value must satisfy exactly one oneOf branch
- samples/phase-12/1220/sample-1220-parallax-editor.json: $.payload.parallaxDocument: value must satisfy exactly one oneOf branch
- samples/phase-14/1413/sample.1413.3d-asset-viewer.json: $.payload.asset3d: value must satisfy exactly one oneOf branch
- samples/phase-14/1413/sample.1413.asset-pipeline-tool.json: $.payload.pipelinePayload: value must satisfy exactly one oneOf branch
- samples/phase-14/1414/sample.1414.sprite-editor.json: $.payload.spriteProject: value must satisfy exactly one oneOf branch

## Files Changed (Sample Cleanup)
- samples/phase-02/0204/sample.0204.3d-asset-viewer.json
- samples/phase-02/0204/sample.0204.asset-browser.json
- samples/phase-02/0207/sample.0207.sprite-editor.json
- samples/phase-02/0213/sample.0213.sprite-editor.json
- samples/phase-02/0214/sample.0214.sprite-editor.json
- samples/phase-02/0219/sample.0219.sprite-editor.json
- samples/phase-02/0221/sample.0221.tile-map-editor.json
- samples/phase-02/0221/sample.0221.tile-model-converter.json
- samples/phase-02/0224/sample.0224.sprite-editor.json
- samples/phase-02/0224/sample.0224.tile-map-editor.json
- samples/phase-02/0226/sample.0226.skin-editor.json
- samples/phase-02/0227/sample.0227.skin-editor.json
- samples/phase-03/0301/sample.0301.sprite-editor.json
- samples/phase-03/0302/sample.0302.sprite-editor.json
- samples/phase-03/0305/sample.0305.tile-map-editor.json
- samples/phase-03/0305/sample.0305.tile-model-converter.json
- samples/phase-09/0905/sample.0905.sprite-editor.json
- samples/phase-12/1208/sample.1208.parallax-editor.json
- samples/phase-12/1208/sample.1208.svg-asset-studio.json
- samples/phase-12/1208/sample.1208.tile-map-editor.json
- samples/phase-12/1209/sample.1209.tile-map-editor.json
- samples/phase-12/1209/sample.1209.tile-model-converter.json
- samples/phase-12/1210/sample.1210.tile-map-editor.json
- samples/phase-12/1211/sample.1211.tile-map-editor.json
- samples/phase-12/1212/sample-1212-vector-map-editor.json
- samples/phase-12/1213/sample-1213-vector-map-editor.json
- samples/phase-12/1214/sample-1214-vector-map-editor.json
- samples/phase-12/1215/sample-1215-svg-asset-studio.json
- samples/phase-12/1216/sample-1216-svg-asset-studio.json
- samples/phase-12/1217/sample-1217-svg-asset-studio.json
- samples/phase-12/1218/sample-1218-parallax-editor.json
- samples/phase-12/1219/sample-1219-parallax-editor.json
- samples/phase-12/1220/sample-1220-parallax-editor.json
- samples/phase-14/1413/sample.1413.3d-asset-viewer.json
- samples/phase-14/1413/sample.1413.asset-browser.json
- samples/phase-14/1413/sample.1413.asset-pipeline-tool.json
- samples/phase-14/1414/sample.1414.sprite-editor.json
- samples/phase-15/1505/sample.1505.asset-browser.json

## Full Samples Smoke Decision
- Full samples smoke was skipped.
- Reason: this PR is schema/data-contract cleanup and did not change shared sample loader/framework paths; targeted schema validation plus sample 1902 smoke was executed per BUILD policy.
