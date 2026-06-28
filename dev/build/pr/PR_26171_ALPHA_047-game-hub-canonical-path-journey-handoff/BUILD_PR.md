# PR_26171_ALPHA_047-game-hub-canonical-path-journey-handoff BUILD

## Start Gate
- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md`.
- Read `docs_build/dev/PROJECT_MULTI_PC.txt`.
- Confirm current branch is clean latest `main` before branch creation.
- Confirm Team Alpha owns Game Hub, Game Journey, and Idea flow work.
- Confirm merge requires explicit Team Alpha owner approval.

## Exact Targets
- `toolbox/game-workspace/` -> `toolbox/game-hub/`
- `toolbox/game-hub/index.html`
- `toolbox/game-hub/game-hub.js`
- `toolbox/game-hub/game-hub-api-client.js`
- `toolbox/idea-board/index.js`
- `toolbox/game-journey/game-journey.js`
- Active navigation/registry references to `toolbox/game-workspace` or `game-workspace`
- Targeted Playwright tests for Game Hub, Idea Board handoff, and navigation routes
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Required Implementation
- Rename active path `toolbox/game-workspace/` to `toolbox/game-hub/`.
- Rename active files to `game-hub.js` and `game-hub-api-client.js`.
- Do not leave active navigation pointing to `toolbox/game-workspace`.
- Do not create a duplicate active Game Hub path.
- Update imports, route references, registry path/folder/entry point, tool display mode slug, page titles, creator-facing labels, and tests.
- Preserve the existing repository/API contract unless a small compatibility alias is required.
- Idea Board Create Project opens the canonical Game Hub route.
- Project source-linked actions avoid Delete and use Open in Game Hub and Archive.
- When an idea becomes Project, original Idea, Pitch, and Notes remain locked/read-only.
- Game Hub displays Source Idea, Pitch, and Notes read-only.
- Game Journey receives executable Journey items from Idea notes without mutating or moving original notes.

## Required Validation
- `node --check toolbox/game-hub/game-hub.js`
- `node --check toolbox/idea-board/index.js`
- Changed-file syntax checks for affected Game Journey JavaScript.
- Targeted Game Hub Playwright.
- Targeted Idea Board Playwright if handoff code changes.
- `npm run test:workspace-v2`
- Do not run full samples smoke.

## Required Delivery
- Update required reports.
- Produce repo-structured ZIP under `tmp/PR_26171_ALPHA_047-game-hub-canonical-path-journey-handoff_delta.zip`.
- Stage only scoped files.
- Commit.
- Push branch.
- Create PR.
- Stop before merge unless explicit Team Alpha owner approval is present.
