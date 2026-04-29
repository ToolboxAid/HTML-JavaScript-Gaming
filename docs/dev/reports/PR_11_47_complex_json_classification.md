# PR 11.47 Complex JSON Classification

## Scope
Focused audit/classification only (no code/JSON changes) for:
- `samples/**/sample.*.palette.json`
- `samples/**/sample-*-tile-map-editor-document.json`

Classification values:
- `INDIRECTLY USED`
- `UNUSED`
- `UNCERTAIN`

## Method
1. Used `docs/dev/reports/sample_json_js_reference_audit.csv` (direct JS references baseline).
2. Traced indirect load paths through sample metadata and tool launch wiring:
   - `samples/shared/sampleDetailPageEnhancement.js` (`roundtripToolPresets` -> `samplePresetPath` query)
   - tool loaders that fetch `samplePresetPath` and update visible UI status:
     - `tools/Palette Browser/main.js`
     - `tools/Tile Model Converter/main.js`
3. Traced tile-map document references from tile-model-converter preset JSON (`config.candidate.path`).
4. Did not run full sample suite; classification is structural/path-based.

## Key Indirect Load Evidence
- Sample page -> tool launch wiring:
  - `samples/shared/sampleDetailPageEnhancement.js` builds `Open <tool>` links with `samplePresetPath` from `roundtripToolPresets.presetPath` and fetches status text for those preset paths.
- Palette Browser indirect load and visible UI effect:
  - `tools/Palette Browser/main.js` reads `samplePresetPath`, fetches JSON, imports palette payload, and sets visible status text (`Loaded preset...`) plus swatch/preview UI state.
- Tile Model Converter indirect load and visible UI effect:
  - `tools/Tile Model Converter/main.js` reads `samplePresetPath`, fetches preset JSON, hydrates converter input text area, and sets visible status text (`Loaded preset...`).
- Tile-map doc path chaining:
  - `sample.*.tile-model-converter.json` stores `config.candidate.path` pointing to `sample-*-tile-map-editor-document.json`.

## Classification Table
| File | Indirect load path found | Visible UI effect confirmed | Classification |
|---|---|---|---|
| `samples/phase-02/0207/sample.0207.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-02/0213/sample.0213.palette.json` | mapped via `roundtripToolPresets` (`palette-browser` presetPath) | yes (Palette Browser preset loaded/status/swatch preview) | `INDIRECTLY USED` |
| `samples/phase-02/0214/sample.0214.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-02/0219/sample.0219.palette.json` | mapped via `sprite-editor.palettePath` and `palette-browser` presetPath | yes (Sprite Editor required palette dependency + Palette Browser preset UI) | `INDIRECTLY USED` |
| `samples/phase-02/0221/sample-0221-tile-map-editor-document.json` | referenced by `sample.0221.tile-model-converter.json` candidate path; converter preset is metadata-mapped | yes (Tile Model Converter loaded preset/input/status) | `INDIRECTLY USED` |
| `samples/phase-02/0221/sample.0221.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-02/0224/sample-0224-tile-map-editor-document.json` | no references found | no | `UNUSED` |
| `samples/phase-02/0224/sample.0224.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-03/0301/sample.0301.palette.json` | mapped via `sprite-editor.palettePath` and `palette-browser` presetPath | yes | `INDIRECTLY USED` |
| `samples/phase-03/0302/sample.0302.palette.json` | mapped via `sprite-editor.palettePath` and `palette-browser` presetPath | yes | `INDIRECTLY USED` |
| `samples/phase-03/0305/sample-0305-tile-map-editor-document.json` | referenced by `sample.0305.tile-model-converter.json` candidate path; converter preset is metadata-mapped | yes | `INDIRECTLY USED` |
| `samples/phase-03/0305/sample.0305.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-03/0308/sample.0308.palette.json` | mapped via `roundtripToolPresets` (`palette-browser` presetPath) | yes | `INDIRECTLY USED` |
| `samples/phase-03/0313/sample.0313.palette.json` | mapped via `roundtripToolPresets` (`palette-browser` presetPath) | yes | `INDIRECTLY USED` |
| `samples/phase-09/0901/sample.0901.palette.json` | mapped via `roundtripToolPresets` (`palette-browser` presetPath) | yes | `INDIRECTLY USED` |
| `samples/phase-09/0905/sample.0905.palette.json` | mapped via `sprite-editor.palettePath` and `palette-browser` presetPath | yes | `INDIRECTLY USED` |
| `samples/phase-12/1204/sample.1204.palette.json` | mapped via `roundtripToolPresets` (`palette-browser` presetPath) | yes | `INDIRECTLY USED` |
| `samples/phase-12/1205/sample.1205.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-12/1208/sample.1208.palette.json` | mapped via `roundtripToolPresets` (`palette-browser` presetPath) | yes | `INDIRECTLY USED` |
| `samples/phase-12/1209/sample-1209-tile-map-editor-document.json` | referenced by `sample.1209.tile-model-converter.json` candidate path; also referenced in `sample.1902.workspace-all-tools.json` payload | yes (Tile Model Converter preset UI path; workspace reference present) | `INDIRECTLY USED` |
| `samples/phase-12/1209/sample.1209.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-12/1210/sample-1210-tile-map-editor-document.json` | no references found | no | `UNUSED` |
| `samples/phase-12/1210/sample.1210.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-12/1211/sample-1211-tile-map-editor-document.json` | no references found | no | `UNUSED` |
| `samples/phase-12/1211/sample.1211.palette.json` | none found in metadata/loader chain | no | `UNUSED` |
| `samples/phase-14/1414/sample.1414.palette.json` | mapped via `sprite-editor.palettePath` and `palette-browser` presetPath | yes | `INDIRECTLY USED` |

## Summary
- `INDIRECTLY USED`: 14
- `UNUSED`: 12
- `UNCERTAIN`: 0

## Notes
- This PR intentionally performed no code or JSON modifications.
- Files can be marked `UNUSED` in current executable wiring while still being potential future assets; this report classifies current wired usage only.