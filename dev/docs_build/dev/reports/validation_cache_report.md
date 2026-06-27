# Validation Cache Report

Generated: 2026-06-23T16:38:48.297Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 52928e5ef56fae1e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | b766210e324f884f | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 3b6288f10251cb39 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 3f6048ccdda17a8d | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | e24f0d440b1410dc | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | ecc95a2940cc1427 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | d9318e7005141134 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | d9318e7005141134 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 22637e871065d383 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | a80d6a2d403c317b | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 56c385cc0885a49f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | ecc95a2940cc1427 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | ecc95a2940cc1427 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 3b6288f10251cb39 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 3b6288f10251cb39 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 3f6048ccdda17a8d | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 3f6048ccdda17a8d | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | e24f0d440b1410dc | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | e24f0d440b1410dc | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | e24f0d440b1410dc | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | a80d6a2d403c317b | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | a80d6a2d403c317b | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | a80d6a2d403c317b | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | d9318e7005141134 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | d9318e7005141134 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 22637e871065d383 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 22637e871065d383 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 56c385cc0885a49f | zero-browser report output | unchanged within execution cycle |

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
