Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION.md

# BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION

## Build Summary
Prepare a docs-first BUILD bundle for minimal server containerization while preserving the existing debug network/dashboard architecture and avoiding all engine-core changes.

## Workflow Discipline
PLAN_PR -> BUILD_PR -> APPLY_PR

## Scope (Server Containerization Only)
- Dockerfile for server runtime
- .dockerignore for lean container contexts
- compose-ready debug service definition
- environment variable contract
- local run command contract
- port mapping rules
- health/readiness check contract
- logging/output expectations
- container debug notes

## Out Of Scope
- engine core APIs and internals
- dashboard architecture redesign
- network debug architecture redesign
- transport implementation changes
- dashboard write/mutation features
- docker orchestration beyond minimal local debug usage

## Architecture Preservation Rules
- keep dashboard/network debug flows read-only
- do not couple server containerization to console internals
- do not couple server containerization to overlay internals
- preserve existing sample-level integration boundaries

## APPLY Execution Targets
```text
server/
  Dockerfile
  .dockerignore
  docker-compose.debug.yml (or compose-ready equivalent)
```

## Ordered Apply Steps
1. Confirm server start command assumptions.
2. Add Dockerfile and validate image build path.
3. Add .dockerignore tuned for local debug iteration.
4. Add compose-ready service definition for local debug runs.
5. Define environment variable contract and defaults.
6. Define local run command(s) and port mapping rules.
7. Define health/readiness checks for debug orchestration.
8. Define logging/output expectations and debug notes.
9. Run targeted containerization validation checks.
10. Keep roadmap edits bracket-only.

## Validation Targets
- docs-first output is complete for APPLY handoff
- no engine-core files are targeted
- scope remains server containerization only
- dashboard/network debug architecture remains intact
- roadmap tracker edits are bracket-only

## Packaging Target
`<project folder>/tmp/BUILD_PR_DEBUG_SURFACES_SERVER_CONTAINERIZATION_delta.zip`
