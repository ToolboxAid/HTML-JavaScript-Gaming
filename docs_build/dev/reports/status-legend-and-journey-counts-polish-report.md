# Status Legend And Journey Counts Polish Report

Task: PR_26156_190-status-legend-and-journey-counts-polish

## Scope

- Updated Admin Notes status legend order to the requested execution sequence:
  `[ ] ⬜ Not Started`, `[!] ⛔ Blocker`, `[?] ❓ Decide`, `[.] 🟡 In Progress`, `[x] ✅ Complete`.
- Preserved Admin Notes parsing behavior and status icon rendering for note content.
- Updated Project Journey status order to:
  `⬜ Not Started`, `⛔ Blocker`, `❓ Decide`, `🟡 In Progress`, `✅ Complete`.
- Removed raw bracket markers from Project Journey status dropdown labels.
- Added a Project Journey Status Legend using existing Theme V2 tool classes.
- Added `Total` and `Open` as separate Project Journey summary table columns.

## Count Definitions

- Total = every entry in the selected Project Journey note.
- Open = Not Started + Blocker + Decide + In Progress.
- Complete is not counted as Open.

## Constraints

- No new CSS was added.
- No page-local CSS, tool-local CSS, inline styles, `<style>` blocks, `<script>` blocks, or inline event handlers were added.
- No archived V1/V2 files or `start_of_day` folders were modified.
- Full samples smoke was not run, per request.

## Validation

- Targeted Admin Notes parser/UI lane: `npx playwright test tests/playwright/tools/AdminNotesViewer.spec.mjs --workers=1`.
- Targeted Project Journey runtime/UI lane: `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --workers=1`.
- Combined coverage-producing targeted pass: `npx playwright test tests/playwright/tools/AdminNotesViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --workers=1`.
- Changed-file/static validation: `npm run test:playwright:static`.
