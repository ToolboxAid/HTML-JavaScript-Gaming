# Validation Cache Report

Generated: 2026-06-05T01:49:31.801Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 28aa972f4b516b70 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 1fa0d9c4f149f055 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 7218d57d1d8a70f2 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | fea657a517cea521 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | f625f1302558f7b3 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 1266063d84362765 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | f71850d269502d07 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | f71850d269502d07 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | f199396e063038c0 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | f1ebba63176cf7d9 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 426bd3128cef007a | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 1266063d84362765 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 1266063d84362765 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 7218d57d1d8a70f2 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 7218d57d1d8a70f2 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | fea657a517cea521 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | fea657a517cea521 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | f625f1302558f7b3 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | f625f1302558f7b3 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | f625f1302558f7b3 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | f1ebba63176cf7d9 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | f1ebba63176cf7d9 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | f1ebba63176cf7d9 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | f71850d269502d07 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | f71850d269502d07 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | f199396e063038c0 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | f199396e063038c0 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 426bd3128cef007a | zero-browser report output | unchanged within execution cycle |

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
