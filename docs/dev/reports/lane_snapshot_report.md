# Lane Snapshot Report

Generated: 2026-05-26T22:55:37.502Z
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
| engine-src | INVALIDATED | docs/dev/reports/lane_snapshots/engine-src.json | 1b10dc27feffaf1f | e2570ebce03c46e3 | 9a3856cec31b7349 | 6c4fac7630b0b6f3 | bdd9bad8af92ade1 | 390a3c57c1ad187d | 92a9ebc45b923c62 | Lane snapshot executionGraphHash changed for engine-src.; Lane snapshot inputHash changed for engine-src.; Lane snapshot laneDefinitionHash changed for engine-src.; Lane snapshot manifestHash changed for engine-src.; Lane snapshot snapshotHash changed for engine-src.; Lane snapshot warmStartHash changed for engine-src. |

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
