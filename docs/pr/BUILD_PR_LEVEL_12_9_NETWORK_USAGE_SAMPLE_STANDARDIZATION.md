# BUILD_PR_LEVEL_12_9_NETWORK_USAGE_SAMPLE_STANDARDIZATION

## Build Scope
Standardize network-usage sample imports against the normalized network structure while keeping sample behavior unchanged.

## One PR Purpose Only
Network usage sample standardization only.

## Source Standard
Use the normalized network structure as the standard:
- `src/engine/network/transport/`
- `src/engine/network/session/`
- `src/engine/network/server/`
- `src/engine/network/client/`
- `src/engine/network/replication/`
- `src/engine/network/bootstrap/`
- `src/engine/network/debug/`

## Import Policy
All targeted sample scenes must consume the network API through:
- `src/engine/network/index.js`

Do not import network internals through deep sample-facing paths unless `index.js` already re-exports them.
If required, update `src/engine/network/index.js` export coverage to preserve sample behavior without changing sample runtime logic.

## Targets
- `samples/phase-13/1301/NetworkingLayerScene.js`
- `samples/phase-13/1302/StateSyncReplicationScene.js`
- `samples/phase-13/1304/ClientPredictionReconciliationScene.js`
- `samples/phase-13/1305/SerializationSystemScene.js`
- `samples/phase-13/1306/NetworkDebugOverlayScene.js`
- `samples/phase-13/1307/RemoteEntityInterpolationScene.js`
- `samples/phase-13/1308/LobbySessionSystemScene.js`
- `samples/phase-13/1310/HostServerBootstrapScene.js`
- `samples/phase-13/1311/InterestManagementScene.js`
- `samples/phase-13/1312/LagPacketLossSimulationScene.js`
- `samples/phase-13/1314/ChatPresenceLayerScene.js`
- `samples/phase-13/1315/RollbackReplayDiagnosticsScene.js`

## Required Implementation Rules
1. Lock sample network imports to `src/engine/network/index.js`
2. Remove deep or legacy flat-path usage where present
3. Keep scene behavior, controls, timing, outputs, and runtime logic exactly as-is
4. Normalize sample metadata/docs path references only where needed for structural accuracy
5. Do not expand features
6. Do not rewrite scene logic beyond import/path normalization

## Testable PR Requirement
This PR must remain testable and must not be commit-only.

## Validation Plan
### Import / Path Resolution
- confirm all target sample files resolve network imports through `src/engine/network/index.js`
- confirm no stale deep/legacy flat imports remain in the targeted sample set

### Runtime Smoke
- network runtime smoke boot
- transport/session lifecycle smoke
- authoritative runtime boot smoke
- replication/apply smoke

### Regression Protection
- focused 2D regression smoke
- no sample behavior drift in targeted phase-13 scenes

## Roadmap Rule
Update:
`docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Allowed:
- status markers only: `[ ]` `[.]` `[x]`

Forbidden:
- wording edits
- structure edits
- additions
- deletions

## Marker Progress
- planning step: no marker change
- BUILD/APPLY: marker-only updates based strictly on execution-backed evidence

## Acceptance Criteria
- all targeted samples use the standardized network import policy
- no targeted sample behavior changes
- runtime smoke validations pass
- focused 2D regression smoke passes
- roadmap updated by marker only if execution-backed validation succeeds
