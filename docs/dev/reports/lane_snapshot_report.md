# Lane Snapshot Report

Generated: 2026-05-26T22:17:10.905Z
Status: PASS
Snapshot directory: docs/dev/reports/lane_snapshots

## Summary

Reused lane snapshots: 0
Invalidated snapshots: 1
Generated snapshots: 0
Skipped snapshots: 0
Prevented graph rebuilds: 0
Prevented manifest traversal: 0

## Snapshot Decisions

| Lane | Status | Snapshot Path | Manifest Hash | Dependency Graph Hash | Helper Graph Hash | Fixture Graph Hash | Runtime Config Hash | Execution Graph Hash | Snapshot Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| integration | INVALIDATED | docs/dev/reports/lane_snapshots/integration.json | efd808f21c146e0b | 4138c2ded15059b2 | 5d0248502f5b423f | 91e2dabe792e4939 | 8bad8ffdebb3b5a3 | 012d1831d3650992 | 757a4f84e35d1097 | Lane snapshot executionGraphHash changed for integration.; Lane snapshot inputHash changed for integration.; Lane snapshot manifestHash changed for integration.; Lane snapshot snapshotHash changed for integration.; Lane snapshot warmStartHash changed for integration. |

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
