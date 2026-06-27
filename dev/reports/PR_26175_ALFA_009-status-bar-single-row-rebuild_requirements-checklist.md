# PR_26175_ALFA_009-status-bar-single-row-rebuild Requirements Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Start from clean synced `main` at `d9724b19b3f384aed1a082c3461ece4c16fe0f12` | PASS | Guardrail checks passed before branch creation: branch `main`, clean worktree, sync `0/0`, requested commit. |
| Do not merge PR #120 | PASS | ALFA_009 was rebuilt on a fresh branch from `main`; no PR #120 merge was performed. |
| Do not reuse stale ALFA_003 branch | PASS | Work was done on `codex/pr-26175-alfa-009-status-bar-single-row-rebuild`. |
| Status bar displays only selected game name on left and status message in center | PASS | `toolbox-status-bar.js` renders only `[data-toolbox-selected-game-name]` and `[data-toolbox-status-message]` as visible bar content. |
| Remove visible labels | PASS | Playwright asserts the status bar does not contain `Selected Game Name`, `Selected Game Purpose`, `Save State`, `Tool Action`, `Warning`, or `Error`. |
| Remove selected-game purpose from visible status bar | PASS | Purpose DOM is removed and Playwright asserts `[data-toolbox-selected-game-purpose]` has count `0`. |
| Remove extra footer top gap and make footer top padding resolve to `0px` | PASS | Shared `.footer` padding now starts at `var(--space-0)`, and Playwright verifies computed footer top padding is `0`. |
| Use shared Theme V2 styling | PASS | Changes are in `assets/theme-v2/css/status.css` and `assets/theme-v2/css/layout.css`; no inline styles or page-local CSS were added. |
| Preserve fullscreen bottom anchoring | PASS | Playwright verifies the status bar is fixed and bottom gap is within 2px in tool display mode. |
| Center scrollable content stops above status bar | PASS | Playwright verifies `.tool-center-panel` bottom is above the status bar top in tool display mode. |
| No content hidden behind status bar | PASS | Fullscreen workspace and columns reserve the platform banner and status bar height in shared CSS. |
| Preserve Idea Board exclusion | PASS | Playwright verifies Idea Board remains optional and does not show the missing-game prompt. |
| Preserve Game Hub selected-game ownership | PASS | Status bar still reads selected game through the existing Game Hub repository client; no API/service contract changes were made. |
| Update targeted Playwright coverage | PASS | `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs` was updated and passed. |
| Produce required reports and ZIP | PASS | ALFA_009 report, validation lane, checklist, Codex reports, and delta ZIP were created. |
