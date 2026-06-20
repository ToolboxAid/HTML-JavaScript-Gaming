# PR_26171_ALPHA_046-game-hub-table-standard-rebuild BUILD

## Start Gate
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
- Confirm current branch starts from clean latest `main`.
- Confirm Team Alpha owns Game Hub / Creator Journey.
- Confirm merge requires explicit Team Alpha owner approval.

## Exact Targets
- `toolbox/game-workspace/index.html`
- `toolbox/game-workspace/game-workspace.js`
- `assets/theme-v2/css/tables.css`
- `tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required Implementation
- Primary Game Hub surface is a Projects table.
- Parent table columns: `Project`, `Description`, `Status`, `Updated`, `Journey`, `Actions`.
- Project cell owns expansion.
- Chevron is inside the Project cell, left of Project name.
- Entire Project cell toggles expansion.
- Journey count is informational only.
- Default state is all collapsed when no explicit project handoff is opened.
- Only one Project row may be expanded at a time.
- Expanded child content renders directly under owning Project row.
- No detached selected project panel.
- No detached context/detail panel.
- No visible technical IDs.
- Source Idea child section is read-only and shows `Idea`, `Pitch`, `Notes`.
- Game Journey Items are generated from Source Idea notes and show item text, status/check state, and applicable actions.
- Game Hub can open/render an Idea Board-created project when existing handoff data exists.
- Empty states are creator-safe.
- Copy avoids DB/API/mock/debug/seed/internal terminology.
- Styling uses reusable Theme V2 table child classes.
- No page-local CSS, inline styles, style blocks, or inline event handlers.

## Required Validation
- `node --check toolbox/game-workspace/game-workspace.js`
- `node --check tests/playwright/tools/GameWorkspaceMockRepository.spec.mjs`
- Targeted Game Hub Playwright validation.
- `npm run test:workspace-v2`
- Do not run full samples smoke.

## Required Delivery
- Update required reports.
- Produce repo-structured ZIP under `tmp/PR_26171_ALPHA_046-game-hub-table-standard-rebuild_delta.zip`.
- Stage only scoped files.
- Commit.
- Push branch.
- Create PR.
- Stop before merge unless explicit Team Alpha owner approval is present.
