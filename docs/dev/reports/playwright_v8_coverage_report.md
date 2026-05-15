# PR_26133_041 Playwright V8 Coverage Report

Task: PR_26133_041-object-transform-summary-and-runtime-validation-cleanup
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
(94%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 4733/4733; executed functions 488/517
(82%) games/Asteroids/game/asteroidsObjectVectorRoles.js - executed lines 176/176; executed functions 14/17
```

## Changed Test Coverage Note

```text
(0%) tests/games/AsteroidsAssetReferenceAdoption.test.mjs - changed JS file not collected as browser runtime coverage
(0%) tests/games/AsteroidsPlatformDemo.test.mjs - changed JS file not collected as browser runtime coverage
(0%) tests/playwright/tools/WorkspaceManagerV2.spec.mjs - changed JS file not collected as browser runtime coverage
```

CSS changes in `tools/object-vector-studio-v2/styles/toolStarter.css` and `src/engine/ui/hubCommon.css` are verified through Playwright DOM/CSS assertions rather than V8 JavaScript coverage.

## Guardrail

```text
(100%) no changed runtime JS coverage warnings blocked this PR
```

## PR-Specific Note

The Workspace V2 run exercised Object Vector Studio V2 Scale input styling, singular transform summary formatting, Rotate normalization, Object Geometry Delete Point(s) labeling, Asteroids runtime binding validation without object tag checks, and hub CSS spacing assertions. Coverage remains advisory only.
