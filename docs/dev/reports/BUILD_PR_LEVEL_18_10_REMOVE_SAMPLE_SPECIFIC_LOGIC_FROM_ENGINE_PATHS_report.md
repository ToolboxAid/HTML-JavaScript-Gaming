# BUILD_PR_LEVEL_18_10_REMOVE_SAMPLE_SPECIFIC_LOGIC_FROM_ENGINE_PATHS

## Purpose
Close Level 18 Track A final item by removing remaining sample-specific logic from engine paths while preserving stable engine contracts.

## Sample-Specific Engine Surfaces Found
1. `src/engine/debug/network/commands/networkDebugCommandPackBridge.js`
- exported `createNetworkSampleCommand`
- default command namespace used `network.sample.*`
- help fallback referenced `network.sample.status`
- summary text explicitly described "sample-specific" diagnostics

2. `src/engine/debug/network/diagnostics/networkPromotionRecommendation.js`
- check keys exposed sample-specific naming:
  - `sampleProviderValidation`
  - `samplePanelValidation`

3. `src/engine/debug/network/panels/networkObservabilityPanels.js`
- option/internal key naming used sample-scoped term (`sampleKey`) for generic network snapshot source.

## Changes Applied
### Engine contract cleanup
- Replaced sample-scoped command surface with generic status surface:
  - `createNetworkSampleCommand` -> `createNetworkStatusCommand`
  - default commands now `network.status` / `network.status.<id>`
  - help fallback line updated to `network.status`
  - response code changed from `NETWORK_SAMPLE` to `NETWORK_STATUS`

### Shared generic naming
- Replaced sample-specific promotion recommendation check keys with generic keys:
  - `providerValidation`
  - `panelValidation`
- Updated diagnostic lines accordingly.

### Generic snapshot key naming
- Renamed network panel/command key handling from `sampleKey` to `snapshotKey` in engine modules.

### Consumer/import updates (exact)
- Updated engine network barrel export:
  - `src/engine/debug/network/index.js`
    - exports `createNetworkStatusCommand` (instead of sample command export)

- Updated final consumer test:
  - `tests/final/NetworkDebugAndServerDashboardCloseout.test.mjs`
    - import changed to `createNetworkStatusCommand`
    - command expectations updated to `network.status.*`
    - snapshot line expectation updated to `snapshotKey=network`
    - promotion recommendation input updated to generic keys
    - provider test fixture id renamed from `network.sample.provider` to `network.debug.provider`

## Files Changed
- `src/engine/debug/network/commands/networkDebugCommandPackBridge.js`
- `src/engine/debug/network/index.js`
- `src/engine/debug/network/diagnostics/networkPromotionRecommendation.js`
- `src/engine/debug/network/panels/networkObservabilityPanels.js`
- `tests/final/NetworkDebugAndServerDashboardCloseout.test.mjs`
- `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- `docs/dev/reports/BUILD_PR_LEVEL_18_10_REMOVE_SAMPLE_SPECIFIC_LOGIC_FROM_ENGINE_PATHS_report.md`

## Validation Commands Run
1. Engine sample-specific scan:
```bash
rg -n "network\.sample|sample-specific|sampleProviderValidation|samplePanelValidation|sampleCommandId|\bsampleKey\b" src/engine -g "*.js"
```
Result: no matches in `src/engine`.

2. Focused runtime/contract tests:
```bash
node (inline) executing:
- tests/final/NetworkDebugAndServerDashboardCloseout.test.mjs
- tests/final/DebugObservabilityMaturity.test.mjs
- tests/production/EnginePublicBarrelImports.test.mjs
```
Result: 3/3 PASS.

## Roadmap Update (Execution-Backed)
Track A marker updated in place:
- `[ ] remove sample-specific logic from engine paths` -> `[x] remove sample-specific logic from engine paths`

No roadmap text rewrite or deletion was performed.
