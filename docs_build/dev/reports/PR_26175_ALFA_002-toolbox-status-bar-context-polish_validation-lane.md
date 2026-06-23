# PR_26175_ALFA_002-toolbox-status-bar-context-polish Validation Lane

## Commands
```powershell
npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1
```

Result: PASS, 6 tests passed.

```powershell
rg -n "<style|style=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

Result: PASS, no matches.

## Covered Assertions
- Status bar does not include environment text.
- Left side displays selected game name.
- Left side displays selected game purpose.
- Left side does not include selected-game status.
- Center displays tool action context.
- Center displays save state context after a Game Hub save.
- Center displays warning context for a Game Hub save-state warning.
- Missing selected game still shows the select/create tool action prompt.
- Idea Board remains excluded from selected-game filtering.
- Normal placement above footer is preserved.
- Fullscreen bottom anchoring is preserved.
- No inline styles or style blocks were added.
