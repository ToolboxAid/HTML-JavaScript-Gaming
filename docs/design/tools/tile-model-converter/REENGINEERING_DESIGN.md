# Tile Model Converter Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `tile-model-converter`
Source folder: `tools/Tile Model Converter`

## 1. Tool Purpose
Convert candidate tile model JSON into normalized conversion payloads and report rejected conversion shapes.

## 2. Folder/Files Inspected
- `tools/Tile Model Converter/how_to_use.html`
- `tools/Tile Model Converter/index.html`
- `tools/Tile Model Converter/main.js`
- `tools/Tile Model Converter/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 1, inputs 0, selects 0, textareas 1, tables 0, inferred DOM controls/panels 4.
- `tools/Tile Model Converter/index.html`: button[button] #runConverterButton - Run Conversion
- `tools/Tile Model Converter/index.html`: textarea #converterInput - converterInput
- `tools/Tile Model Converter/main.js`: button #runConverterButton - inferred from JS DOM lookup
- `tools/Tile Model Converter/main.js`: panel #converterStatus - inferred from JS DOM lookup
- `tools/Tile Model Converter/main.js`: input #converterInput - inferred from JS DOM lookup
- `tools/Tile Model Converter/main.js`: panel #converterOutput - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Tile Model Converter/index.html`: .debug-tool-shell
  - `tools/Tile Model Converter/index.html`: .app-shell
  - `tools/Tile Model Converter/index.html`: .panel
  - `tools/Tile Model Converter/index.html`: .debug-tool-panel
  - `tools/Tile Model Converter/index.html`: .debug-tool-grid

## 4. Current Component/Class/Function Inventory
- `tools/Tile Model Converter/main.js`: function bootTileModelConverter; function buildPresetLoadedStatus; function getInputPayload; function normalizeSamplePresetPath; function runConversion; function setStatus; function tryLoadPresetFromQuery; method getApi; method registerToolBootContract

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/tile-model-converter.schema.json`. Title: tile-model-converter Payload. Required top-level fields: candidate, conversion. Allowed top-level fields: candidate, conversion. Additional top-level properties: rejected.

JSON handling signals found: download/export, safeParseJson.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.tile-model-converter` if applicable: yes, publish normalized output under `tools.tile-model-converter` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.tile-model-converter`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Tile Model Converter/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Tile Model Converter/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P12: Tile Model Converter. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
