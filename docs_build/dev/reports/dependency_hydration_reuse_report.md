# Dependency Hydration Reuse Report

Generated: 2026-06-15T17:49:22.270Z
Status: PASS

## Summary

Reused dependency hydration: 0
Invalidated dependency hydration: 1
Generated dependency hydration: 0
Prevented dependency graph hydration: 0
Prevented helper resolution passes: 0
Prevented fixture ownership traversal: 0

## Hydration Decisions

| Lane | Status | Helpers | Fixtures | Imports | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | INVALIDATED | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | src/dev-runtime/admin/admin-notes-directory.mjs; src/dev-runtime/admin/admin-notes-menu.mjs; src/dev-runtime/persistence/mock-db-store.js; src/dev-runtime/server/local-api-router.mjs; tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 61f53971f2d974ef | Dependency hydration was refreshed after warm-start invalidation. |

## Safeguards

- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.
- Stale hydration metadata is refreshed before runtime and is not reused silently.
- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.
- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs.
