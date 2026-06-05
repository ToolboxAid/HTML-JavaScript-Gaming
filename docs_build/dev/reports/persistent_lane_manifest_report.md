# Persistent Lane Manifest Report

Generated: 2026-06-05T12:42:55.006Z
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
| build-path | INVALIDATED | docs_build/dev/reports/lane_manifests/build-path.json | 64947469b9ba4fd4 | e55c4b6606b057c8 | Persistent manifest lane definition hash changed for build-path. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| build-path | tools | generated | tests/playwright/tools/BuildPathProgressSimplification.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | 0a034c67ed94c66f | e55c4b6606b057c8 |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
