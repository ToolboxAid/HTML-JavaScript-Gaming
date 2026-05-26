# Lane Warm-Start Report

Generated: 2026-05-26T22:55:37.501Z
Status: PASS
Warm-start directory: docs/dev/reports/lane_warm_starts

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
| engine-src | INVALIDATED | docs/dev/reports/lane_warm_starts/engine-src.json | 1b10dc27feffaf1f | 6b309bdb058e4269 | e13166ce3ced2d3e | Warm-start inputHash changed for engine-src.; Warm-start laneDefinitionHash changed for engine-src.; Warm-start manifestHash changed for engine-src.; Warm-start warmStartHash changed for engine-src. |

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
