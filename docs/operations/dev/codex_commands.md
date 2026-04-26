# Codex Commands — BUILD_PR_LEVEL_20_20_ROLLBACK_WORKSPACE_HEADER_AND_ADD_TOOL_PAGER

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.

Execute BUILD_PR_LEVEL_20_20_ROLLBACK_WORKSPACE_HEADER_AND_ADD_TOOL_PAGER.

User UAT failure:
- Current Workspace Manager page still has the unwanted header/banner/control area.
- Only the site image is showing below it.
- User wants this rolled back to the way Workspace Manager loaded before the failed header attempts.
- Then add only [PREV] <toolname> [NEXT] above the tools/editors section.

Rollback anchor:
Find the commit with commit comment:
Remove Workspace Manager default and query fallbacks

This is the state after BUILD_PR_LEVEL_20_13_REMOVE_WORKSPACE_MANAGER_DEFAULT_AND_QUERY_FALLBACKS and before the failed 20_14 through 20_19 header/banner attempts.

Required steps:
1. Inspect git history for Workspace Manager files.
2. Restore only Workspace Manager files affected by 20_14 through 20_19 to the rollback anchor state.
   Likely files:
   - tools/Workspace Manager/main.js
   - tools/Workspace Manager/index.html
   - any Workspace Manager CSS touched by those PRs
3. Do not rollback unrelated files.
4. After restore, add exactly one centered pager directly above the existing tools/editors section:
   [PREV] <toolname> [NEXT]
5. On page load, select the first available tool for the explicit gameId context.
6. Mount/activate that selected tool.
7. Prev/Next changes selected and mounted tool.
8. Do not use dropdown + Select Tool + Mount workflow.
9. Do not create or keep any new header/banner.

Still forbidden:
- restore gameId || game
- legacy game query fallback
- hidden fallback routing
- stale memory reuse
- changing samples
- broad Workspace Manager refactor
- start_of_day changes

Validation:
Create docs/dev/reports/workspace_manager_rollback_header_and_tool_pager_validation.md with:
- rollback anchor commit hash and comment
- changed files
- proof failed header/banner/control area removed
- proof normal Workspace Manager content loads below site chrome
- proof only [PREV] <toolname> [NEXT] was added
- proof pager appears above existing tools/editors section
- proof first available tool selected/mounted on load
- proof Prev/Next changes selected/mounted tool
- proof gameId || game fallback not restored
- proof samples remain untouched
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_20_ROLLBACK_WORKSPACE_HEADER_AND_ADD_TOOL_PAGER.zip
```
