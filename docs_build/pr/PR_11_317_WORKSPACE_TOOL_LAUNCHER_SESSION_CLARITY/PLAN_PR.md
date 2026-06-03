# PLAN_PR_11_317

## Purpose
Clarify Workspace V2 Asset Manager launch behavior so users can distinguish session-based launch from no-session state.

## Scope
- `tools/workspace-v2/index.html`
- `tools/workspace-v2/index.js`
- `docs_build/dev/reports/PR_11_317_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Update Asset Manager launcher button default text to indicate no-session state.
2. Drive launcher button enable/disable + label from the existing Workspace V2 computed UI state model.
3. Keep launch path routed through active session payload when present.
4. Run targeted validation for changed JS and targeted Workspace Asset Manager launch runtime test.
