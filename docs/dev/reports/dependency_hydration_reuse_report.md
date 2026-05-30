# Dependency Hydration Reuse Report

Generated: 2026-05-30T04:24:21.886Z
Status: PASS

## Summary

Reused dependency hydration: 0
Invalidated dependency hydration: 1
Generated dependency hydration: 0
Prevented dependency graph hydration: 0
Prevented helper resolution passes: 0
Prevented fixture ownership traversal: 0

## Hydration Decisions

| Lane | Status | Helpers | Fixtures | Imports | Dependency Hydration Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | INVALIDATED | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/AITargetDummy/game.manifest.json; games/Asteroids/game.manifest.json; games/Bouncing-ball/game.manifest.json; games/Breakout/game.manifest.json; games/GravityWell/game.manifest.json; games/InvalidWorkspace/game.manifest.json; games/Pacman/game.manifest.json; games/Pong/game.manifest.json; games/SolarSystem/game.manifest.json; games/SpaceDuel/game.manifest.json; games/SpaceInvaders/game.manifest.json; games/vector-arcade-sample/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 57d5580a00e01e26 | Dependency hydration was refreshed after warm-start invalidation. |

## Safeguards

- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.
- Stale hydration metadata is refreshed before runtime and is not reused silently.
- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.
- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs.
