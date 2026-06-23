# PR_26175_ALFA_003-toolbox-status-bar-single-row-polish Validation Lane

## Commands
```powershell
npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1
```

Result: PASS, 6 tests passed.

```powershell
rg -n "<style|style=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css assets/theme-v2/css/layout.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

Result: PASS, no matches.

## Covered Assertions
- Status bar does not include environment text.
- Removed labels are not visible: `Selected Game Name`, `Selected Game Purpose`, `Save State`, `Tool Action`, `Warning`, and `Error`.
- Selected game name is visible.
- Selected game purpose is not visible.
- Status message is visible in the center area.
- Game name and status message occupy the same row.
- Shared Theme V2 footer top padding is `0px` beneath the status bar.
- Fullscreen status bar remains fixed to the bottom.
- Fullscreen center panel bottom is above the status bar.
- Fullscreen center panel has a bottom reserve equal to the status bar height.
- Idea Board remains excluded from selected-game filtering.
