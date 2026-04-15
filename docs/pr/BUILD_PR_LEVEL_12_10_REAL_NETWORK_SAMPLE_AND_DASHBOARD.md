# BUILD_PR_LEVEL_12_10_REAL_NETWORK_SAMPLE_AND_DASHBOARD

## Build Scope
Implement one minimal real-network launchable sample plus one live server dashboard surface.

## One PR Purpose Only
Real-network sample launch + live dashboard execution slice only.

## Build Intent
Deliver the smallest execution-backed, non-simulated network sample flow that is launchable and observable:
1. real server endpoint
2. real client connection path
3. live session telemetry dashboard

## Constraints
- no 3D work
- no feature expansion beyond launchability + observability
- no simulation-only networking path
- no protocol redesign beyond minimal needs for this launchable slice

## Required Deliverables

### A. Real-Network Launchable Sample
- one canonical sample under `samples/phase-13/1319/`
- browser/client path connects to a real server endpoint
- at least two clients can join one live session
- authoritative state update is visible across clients
- disconnect/reconnect path is observable and stable

### B. Live Server Dashboard
- dashboard loads over HTTP
- live values are sourced from real session/runtime data (not fake loopback feed)
- minimum visible telemetry:
  - active players
  - connection/session count
  - per-player status
  - lag / RTT
  - RX bytes
  - TX bytes
  - health status

## Exact Target Files

### New / Updated Sample Runtime
- `samples/phase-13/1319/index.html`
- `samples/phase-13/1319/main.js`
- `samples/phase-13/1319/game/RealNetworkLaunchScene.js`

### New / Updated Real Server + Dashboard
- `samples/phase-13/1319/server/realNetworkServer.mjs`
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`
- `samples/phase-13/1319/server/README.md`
- `samples/phase-13/1319/server/docker-compose.yml` (single-node local/live validation)

### Optional Engine Export Adjustment (only if needed)
- `src/engine/network/index.js`

## Implementation Rules
1. Do not use fake loopback/simulation as the primary network path for this sample.
2. Keep behavior minimal and testable; avoid broad UI or gameplay additions.
3. Reuse existing network contracts and layers where possible.
4. Preserve existing engine/network API surfaces unless an additive export is required.
5. Keep all changes scoped to this real-network sample + dashboard lane.

## Validation Requirements (Execution-Backed)

### 1. Import / Path Resolution
- all new/updated sample and server modules load successfully
- no broken imports in targeted files

### 2. Real-Network Runtime Boot
- server process starts and listens on configured real endpoint
- health endpoint returns ready state

### 3. Transport / Session Lifecycle
- client-1 connects successfully
- client-2 connects successfully
- both clients transition to active session
- one client disconnects and reconnects without invalid/stuck lifecycle state

### 4. Authoritative Runtime
- authoritative runtime starts and remains running during active session window
- server accepts input and produces authoritative updates

### 5. Replication / Apply
- client receives authoritative updates
- replicated state changes are visible for both connected clients
- replication/apply path remains stable through reconnect step

### 6. Live Dashboard Validation
- dashboard route loads
- player/session counts update during connect/disconnect
- lag/RTT and RX/TX values are visible and change during traffic
- per-player rows/status update during session lifecycle

### 7. Focused 2D Regression Smoke
- `tests/core/Engine2DCapabilityCombinedFoundation.test.mjs`
- `tests/core/EngineCoreBoundaryBaseline.test.mjs`
- `tests/games/AsteroidsValidation.test.mjs`

## Required Validation Commands (minimum)
- `node --input-type=module -` (import/path and lifecycle/replication smoke harness)
- `node --input-type=module -` (live dashboard/telemetry probe harness)
- `node --input-type=module -` (focused 2D regression harness)

## Roadmap Rule
Update:
`docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Allowed:
- status markers only: `[ ]` `[.]` `[x]`

Forbidden:
- wording edits
- structure edits
- additions
- deletions

## Marker Progress
- planning/prep can move related real-network conversion lane to in-progress
- completion moves to complete only on full execution-backed validation pass

## Acceptance Criteria
- one real-network launchable sample exists and boots
- one live dashboard exists and shows real session telemetry
- simulation-only dependency is not the sample's primary network path
- all required validation areas pass with execution evidence
- no 3D work introduced
