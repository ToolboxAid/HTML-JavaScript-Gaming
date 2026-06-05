# Validation Cache Report

Generated: 2026-06-05T12:10:07.501Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | e6ced56ab1241c6f | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 8a3a106924a40792 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 1bde88ec0c13de8a | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 5a03c116512e2ce1 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | e6c3d95c8187e702 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 654c4e5563d3ffff | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 35a8dd9455e4a151 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 35a8dd9455e4a151 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 06855c7a5d5afa4f | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 64fc9d303d897bab | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 68e3e847d7540089 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 654c4e5563d3ffff | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 654c4e5563d3ffff | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 1bde88ec0c13de8a | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 1bde88ec0c13de8a | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 5a03c116512e2ce1 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 5a03c116512e2ce1 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | e6c3d95c8187e702 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | e6c3d95c8187e702 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | e6c3d95c8187e702 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 64fc9d303d897bab | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 64fc9d303d897bab | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 64fc9d303d897bab | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 35a8dd9455e4a151 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 35a8dd9455e4a151 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 06855c7a5d5afa4f | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 06855c7a5d5afa4f | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 68e3e847d7540089 | zero-browser report output | unchanged within execution cycle |

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
