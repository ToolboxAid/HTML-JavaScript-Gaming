# PR_26171_044-idea-board-game-hub-project-flow Plan

## Purpose

Wire the Idea Board Create Project action into a creator-facing Game Hub project view while preserving table-first Idea Board behavior.

## Scope

- Create or link a Game Hub project when a Ready idea uses Create Project.
- Move created Project ideas into a read-only Idea Board state with Open in Game Hub and Archive actions.
- Keep Archived ideas hidden by default and restorable/deletable when visible.
- Productionize Game Hub project display with Project Information and read-only Source Idea fields.
- Add the smallest handoff/project-contract fix needed to complete the flow.

## Validation

- `node --check toolbox/idea-board/index.js`
- Changed-file syntax checks for Game Hub JavaScript.
- Targeted Idea Board Playwright.
- Targeted Game Hub Playwright if existing coverage exists.
- `npm run test:workspace-v2`
- Do not run full samples smoke.

## Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Delivery

- Commit, push, create PR, merge after validation passes, return to `main`, pull latest `main`, and produce `tmp/PR_26171_044-idea-board-game-hub-project-flow_delta.zip`.
