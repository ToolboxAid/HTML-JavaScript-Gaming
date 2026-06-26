# PR_26177_CHARLIE_015-sprites-reference-protection

Team: Charlie

Status: PASS

## Scope

Added API-provided reference visibility and strengthened destructive delete protection for Sprites.

## Changed Files

- `toolbox/sprites/index.html`
- `assets/toolbox/sprites/js/index.js`
- `tests/playwright/tools/SpritesToolShell.spec.mjs`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26177_CHARLIE_015-sprites-reference-protection.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_015-sprites-reference-protection-branch-validation.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_015-sprites-reference-protection-requirements-checklist.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_015-sprites-reference-protection-validation-lane.md`
- `docs_build/dev/reports/PR_26177_CHARLIE_015-sprites-reference-protection-manual-validation-notes.md`

## Implementation Notes

- Added reference viewer for API-provided usage references.
- Displays source type, source key, and label for each usage reference.
- Shows empty reference state when the API reports no references.
- Keeps usage count visible in table and details.
- Destructive delete remains disabled when usage count is greater than zero.
- Referenced sprites show `Archive Safely` to make the safe action explicit.
- No fake Objects or Worlds references were added.

## Reference Contract

The UI consumes the existing Sprites API `references` array. Future Objects/Worlds integrations should supply real usage rows through the API/database reference contract rather than browser-local inference.

## Validation

- PASS: `git diff --check`
- PASS: inline CSS/script/handler scan for Sprites files found no matches.
- PASS: browser storage and forbidden local data pattern scan found no matches.
- PASS: no `start_of_day` files changed.
- PASS: `node ./node_modules/@playwright/test/cli.js test tests/playwright/tools/SpritesToolShell.spec.mjs --project=playwright --workers=1 --reporter=list`

## ZIP Artifact

- `tmp/PR_26177_CHARLIE_015-sprites-reference-protection_delta.zip`
