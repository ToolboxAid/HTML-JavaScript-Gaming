# PR_26133_054 Playwright V8 Coverage Report

Task: PR_26133_054-group-regroup-group-move-and-state-delete-restore
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
(91%) Workspace Manager V2 - exercised 10 runtime JS files
```

## Relevant Runtime Coverage

```text
(95%) tools/object-vector-studio-v2/js/ToolStarterApp.js - executed lines 5213/5213; executed functions 564/591
```

## Guardrail

```text
(100%) none - no changed runtime JS coverage warnings
```

## PR-Specific Note

The Workspace V2 run exercised Object Vector Studio V2 regroup behavior, selected-group movement, single-shape movement, state add/delete controls, final-state delete prevention, dirty-state tracking, schema validation, and Asteroids runtime object-vector rendering.
