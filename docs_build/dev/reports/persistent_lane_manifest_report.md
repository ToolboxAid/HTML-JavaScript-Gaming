# Persistent Lane Manifest Report

Generated: 2026-06-20T15:20:55.595Z
Status: PASS
Manifest directory: docs_build/dev/reports/lane_manifests

## Summary

Reused manifests: 1
Invalidated manifests: 0
Generated manifests: 0
Prevented discovery scans: 1

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| workspace-contract | REUSED | docs_build/dev/reports/lane_manifests/workspace-contract.json | 4b520ec67663da30 | 2974ef9fd87603c5 | Inputs unchanged; persisted lane manifest reused. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | tools | persistent | tests/playwright/tools/RootToolsFutureState.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | 7ddc1041bdb425d1 | 2974ef9fd87603c5 |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
