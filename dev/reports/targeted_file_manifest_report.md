# Targeted File Manifest Report

Generated: 2026-06-28T14:20:34.628Z
Status: PASS

## Manifest-Generated Lane Inputs

| Lane | Ownership | Status | Source | Tests | Helpers | Fixtures | Imports / Dependencies | Dependency Graph Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tool-display-mode | tools | PASS | persistent | dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs | dev/tests/helpers/playwrightRepoServer.mjs; dev/tests/helpers/playwrightStorageIsolation.mjs; dev/tests/helpers/playwrightV8CoverageReporter.mjs; dev/tests/helpers/workspaceV2CoverageReporter.mjs | none | dev/tests/helpers/playwrightRepoServer.mjs; dev/tests/helpers/playwrightStorageIsolation.mjs; dev/tests/helpers/playwrightV8CoverageReporter.mjs; dev/tests/helpers/workspaceV2CoverageReporter.mjs; src/dev-runtime/admin/admin-notes-directory.mjs; src/dev-runtime/admin/admin-notes-menu.mjs; src/dev-runtime/server/local-api-router.mjs; toolbox/toolRegistry.js | 6de254babab8aecd | 9f823d041166f7f6 | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |

## Discovery Expansion Control

Prevented discovery expansion: Yes
Prevented redundant scans: 0
Targeted file/helper reads: 0

## Runtime Savings Observations

- Each selected lane receives one deterministic manifest before runtime scheduling.
- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.
- Runtime command targets must be declared by the lane manifest before browser launch.
- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution.
