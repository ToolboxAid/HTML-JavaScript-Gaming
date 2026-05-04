# Tile Model Converter Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-08
Source folder: `tools/Tile Model Converter`
Publish target: `tools.tile-model-converter`

## Tool Purpose
Tile model conversion. Tile Model Converter owns `candidate`, `conversion`, conversion validation, normalized output, and publish to `tools.tile-model-converter`.

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
Owned JSON is the tile-model-converter payload. Required fields are `candidate` and `conversion`; no other top-level fields are allowed. Candidate input and conversion settings together produce the normalized conversion output.

## Publish Output
Publish only to `tools.tile-model-converter`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `candidate`
- missing `conversion`
- candidate/conversion shapes the converter cannot normalize
- unsupported top-level fields

## Manual Test Plan
- Paste a valid candidate/conversion payload and run conversion.
- Export the normalized conversion result.
- Try malformed JSON and payloads missing `candidate` or `conversion`; output and publish must stay blocked.
