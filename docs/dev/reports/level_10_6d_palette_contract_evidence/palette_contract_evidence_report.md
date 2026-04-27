# level_10_6d_palette_contract_evidence_report

## command run
- `npm run test:sample-standalone:data-flow`

## timestamps
- reportGeneratedAt: 2026-04-27T17:04:41.161Z
- testSummaryGeneratedAt: 2026-04-27T17:02:16.473Z

## test result summary
- status: PASS
- totalSampleToolPayloadFiles: 62
- totalSamplePaletteFiles: 20
- totalRoundtripRows: 62
- schemaFailures: 0
- contractFailures: 0
- roundtripPathFailures: 0
- genericFailures: 0
- paletteBrowserGenericChecks: 3
- paletteBrowserTargetedChecks: 3

## palette-related samples checked
- sampleId 0213 -> toolId palette-browser
- sampleId 0308 -> toolId palette-browser
- sampleId 0313 -> toolId palette-browser

## sample manifest palette shape vs tool expected palette shape
- test expectation source:
  - `tests/runtime/SampleStandaloneToolDataFlow.test.mjs:1162-1168` reads `testCase.presetPayload?.config?.palette` and requires non-empty `name` and `swatches`.
- runtime ingestion source:
  - `tools/Palette Browser/main.js:531-553` extracts palette payload via aliases (`payload.palette`, `config.palette`, `payload.swatches`, `config.swatches`).
  - `tools/Palette Browser/main.js:506-529` validates/normalizes imported palette shape.
- comparison (manifest palette object vs paired `sample.<id>.palette.json`):
- Sample 0213:
  - swatchesMatch: true
  - keysOnlyInManifest: (none)
  - keysOnlyInPaletteFile: $schema, locked, sourceId
  - value mismatch: source => manifest="manifest" | paletteFile="engine/paletteList"
- Sample 0308:
  - swatchesMatch: true
  - keysOnlyInManifest: (none)
  - keysOnlyInPaletteFile: $schema
  - value mismatch: source => manifest="manifest" | paletteFile="generated-from-sample-colors"
- Sample 0313:
  - swatchesMatch: true
  - keysOnlyInManifest: (none)
  - keysOnlyInPaletteFile: $schema
  - value mismatch: source => manifest="manifest" | paletteFile="generated-from-sample-colors"

## exact mismatches found
- Cross-file mismatches detected (manifest `config.palette` vs sample-side `sample.<id>.palette.json`):
- Sample 0213:
  - swatchesMatch: true
  - keysOnlyInManifest: (none)
  - keysOnlyInPaletteFile: $schema, locked, sourceId
  - value mismatch: source => manifest="manifest" | paletteFile="engine/paletteList"
- Sample 0308:
  - swatchesMatch: true
  - keysOnlyInManifest: (none)
  - keysOnlyInPaletteFile: $schema
  - value mismatch: source => manifest="manifest" | paletteFile="generated-from-sample-colors"
- Sample 0313:
  - swatchesMatch: true
  - keysOnlyInManifest: (none)
  - keysOnlyInPaletteFile: $schema
  - value mismatch: source => manifest="manifest" | paletteFile="generated-from-sample-colors"
- Test contract mismatches during fresh run: none (all failure arrays empty in `tmp/sample-standalone-tool-data-flow-results.json`).

## required status checks
- `$schema` remains: yes.
  - Tool payload files contain top-level `$schema` references to `tools/schemas/tools/palette-browser.schema.json`.
  - Sample palette files contain top-level `$schema` references to `tools/schemas/palette.schema.json`.
- `engine` / `paletteList` remains: yes.
  - Sample 0213 palette source remains `engine/paletteList`.
  - Palette Browser still loads `../../src/engine/paletteList.js` and reads `globalThis.palettesList`.
- `wrapper` remains: no in audited sample payloads.
  - Test harness still rejects wrapper fields `documentKind`, `id`, `type` for sample tool payload contracts.
- `alias` remains: yes.
  - `extractPaletteFromSamplePreset` accepts `payload.palette`, `config.palette`, `payload.swatches`, and `config.swatches`.
- `reshaping` remains: yes.
  - `normalizePaletteDocument` reshapes legacy `entries[]`/`colors[]` into `swatches[]`.
- `fallback data` remains: yes.
  - Built-in palette fallback source defaults to `{}` when `globalThis.palettesList` is absent.
  - Symbol/name/version/source defaults are still applied during normalization.
- `hardcoded paths` remain: partial.
  - Fixed engine script include path remains in tool HTML (`../../src/engine/paletteList.js`).
  - Preset ingest path handling is constrained to `/samples/`, `./samples/`, or `samples/` and rejects `..`.

## exact copied file paths
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/metadata/samples.index.metadata.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-02/0213/sample.0213.palette-browser.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0308/sample.0308.palette-browser.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0313/sample.0313.palette-browser.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-02/0213/sample.0213.palette.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0308/sample.0308.palette.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/samples/phase-03/0313/sample.0313.palette.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/schemas/tools/palette-browser.schema.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/schemas/palette.schema.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/Palette Browser/index.html
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/Palette Browser/main.js
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/shared/paletteDocumentContract.js
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tools/toolRegistry.js
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tests/runtime/SampleStandaloneToolDataFlow.test.mjs
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/src/engine/paletteList.js
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/tmp/sample-standalone-tool-data-flow-results.json
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/docs/dev/reports/level_10_6d_palette_contract_evidence/test_sample_standalone_data_flow_output.txt
- docs/dev/reports/level_10_6d_palette_contract_evidence/repo_relative/docs/dev/reports/level_10_6d_palette_contract_evidence/palette_shape_diff.json

## fresh test output artifacts
- docs/dev/reports/level_10_6d_palette_contract_evidence/test_sample_standalone_data_flow_output.txt
- tmp/sample-standalone-tool-data-flow-results.json

## next-step recommendation (normalization only)
- Normalize palette contract boundaries so sample manifest palette payload and sample palette data file metadata are explicitly aligned by policy, with a single accepted source semantic and a narrowed ingest alias surface (no behavior changes beyond normalization scope).
