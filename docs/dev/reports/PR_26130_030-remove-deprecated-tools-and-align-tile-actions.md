# PR_26130_030-remove-deprecated-tools-and-align-tile-actions

## Summary
- Removed Asset Browser / Import Hub and Tile Model Converter from active tool registration, Tools Index rendering, workspace/tool shared navigation, project adapter/toolState hooks, schema metadata, starter template state, and deprecated targeted tests.
- Deleted the deprecated tool implementation folders and their tool payload schemas.
- Updated Workspace Manager V2 tool tiles so the action row has a fixed height and is anchored to the bottom of each tile across varied count/description text.
- Added/updated Workspace Manager V2 Playwright coverage for removed registry/index/workspace launch paths and fixed tile action layout metrics.

## Scope Notes
- No `start_of_day` files changed.
- No full sample JSON alignment was attempted.
- Historical docs/reports and legacy runtime compatibility references were not rewritten unless they were active current-tool availability references.
- Asset Manager V2's explicit guard rejecting old `tools.asset-browser` workspace payloads remains intentionally in place as a negative validation path.

## Playwright Impacted
Yes.

Validated behavior:
- Asset Browser / Import Hub is absent from the Tools Index and tool registry.
- Tile Model Converter is absent from the Tools Index and tool registry.
- Removed tools have no active sample launch definitions and their old direct tool folders return 404.
- Removed tools do not render as Workspace Manager V2 tool tiles.
- Workspace Manager V2 tool tile action rows have fixed height, fixed chip height, and consistent bottom alignment.

Expected pass behavior:
- `npm run test:workspace-v2` passes all Workspace Manager V2 tests.
- Removed tool IDs are unavailable from registry/launch lookup and do not render in Workspace Manager V2.
- Workspace tool action chips stay aligned at the bottom of fixed-height tiles.

Expected fail behavior:
- Any reintroduced `asset-browser` or `tile-model-converter` registry, index, launch, or workspace tile path fails the updated Playwright assertions.
- Any tile action row height or bottom-baseline drift fails the layout metric assertions.

## Validation
- PASS: `npm run test:workspace-v2` -> 36 passed.
- PASS: `node --test tests/tools/ToolSchemaStrictModeValidation.test.mjs`.
- PASS: `node --check` on changed runtime/test JavaScript files spot-checked during implementation.
- PASS: JSON parse check for changed JSON files.
- PASS: `git diff --check`.
- PASS: Playwright V8 coverage report generated at `docs/dev/reports/playwright_v8_coverage_report.txt`.

Coverage highlights for changed runtime JS:
- `(100%) tools/renderToolsIndex.js - changed JS file with browser V8 coverage`
- `(93%) tools/workspace-manager-v2/js/controls/ToolTilesControl.js - changed JS file with browser V8 coverage`
- `(91%) tools/toolRegistry.js - changed JS file with browser V8 coverage`
- `(32%) tools/shared/platformShell.js - changed JS file with browser V8 coverage`
- `(9%) tools/shared/projectSystemAdapters.js - changed JS file with browser V8 coverage`
- `(6%) tools/shared/projectToolIntegration.js - changed JS file with browser V8 coverage`

## Full Samples Smoke Test
Skipped. This PR removes deprecated active tool availability and adjusts Workspace Manager V2 tile styling; targeted Workspace V2 Playwright coverage is the required validation gate. Full sample smoke remains out of scope and intentionally was not run.

## Manual Validation
1. Open `tools/index.html` and confirm Asset Browser / Import Hub and Tile Model Converter are not listed.
2. Open Workspace Manager V2, pick the repo, select Asteroids, and confirm the six remaining workspace tiles render without the removed tools.
3. Confirm each workspace tile keeps How To Use and Read Me action chips pinned to the bottom of the tile.
4. Try the old direct paths `/tools/Asset%20Browser/index.html` and `/tools/Tile%20Model%20Converter/index.html`; both should be unavailable.

## Review Artifacts
- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- `docs/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26130_030-remove-deprecated-tools-and-align-tile-actions_delta.zip`
