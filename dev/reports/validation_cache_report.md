# Validation Cache Report

Generated: 2026-06-28T14:20:34.630Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 71154f2e750ad390 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 5ac6318041e793c0 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 40b8f8a446180b68 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | f45517bda56f7a2f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 476b4f6032e7a132 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 58bce19a34e5c9a6 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | f039f3c33d7fdaa7 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | f039f3c33d7fdaa7 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 12176c892041f4fc | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 6e848e7bc3c39b41 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 244a3248c13d9ada | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 58bce19a34e5c9a6 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 58bce19a34e5c9a6 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 40b8f8a446180b68 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 40b8f8a446180b68 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | f45517bda56f7a2f | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | f45517bda56f7a2f | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 476b4f6032e7a132 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 476b4f6032e7a132 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 476b4f6032e7a132 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 6e848e7bc3c39b41 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 6e848e7bc3c39b41 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 6e848e7bc3c39b41 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | f039f3c33d7fdaa7 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | f039f3c33d7fdaa7 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 12176c892041f4fc | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 12176c892041f4fc | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 244a3248c13d9ada | zero-browser report output | unchanged within execution cycle |

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
