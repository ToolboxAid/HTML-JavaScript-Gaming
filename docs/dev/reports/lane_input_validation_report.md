# Lane Input Validation Report

Generated: 2026-05-26T22:17:10.907Z
Status: PASS

## Input Files

| Lane | Role | File | Status | Reason |
| --- | --- | --- | --- | --- |
| integration | test | tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| integration | test | tests/playwright/integration/ToolsIndexFirstClassToolRegistration.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| integration | helper | tests/helpers/playwrightRepoServer.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | helper | tests/helpers/playwrightStorageIsolation.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | helper | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | helper | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| integration | fixture | games/Pong/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| integration | import | tests/helpers/playwrightRepoServer.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| integration | import | tests/helpers/playwrightStorageIsolation.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| integration | import | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |
| integration | import | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Relative import dependency is resolved and recorded in the manifest. |

## Ownership Validation Failures

No manifest ownership, helper, fixture, import, or runtime command target failures.

## Fast-Fail Enforcement

- Manifest ownership is validated before Playwright/browser launch.
- Helper ownership is validated before execution.
- Fixture ownership is validated before execution.
- Unexpected discovery expansion outside manifest scope blocks runtime scheduling.
- Deterministic manifest failures do not trigger fallback broad discovery.
