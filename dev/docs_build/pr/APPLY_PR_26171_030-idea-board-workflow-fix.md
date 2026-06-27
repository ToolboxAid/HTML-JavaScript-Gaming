# APPLY PR_26171_030-idea-board-workflow-fix

## Apply Summary
- Applied on branch `codex/fix-idea-board-pr-workflow`.
- Corrected Idea Board from a disconnected notes table into a selected-idea notes context area.
- Corrected workflow docs that previously reported stale branch and local-only PR fields.
- Validation, ZIP, commit, PR, merge, and final main fields are recorded in `docs_build/dev/reports/codex_changed_files.txt`.

## Requirement Evidence
- PASS: Tool Template V2 adaptation verified against `toolbox/_tool_template-v2/index.html`.
- PASS: Idea Board remains Theme V2 with header/footer partials, ToolDisplayMode host, left/center/right shell, accordions, external scripts, and no inline script/style/handlers.
- PASS: Center work surface is table-first with selected idea rows and no form-first primary workflow.
- PASS: Notes render as the selected idea subtable/context area.
- PASS: Add Note opens an inline input row inside the selected notes table.
- PASS: Creator notes expose Edit/Delete on the right.
- PASS: System notes are locked and do not expose Edit/Delete.
- PASS: Notes metadata appears in table columns.
- PASS: Create Project remains visible, disabled, and placeholder-only.
- PASS: Targeted Playwright coverage exercises selected notes add/edit/delete behavior and verifies no mutating API calls.
- PASS: Workspace V2 validation runs against the ephemeral test server instead of leaking `.env` API URLs, and current Message Studio registry expectations are reflected.

## Validation Evidence
- See `docs_build/dev/reports/codex_changed_files.txt`.
- See `docs_build/dev/reports/codex_review.diff`.
