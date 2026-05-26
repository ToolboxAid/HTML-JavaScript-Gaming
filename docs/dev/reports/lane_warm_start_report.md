# Lane Warm-Start Report

Generated: 2026-05-26T21:43:06.649Z
Status: PASS
Warm-start directory: docs/dev/reports/lane_warm_starts

## Summary

Reused warm-start lanes: 4
Invalidated warm-start states: 0
Generated warm-start states: 0
Skipped warm-start states: 0
Prevented redundant initialization: 4
Prevented lane graph assembly: 4

## Warm-Start Decisions

| Lane | Status | Warm-Start Path | Manifest Hash | Warm-Start Hash | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| tool-runtime | REUSED | docs/dev/reports/lane_warm_starts/tool-runtime.json | ade0c4104a98fa3b | db19ac3f04972bd7 | 0fecfc07e559cf38 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |
| game-runtime | REUSED | docs/dev/reports/lane_warm_starts/game-runtime.json | 5e04fc3c8d91a8c5 | 8a55ecd63cffd42d | 1e6d53ee82652bb2 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |
| integration | REUSED | docs/dev/reports/lane_warm_starts/integration.json | 892306a4a4fbec1d | 6838e26e1923b9f0 | a26bcd0115fc4315 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |
| engine-src | REUSED | docs/dev/reports/lane_warm_starts/engine-src.json | b08a629e4c7cb2e0 | 1d5c02f193ae21af | e13166ce3ced2d3e | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |

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
