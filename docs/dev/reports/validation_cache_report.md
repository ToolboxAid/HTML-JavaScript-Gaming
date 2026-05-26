# Validation Cache Report

Generated: 2026-05-26T21:43:06.652Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | bcbd864f5247c935 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 8d7658788c717178 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | f9cba00daa53b649 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 9f45502740f3afbb | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | fc40881c68aca413 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | c29e2ee2d632c9db | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | e88745fe58ed5228 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | e88745fe58ed5228 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 5165387ab889cb80 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 9075212749b3b23c | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | c22eb75c8aebfd5c | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | c29e2ee2d632c9db | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | c29e2ee2d632c9db | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | f9cba00daa53b649 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | f9cba00daa53b649 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 9f45502740f3afbb | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 9f45502740f3afbb | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | fc40881c68aca413 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | fc40881c68aca413 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | fc40881c68aca413 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 9075212749b3b23c | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 9075212749b3b23c | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 9075212749b3b23c | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | e88745fe58ed5228 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | e88745fe58ed5228 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 5165387ab889cb80 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 5165387ab889cb80 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | c22eb75c8aebfd5c | zero-browser report output | unchanged within execution cycle |

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
