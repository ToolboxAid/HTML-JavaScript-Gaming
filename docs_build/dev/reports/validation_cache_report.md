# Validation Cache Report

Generated: 2026-06-05T00:46:38.341Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 8af242435d5b8d92 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 4e6b53f2b424f123 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 0f7c2437c653f346 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 7ac47a9de518b454 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | dd180c9fd565c1e1 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 07004620e0a30e9d | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 010988cc4de9b8c9 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 010988cc4de9b8c9 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 5c487e40e3140b45 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 4153bbe7bfde7aa5 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | a52c5a6acc8d07a2 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 07004620e0a30e9d | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 07004620e0a30e9d | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 0f7c2437c653f346 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 0f7c2437c653f346 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 7ac47a9de518b454 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 7ac47a9de518b454 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | dd180c9fd565c1e1 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | dd180c9fd565c1e1 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | dd180c9fd565c1e1 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 4153bbe7bfde7aa5 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 4153bbe7bfde7aa5 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 4153bbe7bfde7aa5 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 010988cc4de9b8c9 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 010988cc4de9b8c9 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 5c487e40e3140b45 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 5c487e40e3140b45 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | a52c5a6acc8d07a2 | zero-browser report output | unchanged within execution cycle |

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
