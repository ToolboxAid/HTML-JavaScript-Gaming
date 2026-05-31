# Validation Cache Report

Generated: 2026-05-31T23:17:49.491Z
Status: PASS

## Cache Summary

Cached validations reused: 16
Validations computed: 9

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | abc3417ea7ea4572 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 75c1e3e504309f6b | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 4c1cbc8cf46376c3 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 310f5e66167f279d | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 321bebfe2f7cd845 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| lane compilation validation | MISS | 1023fb773d2f7f02 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 1023fb773d2f7f02 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | fe3872ecbbf597eb | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | d29853b2e0720f8f | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | b8d7992d36812d25 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| scoped discovery map | HIT | 4c1cbc8cf46376c3 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 4c1cbc8cf46376c3 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 310f5e66167f279d | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 310f5e66167f279d | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 321bebfe2f7cd845 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 321bebfe2f7cd845 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 321bebfe2f7cd845 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | d29853b2e0720f8f | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | d29853b2e0720f8f | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | d29853b2e0720f8f | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 1023fb773d2f7f02 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 1023fb773d2f7f02 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | fe3872ecbbf597eb | dependency report | unchanged within execution cycle |
| dependency validation | HIT | fe3872ecbbf597eb | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | b8d7992d36812d25 | zero-browser report output | unchanged within execution cycle |

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
