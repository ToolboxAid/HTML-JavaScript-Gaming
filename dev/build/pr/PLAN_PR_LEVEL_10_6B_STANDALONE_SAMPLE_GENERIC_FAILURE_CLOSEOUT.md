# PLAN_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT

## Purpose
Close the remaining generic standalone sample data-flow failures found by the Level 10.6 delta before Phase 10 closeout.

## Source Result From Level 10.6
Level 10.6 added:
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
- `npm run test:sample-standalone:data-flow`
- targeted fixes for Asset Browser, Asset Pipeline Tool, and Palette Browser

But it also reported:

```text
Generic failure signals detected: 25
```

## Remaining Failures
- `0201:3d-camera-path-editor:preset load failure signal`
- `0202:3d-camera-path-editor:preset load failure signal`
- `0204:3d-asset-viewer:preset load failure signal`
- `0210:physics-sandbox:preset load failure signal`
- `0220:3d-camera-path-editor:preset load failure signal`
- `0221:tile-model-converter:preset load failure signal`
- `0221:3d-json-payload-normalizer:preset load failure signal`
- `0303:physics-sandbox:preset load failure signal`
- `0305:3d-json-payload-normalizer:preset load failure signal`
- `0305:tile-model-converter:preset load failure signal`
- `0306:parallax-editor:preset load failure signal`
- `0512:performance-profiler:preset load failure signal`
- `0708:replay-visualizer:preset load failure signal`
- `1204:parallax-editor:preset load failure signal`
- `1205:parallax-editor:preset load failure signal`
- `1208:3d-asset-viewer:preset load failure signal`
- `1208:3d-json-payload-normalizer:preset load failure signal`
- `1208:parallax-editor:preset load failure signal`
- `1209:tile-model-converter:preset load failure signal`
- `1315:replay-visualizer:preset load failure signal`
- `1319:performance-profiler:preset load failure signal`
- `1406:replay-visualizer:preset load failure signal`
- `1407:performance-profiler:preset load failure signal`
- `1413:3d-asset-viewer:preset load failure signal`
- `1606:physics-sandbox:preset load failure signal`

## Scope
- Expand the standalone sample contract harness to classify and fix the 25 remaining generic failures.
- Fix sample payload shape or tool standalone binding for each failure.
- Keep no-fallback/no-hardcoded-path rules.
- No start_of_day changes.
