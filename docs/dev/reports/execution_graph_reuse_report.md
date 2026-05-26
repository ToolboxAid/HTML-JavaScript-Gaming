# Execution Graph Reuse Report

Generated: 2026-05-26T20:47:41.393Z
Status: PASS

## Summary

Reused execution graphs: 4
Prevented graph rebuilds: 4
Prevented redundant dependency traversal: 4
Prevented fixture/helper graph assembly: 17
Prevented manifest traversal: 4
Prevented targeted scheduling work: 4

## Execution Graph Decisions

| Lane | Status | Snapshot Status | Execution Graph Hash | Reason |
| --- | --- | --- | --- | --- |
| tool-runtime | REUSED | REUSED | efa4203683589f08 | Lane snapshot is part of the selected targeted execution graph. |
| game-runtime | REUSED | REUSED | 9bc2253407c5b3be | Lane snapshot is part of the selected targeted execution graph. |
| integration | REUSED | REUSED | c6571bb72b5f91c9 | Lane snapshot is part of the selected targeted execution graph. |
| engine-src | REUSED | REUSED | ec4e15969f9cbbcb | Lane snapshot is part of the selected targeted execution graph. |

## Safeguards

- Execution graph reuse is allowed only when the lane snapshot hash remains valid.
- Stale graph snapshots are invalidated before runtime scheduling.
- Deterministic invalidation does not fall back to broad lane regeneration.
- Reused execution graphs keep targeted lane scope and do not start Workspace/global lanes unless selected.

## Runtime Savings Observations

- Reused snapshots reduce repeated lane graph construction.
- Reused snapshots reduce repeated manifest, helper, fixture, and dependency traversal.
- Reused snapshots reduce repeated targeted scheduling work before Playwright/browser startup.
