# PR_26133_033 Playwright V8 Coverage Report

Task: PR_26133_033-asteroids-collision-and-object-vector-schema-defaults
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
(93%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 4333/4333; executed functions 453/485
(95%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js - executed lines 453/453; executed functions 55/58
(98%) src/engine/rendering/ObjectVectorRuntimeAssetService.js - executed lines 915/915; executed functions 107/109
```

## Guardrail

```text
(100%) none - no changed runtime JS coverage warnings
```

## PR-Specific Note

The Workspace V2 run exercised Object Vector Studio V2 launch, schema loading, schema-driven shape creation, generated Asteroids object-vector payload validation, and Asteroids runtime object-vector loading. Coverage remains advisory only.
