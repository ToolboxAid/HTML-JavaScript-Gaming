# PR_26133_009 Playwright V8 Coverage Report

Coverage source: `docs/dev/reports/playwright_v8_coverage_report.txt`, refreshed by the final `npm run test:workspace-v2` run.

## Summary

- Coverage is advisory only; no thresholds are enforced.
- Workspace Manager V2 entry point: 91%.
- Object Vector Studio V2 runtime coverage entries from the generated report:
  - `tools/object-vector-studio-v2/js/ToolStarterApp.js`: 91%, executed lines 3313/3313, executed functions 348/384.
  - `tools/object-vector-studio-v2/js/bootstrap.js`: 80%, executed lines 99/99, executed functions 4/5.
- The generated report lists `tools/object-vector-studio-v2/js/ToolStarterApp.js` as a changed JS file with browser V8 coverage.

## Validation Context

- Main command: `npm run test:workspace-v2`.
- Result: 46 passed.
- Focused Object Vector Studio V2 layout and preview-coordinate scenarios also passed.
- Manual Object Preview probe confirmed the applied zoom hack values, confirmed default view, max zoom cap, preserved logical coordinates, and no console/runtime errors.
