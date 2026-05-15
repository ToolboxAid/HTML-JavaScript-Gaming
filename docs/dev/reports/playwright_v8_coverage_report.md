# PR_26133_040 Playwright V8 Coverage Report

Task: PR_26133_040-object-transform-one-line-control-layout
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
(94%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 4709/4709; executed functions 487/516
```

## Changed Test Coverage Note

```text
(0%) tests/playwright/tools/WorkspaceManagerV2.spec.mjs - changed JS file not collected as browser runtime coverage
```

## Guardrail

```text
(100%) no changed runtime JS coverage warnings blocked this PR
```

## PR-Specific Note

The Workspace V2 run exercised Object Vector Studio V2 one-line Move, Origin, Rotate, and Scale transform controls, transform summary rendering, preserved transform actions, and Object Transform no-console-error paths. Coverage remains advisory only.
