# PLAN_PR_LEVEL_12_8_NETWORK_DIRECTORY_NORMALIZATION

## Purpose
Normalize the current flat `src/engine/network/` module layout into a clearer directory structure without changing network scope or adding features.

## Reason For This PR
Current network modules are functionally present, but the flat layout makes ownership and test mapping harder to follow.
This PR creates the directory-structure plan first so the next BUILD can be executed against the actual updated `src` you provide.

## One PR Purpose Only
Network directory normalization only.

## Scope
Define the target homes for existing network modules under:
- `src/engine/network/transport/`
- `src/engine/network/session/`
- `src/engine/network/server/`
- `src/engine/network/client/`
- `src/engine/network/replication/`
- `src/engine/network/debug/`
- `src/engine/network/bootstrap/`

## In Scope
- move-map for existing files only
- import update expectations
- public export/index expectations
- validation expectations for path-safe normalization
- roadmap status-marker update rule

## Out Of Scope
- no new network features
- no protocol redesign
- no message-format changes
- no gameplay changes
- no 3D work
- no broad engine cleanup beyond this move-map

## Current Flat Modules Expected For Classification
Examples already identified in the current flat layout:
- `src/engine/network/index.js`
- `src/engine/network/TransportContract.js`
- `src/engine/network/SessionLifecycleContract.js`
- `src/engine/network/HandshakeSimulator.js`
- `src/engine/network/AuthoritativeServerRuntime.js`
- `src/engine/network/AuthoritativeInputIngestionContract.js`
- `src/engine/network/ReplicationMessageContract.js`
- `src/engine/network/ClientReplicationApplicationLayer.js`
- `src/engine/network/ClientReconciliationStrategy.js`
- `src/engine/network/StateReplication.js`
- `src/engine/network/LoopbackTransport.js`
- `src/engine/network/HostServerBootstrap.js`
- `src/engine/network/LobbySessionManager.js`

## Proposed Target Structure
```text
src/engine/network/
  index.js
  transport/
    TransportContract.js
    LoopbackTransport.js
  session/
    SessionLifecycleContract.js
    HandshakeSimulator.js
    LobbySessionManager.js
  server/
    AuthoritativeServerRuntime.js
    AuthoritativeInputIngestionContract.js
  client/
    ClientReplicationApplicationLayer.js
    ClientReconciliationStrategy.js
    RemoteInterpolationBuffer.js
    PredictionReconciler.js
  replication/
    ReplicationMessageContract.js
    StateReplication.js
  bootstrap/
    HostServerBootstrap.js
    NetworkingLayer.js
  debug/
    NetworkDebugOverlay.js
```

## Move-Map Rules
- keep file names unless a rename is required for clarity
- preserve behavior
- update imports exactly
- do not leave duplicate legacy copies behind
- maintain a stable `src/engine/network/index.js` export surface if possible

## Validation Requirements
The BUILD/APPLY that follows this PLAN must be testable and must validate:
1. imports resolve after moves
2. local network sample/runtime still boots
3. transport/session lifecycle still works
4. authoritative server runtime still boots
5. client replication/application still works
6. no cross-lane 2D regression from import-path changes

## Testability Requirement
This normalization PR must not be commit-only.
The BUILD must include real import/path validation and runtime smoke validation so roadmap markers can move through real execution-backed progression.

## Roadmap Rule
Any roadmap update must be marker-only:
- `[ ]`
- `[.]`
- `[x]`

Do not change wording, structure, add content, or delete content.

## Expected Next Step
After you provide the updated `src`, generate:
- `BUILD_PR_LEVEL_12_8_NETWORK_DIRECTORY_NORMALIZATION`

## Acceptance Criteria
- target directory structure defined
- move-map boundaries defined
- non-scope protected
- BUILD prepared to be one-pass executable after updated `src` is provided
