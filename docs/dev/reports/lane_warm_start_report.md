# Lane Warm-Start Report

Generated: 2026-05-26T20:22:17.979Z
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
| tool-runtime | REUSED | docs/dev/reports/lane_warm_starts/tool-runtime.json | 999cd821c911cac6 | d09c1b2843983b2b | 0fecfc07e559cf38 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |
| game-runtime | REUSED | docs/dev/reports/lane_warm_starts/game-runtime.json | 6b3ea783bd50d09f | 7df2baeee535208f | 1e6d53ee82652bb2 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |
| integration | REUSED | docs/dev/reports/lane_warm_starts/integration.json | a0a414fdcda4d881 | d847a2b8545945e9 | a26bcd0115fc4315 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |
| engine-src | REUSED | docs/dev/reports/lane_warm_starts/engine-src.json | 4b09c904c7f073c7 | 3e467919ebe3d492 | e13166ce3ced2d3e | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |

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
