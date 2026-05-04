# Asset Pipeline Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `asset-pipeline`
Source folder: `tools/Asset Pipeline`

## 1. Tool Purpose
Load, validate, normalize, and report asset pipeline payloads for tool handoff and publishing checks.

## 2. Folder/Files Inspected
- `tools/Asset Pipeline/how_to_use.html`
- `tools/Asset Pipeline/index.html`
- `tools/Asset Pipeline/main.js`
- `tools/Asset Pipeline/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 4, inputs 1, selects 0, textareas 1, tables 0, inferred DOM controls/panels 8.
- `tools/Asset Pipeline/index.html`: button[button] #runAssetPipelineButton - Run Pipeline
- `tools/Asset Pipeline/index.html`: button[button] #loadPipelineFromPresetButton - Load Launch Preset
- `tools/Asset Pipeline/index.html`: button[button] #loadPipelineFromWorkspaceButton - Load Workspace State
- `tools/Asset Pipeline/index.html`: button[button] #loadPipelineJsonFileButton - Load JSON File
- `tools/Asset Pipeline/index.html`: input[file] #pipelineJsonFileInput - pipelineJsonFileInput
- `tools/Asset Pipeline/index.html`: textarea #assetPipelineInput - assetPipelineInput
- `tools/Asset Pipeline/main.js`: button #runAssetPipelineButton - inferred from JS DOM lookup
- `tools/Asset Pipeline/main.js`: button #loadPipelineFromPresetButton - inferred from JS DOM lookup
- `tools/Asset Pipeline/main.js`: button #loadPipelineFromWorkspaceButton - inferred from JS DOM lookup
- `tools/Asset Pipeline/main.js`: button #loadPipelineJsonFileButton - inferred from JS DOM lookup
- `tools/Asset Pipeline/main.js`: input #pipelineJsonFileInput - inferred from JS DOM lookup
- `tools/Asset Pipeline/main.js`: panel #assetPipelineStatus - inferred from JS DOM lookup
- `tools/Asset Pipeline/main.js`: input #assetPipelineInput - inferred from JS DOM lookup
- `tools/Asset Pipeline/main.js`: panel #assetPipelineOutput - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Asset Pipeline/index.html`: .debug-tool-shell
  - `tools/Asset Pipeline/index.html`: .app-shell
  - `tools/Asset Pipeline/index.html`: .panel
  - `tools/Asset Pipeline/index.html`: .debug-tool-panel
  - `tools/Asset Pipeline/index.html`: .debug-tool-grid

## 4. Current Component/Class/Function Inventory
- `tools/Asset Pipeline/main.js`: function appendDomainRecord; function appendDomainRecordsFromCatalogEntries; function appendDomainRecordsFromToolIntegration; function applyLaunchContextToPayload; function bootAssetPipelineTool; function buildCatalogPathCandidates; function buildPipelinePayloadFromWorkspace; function buildPresetLoadedStatus; function buildPresetLoadedWithContextStatus; function cloneJson; function createEmptyDomainInputs; function deriveGameIdFromManifest; function extractPipelinePayloadFromSource; function getInputPayload; function inferDomainFromCatalogKind; function inferSourceToolIdForDomain; function loadPipelineFromJsonFile; function loadPipelineFromWorkspaceState; function loadPipelinePayloadIntoInput; function normalizeAssetId; function normalizeCatalogPath; function normalizeExplicitCatalogPath; function normalizeSamplePresetPath; function normalizeText; function parseJsonObjectString; function readActiveProjectManifest; function readLaunchContextFromQuery; function readWorkspaceAssetCatalog; function rewrite; function runPipeline; function setInputValue; function setOutput; function setStatus; function toSlug; function tryLoadPresetFromQuery; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/asset-pipeline.schema.json`. Title: asset-pipeline Payload. Required top-level fields: pipelinePayload. Allowed top-level fields: pipelinePayload. Additional top-level properties: rejected.

JSON handling signals found: download/export, JSON.parse, JSON.stringify, localStorage, safeParseJson, schema, tools.*, toolState, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.asset-pipeline` if applicable: yes, publish normalized output under `tools.asset-pipeline` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.asset-pipeline`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Asset Pipeline/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Asset Pipeline/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P04: Asset Pipeline. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
