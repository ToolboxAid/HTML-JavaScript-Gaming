# BUILD PR_26170_003 Toolbox Create Group

## Purpose

Update the Toolbox Game Journey grouping to include a Create group after Idea.

## Scope

- Update displayed Toolbox Game Journey groups to:
  - Idea
  - Create
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
- Move Project Workspace/Game Workspace, Game Journey, and Game Configuration/Game Setup into Create.
- Keep Idea limited to Idea Board / creator-notebook concepts.
- Assign every displayed group a unique rainbow color with no duplicate colors.
- Do not change routes, statuses, runtime behavior, database behavior, or tool metadata source contracts.
- Do not add inline CSS, inline JavaScript, `<style>`, `<script>` blocks, or inline event handlers.

## Validation

- Verify current branch is `main`.
- Run `node --check` for touched JavaScript files.
- Confirm Toolbox group order and unique colors.
- Confirm existing tool links still work.
- Confirm no prohibited inline HTML styling/scripting was introduced.
- Run targeted Toolbox Playwright validation.

## Reports

- `docs_build/dev/reports/PR_26170_003-toolbox-create-group.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- Repo-structured ZIP artifact in `tmp/`.
