# BUILD PR_26171_033-idea-board-inline-accordion-cell

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Exact Targets
- assets/theme-v2/images/gfs-chevron-down.svg
- assets/theme-v2/images/gfs-chevron-up.svg
- docs_build/dev/codex_commands.md
- docs_build/dev/commit_comment.txt
- docs_build/dev/reports/codex_changed_files.txt
- docs_build/dev/reports/codex_review.diff
- docs_build/dev/reports/coverage_changed_js_guardrail.txt
- docs_build/dev/reports/playwright_v8_coverage_report.txt
- docs_build/pr/PLAN_PR_26171_033-idea-board-inline-accordion-cell.md
- docs_build/pr/BUILD_PR_26171_033-idea-board-inline-accordion-cell.md
- docs_build/pr/APPLY_PR_26171_033-idea-board-inline-accordion-cell.md
- tests/playwright/tools/IdeaBoardTableNotes.spec.mjs
- tests/playwright/tools/ToolboxRoutePages.spec.mjs
- toolbox/idea-board/index.js

## Requirements
- Remove the separate `>` expand button.
- Remove any separate expand/collapse control column.
- Remove notes-count click expansion.
- Put the chevron inside the Idea cell.
- Collapsed idea rows must show the idea name with `gfs-chevron-down.svg`.
- Expanded idea rows must show the idea name with `gfs-chevron-up.svg`.
- The entire Idea cell must toggle expansion.
- The Notes column must be informational only and must not toggle expansion.
- Expanded notes must render directly under the owning Idea row.
- Targeted Idea Board Playwright must verify:
  - Clicking the Idea cell expands and collapses notes.
  - Chevron switches down/up correctly.
  - Clicking Notes count does not expand or collapse.
- Produce repo-structured delta ZIP at `tmp/PR_26171_033-idea-board-inline-accordion-cell_delta.zip`.

## Validation Commands
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line -g "Idea Board launches"`

## ZIP Output
- `tmp/PR_26171_033-idea-board-inline-accordion-cell_delta.zip`
