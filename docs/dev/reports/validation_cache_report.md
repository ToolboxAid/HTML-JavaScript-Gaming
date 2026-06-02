# Validation Cache Report

Generated: 2026-06-02T20:52:58.655Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | f2884f19aa027aa4 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | e45255a3831f3771 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 81c60ad7d54e4151 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 181033562266f03d | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | c915d00fb5e5acff | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | 84a8d382751e5eb6 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 38d19aa8da4f8a9f | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 38d19aa8da4f8a9f | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 496e69de00d2741d | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 761ec01b5fbcb069 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | d148c65f853e3016 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 84a8d382751e5eb6 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 84a8d382751e5eb6 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 81c60ad7d54e4151 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 81c60ad7d54e4151 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 181033562266f03d | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 181033562266f03d | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | c915d00fb5e5acff | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | c915d00fb5e5acff | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | c915d00fb5e5acff | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 761ec01b5fbcb069 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 761ec01b5fbcb069 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 761ec01b5fbcb069 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 38d19aa8da4f8a9f | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 38d19aa8da4f8a9f | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 496e69de00d2741d | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 496e69de00d2741d | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | d148c65f853e3016 | zero-browser report output | unchanged within execution cycle |

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
