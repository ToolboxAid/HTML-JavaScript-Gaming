# PR_26171_044-idea-board-game-hub-project-flow Build

## Source Of Truth

Use the user request for `PR_26171_044-idea-board-game-hub-project-flow`, `docs_build/dev/PROJECT_INSTRUCTIONS.md`, `docs_build/dev/PROJECT_MULTI_PC.txt`, and this BUILD doc.

## Singular Purpose

Complete the Idea Board to Game Hub creator project handoff.

## Exact Targets

- `toolbox/idea-board/index.js`
- `toolbox/game-workspace/game-workspace.js`
- Existing targeted Playwright specs for Idea Board and Game Hub/Game Workspace.
- Any smallest existing shared project or handoff contract file required by the flow.
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Requirements

- Create Project appears only for Ready ideas.
- Clicking Create Project creates or links a Game Hub project using an existing/shared project contract if available.
- Clicking Create Project sets Idea status to Project.
- Project ideas and their notes become read-only.
- Project row actions are Open in Game Hub and Archive.
- Project ideas cannot be edited or deleted.
- Project ideas cannot add, edit, or delete notes.
- Archived ideas remain hidden by default through existing filter behavior and show Restore and Delete when visible.
- Game Hub displays creator-facing project data only.
- Game Hub shows Project Information.
- Game Hub shows a read-only Source Idea section with Idea, Pitch, and Notes.
- Game Hub must not show internal IDs, DB/API/mock/debug/seed wording, or implementation details.
- Open in Game Hub from Idea Board navigates to the related Game Hub project view.
- If existing project handoff, route, or mock adapter wiring is missing, add the smallest fix needed.
- Do not expand into Game Journey unless required as a stub/reference for the handoff.

## Non-Goals

- Do not change unrelated Game Hub workflows.
- Do not introduce real database persistence.
- Do not add SQLite.
- Do not change full samples smoke behavior.

## Validation

- `node --check toolbox/idea-board/index.js`
- Changed-file syntax checks for Game Hub JavaScript.
- Targeted Idea Board Playwright.
- Targeted Game Hub Playwright if existing coverage exists.
- `npm run test:workspace-v2`
- `git diff --check`

## ZIP

Produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip` with repo-structured changed files only.
