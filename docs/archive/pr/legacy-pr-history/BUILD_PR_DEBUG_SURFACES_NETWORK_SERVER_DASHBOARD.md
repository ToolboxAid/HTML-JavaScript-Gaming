Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD.md

# BUILD_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD

## Build Summary
Implemented Track T with a lightweight server dashboard for Sample A network telemetry using polling and read-only diagnostics.

## Implemented
1. Server-owned dashboard runtime
- file: `games/network_sample_a/server/networkSampleADashboardServer.mjs`
- HTTP routes:
  - `/admin/network-sample-a/dashboard`
  - `/admin/network-sample-a/api/metrics`
  - `/admin/network-sample-a/health`

2. Data source integration
- imports `games/network_sample_a/game/FakeLoopbackNetworkModel.js`
- runs deterministic multi-player/session telemetry states
- exposes per-player and summary metrics

3. Metrics surfaced
- player count
- session count
- connection state (summary + per player)
- latency (summary + per player)
- RX bytes (summary + per player)
- TX bytes (summary + per player)

4. Access gating
- loopback-only access restriction
- admin key gate via query/header
- optional localhost bypass env flag for local debug

5. Polling refresh
- dashboard page polls JSON endpoint at configurable interval
- no websocket dependency

6. Reusability
- separation between telemetry source, API response, and dashboard UI rendering
- structure is ready for swapping fake data source with real networking source later

## Scope Safety
- no src/engine/core modifications
- no DB/auth system expansion
- no Track U containerization work
- no BIG_PICTURE roadmap edits
