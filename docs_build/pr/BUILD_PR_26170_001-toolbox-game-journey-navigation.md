# BUILD PR_26170_001 Toolbox Game Journey Navigation

## Purpose

Update the Toolbox index grouping under "The Toolbox" / "Creator tools organized by build surface." to render the requested Game Journey group order with unique rainbow colors while preserving existing tool cards, routes, and statuses.

## Scope

- Update `/toolbox/index.html` and the immediate Toolbox index rendering dependencies only as needed.
- Replace the displayed Toolbox group organization with this Game Journey order:
  - Idea
  - Design
  - Graphics
  - Audio
  - Objects
  - Worlds
  - Interface
  - Controls
  - Rules
  - Progression
  - Play Test
  - Publish
  - Share
- Assign every displayed group a unique rainbow color with no duplicate colors.
- Preserve existing tool cards, routes, statuses, and links unless a card must move into the matching Game Journey group.
- Do not change database behavior, tool metadata source contracts, Workspace behavior, runtime behavior, tool status values, or routes.
- Do not add inline CSS, inline JS, `<style>`, `<script>`, or inline event handlers.

## Validation

- Confirm `/toolbox/index.html` renders the requested Game Journey group order.
- Confirm every group has a unique color and no duplicates.
- Confirm existing tool links still work.
- Confirm no prohibited inline HTML styling/scripting was introduced.
- Run targeted Toolbox page Playwright validation. If no narrower command exists, run `npm run test:workspace-v2`.

## Reports

- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26170_001-toolbox-game-journey-navigation.md`
- Repo-structured ZIP artifact in `tmp/`.
