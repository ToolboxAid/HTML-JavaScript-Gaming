Toolbox Aid
David Quesenberry
04/06/2026
README.md

# Network Sample A Server Dashboard

## Purpose
Provide a lightweight, server-owned, read-only diagnostics dashboard for Sample A fake network telemetry.

## Local Run (Node)
```bash
node games/network_sample_a/server/networkSampleADashboardServer.mjs
```

## Container Run (Docker)
Build from repo root using the sample context:
```bash
docker build -f games/network_sample_a/server/Dockerfile -t network-sample-a-dashboard games/network_sample_a
```

Run with dashboard port mapping:
```bash
docker run --rm -p 4310:4310 -e NETWORK_SAMPLE_A_ADMIN_KEY=sample-a-admin network-sample-a-dashboard
```

## Container Run (Compose, Optional)
```bash
cd games/network_sample_a/server
docker compose up --build
```

## Default URLs
- Dashboard: `http://127.0.0.1:4310/admin/network-sample-a/dashboard?key=sample-a-admin`
- Metrics JSON: `http://127.0.0.1:4310/admin/network-sample-a/api/metrics?key=sample-a-admin`
- Health: `http://127.0.0.1:4310/admin/network-sample-a/health`

## Environment Contract
- `NETWORK_SAMPLE_A_DASHBOARD_HOST` (default: `127.0.0.1`, container override: `0.0.0.0`)
- `NETWORK_SAMPLE_A_DASHBOARD_PORT` (default: `4310`)
- `NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS` (default: `1000`)
- `NETWORK_SAMPLE_A_ADMIN_KEY` (default: `sample-a-admin`)
- `NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY=1` (optional local bypass)
- `NETWORK_SAMPLE_A_ALLOW_REMOTE_WITH_KEY=1` (required for containerized remote browser access using admin key)

## Port Mapping
- Container listens on `4310`.
- Recommended mapping is `-p 4310:4310`.

## Health/Readiness
- Readiness endpoint: `/admin/network-sample-a/health`
- Docker healthcheck calls this route to determine container health.

## Logging Output Expectations
Output is stdout/stderr only in this PR (no additional logging stack introduced).

On startup, logs include:
- `NETWORK_SAMPLE_A_SERVER_DASHBOARD_READY`
- Dashboard URL (with key query)
- Metrics URL
- Health URL

During operation, endpoint traffic is handled quietly; error responses are returned as structured JSON.

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
- Access remains read-only and debug/admin-focused.
