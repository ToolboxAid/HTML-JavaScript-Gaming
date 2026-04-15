# Network Sample 1319 - Real Server + Live Dashboard

## Purpose
Run a real WebSocket authoritative server for sample 1319 and expose a live dashboard backed by real session/runtime data.

## Local Run (Node)
From repo root:

```bash
node samples/phase-13/1319/server/realNetworkServer.mjs
```

## Serve Sample Launcher
From repo root:

```bash
python -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/samples/index.html
```

## Endpoints
- WebSocket: `ws://127.0.0.1:4320/ws`
- Health: `http://127.0.0.1:4320/admin/network-sample-1319/health`
- Dashboard: `http://127.0.0.1:4320/admin/network-sample-1319/dashboard`
- Metrics JSON: `http://127.0.0.1:4320/admin/network-sample-1319/api/metrics`

## Open Sample 1319
Open:

```text
http://127.0.0.1:8080/samples/phase-13/1319/index.html
```

Leave server URL as `ws://127.0.0.1:4320/ws`.
Open a second browser tab/window for a second client.

## Open Dashboard
Open:

```text
http://127.0.0.1:4320/admin/network-sample-1319/dashboard
```

## Runtime Validation Flow
1. Start server.
2. Connect client-1 from sample 1319.
3. Connect client-2 from second sample tab.
4. Move with WASD/arrow keys and verify authoritative updates on both clients.
5. Disconnect and reconnect one client.
6. Open dashboard and verify player/session counts, RTT, RX/TX, and per-player updates.

## Docker Compose (Single Node)
From repo root:

```bash
docker compose -f samples/phase-13/1319/server/docker-compose.yml up --build
```

Stop:

```bash
docker compose -f samples/phase-13/1319/server/docker-compose.yml down
```

## Focused Validation Commands
From repo root:

```bash
node tmp/validate_1319.mjs
node tests/final/MultiplayerNetworkingStack.test.mjs
node tests/final/NetworkDebugAndServerDashboardCloseout.test.mjs
node tests/core/Engine2DCapabilityCombinedFoundation.test.mjs
node tests/core/EngineCoreBoundaryBaseline.test.mjs
node tests/games/AsteroidsValidation.test.mjs
```
