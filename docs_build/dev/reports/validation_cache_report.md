# Validation Cache Report

Generated: 2026-06-04T02:37:31.283Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | c0cc67d5bff14f65 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 73603d089e55b559 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 20a00766467a7ec7 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | ab642053cd6d45f0 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 9b98ff95ecfe322a | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | d13d33be55a5db8a | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 3f6ef109e9e9bb23 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 3f6ef109e9e9bb23 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | ffd6af162d0eaec8 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | dd53474cf8e1026b | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 4664f31b199f6587 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | d13d33be55a5db8a | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | d13d33be55a5db8a | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 20a00766467a7ec7 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 20a00766467a7ec7 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | ab642053cd6d45f0 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | ab642053cd6d45f0 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 9b98ff95ecfe322a | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 9b98ff95ecfe322a | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 9b98ff95ecfe322a | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | dd53474cf8e1026b | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | dd53474cf8e1026b | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | dd53474cf8e1026b | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 3f6ef109e9e9bb23 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 3f6ef109e9e9bb23 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | ffd6af162d0eaec8 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | ffd6af162d0eaec8 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 4664f31b199f6587 | zero-browser report output | unchanged within execution cycle |

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
