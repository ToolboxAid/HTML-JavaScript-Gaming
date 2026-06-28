# PR_26179_CHARLIE_033-sprites-canvas-preview-sync

Team: CHARLIE

Mode: Batch governance stacked feature workflow

Base branch: PR_26179_CHARLIE_032-sprites-shape-tools

Branch: PR_26179_CHARLIE_033-sprites-canvas-preview-sync

## Summary

Fixed the Sprite Creator center-canvas and right-preview sync path so both render from the same page-session editor state. The center grid is repainted from `editorState.paintedPixels` whenever draft status/preview refreshes, and picker/zoom paths also trigger a repaint even though they do not mutate pixels.

## Branch Validation

PASS

- Built from `PR_26179_CHARLIE_032-sprites-shape-tools`.
- Scope stayed limited to canvas/preview synchronization and regression coverage.
- No DB/API/schema changes.
- No persistence or browser-owned authoritative product data added.
- No start_of_day files changed.
- ZIP package created at the requested path.

## Requirement Checklist

PASS - Right preview updates from page-session editor state.

PASS - Center editor canvas updates from the same page-session editor state.

PASS - Drawing repaints center canvas immediately.

PASS - Erase repaints center canvas immediately.

PASS - Fill repaints center canvas immediately.

PASS - Clear repaints center canvas immediately.

PASS - Undo repaints center canvas immediately.

PASS - Redo repaints center canvas immediately.

PASS - Picker repaints center canvas and preview without mutating pixels.

PASS - Zoom repaints center canvas and preview without mutating pixels.

PASS - Shape tools repaint center canvas immediately.

PASS - Playwright regression coverage added for center canvas and preview sync.

## Validation Lane

PASS - `node --check assets/toolbox/sprites/js/index.js`

PASS - `node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - `git diff --check -- assets/toolbox/sprites/js/index.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - Runtime guard scan found no prohibited inline style/script/event-handler or stale placeholder text in touched runtime files.

PASS - `npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list`

## Manual Validation Notes

1. Open `toolbox/sprites/index.html`.
2. Draw a pixel and confirm the center grid and right preview both update.
3. Erase the pixel and confirm both surfaces clear.
4. Fill, clear, undo, and redo; confirm both surfaces stay matched.
5. Use Picker and Zoom; confirm both surfaces remain matched.
6. Draw Line, Rectangle, and Circle shapes; confirm center grid and right preview both show the shape.

## ZIP

`dev/workspace/zip/PR_26179_CHARLIE_033-sprites-canvas-preview-sync_delta.zip`
