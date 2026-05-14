# PR_26133_031 Playwright V8 Coverage Report

Task: PR_26133_031-shape-schema-field-reduction
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
(93%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 4243/4243; executed functions 450/483
(95%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js - executed lines 434/434; executed functions 56/59
(98%) src/engine/rendering/ObjectVectorRuntimeAssetService.js - executed lines 949/949; executed functions 111/113
```

## Guardrail

```text
(100%) none - no changed runtime JS coverage warnings
```

## PR-Specific Note

The Workspace V2 run exercised the Object Vector Studio V2 editor, schema service, and runtime object-vector asset service using the reduced shape contract. Coverage remains advisory only.
