# Validation Cache Report

Generated: 2026-06-06T17:05:49.470Z
Status: PASS

## Cache Summary

Cached validations reused: 16
Validations computed: 9

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 87b851f82e9b662e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | fea19c467de02fa7 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 4353d333f282b799 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 587635ebc2856e6c | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | b2e469245232fa4d | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| lane compilation validation | MISS | 26562f0a60f11190 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 26562f0a60f11190 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | ad71f7e486723c6a | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 2a19be53f9c0c5eb | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | e0123ed378a55019 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| scoped discovery map | HIT | 4353d333f282b799 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 4353d333f282b799 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 587635ebc2856e6c | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 587635ebc2856e6c | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | b2e469245232fa4d | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | b2e469245232fa4d | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | b2e469245232fa4d | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 2a19be53f9c0c5eb | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 2a19be53f9c0c5eb | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 2a19be53f9c0c5eb | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 26562f0a60f11190 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 26562f0a60f11190 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | ad71f7e486723c6a | dependency report | unchanged within execution cycle |
| dependency validation | HIT | ad71f7e486723c6a | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | e0123ed378a55019 | zero-browser report output | unchanged within execution cycle |

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
