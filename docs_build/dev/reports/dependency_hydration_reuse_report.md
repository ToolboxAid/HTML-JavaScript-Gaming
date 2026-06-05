# Dependency Hydration Reuse Report

Generated: 2026-06-05T04:46:18.833Z
Status: PASS

## Summary

Reused dependency hydration: 1
Invalidated dependency hydration: 0
Generated dependency hydration: 0
Prevented dependency graph hydration: 1
Prevented helper resolution passes: 4
Prevented fixture ownership traversal: 0

## Hydration Decisions

| Lane | Status | Helpers | Fixtures | Imports | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| tool-images | REUSED | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs; toolbox/toolRegistry.js | 0e7e6a30c3a7e460 | Dependency hydration reused from validated warm-start state. |

## Safeguards

- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.
- Stale hydration metadata is refreshed before runtime and is not reused silently.
- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.
- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs.
