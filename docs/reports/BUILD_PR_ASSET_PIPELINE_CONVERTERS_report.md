# BUILD_PR_ASSET_PIPELINE_CONVERTERS Report

## Scope Outcome
- Added a minimal shared converter abstraction layer for the asset pipeline.
- Implemented conservative converter defaults for:
  - tile -> vector (basic)
  - vector -> tile (basic)
  - sprite normalization
- Integrated conversion into the shared pipeline foundation between normalize and validate/register stages.
- Kept scope limited to shared pipeline/converter logic (no UI/theme/editor-state/render changes).

## Converter Layer
- New shared module: `tools/shared/assetPipelineConverters.js`
- Introduced:
  - `createAssetPipelineConverterRegistry(...)`
  - `listAssetPipelineConverters(...)`
  - `convertAssetPipelineCandidate(...)`
  - `DEFAULT_ASSET_PIPELINE_CONVERTERS`
- Converter behavior is metadata-safe and path/type normalization focused (minimal transforms only).

## Pipeline Integration
- Updated `tools/shared/assetPipelineFoundation.js` to include `CONVERT` stage.
- `registerAssetPipelineCandidate(...)` now performs:
  - normalize -> optional convert -> validate -> register
- Added `convertNormalizedAssetPipelineCandidate(...)` and `validateNormalizedAssetPipelineCandidate(...)`.
- Added converter inventory to `summarizeAssetPipelineRules()` output.

## Validation
- Command: `npm run test:launch-smoke -- --tools`
- Result: PASS (`9/9` tools)
- Smoke report: `docs/reports/launch_smoke_report.md`

- Converter usability check:
  - Verified converter registry exposes expected converter IDs.
  - Verified tile->vector registration applies conversion and registers converted output.
  - Verified vector->tile registration applies conversion and registers converted output.
  - Verified sprite normalization converter produces normalized sprite output.
  - Result: PASS
  - Evidence: `docs/reports/BUILD_PR_ASSET_PIPELINE_CONVERTERS_validation.txt`

## Exact Files Changed
- `docs/pr/BUILD_PR_ASSET_PIPELINE_CONVERTERS.md`
- `docs/reports/asset_pipeline_converters_targets.txt`
- `tools/shared/assetPipelineConverters.js`
- `tools/shared/assetPipelineFoundation.js`
- `docs/reports/launch_smoke_report.md`
- `docs/reports/BUILD_PR_ASSET_PIPELINE_CONVERTERS_validation.txt`
- `docs/reports/BUILD_PR_ASSET_PIPELINE_CONVERTERS_report.md`
