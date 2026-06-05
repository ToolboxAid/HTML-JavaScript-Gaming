# Lane Snapshot Report

Generated: 2026-06-05T00:18:28.234Z
Status: PASS
Snapshot directory: docs_build/dev/reports/lane_snapshots

## Summary

Reused lane snapshots: 0
Invalidated snapshots: 0
Generated snapshots: 1
Skipped snapshots: 0
Prevented graph rebuilds: 0
Prevented manifest traversal: 0

## Snapshot Decisions

| Lane | Status | Snapshot Path | Manifest Hash | Dependency Graph Hash | Helper Graph Hash | Fixture Graph Hash | Runtime Config Hash | Execution Graph Hash | Snapshot Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| game-design | GENERATED | docs_build/dev/reports/lane_snapshots/game-design.json | c91e3e832a8647ab | 37a0b0722df16a80 | 751729a1e113a4de | 6c4fac7630b0b6f3 | 3171f9ce5e0dd545 | c237663bdf259252 | 7a900c43213c8328 | No prior lane snapshot existed for this lane. |

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
