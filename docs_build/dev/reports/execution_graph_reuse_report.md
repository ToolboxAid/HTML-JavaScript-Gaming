# Execution Graph Reuse Report

Generated: 2026-06-12T16:15:03.558Z
Status: PASS

## Summary

Reused execution graphs: 1
Prevented graph rebuilds: 1
Prevented redundant dependency traversal: 1
Prevented fixture/helper graph assembly: 4
Prevented manifest traversal: 1
Prevented targeted scheduling work: 1

## Execution Graph Decisions

| Lane | Status | Snapshot Status | Execution Graph Hash | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | REUSED | REUSED | 47ce54aa275bb703 | Lane snapshot is part of the selected targeted execution graph. |

## Safeguards

- Execution graph reuse is allowed only when the lane snapshot hash remains valid.
- Stale graph snapshots are invalidated before runtime scheduling.
- Deterministic invalidation does not fall back to broad lane regeneration.
- Reused execution graphs keep targeted lane scope and do not start Workspace/global lanes unless selected.

## Runtime Savings Observations

- Reused snapshots reduce repeated lane graph construction.
- Reused snapshots reduce repeated manifest, helper, fixture, and dependency traversal.
- Reused snapshots reduce repeated targeted scheduling work before Playwright/browser startup.
