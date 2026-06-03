# Validation Cache Report

Generated: 2026-06-03T17:06:31.643Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 8ff6ae483b3f9413 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 2a53dd8d5129b3ae | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | faba18eea9ec98b7 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 707b7821b9543e7b | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | d95a047b6d4edcfc | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | e5d13c39dd9d8ba6 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 91d6fed2bd6927a2 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 91d6fed2bd6927a2 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | cf2411fee5327715 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 1bbe24e6c5463411 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | 7ccecaf5d82fb6af | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | e5d13c39dd9d8ba6 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | e5d13c39dd9d8ba6 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | faba18eea9ec98b7 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | faba18eea9ec98b7 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 707b7821b9543e7b | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 707b7821b9543e7b | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | d95a047b6d4edcfc | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | d95a047b6d4edcfc | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | d95a047b6d4edcfc | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 1bbe24e6c5463411 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 1bbe24e6c5463411 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 1bbe24e6c5463411 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | 91d6fed2bd6927a2 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 91d6fed2bd6927a2 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | cf2411fee5327715 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | cf2411fee5327715 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 7ccecaf5d82fb6af | zero-browser report output | unchanged within execution cycle |

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
