# Validation Cache Report

Generated: 2026-06-05T02:09:02.085Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 28aa972f4b516b70 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 29a3d11f2f879998 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | e90b76a28c7d631f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | b2b3c73462ffb395 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 806937b50b92c01b | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | c745cc9bfb1e46ce | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | a785451efc77832e | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | a785451efc77832e | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 7a16a029515d9a01 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 6cea65eccb0f51da | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 426bd3128cef007a | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | c745cc9bfb1e46ce | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | c745cc9bfb1e46ce | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | e90b76a28c7d631f | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | e90b76a28c7d631f | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | b2b3c73462ffb395 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | b2b3c73462ffb395 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 806937b50b92c01b | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 806937b50b92c01b | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 806937b50b92c01b | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 6cea65eccb0f51da | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 6cea65eccb0f51da | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 6cea65eccb0f51da | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | a785451efc77832e | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | a785451efc77832e | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 7a16a029515d9a01 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 7a16a029515d9a01 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 426bd3128cef007a | zero-browser report output | unchanged within execution cycle |

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
