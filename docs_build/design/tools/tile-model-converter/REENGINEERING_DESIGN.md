# Tile Model Converter Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-08
Source folder: `tools/Tile Model Converter`
Publish target: `tools.tile-model-converter`

## Tool Purpose
Tile Model Converter owns candidate import, conversion validation, normalized output export, and publish to `tools.tile-model-converter`.

## Folder/Files Inspected
- `tools/Tile Model Converter/how_to_use.html`
- `tools/Tile Model Converter/index.html`
- `tools/Tile Model Converter/main.js`
- `tools/Tile Model Converter/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Tile Model Converter/index.html`: `button[button]#runConverterButton` - Run Conversion | Processes the current tile model conversion payload. | Updates tool-owned derived data/report fields that must validate before tools.tile-model-converter publish. |
| `tools/Tile Model Converter/index.html`: `textarea#converterInput` - converterInput | Edits the current tile model conversion payload through `converterInput`. | Updates draft tile model conversion payload data and requires validation before tools.tile-model-converter publish. |

## Panels And Surfaces Found
- `tools/Tile Model Converter/how_to_use.html`: `.tools-platform-surface`
- `tools/Tile Model Converter/index.html`: `.app-shell`
- `tools/Tile Model Converter/index.html`: `.debug-tool-grid`
- `tools/Tile Model Converter/index.html`: `.debug-tool-panel`
- `tools/Tile Model Converter/index.html`: `.debug-tool-shell`
- `tools/Tile Model Converter/index.html`: `.panel`

## Current Component/Class/Function Inventory
- `tools/Tile Model Converter/main.js`: bootTileModelConverter; buildPresetLoadedStatus; getApi; getInputPayload; normalizeSamplePresetPath; registerToolBootContract; runConversion; setStatus; tryLoadPresetFromQuery

## Target Controls
Keep:
- candidate input controls
- conversion action controls
- result/report controls

Remove or rename:
- conversion output that bypasses validation

Add:
- Validate Conversion
- Publish `tools.tile-model-converter`
- candidate/result diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for tile model conversion payload. Current contract baseline: `tools/schemas/tools/tile-model-converter.schema.json` (tile-model-converter Payload).
Required keys: `candidate`, `conversion`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming tile model conversion payload and reject it before mutation when invalid
- validate: apply the current tile model conversion payload contract before export, copy, or publish
- edit/process: mutate only tile model conversion payload fields owned by Tile Model Converter
- export/save: serialize the validated tile model conversion payload as the tools.tile-model-converter output shape
- publish: write only the validated tools.tile-model-converter value produced by Tile Model Converter
- copy/create payload: create copied payload text from the validated tile model conversion payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts schema-defined candidate/conversion data
- produces normalized conversion output after validation
- publishes only the validated conversion payload

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `tile-model-converter.schema.json`
- invalid candidate data
- conversion result outside the schema

## Published Output
Published Output:
```jsonc
tools.tile-model-converter = {
  "candidate": "jsonValue",
  "conversion": "jsonValue"
}
```

## Playwright Expectations
- load `tools/Tile Model Converter/index.html` without console errors
- run conversion for a valid candidate
- reject invalid candidate JSON

## Manual Test Expectations
- Open `tools/Tile Model Converter/index.html` and confirm candidate/result surfaces render.
- Load a valid candidate, run conversion, validate, export, and publish.
- Try malformed JSON and an invalid candidate; each must block publish.

## Known Gaps
- Conversion diagnostics should identify source candidate problems.
- Publish should be gated by conversion validation.

## Rebuild Order Priority
core-08: rebuild in the core tool lane after earlier priorities are stable.
