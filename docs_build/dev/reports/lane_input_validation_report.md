# Lane Input Validation Report

Generated: 2026-06-02T20:52:58.654Z
Status: PASS

## Input Files

| Lane | Role | File | Status | Reason |
| --- | --- | --- | --- | --- |
| workspace-contract | test | tests/playwright/tools/WorkspaceManagerV2.spec.mjs | PASS | Manifest test input is explicit, present, and owned by the lane. |
| workspace-contract | helper | tests/helpers/playwrightRepoServer.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | helper | tests/helpers/playwrightStorageIsolation.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | helper | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | helper | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Reusable helper is explicit, present, and shared-helper owned. |
| workspace-contract | fixture | games/AITargetDummy/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/Asteroids/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/Bouncing-ball/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/Breakout/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/GravityWell/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/InvalidWorkspace/game.manifest.json | PASS | Fixture is an explicit virtual Workspace repo input and allowed for the lane ownership. |
| workspace-contract | fixture | games/Pacman/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/Pong/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/SolarSystem/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/SpaceDuel/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/SpaceInvaders/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | games/vector-arcade-sample/game.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
| workspace-contract | fixture | tests/fixtures/workspace-v2/uat.manifest.json | PASS | Fixture is explicit, present, and allowed for the lane ownership. |
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
