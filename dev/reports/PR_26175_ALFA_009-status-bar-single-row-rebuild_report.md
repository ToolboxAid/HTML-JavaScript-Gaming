# PR_26175_ALFA_009-status-bar-single-row-rebuild Report

## Overall Status
PASS

## Summary
ALFA_009 rebuilds the shared toolbox status bar from current clean `main` without merging PR #120 or reusing the stale ALFA_003 branch. The status bar now exposes a single visible row with selected game name on the left and the current status message centered.

## Changes
- Replaced the status bar DOM with only the selected game name and status message as visible content.
- Removed visible status labels: `Selected Game Name`, `Selected Game Purpose`, `Save State`, `Tool Action`, `Warning`, and `Error`.
- Removed selected-game purpose and visible status action links from the status bar.
- Kept status context classification as non-visible dataset state for shared styling and behavior.
- Set shared Theme V2 footer top padding to `0px` while preserving bottom padding.
- Added shared fullscreen reserves so the fixed bottom status bar does not cover the center tool area.
- Preserved Game Hub selected-game ownership and Idea Board selected-game filtering exclusion.
- Updated targeted Playwright coverage for removed labels, visible game/message text, same-row layout, footer top padding, and fullscreen center-panel bounds.

## Files Changed
- `assets/theme-v2/js/toolbox-status-bar.js`
- `assets/theme-v2/css/status.css`
- `assets/theme-v2/css/layout.css`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/BUILD_PR.md`
- ALFA_009 reports and Codex diff/change reports

## Validation
- PASS: `npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1` produced 6 passed, 0 failed after the fullscreen reserve correction.
- PASS: `rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css assets/theme-v2/css/layout.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs` returned no matches.

## Artifact
- `tmp/PR_26175_ALFA_009-status-bar-single-row-rebuild_delta.zip`
