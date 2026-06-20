# PLAN PR_26171_030-idea-board-workflow-fix

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Purpose
Fix the incomplete Idea Board PR workflow by correcting the table-first implementation, selected-idea notes context, validation coverage, reports, ZIP output, and GitHub flow.

## Scope
- Re-read the original Idea Board request and existing Idea Board PR docs.
- Verify `toolbox/idea-board/index.html` is adapted from `toolbox/_tool_template-v2/index.html` with Theme V2 shell wiring preserved.
- Fix Idea Board notes so they render as selected-idea context instead of a disconnected second work surface.
- Keep Create Project placeholder-only and avoid project creation, persistence, auth, AI runtime, save/load, or database behavior.
- Update targeted Playwright coverage and required Codex reports.
- Produce `tmp/PR_26171_030-idea-board-workflow-fix_delta.zip`.

## Validation
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line -g "Idea Board launches"`
- `npm run test:workspace-v2`

## Git Workflow
- Start from refreshed `main`.
- Create branch `codex/fix-idea-board-pr-workflow`.
- Stage only scoped files.
- Commit, push, create PR, merge after validation, return to `main`, and pull latest `main`.
