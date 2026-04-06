Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_OPS.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_OPS

## Goal
Extend network support planning with two new tracks:
- Track T - Server Dashboard
- Track U - Server Containerization

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- Define the planning contract for server operations inside the network debug support stream.
- Add Track T and Track U checklist sections in `docs/dev/NETWORK_SAMPLES_PLAN.md`.
- Keep all work docs-first and checklist-driven.

## Out Of Scope
- Engine-core code changes.
- Runtime multiplayer implementation.
- Protocol-specific transport implementation.
- Unrelated roadmap edits.

## Track T - Server Dashboard (Planning Contract)
Define a dashboard track that includes:
- server dashboard shell
- player statistics view
- latency view
- RX/TX byte visibility
- connection and session counts
- per-player status rows
- refresh/update strategy
- debug-only access rules

## Track U - Server Containerization (Planning Contract)
Define a containerization track that includes:
- Dockerfile
- .dockerignore
- environment variable contract
- local run command
- compose-ready service definition
- port mapping rules
- health/readiness check
- logging/output expectations
- container debug notes

## Acceptance Criteria
- Track T exists in NETWORK_SAMPLES_PLAN with checklist states.
- Track U exists in NETWORK_SAMPLES_PLAN with checklist states.
- Checklist style remains `[ ]`, `[.]`, `[x]`.
- No engine-core or unrelated roadmap changes.
