# Tile Model Converter Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-08
Source folder: `tools/Tile Model Converter`
Publish target: `tools.tile-model-converter`

## Tool Purpose
Tile model conversion. This tool owns `candidate` plus `conversion`, conversion validation, normalized output, and publish to `tools.tile-model-converter`.

## Exact Folder/Files Inspected
- `tools/Tile Model Converter/how_to_use.html`
- `tools/Tile Model Converter/index.html`
- `tools/Tile Model Converter/main.js`
- `tools/Tile Model Converter/README.md`

## Exact Current Controls Found
- `tools/Tile Model Converter/index.html`: `button[button]#runConverterButton` - Run Conversion
- `tools/Tile Model Converter/index.html`: `textarea#converterInput` - converterInput
- `tools/Tile Model Converter/main.js`: `runConverterButton` via runButton
- `tools/Tile Model Converter/main.js`: `converterStatus` via statusText
- `tools/Tile Model Converter/main.js`: `converterInput` via input
- `tools/Tile Model Converter/main.js`: `converterOutput` via output

## Current Panels And Surfaces Found
- `tools/Tile Model Converter/index.html`: `.debug-tool-shell`
- `tools/Tile Model Converter/index.html`: `.app-shell`
- `tools/Tile Model Converter/index.html`: `.panel`
- `tools/Tile Model Converter/index.html`: `.debug-tool-panel`
- `tools/Tile Model Converter/index.html`: `.debug-tool-grid`

## Exact Current Functions And Classes
- `tools/Tile Model Converter/main.js`: function bootTileModelConverter; function buildPresetLoadedStatus; function getInputPayload; function normalizeSamplePresetPath; function runConversion; function setStatus; function tryLoadPresetFromQuery; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Run Converter
- converter input textarea
- converter output panel

Remove or rename:
- none identified in the current folder

Add:
- Load Converter JSON
- Export Conversion JSON
- Publish `tools.tile-model-converter`

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/tile-model-converter.schema.json`. Required top-level fields: candidate, conversion. Allowed top-level fields: candidate, conversion. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

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
- Paste a valid candidate/conversion payload and run conversion.
- Export the normalized conversion result.
- Try malformed JSON and payloads missing `candidate` or `conversion`; output and publish must stay blocked.
