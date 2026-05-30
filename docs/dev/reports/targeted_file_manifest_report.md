# Targeted File Manifest Report

Generated: 2026-05-30T04:24:21.887Z
Status: PASS

## Manifest-Generated Lane Inputs

| Lane | Ownership | Status | Source | Tests | Helpers | Fixtures | Imports / Dependencies | Dependency Graph Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | tools | PASS | generated | tests/playwright/tools/WorkspaceManagerV2.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/AITargetDummy/game.manifest.json; games/Asteroids/game.manifest.json; games/Bouncing-ball/game.manifest.json; games/Breakout/game.manifest.json; games/GravityWell/game.manifest.json; games/InvalidWorkspace/game.manifest.json; games/Pacman/game.manifest.json; games/Pong/game.manifest.json; games/SolarSystem/game.manifest.json; games/SpaceDuel/game.manifest.json; games/SpaceInvaders/game.manifest.json; games/vector-arcade-sample/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | 4138c2ded15059b2 | 609f65144d9891aa | Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime. |

## Discovery Expansion Control

Prevented discovery expansion: Yes
Prevented redundant scans: 4
Targeted file/helper reads: 5

## Runtime Savings Observations

- Each selected lane receives one deterministic manifest before runtime scheduling.
- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.
- Runtime command targets must be declared by the lane manifest before browser launch.
- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution.
