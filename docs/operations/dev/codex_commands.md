# Codex Commands — BUILD_PR_LEVEL_20_9_TOOL_LAUNCH_SSOT_DATA_LAYER

## Model
GPT-5.4 or GPT-5.3-codex

## Reasoning
High

## Command

```text
Read docs/dev/codex_rules.md first.
Read docs/dev/specs/TOOL_LAUNCH_SSOT.md second.
Read docs/dev/reports/tool_launch_ssot_routing_validation.md if present.

Execute BUILD_PR_LEVEL_20_9_TOOL_LAUNCH_SSOT_DATA_LAYER.

Goal:
Create or normalize one runtime launch SSoT data layer for tool/workspace launch targets.

Required behavior:
- samples continue to use label: Open <tool>
- samples launch tools through SSoT target paths: tools/<tool>/index.html
- games continue to use label: Open with Workspace Manager
- games launch Workspace Manager through SSoT target path: tools/Workspace Manager/index.html
- external launches from samples/games still clear launch memory before loading
- no default/fallback route/tool/workspace behavior in touched launch flow
- invalid or missing SSoT target fails visibly

SSoT must define:
- launch id
- display name
- target path
- allowed launch sources
- allowed launch types

Hard constraints:
- smallest valid change
- no unrelated cleanup
- no repo-wide rewrite
- no start_of_day changes
- no roadmap text rewrite except status markers
- no anti-patterns listed in docs/dev/codex_rules.md
- no second source of truth
- do not alter required label meanings

Validation:
Create docs/dev/reports/tool_launch_ssot_data_layer_validation.md with:
- exact SSoT file path
- changed files
- list of launch ids
- proof sample actions still say Open <tool>
- proof game actions still say Open with Workspace Manager
- proof sample target paths come from SSoT
- proof game Workspace Manager target path comes from SSoT
- proof external launch memory clear remains intact
- proof missing target does not fallback
- anti-pattern self-check

Return ZIP at:
tmp/BUILD_PR_LEVEL_20_9_TOOL_LAUNCH_SSOT_DATA_LAYER.zip
```
