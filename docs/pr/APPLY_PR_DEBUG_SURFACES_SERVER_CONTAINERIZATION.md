Toolbox Aid
David Quesenberry
04/06/2026
APPLY_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md

# APPLY_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION

## Apply Intent
This is a docs-only APPLY bundle for the completed Codex build/output.
Use it to confirm acceptance, validate scope, and finalize the PR cleanly.

## Boundary
- ChatGPT did not write code here.
- Codex already produced the code/runtime delta bundle.
- This APPLY doc is for acceptance, validation, commit discipline, and tracker finalization only.

## Expected Codex Outputs
The completed build should already contain code/runtime artifacts for:

- `games/network_sample_a/server/Dockerfile`
- `games/network_sample_a/.dockerignore`
- `games/network_sample_a/server/docker-compose.yml`
- `games/network_sample_a/server/README.md`
- `games/network_sample_a/server/networkSampleADashboardServer.mjs` only if required for env-safe host/access support

## Acceptance Criteria
Accept this PR only if all of the following are true:

### Container Artifacts
- Dockerfile exists under `games/network_sample_a/server/`
- `.dockerignore` exists under `games/network_sample_a/`
- compose file exists under `games/network_sample_a/server/`
- README exists under `games/network_sample_a/server/`

### Scope Control
- no engine/core files changed
- no dashboard mutation/admin features added
- no transport redesign occurred
- no unrelated sample/game refactors occurred

### Runtime Contract
- container targets the existing Sample A dashboard server runtime
- host/port/env usage matches the BUILD blueprint
- health route remains:
  - `/admin/network-sample-a/health`
- container port contract remains:
  - `4310`

### Documentation Contract
README should contain:
- docker build command
- docker run command
- compose command
- mapped port explanation
- health URL
- env var meanings
- logging expectation (stdout/stderr only)

## Required Validation
### Required checks
- `node --check games/network_sample_a/server/networkSampleADashboardServer.mjs`

### If Docker is available
- `docker build -f games/network_sample_a/server/Dockerfile games/network_sample_a -t network-sample-a-dashboard`
- `docker compose -f games/network_sample_a/server/docker-compose.yml up --build`
- verify:
  - health route responds
  - mapped port is correct
  - container starts without extra runtime changes

## Roadmap Finalization Rule
Only update bracket states.
Do not change wording, ordering, headings, or structure.

### docs/dev/roadmaps/NETWORK_SAMPLES_PLAN.md
Set these to `[x]` if Codex output satisfies acceptance:
- `Dockerfile for server`
- `.dockerignore`
- `Environment variable contract`
- `Local run command`
- `Compose-ready service definition`
- `Port mapping rules`
- `Health/readiness check`
- `Logging/output expectations`
- `Container debug notes`

### docs/dev/roadmaps/BIG_PICTURE_ROADMAP.md
No changes unless there is an existing exact matching item that only needs a bracket-state change.

### docs/dev/roadmaps/PRODUCTIZATION_ROADMAP.md
No changes in this PR.

## Commit Guidance
Commit only after:
- code/runtime outputs are present
- validation passes or acceptable validation notes are documented
- roadmap bracket states are updated surgically only

## Recommended Commit Comment
Apply Sample A server containerization artifacts and finalize Track U checklist states without engine-core changes.
