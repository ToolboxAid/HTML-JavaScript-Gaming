# BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1 - Changes Report

Date: 2026-04-11

## Exact Files Changed
- docs_build/pr/BUILD_PR_TOOLS_SHARED_EXTRACTION_PHASE_1.md
- toolbox/shared/projectManifestContract.js
- toolbox/shared/runtimeAssetLoader.js
- toolbox/shared/runtimeAssetValidationUtils.js
- toolbox/shared/runtimeStreaming.js
- toolbox/shared/runtimeAssetSharedUtils.js
- toolbox/shared/vector/vectorAssetBridge.js
- toolbox/shared/vector/vectorAssetContract.js
- toolbox/shared/vector/vectorRenderPrep.js
- toolbox/shared/vector/vectorSafeValueUtils.js

## Extracted vs Normalized Helpers

Extracted (new shared helpers):
- `toolbox/shared/runtimeAssetSharedUtils.js`
  - `sanitizeRuntimeText(value, fallback)`
  - `createRuntimeReport(level, code, message)`
- `toolbox/shared/vector/vectorSafeValueUtils.js`
  - `sanitizeVectorText(value, fallback)`

Normalized (existing files now reuse extracted helpers):
- `toolbox/shared/runtimeAssetLoader.js`
  - replaced local report/text helpers with `runtimeAssetSharedUtils`
- `toolbox/shared/runtimeStreaming.js`
  - replaced local report/text helpers with `runtimeAssetSharedUtils`
- `toolbox/shared/runtimeAssetValidationUtils.js`
  - normalized runtime text sanitization via `runtimeAssetSharedUtils`
- `toolbox/shared/projectManifestContract.js`
  - normalized string sanitization to existing `safeString` from `projectSystemValueUtils`
- `toolbox/shared/vector/vectorAssetBridge.js`
  - normalized local string sanitization to `sanitizeVectorText`
- `toolbox/shared/vector/vectorAssetContract.js`
  - normalized local string sanitization to `sanitizeVectorText`
- `toolbox/shared/vector/vectorRenderPrep.js`
  - normalized local string sanitization to `sanitizeVectorText`

## Helpers Intentionally Left Local
- `sanitizeText/createReport` in:
  - `toolbox/shared/hotReloadSystem.js`
  - `toolbox/shared/platformValidationSuite.js`
  - `toolbox/shared/vectorAssetSystem.js`

Why left local:
- These modules are orchestration/reporting surfaces with domain-specific report vocabulary and aggregation behavior.
- Pulling them into this lane would expand beyond the requested exact-cluster (runtime loader/validation + vector-safe helper normalization) and increase risk/scope.

- Local helper clusters in tool app files (for example, sample-path/readout helpers in Parallax/Tilemap/Vector Asset Studio) were intentionally left unchanged.

Why left local:
- Out of requested scope for this PR (would trend into editor-state extraction or broader refactor lanes).