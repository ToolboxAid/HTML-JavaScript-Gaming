# Validation Cache Report

Generated: 2026-06-17T01:43:02.675Z
Status: PASS

## Cache Summary

Cached validations reused: 16
Validations computed: 9

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | c5f6923cb3e9b570 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | d204910bef13f784 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | a95cc1a4f89471aa | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 1e19676f6b427faf | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 2de754d4d1277fe6 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| lane compilation validation | MISS | 88aedd94a4c95656 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 88aedd94a4c95656 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | df905b2b9bc09de5 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 789e93469d0eed54 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 51dcdb28a95351a5 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| scoped discovery map | HIT | a95cc1a4f89471aa | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | a95cc1a4f89471aa | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 1e19676f6b427faf | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 1e19676f6b427faf | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 2de754d4d1277fe6 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 2de754d4d1277fe6 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 2de754d4d1277fe6 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 789e93469d0eed54 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 789e93469d0eed54 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 789e93469d0eed54 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 88aedd94a4c95656 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 88aedd94a4c95656 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | df905b2b9bc09de5 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | df905b2b9bc09de5 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 51dcdb28a95351a5 | zero-browser report output | unchanged within execution cycle |

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
