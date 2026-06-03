# Asset Pipeline Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-03
Source folder: `toolbox/Asset Pipeline`
Publish target: `tools.asset-pipeline`

## Tool Purpose
Asset Pipeline owns pipeline payload import, validation, processing/normalization, export, and publish to `tools.asset-pipeline`.

## Folder/Files Inspected
- `toolbox/Asset Pipeline/how_to_use.html`
- `toolbox/Asset Pipeline/index.html`
- `toolbox/Asset Pipeline/main.js`
- `toolbox/Asset Pipeline/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `toolbox/Asset Pipeline/index.html`: `input[file]#pipelineJsonFileInput` - pipelineJsonFileInput | Chooses a local file for asset pipeline payload import/load. | Replaces or merges tool-owned asset pipeline payload only after the import validates. |
| `toolbox/Asset Pipeline/index.html`: `button[button]#runAssetPipelineButton` - Run Pipeline | Processes the current asset pipeline payload. | Updates tool-owned derived data/report fields that must validate before tools.asset-pipeline publish. |
| `toolbox/Asset Pipeline/index.html`: `button[button]#loadPipelineFromPresetButton` - Load Launch Preset | Starts asset pipeline payload import/load. | Reads incoming JSON into the tool-owned asset pipeline payload only after validation succeeds. |
| `toolbox/Asset Pipeline/index.html`: `button[button]#loadPipelineFromWorkspaceButton` - Load Workspace State | Starts asset pipeline payload import/load. | Reads incoming JSON into the tool-owned asset pipeline payload only after validation succeeds. |
| `toolbox/Asset Pipeline/index.html`: `button[button]#loadPipelineJsonFileButton` - Load JSON File | Starts asset pipeline payload import/load. | Reads incoming JSON into the tool-owned asset pipeline payload only after validation succeeds. |
| `toolbox/Asset Pipeline/index.html`: `textarea#assetPipelineInput` - assetPipelineInput | Edits the current asset pipeline payload through `assetPipelineInput`. | Updates draft asset pipeline payload data and requires validation before tools.asset-pipeline publish. |

## Panels And Surfaces Found
- `toolbox/Asset Pipeline/how_to_use.html`: `.tools-platform-surface`
- `toolbox/Asset Pipeline/index.html`: `.app-shell`
- `toolbox/Asset Pipeline/index.html`: `.debug-tool-grid`
- `toolbox/Asset Pipeline/index.html`: `.debug-tool-panel`
- `toolbox/Asset Pipeline/index.html`: `.debug-tool-shell`
- `toolbox/Asset Pipeline/index.html`: `.panel`

## Current Component/Class/Function Inventory
- `toolbox/Asset Pipeline/main.js`: appendDomainRecord; appendDomainRecordsFromCatalogEntries; appendDomainRecordsFromToolIntegration; applyLaunchContextToPayload; applyProjectState; bootAssetPipelineTool; buildCatalogPathCandidates; buildPipelinePayloadFromWorkspace; buildPresetLoadedStatus; buildPresetLoadedWithContextStatus; captureProjectState; cloneJson; createEmptyDomainInputs; deriveGameIdFromManifest; extractPipelinePayloadFromSource; getApi; getInputPayload; inferDomainFromCatalogKind; inferSourceToolIdForDomain; loadPipelineFromJsonFile; loadPipelineFromWorkspaceState; loadPipelinePayloadIntoInput; normalizeAssetId; normalizeCatalogPath; normalizeExplicitCatalogPath; normalizeSamplePresetPath; normalizeText; parseJsonObjectString; readActiveProjectManifest; readLaunchContextFromQuery; readWorkspaceAssetCatalog; registerToolBootContract; rewrite; runPipeline; setInputValue; setOutput; setStatus; toSlug; tryLoadPresetFromQuery

## Target Controls
Keep:
- pipeline input fields
- processing/action buttons
- output/report panels

Remove or rename:
- implicit processing that changes JSON before validation

Add:
- Validate Pipeline Payload
- Publish `tools.asset-pipeline`
- step-level pipeline errors

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for asset pipeline payload. Current contract baseline: `toolbox/schemas/tools/asset-pipeline.schema.json` (asset-pipeline Payload).
Required keys: `pipelinePayload`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming asset pipeline payload and reject it before mutation when invalid
- validate: apply the current asset pipeline payload contract before export, copy, or publish
- edit/process: mutate only asset pipeline payload fields owned by Asset Pipeline
- export/save: serialize the validated asset pipeline payload as the tools.asset-pipeline output shape
- publish: write only the validated tools.asset-pipeline value produced by Asset Pipeline
- copy/create payload: create copied payload text from the validated asset pipeline payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined asset pipeline payload
- keeps processing output inside the tool-owned payload
- exports the normalized pipeline result after validation

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `asset-pipeline.schema.json`
- pipeline steps/artifacts that fail required fields
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.asset-pipeline = {
  "pipelinePayload": "jsonValue"
}
```

## Playwright Expectations
- load `toolbox/Asset Pipeline/index.html` without console errors
- run the current pipeline controls against a valid payload
- confirm invalid payloads block export/publish

## Manual Test Expectations
- Open `toolbox/Asset Pipeline/index.html` and run the existing processing flow.
- Load a valid pipeline payload, validate it, and export/publish the normalized result.
- Try malformed JSON and a payload missing required pipeline data; each must block publish.

## Known Gaps
- Processing controls need clearer separation between preview output and published JSON.
- Pipeline validation should identify the failing step or artifact.

## Rebuild Order Priority
core-03: rebuild in the core tool lane after earlier priorities are stable.
