# PR_26175_ALFA_001-toolbox-selected-game-status-bar

## Purpose
Add one shared Theme V2 toolbox status bar that surfaces the Game Hub selected game and current tool messages across toolbox pages.

## Source Of Truth
This `BUILD_PR.md` is the source of truth for `PR_26175_ALFA_001-toolbox-selected-game-status-bar`.

## Exact Scope
- Add a shared toolbox status bar renderer loaded through Theme V2 shared partial bootstrapping.
- Render the status bar above the footer in normal page mode.
- Anchor the status bar to the viewport bottom while `body.tool-focus-mode` is active.
- Read the selected game only from the Game Hub repository through the existing Local API/service contract.
- Display the selected Game Hub game on the left side of the status bar.
- Display tool actions, warnings, errors, save state, validation messages, or the missing-game prompt in the center of the status bar.
- Expose the selected Game Hub game as derived page context for toolbox pages without persisting browser-owned product data.
- Require selected-game context on toolbox pages except Idea Board, which remains excluded because ideas can exist before game creation.
- Show a creator-safe prompt to select or create a game in Game Hub when no selected game exists.
- Notify the shared status bar when Game Hub changes the selected game.
- Add targeted Playwright coverage for placement, fullscreen anchoring, selected-game display/update, missing-game prompt, and Idea Board exclusion.

## Exact Targets
- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/js/toolbox-status-bar.js`
- `assets/theme-v2/css/status.css`
- `toolbox/game-hub/game-hub.js`
- `tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs`
- `docs_build/dev/reports/PR_26175_ALFA_001-toolbox-selected-game-status-bar_report.md`
- `docs_build/dev/reports/PR_26175_ALFA_001-toolbox-selected-game-status-bar_validation-lane.md`
- `docs_build/dev/reports/PR_26175_ALFA_001-toolbox-selected-game-status-bar_requirements-checklist.md`

## Out Of Scope
- No engine core changes.
- No `start_of_day` folder changes.
- No API/service contract changes.
- No page-local CSS, inline styles, or style blocks.
- No browser storage or browser-owned product data as selected-game source of truth.
- No Idea Board selected-game filtering.

## Validation
Run:

```powershell
npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1
```

Also verify the changed source does not introduce inline styles or style blocks:

```powershell
rg -n "<style|style=" assets/theme-v2/js/gamefoundry-partials.js assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css toolbox/game-hub/game-hub.js tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

## Artifact
Create repo-structured delta ZIP:

```text
tmp/PR_26175_ALFA_001-toolbox-selected-game-status-bar_delta.zip
```
