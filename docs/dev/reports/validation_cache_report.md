# Validation Cache Report

Generated: 2026-05-26T22:17:10.908Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | b9946be3bc8696d1 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | ea94fca599e1da5f | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 184d9d897239e355 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 1b464ecb12027e56 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | dcb60f9807d243a1 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 0eca5cb6d2c685b6 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | a44c38bfa48a8a49 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | a44c38bfa48a8a49 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | dd1009ec6e72c723 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 8069d3850e34ce4c | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 431bf7a3e2ab9b22 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 0eca5cb6d2c685b6 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 0eca5cb6d2c685b6 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 184d9d897239e355 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 184d9d897239e355 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 1b464ecb12027e56 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 1b464ecb12027e56 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | dcb60f9807d243a1 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | dcb60f9807d243a1 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | dcb60f9807d243a1 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 8069d3850e34ce4c | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 8069d3850e34ce4c | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 8069d3850e34ce4c | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | a44c38bfa48a8a49 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | a44c38bfa48a8a49 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | dd1009ec6e72c723 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | dd1009ec6e72c723 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 431bf7a3e2ab9b22 | zero-browser report output | unchanged within execution cycle |

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
