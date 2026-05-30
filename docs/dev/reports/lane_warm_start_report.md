# Lane Warm-Start Report

Generated: 2026-05-30T05:14:50.401Z
Status: PASS
Warm-start directory: docs/dev/reports/lane_warm_starts

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
| workspace-contract | REUSED | docs/dev/reports/lane_warm_starts/workspace-contract.json | 609f65144d9891aa | 008ea1076fee8ae4 | 57d5580a00e01e26 | Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged. |

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
