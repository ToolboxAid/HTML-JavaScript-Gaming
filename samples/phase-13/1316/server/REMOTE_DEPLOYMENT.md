Toolbox Aid
David Quesenberry
04/15/2026
REMOTE_DEPLOYMENT.md

# Remote Deployment Candidate (Single Node)

## Scope
- one remote host
- one Docker service
- one published endpoint
- no scaling/orchestration

## Prerequisites
- Docker + Docker Compose available on remote host
- inbound TCP access on target port (default `4310`)
- public hostname or IP for the remote host

## Deploy

1. Copy the `samples/phase-13/1316/` folder to the remote host.
2. From `samples/phase-13/1316/server`, run:

```bash
docker compose -f docker-compose.remote.yml up --build -d
```

3. Confirm health:

```bash
curl "http://127.0.0.1:4310/admin/network-sample-a/health"
```

## Public Connectivity Check

From an external machine (not the remote host), verify:

```bash
curl "http://<PUBLIC_HOST_OR_IP>:4310/admin/network-sample-a/health"
```

Expected response includes:
- `"status": "ready"`
- `"code": "NETWORK_SAMPLE_A_DASHBOARD_HEALTHY"`

## Remote Client Session Validation

Use the dashboard endpoint with key:

```text
http://<PUBLIC_HOST_OR_IP>:4310/admin/network-sample-a/dashboard?key=<ADMIN_KEY>
```

Verify:
- page loads remotely
- metrics endpoint responds remotely
- session/player rows update over time

## Shutdown

From `samples/phase-13/1316/server`:

```bash
docker compose -f docker-compose.remote.yml down
```

This candidate remains single-node by design.
