# Dependency Hydration Reuse Report

Generated: 2026-05-30T05:14:50.401Z
Status: PASS

## Summary

Reused dependency hydration: 1
Invalidated dependency hydration: 0
Generated dependency hydration: 0
Prevented dependency graph hydration: 1
Prevented helper resolution passes: 4
Prevented fixture ownership traversal: 13

## Hydration Decisions

| Lane | Status | Helpers | Fixtures | Imports | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | REUSED | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/AITargetDummy/game.manifest.json; games/Asteroids/game.manifest.json; games/Bouncing-ball/game.manifest.json; games/Breakout/game.manifest.json; games/GravityWell/game.manifest.json; games/InvalidWorkspace/game.manifest.json; games/Pacman/game.manifest.json; games/Pong/game.manifest.json; games/SolarSystem/game.manifest.json; games/SpaceDuel/game.manifest.json; games/SpaceInvaders/game.manifest.json; games/vector-arcade-sample/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 57d5580a00e01e26 | Dependency hydration reused from validated warm-start state. |

## Safeguards

- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.
- Stale hydration metadata is refreshed before runtime and is not reused silently.
- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.
- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs.
