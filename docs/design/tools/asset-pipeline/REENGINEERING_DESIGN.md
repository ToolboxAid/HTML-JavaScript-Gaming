# Asset Pipeline Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-03
Source folder: `tools/Asset Pipeline`
Publish target: `tools.asset-pipeline`

## Tool Purpose
Pipeline payload validation and normalization. This tool owns `pipelinePayload` import, validation, normalized output, and publish to `tools.asset-pipeline`.

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
- Export normalized `tools.asset-pipeline` JSON
- clear error details before each run

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/asset-pipeline.schema.json`. Required top-level fields: pipelinePayload. Allowed top-level fields: pipelinePayload. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

## Hosted/Launch Payload Boundary
- Launch payloads may seed this tool, but they do not become workspace-owned internals.
- toolState copies may be created later from the published output, but the copied JSON must still match this tool contract.
- Use file/path/name fields for assets. Do not persist `imageDataUrl`.

## Invalid JSON Behavior
- Reject malformed JSON before state mutation.
- Reject missing required fields from the schema baseline.
- Reject unsupported top-level fields when the schema disallows extras.
- Keep export/save/publish disabled until the current payload validates.
- Show a tool-specific error that names the failing field or control group.

## Manual Test Plan
- Load a launch preset and run the pipeline.
- Load a JSON file matching `pipelinePayload` and export normalized output.
- Try empty JSON, malformed JSON, and a payload without `pipelinePayload`; each must fail before export.
