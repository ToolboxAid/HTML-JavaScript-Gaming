# PLAN_PR_11_324

## Purpose
Audit Workspace V2 tool compliance/completion status without making runtime/schema changes.

## Scope
- `docs/dev/reports/tool_completion_audit.md`
- `docs/dev/reports/PR_11_324_report.md`
- `docs/pr/PR_11_324_WORKSPACE_V2_TOOL_COMPLETION_AUDIT/PLAN_PR.md`
- `docs/pr/PR_11_324_WORKSPACE_V2_TOOL_COMPLETION_AUDIT/BUILD_PR.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Reuse existing Workspace V2 validation gate and targeted runtime tests as evidence.
2. Audit each Workspace V2-lane tool against:
   - valid JSON behavior
   - invalid JSON rejection
   - fallback/default usage
   - workspace payload integration/mutation behavior
   - sample and workspace launch paths
3. Write a per-tool PASS/FAIL report with exact failure reasons and 1-2 line required fixes.
