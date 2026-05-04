# Asset Pipeline Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-03
Source folder: `tools/Asset Pipeline`
Publish target: `tools.asset-pipeline`

## Tool Purpose
Pipeline payload validation and normalization. Asset Pipeline owns `pipelinePayload`, normalized pipeline output, and publish to `tools.asset-pipeline`.

## Exact Folder/Files Inspected
- `tools/Asset Pipeline/how_to_use.html`
- `tools/Asset Pipeline/index.html`
- `tools/Asset Pipeline/main.js`
- `tools/Asset Pipeline/README.md`

## Exact Current Controls Found
- `tools/Asset Pipeline/index.html`: `button[button]#runAssetPipelineButton` - Run Pipeline
- `tools/Asset Pipeline/index.html`: `button[button]#loadPipelineFromPresetButton` - Load Launch Preset
- `tools/Asset Pipeline/index.html`: `button[button]#loadPipelineFromWorkspaceButton` - Load Workspace State
- `tools/Asset Pipeline/index.html`: `button[button]#loadPipelineJsonFileButton` - Load JSON File
- `tools/Asset Pipeline/index.html`: `input[file]#pipelineJsonFileInput` - pipelineJsonFileInput
- `tools/Asset Pipeline/index.html`: `textarea#assetPipelineInput` - assetPipelineInput
- `tools/Asset Pipeline/main.js`: `runAssetPipelineButton` via runButton
- `tools/Asset Pipeline/main.js`: `loadPipelineFromPresetButton` via loadFromPresetButton
- `tools/Asset Pipeline/main.js`: `loadPipelineFromWorkspaceButton` via loadFromWorkspaceButton
- `tools/Asset Pipeline/main.js`: `loadPipelineJsonFileButton` via loadJsonFileButton
- `tools/Asset Pipeline/main.js`: `pipelineJsonFileInput` via jsonFileInput
- `tools/Asset Pipeline/main.js`: `assetPipelineStatus` via statusText
- `tools/Asset Pipeline/main.js`: `assetPipelineInput` via input
- `tools/Asset Pipeline/main.js`: `assetPipelineOutput` via output

## Current Panels And Surfaces Found
- `tools/Asset Pipeline/index.html`: `.debug-tool-shell`
- `tools/Asset Pipeline/index.html`: `.app-shell`
- `tools/Asset Pipeline/index.html`: `.panel`
- `tools/Asset Pipeline/index.html`: `.debug-tool-panel`
- `tools/Asset Pipeline/index.html`: `.debug-tool-grid`

## Exact Current Functions And Classes
- `tools/Asset Pipeline/main.js`: function appendDomainRecord; function appendDomainRecordsFromCatalogEntries; function appendDomainRecordsFromToolIntegration; function applyLaunchContextToPayload; function bootAssetPipelineTool; function buildCatalogPathCandidates; function buildPipelinePayloadFromWorkspace; function buildPresetLoadedStatus; function buildPresetLoadedWithContextStatus; function cloneJson; function createEmptyDomainInputs; function deriveGameIdFromManifest; function extractPipelinePayloadFromSource; function getInputPayload; function inferDomainFromCatalogKind; function inferSourceToolIdForDomain; function loadPipelineFromJsonFile; function loadPipelineFromWorkspaceState; function loadPipelinePayloadIntoInput; function normalizeAssetId; function normalizeCatalogPath; function normalizeExplicitCatalogPath; function normalizeSamplePresetPath; function normalizeText; function parseJsonObjectString; function readActiveProjectManifest; function readLaunchContextFromQuery; function readWorkspaceAssetCatalog; function rewrite; function runPipeline; function setInputValue; function setOutput; function setStatus; function toSlug; function tryLoadPresetFromQuery; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Run Pipeline
- Load Launch Preset
- Load JSON File
- pipeline JSON textarea
- output report

Remove or rename:
- `Load Workspace State` as a source of nested tool JSON truth

Add:
- Validate Pipeline Payload
- Export normalized pipeline JSON
- Publish `tools.asset-pipeline`

## JSON Contract Owned By This Tool
Owned JSON is the asset-pipeline payload. Required field is `pipelinePayload`; no other top-level fields are allowed. Pipeline internals are derived from this one payload and the tool controls that load, run, and export it.

## Publish Output
Publish only to `tools.asset-pipeline`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `pipelinePayload`
- `pipelinePayload` that cannot be normalized by the pipeline runner
- unsupported top-level fields

## Manual Test Plan
- Load a launch preset and run the pipeline.
- Load a JSON file matching `pipelinePayload` and export normalized output.
- Try empty JSON, malformed JSON, and a payload without `pipelinePayload`; each must fail before export.
