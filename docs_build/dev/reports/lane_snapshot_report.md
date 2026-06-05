# Lane Snapshot Report

Generated: 2026-06-05T12:10:07.499Z
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
| tool-images | INVALIDATED | docs_build/dev/reports/lane_snapshots/tool-images.json | 2c57bf85d09c8a7d | d2621bf5b088b853 | 751729a1e113a4de | 6c4fac7630b0b6f3 | f500fb1bb952254b | eb160af57e1ec65e | 8d10238a133e16ec | Lane snapshot dependencyGraphHash changed for tool-images.; Lane snapshot executionGraphHash changed for tool-images.; Lane snapshot inputHash changed for tool-images.; Lane snapshot manifestHash changed for tool-images.; Lane snapshot snapshotHash changed for tool-images.; Lane snapshot warmStartHash changed for tool-images. |

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
