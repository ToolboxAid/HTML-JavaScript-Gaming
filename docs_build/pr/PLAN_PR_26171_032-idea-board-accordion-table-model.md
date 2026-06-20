# PLAN PR_26171_032-idea-board-accordion-table-model

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Purpose
Fix Idea Board to use a DB-shaped in-page idea/note table model with accordion-style notes expansion and no selected-idea context.

## Scope
- Keep behavior functional and in-page only.
- Do not add real DB persistence.
- Do not add SQLite.
- Model in-page ideas with `ideaId`, `userId`, `idea`, `pitch`, `status`, and `updated`.
- Model in-page notes with `noteId`, `ideaId`, `note`, `system`, and `updated`.
- Render all ideas by default with no expanded notes.
- Expand or collapse notes for one idea at a time from the notes count or chevron.
- Render expanded notes directly under the owning idea row.
- Keep Add/Edit idea and Add/Edit note workflows inline.
- Update targeted Idea Board Playwright coverage, reports, and ZIP output.

## Validation
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npm run test:workspace-v2`

## Git Workflow
- Start from refreshed `main`.
- Create branch `codex/pr-26171-032-idea-board-accordion-table-model`.
- Stage only scoped files.
- Commit, push, create PR, merge after validation, return to `main`, and pull latest `main`.
