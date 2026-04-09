Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_B

## Goal
Implement Sample B host/client diagnostics as a sample-driven, read-only debug surface integration with no real networking and no engine changes.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- simulate host/client roles with multiple peers
- extend sample provider data for peer snapshots
- overlay panels:
  - host status
  - client status
  - ownership / authority
  - replication snapshots
- commands:
  - network.connections
  - network.replication
- integrate under `games/network_sample_b`
- add Sample B entry to `games/index.html` under Level 11
- update Track O checklist in `docs/dev/NETWORK_SAMPLES_PLAN.md`

## Out Of Scope
- real networking sockets/WebRTC
- src/engine/core API changes
- server/dashboard changes

## Contracts
- sample-owned implementation only (`games/network_sample_b`)
- debug surfaces remain read-only and diagnostic
- command outputs are deterministic and operator-readable
- Sample A patterns are reused for boot flow and plugin structure

## Acceptance Criteria
- Sample B opens and runs from `/games/network_sample_b/index.html`
- host/client diagnostic panels render via existing debug surface runtime
- `network.connections` command returns peer connection summary + per-peer lines
- `network.replication` command returns host/client replication snapshot lines
- Level 11 in `games/index.html` includes Sample B card and links
- Track O items updated to `[.]` or `[x]`
- `BIG_PICTURE_ROADMAP.md` unchanged unless explicitly validated for optional updates
