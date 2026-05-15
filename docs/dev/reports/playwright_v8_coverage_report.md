# PR_26133_036 Playwright V8 Coverage Report

Task: PR_26133_036-asteroids-manifest-name-validation-no-fallback
Date: 2026-05-15

## Result

PASS - Coverage reporting was generated during `npm run test:workspace-v2`.

- Coverage source: Playwright/Chromium built-in V8 coverage.
- Thresholds: none enforced.
- Coverage is advisory for this PR.
- Source report: `docs/dev/reports/playwright_v8_coverage_report.txt`.

## Exercised Tool Entry Points

```text
(82%) Preview Generator V2 - exercised 19 runtime JS files
(74%) Asset Manager V2 - exercised 13 runtime JS files
(62%) Palette Manager V2 - exercised 12 runtime JS files
(0%) Tool Template V2 - not exercised by this Playwright run
(91%) Workspace Manager V2 - exercised 10 runtime JS files
(0%) Workspace Manager - not exercised by this Playwright run
```

## Changed Runtime JS Coverage

```text
(97%) src/engine/rendering/ObjectVectorRuntimeAssetService.js - executed lines 1145/1145; executed functions 123/127
```

Additional changed Asteroids runtime modules were exercised by the Workspace V2 Asteroids gameplay rendering test:

```text
(50%) games/Asteroids/index.js - executed lines 211/211; executed functions 6/12
(52%) games/Asteroids/game/AsteroidsGameScene.js - executed lines 874/874; executed functions 26/50
```

## Guardrail

```text
(100%) no changed runtime JS coverage warnings blocked this PR
```

## PR-Specific Note

The Workspace V2 run exercised Asteroids Object Vector manifest loading, strict runtime binding validation, duplicate medium-candidate diagnostics, and gameplay rendering with manifest-selected object IDs. Coverage remains advisory only.
