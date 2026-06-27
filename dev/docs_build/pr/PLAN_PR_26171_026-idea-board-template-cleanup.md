# PLAN PR_26171_026-idea-board-template-cleanup

Source of truth: docs_build/dev/PROJECT_INSTRUCTIONS.md.

## Purpose
Sequential Idea Board workflow slice for PR_26171_026-idea-board-template-cleanup.

## Scope
- Target files: toolbox/idea-board/index.html, toolbox/idea-board/index.js, tests/playwright/tools/ToolboxRoutePages.spec.mjs, tests/playwright/tools/IdeaBoardTableNotes.spec.mjs as applicable.
- Keep one PR purpose and avoid engine core/start_of_day changes.

## Validation
- node --check targeted JS files.
- npx playwright test targeted Idea Board tests.
- npm run test:workspace-v2 for UI/runtime impact.

## Git workflow
- Source branch verified and refreshed from `main`.
- Execution branch: `codex/fix-idea-board-pr-workflow`.
- PR URL: recorded in `docs_build/dev/reports/codex_changed_files.txt` after creation.
