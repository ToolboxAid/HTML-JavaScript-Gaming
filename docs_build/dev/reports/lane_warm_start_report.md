# Lane Warm-Start Report

Generated: 2026-06-13T22:40:08.238Z
Status: PASS
Warm-start directory: docs_build/dev/reports/lane_warm_starts

## Summary

Reused warm-start lanes: 1
Invalidated warm-start states: 0
Generated warm-start states: 0
Skipped warm-start states: 0
Prevented redundant initialization: 1
Prevented lane graph assembly: 1

## Warm-Start Decisions

| Lane | Status | Warm-Start Path | Manifest Hash | Warm-Start Hash | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | REUSED | docs_build/dev/reports/lane_warm_starts/workspace-contract.json | 68ccdaa4b17bb4a9 | ba46847643854f32 | 902e676dd27366e9 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |

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
