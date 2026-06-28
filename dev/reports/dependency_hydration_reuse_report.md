# Dependency Hydration Reuse Report

Generated: 2026-06-28T14:20:34.627Z
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
| tool-display-mode | REUSED | dev/tests/helpers/playwrightRepoServer.mjs; dev/tests/helpers/playwrightStorageIsolation.mjs; dev/tests/helpers/playwrightV8CoverageReporter.mjs; dev/tests/helpers/workspaceV2CoverageReporter.mjs | none | dev/tests/helpers/playwrightRepoServer.mjs; dev/tests/helpers/playwrightStorageIsolation.mjs; dev/tests/helpers/playwrightV8CoverageReporter.mjs; dev/tests/helpers/workspaceV2CoverageReporter.mjs; src/dev-runtime/admin/admin-notes-directory.mjs; src/dev-runtime/admin/admin-notes-menu.mjs; src/dev-runtime/server/local-api-router.mjs; toolbox/toolRegistry.js | 320babaf259f9ee0 | Dependency hydration reused from validated warm-start state. |

## Safeguards

- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.
- Stale hydration metadata is refreshed before runtime and is not reused silently.
- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.
- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs.
