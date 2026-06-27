# PR_26171_021 Summary / Notes Table Governance

## Summary
- Added docs-only project instruction governance for Summary Table and Notes Table note-management behavior.
- Scope is documentation only.

## Governance Added
- Add Note controls belong below the table.
- Clicking Add Note opens an inline input row inside the table.
- Tables with notes must include Edit and Delete actions on the right.
- System-created notes cannot be deleted.
- System-created notes may only have status changed when the tool explicitly allows status editing.
- Selected Note Metadata must be shown as table columns, not as a separate detached panel.

## Scope Controls
- No runtime implementation.
- No UI changes.
- No database changes.
- No Playwright impact. This PR is docs/workflow only.

## Changed Files
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `docs_build/dev/reports/PR_26171_021-summary-notes-table-governance.md`
- `docs_build/dev/reports/PR_26171_021-summary-notes-table-governance-validation.md`
- `docs_build/dev/reports/PR_26171_021-summary-notes-table-governance-manual-validation.md`
