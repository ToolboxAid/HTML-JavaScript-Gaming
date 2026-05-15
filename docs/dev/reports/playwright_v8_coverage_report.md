# PR_26133_047 Playwright V8 Coverage Report

Task: PR_26133_047-frame-state-help-and-frame-id-generation-fix
Date: 2026-05-15

## Result

PASS - Coverage reporting was generated during `npm run test:workspace-v2`.

- Coverage source: Playwright/Chromium built-in V8 coverage.
- Thresholds: none enforced.
- Coverage is advisory for this PR.
- Source report: `docs/dev/reports/playwright_v8_coverage.txt`.

## Exercised Tool Entry Points

```text
(82%) Preview Generator V2 - exercised 19 runtime JS files
(74%) Asset Manager V2 - exercised 13 runtime JS files
(62%) Palette Manager V2 - exercised 12 runtime JS files
(91%) Workspace Manager V2 - exercised 10 runtime JS files
```

## Relevant Runtime Coverage

```text
(80%) tools/object-vector-studio-v2/js/bootstrap.js - executed lines 97/97; executed functions 4/5
(90%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 3187/3187; executed functions 331/369
(95%) tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js - executed lines 409/409; executed functions 53/56
```

## Guardrail

```text
(100%) no changed runtime JS coverage warnings blocked this PR
```

## PR-Specific Note

The Workspace V2 run exercised Object Vector Studio V2 state selection, contextual state help text, legacy state/frame manifest loading, generic frame duplication, playback, runtime preview, and export paths.
