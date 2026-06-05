# Validation Cache Report

Generated: 2026-06-05T12:42:55.008Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | e6ced56ab1241c6f | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 041ef72ec1c7b25c | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | cbe186f0421aa2be | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 6a652150079fd59d | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 460f255ef5f98a15 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 1c2bffa090536d5e | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 4e40841678f2cabb | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 4e40841678f2cabb | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 391f0ffe7dea427d | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | a354f182e018d822 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 68e3e847d7540089 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 1c2bffa090536d5e | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 1c2bffa090536d5e | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | cbe186f0421aa2be | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | cbe186f0421aa2be | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 6a652150079fd59d | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 6a652150079fd59d | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 460f255ef5f98a15 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 460f255ef5f98a15 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 460f255ef5f98a15 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | a354f182e018d822 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | a354f182e018d822 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | a354f182e018d822 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 4e40841678f2cabb | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 4e40841678f2cabb | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 391f0ffe7dea427d | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 391f0ffe7dea427d | runtime scheduling | unchanged within execution cycle |
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
