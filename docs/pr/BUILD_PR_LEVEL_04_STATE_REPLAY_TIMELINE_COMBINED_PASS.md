# BUILD_PR_LEVEL_04_STATE_REPLAY_TIMELINE_COMBINED_PASS

## Purpose
Close the remaining Section-4 state-flow residue in one surgical pass by normalizing replay model + timeline orchestration boundaries, confirming shared contracts, and validating authoritative state slice behavior without reopening stable lanes.

## Implemented Scope
- added shared replay contracts under `src/shared/contracts`
- exposed replay contracts through shared contract/state barrels
- extracted replay model creation/normalization into `src/engine/replay/ReplayModel.js`
- added bounded replay timeline orchestration in `src/engine/replay/ReplayTimeline.js`
- wired `ReplaySystem` to replay-model + timeline surfaces
- added timeline-focused replay tests and runner registration
- updated Section-4 roadmap markers (status only)

## Boundary Outcomes
- replay model boundary: `src/engine/replay/ReplayModel.js`
- timeline orchestration boundary: `src/engine/replay/ReplayTimeline.js`
- replay runtime facade: `src/engine/replay/ReplaySystem.js`
- state/replay contract surface: `src/shared/contracts/*` + `src/shared/state/contracts.js`

## Section-4 Status Result
Completed in this pass:
- replay/timeline boundaries normalized
- state contracts extracted/confirmed
- replay model
- timeline orchestration
- authoritative state slices (validated with focused authoritative tests)

Residual blockers:
- none identified in the targeted Section-4 lane

## Validation Run
### Node parse checks
- `node --check` on all touched JS/MJS files: pass

### Focused state-flow checks
- `tests/replay/ReplaySystem.test.mjs`: pass
- `tests/replay/ReplayTimeline.test.mjs`: pass
- `tests/world/WorldGameStateSystem.test.mjs`: pass
- `tests/world/WorldGameStateAuthoritativeHandoff.test.mjs`: pass
- `tests/world/WorldGameStateAuthoritativeScore.test.mjs`: pass

### Not run in this focused Node-only invocation
- `tests/games/GravityWellReplay.test.mjs` depends on browser-style absolute `/src/...` imports in the game scene module and does not execute in the direct Node ESM call used here.

## Changed Files
- `src/shared/contracts/replayContracts.js`
- `src/shared/contracts/index.js`
- `src/shared/state/contracts.js`
- `src/engine/replay/ReplayModel.js`
- `src/engine/replay/ReplayTimeline.js`
- `src/engine/replay/ReplaySystem.js`
- `src/engine/replay/index.js`
- `tests/replay/ReplaySystem.test.mjs`
- `tests/replay/ReplayTimeline.test.mjs`
- `tests/run-tests.mjs`
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`
