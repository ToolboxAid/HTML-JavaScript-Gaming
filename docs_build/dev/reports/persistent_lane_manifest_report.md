# Persistent Lane Manifest Report

Generated: 2026-06-05T00:18:28.234Z
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
| game-design | GENERATED | docs_build/dev/reports/lane_manifests/game-design.json | 524a46feff3c2312 | c91e3e832a8647ab | No persisted manifest existed for this lane. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| game-design | tools | generated | tests/playwright/tools/GameDesignMockRepository.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | 37a0b0722df16a80 | c91e3e832a8647ab |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
