# PR_26133_026 Playwright V8 Coverage Report

Task: PR_26133_026-object-id-ssot-schema-and-editor-controls
Date: 2026-05-13

## Result

PASS - Coverage reporting was generated during `npm run test:workspace-v2`.

- Test result: 49 passed.
- Coverage source: Playwright/Chromium built-in V8 coverage.
- Thresholds: none enforced.
- Coverage is advisory for this PR.

## Exercised Tool Entry Points

- Workspace Manager V2: 91%, 10 runtime JS files exercised.
- Asset Manager V2: 74%, 13 runtime JS files exercised.
- Preview Generator V2: 82%, 19 runtime JS files exercised.
- Palette Manager V2: 62%, 12 runtime JS files exercised.
- Tool Template V2: not exercised by this Playwright run.
- Workspace Manager: not exercised by this Playwright run.

## Changed Runtime JS Coverage

- `tools/object-vector-studio-v2/js/ToolStarterApp.js`: 94% function coverage, 4190/4190 reported lines executed, 452/483 reported functions executed.
- `games/Asteroids/game/AsteroidsGameScene.js`: 52% function coverage, 846/846 reported lines executed, 25/48 reported functions executed.
- `tools/shared/asteroidsPlatformDemo.js`: not collected by Playwright V8 coverage; covered by focused node test `AsteroidsPlatformDemo.test.mjs`.

## PR-Specific Coverage/Validation Relevance

The workspace-v2 run exercises the Object Vector Studio V2 editor and Asteroids runtime paths changed in this PR:

- triangle geometry layout and controls,
- frame control ordering,
- objectId-based Asteroids Object Vector runtime rendering,
- Workspace Manager game manifest schema loading and validation,
- Object Vector Studio V2 loading of Asteroids workspace objects.

Generated source report: `docs/dev/reports/playwright_v8_coverage_report.txt`.
