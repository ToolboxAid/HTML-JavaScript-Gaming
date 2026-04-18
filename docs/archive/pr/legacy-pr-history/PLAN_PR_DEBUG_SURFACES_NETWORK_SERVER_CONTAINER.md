Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_CONTAINER

## Goal
Implement Track U with minimal, dev-friendly containerization for the existing Sample A network server dashboard.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- server Dockerfile
- .dockerignore for reduced build context
- environment variable contract for container run
- local run instructions
- port mapping rules for dashboard access
- health/readiness check integration
- logging output expectations
- optional compose-ready service definition

## Out Of Scope
- orchestration platforms (k8s, swarm)
- authentication hardening beyond existing debug/admin gate
- engine changes
- dashboard feature expansion

## Contract
- Containerization remains server-owned under `games/network_sample_a`.
- Runtime remains read-only diagnostics and uses existing Sample A fake network source.
- No changes to game engine boundaries.
- Container defaults must remain compatible with existing dashboard routes.

## Acceptance Criteria
- Dockerfile builds and starts dashboard server.
- Port mapping exposes dashboard and metrics routes.
- Health endpoint works in container and supports readiness checks.
- Environment variables are documented and supported.
- Optional compose example is provided.
- Track U checklist items in `docs/dev/NETWORK_SAMPLES_PLAN.md` move to `[.]` or `[x]`.
- `docs/operations/dev/BIG_PICTURE_ROADMAP.md` remains unchanged.
