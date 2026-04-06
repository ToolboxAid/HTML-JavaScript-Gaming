Toolbox Aid
David Quesenberry
04/06/2026
README.md

# Network Sample A Server Dashboard

## Purpose
Provide a lightweight, server-owned, read-only diagnostics dashboard for Sample A fake network telemetry.

## Run
```bash
node games/network_sample_a/server/networkSampleADashboardServer.mjs
```

## Default URLs
- Dashboard: `http://127.0.0.1:4310/admin/network-sample-a/dashboard?key=sample-a-admin`
- Metrics JSON: `http://127.0.0.1:4310/admin/network-sample-a/api/metrics?key=sample-a-admin`
- Health: `http://127.0.0.1:4310/admin/network-sample-a/health`

## Environment
- `NETWORK_SAMPLE_A_DASHBOARD_HOST` (default: `127.0.0.1`)
- `NETWORK_SAMPLE_A_DASHBOARD_PORT` (default: `4310`)
- `NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS` (default: `1000`)
- `NETWORK_SAMPLE_A_ADMIN_KEY` (default: `sample-a-admin`)
- `NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY=1` (optional local bypass)

## Metrics Exposed
- player/session counts
- connection state
- latency per player and summary
- RX bytes
- TX bytes
- per-player status rows

## Notes
- Uses `FakeLoopbackNetworkModel` from Sample A as the telemetry source.
- Polling refresh is used intentionally (no websocket dependency).
- Access is loopback-restricted and key-gated by default.
