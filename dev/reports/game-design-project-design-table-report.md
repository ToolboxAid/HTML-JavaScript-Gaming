# PR_26156_120 Game Design Project Design Table Report

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- Updated only `toolbox/game-design/index.html` and the targeted Game Design Playwright/MSJ coverage.
- Converted the Design Fields > Project Design form body into a two-column Theme V2 table.
- Preserved existing control IDs, labels, data hooks, values, and submit behavior.
- Did not modify unrelated Game Design sections.
- Did not modify `start_of_day`.

## Implementation Notes

- Replaced the stacked label/control form layout with:
  - `div.table-wrapper`
  - `table.data-table`
  - first-column `th scope="row"` cells containing the existing labels
  - second-column `td` cells containing the existing select/textarea controls
- Preserved hooks:
  - `data-game-design-form`
  - `data-game-design-type`
  - `data-game-design-genre`
  - `data-game-design-play-style`
  - `data-game-design-summary`
  - `data-game-design-capability-notes`
- Added `data-game-design-project-design-table` for targeted validation.

## Theme V2 Gap Findings

- Existing Theme V2 supports the table structure through `table-wrapper` and `data-table`.
- Existing Theme V2 does not provide a reusable table/form utility that right-aligns row-header labels.
- Existing Theme V2 does not provide a table-specific form-control fill utility for select/textarea controls inside table cells.
- No CSS was added. The right-aligned label and table-cell control-fill refinements should be handled later as reusable Theme V2 patterns if design-system ownership approves them.

## Validation Notes

- Impacted lane: `game-design`.
- Skipped lanes: all other lanes, because this PR only changes Game Design form markup and the targeted Game Design UI/runtime test.
- Ran `node --check tests/playwright/tools/GameDesignMockRepository.spec.mjs`.
- Ran `npm run test:lane:game-design`.
- Ran scoped `git diff --check` for changed implementation/test/report files.
- Ran a changed-file static scan confirming no inline styles, style blocks, inline scripts, inline event handlers, or `start_of_day` references were introduced.
- Full samples smoke: skipped by request.

## Manual Test Notes

- Verified by targeted Playwright that `Project Design fields` renders as a visible `data-table`.
- Verified the table contains five two-cell rows.
- Verified first-column labels keep their `for` attributes.
- Verified second-column controls keep the original select/textarea IDs.
- Verified existing Game Type, Genre, Play Style, Design Summary, and Capability Demo Notes controls still accept input.
- Verified Save Game Design still saves/updates against the active project.
