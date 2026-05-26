# Validation Cache Report

Generated: 2026-05-26T21:15:52.426Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | bc8e9b6fdbdb9a1e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | e654f5d1f9773003 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 1c20197981d25803 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | f09ab9de7bb94c2f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 85aa640b2b6dbc3c | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 837ea22d64ccfee2 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 8114aeae615a6e58 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 8114aeae615a6e58 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 1acd5b0a029d3d60 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 929e822af73f4ad1 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 436837a452b1267e | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 837ea22d64ccfee2 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 837ea22d64ccfee2 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 1c20197981d25803 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 1c20197981d25803 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | f09ab9de7bb94c2f | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | f09ab9de7bb94c2f | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 85aa640b2b6dbc3c | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 85aa640b2b6dbc3c | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 85aa640b2b6dbc3c | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 929e822af73f4ad1 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 929e822af73f4ad1 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 929e822af73f4ad1 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 8114aeae615a6e58 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 8114aeae615a6e58 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 1acd5b0a029d3d60 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 1acd5b0a029d3d60 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 436837a452b1267e | zero-browser report output | unchanged within execution cycle |

## Deterministic Invalidation Rules

- Lane definitions change: lane registration, runner preflight, lane compilation, dependency validation, and scheduling caches invalidate.
- Fixture ownership changes: structural ownership, runner preflight, and affected persisted lane manifests invalidate.
- Helper/import graph changes: structural ownership validation and affected persisted lane manifests invalidate.
- Targeted files change: runner preflight, lane compilation, and owning persisted lane manifests invalidate.
- Dependency graph changes: dependency validation and runtime scheduling caches invalidate.

## Runtime Savings Observations

- Structural ownership validation is computed once per runner invocation and reused by static and zero-browser reporting.
- Fresh persistent lane manifests reuse prior helper, fixture, import, and ownership resolution.
- Lane compilation is computed once and reused by dependency gating, runtime scheduling, and reports.
- Dependency validation is computed once and reused by zero-browser preflight, runtime scheduling, and reports.
- No persistent validation cache is written to project JSON, toolState, localStorage, or sessionStorage.
