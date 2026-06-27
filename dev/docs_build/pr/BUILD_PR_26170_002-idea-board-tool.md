# BUILD PR_26170_002 Idea Board Tool

## Purpose

Create a first-class `toolbox/idea-board/` wireframe tool for creator notebook work before a project exists.

## Scope

- Copy and adapt `toolbox/_tool_template-v2` into `toolbox/idea-board/`.
- Include wireframe sections for Cards, Board, List, Notes, Tags, Status, and Create Project placeholder.
- Register Idea Board so it appears from the Toolbox under the Idea display group.
- Keep Create Project as a visible placeholder action only.
- Do not create project records.
- Do not add database behavior, persistence, authentication behavior, AI runtime behavior, or save/load flows.
- Do not add inline CSS, inline JavaScript, `<style>`, `<script>` blocks, or inline event handlers.
- If `toolbox/workspace-manager-v2/` is not present in this checkout, document workspace-manager registration as skipped due to missing target rather than creating a new surface.

## Validation

- Verify current branch is `main`.
- Run `node --check` for touched JavaScript files.
- Confirm Idea Board launches from Toolbox.
- Confirm Create Project is placeholder only and does not create records.
- Confirm no prohibited inline HTML styling/scripting was introduced.
- Run targeted Idea Board/Toolbox Playwright validation.

## Reports

- `docs_build/dev/reports/PR_26170_002-idea-board-tool.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- Repo-structured ZIP artifact in `tmp/`.
