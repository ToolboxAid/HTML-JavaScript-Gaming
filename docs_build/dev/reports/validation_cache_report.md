# Validation Cache Report

Generated: 2026-06-20T05:14:54.987Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 2e5779ed0ed947c7 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 82ebdc0c4e1e7794 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 97bdfaa7c37c6c39 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | a9be123f6103d2a6 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 4f4c7d8b58681e94 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | cbdc1b67d6373aee | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | c974136a7964ae67 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | c974136a7964ae67 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 46fe936f65e8a29d | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | b303207d429dff9d | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | e92e4238c2719b6f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | cbdc1b67d6373aee | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | cbdc1b67d6373aee | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 97bdfaa7c37c6c39 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 97bdfaa7c37c6c39 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | a9be123f6103d2a6 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | a9be123f6103d2a6 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 4f4c7d8b58681e94 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 4f4c7d8b58681e94 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 4f4c7d8b58681e94 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | b303207d429dff9d | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | b303207d429dff9d | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | b303207d429dff9d | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | c974136a7964ae67 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | c974136a7964ae67 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 46fe936f65e8a29d | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 46fe936f65e8a29d | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | e92e4238c2719b6f | zero-browser report output | unchanged within execution cycle |

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
