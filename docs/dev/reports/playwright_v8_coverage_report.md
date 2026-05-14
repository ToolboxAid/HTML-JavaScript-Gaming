# PR_26133_032 Playwright V8 Coverage Report

Task: PR_26133_032-object-vector-schema-geometry-and-style-ssot
Date: 2026-05-14

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
(83%) tools/object-vector-studio-v2/js/bootstrap.js - executed lines 109/109; executed functions 5/6
(93%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 4345/4345; executed functions 451/483
(95%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js - executed lines 417/417; executed functions 53/56
(98%) src/engine/rendering/ObjectVectorRuntimeAssetService.js - executed lines 915/915; executed functions 107/109
```

## Guardrail

```text
(100%) none - no changed runtime JS coverage warnings
```

## PR-Specific Note

The Workspace V2 run exercised the Object Vector Studio V2 editor, schema service, runtime object-vector asset service, Asteroids runtime object-vector loading, and browser UI paths for fill/stroke opacity plus point2d geometry. Coverage remains advisory only.
