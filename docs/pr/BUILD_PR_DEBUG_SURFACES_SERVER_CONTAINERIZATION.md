Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md

# BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION

## Build Intent
This is a docs-only BUILD bundle for Codex to create code and runtime artifacts.
The goal is to add minimal, dev-friendly containerization for the existing network server dashboard/runtime without changing engine core or redesigning the dashboard architecture.

## Important Boundary
- This bundle is documentation/planning only.
- Codex writes code and runtime artifacts.
- Do not treat this BUILD doc as implementation already completed.

## Source Of Truth For Scope
Target the existing Sample A server dashboard/runtime layout already present in the repo:

- `games/network_sample_a/server/networkSampleADashboardServer.mjs`
- `games/network_sample_a/server/`
- `games/network_sample_a/.dockerignore`

The intent is to produce a minimal containerization pass for the existing server runtime, not a redesign.

## One PR Purpose
Server containerization only.

## In Scope Files For Codex To Create/Update
- `games/network_sample_a/server/Dockerfile`
- `games/network_sample_a/.dockerignore`
- `games/network_sample_a/server/docker-compose.yml`
- `games/network_sample_a/server/README.md`
- `games/network_sample_a/server/networkSampleADashboardServer.mjs` only if required for container-safe host/access env support
- `docs/pr/BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`
- `docs/dev/next_command.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/file_tree.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/roadmaps/NETWORK_SAMPLES_PLAN.md` with bracket-only edits only

## Out Of Scope
- engine/core changes
- new server features
- auth redesign
- orchestration platforms
- Kubernetes
- dashboard mutation/admin features
- transport redesign
- server containerization for every network sample
- changes to `docs/roadmaps/BIG_PICTURE_ROADMAP.md` except bracket-only edits if explicitly required
- changes to `docs/roadmaps/PRODUCTIZATION_ROADMAP.md`

## Exact Runtime Assumptions
Use:
- Node 22 Alpine
- server container listens on `4310`
- health endpoint path:
  - `/admin/network-sample-a/health`
- dashboard host env:
  - `NETWORK_SAMPLE_A_DASHBOARD_HOST`
  - `NETWORK_SAMPLE_A_DASHBOARD_PORT`
  - `NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS`
  - `NETWORK_SAMPLE_A_ADMIN_KEY`
  - `NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY`
  - `NETWORK_SAMPLE_A_ALLOW_REMOTE_WITH_KEY`

## Exact Dockerfile Blueprint
Codex should create/update `games/network_sample_a/server/Dockerfile` to match this structure closely:

```dockerfile
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    NETWORK_SAMPLE_A_DASHBOARD_HOST=0.0.0.0 \
    NETWORK_SAMPLE_A_DASHBOARD_PORT=4310 \
    NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS=1000 \
    NETWORK_SAMPLE_A_ADMIN_KEY=sample-a-admin \
    NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY=0 \
    NETWORK_SAMPLE_A_ALLOW_REMOTE_WITH_KEY=1

COPY server/networkSampleADashboardServer.mjs ./server/networkSampleADashboardServer.mjs
COPY game/FakeLoopbackNetworkModel.js ./game/FakeLoopbackNetworkModel.js

EXPOSE 4310

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${NETWORK_SAMPLE_A_DASHBOARD_PORT}/admin/network-sample-a/health" || exit 1

CMD ["node", "server/networkSampleADashboardServer.mjs"]
```

## Exact .dockerignore Blueprint
Codex should create/update `games/network_sample_a/.dockerignore` so the build context stays narrow.
Intent:
- ignore everything by default
- unignore only the server and game files required by the Dockerfile
- keep image build fast and deterministic

Recommended pattern:

```gitignore
*
!server/
!server/networkSampleADashboardServer.mjs
!server/Dockerfile
!server/docker-compose.yml
!server/README.md
!game/
!game/FakeLoopbackNetworkModel.js
```

## Exact docker-compose.yml Blueprint
Codex should create/update `games/network_sample_a/server/docker-compose.yml` to match this structure closely:

```yaml
services:
  network-sample-a-dashboard:
    container_name: network-sample-a-dashboard
    build:
      context: ..
      dockerfile: server/Dockerfile
    ports:
      - "${NETWORK_SAMPLE_A_DASHBOARD_PORT:-4310}:4310"
    environment:
      NETWORK_SAMPLE_A_DASHBOARD_HOST: "0.0.0.0"
      NETWORK_SAMPLE_A_DASHBOARD_PORT: "4310"
      NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS: "${NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS:-1000}"
      NETWORK_SAMPLE_A_ADMIN_KEY: "${NETWORK_SAMPLE_A_ADMIN_KEY:-sample-a-admin}"
      NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY: "${NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY:-0}"
      NETWORK_SAMPLE_A_ALLOW_REMOTE_WITH_KEY: "${NETWORK_SAMPLE_A_ALLOW_REMOTE_WITH_KEY:-1}"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:4310/admin/network-sample-a/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped
```

## README Contract
Codex should create/update `games/network_sample_a/server/README.md` with:
- docker build command
- docker run command
- compose command
- mapped port explanation
- health URL
- env var meanings
- log expectation:
  - stdout/stderr only
  - no extra log system added in this PR

## Server Runtime Adjustment Rule
Touch `networkSampleADashboardServer.mjs` only if needed to support:
- `0.0.0.0` host binding
- remote access only when key-authenticated and explicitly enabled by env
- no route redesign
- no gameplay/runtime mutation
- no dashboard feature expansion

## Roadmap Update Rule
`docs/roadmaps/NETWORK_SAMPLES_PLAN.md` only:
- `Dockerfile for server` -> `[x]`
- `.dockerignore` -> `[x]`
- `Environment variable contract` -> `[x]`
- `Local run command` -> `[x]`
- `Compose-ready service definition` -> `[x]`
- `Port mapping rules` -> `[x]`
- `Health/readiness check` -> `[x]`
- `Logging/output expectations` -> `[x]`
- `Container debug notes` -> `[x]`

No wording changes.
No ordering changes.
No structure changes.

Leave:
- `docs/roadmaps/BIG_PICTURE_ROADMAP.md`
- `docs/roadmaps/PRODUCTIZATION_ROADMAP.md`
unchanged unless there is an existing matching checklist item that only needs bracket-state movement.

## Validation Codex Must Perform
- `node --check games/network_sample_a/server/networkSampleADashboardServer.mjs`
- verify Dockerfile exists and matches the planned runtime contract
- verify compose file exists and uses the expected port/healthcheck
- verify `.dockerignore` constrains context
- verify README contains run/build/health instructions
- if Docker is available:
  - `docker build -f games/network_sample_a/server/Dockerfile games/network_sample_a -t network-sample-a-dashboard`
  - validate container serves `/admin/network-sample-a/health`

## Deliverable
Codex packages:
`<project folder>/tmp/BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION_delta.zip`
