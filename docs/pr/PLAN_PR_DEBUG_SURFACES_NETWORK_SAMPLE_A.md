Toolbox Aid
David Quesenberry
04/06/2026
PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A.md

# PLAN_PR_DEBUG_SURFACES_NETWORK_SAMPLE_A

## Goal
Implement Sample A (local loopback / fake network) as a sample-backed validation slice for network debug surfaces.

## Workflow
PLAN_PR -> BUILD_PR -> APPLY_PR

## In Scope
- New sample under `games/network_sample_a/`.
- Synthetic connection lifecycle, RTT, replication, and trace event feed.
- Debug plugin with read-only providers, passive panels, and network command surface.
- Command coverage for:
  - `network.status`
  - `network.latency`
  - `network.trace`
- Docs and reports for this one PR purpose.

## Out Of Scope
- Real transport/protocol networking.
- Engine core API changes.
- Host/client multiplayer behavior (Sample B).
- Divergence deep-dive and explainers (Sample C).

## Acceptance Criteria
- Sample A opens and runs in browser.
- Synthetic network state is visible in overlay panels.
- `network.status`, `network.latency`, and `network.trace` execute through the dev console.
- No engine-core files are modified.
