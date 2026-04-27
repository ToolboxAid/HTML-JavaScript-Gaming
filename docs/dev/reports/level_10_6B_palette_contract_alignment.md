# Level 10.6B - Palette Contract Alignment

## PR Purpose
Normalize palette runtime payload contracts so manifest palette input and standalone tool palette input use one canonical shape.

## Canonical Runtime Palette Shape

```json
{
  "schema": "html-js-gaming.palette",
  "version": 1,
  "name": "Example Palette",
  "source": "manifest",
  "swatches": [
    {
      "symbol": "!",
      "hex": "#1CAC78",
      "name": "color-001"
    }
  ]
}
```

## Changed Files

- `tools/Palette Browser/main.js`
- `docs/dev/reports/level_10_6_standalone_tool_data_flow_report.md`
- `docs/dev/reports/level_10_6B_palette_contract_alignment.md`

## What Was Aligned

- Palette Browser preset import path now preserves canonical `payload.palette.source` instead of forcing `custom`, keeping manifest-derived source identity through UI binding.
- Palette-bearing standalone sample payloads were verified as canonical (`schema`, `version`, `name`, `source`, `swatches`) with no contract failures.
- Standalone data-flow validation passed with zero schema, contract, roundtrip, or generic failures.

## Validation

Commands run:

- `npm run test:launch-smoke:games`
- `npm run test:sample-standalone:data-flow`

Results:

- `test:launch-smoke:games` -> `PASS=12 FAIL=0 TOTAL=12`
- `test:sample-standalone:data-flow` ->
  - `schemaFailures=[]`
  - `contractFailures=[]`
  - `roundtripPathFailures=[]`
  - `genericFailures=[]`

## Guardrails

- No new schemas added.
- No fallback/demo data added.
- No hardcoded asset paths added.
- No start_of_day changes.
