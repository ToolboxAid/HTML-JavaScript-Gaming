# Persistent Lane Manifest Report

Generated: 2026-06-13T00:37:40.288Z
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
| workspace-contract | REUSED | docs_build/dev/reports/lane_manifests/workspace-contract.json | 53779f9c46ddaf37 | 898f678666fe858b | Inputs unchanged; persisted lane manifest reused. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | tools | persistent | tests/playwright/tools/RootToolsFutureState.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | 5304826c4eb8f8c0 | 898f678666fe858b |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
