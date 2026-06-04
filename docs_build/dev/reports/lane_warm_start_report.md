# Lane Warm-Start Report

Generated: 2026-06-04T00:46:26.665Z
Status: PASS
Warm-start directory: docs_build/dev/reports/lane_warm_starts

## Summary

Reused warm-start lanes: 0
Invalidated warm-start states: 1
Generated warm-start states: 0
Skipped warm-start states: 0
Prevented redundant initialization: 0
Prevented lane graph assembly: 0

## Warm-Start Decisions

| Lane | Status | Warm-Start Path | Manifest Hash | Warm-Start Hash | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | INVALIDATED | docs_build/dev/reports/lane_warm_starts/workspace-contract.json | 12a297b310379516 | 537690070f26841e | 0ff8fc92c789456d | Warm-start dependencyGraphHash changed for workspace-contract.; Warm-start dependencyHydrationHash changed for workspace-contract.; Warm-start inputHash changed for workspace-contract.; Warm-start laneDefinitionHash changed for workspace-contract.; Warm-start manifestHash changed for workspace-contract.; Warm-start warmStartHash changed for workspace-contract. |

## Fast-Fail Safeguards

No warm-start blocker findings were found before runtime.

## Invalidation Rules

- Targeted file changes invalidate the owning warm-start state through manifest input hashes.
- Ownership metadata changes invalidate warm-start state before runtime scheduling.
- Dependency graph changes invalidate warm-start state and dependency hydration reuse.
- Helper or fixture placement changes invalidate the affected lane state.
- Lane configuration changes invalidate warm-start state before Playwright launch.
- Warm-start invalidation never expands into broad fallback lane execution.

## Runtime Savings Observations

- Reused warm-start state avoids rebuilding identical lane initialization data.
- Reused state carries validated manifest, ownership, dependency, and hydration hashes into scheduling.
- Generated or invalidated state is refreshed deterministically before runtime and remains scoped to selected lanes.
