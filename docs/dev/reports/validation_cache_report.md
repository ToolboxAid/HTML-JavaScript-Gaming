# Validation Cache Report

Generated: 2026-05-26T22:55:37.505Z
Status: PASS

## Cache Summary

Cached validations reused: 16
Validations computed: 9

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | f2884f19aa027aa4 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 17655d71828d5703 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 5d7c32f2f9f4e2cf | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | e64e3ee51b7b4b5f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | d2902115c9920edd | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| lane compilation validation | MISS | d191757fbf31fdac | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | d191757fbf31fdac | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | a4e847b9880a77bb | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | b0ea12f682a42c84 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 51f101a724a3ba6d | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| scoped discovery map | HIT | 5d7c32f2f9f4e2cf | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 5d7c32f2f9f4e2cf | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | e64e3ee51b7b4b5f | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | e64e3ee51b7b4b5f | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | d2902115c9920edd | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | d2902115c9920edd | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | d2902115c9920edd | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | b0ea12f682a42c84 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | b0ea12f682a42c84 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | b0ea12f682a42c84 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | d191757fbf31fdac | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | d191757fbf31fdac | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | a4e847b9880a77bb | dependency report | unchanged within execution cycle |
| dependency validation | HIT | a4e847b9880a77bb | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 51f101a724a3ba6d | zero-browser report output | unchanged within execution cycle |

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
