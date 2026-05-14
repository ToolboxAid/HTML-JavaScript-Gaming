# PR_26133_030 Playwright V8 Coverage Report

Task: PR_26133_030-shape-identity-schema-and-ui-cleanup
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
(0%) tools/shared/vectorAssetSystem.js - WARNING: changed runtime JS file was not collected by Playwright V8 coverage; advisory only
(94%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 4196/4196; executed functions 453/484
(95%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js - executed lines 430/430; executed functions 54/57
(98%) src/engine/rendering/ObjectVectorRuntimeAssetService.js - executed lines 935/935; executed functions 107/109
```

Note: the generated V8 reporter includes `tools/shared/vectorAssetSystem.js` because it also considers HEAD-changed runtime files. This PR did not modify that file.

## PR-Specific Note

The Object Vector Studio V2 app and schema service were collected by V8 coverage in the Workspace V2 run. The runtime object-vector asset service was also collected through the Asteroids runtime-loading flow.
