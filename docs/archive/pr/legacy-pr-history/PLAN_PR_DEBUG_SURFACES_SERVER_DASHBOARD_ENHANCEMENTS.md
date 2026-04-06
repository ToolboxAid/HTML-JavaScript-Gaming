Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ENHANCEMENTS.md

# PLAN_PR_DEBUG_SURFACES_SERVER_DASHBOARD_ENHANCEMENTS

## Purpose
Define the next docs-first expansion of the server dashboard after the foundation pass while preserving strict read-only behavior and sample-level ownership.

## Workflow Discipline
PLAN_PR -> BUILD_PR -> APPLY_PR

## Scope
Extend server dashboard capabilities under `tools/dev/server-dashboard` with richer read-only views and explicit refresh/access rules.

## In Scope
- player statistics view
- latency view
- RX bytes view
- TX bytes view
- connection/session counts
- per-player status rows
- refresh/update strategy
- debug-only access rules
- sample-level integration only

## Out of Scope
- engine core changes
- dashboard runtime write controls
- command execution from dashboard surface
- coupling to console internals
- coupling to overlay internals
- persistence/sorting/filtering UX expansion
- containerization and deployment work

## Architectural Rules
- dashboard remains an independent debug surface
- providers are read-only and normalize data only
- host owns refresh cadence (not renderer)
- renderer consumes normalized snapshots only
- registry controls deterministic section ordering
- integration stays sample-level

## Validation Goals
- all enhancement views are represented in dashboard contracts
- refresh cadence is deterministic and bounded
- debug-only access rules are explicitly defined
- no runtime mutation paths are introduced
- console and overlay continue to function independently of dashboard internals
