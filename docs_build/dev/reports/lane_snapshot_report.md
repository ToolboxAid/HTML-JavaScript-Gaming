# Lane Snapshot Report

Generated: 2026-06-05T01:16:23.999Z
Status: PASS
Snapshot directory: docs_build/dev/reports/lane_snapshots

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
| tool-navigation | INVALIDATED | docs_build/dev/reports/lane_snapshots/tool-navigation.json | 83c1caf61eccec49 | 3d7cf28d3be765eb | 751729a1e113a4de | 6c4fac7630b0b6f3 | cc7795a6bc1b2d9e | bfb37d857f4805dd | b19b139e025145fa | Lane snapshot executionGraphHash changed for tool-navigation.; Lane snapshot inputHash changed for tool-navigation.; Lane snapshot manifestHash changed for tool-navigation.; Lane snapshot snapshotHash changed for tool-navigation.; Lane snapshot warmStartHash changed for tool-navigation. |

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
