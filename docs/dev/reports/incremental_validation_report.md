# Incremental Validation Report

Generated: 2026-05-26T21:43:06.650Z
Status: PASS

## Reuse Summary

Reused manifests: 4
Invalidated manifests: 0
Generated manifests: 0
Skipped manifests: 0
Prevented lane regeneration: 4
Prevented discovery scans: 4
Prevented helper resolution passes: 11
Prevented fixture resolution passes: 6

## Incremental Decisions

| Lane | Decision | Invalidated By | Runtime Savings Observation |
| --- | --- | --- | --- |
| tool-runtime | REUSED | unchanged inputs | Reused 3 test input(s), 4 helper(s), and 4 fixture(s). |
| game-runtime | REUSED | unchanged inputs | Reused 4 test input(s), 3 helper(s), and 1 fixture(s). |
| integration | REUSED | unchanged inputs | Reused 1 test input(s), 4 helper(s), and 1 fixture(s). |
| engine-src | REUSED | unchanged inputs | Reused 11 test input(s), 0 helper(s), and 0 fixture(s). |

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
