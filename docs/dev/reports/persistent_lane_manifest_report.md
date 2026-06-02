# Persistent Lane Manifest Report

Generated: 2026-06-02T20:52:58.654Z
Status: PASS
Manifest directory: docs/dev/reports/lane_manifests

## Summary

Reused manifests: 0
Invalidated manifests: 1
Generated manifests: 0
Prevented discovery scans: 0

## Manifest Events

| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |
| --- | --- | --- | --- | --- | --- |
| workspace-contract | INVALIDATED | docs/dev/reports/lane_manifests/workspace-contract.json | 9a6b43cbeb11938b | 206a508dc4c249d7 | Persistent manifest dependency graph hash changed for workspace-contract.; Persistent manifest input hash changed for workspace-contract.; Persistent manifest hash changed for workspace-contract. |

## Persisted Manifest Files

| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |
| --- | --- | --- | --- | --- | --- | --- | --- |
| workspace-contract | tools | generated | tests/playwright/tools/WorkspaceManagerV2.spec.mjs | tests/helpers/playwrightRepoServer.mjs; tests/helpers/playwrightStorageIsolation.mjs; tests/helpers/playwrightV8CoverageReporter.mjs; tests/helpers/workspaceV2CoverageReporter.mjs | games/AITargetDummy/game.manifest.json; games/Asteroids/game.manifest.json; games/Bouncing-ball/game.manifest.json; games/Breakout/game.manifest.json; games/GravityWell/game.manifest.json; games/InvalidWorkspace/game.manifest.json; games/Pacman/game.manifest.json; games/Pong/game.manifest.json; games/SolarSystem/game.manifest.json; games/SpaceDuel/game.manifest.json; games/SpaceInvaders/game.manifest.json; games/vector-arcade-sample/game.manifest.json; tests/fixtures/workspace-v2/uat.manifest.json | 22d43616972c1154 | 206a508dc4c249d7 |

## Fast-Fail Enforcement

- Persisted manifest metadata must match current lane ownership before reuse.
- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.
- Invalidated manifests are regenerated deterministically before Playwright/browser launch.
- Persisted manifests never trigger fallback broad discovery.
