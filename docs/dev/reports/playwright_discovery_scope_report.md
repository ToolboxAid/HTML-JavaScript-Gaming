# Playwright Discovery Scope Report

Generated: 2026-05-30T05:14:50.384Z
Status: PASS
Scoped discovery: Yes

## Targeted Discovery Scope

| Role | File | Status | Reason |
| --- | --- | --- | --- |
| target spec | tests/playwright/tools/WorkspaceManagerV2.spec.mjs | PASS | Explicit target is inside the selected discovery lane scope. |
| required shared helper | tests/helpers/playwrightRepoServer.mjs | PASS | Required shared helper was resolved from targeted spec imports. |
| required shared helper | tests/helpers/playwrightStorageIsolation.mjs | PASS | Required shared helper was resolved from targeted spec imports. |
| required shared helper | tests/helpers/playwrightV8CoverageReporter.mjs | PASS | Required shared helper was resolved from targeted spec imports. |
| required shared helper | tests/helpers/workspaceV2CoverageReporter.mjs | PASS | Required shared helper was resolved from targeted spec imports. |
| required fixture | games/AITargetDummy/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/Asteroids/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/Bouncing-ball/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/Breakout/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/GravityWell/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/InvalidWorkspace/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/Pacman/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/Pong/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/SolarSystem/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/SpaceDuel/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/SpaceInvaders/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | games/vector-arcade-sample/game.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |
| required fixture | tests/fixtures/workspace-v2/uat.manifest.json | PASS | Explicit fixture was resolved from lane configuration or targeted file references. |

## Scope Guard

- Targeted lane discovery must use explicit spec files instead of lane-directory targets.
- Required shared helpers must be resolved from targeted imports.
- Required fixtures must come from lane configuration or targeted file references.
- Unaffected Workspace/global lanes must remain outside targeted discovery scope.
- Ownership failures are deterministic blockers and do not trigger fallback discovery expansion.

## Blockers

No scoped discovery blockers.
