# BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1 - Changes Report

Date: 2026-04-11

## Exact Files Changed
- docs/pr/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1.md
- tools/shared/projectManifestContract.js
- tools/shared/runtimeAssetLoader.js
- tools/shared/runtimeAssetValidationUtils.js
- tools/shared/runtimeStreaming.js
- tools/shared/runtimeAssetSharedUtils.js
- tools/shared/vector/vectorAssetBridge.js
- tools/shared/vector/vectorAssetContract.js
- tools/shared/vector/vectorRenderPrep.js
- tools/shared/vector/vectorSafeValueUtils.js

## Extracted vs Normalized Helpers

Extracted (new shared helpers):
- `tools/shared/runtimeAssetSharedUtils.js`
  - `sanitizeRuntimeText(value, fallback)`
  - `createRuntimeReport(level, code, message)`
- `tools/shared/vector/vectorSafeValueUtils.js`
  - `sanitizeVectorText(value, fallback)`

Normalized (existing files now reuse extracted helpers):
- `tools/shared/runtimeAssetLoader.js`
  - replaced local report/text helpers with `runtimeAssetSharedUtils`
- `tools/shared/runtimeStreaming.js`
  - replaced local report/text helpers with `runtimeAssetSharedUtils`
- `tools/shared/runtimeAssetValidationUtils.js`
  - normalized runtime text sanitization via `runtimeAssetSharedUtils`
- `tools/shared/projectManifestContract.js`
  - normalized string sanitization to existing `safeString` from `projectSystemValueUtils`
- `tools/shared/vector/vectorAssetBridge.js`
  - normalized local string sanitization to `sanitizeVectorText`
- `tools/shared/vector/vectorAssetContract.js`
  - normalized local string sanitization to `sanitizeVectorText`
- `tools/shared/vector/vectorRenderPrep.js`
  - normalized local string sanitization to `sanitizeVectorText`

## Helpers Intentionally Left Local
- `sanitizeText/createReport` in:
  - `tools/shared/hotReloadSystem.js`
  - `tools/shared/platformValidationSuite.js`
  - `tools/shared/vectorAssetSystem.js`

Why left local:
- These modules are orchestration/reporting surfaces with domain-specific report vocabulary and aggregation behavior.
- Pulling them into this lane would expand beyond the requested exact-cluster (runtime loader/validation + vector-safe helper normalization) and increase risk/scope.

- Local helper clusters in tool app files (for example, sample-path/readout helpers in Parallax/Tilemap/Vector Asset Studio) were intentionally left unchanged.

Why left local:
- Out of requested scope for this PR (would trend into editor-state extraction or broader refactor lanes).