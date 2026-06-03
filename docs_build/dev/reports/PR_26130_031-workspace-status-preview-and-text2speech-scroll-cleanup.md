# PR_26130_031-workspace-status-preview-and-text2speech-scroll-cleanup

## Summary
- Moved Workspace Manager V2 Active Game summary/status messaging into the existing Status log and removed the `activeGameSummary` paragraph from the Active Game panel.
- Constrained the Active Game panel to content height and reduced the Workspace JSON textarea height from 260px to 240px.
- Updated Preview Generator V2 workspace tile detail text to show only `Preview Found` or `Preview Not Found` based on `assets/images/preview.svg` under the selected game root.
- Consolidated shared palette action labels to the single `Palette Manager` source label and removed the deprecated `Browse Palettes`/`Manage Palettes` shared action split.
- Adjusted Text to Speech V2 page height rules so the page scrollbar appears only when content exceeds the viewport while preserving internal panel scrolling.

## Scope Notes
- No `start_of_day` files changed.
- No Workspace Manager V2 schema contracts were changed.
- No Preview Generator V2 write behavior was changed; this PR only updates the workspace tile/status display.
- Full samples smoke test was intentionally not run.

## Playwright Impacted
Yes.

Validated behavior:
- `activeGameSummary` no longer exists in Workspace Manager V2.
- Active game selection/discovery messages are written to `#statusLog`.
- Active Game panel layout shrinks to content and Workspace JSON height is reduced.
- Preview Generator V2 tile displays `Preview Found` or `Preview Not Found` and does not display `Waiting for manifest`.
- `SHARED_ACTION_LABELS` exposes `Palette Manager` as the single shared action label.
- Text to Speech V2 page scroll is conditional: no page scrollbar when content fits, page scrollbar appears when content is forced past the viewport.

Expected pass behavior:
- `npm run test:workspace-v2` passes all Workspace Manager V2 tests.
- Preview Generator V2 tile detail is preview-existence specific and does not duplicate manifest/general state text.
- Text to Speech V2 keeps panel-level scrollbars while allowing page-level scrolling only when needed.

Expected fail behavior:
- Reintroducing `#activeGameSummary` fails Playwright coverage.
- Reintroducing `Waiting for manifest`, `Browse Palettes`, or multiple shared palette action labels fails updated assertions.
- Regressing Text to Speech V2 page overflow behavior fails the scrollbar coverage.

## Validation
- PASS: `npm run test:workspace-v2` -> 37 passed.
- PASS: Targeted rerun for `loads Text to Speech V2 from URL JSON` during layout fix -> 1 passed.
- PASS: `git diff --check` -> no whitespace errors; CRLF conversion warnings only.
- PASS: Playwright V8 coverage report generated at `docs_build/dev/reports/playwright_v8_coverage_report.txt`.

Coverage highlights for changed runtime JS:
- `(86%) tools/workspace-manager-v2/js/WorkspaceManagerV2App.js`
- `(91%) tools/workspace-manager-v2/js/services/WorkspaceManagerV2ContextService.js`
- `(93%) tools/workspace-manager-v2/js/controls/GameSelectorControl.js`
- `(93%) tools/workspace-manager-v2/js/controls/ToolTilesControl.js`
- `(100%) tools/workspace-manager-v2/js/bootstrap.js`
- `(32%) tools/shared/assetUsageIntegration.js`

## Full Samples Smoke Test
Skipped. This PR is limited to Workspace Manager V2 status/tile presentation, shared palette action labels, and Text to Speech V2 scroll CSS; the required targeted Workspace V2 Playwright suite was run instead.

## Manual Validation
1. Open Workspace Manager V2, confirm Active Game has only the game dropdown and messages appear in Status.
2. Select a game and confirm Preview Generator V2 tile shows `Preview Found` only when `assets/images/preview.svg` exists, otherwise `Preview Not Found`.
3. Open Text to Speech V2 at a tall viewport and confirm the page has no scrollbar until content exceeds the viewport.

## Review Artifacts
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `tmp/PR_26130_031-workspace-status-preview-and-text2speech-scroll-cleanup_delta.zip`
