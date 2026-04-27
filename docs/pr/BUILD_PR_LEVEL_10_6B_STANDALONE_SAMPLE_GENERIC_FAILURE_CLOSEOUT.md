# BUILD_PR_LEVEL_10_6B_STANDALONE_SAMPLE_GENERIC_FAILURE_CLOSEOUT

## Objective
Turn Level 10.6 generic failures into explicit tool contracts and fix them.

## Starting Point
Use the existing Level 10.6 test:

```text
tests/runtime/SampleStandaloneToolDataFlow.test.mjs
```

and the existing command:

```text
npm run test:sample-standalone:data-flow
```

## Remaining Failures To Close
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

## Required Work

### 1. Expand Contract Harness
The test must stop treating these as generic failures and give each tool a contract:

- 3D Camera Path Editor
- 3D Asset Viewer
- Physics Sandbox
- Tile Model Converter
- 3D JSON Payload Normalizer
- Parallax Scene Studio / Parallax Editor
- Performance Profiler
- Replay Visualizer

### 2. Tool-Specific Contract Expectations

#### 3D Camera Path Editor
Expected:
- camera path payload present
- keyframes/points count > 0
- no preset load failure

#### 3D Asset Viewer
Expected:
- asset/viewer payload present
- renderable or model/scene input exists
- no preset load failure

#### Physics Sandbox
Expected:
- physics config/payload present
- no stale dashed sample file references
- no 404 for old sample JSON
- sandbox input state valid

#### Tile Model Converter
Expected:
- conversion/candidate payload present
- valid input JSON
- conversion input not empty

#### 3D JSON Payload Normalizer
Expected:
- input JSON payload present
- normalizer can parse it
- no invalid input state

#### Parallax Editor
Expected:
- scene/layers payload present
- layer count > 0
- no placeholder/bars-only state

#### Performance Profiler
Expected:
- workload profile or frame sample payload present
- no preset 404
- profile can run or load preset state

#### Replay Visualizer
Expected:
- replay events exist
- event count > 0
- no "Preset payload did not include replay events"

### 3. Fix Root Cause Per Failure
For each failure:
- if sample payload path is stale, update metadata/path
- if payload shape is wrong, migrate sample payload
- if tool binding expects config-wrapped data only, normalize to manifest-like tool input
- if tool UI/state slot is wrong, bind payload to correct slot
- never use fallback/demo data

### 4. Reports
Create/update:
- `docs/dev/reports/level_10_6b_standalone_generic_failure_closeout_report.md`
- `docs/dev/reports/level_10_6b_tool_contract_matrix.md`

## Acceptance
- `npm run test:sample-standalone:data-flow` reports `generic failure signals detected: 0`
- all 25 listed failures are fixed or individually documented with exact blocker
- no silent fallback data used
- no hardcoded asset paths added
- no start_of_day changes
- delta ZIP returned
