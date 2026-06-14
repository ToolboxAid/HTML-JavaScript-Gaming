# Validation Cache Report

Generated: 2026-06-14T03:23:31.711Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 8f62ba85b24fb8ee | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 105ef58d69f4d275 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 4bfb92203c55f6fd | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 49f9e8862edddf8f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | a7b603a3befc00df | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | d53b670ce067c837 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 7a4f5afeaf6694fb | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 7a4f5afeaf6694fb | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 758c819706b57dc2 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | ce9884b57d6d53ea | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | d37364e75fb31c03 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | d53b670ce067c837 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | d53b670ce067c837 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 4bfb92203c55f6fd | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 4bfb92203c55f6fd | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 49f9e8862edddf8f | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 49f9e8862edddf8f | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | a7b603a3befc00df | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | a7b603a3befc00df | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | a7b603a3befc00df | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | ce9884b57d6d53ea | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | ce9884b57d6d53ea | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | ce9884b57d6d53ea | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 7a4f5afeaf6694fb | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 7a4f5afeaf6694fb | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 758c819706b57dc2 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 758c819706b57dc2 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | d37364e75fb31c03 | zero-browser report output | unchanged within execution cycle |

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
