# BUILD_PR_LEVEL_12_5_SERVER_HOSTING_DOCKER_RUNTIME

## Purpose
Implement a minimal single-node Docker runtime for the authoritative multiplayer server path with repeatable startup/shutdown validation.

## Scope
Primary target files:
- `samples/phase-13/1316/server/authoritativeMultiplayerServer.mjs`
- `samples/phase-13/1316/server/Dockerfile`
- `samples/phase-13/1316/server/docker-compose.yml`
- `samples/phase-13/1316/server/README.md`
- `docs/pr/LEVEL_12_5_SERVER_HOSTING_DOCKER_RUNTIME_CHECKLIST.md`
- `docs/pr/APPLY_PR_LEVEL_12_5_SERVER_HOSTING_DOCKER_RUNTIME.md`

Allowed nearby reads:
- `src/engine/network/AuthoritativeServerRuntime.js`
- `src/engine/network/ClientReplicationApplicationLayer.js`
- `tests/final/MultiplayerNetworkingStack.test.mjs`
- `samples/phase-13/1316/server/networkSampleADashboardServer.mjs`

## Required implementation
- Add one Node server entrypoint that hosts the authoritative runtime in single-node mode.
- Keep Docker runtime single-node only:
  - one container
  - one exposed service port
  - no orchestration, no horizontal scaling
- Define env-driven runtime configuration for:
  - bind host
  - service port
  - session id
  - tick rate
  - optional admin/health key contract (if required by existing server pattern)
- Provide startup/shutdown lifecycle behavior:
  - startup initializes authoritative runtime and begins accepting client/session interaction
  - shutdown stops runtime cleanly and exits without residual state
- Provide container health/readiness endpoint and document commands.

## Acceptance criteria
- Containerized server starts in single-node mode.
- Client can connect to containerized server session path.
- Session lifecycle is valid through startup, active session, and shutdown.
- Startup/run/stop instructions are documented and repeatable.
- Scope remains minimal; no scaling/orchestration features added.

## Validation
Run only:
- `node --check samples/phase-13/1316/server/authoritativeMultiplayerServer.mjs`
- `docker build -f samples/phase-13/1316/server/Dockerfile samples/phase-13/1316 -t authoritative-server-single-node`
- `docker run --rm -p 4310:4310 authoritative-server-single-node`
- `docker compose -f samples/phase-13/1316/server/docker-compose.yml up --build`
- `node --input-type=module -e "import('./tests/final/MultiplayerNetworkingStack.test.mjs').then(async ({ run }) => { await run(); console.log('PASS MultiplayerNetworkingStack'); })"`

## Non-goals
- no cloud deployment expansion
- no Kubernetes/orchestration layer
- no horizontal scaling
- no gameplay expansion
- no 3D work
- no broad debug/tool expansion

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped files for this PR purpose.
