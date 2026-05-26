# Validation Cache Report

Generated: 2026-05-26T19:30:40.929Z
Status: PASS

## Cache Summary

Cached validations reused: 8
Validations computed: 6

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | d331d34f620be161 | initial computation | lane definitions change; package.json lane scripts change |
| runner preflight validation | MISS | 4a29a5cb869a7876 | initial computation | lane definitions change; fixture ownership changes; targeted files change |
| structural ownership validation | MISS | 24b098f22be17ce1 | initial computation | fixture ownership changes; helper/import graph changes; targeted files change |
| lane compilation validation | MISS | 614ff201f755c81c | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| lane compilation validation | HIT | 614ff201f755c81c | dependency validation input | unchanged within execution cycle |
| dependency validation | MISS | ab41de7d0ff270b0 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| zero-browser preflight | MISS | 6c43c915a37a0e95 | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |
| structural ownership validation | HIT | 24b098f22be17ce1 | static validation report | unchanged within execution cycle |
| structural ownership validation | HIT | 24b098f22be17ce1 | zero-browser preflight report | unchanged within execution cycle |
| lane compilation validation | HIT | 614ff201f755c81c | lane compilation report | unchanged within execution cycle |
| lane compilation validation | HIT | 614ff201f755c81c | runtime scheduling | unchanged within execution cycle |
| dependency validation | HIT | ab41de7d0ff270b0 | dependency report | unchanged within execution cycle |
| dependency validation | HIT | ab41de7d0ff270b0 | runtime scheduling | unchanged within execution cycle |
| zero-browser preflight | HIT | 6c43c915a37a0e95 | zero-browser report output | unchanged within execution cycle |

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
