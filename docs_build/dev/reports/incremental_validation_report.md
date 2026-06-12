# Incremental Validation Report

Generated: 2026-06-12T15:50:41.571Z
Status: PASS

## Reuse Summary

Reused manifests: 0
Invalidated manifests: 1
Generated manifests: 0
Skipped manifests: 0
Prevented lane regeneration: 0
Prevented discovery scans: 0
Prevented helper resolution passes: 0
Prevented fixture resolution passes: 0

## Incremental Decisions

| Lane | Decision | Invalidated By | Runtime Savings Observation |
| --- | --- | --- | --- |
| workspace-contract | INVALIDATED | Persistent manifest dependency graph hash changed for workspace-contract.; Persistent manifest input hash changed for workspace-contract.; Persistent manifest hash changed for workspace-contract. | Manifest was regenerated or skipped; no reuse savings for this lane. |

## Invalidation Rules

- Helper ownership or file hash changes invalidate only manifests that list the helper.
- Fixture ownership or file hash changes invalidate only manifests that list the fixture.
- Dependency graph hash changes invalidate the owning lane manifest.
- Lane definition hash changes invalidate persisted lane manifests before runtime.
- Targeted test file hash changes invalidate the owning lane manifest.

## Runtime Savings Observations

- Fresh persisted manifests avoid repeated lane graph generation.
- Fresh persisted manifests avoid repeated helper and fixture resolution.
- Fresh persisted manifests avoid repeated ownership scans outside explicit manifest inputs.
- Incremental validation remains deterministic and does not use project JSON, toolState, localStorage, sessionStorage, or repo tmp/.
