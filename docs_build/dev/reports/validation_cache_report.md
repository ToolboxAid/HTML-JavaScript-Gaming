# Validation Cache Report

Generated: 2026-06-05T00:58:35.522Z
Status: PASS

## Cache Summary

Cached validations reused: 18
Validations computed: 10

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | 8af242435d5b8d92 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | ab491f2e7877bb1d | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | 18201bed19823fde | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | 4034eab354947355 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| lane warm-start validation | MISS | a64a5cf330ca7492 | initial computation | lane definitions change; targeted files change; ownership metadata changes; dependency graph changes; helper/fixture placement changes; lane configuration changes |
| structural ownership validation | MISS | c507f2f966a8e47d | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | cc371eab228567d0 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | cc371eab228567d0 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 4b0f6953093d09e2 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| lane snapshot validation | MISS | 786f6fdfecfd9ac7 | initial computation | targeted files change; dependency graph changes; helper/fixture ownership changes; lane configuration changes; runtime configuration changes |
| zero-browser preflight | MISS | a52c5a6acc8d07a2 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | c507f2f966a8e47d | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | c507f2f966a8e47d | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | 18201bed19823fde | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | 18201bed19823fde | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | 4034eab354947355 | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | 4034eab354947355 | runtime scheduling blockers | unchanged within execution cycle |
| lane warm-start validation | HIT | a64a5cf330ca7492 | warm-start report | unchanged within execution cycle |
| lane warm-start validation | HIT | a64a5cf330ca7492 | dependency hydration reuse report | unchanged within execution cycle |
| lane warm-start validation | HIT | a64a5cf330ca7492 | runtime scheduling | unchanged within execution cycle |
| lane snapshot validation | HIT | 786f6fdfecfd9ac7 | lane snapshot report | unchanged within execution cycle |
| lane snapshot validation | HIT | 786f6fdfecfd9ac7 | execution graph reuse report | unchanged within execution cycle |
| lane snapshot validation | HIT | 786f6fdfecfd9ac7 | runtime scheduling | unchanged within execution cycle |
| lane compilation validation | HIT | cc371eab228567d0 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | cc371eab228567d0 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 4b0f6953093d09e2 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 4b0f6953093d09e2 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | a52c5a6acc8d07a2 | zero-browser report output | unchanged within execution cycle |

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
