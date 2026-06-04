# Lane Snapshot Report

Generated: 2026-06-04T02:37:31.281Z
Status: PASS
Snapshot directory: docs_build/dev/reports/lane_snapshots

## Summary

Reused lane snapshots: 1
Invalidated snapshots: 0
Generated snapshots: 0
Skipped snapshots: 0
Prevented graph rebuilds: 1
Prevented manifest traversal: 1

## Snapshot Decisions

| Lane | Status | Snapshot Path | Manifest Hash | Dependency Graph Hash | Helper Graph Hash | Fixture Graph Hash | Runtime Config Hash | Execution Graph Hash | Snapshot Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | REUSED | docs_build/dev/reports/lane_snapshots/workspace-contract.json | 12a297b310379516 | 37a0b0722df16a80 | 751729a1e113a4de | 6c4fac7630b0b6f3 | c99c4343771f1683 | 99a754ff31ffa25d | 02f6583ae5b6b5f2 | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |

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
