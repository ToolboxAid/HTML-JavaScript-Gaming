# Validation Cache Report

Generated: 2026-05-26T19:54:13.478Z
Status: PASS

## Cache Summary

Cached validations reused: 12
Validations computed: 8

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | bc8e9b6fdbdb9a1e | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | e654f5d1f9773003 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| scoped discovery map | MISS | e654f5d1f9773003 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| targeted file manifest validation | MISS | d8fd70538f298acc | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change |
| structural ownership validation | MISS | ddfcd5879126ec28 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 8114aeae615a6e58 | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 8114aeae615a6e58 | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | 1acd5b0a029d3d60 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| zero-browser preflight | MISS | 99e4aefa04660173 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | ddfcd5879126ec28 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | ddfcd5879126ec28 | zero-browser preflight report | unchanged within execution cycle |
| scoped discovery map | HIT | e654f5d1f9773003 | structural ownership validation input | unchanged within execution cycle |
| scoped discovery map | HIT | e654f5d1f9773003 | discovery scope reporting | unchanged within execution cycle |
| targeted file manifest validation | HIT | d8fd70538f298acc | lane input validation report | unchanged within execution cycle |
| targeted file manifest validation | HIT | d8fd70538f298acc | runtime scheduling blockers | unchanged within execution cycle |
| lane compilation validation | HIT | 8114aeae615a6e58 | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 8114aeae615a6e58 | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | 1acd5b0a029d3d60 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | 1acd5b0a029d3d60 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 99e4aefa04660173 | zero-browser report output | unchanged within execution cycle |

## Deterministic Invalidation Rules

- Lane definitions change: lane registration, runner preflight, lane compilation, dependency validation, and scheduling caches invalidate.
- Fixture ownership changes: structural ownership and runner preflight caches invalidate.
- Helper/import graph changes: structural ownership validation cache invalidates.
- Targeted files change: runner preflight and lane compilation caches invalidate.
- Dependency graph changes: dependency validation and runtime scheduling caches invalidate.

## Runtime Savings Observations

- Structural ownership validation is computed once per runner invocation and reused by static and zero-browser reporting.
- Lane compilation is computed once and reused by dependency gating, runtime scheduling, and reports.
- Dependency validation is computed once and reused by zero-browser preflight, runtime scheduling, and reports.
- No persistent validation cache is written to project JSON, toolState, localStorage, or sessionStorage.
