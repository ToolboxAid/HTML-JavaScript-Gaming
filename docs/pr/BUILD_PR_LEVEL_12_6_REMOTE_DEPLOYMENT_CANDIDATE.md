# BUILD_PR_LEVEL_12_6_REMOTE_DEPLOYMENT_CANDIDATE

## Purpose
Implement a minimal single-node remote deployment candidate for the authoritative multiplayer server runtime.

## Scope
Primary target files:
- `samples/phase-13/1316/server/REMOTE_DEPLOYMENT.md`
- `samples/phase-13/1316/server/docker-compose.remote.yml`
- `samples/phase-13/1316/server/README.md`
- `docs/pr/LEVEL_12_6_REMOTE_DEPLOYMENT_CANDIDATE_CHECKLIST.md`
- `docs/pr/APPLY_PR_LEVEL_12_6_REMOTE_DEPLOYMENT_CANDIDATE.md`

Allowed nearby reads:
- `samples/phase-13/1316/server/Dockerfile`
- `samples/phase-13/1316/server/docker-compose.yml`
- `samples/phase-13/1316/server/networkSampleADashboardServer.mjs`
- `docs/pr/PLAN_PR_LEVEL_12_6_REMOTE_DEPLOYMENT_CANDIDATE.md`

## Required implementation
- Define one remote hosting target model for a single node.
- Define one externally reachable endpoint contract (host/port/protocol).
- Provide repeatable deployment/run steps for a remote VM/server host.
- Provide a minimal validation sequence proving:
  - remote server is reachable
  - client can connect over internet path
  - authoritative session lifecycle is valid remotely
- Keep all deployment guidance minimal and manual-friendly.

## Acceptance criteria
- Single remote instance can be deployed and started repeatably.
- External endpoint is reachable from outside host network.
- Client connection/session is validated over remote endpoint.
- Steps are documented and reproducible.

## Validation
Run only:
- `node --check samples/phase-13/1316/server/networkSampleADashboardServer.mjs`
- `docker build -f samples/phase-13/1316/server/Dockerfile samples/phase-13/1316 -t authoritative-server-remote-candidate`
- `docker compose -f samples/phase-13/1316/server/docker-compose.remote.yml up --build`
- remote connectivity probe to published endpoint
- client remote-connect session check using existing multiplayer validation path

## Non-goals
- no scaling/orchestration
- no infrastructure automation expansion
- no gameplay expansion
- no 3D work

## Working tree rule
If the tree is already dirty, ignore unrelated files and modify only the scoped files for this PR purpose.
