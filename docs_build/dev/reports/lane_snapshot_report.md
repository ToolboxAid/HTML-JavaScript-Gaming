# Lane Snapshot Report

Generated: 2026-06-16T14:58:25.714Z
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
| workspace-contract | REUSED | docs_build/dev/reports/lane_snapshots/workspace-contract.json | a89f488a7cee69ea | d0f8d32d5beb4ccc | c5de55c1d6721185 | 6c4fac7630b0b6f3 | c99c4343771f1683 | caa1ff2a372119f5 | 2102947c04456dd0 | Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged. |

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
