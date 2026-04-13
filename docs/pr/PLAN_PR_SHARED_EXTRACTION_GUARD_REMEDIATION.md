# PLAN_PR — Shared Extraction Guard Remediation

## Objective
Restore `npm test` by eliminating the current unexpected `checkSharedExtractionGuard.mjs` failures while preserving the already-passing runtime/unit suite.

## Current observed state
- `npm test --ignore-scripts` reaches and runs the node test suite successfully.
- `npm test` stops in `pretest` at `tools/dev/checkSharedExtractionGuard.mjs`. fileciteturn0file0
- The guard currently reports 93 unexpected violations across these categories: deep-relative-shared-traversal, direct-shared-relative-import, inline-helper-clone, and local-helper-definition. fileciteturn0file0
- A separate runner issue around `LaunchSmokeAllEntries.test.mjs` was resolved, allowing the node suite to execute successfully with `--ignore-scripts`. fileciteturn2file0

## Scope
This PR remediates only the currently unexpected guard violations. It does not broaden behavior, change engine contracts, or relax the guard.

### In scope
- Replace direct/deep relative imports into shared code with approved shared entry points.
- Extract repeated helper logic into shared utilities where appropriate.
- Remove local helper duplication that the guard flags.
- Keep behavior stable and testable.

### Out of scope
- Re-baselining the guard to accept the new violations.
- Refactoring unrelated legacy baseline violations.
- Engine/game runtime changes unrelated to import/helper normalization.
- New features.

## Violation groups to fix

### Group A — deep-relative-shared-traversal
Highest-priority violations concentrated in:
- `samples/phase13/1316/...`
- `samples/phase13/1317/...`
- `samples/phase13/1318/...` fileciteturn0file0

**Intent:** replace `../../../../src/shared/...` style traversals with stable imports from approved shared surfaces.

### Group B — direct-shared-relative-import
Violations span:
- selected phase 12 / phase 13 sample files
- multiple tool entry points
- `tools/shared/vector/vectorSafeValueUtils.js` fileciteturn0file0

**Intent:** normalize imports so samples/tools do not reach shared internals through forbidden relative depth patterns.

### Group C — inline-helper-clone
Mainly repeated `Number.isFinite` / numeric normalization patterns across:
- sample enhancement files
- phase 13 network files
- performance/replay tools
- `tools/shared/debugInspectorData.js` fileciteturn0file0

**Intent:** extract one or more approved reusable numeric helpers and consume them consistently.

### Group D — local-helper-definition
Currently identified in:
- `samples/phase13/1316/server/networkSampleADashboardServer.mjs` (`asPositiveInteger`) fileciteturn0file0

**Intent:** move helper into approved shared utility surface and import it.

## Planned implementation approach

### 1) Establish approved import surfaces
Codex should prefer creating or extending a small number of public utility/export surfaces rather than replacing every bad import with a different deep relative path.

Preferred pattern:
- create/extend stable shared entry modules for categories such as:
  - numeric utilities
  - network/reconciliation helpers if genuinely reused
  - debug inspector/shared tool helpers where appropriate
- make samples/tools import from those entry modules only

### 2) Fix network sample clusters together
Treat `1316`, `1317`, and `1318` as a coordinated cluster. These violations likely share the same import/helper patterns and should be normalized as one pass to avoid drift and partial fixes.

### 3) Extract numeric helpers once
Introduce a single canonical helper module for patterns currently duplicated under the guard’s inline-helper-clone checks. Avoid multiple near-identical helper files.

Potential helper surface:
- `src/shared/utils/numberUtils.js` or project-equivalent approved surface

Potential exported helpers:
- `isFiniteNumber(value)`
- `toFiniteNumber(value, fallback)`
- `asPositiveInteger(value, fallback)`

Use the repo’s existing naming/style conventions if a similar module already exists.

### 4) Normalize tool imports
Update tool entry points to consume approved shared surfaces. Do not leave any direct `../shared/...` or similar forbidden patterns that still trip the guard.

### 5) Preserve behavior
This PR is structural. Codex should avoid semantic rewrites unless necessary to preserve current passing tests.

## File targeting guidance

### First-pass target set
Network sample cluster:
- `samples/phase13/1316/debug/networkSampleADebug.js`
- `samples/phase13/1316/game/FakeLoopbackNetworkModel.js`
- `samples/phase13/1316/game/NetworkSampleAScene.js`
- `samples/phase13/1316/main.js`
- `samples/phase13/1316/server/networkSampleADashboardServer.mjs`
- `samples/phase13/1317/debug/networkSampleBDebug.js`
- `samples/phase13/1317/game/FakeHostClientNetworkModel.js`
- `samples/phase13/1317/game/NetworkSampleBScene.js`
- `samples/phase13/1317/main.js`
- `samples/phase13/1318/debug/networkSampleCDebug.js`
- `samples/phase13/1318/game/FakeDivergenceTraceNetworkModel.js`
- `samples/phase13/1318/game/NetworkSampleCScene.js`
- `samples/phase13/1318/game/ReconciliationLayerAdapter.js`
- `samples/phase13/1318/game/StateTimelineBuffer.js`
- `samples/phase13/1318/main.js`

Additional sample/tool targets:
- `samples/phase12/1205/main.js`
- `samples/phase12/1208/ToolFormattedTilesParallaxScene.js`
- `samples/_shared/sampleDetailPageEnhancement.js`
- `samples/phase13/1303/AsteroidsWorldSystemsScene.js`
- `samples/phase13/1309/SpaceInvadersWorldSystemsScene.js`
- `samples/phase13/1313/PacmanLiteWorldSystemsScene.js`
- `tools/Performance Profiler/main.js`
- `tools/Replay Visualizer/main.js`
- `tools/Sprite Editor/main.js`
- `tools/State Inspector/main.js`
- `tools/Tool Host/main.js`
- `tools/Vector Asset Studio/main.js`
- `tools/Vector Map Editor/main.js`
- `tools/shared/vector/vectorSafeValueUtils.js`
- `tools/shared/debugInspectorData.js` fileciteturn0file0

## Acceptance criteria
- `npm test` reaches and passes `pretest` without new or remaining unexpected violations.
- `npm test --ignore-scripts` remains green.
- No guard baseline expansion.
- No runtime regressions introduced in the currently passing suite. fileciteturn2file0

## Risks
- Creating too many helper entry points can fragment shared surfaces.
- Changing imports piecemeal may leave residual violations.
- Moving helpers without preserving exact coercion semantics may break edge cases.

## Recommended review order
1. Shared/public utility surfaces added or updated.
2. Phase 13 network cluster import cleanup.
3. Tool entry import normalization.
4. Numeric helper extraction adoption.
5. Full validation.

## Validation plan
Run in this order:
1. `node tools/dev/checkSharedExtractionGuard.mjs`
2. `npm test --ignore-scripts`
3. `npm test`
4. If needed, targeted reruns for touched samples/tools

## Definition of done
The PR is done when the guard no longer reports these 93 unexpected violations and the full test pipeline runs cleanly end-to-end.
