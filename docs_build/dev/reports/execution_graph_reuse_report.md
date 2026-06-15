# Execution Graph Reuse Report

Generated: 2026-06-15T22:05:45.153Z
Status: PASS

## Summary

Reused execution graphs: 0
Prevented graph rebuilds: 0
Prevented redundant dependency traversal: 0
Prevented fixture/helper graph assembly: 0
Prevented manifest traversal: 0
Prevented targeted scheduling work: 0

## Execution Graph Decisions

| Lane | Status | Snapshot Status | Execution Graph Hash | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | INVALIDATED | INVALIDATED | 3508516aa90ae6e7 | Lane snapshot is part of the selected targeted execution graph. |

## Safeguards

- Execution graph reuse is allowed only when the lane snapshot hash remains valid.
- Stale graph snapshots are invalidated before runtime scheduling.
- Deterministic invalidation does not fall back to broad lane regeneration.
- Reused execution graphs keep targeted lane scope and do not start Workspace/global lanes unless selected.

## Runtime Savings Observations

- Reused snapshots reduce repeated lane graph construction.
- Reused snapshots reduce repeated manifest, helper, fixture, and dependency traversal.
- Reused snapshots reduce repeated targeted scheduling work before Playwright/browser startup.
