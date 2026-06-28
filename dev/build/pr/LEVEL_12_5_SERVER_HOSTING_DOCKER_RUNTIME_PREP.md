# LEVEL_12_5_SERVER_HOSTING_DOCKER_RUNTIME_PREP

## Goal
Prepare an implementation-ready, minimal single-node Docker runtime plan for the authoritative server lane.

## Single-Node Runtime Model

- One container process hosts one authoritative server runtime instance.
- One service port is exposed (default: `4310`).
- One active session id is configured at startup (default: `session-authoritative`).
- No multi-node clustering, no service discovery, no orchestration dependencies.

## Server Lifecycle Contract

Startup:
- parse env config
- initialize authoritative runtime
- bind HTTP/WebSocket service endpoint(s)
- expose readiness endpoint once runtime is active

Shutdown:
- stop accepting new connections
- flush/close active session state cleanly
- stop runtime loop
- close server process with deterministic exit

## Environment Contract (Minimal)

- `AUTHORITATIVE_SERVER_HOST` (default `0.0.0.0`)
- `AUTHORITATIVE_SERVER_PORT` (default `4310`)
- `AUTHORITATIVE_SESSION_ID` (default `session-authoritative`)
- `AUTHORITATIVE_TICK_RATE_HZ` (default `20`)
- `AUTHORITATIVE_LOG_LEVEL` (default `info`)

## Docker Contract (Minimal)

- Dockerfile uses Node runtime image with explicit working directory.
- Container exposes `4310`.
- Healthcheck targets `/health` (or existing compatible health route if retained).
- Compose file defines one service only and maps host port to container port.

## Validation Checklist Targets

- container build succeeds
- runtime starts in container and binds configured host/port
- readiness/health endpoint returns success
- client can connect to running container server
- runtime stops cleanly on shutdown

## Failure Modes To Cover

- invalid env config blocks startup with clear error
- port bind conflict fails fast with explicit log
- health endpoint not ready while runtime uninitialized
- abrupt shutdown leaves active runtime state (must be prevented)

## Scope Guardrails

- single-node only
- no scaling/orchestration
- no gameplay expansion
- no 3D work
