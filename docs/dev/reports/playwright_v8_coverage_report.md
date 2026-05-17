# Playwright V8 Coverage Report

PR: PR_26133_093-game-only-manifest-origin-and-transform-fixes

Command: `npm run test:workspace-v2`

Result: PASS

Coverage source: Playwright/Chromium built-in V8 coverage from the passing workspace-v2 run.

Changed runtime JavaScript exercised by V8 coverage:
- `tools/object-vector-studio-v2/js/ToolStarterApp.js`
- `tools/object-vector-studio-v2/js/services/ObjectVectorStudioV2SchemaService.js`
- `tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `src/engine/rendering/ObjectVectorRuntimeAssetService.js`
- `games/shared/workspaceGameAssetCatalog.js`

Notes:
- The detailed generated artifact remains at `docs/dev/reports/playwright_v8_coverage.txt`.
- The run reported no low-coverage changed runtime JS files.
- Coverage is advisory for this PR; no new thresholds were introduced.
