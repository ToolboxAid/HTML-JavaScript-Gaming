# PLAN_PR_LEVEL_12_10_REAL_NETWORK_SAMPLE_AND_DASHBOARD

## Purpose
Add a real-network launchable sample and a live server dashboard so networking can be tested without simulation.

## Why This PR Exists
The current network lane is still missing two execution-facing capabilities:
1. a sample that launches against a real network path (not simulated/loopback-only)
2. a dashboard that shows players, lag, and related live session telemetry

This means the network lane should continue before any 3D activation work.

## One PR Purpose Only
Real-network sample launch + live dashboard planning only.

## Scope
Define the smallest testable PR that delivers:
- one canonical sample that can connect over a real network
- one live dashboard surface for server/session visibility

## In Scope
- one real-network sample target
- server launch/startup path for real network use
- dashboard requirements for players, lag, and session visibility
- validation requirements
- roadmap marker-only update rule

## Out Of Scope
- no 3D work
- no simulation-only path
- no broad UI redesign
- no unrelated engine cleanup
- no feature expansion beyond launchability and observability

## Required Capabilities

### A. Real-Network Launchable Sample
The sample must:
- launch without simulation-only dependencies
- connect to a real server endpoint
- support at least one live multi-client session
- demonstrate authoritative state updates over a real connection
- remain minimal and testable

### B. Live Server Dashboard
The dashboard must show at minimum:
- active players
- connection/session count
- per-player status
- lag / RTT
- RX bytes
- TX bytes
- server/session health visibility

## Preferred Location Targets
These exact file paths can be finalized in BUILD against the current repo state, but the intent is:

### Sample
- `samples/phase-13/<real-network-sample>/`
or
- one canonical `samples/network/validation/` home if that is already the accepted pattern

### Dashboard
- existing server/dashboard surface if already present and suitable
- otherwise a minimal dedicated server dashboard surface under the current network/server tool/runtime area

## Validation Requirements
The BUILD/APPLY that follows this PLAN must be testable and must validate:

### Real-Network Sample
1. server starts on a real endpoint
2. client sample connects over non-simulated transport
3. second client can join
4. authoritative state is visible across clients
5. disconnect/reconnect behavior is valid

### Dashboard
1. dashboard loads successfully
2. player/session counts are visible
3. lag / RTT is visible
4. RX/TX visibility works
5. per-player visibility works
6. values update during a live session

### Regression Protection
1. no breakage to existing normalized network imports
2. no breakage to targeted phase-13 sample scenes
3. focused 2D regression smoke still passes

## Testability Rule
This must be a real, testable PR.
It must not be commit-only.
Roadmap progression must move only through execution-backed markers:
- `[ ]`
- `[.]`
- `[x]`

## Roadmap Rule
Update:
`docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Allowed:
- status markers only

Forbidden:
- wording edits
- structure edits
- additions
- deletions

## Recommended Next Step
Generate:
- `BUILD_PR_LEVEL_12_10_REAL_NETWORK_SAMPLE_AND_DASHBOARD`

## Acceptance Criteria
- one real-network launchable sample is defined
- one live server dashboard requirement set is defined
- validation is execution-backed and testable
- 3D remains gated until this is done
