# Execution Graph Reuse Report

Generated: 2026-05-26T21:43:06.649Z
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
| tool-runtime | REUSED | REUSED | 874a857202c9ded7 | Lane snapshot is part of the selected targeted execution graph. |
| game-runtime | REUSED | REUSED | a136448e2634d746 | Lane snapshot is part of the selected targeted execution graph. |
| integration | REUSED | REUSED | e153f8b8ef5da4c7 | Lane snapshot is part of the selected targeted execution graph. |
| engine-src | REUSED | REUSED | 2ef0b65a0694c012 | Lane snapshot is part of the selected targeted execution graph. |

## Safeguards

- Execution graph reuse is allowed only when the lane snapshot hash remains valid.
- Stale graph snapshots are invalidated before runtime scheduling.
- Deterministic invalidation does not fall back to broad lane regeneration.
- Reused execution graphs keep targeted lane scope and do not start Workspace/global lanes unless selected.

## Runtime Savings Observations

- Reused snapshots reduce repeated lane graph construction.
- Reused snapshots reduce repeated manifest, helper, fixture, and dependency traversal.
- Reused snapshots reduce repeated targeted scheduling work before Playwright/browser startup.
