# BUILD PR_26171_030-idea-board-workflow-fix

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Exact Targets
- docs_build/dev/codex_commands.md
- docs_build/dev/commit_comment.txt
- docs_build/dev/reports/codex_changed_files.txt
- docs_build/dev/reports/codex_review.diff
- docs_build/pr/PLAN_PR_26171_026-idea-board-template-cleanup.md
- docs_build/pr/PLAN_PR_26171_027-idea-board-table-work-surface.md
- docs_build/pr/PLAN_PR_26171_028-idea-board-notes-table-governance.md
- docs_build/pr/PLAN_PR_26171_029-idea-board-validation-playwright.md
- docs_build/pr/PLAN_PR_26171_030-idea-board-workflow-fix.md
- docs_build/pr/BUILD_PR_26171_026-idea-board-template-cleanup.md
- docs_build/pr/BUILD_PR_26171_027-idea-board-table-work-surface.md
- docs_build/pr/BUILD_PR_26171_028-idea-board-notes-table-governance.md
- docs_build/pr/BUILD_PR_26171_029-idea-board-validation-playwright.md
- docs_build/pr/BUILD_PR_26171_030-idea-board-workflow-fix.md
- docs_build/pr/APPLY_PR_26171_026-idea-board-template-cleanup.md
- docs_build/pr/APPLY_PR_26171_027-idea-board-table-work-surface.md
- docs_build/pr/APPLY_PR_26171_028-idea-board-notes-table-governance.md
- docs_build/pr/APPLY_PR_26171_029-idea-board-validation-playwright.md
- docs_build/pr/APPLY_PR_26171_030-idea-board-workflow-fix.md
- tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
- tests/playwright/tools/RootToolsFutureState.spec.mjs
- tests/playwright/tools/ToolboxRoutePages.spec.mjs
- toolbox/idea-board/index.html
- toolbox/idea-board/index.js

## Requirements
- PASS required only after implementation and targeted validation.
- Verify Tool Template V2 copied/adapted structure: header partial, footer partial, Theme V2 CSS, ToolDisplayMode host, left/center/right shell, accordions, external scripts, and no inline script/style/handlers.
- Idea Board must be table-first and not form-first.
- Notes must be a selected-idea subtable/context area.
- Add Note must live below the selected notes table and open an inline input row inside that table.
- Creator notes must expose Edit/Delete actions on the right.
- System notes must not expose Edit/Delete.
- Metadata must render in notes table columns.
- Create Project must remain visible placeholder-only and disabled.
- Targeted Playwright must cover selected notes behavior and no mutating API calls.
- Workspace V2 validation harness must use its ephemeral repo server public env and current registry expectations.
- Reports must include requirement-by-requirement PASS evidence and Git workflow fields.
- Produce repo-structured delta ZIP at `tmp/PR_26171_030-idea-board-workflow-fix_delta.zip`.

## Validation Commands
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line -g "Idea Board launches"`
- `npm run test:workspace-v2`

## ZIP Output
- `tmp/PR_26171_030-idea-board-workflow-fix_delta.zip`
