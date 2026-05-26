# Test Location Audit Report

Generated: 2026-05-26T17:59:33.363Z
Status: PASS

## Scope

- Tool Playwright specs: tests/playwright/tools
- Game Playwright specs: tests/playwright/games
- Shared helpers: tests/helpers

## Blocking Findings

No blocking test location findings.

## Relocated Game-Owned Specs

| Previous Path | Current Path | Status | Reason |
| --- | --- | --- | --- |
| tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs | tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs | PASS | Game-owned Asteroids Playwright spec is under tests/playwright/games. |
| tests/playwright/tools/AsteroidsBeatTiming.spec.mjs | tests/playwright/games/AsteroidsBeatTiming.spec.mjs | PASS | Game-owned Asteroids Playwright spec is under tests/playwright/games. |
| tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs | tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs | PASS | Game-owned Asteroids Playwright spec is under tests/playwright/games. |
| tests/playwright/tools/AsteroidsShipStateVisuals.spec.mjs | tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs | PASS | Game-owned Asteroids Playwright spec is under tests/playwright/games. |

## Documented Tool Tests With Game Fixtures

| File | Referenced Game Fixture(s) | Reason |
| --- | --- | --- |
| tests/playwright/tools/AssetManagerV2.spec.mjs | Asteroids, GravityWell, Pong | Tool runtime validation uses repo/game manifests as explicit asset payload fixtures. |
| tests/playwright/tools/CollisionInspectorV2.spec.mjs | Asteroids | Tool runtime validation uses game manifests as explicit collision payload fixtures. |
| tests/playwright/tools/WorkspaceManagerV2.spec.mjs | AITargetDummy, Asteroids, Bouncing-ball, Breakout, GravityWell, Pacman, Pong, SolarSystem, SpaceDuel, SpaceInvaders, vector-arcade-sample | Workspace contract validation uses game manifests as explicit launch/toolState fixtures. |

## Intentionally Shared Helpers

| File | Reason |
| --- | --- |
| tests/helpers/playwrightRepoServer.mjs | Shared HTTP repo fixture used by tool, game, and integration Playwright suites. |
| tests/helpers/playwrightStorageIsolation.mjs | Shared localStorage/sessionStorage cleanup helper used before targeted Playwright tests. |
| tests/helpers/workspaceV2CoverageReporter.mjs | Shared V8 coverage collection for Workspace V2 and impacted browser runtime suites. |

## Ownership Rules Checked

- Game-specific Playwright tests must live under tests/playwright/games.
- Tool Playwright tests may use game manifests only as explicit, documented fixtures for tool behavior.
- Shared helper filenames must not include game-specific names.
- Lane execution should stop before expensive Playwright runs when this audit reports blocking findings.
