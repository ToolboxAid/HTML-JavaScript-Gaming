# PR_26175_ALFA_001-toolbox-selected-game-status-bar Validation Lane

## Commands
```powershell
npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1
```

Result: PASS, 5 tests passed.

```powershell
rg -n "<style|style=" assets/theme-v2/js/gamefoundry-partials.js assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css toolbox/game-hub/game-hub.js tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

Result: PASS, no matches.

## Covered Assertions
- Shared status bar appears above the footer in normal mode.
- Shared status bar is fixed to the viewport bottom in tool display mode.
- Left side displays the Game Hub selected game.
- Center area displays existing tool status messages and missing-game prompts.
- Game Hub selected-game changes refresh the global status bar.
- Non-Idea Board toolbox pages show the creator-safe select/create prompt when no Game Hub game is selected.
- Idea Board remains excluded from selected-game filtering.
- No inline styles or style blocks were added.
