# BUILD PR_26171_028-idea-board-notes-table-governance

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Exact targets
- toolbox/idea-board/index.html
- toolbox/idea-board/index.js
- tests/playwright/tools/ToolboxRoutePages.spec.mjs
- tests/playwright/tools/IdeaBoardTableNotes.spec.mjs

## Requirements
- 026: migrate Idea Board to Tool Template V2, Theme V2, clean left/center/right shell, no inline script/style/handlers.
- 027: convert Idea Board to table-first work surface; no form-first UI.
- 028: implement selected-idea notes table governance: Add Note below the selected idea notes table, inline input row, Edit/Delete actions right for creator notes, system notes locked from Edit/Delete, metadata in table columns.
- 029: add targeted Playwright behavior coverage for Idea Board table and notes workflows.

## Validation commands
- node --check toolbox/idea-board/index.js
- node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs
- node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
- npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line
- npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line -g "Idea Board launches"
- npm run test:workspace-v2

## ZIP output
- tmp/PR_26171_028-idea-board-notes-table-governance_delta.zip
