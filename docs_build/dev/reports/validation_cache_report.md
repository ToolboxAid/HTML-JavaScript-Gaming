# Validation Cache Report

Generated: 2026-06-03T17:55:20.032Z
Status: PASS

## Cache Summary

Cached validations reused: 16
Validations computed: 9

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | ab5eb3e5c005ae6e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 31058a7b4bd63966 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 7fb0f7ca9ef87039 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 473d0d3a270d4067 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 1f5336844ef9e729 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| lane compilation validation | MISS | d7551c50f6fecd6a | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | d7551c50f6fecd6a | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 0de515651ccc76b9 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 060d10c4b06990d9 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 500883671fc5a77b | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| scoped discovery map | HIT | 7fb0f7ca9ef87039 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 7fb0f7ca9ef87039 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 473d0d3a270d4067 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 473d0d3a270d4067 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 1f5336844ef9e729 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 1f5336844ef9e729 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 1f5336844ef9e729 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 060d10c4b06990d9 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 060d10c4b06990d9 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 060d10c4b06990d9 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | d7551c50f6fecd6a | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | d7551c50f6fecd6a | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 0de515651ccc76b9 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 0de515651ccc76b9 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 500883671fc5a77b | zero-browser report output | unchanged within execution cycle |

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
