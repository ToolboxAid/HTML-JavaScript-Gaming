# Persistent Lane Manifest Report

Generated: 2026-06-05T12:10:07.499Z
Status: PASS
Manifest directory: docs_build/dev/reports/lane_manifests

## Summary

Reused manifests: 0
Invalidated manifests: 1
Generated manifests: 0
Prevented discovery scans: 0

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| tool-images | INVALIDATED | docs_build/dev/reports/lane_manifests/tool-images.json | 26715a5f789dc6ab | 2c57bf85d09c8a7d | Persistent manifest dependency graph hash changed for tool-images.; Persistent manifest input hash changed for tool-images.; Persistent manifest hash changed for tool-images. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tool-images | tools | generated | tests/playwright/tools/ToolImageRegistry.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | d2621bf5b088b853 | 2c57bf85d09c8a7d |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
