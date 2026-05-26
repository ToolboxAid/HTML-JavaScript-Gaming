# Validation Cache Report

Generated: 2026-05-26T21:52:45.139Z
Status: PASS

## Cache Summary

Cached validations reused: 0
Validations computed: 4

## Cache Events

| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |
| --- | --- | --- | --- | --- |
| lane registration validation | MISS | bcbd864f5247c935 | initial computation | lane definitions change; package.json lane scripts change |
| lane compilation validation | MISS_UNCACHED | d08e2874e09acb5d | initial computation | lane definitions change; targeted files change; fixture ownership changes |
| dependency validation | MISS_UNCACHED | 8e5ab78ffe3f4bb9 | initial computation | dependency graph changes; lane definitions change; lane compilation input changes |
| zero-browser preflight | MISS_UNCACHED | 10c0f57553383c7f | initial computation | lane definitions change; fixture ownership changes; helper/import graph changes; targeted files change; dependency graph changes |

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
