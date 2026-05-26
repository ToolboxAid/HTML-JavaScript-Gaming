# Lane Snapshot Report

Generated: 2026-05-26T20:47:41.393Z
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
| tool-runtime | REUSED | docs/dev/reports/lane_snapshots/tool-runtime.json | 999cd821c911cac6 | 4138c2ded15059b2 | 5d0248502f5b423f | f63ae1a798603720 | 7a0a9a302518f369 | efa4203683589f08 | 9728d55b200c23d2 | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |
| game-runtime | REUSED | docs/dev/reports/lane_snapshots/game-runtime.json | 6b3ea783bd50d09f | e6ec9fe53535987b | 0f54d667e883cc0a | bb607c38074f2cdd | 4c01fb575076779d | 9bc2253407c5b3be | 17990e72f99b3584 | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |
| integration | REUSED | docs/dev/reports/lane_snapshots/integration.json | a0a414fdcda4d881 | 4138c2ded15059b2 | 5d0248502f5b423f | 91e2dabe792e4939 | 60dbdcfefd3273f2 | c6571bb72b5f91c9 | a353b05f6923ff87 | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |
| engine-src | REUSED | docs/dev/reports/lane_snapshots/engine-src.json | 4b09c904c7f073c7 | e2570ebce03c46e3 | 9a3856cec31b7349 | 6c4fac7630b0b6f3 | bdd9bad8af92ade1 | ec4e15969f9cbbcb | 7d6eb29ee4ba4d7c | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |

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
