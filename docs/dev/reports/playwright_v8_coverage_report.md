# PR_26133_044 Playwright V8 Coverage Report

Task: PR_26133_044-remove-duplicated-object-vector-runtime-bindings
Date: 2026-05-15

## Result

PASS - Coverage reporting was generated during `npm run test:workspace-v2`.

- Coverage source: Playwright/Chromium built-in V8 coverage.
- Thresholds: none enforced.
- Coverage is advisory for this PR.
- Source report: `docs/dev/reports/playwright_v8_coverage.txt`.

## Exercised Tool Entry Points

```text
(82%) Preview Generator V2 - exercised 19 runtime JS files
(74%) Asset Manager V2 - exercised 13 runtime JS files
(62%) Palette Manager V2 - exercised 12 runtime JS files
(91%) Workspace Manager V2 - exercised 10 runtime JS files
```

## Relevant Runtime Coverage

```text
(98%) src/engine/rendering/ObjectVectorRuntimeAssetService.js - executed lines 914/914; executed functions 106/108
(52%) games/Asteroids/game/AsteroidsGameScene.js - executed lines 846/846; executed functions 25/48
```

The Asteroids runtime role helpers and asteroid geometry helper are exercised through the Asteroids gameplay rendering path and targeted node smoke checks; they are not surfaced as separate changed-runtime rows in the generated V8 summary.

## Guardrail

```text
(100%) no changed runtime JS coverage warnings blocked this PR
```

## PR-Specific Note

The Workspace V2 run exercised Object Vector runtime manifest loading from `game.workspace.tools.object-vector-studio-v2.objects`, direct object ID role resolution, runtime rendering for asteroids/ship/UFO, and schema rejection of the removed `game.gameData.objectVectorRuntime` branch.
