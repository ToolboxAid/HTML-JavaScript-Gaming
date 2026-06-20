# Lane Input Validation Report

Generated: 2026-06-19T23:41:57.045Z
Status: PASS

## Input Files

| Lane | Role | File | Status | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | test | tests/playwright/tools/RootToolsFutureState.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| workspace-contract | helper | tests/helpers/playwrightRepoServer.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | helper | tests/helpers/playwrightStorageIsolation.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | helper | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | helper | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | import | src/dev-runtime/admin/admin-notes-directory.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| workspace-contract | import | src/dev-runtime/admin/admin-notes-menu.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| workspace-contract | import | src/dev-runtime/persistence/mock-db-store.js | PASS | Relative import dependency is resolved and recorded in the manifest. |
| workspace-contract | import | src/dev-runtime/server/local-api-router.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| workspace-contract | import | tests/helpers/playwrightRepoServer.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| workspace-contract | import | tests/helpers/playwrightStorageIsolation.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| workspace-contract | import | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| workspace-contract | import | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |

## Ownership Validation Failures

No manifest ownership, helper, fixture, import, or runtime command target failures.

## Fast-Fail Enforcement

- Manifest ownership is validated before Playwright/browser launch.
- Helper ownership is validated before execution.
- Fixture ownership is validated before execution.
- Unexpected discovery expansion outside manifest scope blocks runtime scheduling.
- Deterministic manifest failures do not trigger fallback broad discovery.
