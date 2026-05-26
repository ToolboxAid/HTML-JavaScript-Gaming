# Lane Snapshot Report

Generated: 2026-05-26T21:43:06.649Z
Status: PASS
Snapshot directory: docs/dev/reports/lane_snapshots

## Summary

Reused lane snapshots: 4
Invalidated snapshots: 0
Generated snapshots: 0
Skipped snapshots: 0
Prevented graph rebuilds: 4
Prevented manifest traversal: 4

## Snapshot Decisions

| Lane | Status | Snapshot Path | Manifest Hash | Dependency Graph Hash | Helper Graph Hash | Fixture Graph Hash | Runtime Config Hash | Execution Graph Hash | Snapshot Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tool-runtime | REUSED | docs/dev/reports/lane_snapshots/tool-runtime.json | ade0c4104a98fa3b | 4138c2ded15059b2 | 5d0248502f5b423f | f63ae1a798603720 | 7a0a9a302518f369 | 874a857202c9ded7 | f0f801c0c650e56e | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |
| game-runtime | REUSED | docs/dev/reports/lane_snapshots/game-runtime.json | 5e04fc3c8d91a8c5 | e6ec9fe53535987b | 0f54d667e883cc0a | bb607c38074f2cdd | 4c01fb575076779d | a136448e2634d746 | 7915086503c9249e | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |
| integration | REUSED | docs/dev/reports/lane_snapshots/integration.json | 892306a4a4fbec1d | 4138c2ded15059b2 | 5d0248502f5b423f | 91e2dabe792e4939 | 60dbdcfefd3273f2 | e153f8b8ef5da4c7 | a20255e58ca73fd2 | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |
| engine-src | REUSED | docs/dev/reports/lane_snapshots/engine-src.json | b08a629e4c7cb2e0 | e2570ebce03c46e3 | 9a3856cec31b7349 | 6c4fac7630b0b6f3 | bdd9bad8af92ade1 | 2ef0b65a0694c012 | b6231833fe69e407 | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |

## Snapshot Validation Findings

No stale graph reuse or snapshot validation blockers were found.

## Invalidation Rules

- Targeted file changes invalidate the owning lane snapshot through manifest input hashes.
- Dependency graph changes invalidate the owning lane snapshot.
- Helper or fixture ownership changes invalidate snapshots that include those graph inputs.
- Lane configuration changes invalidate runtime configuration hashes.
- Runtime configuration changes invalidate execution graph hashes.
- Snapshot invalidation never triggers fallback broad lane regeneration.

## Runtime Savings Observations

- Reused snapshots avoid rebuilding identical targeted lane graphs.
- Snapshot reuse carries lane ownership, manifest, dependency, fixture, helper, and runtime configuration hashes into scheduling.
- Stale snapshots are regenerated deterministically before Playwright/browser launch.
