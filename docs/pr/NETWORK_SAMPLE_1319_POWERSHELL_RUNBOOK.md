# NETWORK SAMPLE 1319 POWERSHELL RUNBOOK

## Scope
Launch and validate sample 1319 real-network runtime from PowerShell using repo-level runtime paths.

## Preconditions
- Run from repo root: `c:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming`
- Node.js and Python are installed.

## 1) Start Real Server (Terminal A)
```powershell
cd c:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
node samples/phase-13/1319/server/realNetworkServer.mjs
```

Expected startup output includes:
- `NETWORK_SAMPLE_1319_SERVER_READY`
- WebSocket URL
- dashboard and health URLs

## 2) Start Static Sample Host (Terminal B)
```powershell
cd c:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
python -m http.server 8080
```

## 3) Open Launcher
- `http://127.0.0.1:8080/samples/index.html`

Confirm Sample 1319 appears in the launcher list.

## 4) Open Sample 1319 Directly
- `http://127.0.0.1:8080/samples/phase-13/1319/index.html`

Keep endpoint as:
- `ws://127.0.0.1:4320/ws`

## 5) Open Dashboard
- `http://127.0.0.1:4320/admin/network-sample-1319/dashboard`

## 6) Step-by-Step Live Validation
1. In sample tab 1, click `Connect`.
2. Open a second 1319 tab and click `Connect`.
3. Confirm both clients join the same live session.
4. Move one client with `WASD` or arrow keys.
5. Confirm authoritative state updates are visible on both tabs.
6. Disconnect one client, then reconnect it.
7. In dashboard, verify updates for:
   - active players
   - sessions
   - RTT
   - RX bytes
   - TX bytes
   - per-player status rows

## 7) Docker (Compose File Stays Under Sample Server Folder)
Compose path:
- `samples/phase-13/1319/server/docker-compose.yml`

Bring up:
```powershell
cd c:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
docker compose -f samples/phase-13/1319/server/docker-compose.yml up --build
```

Bring down:
```powershell
cd c:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming
docker compose -f samples/phase-13/1319/server/docker-compose.yml down
```

## 8) Focused Validation Commands
From repo root:
```powershell
node tmp/validate_1319.mjs
node tests/runtime/LaunchSmokeAllEntries.test.mjs
node tests/final/MultiplayerNetworkingStack.test.mjs
node tests/final/NetworkDebugAndServerDashboardCloseout.test.mjs
node tests/core/Engine2DCapabilityCombinedFoundation.test.mjs
node tests/core/EngineCoreBoundaryBaseline.test.mjs
node tests/games/AsteroidsValidation.test.mjs
```
