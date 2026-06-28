# PLAN PR_26171_031-idea-board-inline-tree-grid-actions

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Purpose
Fix Idea Board so the work surface is a table-first inline tree grid where the selected idea expands directly beneath its own row and all idea/note actions happen inline.

## Scope
- Remove the detached selected notes section and selected idea context text.
- Remove the Owner column from the main idea table.
- Render main columns: Idea, Pitch, Status, Updated, Notes, Actions.
- Render selected idea notes as a subtable directly under the selected idea row.
- Hide note metadata columns from the notes subtable.
- Support inline Add/Edit/Delete actions for ideas and notes.
- Keep system note deletion disallowed while allowing system note editing.
- Update targeted Idea Board Playwright coverage, required reports, and ZIP output.

## Validation
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npm run test:workspace-v2`

## Git Workflow
- Start from refreshed `main`.
- Create branch `codex/pr-26171-031-idea-board-inline-tree-grid-actions`.
- Stage only scoped files.
- Commit, push, create PR, merge after validation, return to `main`, and pull latest `main`.
