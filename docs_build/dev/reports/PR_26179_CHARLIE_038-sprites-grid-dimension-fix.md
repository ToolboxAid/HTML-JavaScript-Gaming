# PR_26179_CHARLIE_038-sprites-grid-dimension-fix

Team: CHARLIE

Mode: Batch governance stacked bug-fix workflow

Base branch: PR_26179_CHARLIE_037-sprites-animation-export

Branch: PR_26179_CHARLIE_038-sprites-grid-dimension-fix

## Summary

Fixed Sprite Creator center canvas grid dimensions. The Sprite Creator page now loads the shared `gamefoundrystudio.css` stylesheet that owns the canvas styles, and the canvas grid uses explicit 16x16 and 32x32 CSS row/column templates instead of an invalid custom-property repeat count. This prevents orphan or partial rows/columns and keeps zoom display controls from changing logical grid dimensions.

## Branch Validation

PASS

- Built from `PR_26179_CHARLIE_037-sprites-animation-export`.
- Scope stayed limited to Sprite Creator grid dimensions and regression coverage.
- No DB/API/schema changes.
- No browser-owned authoritative product data added.
- No start_of_day files changed.
- ZIP package created at the requested path.

## Requirement Checklist

PASS - 16x16 mode renders exactly 16 columns and 16 rows.

PASS - 32x32 mode renders exactly 32 columns and 32 rows.

PASS - Prevents orphan or extra cells at bottom/right edge.

PASS - Zoom levels 100%, 200%, and 400% do not change row/column count.

PASS - Preview/export behavior unchanged.

PASS - No DB/API/schema changes.

PASS - No browser-owned authoritative product data.

PASS - No start_of_day changes.

PASS - Targeted Playwright coverage added.

## Validation Lane

PASS - `node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - `git diff --check -- toolbox/sprites/index.html assets/theme-v2/css/gamefoundrystudio.css dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - Runtime guard scan found no prohibited inline style/script/event-handler or stale placeholder text in touched runtime files.

PASS - `npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list`

## Manual Validation Notes

1. Open `toolbox/sprites/index.html`.
2. Confirm the 16x16 canvas shows a complete square with 16 rows and 16 columns.
3. Switch to 32x32 and confirm a complete 32-row, 32-column grid.
4. Switch through 100%, 200%, and 400% zoom and confirm the cell count and rows/columns do not change.
5. Confirm no partial trailing row or right-edge orphan cells are visible.

## ZIP

`dev/workspace/zip/PR_26179_CHARLIE_038-sprites-grid-dimension-fix_delta.zip`
