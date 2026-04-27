# Level 10.6I Tool Load Expected vs Actual Classification Report

## Files changed

- `tools/shared/toolLoadDiagnostics.js`
- `docs/dev/reports/level_10_6i_tool_load_expected_vs_actual_classification_report.md`
- `docs/dev/reports/launch_smoke_report.md` (test-generated output refresh)

## Diagnostic events added or updated

- Existing boundaries preserved with compact `expected` + `actual` blocks attached:
  - `[tool-load:request]`
  - `[tool-load:fetch]`
  - `[tool-load:loaded]`
  - `[tool-load:warning]`
- New boundary added:
  - `[tool-load:classification]`

Classification values emitted exactly from shared diagnostics:

- `missing`
- `wrong-path`
- `wrong-shape`
- `success`

Expected block fields emitted per dependency:

- `dependencyId`
- `expectedPathKey`
- `expectedPath`
- `expectedSchema`
- `expectedTopLevelShape`
- `requiredFields`
- `requiredArrayFields`

Actual block fields emitted per dependency:

- `requestedPath`
- `fetchUrl`
- `httpStatus`
- `loadedSchema`
- `topLevelKeys`
- `fieldPresence`
- `arrayCounts`

## Palette dependency classification behavior

Palette expectation is now classified explicitly even when palette was never requested/fetched/loaded.

Observed classification event for sample `0219` (`sprite-editor`):

```js
{
  classification: "missing",
  expected: {
    dependencyId: "palette",
    expectedPathKey: "palettePath",
    expectedSchema: "html-js-gaming.palette",
    expectedTopLevelShape: ["schema", "version", "name", "swatches"]
  },
  actual: {
    requestedPath: "",
    fetchUrl: "",
    loadedSchema: "",
    topLevelKeys: []
  },
  note: "Expected palette dependency was not requested, not fetched, and not loaded."
}
```

## Test command output summary

1. `npm run test:launch-smoke:games`
   - Result: PASS
   - Summary: `PASS=12`, `FAIL=0`, `TOTAL=12`

2. `npm run test:sample-standalone:data-flow`
   - Result: PASS
   - Summary arrays all empty:
     - `schemaFailures: []`
     - `contractFailures: []`
     - `roundtripPathFailures: []`
     - `genericFailures: []`

## Manual browser-console validation notes

Manual launch performed for:

- `tools/Sprite Editor/index.html?sampleId=0219&samplePresetPath=/samples/phase-02/0219/sample.0219.sprite-editor.json`

Observed console prefixes:

- `[tool-load:request]`
- `[tool-load:fetch]`
- `[tool-load:loaded]`
- `[tool-load:warning]`
- `[tool-load:error]`
- `[tool-load:classification]`

Observed classification outcomes:

1. Palette dependency classified as `missing` with note: expected palette was not requested/fetched/loaded.
2. Sprite dependency classified as `wrong-shape` with:
   - `expected.dependencyId = "sprite-project"`
   - `expected.expectedPath = "/samples/phase-02/0219/sample.0219.sprite-editor.json"`
   - `actual.topLevelKeys = ["$schema", "tool", "version", "config"]`
   - `expected.contractMatch = false`

Scope guardrails held for this BUILD:

- diagnostics-only change
- no palette normalization
- no fallback data
- no hardcoded asset paths
- no start_of_day changes
