# Level 10.6 Sample Schema Validation Report

- Generated: 2026-04-26
- BUILD: `BUILD_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION`

## Scope

- Audited sample tool payloads from `samples/metadata/samples.index.metadata.json` `roundtripToolPresets` universe.
- Audited all sample palette files matching `samples/**/sample.*.palette.json`.

## Files Scanned

- `samples/**/sample.*.*.json` (roundtrip-mapped payloads): `62`
- `samples/**/sample.*.palette.json`: `20`

## Schema Reference Validation

- `$schema` missing failures: `0`
- `$schema` unresolved failures: `0`

## Payload Contract Validation

- Tool payload contract failures: `0`
- Palette contract failures: `0`
- Roundtrip preset-path failures: `0`

## Targeted Fixes Applied

- Updated metadata preset routes from legacy dashed naming to existing dotted payload files where present.
  - File: `samples/metadata/samples.index.metadata.json`
  - Rewrites applied: `53`
- Fixed standalone sample preset extraction for config-wrapped payload contracts:
  - `tools/Asset Browser/main.js`
  - `tools/Asset Pipeline Tool/main.js`
  - `tools/Palette Browser/main.js`
- Added explicit palette payloads for targeted palette-browser samples:
  - `samples/phase-02/0213/sample.0213.palette-browser.json`
  - `samples/phase-03/0308/sample.0308.palette-browser.json`
  - `samples/phase-03/0313/sample.0313.palette-browser.json`

## Fixed Samples (Targeted)

- Asset Browser / Import Hub: `0204`, `1413`, `1505`
- Asset Pipeline Tool: `0510`, `1413`, `1417`
- Palette Browser: `0213`, `0308`, `0313`

## Deferred / Blockers

- None in schema/reference contract validation scope.
- Standalone non-target data-flow failures are documented in:
  - `docs/dev/reports/level_10_6_standalone_tool_data_flow_report.md`
