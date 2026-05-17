# Playwright V8 Coverage Report

PR: PR_26133_090-object-transform-accordion-and-layout-reorganization

Command: `npm run test:workspace-v2`

Result: PASS

Coverage source: Playwright/Chromium built-in V8 coverage from the final passing workspace-v2 run.

Changed runtime JS coverage:
- `tools/object-vector-studio-v2/js/bootstrap.js`: 83% entry coverage, 110/110 executed lines, 5/6 executed functions.
- `tools/object-vector-studio-v2/js/ToolStarterApp.js`: 94% entry coverage, 8031/8031 executed lines, 783/835 executed functions.

Notes:
- The generated detailed text artifact remains at `docs/dev/reports/playwright_v8_coverage_report.txt`.
- Coverage is advisory for this PR; no new thresholds were introduced.
- The changed runtime JS files were exercised by the passing Playwright run.
