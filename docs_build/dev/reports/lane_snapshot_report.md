# Lane Snapshot Report

Generated: 2026-06-05T12:42:55.006Z
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
| build-path | INVALIDATED | docs_build/dev/reports/lane_snapshots/build-path.json | e55c4b6606b057c8 | 0a034c67ed94c66f | 751729a1e113a4de | 6c4fac7630b0b6f3 | f54ad8f6e5196b36 | 6d25c5bf0f297b47 | 34a58b5588baff4d | Lane snapshot dependencyGraphHash changed for build-path.; Lane snapshot executionGraphHash changed for build-path.; Lane snapshot inputHash changed for build-path.; Lane snapshot laneDefinitionHash changed for build-path.; Lane snapshot manifestHash changed for build-path.; Lane snapshot snapshotHash changed for build-path.; Lane snapshot warmStartHash changed for build-path. |

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
