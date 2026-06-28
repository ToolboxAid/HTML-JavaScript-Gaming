# Lane Input Validation Report

Generated: 2026-06-28T14:20:34.629Z
Status: PASS

## Input Files

| Lane | Role | File | Status | Reason |
| --- | --- | --- | --- | --- |
| tool-display-mode | test | dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| tool-display-mode | helper | dev/tests/helpers/playwrightRepoServer.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-display-mode | helper | dev/tests/helpers/playwrightStorageIsolation.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-display-mode | helper | dev/tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-display-mode | helper | dev/tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| tool-display-mode | import | dev/tests/helpers/playwrightRepoServer.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-display-mode | import | dev/tests/helpers/playwrightStorageIsolation.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-display-mode | import | dev/tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-display-mode | import | dev/tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-display-mode | import | src/dev-runtime/admin/admin-notes-directory.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-display-mode | import | src/dev-runtime/admin/admin-notes-menu.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-display-mode | import | src/dev-runtime/server/local-api-router.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| tool-display-mode | import | toolbox/toolRegistry.js | PASS | Relative import dependency is resolved and recorded in the manifest. |

## Ownership Validation Failures

No manifest ownership, helper, fixture, import, or runtime command target failures.

## Fast-Fail Enforcement

- Manifest ownership is validated before Playwright/browser launch.
- Helper ownership is validated before execution.
- Fixture ownership is validated before execution.
- Unexpected discovery expansion outside manifest scope blocks runtime scheduling.
- Deterministic manifest failures do not trigger fallback broad discovery.
