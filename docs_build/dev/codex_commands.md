# Codex Commands

## PR
- `PR_26171_033-idea-board-inline-accordion-cell`

## Source Documents
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/pr/PLAN_PR_26171_033-idea-board-inline-accordion-cell.md`
- `docs_build/pr/BUILD_PR_26171_033-idea-board-inline-accordion-cell.md`
- `docs_build/pr/APPLY_PR_26171_033-idea-board-inline-accordion-cell.md`

## Git Workflow Commands
- `git branch --show-current`
- `git status -sb`
- `git branch --list`
- `git pull --ff-only origin main`
- `git switch -c codex/pr-26171-033-idea-board-inline-accordion-cell`

## Inspection Commands
- `Get-Content -Raw docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `Get-Content -Raw toolbox/idea-board/index.html`
- `Get-Content -Raw toolbox/idea-board/index.js`
- `Get-Content -Raw tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `Get-Content -Raw tests/playwright/tools/ToolboxRoutePages.spec.mjs`

## Validation Commands
- `node --check toolbox/idea-board/index.js`
- `node --check tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
- `node --check tests/playwright/tools/ToolboxRoutePages.spec.mjs`
- `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs --project=playwright --workers=1 --reporter=line`
- `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs --project=playwright --workers=1 --reporter=line -g "Idea Board launches"`

## Artifact Commands
- Generate `docs_build/dev/reports/codex_changed_files.txt`
- Generate `docs_build/dev/reports/codex_review.diff`
- Create `tmp/PR_26171_033-idea-board-inline-accordion-cell_delta.zip`
- Verify ZIP size and repo-relative paths
