Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER.md

# APPLY_PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER

## Apply Scope
Apply Track U containerization changes for the Sample A server dashboard only.

## In Scope Files
- `games/network_sample_a/server/Dockerfile`
- `games/network_sample_a/.dockerignore`
- `games/network_sample_a/server/docker-compose.yml`
- `games/network_sample_a/server/networkSampleADashboardServer.mjs`
- `games/network_sample_a/server/README.md`
- `docs/pr/PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER.md`
- `docs/pr/BUILD_PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER.md`
- `docs/pr/APPLY_PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER.md`
- `docs/dev/NETWORK_SAMPLES_PLAN.md` (Track U bracket updates)
- docs/dev control/report files for this bundle

## Validation
- Node syntax check passes for modified server script.
- Docker artifacts exist and are correctly wired (Dockerfile, compose, .dockerignore).
- Local server run remains functional.
- If Docker is available, image build and container health/route checks pass.
- Track U items are updated to `[.]` or `[x]`.
- `BIG_PICTURE_ROADMAP.md` remains unchanged.

## Output
`<project folder>/tmp/PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER_FULL_bundle.zip`
