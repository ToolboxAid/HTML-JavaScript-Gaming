# PLAN PR_26171_033-idea-board-inline-accordion-cell

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Purpose
Fix Idea Board accordion expansion so the Idea cell owns the chevron and toggle behavior.

## Scope
- Keep Idea Board as an in-page table/accordion model.
- Remove the separate notes chevron button and any separate expand/collapse control column.
- Move the chevron image into the Idea cell.
- Use `gfs-chevron-down.svg` for collapsed idea rows and `gfs-chevron-up.svg` for expanded idea rows.
- Toggle notes expansion from the whole Idea cell.
- Keep the Notes column informational only.
- Render expanded notes directly under the owning Idea row.
- Update targeted Playwright coverage, reports, and ZIP output.

## Validation
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line -g "Idea Board launches"`

## Git Workflow
- Start from refreshed `main`.
- Create branch `codex/pr-26171-033-idea-board-inline-accordion-cell`.
- Stage only scoped files.
- Commit, push, create PR, merge after validation, return to `main`, and pull latest `main`.
