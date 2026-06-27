# PLAN_PR_LEVEL_10_6_SAMPLE_SCHEMA_AND_STANDALONE_TOOL_DATA_FLOW_VALIDATION

## Purpose
Validate and fix standalone sample-to-tool data flow.

## User-Reported Failures
Samples standalone tools test failures:

### Asset Browser / Import Hub
- sample 0204: no data loads to Pipeline input
- sample 1413: no data loads to Pipeline input
- sample 1505: no data loads to Pipeline input

### Asset Pipeline Tool
- sample 0510: no data loads to Pipeline input
- sample 1413: no data loads to Pipeline input
- sample 1417: no data loads to Pipeline input

### Palette Display
- sample 0213: does not display palette
- sample 0308: does not display palette
- sample 0313: does not display palette

## Scope
- Validate sample schema correctness for every sample.
- Validate standalone tool mode receives valid sample payload data.
- Validate received data displays in the correct tool UI location.
- Fix reported samples first.
- Add automated coverage so this does not require manual verification.
- No silent fallback data.
- No hardcoded asset paths.
- No start_of_day changes.
