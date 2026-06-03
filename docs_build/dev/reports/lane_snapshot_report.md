# Lane Snapshot Report

Generated: 2026-06-03T17:06:31.640Z
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
| workspace-contract | INVALIDATED | docs_build/dev/reports/lane_snapshots/workspace-contract.json | 85496f0e17683ed9 | d8b1f03418e7f315 | 27270481957a2fdd | 6c4fac7630b0b6f3 | c99c4343771f1683 | 00a0b280f943d93d | 6802b9c028f7bbb6 | Lane snapshot commandsHash changed for workspace-contract.; Lane snapshot dependencyGraphHash changed for workspace-contract.; Lane snapshot executionGraphHash changed for workspace-contract.; Lane snapshot fixtureGraphHash changed for workspace-contract.; Lane snapshot helperGraphHash changed for workspace-contract.; Lane snapshot inputHash changed for workspace-contract.; Lane snapshot laneDefinitionHash changed for workspace-contract.; Lane snapshot manifestHash changed for workspace-contract.; Lane snapshot runtimeConfigurationHash changed for workspace-contract.; Lane snapshot snapshotHash changed for workspace-contract.; Lane snapshot warmStartHash changed for workspace-contract. |

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
