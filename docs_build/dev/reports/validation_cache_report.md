# Validation Cache Report

Generated: 2026-06-11T16:58:29.580Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 87b851f82e9b662e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 7835881cd4bea608 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | e459ea4690c478fe | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 99af36471c727b93 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 41b095c5c99db584 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 7282e0eb745131d0 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 7c7efc93199d6352 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 7c7efc93199d6352 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 1dbe6471c10ffcf3 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | e8b8267c1f28c7d3 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 263e107dfaea4b74 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 7282e0eb745131d0 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 7282e0eb745131d0 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | e459ea4690c478fe | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | e459ea4690c478fe | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 99af36471c727b93 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 99af36471c727b93 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 41b095c5c99db584 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 41b095c5c99db584 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 41b095c5c99db584 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | e8b8267c1f28c7d3 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | e8b8267c1f28c7d3 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | e8b8267c1f28c7d3 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 7c7efc93199d6352 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 7c7efc93199d6352 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 1dbe6471c10ffcf3 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 1dbe6471c10ffcf3 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 263e107dfaea4b74 | zero-browser report output | unchanged within execution cycle |

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
