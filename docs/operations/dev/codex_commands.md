# Codex Commands — BUILD_PR_LEVEL_20_8_IMPLEMENT_TOOL_LAUNCH_SSOT_ROUTING

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md second.

Execute BUILD_PR_LEVEL_20_8_IMPLEMENT_TOOL_LAUNCH_SSOT_ROUTING.

Goal:
Implement the first runtime slice of TOOL_LAUNCH_SSOT.

Required behavior:
- samples launch tools through tools/<tool>/index.html
- games launch workspace flows through tools/Workspace Manager/index.html
- external launches from samples/games clear launch memory before loading
- launch data comes from the existing single source of truth
- no default/fallback route/tool/workspace behavior in touched launch flow
- invalid or missing launch context fails visibly

Hard constraints:
- smallest valid change
- no unrelated cleanup
- no repo-wide rewrite
- no start_of_day changes
- no roadmap text rewrite except status markers
- no anti-patterns listed in docs/dev/codex_rules.md

Validation:
Create docs/dev/reports/tool_launch_ssot_routing_validation.md with:
- changed files
- tested UAT paths
- proof samples route to tools/<tool>/index.html
- proof games route to tools/Workspace Manager/index.html
- proof external launch memory is cleared
- proof missing context does not fallback
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_8_IMPLEMENT_TOOL_LAUNCH_SSOT_ROUTING.zip
```
