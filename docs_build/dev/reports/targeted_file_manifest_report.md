# Targeted File Manifest Report

Generated: 2026-06-11T16:58:29.578Z
Status: PASS

## Manifest-Generated Lane Inputs

| Lane | Ownership | Status | Source | Tests | Helpers | Fixtures | Imports / Dependencies | Dependency Graph Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | tools | PASS | generated | tests/playwright/tools/RootToolsFutureState.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | none | src/dev-runtime/admin/admin-notes-directory.mjs; src/dev-runtime/admin/admin-notes-menu.mjs; src/dev-runtime/persistence/mock-db-store.js; src/dev-runtime/server/mock-api-router.mjs; tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs; toolbox/toolRegistry.js | fbb928f82cd79709 | f51c571da39319ff | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |

## Discovery Expansion Control

Prevented discovery expansion: Yes
Prevented redundant scans: 4
Targeted file/helper reads: 5

## Runtime Savings Observations

- Each selected lane receives one deterministic manifest before runtime scheduling.
- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.
- Runtime command targets must be declared by the lane manifest before browser launch.
- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution.
