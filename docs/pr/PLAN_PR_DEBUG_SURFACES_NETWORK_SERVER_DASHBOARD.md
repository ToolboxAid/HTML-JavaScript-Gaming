Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_SERVER_DASHBOARD

## Goal
Implement Track T (Server Dashboard) with a lightweight, server-owned, polling-based observability surface backed by Sample A fake network data.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- server-owned dashboard endpoint/page
- read-only metrics endpoint
- metrics coverage:
  - player/session count
  - connection state
  - latency per player + summary
  - RX bytes
  - TX bytes
- integration with Sample A fake network provider/model
- polling refresh (no websocket requirement)
- debug/admin-only access gate
- reusable dashboard structure for future real networking

## Out Of Scope
- databases
- full authentication/authorization systems
- engine changes
- containerization (Track U)

## Architecture Contract
- ownership stays under `games/network_sample_a/server`
- server imports and reuses `FakeLoopbackNetworkModel`
- dashboard reads from server API only (no engine coupling)
- all telemetry is diagnostic and read-only

## Acceptance Criteria
- dashboard route renders in browser when authorized
- metrics API returns expected JSON shape
- polling updates dashboard without websocket
- Sample A browser game remains functional and unchanged
- Track T checklist items updated to `[.]` or `[x]`
- `BIG_PICTURE_ROADMAP.md` unchanged
