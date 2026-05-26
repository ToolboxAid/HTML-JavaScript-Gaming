# Validation Cache Report

Generated: 2026-05-26T22:00:48.033Z
Status: PASS

## Cache Summary

Cached validations reused: 16
Validations computed: 9

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | bcbd864f5247c935 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 7b60eba3fc19ae3a | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | bb3ea252075b2191 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 054dd17be08649cb | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 0812b20c55e1b451 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| lane compilation validation | MISS | 2f5a0e5efb428a2d | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 2f5a0e5efb428a2d | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 92c1a8a3adbb42da | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | d48acf7968a1193a | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 153c1f404497ba44 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| scoped discovery map | HIT | bb3ea252075b2191 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | bb3ea252075b2191 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 054dd17be08649cb | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 054dd17be08649cb | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 0812b20c55e1b451 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 0812b20c55e1b451 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 0812b20c55e1b451 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | d48acf7968a1193a | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | d48acf7968a1193a | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | d48acf7968a1193a | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 2f5a0e5efb428a2d | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 2f5a0e5efb428a2d | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 92c1a8a3adbb42da | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 92c1a8a3adbb42da | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 153c1f404497ba44 | zero-browser report output | unchanged within execution cycle |

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
