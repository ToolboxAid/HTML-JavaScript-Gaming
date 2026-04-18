# BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT Report

## Scope Outcome
- Added shared validation/output stages to the asset pipeline with minimal integration work.
- Kept scope focused to shared pipeline modules (no UI/theme/editor-state/render changes).

## Validation Stage Additions
- New shared module: `tools/shared/assetPipelineValidationOutput.js`
- Added registry-level validation for:
  - schema shape (expected section arrays)
  - ID rules (required IDs, supported character set)
  - references (candidate/graph-resolved references)
- Reused existing shared registry utilities:
  - `sanitizeAssetRegistry(...)`
  - `buildAssetDependencyGraph(...)`
  - `findRegistryEntryById(...)`
- Missing dependency targets are enforced as validation issues.

## Output Stage Additions
- Added deterministic JSON output artifact builder:
  - schema: `tools.asset-pipeline-output/1`
  - format: `json`
  - deterministic build path: `build/assets/<projectId>.assets.pipeline.json`
- Reused existing shared JSON payload helper:
  - `createRegistryDownloadPayload(...)`
- Output includes summary + validation counts + sanitized registry payload.

## Pipeline Integration
- Updated `tools/shared/assetPipelineFoundation.js` to integrate new stages.
- Stage map now includes:
  - `validation`
  - `output`
- `registerAssetPipelineCandidate(...)` now executes:
  - normalize -> convert -> candidate validate -> register -> pipeline validation -> output
- On pipeline validation failure:
  - returns `valid: false`
  - preserves incoming registry (no invalid registry write-forward)
  - output stage is omitted
- Added exported helpers:
  - `validateAssetPipelineRegistryState(...)`
  - `createAssetPipelineOutput(...)`

## Validation
- Required smoke:
  - `npm run test:launch-smoke -- --tools`
  - Result: PASS (`9/9`)
  - Evidence: `docs/reports/launch_smoke_report.md`
- Focused validation/output verification:
  - verified valid assets pass and produce output artifacts
  - verified unresolved references fail validation and suppress output stage
  - verified deterministic export path/format
  - Result: PASS
  - Evidence: `docs/reports/BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT_validation.txt`

## Exact Files Changed
- `docs/pr/BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT.md`
- `docs/reports/asset_pipeline_validation_output_targets.txt`
- `tools/shared/assetPipelineValidationOutput.js`
- `tools/shared/assetPipelineFoundation.js`
- `docs/reports/launch_smoke_report.md`
- `docs/reports/BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT_validation.txt`
- `docs/reports/BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT_report.md`
