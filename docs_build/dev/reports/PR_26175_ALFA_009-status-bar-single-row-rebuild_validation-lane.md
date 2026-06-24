# PR_26175_ALFA_009-status-bar-single-row-rebuild Validation Lane

## Commands
| Command | Status | Evidence |
| --- | --- | --- |
| `npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1` | PASS | Final run passed 6/6 tests. Coverage includes normal placement above footer, no visible removed labels, no visible purpose, save message updates, fullscreen bottom anchoring, center panel bottom above status bar, Game Hub selection updates, missing-game prompt, and Idea Board exclusion. |
| `rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css assets/theme-v2/css/layout.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs` | PASS | No inline style or style block matches. |

## Notes
- An interim Playwright run failed the fullscreen center-panel bound assertion. The failure showed the center panel still extended below the fixed status bar.
- The final fix adds shared Theme V2 top and bottom reserves in `assets/theme-v2/css/status.css`, including the platform banner reserve used in tool display mode.
- Playwright-generated coverage reports were restored because they are outside ALFA_009 exact targets.
