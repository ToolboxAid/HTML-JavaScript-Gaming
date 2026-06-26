# PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette

Team: Charlie

Status: PASS

## Scope

Added Sprites preview, metadata, duplicate, replace-metadata, and Palette/Colors reference states without introducing fake storage or browser-owned product data.

## Changed Files

- `toolbox/sprites/index.html`
- `assets/toolbox/sprites/js/index.js`
- `tests/playwright/tools/SpritesToolShell.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette-branch-validation.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette-requirements-checklist.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette-validation-lane.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette-manual-validation-notes.md`

## Implementation Notes

- Added selected sprite preview panel.
- Added metadata display for file/source, MIME/type, dimensions, file size, updatedAt, updatedBy, and Palette/Colors keys.
- Added duplicate action through the Sprites create API so the server owns the new key.
- Added replace-metadata action through the Sprites update API.
- Added visible storage import unavailable state because the current Sprites API contract does not provide binary upload/storage write support.
- Added Palette/Colors selection unavailable/display-only state because Palette/Colors key selection integration is not present in the current contract.
- No reusable color definitions were added to Sprites.

## Validation

- PASS: `git diff --check`
- PASS: inline CSS/script/handler scan for Sprites files found no matches.
- PASS: browser storage and forbidden local data pattern scan found no matches.
- PASS: no `start_of_day` files changed.
- PASS: `node ./node_modules/@playwright/test/cli.js test tests/playwright/tools/SpritesToolShell.spec.mjs --project=playwright --workers=1 --reporter=list`

## ZIP Artifact

- `tmp/PR_26177_CHARLIE_013-sprites-import-preview-metadata-palette_delta.zip`
