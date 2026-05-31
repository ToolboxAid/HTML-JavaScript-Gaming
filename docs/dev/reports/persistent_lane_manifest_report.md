# Persistent Lane Manifest Report

Generated: 2026-05-31T23:17:49.488Z
Status: PASS
Manifest directory: docs/dev/reports/lane_manifests

## Summary

Reused manifests: 0
Invalidated manifests: 0
Generated manifests: 0
Prevented discovery scans: 0

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| none | SKIP | none | none | none | No persistent manifest events were recorded. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | none | none | none | none | none | none | none |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
