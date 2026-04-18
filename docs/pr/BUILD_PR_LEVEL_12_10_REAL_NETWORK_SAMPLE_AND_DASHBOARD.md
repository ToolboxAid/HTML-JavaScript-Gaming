# BUILD_PR_LEVEL_12_10_REAL_NETWORK_SAMPLE_AND_DASHBOARD

## Build Scope
Implement one real-network launchable sample under `samples/phase-13/1319/` and wire it into `samples/index.html`, plus one live server dashboard surface backed by real runtime/session data.

## One PR Purpose Only
Real-network sample launch + live dashboard execution slice only.

## Why This BUILD Exists
The prior declarations were not sufficient because launchability from `samples/index.html` and real dashboard visibility still needed to be proven in the repo itself.

This BUILD fixes that properly by requiring:
1. a real launchable sample entry in `samples/index.html`
2. a real non-simulated sample under `samples/phase-13/1319/`
3. a real server start path
4. a real dashboard route/page with live session telemetry
5. execution-backed validation

## Exact Targets

### Sample Launcher
- `samples/index.html`

### New Canonical Sample
- `samples/phase-13/1319/index.html`
- `samples/phase-13/1319/main.js`
- `samples/phase-13/1319/game/RealNetworkLaunchScene.js`

### Real Server + Dashboard
- `samples/phase-13/1319/server/realNetworkServer.mjs`
- `samples/phase-13/1319/server/realNetworkDashboard.mjs`
- `samples/phase-13/1319/server/README.md`
- `samples/phase-13/1319/server/docker-compose.yml`

### Optional Additive Export Support
- `src/engine/network/index.js` only if needed to keep sample code consuming the public network surface

## Required Implementation Rules

### 1. samples/index.html Wiring Is Mandatory
Add a visible launcher entry for sample 1319 in `samples/index.html`.

The entry must make the sample discoverable and clickable from the standard sample launcher.
Do not leave 1319 disconnected from the launcher.

### 2. Real Network Only
The sample must launch against a real server endpoint.
Do not use simulation-only or loopback-only transport as the primary runtime path for 1319.

### 3. Canonical Sample Behavior
Keep behavior minimal and testable:
- connect to real server
- join live session
- show at least one authoritative shared state update across clients
- allow disconnect/reconnect observation

### 4. Dashboard Must Be Real
The dashboard must display live runtime/session data sourced from the actual running server, not static or fake data.

Minimum visible telemetry:
- active players
- connection/session count
- per-player status
- lag / RTT
- RX bytes
- TX bytes
- health status

### 5. Scope Protection
Do not broaden scope into:
- 3D work
- unrelated engine cleanup
- protocol redesign
- broad gameplay expansion
- sample UI redesign beyond what is needed for launch/testing

## Required Validation (Execution-Backed)

### A. Launcher Validation
- `samples/index.html` loads
- sample 1319 entry is present
- clicking/opening 1319 reaches `samples/phase-13/1319/index.html`

### B. Real Server Boot
- `realNetworkServer.mjs` starts successfully
- server listens on configured real endpoint
- health endpoint returns ready/healthy state

### C. Real Sample Connection
- client-1 connects successfully
- client-2 connects successfully
- both clients join same live session
- authoritative state updates are visible across clients

### D. Disconnect / Reconnect
- one client disconnects
- dashboard/session visibility updates correctly
- reconnect succeeds without invalid or stuck state

### E. Dashboard Validation
- dashboard route/page loads
- active player count updates during connect/disconnect
- session count visibility works
- lag / RTT is visible
- RX / TX metrics are visible
- per-player status rows update during active session

### F. Focused Regression Validation
- normalized network imports remain valid
- targeted phase-13 network samples do not regress
- focused 2D smoke regression still passes

## Required Validation Commands
Provide concrete commands in the repo docs for at least:
1. starting the real server
2. opening/serving `samples/index.html`
3. opening sample 1319
4. opening the dashboard
5. running focused validation probes / smoke checks

## Roadmap Update Rule
Update:
`docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`

Allowed:
- status markers only: `[ ]` `[.]` `[x]`

Forbidden:
- wording edits
- structure edits
- additions
- deletions

## Marker Progress Rule
This PR must remain testable and execution-backed.
Only advance related roadmap markers when the launcher wiring, real sample launch, and live dashboard validation have actually passed.

## Acceptance Criteria
- `samples/index.html` includes a working 1319 launcher entry
- `samples/phase-13/1319/` exists and is real-network launchable
- server start path is documented and runnable
- dashboard is real and live-updating
- validation is execution-backed
- roadmap is updated by marker only
