# BUILD_PR_LEVEL_12_8_NETWORK_DIRECTORY_NORMALIZATION

## Build Scope
Normalize the current flat `src/engine/network/` layout into explicit network subfolders using the reviewed `src.zip` file set.

## One PR Purpose Only
Network directory normalization only.

## Testable PR Requirement
This PR is not commit-only.
The implementation must:
1. move files into the new structure
2. update imports/exports
3. keep runtime behavior unchanged
4. pass real boot/smoke validation
5. update roadmap markers only if execution-backed validation succeeds

## Source Baseline Used
Reviewed from uploaded `src.zip`.

## Current Files Confirmed
- `src/engine/network/AuthoritativeInputIngestionContract.js`
- `src/engine/network/AuthoritativeServerRuntime.js`
- `src/engine/network/ChatPresenceLayer.js`
- `src/engine/network/ClientReconciliationStrategy.js`
- `src/engine/network/ClientReplicationApplicationLayer.js`
- `src/engine/network/HandshakeSimulator.js`
- `src/engine/network/HostServerBootstrap.js`
- `src/engine/network/InterestManager.js`
- `src/engine/network/LobbySessionManager.js`
- `src/engine/network/LoopbackTransport.js`
- `src/engine/network/NetworkConditionSimulator.js`
- `src/engine/network/NetworkDebugOverlay.js`
- `src/engine/network/NetworkingLayer.js`
- `src/engine/network/PredictionReconciler.js`
- `src/engine/network/RemoteInterpolationBuffer.js`
- `src/engine/network/ReplicationMessageContract.js`
- `src/engine/network/RollbackDiagnostics.js`
- `src/engine/network/Serializer.js`
- `src/engine/network/SessionLifecycleContract.js`
- `src/engine/network/StateReplication.js`
- `src/engine/network/TransportContract.js`
- `src/engine/network/index.js`

## Target Structure
```text
src/engine/network/
  index.js
  transport/
    TransportContract.js
    LoopbackTransport.js
    NetworkConditionSimulator.js
    Serializer.js
  session/
    SessionLifecycleContract.js
    HandshakeSimulator.js
    LobbySessionManager.js
    ChatPresenceLayer.js
  server/
    AuthoritativeServerRuntime.js
    AuthoritativeInputIngestionContract.js
    InterestManager.js
    RollbackDiagnostics.js
  client/
    ClientReplicationApplicationLayer.js
    ClientReconciliationStrategy.js
    PredictionReconciler.js
    RemoteInterpolationBuffer.js
  replication/
    ReplicationMessageContract.js
    StateReplication.js
  bootstrap/
    HostServerBootstrap.js
    NetworkingLayer.js
  debug/
    NetworkDebugOverlay.js
```

## Exact Move Map
- `src/engine/network/TransportContract.js` -> `src/engine/network/transport/TransportContract.js`
- `src/engine/network/LoopbackTransport.js` -> `src/engine/network/transport/LoopbackTransport.js`
- `src/engine/network/NetworkConditionSimulator.js` -> `src/engine/network/transport/NetworkConditionSimulator.js`
- `src/engine/network/Serializer.js` -> `src/engine/network/transport/Serializer.js`

- `src/engine/network/SessionLifecycleContract.js` -> `src/engine/network/session/SessionLifecycleContract.js`
- `src/engine/network/HandshakeSimulator.js` -> `src/engine/network/session/HandshakeSimulator.js`
- `src/engine/network/LobbySessionManager.js` -> `src/engine/network/session/LobbySessionManager.js`
- `src/engine/network/ChatPresenceLayer.js` -> `src/engine/network/session/ChatPresenceLayer.js`

- `src/engine/network/AuthoritativeServerRuntime.js` -> `src/engine/network/server/AuthoritativeServerRuntime.js`
- `src/engine/network/AuthoritativeInputIngestionContract.js` -> `src/engine/network/server/AuthoritativeInputIngestionContract.js`
- `src/engine/network/InterestManager.js` -> `src/engine/network/server/InterestManager.js`
- `src/engine/network/RollbackDiagnostics.js` -> `src/engine/network/server/RollbackDiagnostics.js`

- `src/engine/network/ClientReplicationApplicationLayer.js` -> `src/engine/network/client/ClientReplicationApplicationLayer.js`
- `src/engine/network/ClientReconciliationStrategy.js` -> `src/engine/network/client/ClientReconciliationStrategy.js`
- `src/engine/network/PredictionReconciler.js` -> `src/engine/network/client/PredictionReconciler.js`
- `src/engine/network/RemoteInterpolationBuffer.js` -> `src/engine/network/client/RemoteInterpolationBuffer.js`

- `src/engine/network/ReplicationMessageContract.js` -> `src/engine/network/replication/ReplicationMessageContract.js`
- `src/engine/network/StateReplication.js` -> `src/engine/network/replication/StateReplication.js`

- `src/engine/network/HostServerBootstrap.js` -> `src/engine/network/bootstrap/HostServerBootstrap.js`
- `src/engine/network/NetworkingLayer.js` -> `src/engine/network/bootstrap/NetworkingLayer.js`

- `src/engine/network/NetworkDebugOverlay.js` -> `src/engine/network/debug/NetworkDebugOverlay.js`

## Keep In Place
- `src/engine/network/index.js`

## index.js Requirement
Update `src/engine/network/index.js` so the public export surface remains stable after file moves.
Prefer re-export compatibility so existing import sites keep working where possible.

## Import Update Rule
- update all imports impacted by moved files
- do not leave stale paths
- do not leave duplicate shadow copies behind
- do not widen scope outside this move-map unless required by import resolution

## Validation Requirements
The BUILD implementation must be testable and must validate all of the following:

### Path / Import Validation
- all moved module imports resolve
- `src/engine/network/index.js` exports resolve
- no broken relative imports remain

### Runtime Smoke Validation
- existing network sample/runtime boot still works
- transport/session lifecycle still works
- authoritative runtime still boots
- replication/apply path still works

### Regression Protection
- focused 2D smoke path still boots
- no engine API breakage caused by path rewiring

## Roadmap Update Rule
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
This BUILD is execution-backed and testable.
Advance the related normalization marker only when the move-map is implemented and validated successfully.

## Acceptance Criteria
- exact file move-map applied
- imports updated
- stable network export surface preserved
- no duplicate legacy copies left behind
- runtime smoke checks pass
- roadmap updated by marker only
