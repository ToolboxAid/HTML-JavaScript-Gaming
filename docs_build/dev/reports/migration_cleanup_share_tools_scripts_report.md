# PR_26154_021 Migration Cleanup, Share, Tools, Scripts Report

## Scope

This PR continues the root migration cleanup without modifying `start_of_day/`, `old-tools/`, `old_games/`, or `old_samples/`.

Changed:

- Added a display-only Staff Picks section under Trending Games in `index.html`.
- Expanded `Build · Play · Share` guidance in `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Removed deprecated-only old game/sample script commands from root `package.json`.
- Removed deprecated-only old game/sample generator, audit, presentation, and skip-wrapper scripts.
- Removed old game template contract test wiring retained only for deprecated `old_games/` coverage.
- Removed unreferenced duplicate `assets/theme/v2/js/tools-page-accordions.js`.

## Games Index

`index.html` now includes a Staff Picks display-only block under Trending Games.

- Uses existing Theme V2 classes: `section-head`, `trending-grid`, `game-tile`, `game-art`, and `game-meta`.
- Adds no CSS.
- Adds no JavaScript.
- Adds no dynamic behavior.
- Reuses existing game image assets from `games/assets/images/`.

Note: `index.html` already had an uncommitted dual-entry card order change before this PR started. It was preserved and not reverted.

## Tools Cleanup

Active tools surface:

- `toolbox/index.html` loads `toolbox/tools-page-accordions.js`.
- Active `toolbox/tools-page-accordions.js` does not contain an Arcade tile.
- Active tools links in `toolbox/tools-page-accordions.js` resolve.

Removed:

- `assets/theme/v2/js/tools-page-accordions.js`

Reason:

- It was an unreferenced duplicate tools accordion script.
- It still contained an Arcade entry.
- No active page referenced it.

Ambiguous or active items retained:

- `toolbox/_tool_template-v2/`: retained because project instructions define it as the required first-class tool template source.
- `toolbox/shared/`: retained because active tests, scripts, and Workspace V2 paths still import it; moving it would be a separate shared-dependency cleanup.
- `toolbox/dev/`: retained because package guard scripts actively reference it.
- `toolbox/schemas/`: retained because active tool/schema validation still references tool schemas.
- `toolbox/toolRegistry.js` and `toolbox/renderToolsIndex.js`: retained because active tests and tool launch support import them.

## Capture Runtime

`toolbox/shared/tooling/CapturePreviewRuntime.js` no longer exists in the current checkout.

Checks:

- No active references to `CapturePreviewRuntime` remain outside docs/reports/deprecated folders.
- No active references to `bootCapturePreview` remain outside docs/reports/deprecated folders.

Result:

- No delete or move was needed in this PR because the file had already been removed.

## Scripts Cleanup

Removed deprecated-only files:

- `scripts/audit-sample-json-ownership.mjs`
- `scripts/generate-curriculum-validation-artifact.mjs`
- `scripts/generate-runtime-sample-previews.mjs`
- `scripts/generate-sample-manifest.mjs`
- `scripts/generate-samples-index.mjs`
- `scripts/normalize-games-presentation.mjs`
- `scripts/normalize-samples-presentation.mjs`
- `scripts/sync-tool-hints-from-workspace-manager.mjs`
- `scripts/validate-games-template-contract.mjs`
- `scripts/PS/audit-sample-json-js-references.ps1`
- `scripts/PS/audit-sample-json-lockdown.ps1`
- `scripts/PS/audit-samples-only-palette-json.ps1`
- `scripts/PS/validate-sample-json.ps1`
- `tests/tools/GamesTemplateContractEnforcement.test.mjs`
- `tests/validation/skip-deprecated-game-tests.mjs`
- `tests/validation/skip-deprecated-sample-tests.mjs`

Package script cleanup:

- Removed `build:manifest`.
- Removed `build:curriculum-validation-artifact`.
- Removed `sync:tool-hints`.
- Removed `normalize:games-presentation`.
- Removed `check:games-template-contract`.
- Removed deprecated old game/sample test wrapper scripts.

Root `package.json` was kept at repo root.

Retained with reason:

- `scripts/run-targeted-test-lanes.mjs`: active validation router; its old game/sample lane metadata excludes deprecated lanes from active automated validation.
- `scripts/validate-json-contracts.mjs`: general JSON validator with multiple modes; not solely a deprecated old game/sample script.
- `scripts/validate-asset-ownership-strategy.mjs`: retained because it is still imported by active test wiring and validates mixed asset ownership strategy, not just deprecated paths.

## Share Guidance

`docs_build/dev/PROJECT_INSTRUCTIONS.md` now describes:

- Build: tools and creation flow, including asset creation, prototypes, systems, and publishing preparation.
- Play: games and discovery, including playable games, arcade browsing, testing, and saves.
- Share: public game pages, share links, creator profiles, marketplace assets, tutorials/community, ratings, and future publish/export flows.

## Validation

Executed:

- `node --check tests/run-tests.mjs`
- `node --check toolbox/tools-page-accordions.js`
- `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('PASS package.json parse')"`
- `git diff --check`
- Static `index.html` Staff Picks and image-path validation.
- Targeted reference checks for removed deprecated script/test names.
- Targeted reference checks for active Tools index Arcade state.
- Targeted reference checks for `CapturePreviewRuntime` and `bootCapturePreview`.
- Active tools accordion link resolution.

Results:

- PASS: `package.json` parses.
- PASS: `tests/run-tests.mjs` parses.
- PASS: `toolbox/tools-page-accordions.js` parses.
- PASS: active tools accordion links resolve.
- PASS: active Tools index has no Arcade tile.
- PASS: removed deprecated script/test names have no active references in `package.json`, `scripts/`, or `tests/`.
- PASS: `CapturePreviewRuntime` and `bootCapturePreview` have no active references outside docs/reports/deprecated folders.
- PASS: `index.html` Staff Picks markup is static and uses existing assets/classes.
- PASS: `git diff --check`.

Skipped:

- `npm run test:workspace-v2`: skipped because active Workspace V2 launch/navigation behavior was not changed.
- Full samples smoke test: skipped per request.
- Tests against `old-tools/`, `old_games/`, and `old_samples`: skipped per request.
