# Playwright V8 Coverage Report

PR: PR_26133_087-grid-off-color-and-auto-center-balance

Command: `npm run test:workspace-v2`

Result: PASS

Coverage source: Playwright/Chromium built-in V8 coverage from the final passing workspace-v2 run.

Changed runtime JS coverage:
- `tools/object-vector-studio-v2/js/bootstrap.js`: 83% entry coverage, 110/110 executed lines, 5/6 executed functions.
- `tools/object-vector-studio-v2/js/ToolStarterApp.js`: 95% entry coverage, 7498/7498 executed lines, 751/789 executed functions.

Notes:
- The generated detailed text artifact remains at `docs/dev/reports/playwright_v8_coverage_report.txt`.
- Coverage is advisory for this PR; no new thresholds were introduced.
- Changed runtime JS files were exercised by the passing Playwright run.
