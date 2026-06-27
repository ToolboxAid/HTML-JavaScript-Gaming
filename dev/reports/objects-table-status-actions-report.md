# PR_26161_012 Objects Table Status Actions Report

## Branch Guard
- Current branch: `main`
- Expected branch: `main`
- Local branches found: `* main`
- Branch validation: PASS

## Source Of Truth
- PASS: Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before edits.
- PASS: Used the user-provided `PR_26161_012-objects-table-status-actions` request as the active BUILD source.
- PASS: Continued from `PR_26161_011`.
- PASS: Kept the PR purpose singular: consolidate Objects status/actions into table rows.

## Requirement Checklist
- PASS: Consolidated Object Status into the Objects Table with a row-level `Status` column.
- PASS: Removed the separate Object Status panel because it duplicated per-row status/actions.
- PASS: Added row-level actions between `Edit` and `Trash`: `Edit Sprite`, `Open Hitboxes`, and `Open Events`.
- PASS: `Edit Sprite` appears only for saved Sprite rows with a linked render asset.
- PASS: `Open Hitboxes` and `Open Events` appear for saved object rows with object keys.
- PASS: Missing Hitbox/Event actions use existing Theme V2 `btn btn--compact primary` classes to highlight attention-needed setup.
- PASS: Available linked Sprite actions use existing Theme V2 `btn btn--compact cyan` classes to highlight ready/available setup.
- PASS: Row status uses existing Theme V2 `swatch-label swatch-gold` for missing setup and `swatch-label swatch-green` for ready rows.
- PASS: Used creator-facing labels only; no handoff/session/MVP/internal wording was introduced in Objects UI files.
- PASS: Preserved PR_26161_011 DB/mock-adapter persistence.
- PASS: Preserved Asset as linked render record display, not invalid free text.
- PASS: Preserved State as visible in the Objects table.
- PASS: Preserved Object Type Catalog compact display with `Template` and `Capability` only.
- PASS: Preserved table-first input, `Add Object` below the table, Add disabled while adding, Cancel, Edit, Trash, Reset Table, and Sprite asset linking.
- PASS: Did not add sample JSON alignment, auth behavior, production DB behavior, or unrelated tool rewrites.
- PASS: Kept Theme V2 only and preserved HTML restrictions.

## Implementation Evidence
- `toolbox/objects/index.html`: removed the duplicate Object Status card and added `Status` to the Objects table.
- `toolbox/objects/objects.js`: renders row status badges and inserts configuration action links between `Edit` and `Trash`.
- `toolbox/objects/objects.js`: keeps Sprite asset display linked to shared asset records and preserves existing persistence calls.
- `tests/playwright/tools/ObjectsTool.spec.mjs`: verifies removed status panel, row action order, action state classes, persistence after reload, and Sprite linking after reload.

## Impacted Lane
- Impacted lane: Objects tool UI/runtime.
- Playwright impacted: Yes.
- Changed runtime JavaScript: `toolbox/objects/objects.js`.

## Testing Performed
- PASS: `node --check toolbox/objects/objects.js`
- PASS: `node --check tests/playwright/tools/ObjectsTool.spec.mjs`
- PASS: HTML restriction check for `toolbox/objects/index.html` returned no inline script/style/event handler matches.
- PASS: Objects forbidden wording scan returned no matches in `toolbox/objects/index.html` or `toolbox/objects/objects.js`.
- PASS: `npx playwright test tests/playwright/tools/ObjectsTool.spec.mjs --workers=1 --reporter=line` (6 passed).
- PASS: `git diff --check` exited 0 with line-ending warnings only.
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt` was produced by targeted Objects Playwright.

## Playwright Behavior Coverage
- PASS: Separate Object Status panel and summary table are absent.
- PASS: Objects Table includes the consolidated `Status` column.
- PASS: Row status shows `Missing Hitbox, Missing Events` for saved rows that need setup.
- PASS: `Open Hitboxes` and `Open Events` render between `Edit` and `Trash` and use the attention-needed button class.
- PASS: Saved Sprite rows render `Edit Sprite` between `Edit` and `Open Hitboxes` and use the ready/available button class.
- PASS: Add/Edit/Delete persistence still survives page reload.
- PASS: Sprite asset link persistence still survives page reload.
- PASS: Asset cells remain display-only linked render record output.

## Coverage Notes
- Targeted browser V8 coverage includes `toolbox/objects/objects.js` at 94%.
- The generated coverage report still lists advisory WARN entries for dev-runtime files changed in the current HEAD baseline from PR_26161_011. Those files were not modified in this PR and are not browser-collected runtime files for PR_26161_012.

## Skipped Lanes
- Full samples validation: SKIP. Safe because no sample JSON, sample launch path, or sample runtime behavior changed.
- Engine runtime validation beyond changed-file syntax/import checks: SKIP. Safe because no engine runtime behavior changed.
- Production DB/auth validation: SKIP. Safe because no production DB or auth behavior changed.
- Broad Toolbox/Admin validation: SKIP. Safe because navigation, registration, metadata, admin surfaces, and sample paths were not changed.

## Manual Validation Steps
- Open `/toolbox/objects/index.html`.
- Confirm there is no separate Object Status panel.
- Add a non-Sprite object and confirm the saved row shows `Status` with Missing Hitbox/Event setup.
- Confirm row actions read `Edit`, `Open Hitboxes`, `Open Events`, `Trash`.
- Add a Sprite object and confirm the saved row actions read `Edit`, `Edit Sprite`, `Open Hitboxes`, `Open Events`, `Trash`.
- Confirm `Edit Sprite` opens with the linked sprite asset key.
- Reload after add/edit/delete/reset and confirm the table state persists correctly.

## Required Artifacts
- PASS: `docs_build/dev/reports/objects-table-status-actions-report.md`
- PASS: `docs_build/dev/reports/codex_review.diff`
- PASS: `docs_build/dev/reports/codex_changed_files.txt`
- PASS: `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- PASS: `tmp/PR_26161_012-objects-table-status-actions_delta.zip`
