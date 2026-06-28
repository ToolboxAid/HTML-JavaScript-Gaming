# BUILD PR_26171_031-idea-board-inline-tree-grid-actions

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Exact Targets
- docs_build/dev/codex_commands.md
- docs_build/dev/commit_comment.txt
- docs_build/dev/reports/codex_changed_files.txt
- docs_build/dev/reports/codex_review.diff
- docs_build/pr/PLAN_PR_26171_031-idea-board-inline-tree-grid-actions.md
- docs_build/pr/BUILD_PR_26171_031-idea-board-inline-tree-grid-actions.md
- docs_build/pr/APPLY_PR_26171_031-idea-board-inline-tree-grid-actions.md
- tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
- tests/playwright/tools/ToolboxRoutePages.spec.mjs
- toolbox/idea-board/index.html
- toolbox/idea-board/index.js

## Requirements
- Remove Owner column.
- Main table columns must be: Idea, Pitch, Status, Updated, Notes, Actions.
- Notes column must show note count text such as `2 Notes`.
- Selected idea must expand directly under its own idea row.
- Remove detached `Notes for Sky Orchard` section.
- Remove visible `Selected idea context` text.
- Remove visible notes metadata columns: Type, Created By, Created, Updated.
- Notes subtable visible columns must be: Note, Actions.
- Idea normal row actions must be Edit and Delete.
- Idea edit row actions must be Save and Cancel.
- Idea edit Status field must be a dropdown.
- Note normal row must expose Edit and Delete when allowed.
- System note must expose Edit and must not expose Delete.
- Note edit row actions must be Save and Cancel.
- Add Idea must open an inline idea row with Save and Cancel.
- Add Note must open an inline note row under the selected idea with Save and Cancel.
- Do not create docs-only work.
- Do not create detached panels.
- Do not use form-first UI.
- Produce repo-structured delta ZIP at `tmp/PR_26171_031-idea-board-inline-tree-grid-actions_delta.zip`.

## Validation Commands
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npm run test:workspace-v2`

## ZIP Output
- `tmp/PR_26171_031-idea-board-inline-tree-grid-actions_delta.zip`
