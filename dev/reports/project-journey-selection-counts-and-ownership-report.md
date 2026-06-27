# Project Journey Selection Counts And Ownership Report

Task: PR_26157_001-project-journey-selection-counts-and-ownership

## Scope

- Moved Project Journey Status Legend into the Statistics tile and placed it after the statistics grid.
- Added explicit Statistics scope text:
  - selected summary row: counts for that selected note only
  - navigation filter mode: aggregate counts for the filtered result set
- Navigation buttons now deselect the selected Summary Table Name row.
- Summary Table column order is now:
  `Name | Type | ⬜ | ⛔ | ❓ | 🟡 | ✅ | Open | Total | Updated`
- Open = ⬜ Not Started + ⛔ Blocker + ❓ Decide + 🟡 In Progress.
- Total = all entries, including ✅ Complete.
- Selected note rows and selected tree entries use existing `btn primary` styling for visible selection.

## Ownership

- Project Journey entries now track:
  - `createdBy`
  - `createdByType`
  - `originalSystemMeaning`
- Seeded mock entries are system-created and preserve `originalSystemMeaning` through edits.
- User-added entries are user-created.
- System-created entries can be edited but cannot be deleted.
- User-created entries can be edited and deleted through the Project Journey row editor.

## Constraint Checks

- No Project Journey display of Admin Notes Current Folder, Open folder, Return to root index, or filesystem listing diagnostics.
- No new CSS was added.
- No page-local CSS, tool-local CSS, inline styles, `<style>` blocks, `<script>` blocks, or inline event handlers were added.
- No archived V1/V2 files or `start_of_day` folders were modified.
- Full samples smoke was not run, per request.

## Validation

- `node --check toolbox/project-journey/project-journey.js` - PASS.
- `node --check toolbox/project-journey/project-journey-mock-repository.js` - PASS.
- `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` - PASS.
- `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --workers=1` - PASS, 7 tests.
- `npm run test:playwright:static` - PASS.
