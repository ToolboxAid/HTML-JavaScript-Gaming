# Validation Cache Report

Generated: 2026-06-20T22:58:20.687Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 6a5b13bb47c3fad3 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 0633df51b798654a | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | e195476e1978ec54 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 070fd74956239d48 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 6f24967ea6249f42 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | ce9fb480b7ef245b | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 0e1346462ea720dd | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 0e1346462ea720dd | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 94d1bf1c7924d46d | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 5d2cdac11ae1ca38 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 568caf8342cb4bc0 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | ce9fb480b7ef245b | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | ce9fb480b7ef245b | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | e195476e1978ec54 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | e195476e1978ec54 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 070fd74956239d48 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 070fd74956239d48 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 6f24967ea6249f42 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 6f24967ea6249f42 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 6f24967ea6249f42 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 5d2cdac11ae1ca38 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 5d2cdac11ae1ca38 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 5d2cdac11ae1ca38 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 0e1346462ea720dd | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 0e1346462ea720dd | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 94d1bf1c7924d46d | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 94d1bf1c7924d46d | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 568caf8342cb4bc0 | zero-browser report output | unchanged within execution cycle |

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
