# PR_26179_CHARLIE_032-sprites-shape-tools

Team: CHARLIE

Mode: Batch governance stacked feature workflow

Base branch: PR_26179_CHARLIE_031-sprites-picker-zoom

Branch: PR_26179_CHARLIE_032-sprites-shape-tools

## Summary

Implemented simple pixel-art shape tools for Sprite Creator. Line, Rectangle, and Circle now use a two-click start/end interaction and write only to the unsaved page-session editor draft. Move remains disabled/deferred. No persistence, database, API, schema, browser-owned authoritative product data, or start_of_day files were changed.

## Branch Validation

PASS

- Built on the previous stacked Sprite branch.
- Scope stayed limited to shape tools.
- Move remains disabled/deferred.
- No DB/API/schema changes.
- No product save/load or authoritative browser-owned product data was added.
- No stale PR #219-#228 code was copied.
- ZIP package created at the user-requested batch path.

## Requirement Checklist

PASS - Line tool implemented with simple pixel-art behavior.

PASS - Rectangle tool implemented with outline behavior.

PASS - Circle tool implemented with outline behavior.

PASS - Shape tools use unsaved page-session editor state only.

PASS - No persistence added.

PASS - No DB/API/schema changes.

PASS - No start_of_day changes.

PASS - Targeted Playwright coverage updated.

## Validation Lane

PASS - `node --check assets/toolbox/sprites/js/index.js`

PASS - `node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - `git diff --check -- toolbox/sprites/index.html assets/toolbox/sprites/js/index.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - Runtime guard scan found no prohibited inline style/script/event-handler or stale placeholder text in touched runtime files.

PASS - `npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list`

## Manual Validation Notes

1. Open `toolbox/sprites/index.html`.
2. Select Line, click a start pixel, then click an end pixel.
3. Confirm a straight pixel-art line appears in the unsaved draft.
4. Clear the canvas.
5. Select Rectangle, click opposite corners, and confirm an outline appears.
6. Clear the canvas.
7. Select Circle, click a center pixel, then click a radius pixel.
8. Confirm a simple pixel-art circle outline appears.
9. Confirm no save, API, database, or product persistence workflow is introduced.

## ZIP

`dev/workspace/zips/PR_26179_CHARLIE_032-sprites-shape-tools_delta.zip`
