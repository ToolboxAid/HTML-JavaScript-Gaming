# PR_26156_121 Tool Form Table Layout Standard Report

## Scope

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first.
- Updated `toolbox/game-design/index.html` Design Fields > Project Design form layout only.
- Promoted the missing table/form behavior into reusable Theme V2 CSS under `assets/theme-v2/css/tables.css`.
- Updated targeted Game Design Playwright/MSJ coverage for the reusable layout class and browser-measured layout behavior.
- Did not modify unrelated Game Design sections.
- Did not modify `start_of_day`.

## Reusable Theme V2 Pattern

- Added `.tool-form-table` as an opt-in table/form pattern for tool pages.
- The reusable expectation for all tools is:
  - form tables use available panel width
  - row-header label cells stay compact
  - row-header labels align right
  - input cells fill remaining table width
  - select, textarea, and non-special input controls stretch to the available input-column width
- The class is opt-in and does not change existing `.data-table` behavior unless a table also declares `.tool-form-table`.

## Game Design Changes

- Updated Project Design table class from `data-table` to `data-table tool-form-table`.
- Set `gameDesignCapabilityNotes` from `rows="3"` to `rows="4"`.
- Kept `gameDesignSummary` at `rows="4"`.
- Preserved existing field names, control IDs, data hooks, labels, validation hooks, values, and form behavior.

## Validation Notes

- Impacted lane: `game-design`.
- Shared Theme V2 CSS changed, but the new CSS is opt-in and only `toolbox/game-design/index.html` consumes it in this PR.
- Skipped lanes: all other lanes, because no existing global table behavior was changed and no other tool opted into `.tool-form-table`.
- Ran `node --check tests/playwright/tools/GameDesignMockRepository.spec.mjs`.
- Ran `npm run test:lane:game-design`.
- Ran scoped `git diff --check` for changed implementation/test/report files.
- Ran a changed-file static scan confirming no inline styles, style blocks, inline scripts, inline event handlers, or `start_of_day` file changes were introduced.
- Full samples smoke: skipped by request.

## Manual Test Notes

- Verified by targeted Playwright that Project Design uses `.tool-form-table`.
- Verified the table width uses the available wrapper/panel width.
- Verified the label column is compact and computed `text-align` is `right`.
- Verified the select and textarea controls stretch across the input column.
- Verified both Project Design textarea controls expose `rows="4"`.
- Verified existing form controls still accept input and Save Game Design still updates the active project.
