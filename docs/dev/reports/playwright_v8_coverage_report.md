# PR_26133_035 Playwright V8 Coverage Report

Task: PR_26133_035-object-id-slug-normalization
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
(93%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 4350/4350; executed functions 456/488
(95%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js - executed lines 453/453; executed functions 55/58
(97%) src/engine/rendering/ObjectVectorRuntimeAssetService.js - executed lines 1056/1056; executed functions 123/127
```

## Guardrail

```text
(100%) none - no changed runtime JS coverage warnings
```

## PR-Specific Note

The Workspace V2 run exercised Object Vector Studio V2 rename, duplicate, save/load, schema validation, and Asteroids runtime Object Vector rendering with canonical object ids. Coverage remains advisory only.
