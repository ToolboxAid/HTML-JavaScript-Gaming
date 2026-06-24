# PR_26175_ALFA_001-toolbox-selected-game-status-bar Report

## Summary
Added a shared Theme V2 toolbox status bar for toolbox pages.

## Changes
- Added `assets/theme-v2/js/toolbox-status-bar.js` to render the shared status bar.
- Loaded the status bar through `assets/theme-v2/js/gamefoundry-partials.js` after shared partials and platform banners.
- Added shared Theme V2 status bar styles in `assets/theme-v2/css/status.css`.
- Updated `toolbox/game-hub/game-hub.js` to notify the shared status bar when Game Hub changes the selected game.
- Added targeted Playwright coverage in `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`.

## Contract Notes
- Selected game is read from the existing Game Hub repository through `createServerRepositoryClient("game-hub")`.
- No browser storage is used as selected-game source of truth.
- No API/service routes or payload contracts were changed.
- Idea Board is marked optional for selected-game filtering.
