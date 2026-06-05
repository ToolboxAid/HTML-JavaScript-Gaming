# Validation Cache Report

Generated: 2026-06-05T01:16:24.001Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 70927b0f90fb96a6 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | da35578d605ac57b | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 3c748c783e8908e2 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 6bfa3358294eebe0 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 55da5e8ba076d17c | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 96d7bbc1a17db23d | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | d1e3ac3ee0a8bfd9 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | d1e3ac3ee0a8bfd9 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 78ec986ed0e309a1 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | e2f4ee0a6cee7938 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 02c55866c8e3b93a | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 96d7bbc1a17db23d | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 96d7bbc1a17db23d | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 3c748c783e8908e2 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 3c748c783e8908e2 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 6bfa3358294eebe0 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 6bfa3358294eebe0 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 55da5e8ba076d17c | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 55da5e8ba076d17c | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 55da5e8ba076d17c | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | e2f4ee0a6cee7938 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | e2f4ee0a6cee7938 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | e2f4ee0a6cee7938 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | d1e3ac3ee0a8bfd9 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | d1e3ac3ee0a8bfd9 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 78ec986ed0e309a1 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 78ec986ed0e309a1 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 02c55866c8e3b93a | zero-browser report output | unchanged within execution cycle |

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
