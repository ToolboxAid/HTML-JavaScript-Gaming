# Validation Cache Report

Generated: 2026-06-03T21:46:03.814Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | ab5eb3e5c005ae6e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | db9bb56ac7685add | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | cbfa23a389371b1f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | c2f9277527c21541 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | 27cc48d18f80c943 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | ba985555d10f679f | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | ba830a2fd645e87f | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | ba830a2fd645e87f | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 10429300759a47d1 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 6fcc47fdc3361335 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 6ed7ade458182a21 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | ba985555d10f679f | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | ba985555d10f679f | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | cbfa23a389371b1f | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | cbfa23a389371b1f | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | c2f9277527c21541 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | c2f9277527c21541 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | 27cc48d18f80c943 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | 27cc48d18f80c943 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | 27cc48d18f80c943 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 6fcc47fdc3361335 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 6fcc47fdc3361335 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 6fcc47fdc3361335 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | ba830a2fd645e87f | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | ba830a2fd645e87f | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 10429300759a47d1 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 10429300759a47d1 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 6ed7ade458182a21 | zero-browser report output | unchanged within execution cycle |

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
