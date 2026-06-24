# PR_26175_ALFA_011 Validation Lane

## Playwright
Command:

```powershell
npx playwright test tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs --workers=1
```

Result:

```text
Running 7 tests using 1 worker
7 passed
```

Covered:
- Existing selected Game Hub game appears on the left.
- Existing center status message behavior is preserved.
- Right progress text renders in the required format.
- Objects example renders as `Objects 12/25 (48%) | Journey 12/125 (10%)`.
- Game Hub save state keeps center status behavior and right progress.
- Fullscreen/tool display mode keeps the fixed bottom status bar and content reserve.
- Game Hub owner selection updates global status context.
- Missing-game prompt remains creator-safe.
- Idea Board remains excluded from selected-game filtering.

## Style And Scope
Command:

```powershell
rg -n "<[s]tyle|[s]tyle=" assets/theme-v2/js/toolbox-status-bar.js assets/theme-v2/css/status.css tests/playwright/tools/ToolboxSelectedGameStatusBar.spec.mjs
```

Result: PASS. The command returned no matches.

## Generated Files
Playwright updated generated coverage reports during validation. They were restored to `HEAD` because they are outside this PR's exact target list.
