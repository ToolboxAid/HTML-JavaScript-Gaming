# Validation Cache Report

Generated: 2026-06-05T00:18:28.236Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 078851779b7e9a75 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 726468f1a717597d | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 1938dc5df27e0191 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | b690514fff28c7c7 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 7753a02468331784 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 7a1aa3a6e26ac9ba | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 3503408f760cfcc9 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 3503408f760cfcc9 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 828343c11c4ffadd | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 75ea195c9f93fc8d | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | a5967741455dfd8d | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 7a1aa3a6e26ac9ba | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 7a1aa3a6e26ac9ba | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 1938dc5df27e0191 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 1938dc5df27e0191 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | b690514fff28c7c7 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | b690514fff28c7c7 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 7753a02468331784 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 7753a02468331784 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 7753a02468331784 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 75ea195c9f93fc8d | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 75ea195c9f93fc8d | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 75ea195c9f93fc8d | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 3503408f760cfcc9 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 3503408f760cfcc9 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 828343c11c4ffadd | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 828343c11c4ffadd | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | a5967741455dfd8d | zero-browser report output | unchanged within execution cycle |

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
