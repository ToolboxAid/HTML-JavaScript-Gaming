# Level 10.6H Tool Load Expected Diagnostics Report

## Files changed

- `tools/shared/toolLoadDiagnostics.js`
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `docs/dev/reports/level_10_6H_tool_load_expected_diagnostics_report.md`
- `docs/dev/reports/launch_smoke_report.md` (test-generated output update)

## Scope outcome

- Extended the shared diagnostics layer from 10.6G to auto-attach `expected` diagnostics across:
  - request
  - fetch (attempt + response)
  - loaded
  - warning
  - error (`[tool-load:error]`, emitted when warning payload includes `error`)
- Kept change diagnostic-only:
  - no fallback data added
  - no hardcoded sample paths added
  - no schema rewrites
  - no sample contract normalization changes

## Sprite-editor 0219 log example (before -> after)

Before (10.6G style warning example):

```js
{
  toolId: "sprite-editor",
  sampleId: "0219",
  samplePresetPath: "/samples/phase-02/0219/sample.0219.sprite-editor.json",
  error: "Preset payload did not include a sprite project."
}
```

After (10.6H warning boundary with expected contract):

```js
{
  toolId: "sprite-editor",
  sampleId: "0219",
  samplePresetPath: "/samples/phase-02/0219/sample.0219.sprite-editor.json",
  error: "Preset payload did not include a sprite project.",
  receivedTopLevelKeys: ["$schema", "tool", "version", "config"],
  expected: {
    requiredPayloadShape: ["spriteProject"],
    receivedTopLevelKeys: ["$schema", "tool", "version", "config"],
    missingRequiredFields: ["spriteProject"],
    likelyCause: "wrong path or wrong wrapper"
  }
}
```

Loaded boundary for same launch now includes:

```js
expected: {
  requiredPayloadShape: ["spriteProject"],
  detectedPayloadShape: ["$schema", "tool", "version", "config"],
  missingRequiredFields: ["spriteProject"],
  contractMatch: false
}
```

## Expected contract behavior for missing `spriteProject`

- Confirmed: `expected.contractMatch` is `false` for the current missing `spriteProject` case (sample `0219` sprite-editor launch).
- Warning/error boundaries now include:
  - `requiredPayloadShape`
  - `receivedTopLevelKeys`
  - `missingRequiredFields`
  - `likelyCause`

## Palette expected diagnostics behavior

- Shared diagnostics now classify canonical palette expectations and wrapper mismatch indicators via `expected`:
  - canonical schema expected: `html-js-gaming.palette`
  - canonical required fields: `schema`, `version`, `name`, `swatches`
  - non-canonical wrapper indicators: `tool`, `config.palette`
- Fetch/loaded boundaries include palette-oriented expected metadata so wrapper vs canonical mismatches are explicit in logs.

## Validation command results

1. `npm run test:launch-smoke:games`
   - Result: PASS
   - Summary: `PASS=12`, `FAIL=0`, `TOTAL=12`

2. `npm run test:sample-standalone:data-flow`
   - Result: PASS
   - Key checks:
     - `schemaFailures: []`
     - `contractFailures: []`
     - `roundtripPathFailures: []`
     - `genericFailures: []`
