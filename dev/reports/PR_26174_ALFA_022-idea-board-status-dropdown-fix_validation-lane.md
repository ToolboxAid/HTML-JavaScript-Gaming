# Validation Lane

## PASS

- `node --check toolbox/idea-board/index.js`
- `git diff --check`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --workers=1`

## WARN

- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --workers=1 --grep "Idea Board launches"` reached the updated Idea Board status option assertions, then failed because the page recorded `500 http://127.0.0.1:51166/api/game-journey/completion-metrics`.
