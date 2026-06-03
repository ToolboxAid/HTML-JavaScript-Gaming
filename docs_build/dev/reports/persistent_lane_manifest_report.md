# Persistent Lane Manifest Report

Generated: 2026-06-03T17:55:20.031Z
Status: PASS
Manifest directory: docs_build/dev/reports/lane_manifests

## Summary

Reused manifests: 0
Invalidated manifests: 0
Generated manifests: 1
Prevented discovery scans: 0

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| samples | GENERATED | docs_build/dev/reports/lane_manifests/samples.json | fdf4ca6c755dd6ef | 6d80106379a1bc2b | No persisted manifest existed for this lane. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| samples | samples | generated | none | none | none | 7558476a74bf35dc | 6d80106379a1bc2b |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
