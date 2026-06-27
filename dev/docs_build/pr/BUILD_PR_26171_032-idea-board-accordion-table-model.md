# BUILD PR_26171_032-idea-board-accordion-table-model

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Exact Targets
- docs_build/dev/codex_commands.md
- docs_build/dev/commit_comment.txt
- docs_build/dev/reports/codex_changed_files.txt
- docs_build/dev/reports/codex_review.diff
- docs_build/pr/PLAN_PR_26171_032-idea-board-accordion-table-model.md
- docs_build/pr/BUILD_PR_26171_032-idea-board-accordion-table-model.md
- docs_build/pr/APPLY_PR_26171_032-idea-board-accordion-table-model.md
- tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
- tests/playwright/tools/ToolboxRoutePages.spec.mjs
- toolbox/idea-board/index.html
- toolbox/idea-board/index.js

## Requirements
- Use an in-page DB-shaped Idea table: `ideaId`, `userId`, `idea`, `pitch`, `status`, `updated`.
- Use an in-page DB-shaped Note table: `noteId`, `ideaId`, `note`, `system`, `updated`.
- Preserve relationship semantics: User 1-* Idea and Idea 1-* Note.
- Do not add real DB persistence.
- Do not add SQLite.
- Default state must have no selected idea and no expanded notes.
- Main Idea table must show all ideas only by default.
- Add Idea must appear as the final table row/action area.
- Visible Idea table columns must be Idea, Pitch, Status, Updated, Notes, Actions.
- Seed rows must include:
  - Top Thoughts | Smartest person wins... | Exploring | 2026-06-20 | 3 Notes | Edit Delete
  - Sky Orchard | Grow floating islands... | Exploring | 2026-06-20 | 3 Notes | Edit Delete
  - Clockwork Courier | Deliver messages through looping city... | New | 2026-06-20 | 0 Notes | Edit Delete
- Notes count or chevron must expand/collapse notes for that idea.
- Expanded notes must render directly under the owning idea row.
- Only one expanded idea is required at a time.
- Notes are not selected context.
- Remove selected-idea terminology from visible UI.
- Remove `Selected idea context`.
- Remove detached `Notes for Sky Orchard` heading.
- Remove note metadata columns from visible UI.
- Expanded notes visible structure must include a `Notes` header.
- Expanded note rows must show only note text plus Actions.
- Note normal actions must be Edit and Delete when allowed.
- System notes must allow Edit and hide/disable Delete.
- Add Note must appear under the expanded notes for that idea.
- Add Idea must open an inline idea row at the bottom of the main table with Idea input, Pitch input, Status dropdown, Updated auto-filled, 0 Notes, Save, and Cancel.
- Edit Idea must replace that idea row with inline edit controls and Save/Cancel on the same row.
- Add/Edit Note must use inline note rows inside the expanded notes area with Save/Cancel on the same row.
- Produce repo-structured delta ZIP at `tmp/PR_26171_032-idea-board-accordion-table-model_delta.zip`.

## Validation Commands
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npm run test:workspace-v2`

## ZIP Output
- `tmp/PR_26171_032-idea-board-accordion-table-model_delta.zip`
