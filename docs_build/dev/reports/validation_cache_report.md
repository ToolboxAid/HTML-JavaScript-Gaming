# Validation Cache Report

Generated: 2026-06-16T17:56:55.586Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | c5f6923cb3e9b570 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | a56dddb91b84bd8e | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | d1596716e5ff4e22 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 7b7cf73dcd51e33c | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 061f6dca7e22e2cb | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | b6af673d5403e36b | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | ff2d20b40fcb0398 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | ff2d20b40fcb0398 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 718132570eea4d98 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 1ad8316e3c5021ab | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | f19bf3518c98576f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | b6af673d5403e36b | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | b6af673d5403e36b | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | d1596716e5ff4e22 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | d1596716e5ff4e22 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 7b7cf73dcd51e33c | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 7b7cf73dcd51e33c | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 061f6dca7e22e2cb | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 061f6dca7e22e2cb | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 061f6dca7e22e2cb | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 1ad8316e3c5021ab | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 1ad8316e3c5021ab | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 1ad8316e3c5021ab | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | ff2d20b40fcb0398 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | ff2d20b40fcb0398 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 718132570eea4d98 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 718132570eea4d98 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | f19bf3518c98576f | zero-browser report output | unchanged within execution cycle |

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
