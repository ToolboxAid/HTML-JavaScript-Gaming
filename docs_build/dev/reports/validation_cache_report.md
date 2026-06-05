# Validation Cache Report

Generated: 2026-06-05T12:32:35.000Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | e6ced56ab1241c6f | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 8b8822252f93fb84 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | ab62a17901f91f5a | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 7e06f621a263ccf3 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 4e30f645b249fc16 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 689a219f52fb9f9a | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | e0f8dda2473d18ec | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | e0f8dda2473d18ec | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | a8988891a1cac78a | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | be0ce1c44385aaed | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 68e3e847d7540089 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 689a219f52fb9f9a | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 689a219f52fb9f9a | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | ab62a17901f91f5a | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | ab62a17901f91f5a | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 7e06f621a263ccf3 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 7e06f621a263ccf3 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 4e30f645b249fc16 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 4e30f645b249fc16 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 4e30f645b249fc16 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | be0ce1c44385aaed | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | be0ce1c44385aaed | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | be0ce1c44385aaed | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | e0f8dda2473d18ec | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | e0f8dda2473d18ec | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | a8988891a1cac78a | dependency report | unchanged within execution cycle |
| dependency validation | HIT | a8988891a1cac78a | runtime scheduling | unchanged within execution cycle |
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
