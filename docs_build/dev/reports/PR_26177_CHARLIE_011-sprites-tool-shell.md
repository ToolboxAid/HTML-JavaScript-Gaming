# PR_26177_CHARLIE_011-sprites-tool-shell

Team: Charlie

Status: PASS

## Scope

Added the Sprites tool shell under the current Toolbox route using Theme V2 patterns. The page now presents a table-first sprite library surface, API-backed loading/empty/error states, and Palette/Colors reference messaging without implementing create/update/delete behavior.

## Changed Files

- `toolbox/sprites/index.html`
- `assets/toolbox/sprites/js/index.js`
- `tests/playwright/tools/SpritesToolShell.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_CHARLIE_011-sprites-tool-shell.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_011-sprites-tool-shell-branch-validation.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_011-sprites-tool-shell-requirements-checklist.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_011-sprites-tool-shell-validation-lane.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_011-sprites-tool-shell-manual-validation-notes.md`

## Implementation Notes

- The tool title remains `Sprites`.
- The legacy "Sprite Editor" framing was removed from this page.
- The shell uses existing Theme V2 classes and shared tool layout patterns.
- The page uses external JavaScript only through `assets/toolbox/sprites/js/index.js`.
- The browser calls `/api/sprites/records` and renders only data returned by the API contract.
- When the API is absent or unavailable, the page shows a visible unavailable state instead of fake records or a silent fallback.
- Palette/Colors remains the reusable color source of truth. Sprites displays Palette/Colors key references returned by the API and does not define reusable colors.

## Dependency Note

`PR_26177_CHARLIE_010-sprites-api-db-foundation` provides the concrete API/database foundation. Because that PR is not merged into `main` yet, this shell PR validates the UI against mocked API responses in Playwright and preserves a product-safe unavailable state for branches where the route is absent.

## Validation

- PASS: `git diff --check`
- PASS: inline CSS/script/handler scan for Sprites shell files found no matches.
- PASS: browser storage and forbidden local data pattern scan found no matches.
- PASS: no `start_of_day` files changed.
- PASS: `node ./node_modules/@playwright/test/cli.js test tests/playwright/tools/SpritesToolShell.spec.mjs --project=playwright --workers=1 --reporter=list`

## ZIP Artifact

- `tmp/PR_26177_CHARLIE_011-sprites-tool-shell_delta.zip`
