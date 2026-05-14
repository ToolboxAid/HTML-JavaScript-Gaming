# PR_26133_027 Playwright V8 Coverage Report

Task: PR_26133_027-object-id-ssot-manifest-schema-cleanup
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
- `tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`: 95% function coverage, 411/411 reported lines executed, 53/56 reported functions executed.
- `src/engine/rendering/ObjectVectorRuntimeAssetService.js`: 98% function coverage, 916/916 reported lines executed, 106/108 reported functions executed.

## PR-Specific Coverage/Validation Relevance

The workspace-v2 run exercises the Object Vector Studio V2 editor and Asteroids runtime paths changed in this PR:

- Object Vector Studio V2 schema rejection for duplicate runtime identity aliases.
- Object Vector Studio V2 assetLibrary hydration through `object.*` IDs.
- Asset library inheritance and runtime preview resolution through object IDs.
- Asteroids runtime Object Vector rendering through `object.asteroids.*` IDs.
- Triangle/non-triangle polygon point control behavior.
- Duplicate Frame control ordering.

Generated source report: `docs/dev/reports/playwright_v8_coverage_report.txt`.
