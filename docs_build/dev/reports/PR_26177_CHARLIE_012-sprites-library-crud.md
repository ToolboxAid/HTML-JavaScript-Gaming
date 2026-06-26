# PR_26177_CHARLIE_012-sprites-library-crud

Team: Charlie

Status: PASS

## Scope

Extended the Sprites tool shell with API-backed library CRUD controls. The browser still does not own authoritative data: all create, update, archive, and delete actions call the Sprites API contract.

## Changed Files

- `toolbox/sprites/index.html`
- `assets/toolbox/sprites/js/index.js`
- `tests/playwright/tools/SpritesToolShell.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_CHARLIE_012-sprites-library-crud.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_012-sprites-library-crud-branch-validation.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_012-sprites-library-crud-requirements-checklist.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_012-sprites-library-crud-validation-lane.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_012-sprites-library-crud-manual-validation-notes.md`

## Implementation Notes

- Added Add/Edit/Save/Cancel controls for sprite records.
- Added required `name` validation and API-contract status validation.
- Added category normalization by trimming and collapsing internal whitespace.
- Added archive action through `/api/sprites/records/:key/archive`.
- Added delete action through `/api/sprites/records/:key/delete`.
- Delete is disabled when the API-provided usage count indicates references; archive remains the safer action.
- Guest write attempts redirect to `account/sign-in.html` when the API returns 401 or 403.
- Create requests do not include browser-generated authoritative keys.
- Sprites still does not define reusable colors or duplicate Palette/Colors records.

## Stack Note

This PR is stacked on `PR_26177_CHARLIE_011-sprites-tool-shell` because the CRUD work depends on the shell structure. Project Instructions allow stacked sequential PRs when dependency order requires it. Opening this from `main` would duplicate PR011 shell work and violate one-purpose scope.

## Validation

- PASS: `git diff --check`
- PASS: inline CSS/script/handler scan for Sprites files found no matches.
- PASS: browser storage and forbidden local data pattern scan found no matches.
- PASS: no `start_of_day` files changed.
- PASS: `node ./node_modules/@playwright/test/cli.js test tests/playwright/tools/SpritesToolShell.spec.mjs --project=playwright --workers=1 --reporter=list`

## ZIP Artifact

- `tmp/PR_26177_CHARLIE_012-sprites-library-crud_delta.zip`
