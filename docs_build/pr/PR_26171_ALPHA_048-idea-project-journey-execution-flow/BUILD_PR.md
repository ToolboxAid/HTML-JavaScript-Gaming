# PR_26171_ALPHA_048-idea-project-journey-execution-flow BUILD

## Start Gate
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
- Confirm current branch is clean latest `main` before branch creation.
- Confirm Team Alpha owns Idea, Game Hub, and Game Journey work.
- Confirm `toolbox/game-hub/` exists on `main`.
- Confirm merge requires explicit Team Alpha owner approval.

## Exact Targets
- `toolbox/idea-board/index.js`
- `toolbox/game-hub/game-hub.js`
- `toolbox/game-journey/game-journey.js`
- `src/dev-runtime/persistence/tool-repositories/game-journey-mock-repository.js`
- Targeted Playwright tests for Idea Board, Game Hub, and Game Journey flow
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required Implementation
- Create Project appears only for Ready ideas.
- Clicking Create Project:
  - creates or links a Game Hub project,
  - sets Idea status to Project,
  - locks original Idea, Pitch, and Notes as read-only,
  - changes actions to Open in Game Hub and Archive,
  - creates editable Game Journey Items from Idea Notes.
- Do not mutate or move original Idea Notes.
- Game Hub displays read-only Source Idea:
  - Idea
  - Pitch
  - Notes
- Add Open Journey action from Game Hub where appropriate.
- Keep creator-facing production copy only.

## Required Validation
- `node --check` for changed JS files.
- Targeted Idea Board Playwright.
- Targeted Game Hub Playwright.
- Targeted Game Journey Playwright.
- `npm run test:workspace-v2`.
- Do not run full samples smoke.

## Required Delivery
- Update required reports.
- Produce repo-structured ZIP under `tmp/PR_26171_ALPHA_048-idea-project-journey-execution-flow_delta.zip`.
- Stage only scoped files.
- Commit.
- Push branch.
- Create PR.
- Stop before merge until explicit Team Alpha owner approval is present.
