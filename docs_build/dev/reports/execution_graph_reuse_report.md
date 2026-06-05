# Execution Graph Reuse Report

Generated: 2026-06-05T12:42:55.006Z
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
| build-path | INVALIDATED | INVALIDATED | 6d25c5bf0f297b47 | Lane snapshot is part of the selected targeted execution graph. |

## Safeguards

- Execution graph reuse is allowed only when the lane snapshot hash remains valid.
- Stale graph snapshots are invalidated before runtime scheduling.
- Deterministic invalidation does not fall back to broad lane regeneration.
- Reused execution graphs keep targeted lane scope and do not start Workspace/global lanes unless selected.

## Runtime Savings Observations

- Reused snapshots reduce repeated lane graph construction.
- Reused snapshots reduce repeated manifest, helper, fixture, and dependency traversal.
- Reused snapshots reduce repeated targeted scheduling work before Playwright/browser startup.
