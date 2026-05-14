# PR_26133_028 Playwright V8 Coverage Report

Task: PR_26133_028-remove-vector-map-editor-runtime-dependency
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

- `tools/shared/asteroidsPlatformDemo.js`: not collected by Playwright V8 coverage; covered by focused node probe.
- `tools/shared/vectorAssetSystem.js`: not collected by Playwright V8 coverage; covered by focused node probe.
- Object Vector Studio V2 runtime/editor modules from the prior object-ID path remain covered by the Workspace V2 run.

## PR-Specific Coverage/Validation Relevance

The workspace-v2 run exercises the Object Vector Studio V2 editor and Asteroids runtime paths affected by this PR:

- Asteroids workspace hydration without `vector-map-editor`.
- Object Vector Studio V2 loading/editing of Asteroids objects through `object-vector-studio-v2.objects`.
- Asteroids runtime Object Vector rendering through `object.asteroids.*` IDs.
- Workspace save summaries without vector-map-editor tool state.
- Asteroids manifest schema validation after vector-map removal.

Generated source report: `docs/dev/reports/playwright_v8_coverage_report.txt`.
