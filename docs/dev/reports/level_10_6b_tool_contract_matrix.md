# Level 10.6B Tool Contract Matrix

- Generated: 2026-04-27
- Source test: `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
- Source results: `tmp/sample-standalone-tool-data-flow-results.json`

| Tool | Samples | Required Contract | Verification Signal | Status |
| --- | --- | --- | --- | --- |
| `3d-camera-path-editor` | `0201`, `0202`, `0220` | `cameraPath` payload present, `waypoints.length > 0` and equals preset | `#cameraPathInput` parsed JSON waypoints count equals preset; no preset-failure status | PASS |
| `3d-asset-viewer` | `0204`, `1208`, `1413` | 3D asset payload present, `vertices.length > 0` and equals preset | `#asset3dInput` parsed JSON vertex count equals preset; no preset-failure status | PASS |
| `physics-sandbox` | `0210`, `0303`, `1606` | physics body payload present and valid | `#physicsBodyInput` parsed JSON deep-equals preset `config.physicsBody`; no preset-failure status | PASS |
| `tile-model-converter` | `0221`, `0305`, `1209` | conversion payload present (`candidate`, `conversion`) | `#converterInput` parsed JSON candidate/conversion deep-equals preset; no preset-failure status | PASS |
| `3d-json-payload-normalizer` | `0221`, `0305`, `1208` | input map payload present; points/segments valid | `#map3dInput` parsed JSON points/segments counts equal preset; no preset-failure status | PASS |
| `parallax-editor` | `0306`, `1204`, `1205`, `1208` | parallax scene/layers payload present; layer count > 0 | `#layerList li` count equals preset `parallaxDocument.layers.length`; no preset-failure status | PASS |
| `performance-profiler` | `0512`, `1319`, `1407` | profile settings payload present and bound to UI inputs | `#workloadIterationsInput`, `#workSizeInput`, `#frameSamplesInput` equal preset `profileSettings` | PASS |
| `replay-visualizer` | `0708`, `1315`, `1406` | replay events payload present; events count > 0 | `#replayEventList [data-replay-index]` count equals preset events count; no preset-failure status | PASS |

## Implementation Boundary Notes

- No runtime validator modules were introduced.
- No fallback/default demo data was introduced for failing tools.
- Preset extraction was normalized to consume explicit `config.*` payload shape where the sample contract stores tool input.
