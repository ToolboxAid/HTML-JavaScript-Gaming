# Persistent Lane Manifest Report

Generated: 2026-05-26T22:17:10.906Z
Status: PASS
Manifest directory: docs/dev/reports/lane_manifests

## Summary

Reused manifests: 0
Invalidated manifests: 1
Generated manifests: 0
Prevented discovery scans: 0

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| integration | INVALIDATED | docs/dev/reports/lane_manifests/integration.json | 5afeaa1d93e9abcd | efd808f21c146e0b | Persistent manifest input hash changed for integration.; Persistent manifest hash changed for integration. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| integration | integration | generated | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs; tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/Pong/game.manifest.json | 4138c2ded15059b2 | efd808f21c146e0b |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
