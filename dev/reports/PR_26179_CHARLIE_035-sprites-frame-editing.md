# PR_26179_CHARLIE_035-sprites-frame-editing

Team: CHARLIE

Mode: Batch governance stacked feature workflow

Base branch: PR_26179_CHARLIE_034-sprites-frame-strip

Branch: PR_26179_CHARLIE_035-sprites-frame-editing

## Summary

Added unsaved page-session frame editing for Sprite Creator. Creators can add, duplicate, select, and delete frames in the frame strip. Each frame keeps its own draft pixel map in page-session state only. No persistence, database, API, schema, or product-data source-of-truth behavior was introduced.

## Branch Validation

PASS

- Built from `PR_26179_CHARLIE_034-sprites-frame-strip`.
- Scope stayed limited to unsaved frame editing.
- No DB/API/schema changes.
- No saved product data or authoritative browser-owned product data added.
- No start_of_day files changed.
- ZIP package created at the requested path.

## Requirement Checklist

PASS - Add Frame control added.

PASS - Duplicate Frame control added.

PASS - Delete Frame control added and disabled when only one frame exists.

PASS - Frame selection swaps the center canvas and preview to the selected frame.

PASS - Each frame keeps separate unsaved page-session pixels.

PASS - No persistence added.

PASS - Targeted Playwright coverage updated.

## Validation Lane

PASS - `node --check assets/toolbox/sprites/js/index.js`

PASS - `node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - `git diff --check -- toolbox/sprites/index.html assets/toolbox/sprites/js/index.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - Runtime guard scan found no prohibited inline style/script/event-handler or stale placeholder text in touched runtime files.

PASS - `npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list`

## Manual Validation Notes

1. Open `toolbox/sprites/index.html`.
2. Draw on Frame 1.
3. Click Add Frame and confirm Frame 2 is empty.
4. Draw different pixels on Frame 2.
5. Select Frame 1 and confirm its pixels return.
6. Select Frame 2 and confirm its pixels return.
7. Duplicate Frame 2 and confirm the duplicate keeps the current pixels.
8. Delete the duplicate and confirm the strip returns to two unsaved frames.

## ZIP

`dev/workspace/zips/PR_26179_CHARLIE_035-sprites-frame-editing_delta.zip`
