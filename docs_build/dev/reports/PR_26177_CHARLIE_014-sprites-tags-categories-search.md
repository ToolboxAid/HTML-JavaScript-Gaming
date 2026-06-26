# PR_26177_CHARLIE_014-sprites-tags-categories-search

Team: Charlie

Status: PASS

## Scope

Added API-backed search and filters for Sprites records. Categories and tag keys are derived from the API response; Sprites does not create a separate tag authority or page-local product data list.

## Changed Files

- `toolbox/sprites/index.html`
- `assets/toolbox/sprites/js/index.js`
- `tests/playwright/tools/SpritesToolShell.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_CHARLIE_014-sprites-tags-categories-search.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_014-sprites-tags-categories-search-branch-validation.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_014-sprites-tags-categories-search-requirements-checklist.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_014-sprites-tags-categories-search-validation-lane.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_014-sprites-tags-categories-search-manual-validation-notes.md`

## Implementation Notes

- Added search control.
- Added status filter using the Sprites API status contract.
- Added category filter derived from API-backed sprite records.
- Added tag key filter derived from API-backed sprite records.
- Added clear filters action.
- Added filter status summary for visible records versus total API-backed records.
- Did not duplicate Tags ownership or add page-local reusable product arrays.

## Validation

- PASS: `git diff --check`
- PASS: inline CSS/script/handler scan for Sprites files found no matches.
- PASS: browser storage and forbidden local data pattern scan found no matches.
- PASS: no `start_of_day` files changed.
- PASS: `node ./node_modules/@playwright/test/cli.js test tests/playwright/tools/SpritesToolShell.spec.mjs --project=playwright --workers=1 --reporter=list`

## ZIP Artifact

- `tmp/PR_26177_CHARLIE_014-sprites-tags-categories-search_delta.zip`
