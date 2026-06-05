# Validation Cache Report

Generated: 2026-06-05T19:46:03.268Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 87b851f82e9b662e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | d33b87ed8275bd0f | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | c3120d7827beb96a | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | af1696ac7c96d14d | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | f64eb467edd18192 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | e1b41919b4633351 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | ca3f71c0f816304d | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | ca3f71c0f816304d | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 957db17017a9dd2f | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 2e5feb067e3f5003 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 263e107dfaea4b74 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | e1b41919b4633351 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | e1b41919b4633351 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | c3120d7827beb96a | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | c3120d7827beb96a | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | af1696ac7c96d14d | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | af1696ac7c96d14d | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | f64eb467edd18192 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | f64eb467edd18192 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | f64eb467edd18192 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 2e5feb067e3f5003 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 2e5feb067e3f5003 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 2e5feb067e3f5003 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | ca3f71c0f816304d | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | ca3f71c0f816304d | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 957db17017a9dd2f | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 957db17017a9dd2f | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 263e107dfaea4b74 | zero-browser report output | unchanged within execution cycle |

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
