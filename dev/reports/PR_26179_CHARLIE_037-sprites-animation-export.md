# PR_26179_CHARLIE_037-sprites-animation-export

Team: CHARLIE

Mode: Batch governance stacked feature workflow

Base branch: PR_26179_CHARLIE_036-sprites-animation-preview

Branch: PR_26179_CHARLIE_037-sprites-animation-export

## Summary

Added local animation strip export for Sprite Creator. Download Animation Strip generates a PNG strip from unsaved page-session frames only. The export does not save to the sprite library, publish an asset, call an API, create database records, or introduce authoritative browser-owned product data.

## Branch Validation

PASS

- Built from `PR_26179_CHARLIE_036-sprites-animation-preview`.
- Scope stayed limited to unsaved animation export.
- No DB/API/schema changes.
- No saved product data or browser-owned authoritative product data added.
- No start_of_day files changed.
- ZIP package created at the requested path.

## Requirement Checklist

PASS - Animation strip export button added.

PASS - Export requires at least two unsaved frames.

PASS - Export creates a local PNG strip download.

PASS - Export stops animation preview before generating the strip.

PASS - No persistence, publishing, API, database, or storage behavior added.

PASS - Targeted Playwright coverage updated.

## Validation Lane

PASS - `node --check assets/toolbox/sprites/js/index.js`

PASS - `node --check dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - `git diff --check -- toolbox/sprites/index.html assets/toolbox/sprites/js/index.js dev/tests/playwright/tools/SpritesToolShell.spec.mjs`

PASS - Runtime guard scan found no prohibited inline style/script/event-handler or stale placeholder text in touched runtime files.

PASS - `npx playwright test dev/tests/playwright/tools/SpritesToolShell.spec.mjs --workers=1 --reporter=list`

## Manual Validation Notes

1. Open `toolbox/sprites/index.html`.
2. Draw Frame 1.
3. Add Frame 2 and draw a different draft.
4. Click Download Animation Strip.
5. Confirm `sprite-creator-animation-strip.png` downloads.
6. Confirm the export status says the PNG came from unsaved frames.
7. Confirm no save, publish, API, database, or library workflow is introduced.

## ZIP

`dev/workspace/zips/PR_26179_CHARLIE_037-sprites-animation-export_delta.zip`
