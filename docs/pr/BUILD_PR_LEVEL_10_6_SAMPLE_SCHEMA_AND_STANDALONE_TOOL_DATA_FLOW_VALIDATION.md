# BUILD_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION

## Objective
Create a reliable automated validation path for standalone samples.

A sample is not valid unless:
1. Its schema/payload file is correct.
2. The tool receives the payload.
3. The tool places the received data in the expected UI/state area.
4. No fallback/demo data is used.

## Required Targeted Fixes

### Asset Browser / Import Hub
Samples:
- 0204
- 1413
- 1505

Required:
- sample payload schema must match expected Asset Browser / Import Hub standalone input contract.
- Pipeline input must receive actual sample data.
- UI/state must show that pipeline input is populated.

### Asset Pipeline Tool
Samples:
- 0510
- 1413
- 1417

Required:
- sample payload schema must match Asset Pipeline Tool standalone input contract.
- Pipeline input must receive actual sample data.
- UI/state must show pipeline input populated.

### Palette Browser / Palette Tool
Samples:
- 0213
- 0308
- 0313

Required:
- sample palette data must be valid.
- tool must receive the palette payload in standalone mode.
- palette must display in the correct palette UI/state.
- no empty/none state if palette exists.

## Full Sample Schema Validation
Codex must validate all sample payloads:

```text
samples/**/sample.*.*.json
samples/**/sample.*.palette.json
```

Checks:
- `$schema` exists where required.
- `$schema` resolves.
- `tool` matches file name/tool schema.
- required top-level fields exist.
- no wrapper fields unless the schema allows them.
- no hidden fallback references.
- no hardcoded asset references outside allowed sample-local data.

## Standalone Tool Mode Validation
For every sample tool payload:
1. Open the sample in standalone mode.
2. Identify the target tool.
3. Pass the sample payload explicitly to the tool.
4. Assert tool state/UI received and displays the expected data.

## Expected UI/State Assertions
Use tool-specific checks:

### Asset Browser / Import Hub
- Pipeline input exists.
- Pipeline input count > 0 or equivalent non-empty indicator.
- No "empty input" state if payload contains data.

### Asset Pipeline Tool
- Pipeline input exists.
- Pipeline input count > 0 or equivalent non-empty indicator.
- No "empty input" state if payload contains data.

### Palette Browser / Palette Tool
- palette exists
- swatch count > 0
- selected/loaded palette name visible
- no "No palette selected" state

### Vector Asset Studio
- vector count > 0 when sample has vectors
- selected vector/asset not `none`

### Other Tools
Add equivalent expected payload-to-ui checks where the schema provides data.

## No Hidden Coupling Rule
This PR must preserve Level 10.5:
- no silent fallback data
- no hardcoded asset paths
- if sample payload is invalid, fail the test instead of loading default/demo data

## Required Tests
Add a focused test such as:

```text
tests/runtime/SampleStandaloneToolDataFlow.test.mjs
```

The test must:
- discover sample payload files
- validate schema resolution
- launch/open the sample or tool standalone harness
- assert the tool receives/displays data
- include targeted regression checks for the listed failing samples

## Required Reports
Create:

```text
docs/dev/reports/level_10_6_sample_schema_validation_report.md
docs/dev/reports/level_10_6_standalone_tool_data_flow_report.md
```

Reports must include:
- samples scanned
- schema failures
- data flow failures
- UI/state failures
- fixed samples
- deferred issues, if any

## Roadmap Movement
Update `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` status only:
- add/advance standalone sample schema/data-flow validation
- use only `[ ] -> [.]` and `[.] -> [x]`
- no prose rewrite/delete

## Acceptance
- Reported failing samples are fixed or explicitly failing with actionable report.
- Sample schema validation covers all samples.
- Standalone tool data-flow test exists.
- Tools receive and display valid sample data in standalone mode.
- No fallback/demo data used to mask invalid sample payloads.
- No hardcoded asset paths added.
- No validators added unless an existing test harness is extended; do not add runtime validators.
- No `start_of_day` changes.
- Delta ZIP returned.
